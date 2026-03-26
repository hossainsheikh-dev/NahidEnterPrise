import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, CheckCircle, XCircle, Package, Link2, Layers,
  Users, TrendingUp, AlertCircle, RefreshCw, ArrowUpRight,
  Clock, Zap, BarChart2, Activity, Truck, Star,
  ArrowRight, Flame, Target,
} from "lucide-react";
import { useAdminLang } from "../../context/AdminLangContext";

const API = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;

const getToken = () =>
  localStorage.getItem("adminToken") ||
  localStorage.getItem("token") ||
  document.cookie.split(";").find(c => c.trim().startsWith("token="))?.split("=")[1] || "";

const safeArray = (v) =>
  Array.isArray(v) ? v :
  Array.isArray(v?.orders)   ? v.orders   :
  Array.isArray(v?.products) ? v.products :
  Array.isArray(v?.links)    ? v.links    :
  Array.isArray(v?.data)     ? v.data     : [];

/* ── animated counter ── */
function Counter({ value, prefix = "", suffix = "" }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const target = Number(value) || 0;
    const diff   = target - prev.current;
    if (diff === 0) return;
    const steps  = 40;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setDisplay(Math.round(prev.current + (diff * (step / steps))));
      if (step >= steps) { clearInterval(timer); prev.current = target; }
    }, 18);
    return () => clearInterval(timer);
  }, [value]);
  return <>{prefix}{display.toLocaleString("en-IN")}{suffix}</>;
}

