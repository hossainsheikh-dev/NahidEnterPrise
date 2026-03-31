import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const API = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;

export function useChatSocket({ myId, myName, myRole, tokenKey }) {
  const socketRef   = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [allMessages, setAllMessages] = useState({});
  const [typingFrom,  setTypingFrom]  = useState({});
  const [unreadMap,   setUnreadMap]   = useState({});
  const typingTimers = useRef({});

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
      setUnreadMap(prev => ({ ...prev, [sid]: (prev[sid] || 0) + 1 }));
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
      setUnreadMap(prev => ({ ...prev, [bid]: 0 }));
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
  }, [myId, myRole, tokenKey]);

  const loadHistory = useCallback(async (otherId) => {
    try {
      const token = localStorage.getItem(tokenKey);
      const res = await fetch(`${API}/api/chat/${otherId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAllMessages(prev => ({ ...prev, [otherId.toString()]: data.data }));
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
    setUnreadMap(prev => ({ ...prev, [sid]: 0 }));
  }, []);

  const deleteMessage = useCallback(({ msgId, receiverId }) => {
    if (!socketRef.current) return;
    socketRef.current.emit("delete_message", { msgId, receiverId: receiverId?.toString() });
  }, []);

  const isOnline    = useCallback((id) => onlineUsers.includes((id || '').toString()), [onlineUsers]);
  const getMessages = useCallback((otherId) => allMessages[(otherId || '').toString()] || [], [allMessages]);
  const isTyping    = useCallback((id) => !!typingFrom[(id || '').toString()], [typingFrom]);
  const getUnread   = useCallback((id) => unreadMap[(id || '').toString()] || 0, [unreadMap]);
  const totalUnread = Object.values(unreadMap).reduce((a, b) => a + b, 0);

  return {
    isOnline, getMessages, isTyping, getUnread, totalUnread,
    loadHistory, sendMessage, sendTyping, markSeen, deleteMessage,
  };
}