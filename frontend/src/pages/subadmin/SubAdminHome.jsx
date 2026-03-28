import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, CheckCircle, XCircle, Package, Link2, Layers,
  AlertCircle, RefreshCw,
  Clock, Zap, BarChart2, Activity, Truck, Star,
  ArrowRight, Target, ShieldCheck,
} from "lucide-react";
import { useSubLang } from "../../context/SubAdminLangContext";

const API = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;

const getToken = () =>
  localStorage.getItem("subAdminToken") || "";

const safeArray = (v) =>
  Array.isArray(v) ? v :
  Array.isArray(v?.orders)   ? v.orders   :
  Array.isArray(v?.products) ? v.products :
  Array.isArray(v?.links)    ? v.links    :
  Array.isArray(v?.data)     ? v.data     : [];

/* ── design tokens ── */
const L = {
  bg:       "#0a0f1e",
  card:     "#0f1629",
  cardAlt:  "#111827",
  border:   "rgba(99,102,241,0.12)",
  borderMd: "rgba(99,102,241,0.25)",
  text1:    "#f1f5f9",
  text2:    "#94a3b8",
  text3:    "#475569",
  accent:   "#6366f1",
  accentBg: "rgba(99,102,241,0.1)",
  accentBd: "rgba(99,102,241,0.2)",
  glow:     "rgba(99,102,241,0.15)",
  shadow:   "0 2px 16px rgba(0,0,0,0.4)",
  shadowMd: "0 8px 32px rgba(0,0,0,0.5)",
};