/* ══════════════════════════════════
   REVENUE HERO
══════════════════════════════════ */
function RevenueHero({ value, loading, t, stats }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(n => n + 1), 3000);
    return () => clearInterval(id);
  }, []);

  const deliveryRate = stats?.totalOrders > 0
    ? Math.round((stats.successOrders / stats.totalOrders) * 100) : 0;

  const bars = [28, 52, 38, 74, 46, 85, 62, 100, 78, 91, 68, 95];

  return (
    <motion.div
      initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
      transition={{ delay:0.04, type:"spring", stiffness:160, damping:22 }}
      className="relative overflow-hidden rounded-3xl col-span-2 md:col-span-3 xl:col-span-4"
      style={{
        background: "linear-gradient(145deg,#07050f 0%,#11092b 35%,#0d1a2e 65%,#050d1a 100%)",
        boxShadow: "0 24px 80px rgba(6,4,14,0.65), inset 0 1px 0 rgba(255,255,255,0.06)",
        minHeight: 200,
      }}>

      {/* grain */}
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none" style={{
        backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize:"128px 128px",
      }}/>
      {/* grid */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
        backgroundImage:"linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)",
        backgroundSize:"40px 40px",
      }}/>
      {/* orbs */}
      <div className="absolute pointer-events-none" style={{ top:"-80px", right:"-60px", width:"340px", height:"340px", background:"radial-gradient(circle,rgba(139,92,246,0.18) 0%,transparent 70%)", borderRadius:"50%" }}/>
      <div className="absolute pointer-events-none" style={{ bottom:"-60px", left:"-40px", width:"280px", height:"280px", background:"radial-gradient(circle,rgba(201,168,76,0.14) 0%,transparent 70%)", borderRadius:"50%" }}/>
      {/* top line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background:"linear-gradient(90deg,transparent,rgba(139,92,246,0.8) 30%,rgba(201,168,76,0.8) 70%,transparent)" }}/>

      {/* pulse rings */}
      <div className="absolute top-5 right-5 pointer-events-none">
        {[0,1,2].map(i => (
          <motion.div key={`${tick}-${i}`} className="absolute rounded-full border"
            style={{ width:44+i*28, height:44+i*28, top:-(i*14), left:-(i*14), borderColor:`rgba(201,168,76,${0.22-i*0.06})` }}
            initial={{ opacity:0.6, scale:0.92 }} animate={{ opacity:0, scale:1.35 }}
            transition={{ duration:1.8, delay:i*0.35, ease:"easeOut" }}/>
        ))}
        <div className="relative w-11 h-11 rounded-full flex items-center justify-center"
          style={{ background:"linear-gradient(135deg,rgba(201,168,76,0.25),rgba(139,92,246,0.2))", border:"1px solid rgba(201,168,76,0.4)", boxShadow:"0 0 18px rgba(201,168,76,0.25)" }}>
          <Flame size={16} style={{ color:"#c9a84c" }}/>
        </div>
      </div>

      <div className="relative z-10 p-6 sm:p-8">
        {/* label */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background:"rgba(201,168,76,0.12)", border:"1px solid rgba(201,168,76,0.25)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:"#c9a84c" }}/>
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color:"#c9a84c" }}>
              {t("লাইভ","Live")}
            </span>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color:"rgba(255,255,255,0.3)" }}>
            {t("মোট রেভিনিউ","Total Revenue")}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            {loading ? (
              <div className="h-14 w-56 rounded-2xl animate-pulse" style={{ background:"rgba(255,255,255,0.07)" }}/>
            ) : (
              <motion.p key={value} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                transition={{ type:"spring", stiffness:200, damping:20 }}
                className="font-black leading-none"
                style={{ fontSize:"clamp(2.4rem,6vw,4rem)", color:"#fff", letterSpacing:"-0.04em", textShadow:"0 0 40px rgba(201,168,76,0.35)" }}>
                ৳<Counter value={value||0}/>
              </motion.p>
            )}
            <p className="text-xs mt-2.5 flex items-center gap-1.5" style={{ color:"rgba(255,255,255,0.28)" }}>
              <CheckCircle size={10} style={{ color:"#34d399" }}/>
              {t("শুধুমাত্র ডেলিভার্ড ও কনফার্মড অর্ডার","Delivered & confirmed orders only")}
            </p>
          </div>

          {/* sparkline */}
          <div className="flex items-end gap-1 h-14 flex-shrink-0">
            {bars.map((h, i) => (
              <motion.div key={i} className="rounded-t-sm"
                initial={{ height:0, opacity:0 }} animate={{ height:`${h}%`, opacity:1 }}
                transition={{ delay:0.25+i*0.04, type:"spring", stiffness:200, damping:18 }}
                style={{
                  width:"clamp(6px,1vw,10px)", alignSelf:"flex-end",
                  background: i>=9 ? "linear-gradient(180deg,#c9a84c,#e8c876)"
                    : i>=6 ? "rgba(139,92,246,0.55)" : "rgba(255,255,255,0.12)",
                  boxShadow: i>=9 ? "0 0 8px rgba(201,168,76,0.5)" : "none",
                }}/>
            ))}
          </div>
        </div>

        {/* bottom strip */}
        <div className="mt-5 pt-4 grid grid-cols-3 gap-3" style={{ borderTop:"1px solid rgba(255,255,255,0.06)" }}>
          {[
            { label:t("মোট অর্ডার","Total Orders"), val:stats?.totalOrders||0,   icon:ShoppingBag, color:"#e8a427" },
            { label:t("ডেলিভার্ড","Delivered"),     val:stats?.successOrders||0, icon:CheckCircle, color:"#34d399" },
            { label:t("সাফল্যের হার","Success Rate"), val:`${deliveryRate}%`,     icon:TrendingUp,  color:"#a78bfa" },
          ].map(({ label, val, icon:Icon, color }, i) => (
            <motion.div key={label} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:0.5+i*0.08 }} className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <Icon size={11} style={{ color }}/>
                <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color:"rgba(255,255,255,0.28)" }}>{label}</span>
              </div>
              {loading ? (
                <div className="h-5 w-12 rounded animate-pulse" style={{ background:"rgba(255,255,255,0.07)" }}/>
              ) : (
                <p className="text-base sm:text-lg font-black leading-none" style={{ color, textShadow:`0 0 16px ${color}55` }}>
                  {typeof val === "number" ? <Counter value={val}/> : val}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════
   STAT CARD — dark premium
══════════════════════════════════ */
function StatCard({ card, value, loading, index }) {
  const Icon = card.icon;
  const ac = {
    numColor: card.accentColor,
    iconBg:   `linear-gradient(135deg,${card.accentColor},${card.accentDark})`,
    iconShadow: `${card.accentColor}40`,
    border: `${card.accentColor}20`,
    bg: `${card.accentColor}08`,
  };

  return (
    <motion.div
      initial={{ opacity:0, y:18, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
      transition={{ delay:0.08+index*0.05, type:"spring", stiffness:200, damping:22 }}
      whileHover={{ y:-3, transition:{ duration:0.18 } }}
      className="group relative overflow-hidden rounded-2xl cursor-default"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${ac.border}`,
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
      }}>

      {/* top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background:`linear-gradient(90deg,transparent,${card.accentColor}60,transparent)` }}/>

      {/* hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background:`radial-gradient(ellipse at 50% 0%,${card.accentColor}10 0%,transparent 65%)` }}/>

      <div className="relative p-4 sm:p-5">
        <div className="flex items-start justify-between mb-3">
          <motion.div whileHover={{ scale:1.1, rotate:5 }} transition={{ type:"spring", stiffness:320 }}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background:ac.iconBg, boxShadow:`0 4px 14px ${ac.iconShadow}` }}>
            <Icon size={17} color="#fff"/>
          </motion.div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full"
            style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
            <motion.div animate={{ opacity:[1,0.3,1] }} transition={{ duration:2, repeat:Infinity }}
              className="w-1.5 h-1.5 rounded-full" style={{ background:card.accentColor }}/>
            <span className="text-[9px] font-black uppercase tracking-widest hidden sm:block" style={{ color:card.accentColor }}>live</span>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            <div className="h-8 w-14 rounded-lg animate-pulse" style={{ background:"rgba(255,255,255,0.07)" }}/>
            <div className="h-3 w-20 rounded animate-pulse" style={{ background:"rgba(255,255,255,0.04)" }}/>
          </div>
        ) : (
          <>
            <motion.p key={value} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
              transition={{ type:"spring", stiffness:240, damping:20 }}
              className="font-black leading-none mb-1"
              style={{ fontSize:"clamp(1.65rem,3vw,2.2rem)", color:ac.numColor, letterSpacing:"-0.03em" }}>
              {card.isCurrency ? <>৳<Counter value={value||0}/></> : <Counter value={value||0}/>}
            </motion.p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[10px] sm:text-[11px] font-semibold truncate pr-1" style={{ color:"#64748b" }}>
                {card.label}
              </p>
              <ArrowUpRight size={12} style={{ color:ac.numColor }} className="opacity-0 group-hover:opacity-70 transition-opacity"/>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════
   ORDER BREAKDOWN
══════════════════════════════════ */
function OrderBreakdown({ stats, loading, t }) {
  if (loading || !stats.totalOrders) return null;
  const pending = stats.totalOrders - stats.successOrders - stats.cancelledOrders;
  const rows = [
    { label:t("ডেলিভার্ড","Delivered"), val:stats.successOrders,  pct:Math.round((stats.successOrders/stats.totalOrders)*100),  color:"#34d399", bg:"rgba(52,211,153,0.08)",  icon:CheckCircle },
    { label:t("বাকি","Pending"),         val:pending,               pct:Math.round((pending/stats.totalOrders)*100),              color:"#e8a427", bg:"rgba(232,164,39,0.08)",  icon:Clock       },
    { label:t("বাতিল","Cancelled"),      val:stats.cancelledOrders, pct:Math.round((stats.cancelledOrders/stats.totalOrders)*100),color:"#f87171", bg:"rgba(248,113,113,0.08)", icon:XCircle     },
  ];

  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}
      className="rounded-2xl overflow-hidden"
      style={{ background:"#0d1426", border:"1px solid rgba(255,255,255,0.07)", boxShadow:"0 8px 32px rgba(0,0,0,0.3)" }}>

      <div className="px-5 sm:px-6 pt-5 pb-4 flex items-center justify-between"
        style={{ borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background:"rgba(129,140,248,0.1)", border:"1px solid rgba(129,140,248,0.15)" }}>
            <BarChart2 size={14} style={{ color:"#818cf8" }}/>
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color:"#f1f5f9" }}>{t("অর্ডার ব্রেকডাউন","Order Breakdown")}</p>
            <p className="text-[10px]" style={{ color:"#475569" }}>{stats.totalOrders} {t("টি মোট","total orders")}</p>
          </div>
        </div>
        <Link to="/admin/orders"
          className="text-[10px] font-bold flex items-center gap-1 px-3 py-1.5 rounded-xl transition"
          style={{ background:"rgba(129,140,248,0.08)", color:"#818cf8" }}>
          {t("সব দেখুন","View All")} <ArrowRight size={10}/>
        </Link>
      </div>

      <div className="p-5 sm:p-6">
        {/* stacked bar */}
        <div className="flex h-2 rounded-full overflow-hidden gap-0.5 mb-5"
          style={{ background:"rgba(255,255,255,0.05)" }}>
          {[
            { val:stats.successOrders, color:"#34d399" },
            { val:pending,             color:"#e8a427" },
            { val:stats.cancelledOrders, color:"#f87171" },
          ].map(({ val, color }, i) => {
            const pct = (val / stats.totalOrders) * 100;
            return pct > 0 ? (
              <motion.div key={i} className="h-full rounded-full"
                initial={{ width:0 }} animate={{ width:`${pct}%` }}
                transition={{ delay:0.4+i*0.1, duration:0.7, ease:"easeOut" }}
                style={{ background:color }}/>
            ) : null;
          })}
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {rows.map(({ label, val, pct, color, bg, icon:Icon }) => (
            <div key={label} className="rounded-xl p-3 sm:p-4 text-center" style={{ background:bg, border:`1px solid ${color}15` }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-2"
                style={{ background:`${color}18` }}>
                <Icon size={13} style={{ color }}/>
              </div>
              <p className="text-xl sm:text-2xl font-black leading-none" style={{ color }}>{val}</p>
              <p className="text-[9px] sm:text-[10px] font-bold mt-1" style={{ color:"#64748b" }}>{label}</p>
              <div className="mt-1.5 flex items-center justify-center gap-1">
                <div className="h-1 rounded-full flex-1" style={{ background:`${color}18`, maxWidth:40 }}>
                  <motion.div className="h-full rounded-full" style={{ background:color }}
                    initial={{ width:0 }} animate={{ width:`${pct}%` }}
                    transition={{ delay:0.6, duration:0.6 }}/>
                </div>
                <span className="text-[9px] font-black" style={{ color }}>{pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════
   RECENT ORDERS
══════════════════════════════════ */
function RecentOrders({ orders, loading, t }) {
  const STATUS = {
    pending:    { label:t("অপেক্ষা","Pending"),   color:"#e8a427", bg:"rgba(232,164,39,0.1)"  },
    processing: { label:t("প্যাকেজিং","Packing"), color:"#a78bfa", bg:"rgba(167,139,250,0.1)" },
    shipped:    { label:t("পথে","Shipped"),        color:"#60a5fa", bg:"rgba(96,165,250,0.1)"  },
    confirmed:  { label:t("নিশ্চিত","Confirmed"), color:"#38bdf8", bg:"rgba(56,189,248,0.1)"  },
    delivered:  { label:t("পৌঁছেছে","Delivered"), color:"#34d399", bg:"rgba(52,211,153,0.1)"  },
    cancelled:  { label:t("বাতিল","Cancelled"),   color:"#f87171", bg:"rgba(248,113,113,0.1)" },
  };
  const recent = orders.slice(0, 3);

  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
      className="rounded-2xl overflow-hidden"
      style={{ background:"#0d1426", border:"1px solid rgba(255,255,255,0.07)", boxShadow:"0 8px 32px rgba(0,0,0,0.3)" }}>

      <div className="px-5 sm:px-6 pt-5 pb-4 flex items-center justify-between"
        style={{ borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background:"rgba(232,164,39,0.1)", border:"1px solid rgba(232,164,39,0.15)" }}>
            <Activity size={14} style={{ color:"#e8a427" }}/>
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color:"#f1f5f9" }}>{t("সাম্প্রতিক অর্ডার","Recent Orders")}</p>
            <p className="text-[10px]" style={{ color:"#475569" }}>{t("সর্বশেষ ৩টি","Latest 3 orders")}</p>
          </div>
        </div>
        <Link to="/admin/delivery"
          className="text-[10px] font-bold flex items-center gap-1 px-3 py-1.5 rounded-xl transition"
          style={{ background:"rgba(232,164,39,0.08)", color:"#e8a427" }}>
          {t("সব দেখুন","View All")} <ArrowRight size={10}/>
        </Link>
      </div>

      <div style={{ borderTop:"none" }}>
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 sm:px-6 py-3.5"
              style={{ borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
              <div className="w-8 h-8 rounded-xl animate-pulse" style={{ background:"rgba(255,255,255,0.06)" }}/>
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-28 rounded animate-pulse" style={{ background:"rgba(255,255,255,0.06)" }}/>
                <div className="h-2.5 w-20 rounded animate-pulse" style={{ background:"rgba(255,255,255,0.04)" }}/>
              </div>
              <div className="h-3 w-16 rounded animate-pulse" style={{ background:"rgba(255,255,255,0.06)" }}/>
            </div>
          ))
        ) : recent.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <ShoppingBag size={24} style={{ color:"#1e293b" }} className="mx-auto mb-2"/>
            <p className="text-xs" style={{ color:"#475569" }}>{t("কোনো অর্ডার নেই","No orders yet")}</p>
          </div>
        ) : recent.map((order, i) => {
          const st = STATUS[order.status] || STATUS.pending;
          return (
            <motion.div key={order._id || i}
              initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
              transition={{ delay:0.35+i*0.04 }}
              className="flex items-center gap-3 px-5 sm:px-6 py-3.5 transition-colors"
              style={{ borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.025)"}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black"
                style={{ background:"rgba(201,168,76,0.1)", color:"#c9a84c", border:"1px solid rgba(201,168,76,0.15)" }}>
                {(order.customer?.name||"?")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color:"#e2e8f0" }}>{order.customer?.name||"—"}</p>
                <p className="text-[10px]" style={{ color:"#475569" }}>{order.orderId}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-black" style={{ color:"#c9a84c" }}>৳{(order.total||0).toLocaleString()}</p>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background:st.bg, color:st.color }}>{st.label}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════
   PERFORMANCE SUMMARY
══════════════════════════════════ */
function PerformanceSummary({ stats, loading, t }) {
  const deliveryRate = stats.totalOrders > 0
    ? Math.round((stats.successOrders/stats.totalOrders)*100) : 0;
  const cancelRate = stats.totalOrders > 0
    ? Math.round((stats.cancelledOrders/stats.totalOrders)*100) : 0;

  const metrics = [
    { label:t("ডেলিভারি রেট","Delivery Rate"),   val:`${deliveryRate}%`,        color:"#34d399", icon:Target,  sub:t("সফল ডেলিভারি","Successful deliveries") },
    { label:t("বাতিল রেট","Cancel Rate"),          val:`${cancelRate}%`,          color:"#f87171", icon:XCircle, sub:t("বাতিলকৃত অর্ডার","Cancelled orders")    },
    { label:t("মোট কাস্টমার","Unique Customers"), val:stats.totalCustomers||0,   color:"#818cf8", icon:Users,   sub:t("ফোন নম্বর অনুযায়ী","By phone number")   },
    { label:t("পণ্য সংখ্যা","Products"),           val:stats.totalProducts||0,    color:"#38bdf8", icon:Package, sub:t("স্টোরে মোট পণ্য","Items in store")       },
  ];

  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.28 }}
      className="rounded-2xl overflow-hidden"
      style={{ background:"#0d1426", border:"1px solid rgba(255,255,255,0.07)", boxShadow:"0 8px 32px rgba(0,0,0,0.3)" }}>

      <div className="px-5 sm:px-6 pt-5 pb-4 flex items-center gap-2.5"
        style={{ borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.15)" }}>
          <Star size={14} style={{ color:"#34d399" }}/>
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color:"#f1f5f9" }}>{t("পারফরম্যান্স","Performance")}</p>
          <p className="text-[10px]" style={{ color:"#475569" }}>{t("স্টোর মেট্রিক্স","Store metrics")}</p>
        </div>
      </div>

      <div className="p-5 sm:p-6 grid grid-cols-2 gap-3">
        {metrics.map(({ label, val, color, icon:Icon, sub }, i) => (
          <motion.div key={label}
            initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
            transition={{ delay:0.35+i*0.05 }}
            className="rounded-xl p-3 sm:p-4"
            style={{ background:`${color}08`, border:`1px solid ${color}15` }}>
            <div className="flex items-center justify-between mb-2">
              <Icon size={13} style={{ color }}/>
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color, opacity:0.5 }}>
                {t("লাইভ","live")}
              </span>
            </div>
            {loading ? (
              <div className="h-7 w-14 rounded-lg animate-pulse" style={{ background:`${color}15` }}/>
            ) : (
              <>
                <p className="text-xl sm:text-2xl font-black leading-none" style={{ color }}>
                  {typeof val === "number" ? <Counter value={val}/> : val}
                </p>
                <p className="text-[9px] sm:text-[10px] font-semibold mt-1" style={{ color:"#64748b" }}>{label}</p>
                <p className="text-[8px] sm:text-[9px] mt-0.5" style={{ color:"#334155" }}>{sub}</p>
              </>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════
   QUICK ACTIONS
══════════════════════════════════ */
function QuickActions({ t }) {
  const actions = [
    { to:"/admin/orders",    icon:ShoppingBag, label:t("অর্ডার","Orders"),        sub:t("ম্যানেজ করুন","Manage"),  color:"#e8a427", grad:"linear-gradient(135deg,#e8a427,#c9a84c)" },
    { to:"/admin/products",  icon:Package,     label:t("পণ্য","Products"),         sub:t("স্টক দেখুন","View stock"),color:"#818cf8", grad:"linear-gradient(135deg,#818cf8,#6366f1)" },
    { to:"/admin/delivery",  icon:Truck,       label:t("ডেলিভারি","Delivery"),     sub:t("কনফার্ম করুন","Confirm"), color:"#34d399", grad:"linear-gradient(135deg,#34d399,#10b981)" },
    { to:"/admin/subadmins", icon:Users,       label:t("সাব-এডমিন","Sub-Admins"), sub:t("ম্যানেজ করুন","Manage"),  color:"#2dd4bf", grad:"linear-gradient(135deg,#2dd4bf,#0d9488)" },
    { to:"/admin/links",     icon:Link2,       label:t("লিংক","Links"),            sub:t("নেভ লিংক","Nav links"),   color:"#38bdf8", grad:"linear-gradient(135deg,#38bdf8,#0284c7)" },
    { to:"/admin/sublinks",  icon:Layers,      label:t("সাবলিংক","Sublinks"),      sub:t("ক্যাটাগরি","Categories"), color:"#a78bfa", grad:"linear-gradient(135deg,#a78bfa,#7c3aed)" },
  ];

  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}>
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Zap size={13} style={{ color:"#c9a84c" }}/>
        <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest" style={{ color:"#475569" }}>
          {t("দ্রুত অ্যাকশন","Quick Actions")}
        </p>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
        {actions.map(({ to, icon:Icon, label, sub, color, grad }, i) => (
          <motion.div key={to} initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
            transition={{ delay:0.4+i*0.04 }}>
            <Link to={to}
              className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl text-center transition-all duration-200 hover:-translate-y-1 group"
              style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor=`${color}30`; e.currentTarget.style.boxShadow=`0 8px 24px rgba(0,0,0,0.3)`; }}
              onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"; e.currentTarget.style.boxShadow="none"; }}>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                style={{ background:grad, boxShadow:`0 4px 12px ${color}30` }}>
                <Icon size={16} color="#fff"/>
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] font-black leading-tight" style={{ color:"#e2e8f0" }}>{label}</p>
                <p className="text-[9px] mt-0.5 hidden sm:block" style={{ color:"#475569" }}>{sub}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════
   MAIN
══════════════════════════════════ */
const getCards = (t) => [
  { key:"totalOrders",     icon:ShoppingBag, label:t("মোট অর্ডার","Total Orders"), accentColor:"#e8a427", accentDark:"#c9a84c" },
  { key:"successOrders",   icon:CheckCircle, label:t("ডেলিভার্ড","Delivered"),     accentColor:"#34d399", accentDark:"#10b981" },
  { key:"cancelledOrders", icon:XCircle,     label:t("বাতিল","Cancelled"),         accentColor:"#f87171", accentDark:"#ef4444" },
  { key:"totalProducts",   icon:Package,     label:t("পণ্য","Products"),           accentColor:"#818cf8", accentDark:"#6366f1" },
  { key:"totalLinks",      icon:Link2,       label:t("নেভ লিংক","Nav Links"),     accentColor:"#38bdf8", accentDark:"#0284c7" },
  { key:"totalSublinks",   icon:Layers,      label:t("সাবলিংক","Sublinks"),        accentColor:"#a78bfa", accentDark:"#7c3aed" },
  { key:"totalCustomers",  icon:Users,       label:t("কাস্টমার","Customers"),      accentColor:"#2dd4bf", accentDark:"#0d9488" },
];

export default function DashboardHome() {
  const { t } = useAdminLang();

  const [stats,    setStats   ] = useState({});
  const [orders,   setOrders  ] = useState([]);
  const [loading,  setLoading ] = useState(true);
  const [error,    setError   ] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  const fetchStats = async () => {
    setLoading(true); setError(null);
    try {
      const token = getToken();
      const authH = token ? { Authorization:`Bearer ${token}` } : {};

      const results = await Promise.allSettled([
        fetch(`${API}/api/orders`,          { headers:authH }).then(r=>r.json()),
        fetch(`${API}/api/orders/delivery`, { headers:authH }).then(r=>r.json()),
        fetch(`${API}/api/products/public`).then(r=>r.json()),
        fetch(`${API}/api/navbar-links`,    { headers:authH }).then(r=>r.json()),
        fetch(`${API}/api/sublinks`,        { headers:authH }).then(r=>r.json()),
      ]);

      const [ordersRaw,deliveryRaw,productsRaw,linksRaw,sublinksRaw] = results.map(r=>
        r.status==="fulfilled" ? r.value : []
      );

      const pendingOrders  = safeArray(ordersRaw);
      const deliveryOrders = safeArray(deliveryRaw);
      const seen = new Set();
      const allOrders = [...pendingOrders, ...deliveryOrders].filter(o => {
        if (seen.has(o._id)) return false;
        seen.add(o._id); return true;
      });
      const products  = safeArray(productsRaw);
      const links     = safeArray(linksRaw);
      const sublinks  = safeArray(sublinksRaw);

      const successOrders   = allOrders.filter(o=>["delivered","confirmed"].includes(o.status)).length;
      const cancelledOrders = allOrders.filter(o=>o.status==="cancelled").length;
      const uniquePhones    = new Set(allOrders.map(o=>o.customer?.phone).filter(Boolean));
      const totalRevenue    = allOrders
        .filter(o=>["delivered","confirmed"].includes(o.status))
        .reduce((s,o)=>s+(Number(o.total)||Number(o.totalAmount)||0),0);

      setStats({ totalOrders:allOrders.length, successOrders, cancelledOrders,
        totalProducts:products.length, totalLinks:links.length,
        totalSublinks:sublinks.length, totalCustomers:uniquePhones.size, totalRevenue });
      setOrders([...allOrders].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)));
      setLastSync(new Date());
    } catch(err) {
      console.error(err);
      setError(t("ডেটা লোড করতে সমস্যা হয়েছে।","Failed to load data."));
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  const hour  = new Date().getHours();
  const greet = hour < 12
    ? t("শুভ সকাল 🌅","Good Morning 🌅")
    : hour < 17
    ? t("শুভ দুপুর ☀️","Good Afternoon ☀️")
    : t("শুভ সন্ধ্যা 🌙","Good Evening 🌙");

  const CARDS = getCards(t);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        .dash-wrap * { box-sizing: border-box; }
        .dash-wrap { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <div className="dash-wrap space-y-5 sm:space-y-6 pb-8">

        {/* ── Header ── */}
        <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
          className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-lg sm:text-2xl font-black leading-tight" style={{ color:"#f1f5f9" }}>
              {greet}, Hossain 👋
            </h1>
            <p className="text-xs sm:text-sm mt-1 flex items-center gap-1.5" style={{ color:"#475569" }}>
              <Clock size={11}/>
              {lastSync
                ? `${t("সর্বশেষ সিঙ্ক","Last synced")}: ${lastSync.toLocaleTimeString(t("bn-BD","en-BD"),{hour:"2-digit",minute:"2-digit"})}`
                : t("লোড হচ্ছে...","Loading...")}
            </p>
          </div>
          <motion.button onClick={fetchStats} whileTap={{ scale:0.96 }}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all"
            style={{ background:"linear-gradient(135deg,rgba(201,168,76,0.2),rgba(201,168,76,0.1))", color:"#c9a84c", border:"1px solid rgba(201,168,76,0.3)", boxShadow:"0 4px 12px rgba(201,168,76,0.15)" }}>
            <RefreshCw size={12} className={loading ? "animate-spin" : ""}/>
            <span className="hidden sm:inline">{t("রিফ্রেশ","Refresh")}</span>
          </motion.button>
        </motion.div>

        {/* ── Error ── */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.2)", color:"#f87171" }}>
              <AlertCircle size={15}/>{error}
              <button onClick={fetchStats} className="ml-auto underline text-xs">{t("আবার","Retry")}</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Revenue Hero + Stat Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          <RevenueHero value={stats.totalRevenue} loading={loading} t={t} stats={stats}/>
          {CARDS.map((card, i) => (
            <StatCard key={card.key} card={card} value={stats[card.key]} loading={loading} index={i}/>
          ))}
        </div>

        {/* ── Middle row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          <OrderBreakdown stats={stats} loading={loading} t={t}/>
          <PerformanceSummary stats={stats} loading={loading} t={t}/>
        </div>

        {/* ── Recent Orders ── */}
        <RecentOrders orders={orders} loading={loading} t={t}/>

        {/* ── Quick Actions ── */}
        <QuickActions t={t}/>
      </div>
    </>
  );
}