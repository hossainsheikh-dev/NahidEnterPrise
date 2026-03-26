import { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, X, Send, Check, CheckCheck,
  ChevronLeft, Loader2,
} from "lucide-react";
import { useChatSocket } from "../hooks/useChatSocket";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function AdminFloatingChat({ me }) {
  const [open, setOpen] = useState(false);
  const [screen, setScreen] = useState("list");
  const [activeOther, setActive] = useState(null);
  const [subAdmins, setSubAdmins] = useState([]);
  const [loadingSA, setLoadingSA] = useState(false);
  const [text, setText] = useState("");
  const [histLoaded, setHistLoaded] = useState({});
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const typingDelay = useRef(null);

  const {
    isOnline, getMessages, isTyping, getUnread, totalUnread,
    loadHistory, sendMessage, sendTyping, markSeen,
  } = useChatSocket({ myId: me.id, myName: me.name, myRole: "admin", tokenKey: "token" });

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoadingSA(true);
      try {
        const res = await fetch(`${API}/api/subadmin`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        setSubAdmins(Array.isArray(data) ? data.filter(s => s.status === "approved") : []);
      } catch (e) { console.log(e); }
      finally { setLoadingSA(false); }
    })();
  }, [open]);

  useEffect(() => {
    if (activeOther && !histLoaded[activeOther.id]) {
      loadHistory(activeOther.id).then(() =>
        setHistLoaded(prev => ({ ...prev, [activeOther.id]: true }))
      );
    }
  }, [activeOther, histLoaded, loadHistory]);

  useEffect(() => {
    if (screen === "chat") bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [screen, activeOther, getMessages]);

  useEffect(() => {
    if (screen === "chat" && activeOther) markSeen(activeOther.id);
  }, [screen, activeOther, markSeen]);

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

  const fmtTime = (d) => new Date(d).toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" });
  const msgs = activeOther ? getMessages(activeOther.id) : [];

  // সরাসরি body-তে রেন্ডার করা হচ্ছে
  return ReactDOM.createPortal(
    <>
      {/* FAB - সবসময় visible থাকবে - with HIGH Z-INDEX */}
      <motion.button
        className="!fixed !bottom-6 !right-6 !w-[52px] !h-[52px] !rounded-2xl !border-0 !bg-gradient-to-br from-indigo-500 to-indigo-600 !text-white !cursor-pointer !flex !items-center !justify-center !shadow-[0_6px_24px_rgba(99,102,241,0.45)] !z-[2147483647]"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setOpen(!open)}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="x"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
            >
              <X size={22} />
            </motion.span>
          ) : (
            <motion.span
              key="message"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
            >
              <MessageCircle size={22} />
            </motion.span>
          )}
        </AnimatePresence>
        {!open && totalUnread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="!absolute !-top-1 !-right-1 !min-w-[18px] !h-[18px] !rounded-full !bg-rose-500 !text-white !text-[10px] !font-black !flex !items-center !justify-center !px-1 !border-2 !border-white !z-[2147483647]"
          >
            {totalUnread > 9 ? "9+" : totalUnread}
          </motion.span>
        )}
      </motion.button>

      {/* চ্যাট উইন্ডো - শুধু open হলে দেখাবে */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="!fixed !bottom-[88px] !right-6 !w-[340px] !h-[500px] !rounded-2xl !overflow-hidden !bg-slate-900 !border !border-white/10 !shadow-2xl !z-[2147483646] !flex !flex-col"
          >
            {/* বাকি কোড unchanged... */}
            
            {/* হেডার */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-3 flex items-center gap-2.5 flex-shrink-0 border-b border-white/10">
              {screen === "chat" && (
                <button 
                  onClick={() => setScreen("list")}
                  className="bg-white/10 border-0 rounded-lg w-7 h-7 flex items-center justify-center cursor-pointer text-slate-400 hover:text-slate-300 flex-shrink-0"
                >
                  <ChevronLeft size={15} />
                </button>
              )}
              <div className="flex-1 min-w-0">
                {screen === "list" ? (
                  <>
                    <p className="text-[13.5px] font-bold text-slate-100 m-0">Messages</p>
                    <p className="text-[11px] text-slate-600 m-0">{subAdmins.length} SubAdmins</p>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-[30px] h-[30px] rounded-lg bg-indigo-500/20 flex items-center justify-center text-xs font-extrabold text-indigo-400">
                        {activeOther?.name?.[0]?.toUpperCase()}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${isOnline(activeOther?.id) ? 'bg-green-500' : 'bg-slate-600'}`} />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-100 m-0">{activeOther?.name}</p>
                      <p className={`text-[10px] m-0 ${isTyping(activeOther?.id) ? 'text-indigo-400' : isOnline(activeOther?.id) ? 'text-green-500' : 'text-slate-600'}`}>
                        {isTyping(activeOther?.id) ? "typing…" : isOnline(activeOther?.id) ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setOpen(false)}
                className="bg-white/5 border-0 rounded-lg w-7 h-7 flex items-center justify-center cursor-pointer text-slate-500 hover:text-slate-400"
              >
                <X size={14} />
              </button>
            </div>

            {/* কন্টেন্ট */}
            <AnimatePresence mode="wait">
              {screen === "list" && (
                <motion.div 
                  key="list" 
                  initial={{ opacity: 0, x: -16 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -16 }}
                  className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-white/10"
                >
                  {loadingSA ? (
                    <div className="flex justify-center p-8">
                      <Loader2 size={20} className="animate-spin text-indigo-500" />
                    </div>
                  ) : subAdmins.length === 0 ? (
                    <p className="text-center text-[13px] text-slate-600 p-8">No SubAdmins yet</p>
                  ) : subAdmins.map(sa => {
                    const unread = getUnread(sa._id);
                    const online = isOnline(sa._id);
                    const lastMsg = getMessages(sa._id).slice(-1)[0];
                    return (
                      <motion.button 
                        key={sa._id} 
                        whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                        onClick={() => openChat(sa)}
                        className="w-full flex items-center gap-3 p-3 bg-transparent border-0 cursor-pointer text-left"
                      >
                        <div className="relative flex-shrink-0">
                          <div className="w-[38px] h-[38px] rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-sm font-extrabold text-indigo-400">
                            {sa.name[0].toUpperCase()}
                          </div>
                          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${online ? 'bg-green-500' : 'bg-slate-700'}`} />
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
                <motion.div 
                  key="chat" 
                  initial={{ opacity: 0, x: 16 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: 16 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <div className="flex-1 overflow-y-auto p-3 pb-1 flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-white/10">
                    {!histLoaded[activeOther?.id] ? (
                      <div className="flex-1 flex items-center justify-center">
                        <Loader2 size={20} className="animate-spin text-indigo-500" />
                      </div>
                    ) : msgs.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center gap-2">
                        <MessageCircle size={26} className="text-slate-800" />
                        <p className="text-xs text-slate-700">Say hi to {activeOther?.name}! 👋</p>
                      </div>
                    ) : msgs.map((msg, i) => {
                      const isMine = msg.senderId === me.id || msg.senderRole === "admin";
                      return (
                        <motion.div 
                          key={msg._id || msg._tempId || i}
                          initial={{ opacity: 0, y: 5 }} 
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                        >
                          <div className={`max-w-[78%] p-2 px-3 ${
                            isMine 
                              ? 'rounded-t-2xl rounded-l-2xl rounded-br-sm bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/30' 
                              : 'rounded-t-2xl rounded-r-2xl rounded-bl-sm bg-slate-800 text-slate-200 border border-white/10'
                          } text-[13.5px] leading-[1.45] font-medium break-words`}>
                            {msg.text}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5 mr-1 ml-1">
                            <span className="text-[10px] text-slate-700">{fmtTime(msg.createdAt)}</span>
                            {isMine && (msg.seen
                              ? <CheckCheck size={11} className="text-indigo-500" />
                              : <Check size={11} className="text-slate-700" />
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                    {isTyping(activeOther?.id) && (
                      <div className="flex">
                        <div className="p-2.5 px-3.5 rounded-t-2xl rounded-r-2xl rounded-bl-sm bg-slate-800 border border-white/10 flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-[pulse_1.2s_infinite]" style={{ animationDelay: '0s' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-[pulse_1.2s_infinite]" style={{ animationDelay: '0.2s' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-[pulse_1.2s_infinite]" style={{ animationDelay: '0.4s' }} />
                        </div>
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </div>
                  <div className="p-2.5 px-3 border-t border-white/10 flex gap-2 items-end bg-slate-900 flex-shrink-0">
                    <textarea 
                      ref={inputRef} 
                      rows={1}
                      value={text} 
                      onChange={handleInput} 
                      onKeyDown={handleKey}
                      placeholder="Type a message…"
                      className="flex-1 bg-slate-800 border border-white/10 rounded-xl p-2 px-3 text-[13px] text-slate-100 max-h-20 overflow-y-auto font-sans leading-[1.4] outline-none resize-none transition-all duration-150 focus:border-indigo-500/50 placeholder:text-slate-600"
                      onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.5)"}
                      onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                    />
                    <motion.button 
                      whileHover={{ scale: 1.08 }} 
                      whileTap={{ scale: 0.93 }}
                      onClick={handleSend} 
                      disabled={!text.trim()}
                      className={`w-[38px] h-[38px] rounded-xl border-0 flex items-center justify-center flex-shrink-0 transition-all duration-150 ${
                        text.trim() 
                          ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white cursor-pointer shadow-md shadow-indigo-500/35' 
                          : 'bg-indigo-500/10 text-slate-700 cursor-not-allowed'
                      }`}
                    >
                      <Send size={15} />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
}