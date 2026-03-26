import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, ShoppingCart, X, ChevronRight, CheckCircle, ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubLang } from "../context/SubAdminLangContext";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
const getToken = () => localStorage.getItem("subAdminToken") || "";

export default function SubAdminOrderBell() {
  const navigate = useNavigate();
  const { t } = useSubLang();

  const [count,    setCount]    = useState(0);
  const [open,     setOpen]     = useState(false);
  const [pulse,    setPulse]    = useState(false);
  const [approved, setApproved] = useState(false);
  const prevCount = useRef(0);
  const ref = useRef(null);

  /* ── fetch pending orders ── */
  useEffect(() => {
    const load = async () => {
      try {
        const res  = await fetch(`${API}/api/orders`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const orders = data.data || data || [];
        const n = Array.isArray(orders)
          ? orders.filter(o => o.status === "pending").length
          : 0;
        if (n > prevCount.current) {
          setPulse(true);
          setTimeout(() => setPulse(false), 1000);
        }
        prevCount.current = n;
        setCount(n);
      } catch (e) { console.log("OrderBell error:", e); }
    };
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  /* ── check approval notification ── */
  useEffect(() => {
    const info = JSON.parse(localStorage.getItem("subAdminInfo") || "{}");
    const key  = `sa_approved_notif_${info?._id}`;
    if (info?.status === "approved" && !localStorage.getItem(key)) {
      setApproved(true);
      setPulse(true);
      setTimeout(() => setPulse(false), 1000);
    }
  }, []);

  const dismissApproval = () => {
    const info = JSON.parse(localStorage.getItem("subAdminInfo") || "{}");
    const key  = `sa_approved_notif_${info?._id}`;
    localStorage.setItem(key, "1");
    setApproved(false);
  };

  /* ── outside click ── */
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const total = count + (approved ? 1 : 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        .ob-wrap { font-family: 'DM Sans', sans-serif; }
        @keyframes ob-bell {
          0%,100% { transform: rotate(0deg); }
          15%      { transform: rotate(14deg); }
          30%      { transform: rotate(-12deg); }
          45%      { transform: rotate(8deg); }
          60%      { transform: rotate(-6deg); }
          75%      { transform: rotate(3deg); }
        }
        .ob-bell { animation: ob-bell 0.7s ease-in-out; }
      `}</style>

      <div className="ob-wrap relative" ref={ref}>

        {/* ── trigger ── */}
        <button onClick={() => setOpen(o => !o)}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
          style={{
            background: open
              ? "rgba(99,102,241,0.12)"
              : total > 0 ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.05)",
            border: `1px solid ${open
              ? "rgba(99,102,241,0.30)"
              : total > 0 ? "rgba(99,102,241,0.18)" : "rgba(99,102,241,0.10)"}`,
            color: open || total > 0 ? "#6366f1" : "#94a3b8",
            boxShadow: open ? "0 0 0 3px rgba(99,102,241,0.10)" : "none",
          }}>

          {pulse && (
            <motion.div className="absolute inset-0 rounded-xl"
              initial={{ opacity:0.5, scale:1 }} animate={{ opacity:0, scale:1.9 }}
              transition={{ duration:0.8, ease:"easeOut" }}
              style={{ background:"rgba(99,102,241,0.20)", pointerEvents:"none" }}/>
          )}

          <Bell size={16} className={pulse ? "ob-bell" : ""}/>

          <AnimatePresence>
            {total > 0 && (
              <motion.span
                initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0, opacity:0 }}
                transition={{ type:"spring", stiffness:400, damping:20 }}
                className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[9px] font-black"
                style={{ background:"linear-gradient(135deg,#6366f1,#4f46e5)", color:"#fff", boxShadow:"0 2px 8px rgba(99,102,241,0.45)" }}>
                {total > 9 ? "9+" : total}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* ── dropdown ── */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity:0, y:8, scale:0.95 }}
              animate={{ opacity:1, y:0, scale:1 }}
              exit={{ opacity:0, y:8, scale:0.95 }}
              transition={{ type:"spring", stiffness:300, damping:28 }}
              className="absolute right-0 top-12 w-80 rounded-2xl overflow-hidden z-50"
              style={{
                background:"linear-gradient(160deg,#ffffff,#fafbff)",
                border:"1px solid rgba(99,102,241,0.12)",
                boxShadow:"0 20px 60px rgba(99,102,241,0.14), 0 4px 16px rgba(0,0,0,0.06)",
              }}>

              {/* top accent */}
              <div className="h-[2px] w-full"
                style={{ background:"linear-gradient(90deg,transparent,#6366f1,#8b5cf6,transparent)" }}/>

              {/* header */}
              <div className="flex items-center justify-between px-4 py-3.5"
                style={{ borderBottom:"1px solid rgba(99,102,241,0.08)" }}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{ background:"rgba(99,102,241,0.09)", border:"1px solid rgba(99,102,241,0.15)" }}>
                    <Bell size={12} style={{ color:"#6366f1" }}/>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color:"#94a3b8" }}>
                    {t("নটিফিকেশন","Notifications")}
                  </span>
                  {total > 0 && (
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                      style={{ background:"rgba(99,102,241,0.09)", color:"#6366f1" }}>
                      {total}
                    </span>
                  )}
                </div>
                <button onClick={() => setOpen(false)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
                  style={{ background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.10)", color:"#94a3b8" }}
                  onMouseEnter={e => { e.currentTarget.style.background="rgba(99,102,241,0.12)"; e.currentTarget.style.color="#6366f1"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="rgba(99,102,241,0.06)"; e.currentTarget.style.color="#94a3b8"; }}>
                  <X size={12}/>
                </button>
              </div>

              {/* body */}
              {total === 0 ? (
                <div className="px-4 py-8 text-center">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                    style={{ background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.18)" }}>
                    <CheckCircle size={20} style={{ color:"#10b981" }}/>
                  </div>
                  <p className="text-sm font-semibold" style={{ color:"#1e293b" }}>
                    {t("সব ঠিক আছে","All caught up")}
                  </p>
                  <p className="text-xs mt-1" style={{ color:"#94a3b8" }}>
                    {t("কোনো নতুন নটিফিকেশন নেই","No new notifications")}
                  </p>
                </div>
              ) : (
                <div>

                  {/* ── Approval notification ── */}
                  <AnimatePresence>
                    {approved && (
                      <motion.div
                        initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                        exit={{ opacity:0, x:-8 }} transition={{ delay:0.04 }}
                        className="flex items-start gap-3 px-4 py-4"
                        style={{ borderBottom: count > 0 ? "1px solid rgba(99,102,241,0.06)" : "none", background:"rgba(16,185,129,0.03)" }}>

                        <div className="relative w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background:"rgba(16,185,129,0.12)", border:"1px solid rgba(16,185,129,0.22)" }}>
                          <ShieldCheck size={18} style={{ color:"#10b981" }}/>
                          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                            style={{ background:"#10b981" }}>
                            <motion.span className="absolute inset-0 rounded-full"
                              animate={{ scale:[1, 2.2], opacity:[0.7, 0] }}
                              transition={{ duration:1.5, repeat:Infinity }}
                              style={{ background:"#10b981" }}/>
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold" style={{ color:"#1e293b" }}>
                            🎉 {t("অ্যাকাউন্ট অনুমোদিত!","Account Approved!")}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color:"#94a3b8" }}>
                            {t("অ্যাডমিন আপনার অ্যাকাউন্ট পরিবর্তন ও অনুমোদন করেছেন। স্বাগতম!","Admin has approved your account. Welcome!")}
                          </p>
                        </div>

                        <button onClick={dismissApproval}
                          className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-md transition-all"
                          style={{ background:"rgba(99,102,241,0.06)", color:"#94a3b8" }}
                          onMouseEnter={e => e.currentTarget.style.color="#6366f1"}
                          onMouseLeave={e => e.currentTarget.style.color="#94a3b8"}>
                          <X size={11}/>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── Orders notification ── */}
                  {count > 0 && (
                    <motion.button
                      initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                      transition={{ delay:0.05 }}
                      onClick={() => { navigate("/subadmin/orders"); setOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-4 text-left transition-all group"
                      style={{ background:"transparent" }}
                      onMouseEnter={e => e.currentTarget.style.background="rgba(99,102,241,0.04)"}
                      onMouseLeave={e => e.currentTarget.style.background="transparent"}>

                      <div className="relative w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background:"rgba(99,102,241,0.10)", border:"1px solid rgba(99,102,241,0.20)" }}>
                        <ShoppingCart size={18} style={{ color:"#6366f1" }}/>
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                          style={{ background:"#6366f1" }}>
                          <motion.span className="absolute inset-0 rounded-full"
                            animate={{ scale:[1, 2.2], opacity:[0.7, 0] }}
                            transition={{ duration:1.5, repeat:Infinity }}
                            style={{ background:"#6366f1" }}/>
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold" style={{ color:"#1e293b" }}>
                          <span style={{ color:"#6366f1" }}>{count}</span>
                          {" "}{t("টি নতুন অর্ডার অপেক্ষমাণ","new orders pending")}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color:"#94a3b8" }}>
                          {t("অর্ডার পরিচালনা করতে ক্লিক করুন","Click to manage orders")}
                        </p>
                      </div>

                      <ChevronRight size={14} style={{ color:"#c4cdd8" }}
                        className="flex-shrink-0 group-hover:translate-x-0.5 transition-transform"/>
                    </motion.button>
                  )}
                </div>
              )}

              {/* footer */}
              <div className="px-4 py-2.5 flex items-center justify-between"
                style={{ borderTop:"1px solid rgba(99,102,241,0.07)" }}>
                <span className="text-[10px] font-medium" style={{ color:"#c4cdd8" }}>
                  {t("প্রতি ৩০ সেকেন্ডে আপডেট","Updates every 30s")}
                </span>
                <span className="flex items-center gap-1.5">
                  <motion.span className="w-1.5 h-1.5 rounded-full"
                    animate={{ opacity:[1, 0.3, 1] }} transition={{ duration:2, repeat:Infinity }}
                    style={{ background:"#10b981" }}/>
                  <span className="text-[10px] font-semibold" style={{ color:"#10b981" }}>live</span>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}