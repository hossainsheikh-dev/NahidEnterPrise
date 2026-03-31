import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ShieldCheck, X, ChevronRight, CheckCircle, ShoppingCart, UserCog } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminLang } from "../context/AdminLangContext";

const API = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;
const getToken = () => localStorage.getItem("token") || "";

export default function SubAdminBell() {
  const navigate = useNavigate();
  const { t } = useAdminLang();

  const [subAdminCount,    setSubAdminCount]    = useState(0);
  const [orderCount,       setOrderCount]       = useState(0);
  const [changeReqCount,   setChangeReqCount]   = useState(0);
  const [open,             setOpen]             = useState(false);
  const [pulse,            setPulse]            = useState(false);

  const prevSubAdmin   = useRef(0);
  const prevOrder      = useRef(0);
  const prevChangeReq  = useRef(0);
  const ref            = useRef(null);

  const total = subAdminCount + orderCount + changeReqCount;

  useEffect(() => {
    const load = async () => {
      try {
        /* ── SubAdmin pending registrations ── */
        const r1 = await fetch(`${API}/api/subadmin/pending-count`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (r1.ok) {
          const d1 = await r1.json();
          const n = d1.count || 0;
          if (n > prevSubAdmin.current) { setPulse(true); setTimeout(() => setPulse(false), 1000); }
          prevSubAdmin.current = n;
          setSubAdminCount(n);
        }

        /* ── Pending orders ── */
        const r2 = await fetch(`${API}/api/orders`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (r2.ok) {
          const d2 = await r2.json();
          const orders = d2.data || d2 || [];
          const n = Array.isArray(orders) ? orders.filter(o => o.status === "pending").length : 0;
          if (n > prevOrder.current) { setPulse(true); setTimeout(() => setPulse(false), 1000); }
          prevOrder.current = n;
          setOrderCount(n);
        }

        /* ── Profile change requests ── */
        const r3 = await fetch(`${API}/api/subadmin/change-requests/count`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (r3.ok) {
          const d3 = await r3.json();
          const n = d3.count || 0;
          if (n > prevChangeReq.current) { setPulse(true); setTimeout(() => setPulse(false), 1000); }
          prevChangeReq.current = n;
          setChangeReqCount(n);
        }
      } catch (err) { console.log("bell error:", err); }
    };
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const items = [
    subAdminCount > 0 && {
      icon: ShieldCheck,
      count: subAdminCount,
      label: `${subAdminCount} ${t("সাব-অ্যাডমিন রিকোয়েস্ট","SubAdmin request")} ${t("অপেক্ষমাণ","pending")}`,
      sub:   t("পর্যালোচনা ও অনুমোদন করতে ক্লিক করুন","Click to review and approve"),
      dot:   "#a78bfa", dotBorder:"#0f172a",
      bg:    "rgba(196,181,253,0.15)", border:"rgba(196,181,253,0.3)", color:"#c4b5fd",
      route: "/admin/subadmins",
    },
    changeReqCount > 0 && {
      icon: UserCog,
      count: changeReqCount,
      label: `${changeReqCount} ${t("প্রোফাইল পরিবর্তনের অনুরোধ","profile change request")}`,
      sub:   t("ইমেইল/ফোন পরিবর্তনের অনুরোধ অপেক্ষমাণ","Email/phone change requests pending"),
      dot:   "#38bdf8", dotBorder:"#0f172a",
      bg:    "rgba(56,189,248,0.12)", border:"rgba(56,189,248,0.28)", color:"#38bdf8",
      route: "/admin/subadmins",
    },
    orderCount > 0 && {
      icon: ShoppingCart,
      count: orderCount,
      label: `${orderCount} ${t("টি নতুন অর্ডার","new orders")} ${t("অপেক্ষমাণ","pending")}`,
      sub:   t("অর্ডার পরিচালনা করতে ক্লিক করুন","Click to manage orders"),
      dot:   "#fb923c", dotBorder:"#0f172a",
      bg:    "rgba(251,146,60,0.15)", border:"rgba(251,146,60,0.3)", color:"#fb923c",
      route: "/admin/orders",
    },
  ].filter(Boolean);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        .bell-wrap { font-family: 'DM Sans', sans-serif; }
        @keyframes bell-ring {
          0%,100% { transform: rotate(0deg); }
          15%      { transform: rotate(14deg); }
          30%      { transform: rotate(-12deg); }
          45%      { transform: rotate(8deg); }
          60%      { transform: rotate(-6deg); }
          75%      { transform: rotate(3deg); }
        }
        .bell-ring { animation: bell-ring 0.7s ease-in-out; }

        .bell-dropdown {
          position: absolute;
          right: 0;
          top: 3rem;
          width: 20rem;
        }
        @media (max-width: 640px) {
          .bell-dropdown {
            position: fixed;
            left: 50%;
            right: auto;
            top: 4rem;
            transform: translateX(-50%);
            width: calc(100vw - 24px);
            max-width: 20rem;
          }
        }
      `}</style>

      <div className="bell-wrap relative" ref={ref}>

        {/* ── trigger ── */}
        <button onClick={() => setOpen(o => !o)}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
          style={{
            background: open ? "rgba(196,181,253,0.15)" : total > 0 ? "rgba(196,181,253,0.1)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${open ? "rgba(196,181,253,0.35)" : total > 0 ? "rgba(196,181,253,0.2)" : "rgba(255,255,255,0.1)"}`,
            color: open || total > 0 ? "#c4b5fd" : "#94a3b8",
            boxShadow: open ? "0 0 0 3px rgba(196,181,253,0.12)" : "none",
          }}>
          {pulse && (
            <motion.div className="absolute inset-0 rounded-xl"
              initial={{ opacity:0.5, scale:1 }} animate={{ opacity:0, scale:1.8 }}
              transition={{ duration:0.8, ease:"easeOut" }}
              style={{ background:"rgba(196,181,253,0.3)", pointerEvents:"none" }}/>
          )}
          <Bell size={16} className={pulse ? "bell-ring" : ""}/>
          <AnimatePresence>
            {total > 0 && (
              <motion.span
                initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0, opacity:0 }}
                transition={{ type:"spring", stiffness:400, damping:20 }}
                className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[9px] font-black"
                style={{ background:"linear-gradient(135deg,#c4b5fd,#a78bfa)", color:"#1e1b4b", boxShadow:"0 2px 8px rgba(167,139,250,0.5)" }}>
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
              className="bell-dropdown rounded-2xl overflow-hidden z-50"
              style={{ background:"#0f172a", border:"1px solid rgba(255,255,255,0.12)", boxShadow:"0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(196,181,253,0.08)" }}>

              {/* top accent */}
              <div className="h-px w-full" style={{ background:"linear-gradient(90deg,transparent,rgba(196,181,253,0.7),transparent)" }}/>

              {/* header */}
              <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background:"rgba(196,181,253,0.15)" }}>
                    <Bell size={12} style={{ color:"#c4b5fd" }}/>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color:"#94a3b8" }}>
                    {t("নটিফিকেশন","Notifications")}
                  </span>
                  {total > 0 && (
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full" style={{ background:"rgba(196,181,253,0.15)", color:"#c4b5fd" }}>
                      {total}
                    </span>
                  )}
                </div>
                <button onClick={() => setOpen(false)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center transition"
                  style={{ background:"rgba(255,255,255,0.06)", color:"#94a3b8" }}
                  onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.12)"; e.currentTarget.style.color="#e2e8f0"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.06)"; e.currentTarget.style.color="#94a3b8"; }}>
                  <X size={12}/>
                </button>
              </div>

              {/* body */}
              {total === 0 ? (
                <div className="px-4 py-8 text-center">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                    style={{ background:"rgba(52,211,153,0.12)", border:"1px solid rgba(52,211,153,0.25)" }}>
                    <CheckCircle size={20} style={{ color:"#6ee7b7" }}/>
                  </div>
                  <p className="text-sm font-semibold" style={{ color:"#cbd5e1" }}>{t("সব ঠিক আছে","All caught up")}</p>
                  <p className="text-xs mt-1" style={{ color:"#64748b" }}>{t("কোনো নতুন নটিফিকেশন নেই","No new notifications")}</p>
                </div>
              ) : (
                <div>
                  {items.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <motion.button key={idx}
                        initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                        transition={{ delay: idx * 0.06 }}
                        onClick={() => { navigate(item.route); setOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-4 text-left transition-all group"
                        style={{ background:"transparent", borderBottom: idx < items.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}
                        onMouseEnter={e => e.currentTarget.style.background="rgba(196,181,253,0.07)"}
                        onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                        <div className="relative w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background:item.bg, border:`1px solid ${item.border}` }}>
                          <Icon size={18} style={{ color:item.color }}/>
                          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                            style={{ background:item.dot, borderColor:item.dotBorder }}>
                            <motion.span className="absolute inset-0 rounded-full"
                              animate={{ scale:[1, 2.2], opacity:[0.7, 0] }}
                              transition={{ duration:1.5, repeat:Infinity }}
                              style={{ background:item.dot }}/>
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold" style={{ color:"#f1f5f9" }}>{item.label}</p>
                          <p className="text-xs mt-0.5" style={{ color:"#94a3b8" }}>{item.sub}</p>
                        </div>
                        <ChevronRight size={14} style={{ color:"#64748b" }}
                          className="flex-shrink-0 group-hover:translate-x-0.5 transition-transform"/>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* footer */}
              <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderTop:"1px solid rgba(255,255,255,0.07)" }}>
                <span className="text-[10px] font-medium" style={{ color:"#64748b" }}>
                  {t("প্রতি ৩০ সেকেন্ডে আপডেট","Updates every 30s")}
                </span>
                <span className="flex items-center gap-1.5">
                  <motion.span className="w-1.5 h-1.5 rounded-full"
                    animate={{ opacity:[1, 0.3, 1] }} transition={{ duration:2, repeat:Infinity }}
                    style={{ background:"#34d399" }}/>
                  <span className="text-[10px] font-semibold" style={{ color:"#6ee7b7" }}>live</span>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}