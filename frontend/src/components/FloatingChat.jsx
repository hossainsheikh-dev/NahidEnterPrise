import { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, X, Send, Check, CheckCheck,
  ChevronDown, ChevronLeft, Loader2, Search,
  Bell, BellOff, ArrowDown,
} from "lucide-react";
import { useChatSocket } from "../hooks/useChatSocket";

const API = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;

// ── Helpers ───────────────────────────────────────────────────────────────────
const getDateLabel = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-BD", { weekday: "short", month: "short", day: "numeric" });
};

const groupable = (a, b) => {
  if (!a || !b) return false;
  if (a.senderId?.toString() !== b.senderId?.toString()) return false;
  return new Date(b.createdAt) - new Date(a.createdAt) < 120_000;
};

const msgRadius = (isMine, isFirst, isLast) => {
  if (isMine) {
    if (isFirst && isLast) return "18px 18px 4px 18px";
    if (isFirst)           return "18px 18px 4px 18px";
    if (isLast)            return "4px 18px 4px 18px";
    return "4px 18px 4px 4px";
  } else {
    if (isFirst && isLast) return "18px 18px 18px 4px";
    if (isFirst)           return "18px 18px 4px 4px";
    if (isLast)            return "4px 18px 18px 4px";
    return "4px 18px 4px 4px";
  }
};

