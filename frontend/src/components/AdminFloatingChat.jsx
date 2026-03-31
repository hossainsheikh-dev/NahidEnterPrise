import { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, X, Send, Check, CheckCheck,
  ChevronLeft, Loader2, Search, Bell, BellOff, ArrowDown,
} from "lucide-react";
import { useChatSocket } from "../hooks/useChatSocket";

const API = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;

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

export default function AdminFloatingChat({ me }) {
  const [open, setOpen]               = useState(false);
  const [screen, setScreen]           = useState("list");
  const [activeOther, setActive]      = useState(null);
  const [subAdmins, setSubAdmins]     = useState([]);
  const [loadingSA, setLoadingSA]     = useState(false);
  const [text, setText]               = useState("");
  const [histLoaded, setHistLoaded]   = useState({});
  const [peerIds, setPeerIds]         = useState([]);

  const [searchQuery, setSearchQuery]       = useState("");
  const [isMuted, setIsMuted]               = useState(false);
  const [notifToast, setNotifToast]         = useState(null);
  const [isAtBottom, setIsAtBottom]         = useState(true);
  const [newMsgBelow, setNewMsgBelow]       = useState(0);
  const [copiedId, setCopiedId]             = useState(null);
  const [firstUnreadIdx, setFirstUnreadIdx] = useState(null);
  const [msgMenu, setMsgMenu]               = useState(null); // { msgId, isMine, text }

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [fabPos, setFabPos]       = useState({ bottom: 24, right: 24 });
  const isDragging  = useRef(false);
  const hasDragged  = useRef(false);
  const dragOrigin  = useRef({ x: 0, y: 0, bottom: 24, right: 24 });
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
    loadHistory, sendMessage, sendTyping, markSeen, deleteMessage,
    deleteForMe, // ← NEW
  } = useChatSocket({ myId: me.id, myName: me.name, myRole: "admin", tokenKey: "token" });

  useEffect(() => {
    const h = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const u = () => setVpHeight(vv.height);
    vv.addEventListener("resize", u);
    vv.addEventListener("scroll", u);
    return () => { vv.removeEventListener("resize", u); vv.removeEventListener("scroll", u); };
  }, []);

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

  const loadSubAdmins = useCallback(async () => {
    setLoadingSA(true);
    try {
      const res  = await fetch(`${API}/api/subadmin`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setSubAdmins(Array.isArray(data) ? data.filter(s => s.status === "approved") : []);
    } catch (e) { console.log(e); }
    finally { setLoadingSA(false); }
  }, []);

  useEffect(() => { loadSubAdmins(); }, [loadSubAdmins]);
  useEffect(() => { if (open) loadSubAdmins(); }, [open, loadSubAdmins]);

  useEffect(() => {
    setPeerIds(subAdmins.map(s => s._id));
  }, [subAdmins]);

  // ── CHANGE 1: total count for badge ─────────────────────────────────────────
  const unreadUsersCount = peerIds.filter(id => getUnread(id) > 0).length;
  const totalUnreadCount = peerIds.reduce((sum, id) => sum + getUnread(id), 0);

  const contactList = [...subAdmins].sort((a, b) => {
    const aMsg = getMessages(a._id).slice(-1)[0];
    const bMsg = getMessages(b._id).slice(-1)[0];
    if (!aMsg && !bMsg) return 0;
    if (!aMsg) return 1;
    if (!bMsg) return -1;
    return new Date(bMsg.createdAt) - new Date(aMsg.createdAt);
  });

  const filteredContacts = searchQuery.trim()
    ? contactList.filter(sa => sa.name?.toLowerCase().includes(searchQuery.toLowerCase().trim()))
    : contactList;

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
              const person = subAdmins.find(s => s._id?.toString() === pidStr);
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

  useEffect(() => {
    if (!activeOther || !histLoaded[activeOther.id]) return;
    const messages = getMessages(activeOther.id);
    const unread   = getUnread(activeOther.id);
    setFirstUnreadIdx(unread > 0 ? Math.max(0, messages.length - unread) : null);
  }, [activeOther?.id, histLoaded[activeOther?.id]]); // eslint-disable-line

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

  useEffect(() => {
    if (activeOther && !histLoaded[activeOther.id]) {
      loadHistory(activeOther.id).then(() =>
        setHistLoaded(prev => ({ ...prev, [activeOther.id]: true }))
      );
    }
  }, [activeOther, histLoaded, loadHistory]);

  const msgs = activeOther ? getMessages(activeOther.id) : [];

  useEffect(() => {
    if (screen !== "chat") return;
    const newLen  = msgs.length;
    if (newLen > prevMsgsLen.current) {
      const lastMsg = msgs[newLen - 1];
      const isMyMsg = lastMsg?.senderId === me.id || lastMsg?.senderRole === "admin";
      if (isAtBottom || isMyMsg) {
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      }
    }
    prevMsgsLen.current = newLen;
  }, [msgs.length, screen]); // eslint-disable-line

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

  const closeChat = useCallback(() => {
    setOpen(false);
    setScreen("list");
    setActive(null);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (!originPath.current) originPath.current = window.location.href;
    window.history.pushState({ afc: "list" }, "");
    return () => { originPath.current = null; };
  }, [open]);

  useEffect(() => {
    if (open && screen === "chat") window.history.pushState({ afc: "chat" }, "");
  }, [open, screen]);

  useEffect(() => {
    const onPop = (e) => {
      const state = e.state;
      if (state?.afc === "chat") {
        setScreen("list");
        window.history.pushState({ afc: "list" }, "");
        return;
      }
      if (state?.afc === "list") {
        closeChat();
        if (originPath.current) window.history.replaceState(null, "", originPath.current);
        return;
      }
      closeChat();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [closeChat]);

  const openChat = (sa) => {
    setActive({ id: sa._id, name: sa.name, model: "SubAdmin" });
    setScreen("chat");
    setSearchQuery("");
    setMsgMenu(null);
  };

  const handleInput = (e) => {
    setText(e.target.value);
    sendTyping(activeOther.id, true);
    clearTimeout(typingDelay.current);
    typingDelay.current = setTimeout(() => sendTyping(activeOther.id, false), 1500);
  };

  const handleSend = useCallback(() => {
    if (!text.trim() || !activeOther) return;
    sendMessage({ receiverId: activeOther.id, receiverModel: "SubAdmin", text });
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

  // ── Message long-press / right-click menu ──────────────────────────────────
  const handleMsgPress = useCallback((e, msg, isMine) => {
    e.preventDefault();
    const msgId = msg._id || msg._tempId;
    if (!msgId || msg.deleted) return;
    setMsgMenu({ msgId, isMine, text: msg.text });
  }, []);

  const handleDeleteMsg = useCallback(() => {
    if (!msgMenu || !activeOther) return;
    deleteMessage({ msgId: msgMenu.msgId, receiverId: activeOther.id });
    setMsgMenu(null);
  }, [msgMenu, deleteMessage, activeOther]);

  // ── CHANGE 2: Delete for me handler ─────────────────────────────────────────
  const handleDeleteForMe = useCallback(() => {
    if (!msgMenu) return;
    deleteForMe(msgMenu.msgId);
    setMsgMenu(null);
  }, [msgMenu, deleteForMe]);

  const fmtTime = (d) =>
    new Date(d).toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" });

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

  const panelStyle = isDesktop
    ? { position: "fixed", bottom: 88, right: 24, width: 340, height: 540, borderRadius: 16, zIndex: 2147483646 }
    : { position: "fixed", left: 0, right: 0, bottom: 0, top: window.innerHeight - vpHeight, width: "100%", height: vpHeight, borderRadius: 0, zIndex: 2147483646 };

  const fabBase = {
    position: "fixed", bottom: 24, right: 24, zIndex: 2147483647,
    width: 52, height: 52, borderRadius: 16, border: "none",
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 6px 24px rgba(99,102,241,0.45)",
  };

  // ── CHANGE 3: Badge uses totalUnreadCount ────────────────────────────────────
  const Badge = ({ count }) => count > 0 ? (
    <motion.span
      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      style={{
        position: "absolute", top: -4, right: -4, minWidth: 18, height: 18,
        borderRadius: 99, background: "#f43f5e", color: "#fff",
        fontSize: 10, fontWeight: 900,
        display: "flex", alignItems: "center", justifyContent: "center",
        paddingInline: 4, border: "2px solid #0f172a",
        animation: "afc-badge-pulse 1.5s ease-in-out infinite",
      }}>
      {count > 99 ? "99+" : count}
    </motion.span>
  ) : null;

  return ReactDOM.createPortal(
    <>
      <style>{`
        .afc-fab { touch-action:none; user-select:none; -webkit-user-select:none; }
        .afc-scroll::-webkit-scrollbar { width:3px; }
        .afc-scroll::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:99px; }
        .afc-search { outline:none; border:none; background:transparent; width:100%; font-size:13px; color:#e2e8f0; font-family:inherit; }
        .afc-search::placeholder { color:#475569; }
        @keyframes afc-online-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.5);} 70%{box-shadow:0 0 0 5px rgba(34,197,94,0);} }
        .afc-online { animation: afc-online-pulse 2s infinite; }
        @keyframes afc-dots { 0%,80%,100%{opacity:0;transform:scale(0.6);} 40%{opacity:1;transform:scale(1);} }
        .afc-dot { display:inline-block;width:6px;height:6px;border-radius:50%;background:#475569;animation:afc-dots 1.2s infinite; }
        .afc-dot:nth-child(2){animation-delay:.2s;} .afc-dot:nth-child(3){animation-delay:.4s;}
        .afc-bubble { transition: filter 0.15s; }
        .afc-bubble:hover { filter: brightness(1.08); }
        @keyframes afc-badge-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(244,63,94,0.5); }
          50%       { box-shadow: 0 0 0 5px rgba(244,63,94,0); }
        }
      `}</style>

      {/* ── Notification Toast ─────────────────────────────────────────────── */}
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
              background: "#1e293b",
              borderRadius: 15,
              padding: "10px 12px 10px 10px",
              boxShadow: "0 8px 36px rgba(0,0,0,0.45), 0 2px 10px rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.1)",
              cursor: "pointer",
              zIndex: 2147483647,
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "inherit",
            }}
            onClick={() => {
              const sa = subAdmins.find(s => s._id?.toString() === notifToast.id);
              if (sa) { setOpen(true); openChat(sa); }
              setNotifToast(null);
            }}>
            <div style={{ width: 3, alignSelf: "stretch", borderRadius: 99, background: "linear-gradient(180deg,#6366f1,#4f46e5)", flexShrink: 0 }} />
            <div style={{ width: 34, height: 34, borderRadius: 11, background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#818cf8", flexShrink: 0 }}>
              {notifToast.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "#e2e8f0" }}>{notifToast.name}</span>
                <span style={{ fontSize: 9, color: "#475569", fontWeight: 600 }}>now</span>
              </div>
              <p style={{ fontSize: 11, color: "#64748b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {notifToast.text}
              </p>
            </div>
            <button
              onClick={e => { e.stopPropagation(); setNotifToast(null); }}
              style={{ background: "none", border: "none", padding: 3, cursor: "pointer", color: "#334155", display: "flex", flexShrink: 0 }}>
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chat Panel ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: isDesktop ? 16 : 40, scale: isDesktop ? 0.95 : 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isDesktop ? 16 : 40, scale: isDesktop ? 0.95 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            style={{ ...panelStyle, overflow: "hidden", display: "flex", flexDirection: "column", background: "#0f172a", border: isDesktop ? "1px solid rgba(255,255,255,0.08)" : "none", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>

            {/* ── Header ────────────────────────────────────────────────────── */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-3 flex items-center gap-2.5 flex-shrink-0 border-b border-white/10">
              {screen === "chat" && (
                <button
                  onClick={() => setScreen("list")}
                  className="bg-white/10 border-0 rounded-lg w-7 h-7 flex items-center justify-center cursor-pointer text-slate-400 hover:text-slate-300 flex-shrink-0">
                  <ChevronLeft size={15} />
                </button>
              )}
              <div className="flex-1 min-w-0">
                {screen === "list" ? (
                  <>
                    <p className="text-[13.5px] font-bold text-slate-100 m-0">Messages</p>
                    <p className="text-[11px] text-slate-500 m-0">{subAdmins.length} SubAdmins</p>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-[30px] h-[30px] rounded-lg bg-indigo-500/20 flex items-center justify-center text-xs font-extrabold text-indigo-400">
                        {activeOther?.name?.[0]?.toUpperCase()}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${isOnline(activeOther?.id) ? "bg-green-500 afc-online" : "bg-slate-600"}`} />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-100 m-0">{activeOther?.name}</p>
                      <p className={`text-[10px] m-0 ${isTyping(activeOther?.id) ? "text-indigo-400" : isOnline(activeOther?.id) ? "text-green-500" : "text-slate-600"}`}>
                        {isTyping(activeOther?.id) ? "typing…" : isOnline(activeOther?.id) ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsMuted(m => !m)}
                title={isMuted ? "Unmute" : "Mute"}
                className="bg-white/5 border-0 rounded-lg w-7 h-7 flex items-center justify-center cursor-pointer"
                style={{ color: isMuted ? "#475569" : "#94a3b8" }}>
                {isMuted ? <BellOff size={13} /> : <Bell size={13} />}
              </button>

              <button
                onClick={closeChat}
                className="bg-white/5 border-0 rounded-lg w-7 h-7 flex items-center justify-center cursor-pointer text-slate-500 hover:text-slate-400">
                <X size={14} />
              </button>
            </div>

            {/* ── Content ───────────────────────────────────────────────────── */}
            <AnimatePresence mode="wait">

              {/* LIST SCREEN */}
              {screen === "list" && (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className="flex-1 flex flex-col overflow-hidden"
                  style={{ background: "#0f172a" }}>

                  <div style={{ padding: "10px 12px 8px", flexShrink: 0 }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8, background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "7px 12px", transition: "border-color .15s" }}
                      onFocusCapture={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)"}
                      onBlurCapture={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}>
                      <Search size={13} style={{ color: "#334155", flexShrink: 0 }} />
                      <input
                        className="afc-search"
                        placeholder="Search subadmins…"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", color: "#334155" }}>
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="afc-scroll flex-1 overflow-y-auto">
                    {loadingSA ? (
                      <div className="flex justify-center p-8">
                        <Loader2 size={20} className="animate-spin text-indigo-500" />
                      </div>
                    ) : filteredContacts.length === 0 ? (
                      <p className="text-center text-[13px] text-slate-600 p-8">
                        {searchQuery ? "No results found" : "No SubAdmins yet"}
                      </p>
                    ) : filteredContacts.map(sa => {
                      const unread  = getUnread(sa._id);
                      const online  = isOnline(sa._id);
                      const lastMsg = getMessages(sa._id).slice(-1)[0];
                      return (
                        <motion.button
                          key={sa._id}
                          whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => openChat(sa)}
                          style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: unread > 0 ? "rgba(99,102,241,0.06)" : "transparent", border: "none", borderLeft: unread > 0 ? "2px solid rgba(99,102,241,0.5)" : "2px solid transparent", cursor: "pointer", textAlign: "left" }}>
                          <div className="relative flex-shrink-0">
                            <div className="w-[40px] h-[40px] rounded-[13px] bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-sm font-extrabold text-indigo-400">
                              {sa.name[0].toUpperCase()}
                            </div>
                            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${online ? "bg-green-500 afc-online" : "bg-slate-700"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <span style={{ fontSize: 13, fontWeight: unread > 0 ? 700 : 600, color: unread > 0 ? "#e2e8f0" : "#cbd5e1" }}>{sa.name}</span>
                              {lastMsg && (
                                <span style={{ fontSize: 10, color: unread > 0 ? "#6366f1" : "#334155", fontWeight: unread > 0 ? 600 : 400 }}>
                                  {fmtTime(lastMsg.createdAt)}
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: 11.5, color: unread > 0 ? "#64748b" : "#334155", fontWeight: unread > 0 ? 600 : 400, margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {lastMsg
                                ? lastMsg.deleted
                                  ? "Message was unsent"
                                  : lastMsg.text
                                : sa.email}
                            </p>
                          </div>
                          {unread > 0 && (
                            <motion.span
                              initial={{ scale: 0 }} animate={{ scale: 1 }}
                              className="min-w-[20px] h-[20px] rounded-full bg-indigo-500 text-white text-[10px] font-black flex items-center justify-center px-1 flex-shrink-0">
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
                  className="flex-1 flex flex-col overflow-hidden"
                  style={{ position: "relative" }}>

                  {/* Messages */}
                  <div
                    ref={chatScrollRef}
                    onScroll={handleScroll}
                    className="afc-scroll flex-1 overflow-y-auto flex flex-col gap-0"
                    style={{ padding: "12px 12px 4px", background: "#0f172a" }}>

                    {!histLoaded[activeOther?.id] ? (
                      <div className="flex-1 flex items-center justify-center">
                        <Loader2 size={20} className="animate-spin text-indigo-500" />
                      </div>
                    ) : msgs.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center gap-3">
                        <div style={{ width: 56, height: 56, borderRadius: 18, background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <MessageCircle size={24} style={{ color: "#6366f1", opacity: 0.4 }} />
                        </div>
                        <p className="text-xs text-slate-600 m-0">No messages yet</p>
                        <p className="text-[11px] text-slate-800 m-0">Say hi to {activeOther?.name}! 👋</p>
                      </div>
                    ) : renderedMsgs.map(item => {

                      if (item.type === "date") return (
                        <div key={item.key} style={{ display: "flex", alignItems: "center", gap: 8, margin: "12px 0 6px" }}>
                          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
                          <span style={{ fontSize: 10, color: "#334155", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                            {item.label}
                          </span>
                          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
                        </div>
                      );

                      if (item.type === "unread") return (
                        <div key="unread-divider" style={{ display: "flex", alignItems: "center", gap: 8, margin: "10px 0 6px" }}>
                          <div style={{ flex: 1, height: 1, background: "rgba(99,102,241,0.3)" }} />
                          <span style={{ fontSize: 10, color: "#6366f1", fontWeight: 700, letterSpacing: "0.03em" }}>
                            ↓ Unread Messages
                          </span>
                          <div style={{ flex: 1, height: 1, background: "rgba(99,102,241,0.3)" }} />
                        </div>
                      );

                      const { msg, isFirst, isLast } = item;
                      const isMine = msg.senderId === me.id || msg.senderRole === "admin";
                      const msgId  = msg._id || msg._tempId;

                      return (
                        <motion.div
                          key={item.key}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.15 }}
                          className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                          style={{ marginBottom: isLast ? 4 : 1 }}>
                          <div
                            className="afc-bubble"
                            onContextMenu={(e) => handleMsgPress(e, msg, isMine)}
                            onDoubleClick={() => !msg.deleted && copyMessage(msg.text, msgId)}
                            title={msg.deleted ? "" : "Double-click to copy • Right-click for options"}
                            style={{
                              position: "relative", maxWidth: "78%", padding: "8px 12px",
                              borderRadius: msgRadius(isMine, isFirst, isLast),
                              background: isMine ? "linear-gradient(135deg,#6366f1,#4f46e5)" : "#1e293b",
                              color: isMine ? "#fff" : "#e2e8f0",
                              fontSize: msg.deleted ? 12 : 13.5,
                              lineHeight: 1.45, fontWeight: 500,
                              boxShadow: isMine ? "0 2px 10px rgba(99,102,241,0.35)" : "0 1px 4px rgba(0,0,0,0.3)",
                              border: !isMine ? "1px solid rgba(255,255,255,0.07)" : "none",
                              wordBreak: "break-word", cursor: "default", userSelect: "text",
                            }}>

                            {/* Message text or deleted state */}
                            {msg.deleted ? (
                              <span style={{ fontStyle: "italic", opacity: 0.5 }}>
                                {isMine ? "You unsent a message" : "Message was unsent"}
                              </span>
                            ) : msg.text}

                            <AnimatePresence>
                              {copiedId === msgId && (
                                <motion.div
                                  initial={{ opacity: 0, y: 6, scale: 0.88 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 6, scale: 0.88 }}
                                  style={{ position: "absolute", top: -30, left: "50%", transform: "translateX(-50%)", background: "#334155", color: "#e2e8f0", fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 8, whiteSpace: "nowrap", pointerEvents: "none", zIndex: 10, border: "1px solid rgba(255,255,255,0.1)" }}>
                                  ✓ Copied!
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {isLast && (
                            <div className="flex items-center gap-1 mt-0.5 mr-1 ml-1">
                              <span className="text-[10px] text-slate-700">{fmtTime(msg.createdAt)}</span>
                              {isMine && !msg.deleted && (msg.seen
                                ? <CheckCheck size={11} className="text-indigo-500" />
                                : <Check size={11} className="text-slate-700" />)}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}

                    {isTyping(activeOther?.id) && (
                      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 4 }}>
                        <div style={{ padding: "10px 14px", borderRadius: "18px 18px 18px 4px", background: "#1e293b", border: "1px solid rgba(255,255,255,0.07)", display: "inline-flex", gap: 4, alignItems: "center" }}>
                          <span className="afc-dot" /><span className="afc-dot" /><span className="afc-dot" />
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
                        style={{ position: "absolute", bottom: 68, right: 12, width: 34, height: 34, borderRadius: "50%", background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 4px 18px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6366f1", zIndex: 5 }}>
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

                  {/* ── Message Context Menu (dark theme) ───────────────────── */}
                  <AnimatePresence>
                    {msgMenu && (
                      <>
                        <div onClick={() => setMsgMenu(null)} style={{ position: "fixed", inset: 0, zIndex: 20 }} />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.88, y: 6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.88, y: 6 }}
                          transition={{ type: "spring", stiffness: 380, damping: 26 }}
                          style={{
                            position: "absolute", bottom: 72, right: 12,
                            background: "#1e293b",
                            borderRadius: 14,
                            boxShadow: "0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            overflow: "hidden", zIndex: 30, minWidth: 180,
                          }}>
                          {msgMenu.isMine && (
                            <button
                              onClick={handleDeleteMsg}
                              style={{ width: "100%", padding: "10px 14px", background: "none", border: "none", borderBottom: "1px solid rgba(255,255,255,0.06)", textAlign: "left", fontSize: 12.5, fontWeight: 600, color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit" }}>
                              🗑 Unsend for everyone
                            </button>
                          )}
                          {/* ── CHANGE 3: Delete for me button ── */}
                          <button
                            onClick={handleDeleteForMe}
                            style={{ width: "100%", padding: "10px 14px", background: "none", border: "none", borderBottom: "1px solid rgba(255,255,255,0.06)", textAlign: "left", fontSize: 12.5, fontWeight: 600, color: "#818cf8", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit" }}>
                            🙈 Delete for me
                          </button>
                          <button
                            onClick={() => { copyMessage(msgMenu.text, msgMenu.msgId); setMsgMenu(null); }}
                            style={{ width: "100%", padding: "10px 14px", background: "none", border: "none", borderBottom: "1px solid rgba(255,255,255,0.06)", textAlign: "left", fontSize: 12.5, fontWeight: 600, color: "#e2e8f0", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit" }}>
                            📋 Copy
                          </button>
                          <button
                            onClick={() => setMsgMenu(null)}
                            style={{ width: "100%", padding: "10px 14px", background: "none", border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "left", fontSize: 12.5, fontWeight: 600, color: "#475569", cursor: "pointer", fontFamily: "inherit" }}>
                            Cancel
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>

                  {/* Input bar */}
                  <div className="p-2.5 px-3 border-t border-white/10 flex gap-2 items-end bg-slate-900 flex-shrink-0">
                    <textarea
                      ref={inputRef}
                      rows={1}
                      value={text}
                      onChange={handleInput}
                      onKeyDown={handleKey}
                      placeholder="Type a message…"
                      className="flex-1 bg-slate-800 border border-white/10 rounded-xl p-2 px-3 text-[13px] text-slate-100 max-h-20 overflow-y-auto font-sans leading-[1.4] outline-none resize-none transition-all duration-150 placeholder:text-slate-600"
                      onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.5)"}
                      onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                    />
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.93 }}
                      onClick={handleSend}
                      disabled={!text.trim()}
                      className={`w-[38px] h-[38px] rounded-xl border-0 flex items-center justify-center flex-shrink-0 transition-all duration-150 ${text.trim() ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white cursor-pointer shadow-md shadow-indigo-500/35" : "bg-indigo-500/10 text-slate-700 cursor-not-allowed"}`}>
                      <Send size={15} />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB ── badge uses totalUnreadCount ───────────────────────────────── */}
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
            {!open && <Badge count={totalUnreadCount} />}
          </AnimatePresence>
        </motion.button>
      ) : (
        <AnimatePresence>
          {!open && (
            <motion.button
              key="fab"
              className="afc-fab"
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
              <AnimatePresence><Badge count={totalUnreadCount} /></AnimatePresence>
            </motion.button>
          )}
        </AnimatePresence>
      )}
    </>,
    document.body
  );
}