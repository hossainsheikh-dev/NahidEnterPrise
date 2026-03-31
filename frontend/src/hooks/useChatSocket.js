import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const API = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;

// ─── localStorage helpers ─────────────────────────────────────────────────────
const UNREAD_KEY  = (myId) => `chat_unread_${myId}`;
const DFM_KEY     = (myId) => `chat_dfm_${myId}`;   // "delete for me"

const loadUnread = (myId) => {
  try { return JSON.parse(localStorage.getItem(UNREAD_KEY(myId)) || "{}"); }
  catch { return {}; }
};
const saveUnread = (myId, map) => {
  try { localStorage.setItem(UNREAD_KEY(myId), JSON.stringify(map)); } catch {}
};
const loadDfm = (myId) => {
  try { return new Set(JSON.parse(localStorage.getItem(DFM_KEY(myId)) || "[]")); }
  catch { return new Set(); }
};
const saveDfm = (myId, set) => {
  try { localStorage.setItem(DFM_KEY(myId), JSON.stringify([...set])); } catch {}
};
// ─────────────────────────────────────────────────────────────────────────────

export function useChatSocket({ myId, myName, myRole, tokenKey }) {
  const socketRef   = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [allMessages, setAllMessages] = useState({});
  const [typingFrom,  setTypingFrom]  = useState({});

  // Initialised from localStorage — survives page refresh
  const [unreadMap, setUnreadMap] = useState(() => loadUnread(myId));

  // "Delete for me" set — persisted locally
  const dfmRef = useRef(loadDfm(myId));

  const typingTimers = useRef({});

  useEffect(() => {
    if (myId) saveUnread(myId, unreadMap);
  }, [unreadMap, myId]);

  useEffect(() => {
    const token = localStorage.getItem(tokenKey);
    if (!token || !myId) return;

    const socket = io(API, {
      auth: { token },
      transports: ["websocket"]
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("online_users", (ids) => {
      setOnlineUsers(ids.map(id => id.toString()));
    });

    socket.on("receive_message", (msg) => {
      const sid = (msg.senderId || '').toString();
      setAllMessages(prev => ({
        ...prev,
        [sid]: [...(prev[sid] || []), msg],
      }));
      setUnreadMap(prev => {
        const next = { ...prev, [sid]: (prev[sid] || 0) + 1 };
        saveUnread(myId, next);
        return next;
      });
    });

    socket.on("message_sent", (msg) => {
      const rid = (msg.receiverId || '').toString();
      setAllMessages(prev => {
        const list = prev[rid] || [];
        const idx  = list.findIndex(m => m._tempId && m._tempId === msg._tempId);
        if (idx !== -1) {
          const n = [...list]; n[idx] = msg;
          return { ...prev, [rid]: n };
        }
        return { ...prev, [rid]: [...list, msg] };
      });
    });

    socket.on("user_typing", ({ senderId, isTyping }) => {
      const sid = (senderId || '').toString();
      setTypingFrom(prev => ({ ...prev, [sid]: isTyping }));
      if (isTyping) {
        clearTimeout(typingTimers.current[sid]);
        typingTimers.current[sid] = setTimeout(() =>
          setTypingFrom(prev => ({ ...prev, [sid]: false })), 3000);
      }
    });

    socket.on("messages_seen", ({ by }) => {
      const bid = (by || '').toString();
      setAllMessages(prev => {
        const updated = {};
        Object.entries(prev).forEach(([k, msgs]) => {
          updated[k] = msgs.map(m =>
            m.senderId?.toString() === myId?.toString() && k === bid
              ? { ...m, seen: true } : m
          );
        });
        return updated;
      });
      setUnreadMap(prev => {
        const next = { ...prev, [bid]: 0 };
        saveUnread(myId, next);
        return next;
      });
    });

    socket.on("message_deleted", ({ msgId }) => {
      setAllMessages(prev => {
        const updated = {};
        Object.entries(prev).forEach(([k, msgs]) => {
          updated[k] = msgs.map(m =>
            (m._id === msgId || m._tempId === msgId)
              ? { ...m, deleted: true, text: "" }
              : m
          );
        });
        return updated;
      });
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    return () => { socket.disconnect(); };
  }, [myId, myRole, tokenKey]); // eslint-disable-line

  const loadHistory = useCallback(async (otherId) => {
    try {
      const token = localStorage.getItem(tokenKey);
      const res = await fetch(`${API}/api/chat/${otherId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const dfm = dfmRef.current;
        setAllMessages(prev => ({
          ...prev,
          [otherId.toString()]: data.data.filter(m => !dfm.has(m._id?.toString())),
        }));
      }
    } catch (e) { console.log("loadHistory error:", e); }
  }, [tokenKey]);

  const sendMessage = useCallback(({ receiverId, receiverModel, text }) => {
    if (!socketRef.current || !text.trim() || !receiverId) return;
    const tempId = Date.now().toString();
    const rid = receiverId.toString();
    setAllMessages(prev => ({
      ...prev,
      [rid]: [...(prev[rid] || []), {
        _tempId: tempId,
        senderId: myId,
        senderName: myName,
        senderRole: myRole,
        receiverId: rid,
        receiverModel,
        text,
        seen: false,
        deleted: false,
        createdAt: new Date().toISOString(),
      }],
    }));
    socketRef.current.emit("send_message", {
      senderId: myId,
      senderName: myName,
      senderRole: myRole,
      receiverId: rid,
      receiverModel,
      text,
      _tempId: tempId,
    });
  }, [myId, myName, myRole]);

  const sendTyping = useCallback((receiverId, isTyping) => {
    if (!receiverId || !socketRef.current) return;
    socketRef.current.emit("typing", { receiverId: receiverId.toString(), isTyping });
  }, []);

  const markSeen = useCallback((senderId) => {
    const sid = (senderId || '').toString();
    if (!sid || !socketRef.current) return;
    socketRef.current.emit("mark_seen", { senderId: sid });
    setUnreadMap(prev => {
      const next = { ...prev, [sid]: 0 };
      saveUnread(myId, next);
      return next;
    });
  }, [myId]);

  // Unsend — server soft-delete, both sides see "unsent"
  const deleteMessage = useCallback(({ msgId, receiverId }) => {
    if (!socketRef.current) return;
    socketRef.current.emit("delete_message", { msgId, receiverId: receiverId?.toString() });
  }, []);

  // Delete for me only — local only, no server call, survives refresh
  const deleteForMe = useCallback((msgId) => {
    const id = msgId?.toString();
    if (!id) return;
    dfmRef.current.add(id);
    saveDfm(myId, dfmRef.current);
    setAllMessages(prev => {
      const updated = {};
      Object.entries(prev).forEach(([k, msgs]) => {
        updated[k] = msgs.filter(
          m => m._id?.toString() !== id && m._tempId?.toString() !== id
        );
      });
      return updated;
    });
  }, [myId]);

  const isOnline    = useCallback((id) => onlineUsers.includes((id || '').toString()), [onlineUsers]);
  const getMessages = useCallback((otherId) => {
    const dfm  = dfmRef.current;
    const msgs = allMessages[(otherId || '').toString()] || [];
    return msgs.filter(m => !dfm.has(m._id?.toString()));
  }, [allMessages]);
  const isTyping    = useCallback((id) => !!typingFrom[(id || '').toString()], [typingFrom]);
  const getUnread   = useCallback((id) => unreadMap[(id || '').toString()] || 0, [unreadMap]);
  const totalUnread = Object.values(unreadMap).reduce((a, b) => a + b, 0);

  return {
    isOnline, getMessages, isTyping, getUnread, totalUnread,
    loadHistory, sendMessage, sendTyping, markSeen, deleteMessage, deleteForMe,
  };
}