/* ── animated counter ── */
function Counter({ value, prefix = "", suffix = "" }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const target = Number(value) || 0;
    const diff   = target - prev.current;
    if (diff === 0) return;
    const steps = 40;
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

/* ── Glowing orb background ── */
function GlowOrb({ color, style }) {
  return (
    <div className="absolute rounded-full pointer-events-none"
      style={{
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: "blur(40px)",
        opacity: 0.18,
        ...style,
      }}
    />
  );
}

/* ── Stat Card ── */
function StatCard({ label, value, sub, color, icon: Icon, index, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.06, type: "spring", stiffness: 200, damping: 20 }}
      className="relative overflow-hidden rounded-2xl p-4 sm:p-5"
      style={{
        background: `linear-gradient(135deg, ${L.card} 0%, ${L.cardAlt} 100%)`,
        border: `1px solid ${L.border}`,
        boxShadow: L.shadow,
      }}>
      <div className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top right, ${color}18 0%, transparent 60%)` }}/>
      <div className="relative flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          <Icon size={15} style={{ color }}/>
        </div>
        <span className="text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-full"
          style={{ background: `${color}10`, color, border: `1px solid ${color}20` }}>
          LIVE
        </span>
      </div>
      {loading ? (
        <div className="h-8 w-20 rounded-lg animate-pulse" style={{ background: `${color}10` }}/>
      ) : (
        <p className="text-2xl sm:text-3xl font-black leading-none mb-1" style={{ color }}>
          {typeof value === "number" ? <Counter value={value}/> : value}
        </p>
      )}
      <p className="text-[11px] font-semibold" style={{ color: L.text2 }}>{label}</p>
      <p className="text-[10px] mt-0.5" style={{ color: L.text3 }}>{sub}</p>
    </motion.div>
  );
}

/* ══════════════════════════════════
   ORDER BREAKDOWN
══════════════════════════════════ */
function OrderBreakdown({ stats, loading, t }) {
  if (loading || !stats.totalOrders) return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
      className="rounded-2xl overflow-hidden p-6 flex items-center justify-center"
      style={{ background: L.card, border: `1px solid ${L.border}`, boxShadow: L.shadow, minHeight: 200 }}>
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: `${L.accent}30`, borderTopColor: L.accent }}/>
    </motion.div>
  );

  const pending = stats.totalOrders - stats.successOrders - stats.cancelledOrders;
  const rows = [
    { label: t("ডেলিভার্ড", "Delivered"), val: stats.successOrders,  pct: Math.round((stats.successOrders / stats.totalOrders) * 100),   color: "#10b981", icon: CheckCircle },
    { label: t("বাকি", "Pending"),         val: pending,               pct: Math.round((pending / stats.totalOrders) * 100),               color: "#f59e0b", icon: Clock       },
    { label: t("বাতিল", "Cancelled"),      val: stats.cancelledOrders, pct: Math.round((stats.cancelledOrders / stats.totalOrders) * 100), color: "#ef4444", icon: XCircle     },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
      className="rounded-2xl overflow-hidden relative"
      style={{ background: L.card, border: `1px solid ${L.border}`, boxShadow: L.shadow }}>
      <GlowOrb color="#6366f1" style={{ width: 200, height: 200, top: -60, right: -60 }}/>

      <div className="relative px-5 sm:px-6 pt-5 pb-4 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${L.border}` }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)" }}>
            <BarChart2 size={15} style={{ color: L.accent }}/>
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: L.text1 }}>{t("অর্ডার ব্রেকডাউন", "Order Breakdown")}</p>
            <p className="text-[10px]" style={{ color: L.text3 }}>{stats.totalOrders} {t("টি মোট", "total orders")}</p>
          </div>
        </div>
        <Link to="/subadmin/orders"
          className="text-[10px] font-bold flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all no-underline"
          style={{ background: L.accentBg, color: L.accent, border: `1px solid ${L.accentBd}` }}>
          {t("সব দেখুন", "View All")} <ArrowRight size={10}/>
        </Link>
      </div>

      <div className="p-5 sm:p-6">
        {/* stacked bar */}
        <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5 mb-6"
          style={{ background: "rgba(255,255,255,0.04)" }}>
          {[
            { val: stats.successOrders,   color: "#10b981" },
            { val: pending,               color: "#f59e0b" },
            { val: stats.cancelledOrders, color: "#ef4444" },
          ].map(({ val, color }, i) => {
            const pct = (val / stats.totalOrders) * 100;
            return pct > 0 ? (
              <motion.div key={i} className="h-full rounded-full"
                initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                style={{ background: color, boxShadow: `0 0 8px ${color}80` }}/>
            ) : null;
          })}
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {rows.map(({ label, val, pct, color, icon: Icon }) => (
            <div key={label} className="rounded-xl p-3 sm:p-4 text-center relative overflow-hidden"
              style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at top, ${color}10, transparent 70%)` }}/>
              <div className="relative">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2.5"
                  style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                  <Icon size={14} style={{ color }}/>
                </div>
                <p className="text-xl sm:text-2xl font-black leading-none" style={{ color }}>{val}</p>
                <p className="text-[9px] sm:text-[10px] font-semibold mt-1.5" style={{ color: L.text2 }}>{label}</p>
                <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: `${color}15` }}>
                  <motion.div className="h-full rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }}
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.6, duration: 0.7 }}/>
                </div>
                <span className="text-[9px] font-black mt-1 inline-block" style={{ color }}>{pct}%</span>
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
    pending:    { label: t("অপেক্ষা", "Pending"),    color: "#f59e0b", bg: "rgba(245,158,11,0.1)"   },
    processing: { label: t("প্যাকেজিং", "Packing"),  color: "#8b5cf6", bg: "rgba(139,92,246,0.1)"   },
    shipped:    { label: t("পথে", "Shipped"),         color: "#3b82f6", bg: "rgba(59,130,246,0.1)"   },
    confirmed:  { label: t("নিশ্চিত", "Confirmed"),  color: "#06b6d4", bg: "rgba(6,182,212,0.1)"    },
    delivered:  { label: t("পৌঁছেছে", "Delivered"),  color: "#10b981", bg: "rgba(16,185,129,0.1)"   },
    cancelled:  { label: t("বাতিল", "Cancelled"),    color: "#ef4444", bg: "rgba(239,68,68,0.1)"    },
  };
  const recent = orders.slice(0, 3);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      className="rounded-2xl overflow-hidden relative"
      style={{ background: L.card, border: `1px solid ${L.border}`, boxShadow: L.shadow }}>
      <GlowOrb color="#f59e0b" style={{ width: 160, height: 160, top: -40, left: -40 }}/>

      <div className="relative px-5 sm:px-6 pt-5 pb-4 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${L.border}` }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
            <Activity size={15} style={{ color: "#f59e0b" }}/>
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: L.text1 }}>{t("সাম্প্রতিক অর্ডার", "Recent Orders")}</p>
            <p className="text-[10px]" style={{ color: L.text3 }}>{t("সর্বশেষ ৩টি", "Latest 3 orders")}</p>
          </div>
        </div>
        <Link to="/subadmin/delivery"
          className="text-[10px] font-bold flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all no-underline"
          style={{ background: "rgba(245,158,11,0.08)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}>
          {t("সব দেখুন", "View All")} <ArrowRight size={10}/>
        </Link>
      </div>

      <div className="relative">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 sm:px-6 py-4"
              style={{ borderBottom: `1px solid ${L.border}` }}>
              <div className="w-9 h-9 rounded-xl animate-pulse" style={{ background: "rgba(99,102,241,0.08)" }}/>
              <div className="flex-1 space-y-2">
                <div className="h-3 w-28 rounded-full animate-pulse" style={{ background: "rgba(99,102,241,0.08)" }}/>
                <div className="h-2 w-20 rounded-full animate-pulse" style={{ background: "rgba(99,102,241,0.05)" }}/>
              </div>
              <div className="h-3 w-16 rounded-full animate-pulse" style={{ background: "rgba(99,102,241,0.08)" }}/>
            </div>
          ))
        ) : recent.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <ShoppingBag size={28} style={{ color: L.text3 }} className="mx-auto mb-3" strokeWidth={1}/>
            <p className="text-xs font-medium" style={{ color: L.text3 }}>{t("কোনো অর্ডার নেই", "No orders yet")}</p>
          </div>
        ) : recent.map((order, i) => {
          const st = STATUS[order.status] || STATUS.pending;
          const initial = (order.customer?.name || "?")[0].toUpperCase();
          return (
            <motion.div key={order._id || i}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              className="flex items-center gap-3 px-5 sm:px-6 py-4 cursor-default group"
              style={{ borderBottom: i < 2 ? `1px solid ${L.border}` : "none", transition: "background 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.04)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              {/* avatar */}
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black"
                style={{ background: `linear-gradient(135deg, ${st.color}30, ${st.color}15)`, color: st.color, border: `1px solid ${st.color}25` }}>
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate" style={{ color: L.text1 }}>{order.customer?.name || "—"}</p>
                <p className="text-[10px] font-mono mt-0.5" style={{ color: L.text3 }}>{order.orderId}</p>
              </div>
              <div className="text-right flex-shrink-0 space-y-1">
                <p className="text-xs font-black" style={{ color: L.accent }}>৳{(order.total || 0).toLocaleString()}</p>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full inline-block"
                  style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}25` }}>
                  {st.label}
                </span>
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
    ? Math.round((stats.successOrders / stats.totalOrders) * 100) : 0;
  const cancelRate = stats.totalOrders > 0
    ? Math.round((stats.cancelledOrders / stats.totalOrders) * 100) : 0;

  const metrics = [
    { label: t("ডেলিভারি রেট", "Delivery Rate"),    val: `${deliveryRate}%`,       color: "#10b981", icon: Target,      sub: t("সফল ডেলিভারি", "Successful deliveries")    },
    { label: t("বাতিল রেট", "Cancel Rate"),           val: `${cancelRate}%`,         color: "#ef4444", icon: XCircle,     sub: t("বাতিলকৃত অর্ডার", "Cancelled orders")       },
    { label: t("মোট পণ্য", "Products"),              val: stats.totalProducts || 0,  color: "#6366f1", icon: Package,     sub: t("স্টোরে মোট পণ্য", "Items in store")         },
    { label: t("নেভ লিংক", "Nav Links"),              val: stats.totalLinks || 0,    color: "#06b6d4", icon: Link2,       sub: t("নেভিগেশন লিংক", "Navigation links")         },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
      className="rounded-2xl overflow-hidden relative"
      style={{ background: L.card, border: `1px solid ${L.border}`, boxShadow: L.shadow }}>
      <GlowOrb color="#10b981" style={{ width: 180, height: 180, bottom: -50, right: -50 }}/>

      <div className="relative px-5 sm:px-6 pt-5 pb-4 flex items-center gap-3"
        style={{ borderBottom: `1px solid ${L.border}` }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <Star size={15} style={{ color: "#10b981" }}/>
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: L.text1 }}>{t("পারফরম্যান্স", "Performance")}</p>
          <p className="text-[10px]" style={{ color: L.text3 }}>{t("স্টোর মেট্রিক্স", "Store metrics")}</p>
        </div>
      </div>

      <div className="relative p-5 sm:p-6 grid grid-cols-2 gap-3">
        {metrics.map(({ label, val, color, icon: Icon, sub }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 + i * 0.06 }}
            className="rounded-xl p-3 sm:p-4 relative overflow-hidden"
            style={{ background: `${color}07`, border: `1px solid ${color}18` }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: `radial-gradient(ellipse at bottom left, ${color}12, transparent 65%)` }}/>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `${color}15`, border: `1px solid ${color}20` }}>
                  <Icon size={12} style={{ color }}/>
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                  style={{ background: `${color}10`, color, opacity: 0.7 }}>live</span>
              </div>
              {loading ? (
                <div className="h-7 w-14 rounded-lg animate-pulse" style={{ background: `${color}10` }}/>
              ) : (
                <>
                  <p className="text-xl sm:text-2xl font-black leading-none" style={{ color }}>
                    {typeof val === "number" ? <Counter value={val}/> : val}
                  </p>
                  <p className="text-[10px] font-semibold mt-1.5" style={{ color: L.text2 }}>{label}</p>
                  <p className="text-[9px] mt-0.5" style={{ color: L.text3 }}>{sub}</p>
                </>
              )}
            </div>
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
    { to: "/subadmin/orders",   icon: ShoppingBag, label: t("অর্ডার", "Orders"),        sub: t("ম্যানেজ করুন", "Manage"),    color: "#f59e0b", grad: "linear-gradient(135deg,#f59e0b,#d97706)" },
    { to: "/subadmin/products", icon: Package,     label: t("পণ্য", "Products"),         sub: t("স্টক দেখুন", "View stock"),  color: "#6366f1", grad: "linear-gradient(135deg,#818cf8,#6366f1)" },
    { to: "/subadmin/delivery", icon: Truck,       label: t("ডেলিভারি", "Delivery"),     sub: t("কনফার্ম করুন", "Confirm"),   color: "#10b981", grad: "linear-gradient(135deg,#34d399,#10b981)" },
    { to: "/subadmin/links",    icon: Link2,       label: t("লিংক", "Links"),            sub: t("নেভ লিংক", "Nav links"),     color: "#06b6d4", grad: "linear-gradient(135deg,#38bdf8,#0284c7)" },
    { to: "/subadmin/sublinks", icon: Layers,      label: t("সাবলিংক", "Sublinks"),      sub: t("ক্যাটাগরি", "Categories"),   color: "#8b5cf6", grad: "linear-gradient(135deg,#a78bfa,#7c3aed)" },
    { to: "/subadmin/users",    icon: ShieldCheck, label: t("কাস্টমার", "Customers"),    sub: t("ব্যবহারকারী", "Users"),      color: "#0d9488", grad: "linear-gradient(135deg,#14b8a6,#0d9488)" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Zap size={12} style={{ color: L.accent }}/>
        <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: L.text3 }}>
          {t("দ্রুত অ্যাকশন", "Quick Actions")}
        </p>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
        {actions.map(({ to, icon: Icon, label, sub, color, grad }, i) => (
          <motion.div key={to}
            initial={{ opacity: 0, scale: 0.88, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.05, type: "spring", stiffness: 220, damping: 18 }}>
            <Link to={to}
              className="flex flex-col items-center gap-2.5 p-3 sm:p-4 rounded-2xl text-center group block no-underline relative overflow-hidden"
              style={{
                background: L.card,
                border: `1px solid ${L.border}`,
                boxShadow: L.shadow,
                transition: "all 0.25s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = `${color}35`;
                e.currentTarget.style.boxShadow = `0 8px 32px ${color}20, 0 0 0 1px ${color}20`;
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = L.border;
                e.currentTarget.style.boxShadow = L.shadow;
                e.currentTarget.style.transform = "translateY(0)";
              }}>
              <div className="absolute inset-0 pointer-events-none rounded-2xl"
                style={{ background: `radial-gradient(ellipse at top, ${color}08, transparent 60%)` }}/>
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center"
                style={{ background: grad, boxShadow: `0 4px 16px ${color}35` }}>
                <Icon size={16} color="#fff" strokeWidth={2}/>
              </div>
              <div className="relative">
                <p className="text-[10px] sm:text-[11px] font-black leading-tight" style={{ color: L.text1 }}>{label}</p>
                <p className="text-[9px] mt-0.5 hidden sm:block" style={{ color: L.text3 }}>{sub}</p>
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
export default function SubAdminHome() {
  const { t } = useSubLang();

  const [stats,    setStats  ] = useState({});
  const [orders,   setOrders ] = useState([]);
  const [loading,  setLoading] = useState(true);
  const [error,    setError  ] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  const subAdminInfo = JSON.parse(localStorage.getItem("subAdminInfo") || "{}");

  const fetchStats = async () => {
    setLoading(true); setError(null);
    try {
      const token = getToken();
      const authH = token ? { Authorization: `Bearer ${token}` } : {};

      const results = await Promise.allSettled([
        fetch(`${API}/api/orders`,          { headers: authH }).then(r => r.json()),
        fetch(`${API}/api/orders/delivery`, { headers: authH }).then(r => r.json()),
        fetch(`${API}/api/products/public`).then(r => r.json()),
        fetch(`${API}/api/navbar-links`,    { headers: authH }).then(r => r.json()),
        fetch(`${API}/api/sublinks`,        { headers: authH }).then(r => r.json()),
      ]);

      const [ordersRaw, deliveryRaw, productsRaw, linksRaw, sublinksRaw] = results.map(r =>
        r.status === "fulfilled" ? r.value : []
      );

      const pendingOrders  = safeArray(ordersRaw);
      const deliveryOrders = safeArray(deliveryRaw);
      const seen = new Set();
      const allOrders = [...pendingOrders, ...deliveryOrders].filter(o => {
        if (seen.has(o._id)) return false;
        seen.add(o._id); return true;
      });

      const products = safeArray(productsRaw);
      const links    = safeArray(linksRaw);
      const sublinks = safeArray(sublinksRaw);

      const successOrders   = allOrders.filter(o => ["delivered", "confirmed"].includes(o.status)).length;
      const cancelledOrders = allOrders.filter(o => o.status === "cancelled").length;
      const totalRevenue    = allOrders
        .filter(o => ["delivered", "confirmed"].includes(o.status))
        .reduce((s, o) => s + (Number(o.total) || 0), 0);

      setStats({
        totalOrders: allOrders.length, successOrders, cancelledOrders,
        totalProducts: products.length, totalLinks: links.length,
        totalSublinks: sublinks.length, totalRevenue,
      });
      setOrders([...allOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setLastSync(new Date());
    } catch (err) {
      console.error(err);
      setError(t("ডেটা লোড করতে সমস্যা হয়েছে।", "Failed to load data."));
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const hour  = new Date().getHours();
  const greet = hour < 12
    ? t("শুভ সকাল 🌅", "Good Morning 🌅")
    : hour < 17
    ? t("শুভ দুপুর ☀️", "Good Afternoon ☀️")
    : t("শুভ সন্ধ্যা 🌙", "Good Evening 🌙");

  /* top stat cards */
  const topStats = [
    { label: t("মোট অর্ডার", "Total Orders"),   value: stats.totalOrders || 0,  sub: t("সব অর্ডার", "All orders"),          color: "#6366f1", icon: ShoppingBag },
    { label: t("মোট রেভিনিউ", "Total Revenue"),  value: stats.totalRevenue || 0, sub: t("ডেলিভার্ড থেকে", "From delivered"),  color: "#10b981", icon: Star        },
    { label: t("ডেলিভার্ড", "Delivered"),        value: stats.successOrders || 0,sub: t("সফল অর্ডার", "Successful orders"),   color: "#06b6d4", icon: CheckCircle  },
    { label: t("বাতিল", "Cancelled"),            value: stats.cancelledOrders||0,sub: t("বাতিলকৃত", "Cancelled orders"),      color: "#ef4444", icon: XCircle      },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        .sa-dash * { box-sizing: border-box; }
        .sa-dash { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <div className="sa-dash space-y-5 sm:space-y-6 pb-8">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#10b981", boxShadow: "0 0 6px #10b981" }}/>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#10b981" }}>
                {t("লাইভ ড্যাশবোর্ড", "Live Dashboard")}
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black leading-tight" style={{ color: L.text1 }}>
              {greet}, <span style={{ color: L.accent }}>{subAdminInfo?.name?.split(" ")[0] || "SubAdmin"}</span> 👋
            </h1>
            <p className="text-xs sm:text-sm mt-1 flex items-center gap-1.5" style={{ color: L.text3 }}>
              <Clock size={10}/>
              {lastSync
                ? `${t("সর্বশেষ সিঙ্ক", "Last synced")}: ${lastSync.toLocaleTimeString(t("bn-BD", "en-BD"), { hour: "2-digit", minute: "2-digit" })}`
                : t("লোড হচ্ছে...", "Loading...")}
            </p>
          </div>
          <motion.button onClick={fetchStats} whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all"
            style={{
              background: L.accentBg,
              color: L.accent,
              border: `1px solid ${L.accentBd}`,
              boxShadow: "0 2px 12px rgba(99,102,241,0.15)",
            }}>
            <RefreshCw size={12} className={loading ? "animate-spin" : ""}/>
            <span className="hidden sm:inline">{t("রিফ্রেশ", "Refresh")}</span>
          </motion.button>
        </motion.div>

        {/* ── Error ── */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
              <AlertCircle size={15}/>{error}
              <button onClick={fetchStats} className="ml-auto underline text-xs">{t("আবার", "Retry")}</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Top stat cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {topStats.map((s, i) => (
            <StatCard key={i} {...s} index={i} loading={loading}/>
          ))}
        </div>

        {/* ── Breakdown + Performance ── */}
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