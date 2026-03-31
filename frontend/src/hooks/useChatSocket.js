import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const API = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;

// ─── "Delete for me" — শুধু এটাই localStorage এ রাখা হবে ───────────────────
// Unread count এখন server এর `seen` field থেকে বের করা হবে,
// তাই localStorage clear হলেও unread count হারাবে না।
const DFM_KEY = (myId) => `chat_dfm_${myId}`;

const loadDfm = (myId) => {
  try { return new Set(JSON.parse(localStorage.getItem(DFM_KEY(myId)) || "[]")); }
  catch { return new Set(); }
};
const saveDfm = (myId, set) => {
  try { localStorage.setItem(DFM_KEY(myId), JSON.stringify([...set])); } catch {}
};
// ─────────────────────────────────────────────────────────────────────────────

export function useChatSocket({ myId, myName, myRole, tokenKey }) {
  const socketRef  = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [allMessages, setAllMessages] = useState({});
  const [typingFrom,  setTypingFrom]  = useState({});

  // ── Unread map: server `seen` field থেকে compute করা হবে ─────────────────
  // key = peerId (string), value = unread count (number)
  // এটা in-memory। page refresh হলে loadHistory() call হবে এবং
  // server থেকে আসা messages এর seen field দিয়ে আবার count হবে।
  const [unreadMap, setUnreadMap] = useState({});

  // "Delete for me" set — শুধু এটাই localStorage এ থাকবে
  const dfmRef = useRef(loadDfm(myId));

  const typingTimers = useRef({});

  // ── Helper: একটা peer এর message list থেকে unread count বের কর ──────────
  // unread = আমাকে পাঠানো হয়েছে (senderId !== myId) AND seen === false
  const computeUnread = useCallback((msgs, myIdStr) => {
    return msgs.filter(
      m => m.senderId?.toString() !== myIdStr && !m.seen && !m.deleted
    ).length;
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(tokenKey);
    if (!token || !myId) return;

    const socket = io(API, {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("online_users", (ids) => {
      setOnlineUsers(ids.map(id => id.toString()));
    });

    socket.on("receive_message", (msg) => {
      const sid = (msg.senderId || "").toString();
      setAllMessages(prev => {
        const updated = { ...prev, [sid]: [...(prev[sid] || []), msg] };
        // unread count আবার compute কর
        const myIdStr = myId?.toString();
        setUnreadMap(u => ({
          ...u,
          [sid]: computeUnread(updated[sid], myIdStr),
        }));
        return updated;
      });
    });

    socket.on("message_sent", (msg) => {
      const rid = (msg.receiverId || "").toString();
      setAllMessages(prev => {
        const list = prev[rid] || [];
        const idx  = list.findIndex(m => m._tempId && m._tempId === msg._tempId);
        let updated;
        if (idx !== -1) {
          const n = [...list]; n[idx] = msg;
          updated = { ...prev, [rid]: n };
        } else {
          updated = { ...prev, [rid]: [...list, msg] };
        }
        return updated;
      });
      // নিজের পাঠানো মেসেজে unread বাড়বে না, তাই recompute দরকার নেই
    });

    socket.on("user_typing", ({ senderId, isTyping }) => {
      const sid = (senderId || "").toString();
      setTypingFrom(prev => ({ ...prev, [sid]: isTyping }));
      if (isTyping) {
        clearTimeout(typingTimers.current[sid]);
        typingTimers.current[sid] = setTimeout(() =>
          setTypingFrom(prev => ({ ...prev, [sid]: false })), 3000);
      }
    });

    socket.on("messages_seen", ({ by }) => {
      const bid = (by || "").toString();
      setAllMessages(prev => {
        const updated = {};
        Object.entries(prev).forEach(([k, msgs]) => {
          updated[k] = msgs.map(m =>
            m.senderId?.toString() === myId?.toString() && k === bid
              ? { ...m, seen: true } : m
          );
        });
        // আমার মেসেজ seen হয়েছে মানে unread আমার দিক থেকে নেই এখানে,
        // bid এর unread 0 করার দরকার নেই কারণ bid আমাকে seen করেছে
        return updated;
      });
      // bid এর কাছে আমার পাঠানো মেসেজ seen — unread map এ bid এর count নেই এখানে
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
          // deleted হলে unread recompute
          const myIdStr = myId?.toString();
          setUnreadMap(u => ({
            ...u,
            [k]: computeUnread(updated[k], myIdStr),
          }));
        });
        return updated;
      });
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    return () => { socket.disconnect(); };
  }, [myId, myRole, tokenKey, computeUnread]); // eslint-disable-line

  // ── History load: server থেকে আসা messages এর seen field দিয়ে count ──────
  const loadHistory = useCallback(async (otherId) => {
    try {
      const token = localStorage.getItem(tokenKey);
      const res   = await fetch(`${API}/api/chat/${otherId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const dfm     = dfmRef.current;
        const myIdStr = myId?.toString();
        const filtered = data.data.filter(m => !dfm.has(m._id?.toString()));

        setAllMessages(prev => ({
          ...prev,
          [otherId.toString()]: filtered,
        }));

        // ── FIX: server এর seen field থেকে unread count বের কর ────────────
        const unreadCount = computeUnread(filtered, myIdStr);
        setUnreadMap(prev => ({
          ...prev,
          [otherId.toString()]: unreadCount,
        }));
      }
    } catch (e) { console.log("loadHistory error:", e); }
  }, [tokenKey, myId, computeUnread]);

  const sendMessage = useCallback(({ receiverId, receiverModel, text }) => {
    if (!socketRef.current || !text.trim() || !receiverId) return;
    const tempId = Date.now().toString();
    const rid    = receiverId.toString();
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

  // ── markSeen: server এ পাঠাও এবং local unread 0 কর ─────────────────────
  const markSeen = useCallback((senderId) => {
    const sid = (senderId || "").toString();
    if (!sid || !socketRef.current) return;
    socketRef.current.emit("mark_seen", { senderId: sid });

    // local messages এও seen: true কর যাতে recompute এ 0 আসে
    setAllMessages(prev => {
      if (!prev[sid]) return prev;
      const updated = {
        ...prev,
        [sid]: prev[sid].map(m =>
          m.senderId?.toString() !== myId?.toString() ? { ...m, seen: true } : m
        ),
      };
      setUnreadMap(u => ({ ...u, [sid]: 0 }));
      return updated;
    });
  }, [myId]);

  // Unsend — server soft-delete, both sides see "unsent"
  const deleteMessage = useCallback(({ msgId, receiverId }) => {
    if (!socketRef.current) return;
    socketRef.current.emit("delete_message", { msgId, receiverId: receiverId?.toString() });
  }, []);

  // Delete for me only — local only, persists via localStorage
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
        // recompute unread after deletion
        const myIdStr = myId?.toString();
        setUnreadMap(u => ({
          ...u,
          [k]: computeUnread(updated[k], myIdStr),
        }));
      });
      return updated;
    });
  }, [myId, computeUnread]);

  const isOnline = useCallback((id) =>
    onlineUsers.includes((id || "").toString()), [onlineUsers]);

  const getMessages = useCallback((otherId) => {
    const dfm  = dfmRef.current;
    const msgs = allMessages[(otherId || "").toString()] || [];
    return msgs.filter(m => !dfm.has(m._id?.toString()));
  }, [allMessages]);

  const isTyping  = useCallback((id) => !!typingFrom[(id || "").toString()], [typingFrom]);
  const getUnread = useCallback((id) => unreadMap[(id || "").toString()] || 0, [unreadMap]);
  const totalUnread = Object.values(unreadMap).reduce((a, b) => a + b, 0);

  return {
    isOnline, getMessages, isTyping, getUnread, totalUnread,
    loadHistory, sendMessage, sendTyping, markSeen, deleteMessage, deleteForMe,
  };
}