export default function FloatingChat({ me, other }) {
  const [open, setOpen]               = useState(false);
  const [screen, setScreen]           = useState("list");
  const [activeOther, setActiveOther] = useState(null);
  const [text, setText]               = useState("");
  const [histLoaded, setHistLoaded]   = useState({});
  const [subAdmins, setSubAdmins]     = useState([]);
  const [loadingSA, setLoadingSA]     = useState(false);
  const [peerIds, setPeerIds]         = useState([]);

  // ── New feature states ────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery]   = useState("");
  const [isMuted, setIsMuted]           = useState(false);
  const [notifToast, setNotifToast]     = useState(null);  // { id, name, text }
  const [isAtBottom, setIsAtBottom]     = useState(true);
  const [newMsgBelow, setNewMsgBelow]   = useState(0);
  const [copiedId, setCopiedId]         = useState(null);
  const [firstUnreadIdx, setFirstUnreadIdx] = useState(null);

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [fabPos, setFabPos] = useState({ bottom: 24, right: 24 });
  const isDragging   = useRef(false);
  const hasDragged   = useRef(false);
  const dragOrigin   = useRef({ x: 0, y: 0, bottom: 24, right: 24 });
  const [vpHeight, setVpHeight] = useState(
    () => window.visualViewport?.height ?? window.innerHeight
  );

  const originPath    = useRef(null);
  const bottomRef     = useRef(null);
  const inputRef      = useRef(null);
  const typingDelay   = useRef(null);
  const chatScrollRef = useRef(null);
  const prevUnreadRef = useRef({});
  const notifTimerRef = useRef(null);
  const prevMsgsLen   = useRef(0);

  const {
    isOnline, getMessages, isTyping, getUnread,
    loadHistory, sendMessage, sendTyping, markSeen,
  } = useChatSocket({
    myId: me.id, myName: me.name, myRole: "subadmin", tokenKey: "subAdminToken",
  });

  // ── Responsive ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const h = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // ── Visual viewport (keyboard) ─────────────────────────────────────────────
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const u = () => setVpHeight(vv.height);
    vv.addEventListener("resize", u);
    vv.addEventListener("scroll", u);
    return () => { vv.removeEventListener("resize", u); vv.removeEventListener("scroll", u); };
  }, []);

  // ── Drag (mobile/tablet only) ──────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging.current || isDesktop) return;
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = cx - dragOrigin.current.x;
      const dy = cy - dragOrigin.current.y;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasDragged.current = true;
      setFabPos({
        right:  Math.max(8, Math.min(window.innerWidth  - 60, dragOrigin.current.right  - dx)),
        bottom: Math.max(8, Math.min(window.innerHeight - 60, dragOrigin.current.bottom - dy)),
      });
    };
    const onEnd = () => { isDragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onEnd);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend",  onEnd);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend",  onEnd);
    };
  }, [isDesktop]);

  const startDrag = useCallback((cx, cy) => {
    if (isDesktop) return;
    isDragging.current = true;
    hasDragged.current = false;
    dragOrigin.current = { x: cx, y: cy, ...fabPos };
  }, [fabPos, isDesktop]);

  // ── Load contacts ──────────────────────────────────────────────────────────
  const loadSubAdmins = useCallback(async () => {
    setLoadingSA(true);
    try {
      const token = localStorage.getItem("subAdminToken");
      const res   = await fetch(`${API}/api/subadmin/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSubAdmins(
        Array.isArray(data)
          ? data.filter(s => s.status === "approved" && s._id !== me.id)
          : []
      );
    } catch (e) { console.log(e); }
    finally { setLoadingSA(false); }
  }, [me.id]);

  useEffect(() => { loadSubAdmins(); }, [loadSubAdmins]);
  useEffect(() => { if (open) loadSubAdmins(); }, [open, loadSubAdmins]);

  // ── Peer IDs ───────────────────────────────────────────────────────────────
  useEffect(() => {
    setPeerIds([
      ...(other ? [other.id] : []),
      ...subAdmins.map(s => s._id),
    ]);
  }, [other, subAdmins]);

  const unreadUsersCount = peerIds.filter(id => getUnread(id) > 0).length;

  // ── Contact list (raw + sorted by last message) ────────────────────────────
  const rawContacts = [
    ...(other ? [{ ...other, _id: other.id, isAdmin: true }] : []),
    ...subAdmins.map(s => ({ ...s, id: s._id, model: "SubAdmin", isAdmin: false })),
  ];

  const contactList = [...rawContacts].sort((a, b) => {
    const aId  = (a.id || a._id)?.toString();
    const bId  = (b.id || b._id)?.toString();
    const aMsg = getMessages(aId).slice(-1)[0];
    const bMsg = getMessages(bId).slice(-1)[0];
    if (!aMsg && !bMsg) return 0;
    if (!aMsg) return 1;
    if (!bMsg) return -1;
    return new Date(bMsg.createdAt) - new Date(aMsg.createdAt);
  });

  const filteredContacts = searchQuery.trim()
    ? contactList.filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase().trim()))
    : contactList;

  // ── New message detection & toast notification ─────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const unreadSnapshot = peerIds.map(id => getUnread(id)).join(",");

  useEffect(() => {
    peerIds.forEach(pid => {
      const pidStr = pid?.toString();
      const curr   = getUnread(pid);

      if (pidStr in prevUnreadRef.current) {
        const prev         = prevUnreadRef.current[pidStr];
        const isActiveChat = open && screen === "chat" && activeOther?.id?.toString() === pidStr;

        if (curr > prev) {
          if (isActiveChat && !isAtBottom) {
            setNewMsgBelow(c => c + (curr - prev));
          } else if (!isActiveChat && !isMuted) {
            const allMsgs = getMessages(pid);
            const lastMsg = allMsgs[allMsgs.length - 1];
            if (lastMsg && lastMsg.senderId?.toString() !== me.id?.toString()) {
              const person = rawContacts.find(c => (c.id || c._id)?.toString() === pidStr);
              clearTimeout(notifTimerRef.current);
              setNotifToast({ id: pidStr, name: person?.name || "Someone", text: lastMsg.text });
              notifTimerRef.current = setTimeout(() => setNotifToast(null), 4500);
            }
          }
        }
      }
      prevUnreadRef.current[pidStr] = curr;
    });
  }, [unreadSnapshot]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── First unread index (for "Unread Messages" divider) ────────────────────
  useEffect(() => {
    if (!activeOther || !histLoaded[activeOther.id]) return;
    const messages = getMessages(activeOther.id);
    const unread   = getUnread(activeOther.id);
    setFirstUnreadIdx(unread > 0 ? Math.max(0, messages.length - unread) : null);
  }, [activeOther?.id, histLoaded[activeOther?.id]]); // eslint-disable-line

  // ── Scroll tracking ────────────────────────────────────────────────────────
  const handleScroll = useCallback(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setIsAtBottom(atBottom);
    if (atBottom) setNewMsgBelow(0);
  }, []);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setNewMsgBelow(0);
    setIsAtBottom(true);
  }, []);

  // ── History load ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeOther && !histLoaded[activeOther.id]) {
      loadHistory(activeOther.id).then(() =>
        setHistLoaded(prev => ({ ...prev, [activeOther.id]: true }))
      );
    }
  }, [activeOther, histLoaded, loadHistory]);

  const msgs = activeOther ? getMessages(activeOther.id) : [];

  // Smart auto-scroll: scroll only when at bottom, always scroll for own messages
  useEffect(() => {
    if (screen !== "chat") return;
    const newLen  = msgs.length;
    if (newLen > prevMsgsLen.current) {
      const lastMsg = msgs[newLen - 1];
      const isMyMsg = lastMsg?.senderId?.toString() === me.id?.toString();
      if (isAtBottom || isMyMsg) {
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      }
    }
    prevMsgsLen.current = newLen;
  }, [msgs.length, screen]); // eslint-disable-line

  // Scroll to bottom when opening a conversation
  useEffect(() => {
    if (screen === "chat" && activeOther) {
      setIsAtBottom(true);
      setNewMsgBelow(0);
      setFirstUnreadIdx(null);
      prevMsgsLen.current = 0;
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "instant" }), 120);
    }
  }, [activeOther?.id]); // eslint-disable-line

  useEffect(() => {
    if (open && screen === "chat" && activeOther) markSeen(activeOther.id);
  }, [open, screen, activeOther, msgs.length, markSeen]);

  // ── Close / back-navigation ────────────────────────────────────────────────
  const closeChat = useCallback(() => {
    setOpen(false);
    setScreen("list");
    setActiveOther(null);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (!originPath.current) originPath.current = window.location.href;
    window.history.pushState({ fc: "list" }, "");
    return () => { originPath.current = null; };
  }, [open]);

  useEffect(() => {
    if (open && screen === "chat") window.history.pushState({ fc: "chat" }, "");
  }, [open, screen]);

  useEffect(() => {
    const onPop = (e) => {
      const state = e.state;
      if (state?.fc === "chat") {
        setScreen("list");
        window.history.pushState({ fc: "list" }, "");
        return;
      }
      if (state?.fc === "list") {
        closeChat();
        if (originPath.current) window.history.replaceState(null, "", originPath.current);
        return;
      }
      closeChat();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [closeChat]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const openChat = (person) => {
    setActiveOther(person);
    setScreen("chat");
    setSearchQuery("");
  };

  const handleInput = (e) => {
    setText(e.target.value);
    sendTyping(activeOther.id, true);
    clearTimeout(typingDelay.current);
    typingDelay.current = setTimeout(() => sendTyping(activeOther.id, false), 1500);
  };

  const handleSend = useCallback(() => {
    if (!text.trim() || !activeOther) return;
    sendMessage({ receiverId: activeOther.id, receiverModel: activeOther.model, text });
    setText("");
    sendTyping(activeOther.id, false);
    inputRef.current?.focus();
  }, [text, activeOther, sendMessage, sendTyping]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const copyMessage = useCallback((msgText, id) => {
    navigator.clipboard?.writeText(msgText).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  const fmtTime = (d) =>
    new Date(d).toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" });

  // ── Build rendered message list (with separators & grouping) ───────────────
  const renderedMsgs = [];
  let lastDateStr    = null;

  msgs.forEach((msg, i) => {
    const dateStr = new Date(msg.createdAt).toDateString();
    if (dateStr !== lastDateStr) {
      renderedMsgs.push({ type: "date", label: getDateLabel(msg.createdAt), key: `d-${i}` });
      lastDateStr = dateStr;
    }
    if (firstUnreadIdx !== null && i === firstUnreadIdx) {
      renderedMsgs.push({ type: "unread", key: "unread-divider" });
    }
    const prev = msgs[i - 1];
    const next = msgs[i + 1];
    renderedMsgs.push({
      type: "msg",
      msg,
      isFirst: !groupable(prev, msg),
      isLast:  !groupable(msg, next),
      key: msg._id || msg._tempId || `m-${i}`,
    });
  });

  // ── Panel & FAB styles ─────────────────────────────────────────────────────
  const panelStyle = isDesktop
    ? { position: "fixed", bottom: 88, right: 24, width: 360, height: 560, borderRadius: 20, zIndex: 1000 }
    : { position: "fixed", left: 0, right: 0, bottom: 0, top: window.innerHeight - vpHeight, width: "100%", height: vpHeight, borderRadius: 0, zIndex: 1000 };

  const fabBase = {
    position: "fixed", bottom: 24, right: 24, zIndex: 1001,
    width: 52, height: 52, borderRadius: 16, border: "none",
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 6px 24px rgba(99,102,241,0.45)",
  };

  const Badge = ({ count }) => count > 0 ? (
    <motion.span
      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      style={{ position: "absolute", top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 99, background: "#f43f5e", color: "#fff", fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", paddingInline: 4, border: "2px solid white" }}>
      {count > 9 ? "9+" : count}
    </motion.span>
  ) : null;

  return ReactDOM.createPortal(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        .fc-sa * { box-sizing:border-box; font-family:'DM Sans',sans-serif; }
        .fc-sa-scroll::-webkit-scrollbar { width:3px; }
        .fc-sa-scroll::-webkit-scrollbar-thumb { background:rgba(99,102,241,0.15); border-radius:99px; }
        .fc-sa-inp { outline:none; resize:none; }
        .fc-sa-inp::placeholder { color:#94a3b8; }
        .fc-sa-search { outline:none; border:none; background:transparent; width:100%; font-family:'DM Sans',sans-serif; font-size:13px; color:#1e293b; }
        .fc-sa-search::placeholder { color:#c4cdd8; }
        @keyframes fc-sa-dots { 0%,80%,100%{opacity:0;transform:scale(0.6);} 40%{opacity:1;transform:scale(1);} }
        .fc-sa-dot { display:inline-block;width:6px;height:6px;border-radius:50%;background:#94a3b8;animation:fc-sa-dots 1.2s infinite; }
        .fc-sa-dot:nth-child(2){animation-delay:.2s;} .fc-sa-dot:nth-child(3){animation-delay:.4s;}
        .fc-sa-fab { touch-action:none; user-select:none; -webkit-user-select:none; }
        @keyframes fc-sa-online-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.5);} 70%{box-shadow:0 0 0 5px rgba(34,197,94,0);} }
        .fc-sa-online { animation: fc-sa-online-pulse 2s infinite; }
        @keyframes fc-sa-toast-in { from{opacity:0;transform:translateY(8px) scale(0.96);} to{opacity:1;transform:translateY(0) scale(1);} }
        .fc-sa-msg-bubble { transition: box-shadow 0.15s; }
        .fc-sa-msg-bubble:hover { box-shadow: 0 4px 16px rgba(99,102,241,0.18) !important; }
      `}</style>

      <div className="fc-sa">

        {/* ── Notification Toast ────────────────────────────────────────────── */}
        <AnimatePresence>
          {notifToast && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.94 }}
              animate={{ opacity: 1, y: 0,  scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.94 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              style={{
                position: "fixed",
                bottom: isDesktop ? 90 : (fabPos.bottom + 66),
                right: isDesktop ? 90 : 16,
                width: 268,
                background: "#ffffff",
                borderRadius: 15,
                padding: "10px 12px 10px 10px",
                boxShadow: "0 8px 36px rgba(99,102,241,0.2), 0 2px 10px rgba(0,0,0,0.08)",
                border: "1px solid rgba(99,102,241,0.14)",
                cursor: "pointer",
                zIndex: 1002,
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontFamily: "'DM Sans', sans-serif",
              }}
              onClick={() => {
                const person = rawContacts.find(c => (c.id || c._id)?.toString() === notifToast.id);
                if (person) {
                  setOpen(true);
                  openChat({ id: notifToast.id, name: notifToast.name, model: person.model || (person.isAdmin ? "User" : "SubAdmin") });
                }
                setNotifToast(null);
              }}>
              {/* Accent stripe */}
              <div style={{ width: 3, alignSelf: "stretch", borderRadius: 99, background: "linear-gradient(180deg,#6366f1,#4f46e5)", flexShrink: 0 }} />
              {/* Avatar */}
              <div style={{ width: 34, height: 34, borderRadius: 11, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#6366f1", flexShrink: 0 }}>
                {notifToast.name?.[0]?.toUpperCase()}
              </div>
              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 1 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "#1e293b" }}>{notifToast.name}</span>
                  <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600 }}>now</span>
                </div>
                <p style={{ fontSize: 11, color: "#64748b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {notifToast.text}
                </p>
              </div>
              {/* Dismiss */}
              <button
                onClick={e => { e.stopPropagation(); setNotifToast(null); }}
                style={{ background: "none", border: "none", padding: 3, cursor: "pointer", color: "#cbd5e1", display: "flex", flexShrink: 0 }}>
                <X size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Chat Panel ────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: isDesktop ? 16 : 40, scale: isDesktop ? 0.95 : 1 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: isDesktop ? 16 : 40, scale: isDesktop ? 0.95 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              style={{ ...panelStyle, overflow: "hidden", display: "flex", flexDirection: "column", background: "linear-gradient(160deg,#ffffff,#fafbff)", border: isDesktop ? "1px solid rgba(99,102,241,0.12)" : "none", boxShadow: "0 24px 64px rgba(99,102,241,0.14),0 4px 16px rgba(0,0,0,0.06)" }}>

              <div style={{ height: 2, background: "linear-gradient(90deg,transparent,#6366f1,#8b5cf6,transparent)", flexShrink: 0 }} />

              {/* ── Header ──────────────────────────────────────────────────── */}
              <div style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)", padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                {screen === "chat" && (
                  <button
                    onClick={() => setScreen("list")}
                    style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", flexShrink: 0 }}>
                    <ChevronLeft size={15} />
                  </button>
                )}

                {screen === "list" ? (
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: "#fff", margin: 0 }}>Messages</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", margin: 0 }}>{contactList.length} Contacts</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff" }}>
                        {activeOther?.name?.[0]?.toUpperCase()}
                      </div>
                      <span
                        className={isOnline(activeOther?.id) ? "fc-sa-online" : ""}
                        style={{ position: "absolute", bottom: -1, right: -1, width: 10, height: 10, borderRadius: "50%", background: isOnline(activeOther?.id) ? "#22c55e" : "rgba(255,255,255,0.3)", border: "2px solid white" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.2 }}>{activeOther?.name}</p>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", margin: 0 }}>
                        {isTyping(activeOther?.id) ? "typing…" : isOnline(activeOther?.id) ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Mute toggle */}
                <button
                  onClick={() => setIsMuted(m => !m)}
                  title={isMuted ? "Unmute notifications" : "Mute notifications"}
                  style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", opacity: isMuted ? 0.6 : 1 }}>
                  {isMuted ? <BellOff size={13} /> : <Bell size={13} />}
                </button>

                <button
                  onClick={closeChat}
                  style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
                  <ChevronDown size={15} />
                </button>
              </div>

              {/* ── Content ─────────────────────────────────────────────────── */}
              <AnimatePresence mode="wait">

                {/* LIST SCREEN */}
                {screen === "list" && (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f8f9ff" }}>

                    {/* Search */}
                    <div style={{ padding: "10px 12px 8px", flexShrink: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#ffffff", border: "1.5px solid rgba(99,102,241,0.14)", borderRadius: 12, padding: "7px 12px", transition: "border-color .15s" }}
                        onFocusCapture={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)"}
                        onBlurCapture={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.14)"}>
                        <Search size={13} style={{ color: "#c4cdd8", flexShrink: 0 }} />
                        <input
                          className="fc-sa-search"
                          placeholder="Search contacts…"
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                          <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", color: "#c4cdd8" }}>
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Contact rows */}
                    <div className="fc-sa-scroll" style={{ flex: 1, overflowY: "auto" }}>
                      {loadingSA ? (
                        <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
                          <Loader2 size={20} className="animate-spin" style={{ color: "#6366f1" }} />
                        </div>
                      ) : filteredContacts.length === 0 ? (
                        <p style={{ textAlign: "center", fontSize: 13, color: "#94a3b8", padding: 32 }}>
                          {searchQuery ? "No results found" : "No contacts yet"}
                        </p>
                      ) : filteredContacts.map((person) => {
                        const pid    = person.id || person._id;
                        const unread = getUnread(pid);
                        const online = isOnline(pid);
                        const lastMsg = getMessages(pid).slice(-1)[0];

                        return (
                          <motion.button
                            key={pid}
                            whileHover={{ backgroundColor: "rgba(99,102,241,0.05)" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => openChat({ id: pid, name: person.name, model: person.model || (person.isAdmin ? "User" : "SubAdmin") })}
                            style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: unread > 0 ? "rgba(99,102,241,0.03)" : "transparent", border: "none", borderLeft: unread > 0 ? "2px solid rgba(99,102,241,0.4)" : "2px solid transparent", cursor: "pointer", textAlign: "left", transition: "background 0.15s" }}>
                            <div style={{ position: "relative", flexShrink: 0 }}>
                              <div style={{
                                width: 42, height: 42, borderRadius: 14,
                                background: person.isAdmin ? "rgba(99,102,241,0.1)" : "rgba(139,92,246,0.1)",
                                border: `1.5px solid ${person.isAdmin ? "rgba(99,102,241,0.22)" : "rgba(139,92,246,0.22)"}`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 15, fontWeight: 800,
                                color: person.isAdmin ? "#6366f1" : "#8b5cf6",
                              }}>
                                {person.name?.[0]?.toUpperCase()}
                              </div>
                              <span
                                className={online ? "fc-sa-online" : ""}
                                style={{ position: "absolute", bottom: -1, right: -1, width: 11, height: 11, borderRadius: "50%", background: online ? "#22c55e" : "#cbd5e1", border: "2px solid #f8f9ff" }} />
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 13, fontWeight: unread > 0 ? 700 : 600, color: "#1e293b" }}>{person.name}</span>
                                {lastMsg && (
                                  <span style={{ fontSize: 10, color: unread > 0 ? "#6366f1" : "#94a3b8", fontWeight: unread > 0 ? 600 : 400 }}>
                                    {fmtTime(lastMsg.createdAt)}
                                  </span>
                                )}
                              </div>
                              <p style={{ fontSize: 11.5, color: unread > 0 ? "#475569" : "#94a3b8", fontWeight: unread > 0 ? 600 : 400, margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {lastMsg ? lastMsg.text : (person.isAdmin ? "Admin" : person.email || "SubAdmin")}
                              </p>
                            </div>

                            {unread > 0 && (
                              <motion.span
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                style={{ minWidth: 20, height: 20, borderRadius: 99, background: "#6366f1", color: "#fff", fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", paddingInline: 5, flexShrink: 0 }}>
                                {unread > 9 ? "9+" : unread}
                              </motion.span>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* CHAT SCREEN */}
                {screen === "chat" && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>

                    {/* Messages */}
                    <div
                      ref={chatScrollRef}
                      onScroll={handleScroll}
                      className="fc-sa-scroll"
                      style={{ flex: 1, overflowY: "auto", padding: "12px 12px 4px", display: "flex", flexDirection: "column", gap: 0, background: "#f8f9ff" }}>

                      {!histLoaded[activeOther?.id] ? (
                        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Loader2 size={20} className="animate-spin" style={{ color: "#6366f1" }} />
                        </div>
                      ) : msgs.length === 0 ? (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                          <div style={{ width: 56, height: 56, borderRadius: 18, background: "rgba(99,102,241,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <MessageCircle size={24} style={{ color: "#6366f1", opacity: 0.4 }} />
                          </div>
                          <p style={{ fontSize: 12.5, color: "#94a3b8", fontWeight: 500, margin: 0 }}>No messages yet</p>
                          <p style={{ fontSize: 11, color: "#c4cdd8", margin: 0 }}>Say hi to {activeOther?.name}! 👋</p>
                        </div>
                      ) : renderedMsgs.map(item => {

                        /* Date separator */
                        if (item.type === "date") return (
                          <div key={item.key} style={{ display: "flex", alignItems: "center", gap: 8, margin: "12px 0 6px" }}>
                            <div style={{ flex: 1, height: 1, background: "rgba(99,102,241,0.08)" }} />
                            <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                              {item.label}
                            </span>
                            <div style={{ flex: 1, height: 1, background: "rgba(99,102,241,0.08)" }} />
                          </div>
                        );

                        /* Unread divider */
                        if (item.type === "unread") return (
                          <div key="unread-divider" style={{ display: "flex", alignItems: "center", gap: 8, margin: "10px 0 6px" }}>
                            <div style={{ flex: 1, height: 1, background: "rgba(99,102,241,0.2)" }} />
                            <span style={{ fontSize: 10, color: "#6366f1", fontWeight: 700, letterSpacing: "0.03em" }}>
                              ↓ Unread Messages
                            </span>
                            <div style={{ flex: 1, height: 1, background: "rgba(99,102,241,0.2)" }} />
                          </div>
                        );

                        /* Message bubble */
                        const { msg, isFirst, isLast } = item;
                        const isMine = msg.senderId?.toString() === me.id?.toString();
                        const msgId  = msg._id || msg._tempId;

                        return (
                          <motion.div
                            key={item.key}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.15 }}
                            style={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start", marginBottom: isLast ? 4 : 1 }}>
                            <div
                              className="fc-sa-msg-bubble"
                              onDoubleClick={() => copyMessage(msg.text, msgId)}
                              title="Double-click to copy"
                              style={{ position: "relative", maxWidth: "78%", padding: "8px 12px", borderRadius: msgRadius(isMine, isFirst, isLast), background: isMine ? "linear-gradient(135deg,#6366f1,#4f46e5)" : "#ffffff", color: isMine ? "#fff" : "#1e293b", fontSize: 13.5, lineHeight: 1.45, fontWeight: 500, boxShadow: isMine ? "0 2px 8px rgba(99,102,241,0.25)" : "0 1px 4px rgba(0,0,0,0.06)", border: !isMine ? "1px solid rgba(99,102,241,0.08)" : "none", wordBreak: "break-word", cursor: "default", userSelect: "text" }}>
                              {msg.text}

                              {/* Copy feedback */}
                              <AnimatePresence>
                                {copiedId === msgId && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 6, scale: 0.88 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 6, scale: 0.88 }}
                                    style={{ position: "absolute", top: -30, left: "50%", transform: "translateX(-50%)", background: "#1e293b", color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 8, whiteSpace: "nowrap", pointerEvents: "none", zIndex: 10 }}>
                                    ✓ Copied!
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            {/* Timestamp + seen */}
                            {isLast && (
                              <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 3, marginLeft: 4, marginRight: 4 }}>
                                <span style={{ fontSize: 10, color: "#94a3b8" }}>{fmtTime(msg.createdAt)}</span>
                                {isMine && (msg.seen
                                  ? <CheckCheck size={11} style={{ color: "#6366f1" }} />
                                  : <Check size={11} style={{ color: "#c4cdd8" }} />)}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}

                      {/* Typing indicator */}
                      {isTyping(activeOther?.id) && (
                        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 4 }}>
                          <div style={{ padding: "10px 14px", borderRadius: "18px 18px 18px 4px", background: "#fff", border: "1px solid rgba(99,102,241,0.08)", display: "inline-flex", gap: 4, alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                            <span className="fc-sa-dot" /><span className="fc-sa-dot" /><span className="fc-sa-dot" />
                          </div>
                        </motion.div>
                      )}
                      <div ref={bottomRef} />
                    </div>

                    {/* Scroll-to-bottom button */}
                    <AnimatePresence>
                      {!isAtBottom && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.75 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.75 }}
                          onClick={scrollToBottom}
                          style={{ position: "absolute", bottom: 68, right: 12, width: 34, height: 34, borderRadius: "50%", background: "#ffffff", border: "1px solid rgba(99,102,241,0.15)", boxShadow: "0 4px 18px rgba(99,102,241,0.18)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6366f1", zIndex: 5 }}>
                          {newMsgBelow > 0 ? (
                            <div style={{ position: "relative" }}>
                              <ArrowDown size={15} />
                              <span style={{ position: "absolute", top: -10, right: -10, minWidth: 16, height: 16, borderRadius: 99, background: "#6366f1", color: "#fff", fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", paddingInline: 3 }}>
                                {newMsgBelow > 9 ? "9+" : newMsgBelow}
                              </span>
                            </div>
                          ) : <ArrowDown size={15} />}
                        </motion.button>
                      )}
                    </AnimatePresence>

                    {/* Input bar */}
                    <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(99,102,241,0.08)", display: "flex", gap: 8, alignItems: "flex-end", background: "#ffffff", flexShrink: 0 }}>
                      <textarea
                        ref={inputRef}
                        className="fc-sa-inp"
                        rows={1}
                        value={text}
                        onChange={handleInput}
                        onKeyDown={handleKey}
                        placeholder="Type a message…"
                        style={{ flex: 1, background: "#f8f9ff", border: "1.5px solid rgba(99,102,241,0.14)", borderRadius: 14, padding: "9px 12px", fontSize: 13, color: "#1e293b", maxHeight: 80, overflowY: "auto", fontFamily: "'DM Sans',sans-serif", lineHeight: 1.4, transition: "border-color .15s" }}
                        onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.4)"}
                        onBlur={e => e.target.style.borderColor = "rgba(99,102,241,0.14)"}
                      />
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.93 }}
                        onClick={handleSend}
                        disabled={!text.trim()}
                        style={{ width: 38, height: 38, borderRadius: 12, border: "none", background: text.trim() ? "linear-gradient(135deg,#6366f1,#4f46e5)" : "rgba(99,102,241,0.08)", color: text.trim() ? "#fff" : "#c4cdd8", display: "flex", alignItems: "center", justifyContent: "center", cursor: text.trim() ? "pointer" : "not-allowed", flexShrink: 0, transition: "all .15s", boxShadow: text.trim() ? "0 3px 10px rgba(99,102,241,0.35)" : "none" }}>
                        <Send size={15} />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── FAB ───────────────────────────────────────────────────────────── */}
        {isDesktop ? (
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => setOpen(o => !o)}
            style={{ ...fabBase, cursor: "pointer" }}>
            <AnimatePresence mode="wait">
              {open
                ? <motion.span key="x" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}><X size={22} /></motion.span>
                : <motion.span key="m" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}><MessageCircle size={22} /></motion.span>
              }
            </AnimatePresence>
            <AnimatePresence>
              {!open && <Badge count={unreadUsersCount} />}
            </AnimatePresence>
          </motion.button>
        ) : (
          <AnimatePresence>
            {!open && (
              <motion.button
                key="fab"
                className="fc-sa-fab"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
                onMouseDown={(e) => { e.preventDefault(); startDrag(e.clientX, e.clientY); }}
                onTouchStart={(e) => { startDrag(e.touches[0].clientX, e.touches[0].clientY); }}
                onClick={() => { if (!hasDragged.current) setOpen(true); }}
                style={{ ...fabBase, bottom: fabPos.bottom, right: fabPos.right, cursor: "grab" }}>
                <MessageCircle size={22} />
                <AnimatePresence><Badge count={unreadUsersCount} /></AnimatePresence>
              </motion.button>
            )}
          </AnimatePresence>
        )}
      </div>
    </>,
    document.body
  );
}