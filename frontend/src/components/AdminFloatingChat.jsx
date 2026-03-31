import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, X, Send, Check, CheckCheck,
  ChevronLeft, Loader2, Smile, ArrowDown, Search,
} from "lucide-react";
import { useChatSocket } from "../hooks/useChatSocket";

const API = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;
const EMOJIS = ["👍","❤️","😂","😮","😢","🎉","🔥","✅","👏","🙏","😎","💯","🤔","👀","🫡","🥳"];

/* ── Helpers ──────────────────────────────────────────────────────────────── */
const fmt = (d) =>
  new Date(d).toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" });

const dayLabel = (d) => {
  const diff = Math.floor((Date.now() - new Date(d)) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return new Date(d).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" });
};

const sameDay = (a, b) =>
  new Date(a).toDateString() === new Date(b).toDateString();

/* ── Sub-components ──────────────────────────────────────────────────────── */
const OnlineDot = ({ on }) => (
  <span style={{
    position: "absolute", bottom: -1, right: -1,
    width: 10, height: 10, borderRadius: "50%",
    background: on ? "#22d3ee" : "rgba(255,255,255,0.12)",
    border: "2px solid #050a14",
    boxShadow: on ? "0 0 8px #22d3ee99" : "none",
    transition: "all .3s",
  }} />
);

const Badge = ({ count }) =>
  count > 0 ? (
    <motion.span
      key={count}
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.4, opacity: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 22 }}
      style={{
        position: "absolute", top: -5, right: -5,
        minWidth: 20, height: 20, borderRadius: 99,
        background: "linear-gradient(135deg,#f43f5e,#e11d48)",
        color: "#fff", fontSize: 10, fontWeight: 800,
        display: "flex", alignItems: "center", justifyContent: "center",
        paddingInline: 4, border: "2px solid #050a14",
        boxShadow: "0 2px 10px #f43f5e66",
        pointerEvents: "none",
      }}
    >
      {count > 9 ? "9+" : count}
    </motion.span>
  ) : null;

