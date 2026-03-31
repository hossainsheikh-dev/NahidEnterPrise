import { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, X, Send, Check, CheckCheck,
  ChevronLeft, Loader2,
} from "lucide-react";
import { useChatSocket } from "../hooks/useChatSocket";

const API = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;

export default function AdminFloatingChat({ me }) {
  const [open, setOpen]               = useState(false);
  const [screen, setScreen]           = useState("list");
  const [activeOther, setActive]      = useState(null);
  const [subAdmins, setSubAdmins]     = useState([]);
  const [loadingSA, setLoadingSA]     = useState(false);
  const [text, setText]               = useState("");
  const [histLoaded, setHistLoaded]   = useState({});
  const [peerIds, setPeerIds]         = useState([]);

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  const [fabPos, setFabPos] = useState({ bottom: 24, right: 24 });
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const dragOrigin = useRef({ x: 0, y: 0, bottom: 24, right: 24 });

  const [vpHeight, setVpHeight] = useState(
    () => window.visualViewport?.height ?? window.innerHeight
  );

  // ── FIX: track the page URL that was active when chat opened ──────────────
  const originPath = useRef(null);

  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);
  const typingDelay = useRef(null);

  const {
    isOnline, getMessages, isTyping, getUnread,
    loadHistory, sendMessage, sendTyping, markSeen,
  } = useChatSocket({ myId: me.id, myName: me.name, myRole: "admin", tokenKey: "token" });

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

  // ── Badge: unique users with unread messages ───────────────────────────────
  useEffect(() => {
    setPeerIds(subAdmins.map(s => s._id));
  }, [subAdmins]);

  const unreadUsersCount = peerIds.filter(id => getUnread(id) > 0).length;

  // ── FIX: Back-button — never leave the current page ───────────────────────
  const closeChat = useCallback(() => {
    setOpen(false);
    setScreen("list");
    setActive(null);
  }, []);

  useEffect(() => {
    if (!open) return;

    if (!originPath.current) {
      originPath.current = window.location.href;
    }

    window.history.pushState({ afc: "list" }, "");

    return () => {
      originPath.current = null;
    };
  }, [open]);

  useEffect(() => {
    if (open && screen === "chat") {
      window.history.pushState({ afc: "chat" }, "");
    }
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
        if (originPath.current) {
          window.history.replaceState(null, "", originPath.current);
        }
        return;
      }

      closeChat();
    };

    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [closeChat]);

  // ── History load ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeOther && !histLoaded[activeOther.id]) {
      loadHistory(activeOther.id).then(() =>
        setHistLoaded(prev => ({ ...prev, [activeOther.id]: true }))
      );
    }
  }, [activeOther, histLoaded, loadHistory]);

  const msgs = activeOther ? getMessages(activeOther.id) : [];

  useEffect(() => {
    if (screen === "chat") bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [screen, activeOther, msgs.length]);

  useEffect(() => {
    if (open && screen === "chat" && activeOther) markSeen(activeOther.id);
  }, [open, screen, activeOther, msgs.length, markSeen]);

  const openChat = (sa) => {
    setActive({ id: sa._id, name: sa.name, model: "SubAdmin" });
    setScreen("chat");
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

  const fmtTime = (d) =>
    new Date(d).toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" });

  // ── Panel style ────────────────────────────────────────────────────────────
  const panelStyle = isDesktop
    ? { position: "fixed", bottom: 88, right: 24, width: 340, height: 500, borderRadius: 16, zIndex: 2147483646 }
    : { position: "fixed", left: 0, right: 0, bottom: 0, top: window.innerHeight - vpHeight, width: "100%", height: vpHeight, borderRadius: 0, zIndex: 2147483646 };

  const fabBase = {
    position: "fixed", bottom: 24, right: 24, zIndex: 2147483647,
    width: 52, height: 52, borderRadius: 16, border: "none",
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 6px 24px rgba(99,102,241,0.45)",
  };

  const Badge = ({ count }) => count > 0 ? (
    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      style={{ position: "absolute", top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 99, background: "#f43f5e", color: "#fff", fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", paddingInline: 4, border: "2px solid #0f172a" }}>
      {count > 9 ? "9+" : count}
    </motion.span>
  ) : null;

  return ReactDOM.createPortal(
    <>
      <style>{`.afc-fab { touch-action:none; user-select:none; -webkit-user-select:none; }`}</style>

      {/* ── Chat Panel ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: isDesktop ? 16 : 40, scale: isDesktop ? 0.95 : 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isDesktop ? 16 : 40, scale: isDesktop ? 0.95 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            style={{ ...panelStyle, overflow: "hidden", display: "flex", flexDirection: "column", background: "#0f172a", border: isDesktop ? "1px solid rgba(255,255,255,0.08)" : "none", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>

            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-3 flex items-center gap-2.5 flex-shrink-0 border-b border-white/10">
              {screen === "chat" && (
                <button onClick={() => setScreen("list")} className="bg-white/10 border-0 rounded-lg w-7 h-7 flex items-center justify-center cursor-pointer text-slate-400 hover:text-slate-300 flex-shrink-0">
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
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${isOnline(activeOther?.id) ? "bg-green-500" : "bg-slate-600"}`} />
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
              <button onClick={closeChat} className="bg-white/5 border-0 rounded-lg w-7 h-7 flex items-center justify-center cursor-pointer text-slate-500 hover:text-slate-400">
                <X size={14} />
              </button>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              {screen === "list" && (
                <motion.div key="list" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                  className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-white/10" style={{ background: "#0f172a" }}>
                  {loadingSA ? (
                    <div className="flex justify-center p-8"><Loader2 size={20} className="animate-spin text-indigo-500" /></div>
                  ) : subAdmins.length === 0 ? (
                    <p className="text-center text-[13px] text-slate-600 p-8">No SubAdmins yet</p>
                  ) : subAdmins.map(sa => {
                    const unread  = getUnread(sa._id);
                    const online  = isOnline(sa._id);
                    const lastMsg = getMessages(sa._id).slice(-1)[0];
                    return (
                      <motion.button key={sa._id} whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                        onClick={() => openChat(sa)} className="w-full flex items-center gap-3 p-3 bg-transparent border-0 cursor-pointer text-left">
                        <div className="relative flex-shrink-0">
                          <div className="w-[38px] h-[38px] rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-sm font-extrabold text-indigo-400">
                            {sa.name[0].toUpperCase()}
                          </div>
                          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${online ? "bg-green-500" : "bg-slate-700"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <span className="text-[13px] font-semibold text-slate-100">{sa.name}</span>
                            {lastMsg && <span className="text-[10px] text-slate-700">{fmtTime(lastMsg.createdAt)}</span>}
                          </div>
                          <p className="text-[11.5px] text-slate-600 mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
                            {lastMsg ? lastMsg.text : sa.email}
                          </p>
                        </div>
                        {unread > 0 && (
                          <span className="min-w-[18px] h-[18px] rounded-full bg-indigo-500 text-white text-[10px] font-black flex items-center justify-center px-1 flex-shrink-0">
                            {unread > 9 ? "9+" : unread}
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}

              {screen === "chat" && (
                <motion.div key="chat" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                  className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-3 pb-1 flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-white/10" style={{ background: "#0f172a" }}>
                    {!histLoaded[activeOther?.id] ? (
                      <div className="flex-1 flex items-center justify-center"><Loader2 size={20} className="animate-spin text-indigo-500" /></div>
                    ) : msgs.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center gap-2">
                        <MessageCircle size={26} className="text-slate-800" />
                        <p className="text-xs text-slate-700">Say hi to {activeOther?.name}! 👋</p>
                      </div>
                    ) : msgs.map((msg, i) => {
                      const isMine = msg.senderId === me.id || msg.senderRole === "admin";
                      return (
                        <motion.div key={msg._id || msg._tempId || i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                          className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                          <div className={`max-w-[78%] p-2 px-3 ${isMine ? "rounded-t-2xl rounded-l-2xl rounded-br-sm bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/30" : "rounded-t-2xl rounded-r-2xl rounded-bl-sm bg-slate-800 text-slate-200 border border-white/10"} text-[13.5px] leading-[1.45] font-medium break-words`}>
                            {msg.text}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5 mr-1 ml-1">
                            <span className="text-[10px] text-slate-700">{fmtTime(msg.createdAt)}</span>
                            {isMine && (msg.seen ? <CheckCheck size={11} className="text-indigo-500" /> : <Check size={11} className="text-slate-700" />)}
                          </div>
                        </motion.div>
                      );
                    })}
                    {isTyping(activeOther?.id) && (
                      <div className="flex">
                        <div className="p-2.5 px-3.5 rounded-t-2xl rounded-r-2xl rounded-bl-sm bg-slate-800 border border-white/10 flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-[pulse_1.2s_infinite]" style={{ animationDelay: "0s" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-[pulse_1.2s_infinite]" style={{ animationDelay: "0.2s" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-[pulse_1.2s_infinite]" style={{ animationDelay: "0.4s" }} />
                        </div>
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </div>

                  <div className="p-2.5 px-3 border-t border-white/10 flex gap-2 items-end bg-slate-900 flex-shrink-0">
                    <textarea ref={inputRef} rows={1} value={text} onChange={handleInput} onKeyDown={handleKey} placeholder="Type a message…"
                      className="flex-1 bg-slate-800 border border-white/10 rounded-xl p-2 px-3 text-[13px] text-slate-100 max-h-20 overflow-y-auto font-sans leading-[1.4] outline-none resize-none transition-all duration-150 placeholder:text-slate-600"
                      onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.5)"}
                      onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                    <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }} onClick={handleSend} disabled={!text.trim()}
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

      {/* ── FAB ──────────────────────────────────────────────────────────── */}
      {isDesktop ? (
        <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
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
            <motion.button key="fab" className="afc-fab"
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
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
    </>,
    document.body
  );
}