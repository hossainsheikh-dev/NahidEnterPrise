import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const API = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;

// ─── LocalStorage helpers ─────────────────────────────────────────────────────
const UNREAD_KEY = (myId) => `chat_unread_${myId}`;
const DELETED_KEY = (myId) => `chat_deleted_${myId}`; // "delete for me" local list

const loadUnread = (myId) => {
  try {
    const raw = localStorage.getItem(UNREAD_KEY(myId));
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const saveUnread = (myId, map) => {
  try { localStorage.setItem(UNREAD_KEY(myId), JSON.stringify(map)); } catch {}
};

const loadDeletedForMe = (myId) => {
  try {
    const raw = localStorage.getItem(DELETED_KEY(myId));
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
};

const saveDeletedForMe = (myId, set) => {
  try { localStorage.setItem(DELETED_KEY(myId), JSON.stringify([...set])); } catch {}
};
// ─────────────────────────────────────────────────────────────────────────────

export function useChatSocket({ myId, myName, myRole, tokenKey }) {
  const socketRef   = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [allMessages, setAllMessages] = useState({});
  const [typingFrom,  setTypingFrom]  = useState({});

  // Initialise unread from localStorage so badge survives refresh
  const [unreadMap, setUnreadMap] = useState(() => loadUnread(myId));

  // Set of msgIds deleted "for me only" (local, not sent to server)
  const deletedForMe = useRef(loadDeletedForMe(myId));

  const typingTimers = useRef({});

  // Persist unread whenever it changes
  useEffect(() => {
    if (myId) saveUnread(myId, unreadMap);
  }, [unreadMap, myId]);

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
      setOnlineUsers(ids.map((id) => id.toString()));
    });

    socket.on("receive_message", (msg) => {
      const sid = (msg.senderId || "").toString();
      setAllMessages((prev) => ({
        ...prev,
        [sid]: [...(prev[sid] || []), msg],
      }));
      // Increment persistent unread
      setUnreadMap((prev) => {
        const next = { ...prev, [sid]: (prev[sid] || 0) + 1 };
        saveUnread(myId, next);
        return next;
      });
    });

    socket.on("message_sent", (msg) => {
      const rid = (msg.receiverId || "").toString();
      setAllMessages((prev) => {
        const list = prev[rid] || [];
        const idx  = list.findIndex((m) => m._tempId && m._tempId === msg._tempId);
        if (idx !== -1) {
          const n = [...list];
          n[idx] = msg;
          return { ...prev, [rid]: n };
        }
        return { ...prev, [rid]: [...list, msg] };
      });
    });

    socket.on("user_typing", ({ senderId, isTyping }) => {
      const sid = (senderId || "").toString();
      setTypingFrom((prev) => ({ ...prev, [sid]: isTyping }));
      if (isTyping) {
        clearTimeout(typingTimers.current[sid]);
        typingTimers.current[sid] = setTimeout(
          () => setTypingFrom((prev) => ({ ...prev, [sid]: false })),
          3000
        );
      }
    });

    socket.on("messages_seen", ({ by }) => {
      const bid = (by || "").toString();
      setAllMessages((prev) => {
        const updated = {};
        Object.entries(prev).forEach(([k, msgs]) => {
          updated[k] = msgs.map((m) =>
            m.senderId?.toString() === myId?.toString() && k === bid
              ? { ...m, seen: true }
              : m
          );
        });
        return updated;
      });
      // Reset unread for this peer
      setUnreadMap((prev) => {
        const next = { ...prev, [bid]: 0 };
        saveUnread(myId, next);
        return next;
      });
    });

    // Unsend: server soft-deletes, broadcast to both parties
    socket.on("message_deleted", ({ msgId }) => {
      setAllMessages((prev) => {
        const updated = {};
        Object.entries(prev).forEach(([k, msgs]) => {
          updated[k] = msgs.map((m) =>
            m._id === msgId || m._tempId === msgId
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

    return () => {
      socket.disconnect();
    };
  }, [myId, myRole, tokenKey]); // eslint-disable-line

  // ── Load history ────────────────────────────────────────────────────────────
  const loadHistory = useCallback(
    async (otherId) => {
      try {
        const token = localStorage.getItem(tokenKey);
        const res   = await fetch(`${API}/api/chat/${otherId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          const msgs = data.data;
          const dfm  = deletedForMe.current;
          // Filter out locally-deleted messages
          setAllMessages((prev) => ({
            ...prev,
            [otherId.toString()]: msgs.filter((m) => !dfm.has(m._id?.toString())),
          }));
        }
      } catch (e) {
        console.log("loadHistory error:", e);
      }
    },
    [tokenKey]
  );

  // ── Send message ────────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    ({ receiverId, receiverModel, text }) => {
      if (!socketRef.current || !text.trim() || !receiverId) return;
      const tempId = Date.now().toString();
      const rid    = receiverId.toString();
      setAllMessages((prev) => ({
        ...prev,
        [rid]: [
          ...(prev[rid] || []),
          {
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
          },
        ],
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
    },
    [myId, myName, myRole]
  );

  // ── Typing ──────────────────────────────────────────────────────────────────
  const sendTyping = useCallback((receiverId, isTyping) => {
    if (!receiverId || !socketRef.current) return;
    socketRef.current.emit("typing", { receiverId: receiverId.toString(), isTyping });
  }, []);

  // ── Mark seen ───────────────────────────────────────────────────────────────
  const markSeen = useCallback(
    (senderId) => {
      const sid = (senderId || "").toString();
      if (!sid || !socketRef.current) return;
      socketRef.current.emit("mark_seen", { senderId: sid });
      setUnreadMap((prev) => {
        const next = { ...prev, [sid]: 0 };
        saveUnread(myId, next);
        return next;
      });
    },
    [myId]
  );

  // ── Unsend message (server soft-delete, both sides see "unsent") ─────────────
  const deleteMessage = useCallback(({ msgId, receiverId }) => {
    if (!socketRef.current) return;
    socketRef.current.emit("delete_message", {
      msgId,
      receiverId: receiverId?.toString(),
    });
  }, []);

  // ── Delete for me only (local, no server call) ───────────────────────────────
  const deleteForMe = useCallback(
    (msgId) => {
      const id = msgId?.toString();
      if (!id) return;
      deletedForMe.current.add(id);
      saveDeletedForMe(myId, deletedForMe.current);
      // Remove from UI immediately
      setAllMessages((prev) => {
        const updated = {};
        Object.entries(prev).forEach(([k, msgs]) => {
          updated[k] = msgs.filter(
            (m) => m._id?.toString() !== id && m._tempId?.toString() !== id
          );
        });
        return updated;
      });
    },
    [myId]
  );

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const isOnline    = useCallback((id) => onlineUsers.includes((id || "").toString()), [onlineUsers]);
  const getMessages = useCallback(
    (otherId) => {
      const dfm  = deletedForMe.current;
      const msgs = allMessages[(otherId || "").toString()] || [];
      return msgs.filter((m) => !dfm.has(m._id?.toString()));
    },
    [allMessages]
  );
  const isTyping    = useCallback((id) => !!typingFrom[(id || "").toString()], [typingFrom]);
  const getUnread   = useCallback((id) => unreadMap[(id || "").toString()] || 0, [unreadMap]);
  const totalUnread = Object.values(unreadMap).reduce((a, b) => a + b, 0);

  return {
    isOnline, getMessages, isTyping, getUnread, totalUnread,
    loadHistory, sendMessage, sendTyping, markSeen, deleteMessage, deleteForMe,
  };
}