/* ══════════════════════════════════════════════════════════════════════════ */
export default function AdminFloatingChat({ me }) {
  const [open, setOpen]             = useState(false);
  const [screen, setScreen]         = useState("list");
  const [activeOther, setActive]    = useState(null);
  const [subAdmins, setSubAdmins]   = useState([]);
  const [loadingSA, setLoadingSA]   = useState(false);
  const [text, setText]             = useState("");
  const [histLoaded, setHistLoaded] = useState({});
  const [showEmoji, setShowEmoji]   = useState(false);
  const [atBottom, setAtBottom]     = useState(true);
  const [search, setSearch]         = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isDesktop, setIsDesktop]   = useState(window.innerWidth >= 1024);
  const [fabPos, setFabPos]         = useState({ bottom: 24, right: 24 });
  const [vpHeight, setVpHeight]     = useState(
    () => window.visualViewport?.height ?? window.innerHeight
  );

  const isDragging  = useRef(false);
  const hasDragged  = useRef(false);
  const dragOrigin  = useRef({ x: 0, y: 0, bottom: 24, right: 24 });
  const originPath  = useRef(null);
  const bottomRef   = useRef(null);
  const scrollRef   = useRef(null);
  const inputRef    = useRef(null);
  const typingDelay = useRef(null);

  const {
    isOnline, getMessages, isTyping, getUnread, totalUnread,
    loadHistory, sendMessage, sendTyping, markSeen,
  } = useChatSocket({ myId: me.id, myName: me.name, myRole: "admin", tokenKey: "token" });

  /* ── Badge: totalUnread triggers recompute ── */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const unreadUsersCount = useMemo(
    () => subAdmins.filter(s => getUnread(s._id) > 0).length,
    [subAdmins, totalUnread]
  );

  /* ── Responsive ── */
  useEffect(() => {
    const h = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  /* ── Visual viewport ── */
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const u = () => setVpHeight(vv.height);
    vv.addEventListener("resize", u);
    vv.addEventListener("scroll", u);
    return () => { vv.removeEventListener("resize", u); vv.removeEventListener("scroll", u); };
  }, []);

  /* ── Drag ── */
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
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [isDesktop]);

  const startDrag = useCallback((cx, cy) => {
    if (isDesktop) return;
    isDragging.current = true;
    hasDragged.current = false;
    dragOrigin.current = { x: cx, y: cy, ...fabPos };
  }, [fabPos, isDesktop]);

  /* ── Load contacts ── */
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

  /* ── Back-button: never leave page ── */
  const closeChat = useCallback(() => {
    setOpen(false); setScreen("list"); setActive(null);
    setShowEmoji(false); setSearch(""); setShowSearch(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    originPath.current = originPath.current || window.location.href;
    window.history.pushState({ afc: "list" }, "");
    return () => { originPath.current = null; };
  }, [open]);

  useEffect(() => {
    if (open && screen === "chat") window.history.pushState({ afc: "chat" }, "");
  }, [open, screen]);

  useEffect(() => {
    const onPop = (e) => {
      const s = e.state;
      if (s?.afc === "chat") {
        setScreen("list");
        window.history.pushState({ afc: "list" }, "");
      } else if (s?.afc === "list") {
        closeChat();
        if (originPath.current) window.history.replaceState(null, "", originPath.current);
      } else {
        closeChat();
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [closeChat]);

  /* ── History ── */
  useEffect(() => {
    if (activeOther && !histLoaded[activeOther.id]) {
      loadHistory(activeOther.id).then(() =>
        setHistLoaded(prev => ({ ...prev, [activeOther.id]: true }))
      );
    }
  }, [activeOther, histLoaded, loadHistory]);

  const msgs = activeOther ? getMessages(activeOther.id) : [];

  const filteredMsgs = useMemo(() =>
    search.trim()
      ? msgs.filter(m => m.text?.toLowerCase().includes(search.toLowerCase()))
      : msgs,
    [msgs, search]
  );

  /* ── Scroll ── */
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 60);
  }, []);

  useEffect(() => {
    if (screen === "chat" && atBottom)
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [screen, activeOther, msgs.length, atBottom]);

  /* ── Mark seen ── */
  useEffect(() => {
    if (open && screen === "chat" && activeOther) markSeen(activeOther.id);
  }, [open, screen, activeOther, msgs.length, markSeen]);

  /* ── Actions ── */
  const openChat = (sa) => {
    setActive({ id: sa._id, name: sa.name, model: "SubAdmin" });
    setScreen("chat"); setShowEmoji(false); setSearch(""); setShowSearch(false);
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
    setText(""); setShowEmoji(false);
    sendTyping(activeOther.id, false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    inputRef.current?.focus();
  }, [text, activeOther, sendMessage, sendTyping]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  /* ── Panel style ── */
  const panelStyle = isDesktop
    ? { position: "fixed", bottom: 90, right: 24, width: 360, height: 540, borderRadius: 24, zIndex: 2147483646 }
    : { position: "fixed", left: 0, right: 0, bottom: 0, top: window.innerHeight - vpHeight, width: "100%", height: vpHeight, borderRadius: 0, zIndex: 2147483646 };

  const fabBase = {
    position: "fixed", bottom: 24, right: 24, zIndex: 2147483647,
    width: 54, height: 54, borderRadius: 18, border: "none",
    background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)",
    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 8px 30px rgba(99,102,241,0.55), 0 2px 8px rgba(0,0,0,0.3)",
  };

  /* ════════════════════════════════════════════════ RENDER */
  return ReactDOM.createPortal(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .afc-root * { box-sizing:border-box; font-family:'Plus Jakarta Sans',sans-serif; }
        .afc-scroll::-webkit-scrollbar { width:3px; }
        .afc-scroll::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.07); border-radius:99px; }
        .afc-ta { outline:none; resize:none; background:transparent; border:none; width:100%; color:#e2e8f0; font-size:13.5px; line-height:1.45; font-family:'Plus Jakarta Sans',sans-serif; }
        .afc-ta::placeholder { color:rgba(148,163,184,0.4); }
        .afc-si { outline:none; background:transparent; border:none; color:#e2e8f0; font-size:13px; width:100%; font-family:'Plus Jakarta Sans',sans-serif; }
        .afc-si::placeholder { color:rgba(100,116,139,0.6); }
        .afc-fab-m { touch-action:none; user-select:none; -webkit-user-select:none; }
        @keyframes afc-pulse { 0%,100%{opacity:.35;transform:scale(.8);} 50%{opacity:1;transform:scale(1);} }
        .afc-dot { width:7px;height:7px;border-radius:50%;background:#475569;display:inline-block;animation:afc-pulse 1.4s ease-in-out infinite; }
        .afc-dot:nth-child(2){animation-delay:.2s;} .afc-dot:nth-child(3){animation-delay:.4s;}
        @keyframes afc-spin { to{transform:rotate(360deg);} }
      `}</style>

      <div className="afc-root">

        {/* ══ PANEL ══════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {open && (
            <motion.div
              key="afc-window"
              initial={{ opacity: 0, y: isDesktop ? 24 : 60, scale: isDesktop ? 0.92 : 1 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: isDesktop ? 24 : 60, scale: isDesktop ? 0.92 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              style={{
                ...panelStyle, overflow: "hidden",
                display: "flex", flexDirection: "column",
                background: "#050a14",
                border: isDesktop ? "1px solid rgba(255,255,255,0.06)" : "none",
                boxShadow: "0 40px 100px rgba(0,0,0,0.75), 0 0 0 1px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.03)",
              }}
            >
              {/* glow bar */}
              <div style={{ height: 2, flexShrink: 0, background: "linear-gradient(90deg,transparent 0%,#7c3aed 25%,#6366f1 50%,#06b6d4 80%,transparent 100%)", opacity: 0.85 }} />

              {/* ── HEADER ── */}
              <div style={{ padding: "11px 14px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.015)" }}>
                {screen === "chat" && (
                  <motion.button whileTap={{ scale: 0.86 }} onClick={() => setScreen("list")}
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#475569", flexShrink: 0 }}>
                    <ChevronLeft size={15} />
                  </motion.button>
                )}

                {screen === "list" ? (
                  <>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 800, color: "#f1f5f9", margin: 0, letterSpacing: "-0.3px" }}>Messages</p>
                      <p style={{ fontSize: 11, color: "#1e293b", margin: 0 }}>{subAdmins.length} SubAdmins</p>
                    </div>
                    <motion.button whileTap={{ scale: 0.86 }} onClick={() => { setShowSearch(s => !s); setSearch(""); }}
                      style={{ background: showSearch ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${showSearch ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.06)"}`, borderRadius: 10, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: showSearch ? "#818cf8" : "#334155", transition: "all .2s" }}>
                      <Search size={13} />
                    </motion.button>
                  </>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 12, background: "linear-gradient(135deg,rgba(99,102,241,0.22),rgba(139,92,246,0.18))", border: "1px solid rgba(99,102,241,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13.5, fontWeight: 800, color: "#a5b4fc" }}>
                        {activeOther?.name?.[0]?.toUpperCase()}
                      </div>
                      <OnlineDot on={isOnline(activeOther?.id)} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13.5, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>{activeOther?.name}</p>
                      <p style={{ fontSize: 11, margin: 0, transition: "color .3s", color: isTyping(activeOther?.id) ? "#22d3ee" : isOnline(activeOther?.id) ? "#4ade80" : "#1e293b" }}>
                        {isTyping(activeOther?.id) ? "typing…" : isOnline(activeOther?.id) ? "● Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                )}

                <motion.button whileTap={{ scale: 0.86 }} onClick={closeChat}
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#334155" }}>
                  <X size={14} />
                </motion.button>
              </div>

              {/* search bar */}
              <AnimatePresence>
                {showSearch && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 42, opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: "hidden", flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 14px", height: 42, background: "rgba(255,255,255,0.012)" }}>
                      <Search size={13} style={{ color: "#1e293b", flexShrink: 0 }} />
                      <input className="afc-si" placeholder={screen === "chat" ? "Search messages…" : "Search SubAdmins…"} value={search} onChange={e => setSearch(e.target.value)} autoFocus />
                      {search && <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "#334155", cursor: "pointer", fontSize: 13, flexShrink: 0 }}>✕</motion.button>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ══ CONTENT ════════════════════════════════════════════════ */}
              <AnimatePresence mode="wait">

                {/* ── LIST ── */}
                {screen === "list" && (
                  <motion.div key="list" initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.16 }}
                    className="afc-scroll" style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
                    {loadingSA ? (
                      <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
                        <Loader2 size={20} style={{ color: "#6366f1", animation: "afc-spin 1s linear infinite" }} />
                      </div>
                    ) : subAdmins.length === 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 44 }}>
                        <div style={{ width: 50, height: 50, borderRadius: 17, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <MessageCircle size={22} style={{ color: "#4338ca" }} />
                        </div>
                        <p style={{ fontSize: 12.5, color: "#1e293b", margin: 0 }}>No SubAdmins yet</p>
                      </div>
                    ) : subAdmins
                        .filter(sa => !search.trim() || sa.name?.toLowerCase().includes(search.toLowerCase()))
                        .map((sa, i) => {
                          const unread  = getUnread(sa._id);
                          const online  = isOnline(sa._id);
                          const lastMsg = getMessages(sa._id).slice(-1)[0];
                          return (
                            <motion.button key={sa._id}
                              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                              whileHover={{ background: "rgba(99,102,241,0.07)" }}
                              onClick={() => openChat(sa)}
                              style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", transition: "background .15s" }}>
                              <div style={{ position: "relative", flexShrink: 0 }}>
                                <div style={{ width: 43, height: 43, borderRadius: 15, background: "linear-gradient(135deg,rgba(99,102,241,0.22),rgba(139,92,246,0.18))", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#a5b4fc" }}>
                                  {sa.name[0].toUpperCase()}
                                </div>
                                <OnlineDot on={online} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                                  <span style={{ fontSize: 13, fontWeight: unread > 0 ? 700 : 600, color: unread > 0 ? "#f1f5f9" : "#64748b" }}>{sa.name}</span>
                                  {lastMsg && <span style={{ fontSize: 10, color: "#0f172a" }}>{fmt(lastMsg.createdAt)}</span>}
                                </div>
                                <p style={{ fontSize: 12, color: unread > 0 ? "#334155" : "#0f172a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: unread > 0 ? 500 : 400 }}>
                                  {lastMsg ? lastMsg.text : sa.email}
                                </p>
                              </div>
                              <AnimatePresence>
                                {unread > 0 && (
                                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                    style={{ minWidth: 20, height: 20, borderRadius: 99, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", paddingInline: 5, flexShrink: 0, boxShadow: "0 2px 10px rgba(99,102,241,0.55)" }}>
                                    {unread > 9 ? "9+" : unread}
                                  </motion.span>
                                )}
                              </AnimatePresence>
                            </motion.button>
                          );
                        })
                    }
                  </motion.div>
                )}

                {/* ── CHAT ── */}
                {screen === "chat" && (
                  <motion.div key="chat" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 18 }} transition={{ duration: 0.16 }}
                    style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>

                    <div ref={scrollRef} onScroll={handleScroll}
                      className="afc-scroll"
                      style={{ flex: 1, overflowY: "auto", padding: "12px 12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
                      {!histLoaded[activeOther?.id] ? (
                        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Loader2 size={22} style={{ color: "#6366f1", animation: "afc-spin 1s linear infinite" }} />
                        </div>
                      ) : filteredMsgs.length === 0 ? (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                          <div style={{ width: 52, height: 52, borderRadius: 18, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <MessageCircle size={24} style={{ color: "#4338ca" }} />
                          </div>
                          <p style={{ fontSize: 12.5, color: "#1e293b", margin: 0 }}>
                            {search ? "No messages found" : `Say hi to ${activeOther?.name}! 👋`}
                          </p>
                        </div>
                      ) : filteredMsgs.map((msg, i) => {
                          const isMine = msg.senderId === me.id || msg.senderRole === "admin";
                          const prev   = filteredMsgs[i - 1];
                          const next   = filteredMsgs[i + 1];
                          const newDay = !prev || !sameDay(prev.createdAt, msg.createdAt);
                          const groupPrev = prev && prev.senderId?.toString() === msg.senderId?.toString() && !newDay;
                          const groupNext = next && next.senderId?.toString() === msg.senderId?.toString() && sameDay(msg.createdAt, next?.createdAt);

                          const br = isMine
                            ? `${groupPrev ? 6 : 18}px ${groupPrev ? 6 : 18}px 4px ${groupNext ? 6 : 18}px`
                            : `${groupPrev ? 6 : 18}px ${groupPrev ? 6 : 18}px ${groupNext ? 6 : 18}px 4px`;

                          return (
                            <div key={msg._id || msg._tempId || i}>
                              {newDay && (
                                <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "12px 0 10px" }}>
                                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.04)" }} />
                                  <span style={{ fontSize: 10, color: "#0f172a", fontWeight: 600, letterSpacing: "0.6px", textTransform: "uppercase" }}>
                                    {dayLabel(msg.createdAt)}
                                  </span>
                                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.04)" }} />
                                </div>
                              )}
                              <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.14 }}
                                style={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start", marginBottom: groupNext ? 2 : 6 }}>
                                <div style={{
                                  maxWidth: "78%", padding: "8px 13px", borderRadius: br,
                                  background: isMine ? "linear-gradient(135deg,#6366f1,#7c3aed)" : "rgba(255,255,255,0.055)",
                                  color: isMine ? "#fff" : "#cbd5e1",
                                  fontSize: 13.5, lineHeight: 1.5, fontWeight: 500,
                                  boxShadow: isMine ? "0 4px 18px rgba(99,102,241,0.4)" : "none",
                                  border: !isMine ? "1px solid rgba(255,255,255,0.05)" : "none",
                                  wordBreak: "break-word",
                                }}>
                                  {msg.text}
                                </div>
                                {!groupNext && (
                                  <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 3, marginInline: 4 }}>
                                    <span style={{ fontSize: 10, color: "#0f172a" }}>{fmt(msg.createdAt)}</span>
                                    {isMine && (msg.seen
                                      ? <CheckCheck size={11} style={{ color: "#818cf8" }} />
                                      : <Check size={11} style={{ color: "#0f172a" }} />
                                    )}
                                  </div>
                                )}
                              </motion.div>
                            </div>
                          );
                        })
                      }

                      <AnimatePresence>
                        {isTyping(activeOther?.id) && (
                          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}>
                            <div style={{ display: "inline-flex", gap: 5, alignItems: "center", padding: "10px 14px", borderRadius: "18px 18px 18px 4px", background: "rgba(255,255,255,0.055)", border: "1px solid rgba(255,255,255,0.05)" }}>
                              <span className="afc-dot" /><span className="afc-dot" /><span className="afc-dot" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div ref={bottomRef} />
                    </div>

                    {/* scroll to bottom */}
                    <AnimatePresence>
                      {!atBottom && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
                          whileTap={{ scale: 0.88 }}
                          onClick={() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); setAtBottom(true); }}
                          style={{ position: "absolute", bottom: 68, right: 14, width: 32, height: 32, borderRadius: 99, background: "rgba(5,10,20,0.97)", border: "1px solid rgba(99,102,241,0.35)", color: "#818cf8", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.6)", zIndex: 5 }}>
                          <ArrowDown size={14} />
                        </motion.button>
                      )}
                    </AnimatePresence>

                    {/* emoji picker */}
                    <AnimatePresence>
                      {showEmoji && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.94 }}
                          style={{ position: "absolute", bottom: 64, left: 10, right: 10, background: "rgba(5,10,20,0.98)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "12px 14px", display: "flex", flexWrap: "wrap", gap: 8, boxShadow: "0 12px 40px rgba(0,0,0,0.7)", zIndex: 10 }}>
                          {EMOJIS.map(em => (
                            <motion.button key={em} whileHover={{ scale: 1.35 }} whileTap={{ scale: 0.85 }}
                              onClick={() => { setText(t => t + em); setShowEmoji(false); inputRef.current?.focus(); }}
                              style={{ background: "none", border: "none", fontSize: 21, cursor: "pointer", lineHeight: 1, padding: 2 }}>
                              {em}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* input bar */}
                    <div style={{ padding: "9px 12px 10px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 8, alignItems: "flex-end", background: "rgba(255,255,255,0.01)", flexShrink: 0 }}>
                      <motion.button whileTap={{ scale: 0.85, rotate: 20 }}
                        onClick={() => setShowEmoji(s => !s)}
                        style={{ width: 36, height: 36, borderRadius: 12, background: showEmoji ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.05)", border: `1px solid ${showEmoji ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.06)"}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: showEmoji ? "#818cf8" : "#1e293b", flexShrink: 0, transition: "all .2s" }}>
                        <Smile size={16} />
                      </motion.button>

                      <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "8px 12px", transition: "border-color .2s" }}>
                        <textarea ref={inputRef} className="afc-ta" rows={1}
                          value={text} onChange={handleInput} onKeyDown={handleKey}
                          placeholder="Message…"
                          style={{ maxHeight: 80, overflowY: "auto" }}
                          onFocus={e => e.target.closest("div").style.borderColor = "rgba(99,102,241,0.35)"}
                          onBlur={e => e.target.closest("div").style.borderColor = "rgba(255,255,255,0.06)"}
                        />
                      </div>

                      <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.88 }}
                        onClick={handleSend} disabled={!text.trim()}
                        style={{
                          width: 38, height: 38, borderRadius: 13, border: "none", flexShrink: 0,
                          background: text.trim() ? "linear-gradient(135deg,#6366f1,#7c3aed)" : "rgba(255,255,255,0.04)",
                          color: text.trim() ? "#fff" : "#0f172a",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: text.trim() ? "pointer" : "not-allowed",
                          boxShadow: text.trim() ? "0 4px 18px rgba(99,102,241,0.5)" : "none",
                          transition: "all .2s",
                        }}>
                        <Send size={15} />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══ FAB ════════════════════════════════════════════════════════════ */}
        {isDesktop ? (
          <motion.button
            whileHover={{ scale: 1.1, boxShadow: "0 14px 44px rgba(99,102,241,0.65)" }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setOpen(o => !o)}
            style={{ ...fabBase, cursor: "pointer", position: "relative" }}>
            <AnimatePresence mode="wait">
              {open
                ? <motion.span key="x" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }} transition={{ duration: 0.18 }}><X size={22} /></motion.span>
                : <motion.span key="m" initial={{ scale: 0, rotate: 90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: -90 }} transition={{ duration: 0.18 }}><MessageCircle size={22} /></motion.span>
              }
            </AnimatePresence>
            <AnimatePresence>
              {!open && <Badge count={unreadUsersCount} />}
            </AnimatePresence>
          </motion.button>
        ) : (
          <AnimatePresence>
            {!open && (
              <motion.button key="fab" className="afc-fab-m"
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 360, damping: 26 }}
                whileTap={{ scale: 0.88 }}
                onMouseDown={(e) => { e.preventDefault(); startDrag(e.clientX, e.clientY); }}
                onTouchStart={(e) => { startDrag(e.touches[0].clientX, e.touches[0].clientY); }}
                onClick={() => { if (!hasDragged.current) setOpen(true); }}
                style={{ ...fabBase, bottom: fabPos.bottom, right: fabPos.right, cursor: "grab", position: "relative" }}>
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