import { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Send, Check, CheckCheck,
  ChevronDown, ChevronLeft, Loader2,
} from "lucide-react";
import { useChatSocket } from "../hooks/useChatSocket";

const API = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;

export default function FloatingChat({ me, other }) {
  const [open, setOpen] = useState(false);
  const [screen, setScreen] = useState("list");
  const [activeOther, setActiveOther] = useState(null);
  const [text, setText] = useState("");
  const [histLoaded, setHistLoaded] = useState({});
  const [subAdmins, setSubAdmins] = useState([]);
  const [loadingSA, setLoadingSA] = useState(false);

  // ── FIX 1: Draggable FAB position ──────────────────────────────────────────
  const [fabPos, setFabPos] = useState({ bottom: 24, right: 24 });
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const dragOrigin = useRef({ x: 0, y: 0, bottom: 24, right: 24 });

  // ── FIX 4: Visual viewport height (keyboard shrinks it on mobile) ──────────
  const [vpHeight, setVpHeight] = useState(
    () => window.visualViewport?.height ?? window.innerHeight
  );

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const typingDelay = useRef(null);

  const {
    isOnline, getMessages, isTyping, getUnread, totalUnread,
    loadHistory, sendMessage, sendTyping, markSeen,
  } = useChatSocket({
    myId: me.id, myName: me.name, myRole: "subadmin", tokenKey: "subAdminToken",
  });

  // ── FIX 4: Track visualViewport resize (keyboard open/close) ───────────────
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setVpHeight(vv.height);
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  // ── FIX 1: Global drag move / end listeners ─────────────────────────────────
  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging.current) return;
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = cx - dragOrigin.current.x;
      const dy = cy - dragOrigin.current.y;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasDragged.current = true;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const FAB = 56;
      setFabPos({
        right:  Math.max(8, Math.min(W - FAB - 8, dragOrigin.current.right  - dx)),
        bottom: Math.max(8, Math.min(H - FAB - 8, dragOrigin.current.bottom - dy)),
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
  }, []);

  const startDrag = useCallback((clientX, clientY) => {
    isDragging.current = true;
    hasDragged.current = false;
    dragOrigin.current = { x: clientX, y: clientY, ...fabPos };
  }, [fabPos]);

  // ── SubAdmin list ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoadingSA(true);
      try {
        const token = localStorage.getItem("subAdminToken");
        const res = await fetch(`${API}/api/subadmin/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const list = Array.isArray(data)
          ? data.filter(s => s.status === "approved" && s._id !== me.id)
          : [];
        setSubAdmins(list);
      } catch (e) { console.log(e); }
      finally { setLoadingSA(false); }
    })();
  }, [open, me.id]);

  // ── Load history ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeOther && !histLoaded[activeOther.id]) {
      loadHistory(activeOther.id).then(() =>
        setHistLoaded(prev => ({ ...prev, [activeOther.id]: true }))
      );
    }
  }, [activeOther, histLoaded, loadHistory]);

  // ── Scroll to bottom ────────────────────────────────────────────────────────
  const msgs = activeOther ? getMessages(activeOther.id) : [];

  useEffect(() => {
    if (screen === "chat") bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [screen, activeOther, msgs.length]);

  // ── FIX 3: Mark seen whenever chat is open AND new messages arrive ──────────
  // Runs when msgs.length changes so a live-arriving message is immediately marked.
  useEffect(() => {
    if (open && screen === "chat" && activeOther) {
      markSeen(activeOther.id);
    }
  }, [open, screen, activeOther, msgs.length, markSeen]);

  // Also clear badge immediately when the user opens the chat window
  useEffect(() => {
    if (open && screen === "chat" && activeOther) {
      markSeen(activeOther.id);
    }
  }, [open, screen, activeOther, markSeen]);

  const openChat = (person) => {
    setActiveOther(person);
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
    sendMessage({ receiverId: activeOther.id, receiverModel: activeOther.model, text });
    setText("");
    sendTyping(activeOther.id, false);
    inputRef.current?.focus();
  }, [text, activeOther, sendMessage, sendTyping]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const fmtTime = (d) =>
    new Date(d).toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" });

  const contactList = [
    ...(other ? [{ ...other, _id: other.id, isAdmin: true }] : []),
    ...subAdmins.map(s => ({ ...s, id: s._id, model: "SubAdmin", isAdmin: false })),
  ];

  // ── FIX 2: Chat panel — centred on screen ──────────────────────────────────
  // On mobile (< 640 px) we fill the visual viewport (respects keyboard).
  // On desktop we anchor near the FAB but still centred horizontally.
  const isMobile = window.innerWidth < 640;

  const panelStyle = isMobile
    ? {
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        top: window.innerHeight - vpHeight,   // keyboard-aware top edge
        width: "100%",
        height: vpHeight,
        borderRadius: 0,
      }
    : {
        position: "fixed",
        bottom: fabPos.bottom + 68,
        left: "50%",
        transform: "translateX(-50%)",
        width: 360,
        height: 520,
        borderRadius: 20,
      };

  return ReactDOM.createPortal(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        .fc-sa * { box-sizing:border-box; font-family:'DM Sans',sans-serif; }
        .fc-sa-scroll::-webkit-scrollbar { width:3px; }
        .fc-sa-scroll::-webkit-scrollbar-thumb { background:rgba(99,102,241,0.15); border-radius:99px; }
        .fc-sa-inp { outline:none; resize:none; }
        .fc-sa-inp::placeholder { color:#94a3b8; }
        @keyframes fc-sa-dots {
          0%,80%,100%{opacity:0;transform:scale(0.6);}
          40%{opacity:1;transform:scale(1);}
        }
        .fc-sa-dot { display:inline-block;width:6px;height:6px;border-radius:50%;background:#94a3b8;animation:fc-sa-dots 1.2s infinite; }
        .fc-sa-dot:nth-child(2){animation-delay:.2s;}
        .fc-sa-dot:nth-child(3){animation-delay:.4s;}
        .fc-sa-fab { touch-action: none; user-select: none; -webkit-user-select: none; }
      `}</style>

      <div className="fc-sa">

        {/* ── Chat panel ──────────────────────────────────────────────────── */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: isMobile ? 1 : 0.95 }}
              animate={{ opacity: 1, y: 0,  scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: isMobile ? 1 : 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              style={{
                ...panelStyle,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                background: "linear-gradient(160deg,#ffffff,#fafbff)",
                border: isMobile ? "none" : "1px solid rgba(99,102,241,0.12)",
                boxShadow: "0 24px 64px rgba(99,102,241,0.14), 0 4px 16px rgba(0,0,0,0.06)",
                zIndex: 1000,
              }}>

              {/* top accent */}
              <div style={{ height: 2, background: "linear-gradient(90deg,transparent,#6366f1,#8b5cf6,transparent)", flexShrink: 0 }} />

              {/* header */}
              <div style={{
                background: "linear-gradient(135deg,#6366f1,#4f46e5)",
                padding: "12px 14px",
                display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
              }}>
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
                      <span style={{ position: "absolute", bottom: -1, right: -1, width: 10, height: 10, borderRadius: "50%", background: isOnline(activeOther?.id) ? "#22c55e" : "rgba(255,255,255,0.3)", border: "2px solid white" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.2 }}>{activeOther?.name}</p>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", margin: 0 }}>
                        {isTyping(activeOther?.id) ? "typing…" : isOnline(activeOther?.id) ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                )}

                <button onClick={() => setOpen(false)}
                  style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
                  <ChevronDown size={15} />
                </button>
              </div>

              {/* content */}
              <AnimatePresence mode="wait">
                {screen === "list" && (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    className="fc-sa-scroll"
                    style={{ flex: 1, overflowY: "auto", padding: "8px 0", background: "#f8f9ff" }}>
                    {loadingSA ? (
                      <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
                        <Loader2 size={20} className="animate-spin" style={{ color: "#6366f1" }} />
                      </div>
                    ) : contactList.length === 0 ? (
                      <p style={{ textAlign: "center", fontSize: 13, color: "#94a3b8", padding: 32 }}>No contacts yet</p>
                    ) : contactList.map((person) => {
                      const pid = person.id || person._id;
                      const unread = getUnread(pid);
                      const online = isOnline(pid);
                      const lastMsg = getMessages(pid).slice(-1)[0];
                      return (
                        <motion.button
                          key={pid}
                          whileHover={{ backgroundColor: "rgba(99,102,241,0.05)" }}
                          onClick={() => openChat({ id: pid, name: person.name, model: person.model || (person.isAdmin ? "User" : "SubAdmin") })}
                          style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                          <div style={{ position: "relative", flexShrink: 0 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 12, background: person.isAdmin ? "rgba(99,102,241,0.12)" : "rgba(139,92,246,0.12)", border: `1px solid ${person.isAdmin ? "rgba(99,102,241,0.2)" : "rgba(139,92,246,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: person.isAdmin ? "#6366f1" : "#8b5cf6" }}>
                              {person.name?.[0]?.toUpperCase()}
                            </div>
                            <span style={{ position: "absolute", bottom: -1, right: -1, width: 10, height: 10, borderRadius: "50%", background: online ? "#22c55e" : "#cbd5e1", border: "2px solid #f8f9ff" }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{person.name}</span>
                              {lastMsg && <span style={{ fontSize: 10, color: "#94a3b8" }}>{fmtTime(lastMsg.createdAt)}</span>}
                            </div>
                            <p style={{ fontSize: 11.5, color: "#94a3b8", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {lastMsg ? lastMsg.text : (person.isAdmin ? "Admin" : person.email || "SubAdmin")}
                            </p>
                          </div>
                          {unread > 0 && (
                            <span style={{ minWidth: 18, height: 18, borderRadius: 99, background: "#6366f1", color: "#fff", fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", paddingInline: 4, flexShrink: 0 }}>
                              {unread > 9 ? "9+" : unread}
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}

                {screen === "chat" && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

                    {/* messages */}
                    <div className="fc-sa-scroll" style={{ flex: 1, overflowY: "auto", padding: "12px 12px 4px", display: "flex", flexDirection: "column", gap: 6, background: "#f8f9ff" }}>
                      {!histLoaded[activeOther?.id] ? (
                        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Loader2 size={20} className="animate-spin" style={{ color: "#6366f1" }} />
                        </div>
                      ) : msgs.length === 0 ? (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                          <MessageCircle size={28} style={{ color: "#c4cdd8" }} />
                          <p style={{ fontSize: 12, color: "#94a3b8" }}>No messages yet. Say hi! 👋</p>
                        </div>
                      ) : msgs.map((msg, i) => {
                        const isMine = msg.senderId?.toString() === me.id?.toString();
                        return (
                          <motion.div key={msg._id || msg._tempId || i}
                            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                            style={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start" }}>
                            <div style={{
                              maxWidth: "78%", padding: "8px 12px",
                              borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                              background: isMine ? "linear-gradient(135deg,#6366f1,#4f46e5)" : "#ffffff",
                              color: isMine ? "#fff" : "#1e293b",
                              fontSize: 13.5, lineHeight: 1.45, fontWeight: 500,
                              boxShadow: isMine ? "0 2px 8px rgba(99,102,241,0.25)" : "0 1px 4px rgba(0,0,0,0.06)",
                              border: !isMine ? "1px solid rgba(99,102,241,0.08)" : "none",
                              wordBreak: "break-word",
                            }}>
                              {msg.text}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 2, marginLeft: 4, marginRight: 4 }}>
                              <span style={{ fontSize: 10, color: "#94a3b8" }}>{fmtTime(msg.createdAt)}</span>
                              {isMine && (msg.seen
                                ? <CheckCheck size={11} style={{ color: "#6366f1" }} />
                                : <Check size={11} style={{ color: "#c4cdd8" }} />
                              )}
                            </div>
                          </motion.div>
                        );
                      })}

                      {isTyping(activeOther?.id) && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}>
                          <div style={{ padding: "10px 14px", borderRadius: "16px 16px 16px 4px", background: "#fff", border: "1px solid rgba(99,102,241,0.08)", display: "inline-flex", gap: 4, alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                            <span className="fc-sa-dot" />
                            <span className="fc-sa-dot" />
                            <span className="fc-sa-dot" />
                          </div>
                        </motion.div>
                      )}

                      <div ref={bottomRef} />
                    </div>

                    {/* input */}
                    <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(99,102,241,0.08)", display: "flex", gap: 8, alignItems: "flex-end", background: "#ffffff", flexShrink: 0 }}>
                      <textarea
                        ref={inputRef}
                        className="fc-sa-inp"
                        rows={1}
                        value={text}
                        onChange={handleInput}
                        onKeyDown={handleKey}
                        placeholder="Type a message…"
                        style={{ flex: 1, background: "#f8f9ff", border: "1.5px solid rgba(99,102,241,0.14)", borderRadius: 12, padding: "9px 12px", fontSize: 13, color: "#1e293b", maxHeight: 80, overflowY: "auto", fontFamily: "'DM Sans',sans-serif", lineHeight: 1.4, transition: "border-color .15s" }}
                        onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.4)"}
                        onBlur={e => e.target.style.borderColor = "rgba(99,102,241,0.14)"}
                      />
                      <motion.button
                        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
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

        {/* ── FIX 1: Draggable FAB — hidden while messenger is open ─────────── */}
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
              onMouseDown={(e) => {
                e.preventDefault();
                startDrag(e.clientX, e.clientY);
              }}
              onTouchStart={(e) => {
                startDrag(e.touches[0].clientX, e.touches[0].clientY);
              }}
              onClick={() => {
                if (!hasDragged.current) setOpen(true);
              }}
              style={{
                position: "fixed",
                bottom: fabPos.bottom,
                right: fabPos.right,
                zIndex: 1001,
                width: 52, height: 52,
                borderRadius: 16, border: "none",
                background: "linear-gradient(135deg,#6366f1,#4f46e5)",
                color: "#fff", cursor: "grab",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 6px 24px rgba(99,102,241,0.45)",
              }}>
              <MessageCircle size={22} />

              {/* Badge */}
              <AnimatePresence>
                {totalUnread > 0 && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    style={{ position: "absolute", top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 99, background: "#f43f5e", color: "#fff", fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", paddingInline: 4, border: "2px solid white" }}>
                    {totalUnread > 9 ? "9+" : totalUnread}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>,
    document.body
  );
}