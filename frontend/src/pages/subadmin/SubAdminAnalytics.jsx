import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, CheckCircle, XCircle, Package, Link2, Layers,
  RefreshCw, BarChart2, PieChart, Activity, MapPin, Star,
  Loader2, Clock, Target, Truck, Users,
} from "lucide-react";
import {
  BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useSubLang } from "../../context/SubAdminLangContext";

const API      = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;
const getToken = () =>
  localStorage.getItem("adminToken") ||
  localStorage.getItem("token") || "";

/* ── light design tokens ── */
const L = {
  card:     "#ffffff",
  border:   "rgba(99,102,241,0.1)",
  borderMd: "rgba(99,102,241,0.2)",
  text1:    "#0f172a",
  text2:    "#374151",
  text3:    "#9ca3af",
  accent:   "#6366f1",
  accentBg: "rgba(99,102,241,0.07)",
  accentBd: "rgba(99,102,241,0.18)",
  shadow:   "0 1px 8px rgba(99,102,241,0.07)",
  shadowMd: "0 4px 20px rgba(99,102,241,0.1)",
};

const C = {
  indigo:  "#6366f1",
  green:   "#10b981",
  red:     "#ef4444",
  blue:    "#3b82f6",
  purple:  "#8b5cf6",
  sky:     "#06b6d4",
  orange:  "#f59e0b",
  teal:    "#0d9488",
};

const STATUS_COLORS = {
  pending:    "#f59e0b",
  confirmed:  "#06b6d4",
  processing: "#8b5cf6",
  shipped:    "#3b82f6",
  delivered:  "#10b981",
  cancelled:  "#ef4444",
};

const AUTO_REFRESH_SEC = 5 * 60;

/* ── tooltip ── */
function LightTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: `1px solid ${L.border}`, borderRadius: 12, padding: "10px 14px", boxShadow: L.shadowMd }}>
      <p style={{ color: L.text3, fontSize: 11, marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || L.text1, fontSize: 13, fontWeight: 700, margin: "2px 0" }}>
          {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
          {" "}<span style={{ color: L.text3, fontWeight: 400, fontSize: 11 }}>{p.name}</span>
        </p>
      ))}
    </div>
  );
}

/* ── KPI card ── */
function KpiCard({ icon: Icon, label, value, sub, color, loading, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.04, type: "spring", stiffness: 200, damping: 22 }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      className="relative overflow-hidden rounded-2xl group"
      style={{ background: L.card, border: `1px solid ${color}22`, boxShadow: L.shadow }}>

      <div className="absolute top-0 left-0 right-0 h-[2.5px]"
        style={{ background: `linear-gradient(90deg,transparent,${color},transparent)` }}/>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%,${color}07,transparent 65%)` }}/>

      <div className="relative p-4 sm:p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${color}10`, border: `1px solid ${color}22` }}>
            <Icon size={18} style={{ color }}/>
          </div>
          <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full mt-1" style={{ background: color }}/>
        </div>
        {loading ? (
          <div className="space-y-2">
            <div className="h-8 w-20 rounded-lg animate-pulse" style={{ background: `${color}10` }}/>
            <div className="h-3 w-24 rounded animate-pulse" style={{ background: `${color}07` }}/>
          </div>
        ) : (
          <>
            <p className="font-black leading-none mb-1"
              style={{ fontSize: "clamp(1.5rem,3vw,2rem)", color, letterSpacing: "-0.03em" }}>
              {value}
            </p>
            <p className="text-[11px] font-medium" style={{ color: L.text3 }}>{label}</p>
            {sub && <p className="text-[10px] mt-0.5" style={{ color: L.text3 }}>{sub}</p>}
          </>
        )}
      </div>
    </motion.div>
  );
}

/* ── chart card ── */
function ChartCard({ title, subtitle, icon: Icon, color, children, loading, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="relative rounded-2xl overflow-hidden"
      style={{ background: L.card, border: `1px solid ${L.border}`, boxShadow: L.shadow }}>

      <div className="absolute top-0 left-0 right-0 h-[2.5px]"
        style={{ background: `linear-gradient(90deg,transparent,${color},transparent)` }}/>

      <div className="px-5 sm:px-6 pt-5 pb-4 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${L.border}` }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: `${color}0f`, border: `1px solid ${color}22` }}>
            <Icon size={14} style={{ color }}/>
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: L.text1 }}>{title}</p>
            {subtitle && <p className="text-[10px]" style={{ color: L.text3 }}>{subtitle}</p>}
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-14 gap-3">
            <Loader2 size={18} className="animate-spin" style={{ color }}/>
            <span className="text-sm" style={{ color: L.text3 }}>লোড হচ্ছে…</span>
          </div>
        ) : children}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════
   MAIN
══════════════════════════════════ */
export default function SubAdminAnalytics() {
  const { t } = useSubLang();

  const [data,      setData     ] = useState(null);
  const [loading,   setLoading  ] = useState(true);
  const [error,     setError    ] = useState(null);
  const [tab,       setTab      ] = useState("orders");
  const [countdown, setCountdown] = useState(AUTO_REFRESH_SEC);
  const [lastSync,  setLastSync ] = useState(null);
  const intervalRef  = useRef(null);
  const countdownRef = useRef(null);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`${API}/api/analytics`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setData(json.data);
      setLastSync(new Date());
      setCountdown(AUTO_REFRESH_SEC);
    } catch (e) {
      setError(e.message || "Failed to load analytics");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, AUTO_REFRESH_SEC * 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setCountdown(p => (p <= 1 ? AUTO_REFRESH_SEC : p - 1));
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, []);

  const fmtCountdown = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const kpi = data?.kpi || {};

  /* ── KPI cards — আর্থিক তথ্য নেই ── */
  const kpis = [
    { icon: ShoppingBag, label: t("মোট অর্ডার",   "Total Orders"),     value: (kpi.totalOrders     || 0).toLocaleString(), color: C.indigo,  sub: null },
    { icon: CheckCircle, label: t("ডেলিভার্ড",     "Delivered"),        value: (kpi.deliveredOrders || 0).toLocaleString(), color: C.green,   sub: `${kpi.deliveryRate || 0}% ${t("ডেলিভারি রেট","delivery rate")}` },
    { icon: XCircle,     label: t("বাতিল",          "Cancelled"),        value: (kpi.cancelledOrders || 0).toLocaleString(), color: C.red,     sub: `${kpi.cancelRate   || 0}% ${t("বাতিল রেট","cancel rate")}` },
    { icon: Truck,       label: t("শিপড",           "Shipped"),          value: (kpi.shippedOrders   || 0).toLocaleString(), color: C.blue,    sub: null },
    { icon: Package,     label: t("পণ্য",           "Products"),         value: (kpi.totalProducts   || 0).toLocaleString(), color: C.purple,  sub: null },
    { icon: Link2,       label: t("লিংক",           "Links"),            value: (kpi.totalLinks      || 0).toLocaleString(), color: C.sky,     sub: null },
    { icon: Layers,      label: t("সাবলিংক",         "Sublinks"),         value: (kpi.totalSublinks   || 0).toLocaleString(), color: C.teal,    sub: null },
    { icon: Target,      label: t("সাফল্যের হার",   "Success Rate"),     value: `${kpi.deliveryRate  || 0}%`,                color: C.orange,  sub: null },
  ];

  /* ── donut: status breakdown ── */
  const statusData = (data?.statusCount || []).map(s => ({
    name: s.status, value: s.count, fill: STATUS_COLORS[s.status] || "#94a3b8",
  }));

  /* ── payment method — শুধু count, revenue নেই ── */
  const payCountData = (data?.paymentCount || []).map(p => ({
    name: p.method.toUpperCase(), count: p.count,
    fill: p.method === "cod" ? C.orange : p.method === "bkash" ? C.purple : C.teal,
  }));

  /* recharts axis style */
  const axisStyle = { fontSize: 11, fill: L.text3, fontFamily: "'DM Sans',sans-serif" };
  const gridStyle = { stroke: "rgba(99,102,241,0.07)" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        .sa-an * { box-sizing: border-box; }
        .sa-an { font-family: 'DM Sans', sans-serif; }
        .recharts-cartesian-grid-horizontal line,
        .recharts-cartesian-grid-vertical line { stroke: rgba(99,102,241,0.07) !important; }
        .recharts-text { fill: #9ca3af !important; font-family: 'DM Sans',sans-serif !important; font-size: 11px !important; }
      `}</style>

      <div className="sa-an max-w-6xl mx-auto pb-10 space-y-6">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: L.accentBg, border: `1px solid ${L.accentBd}` }}>
              <BarChart2 size={22} style={{ color: C.indigo }}/>
            </div>
            <div>
              <h1 className="font-black tracking-tight" style={{ fontSize: 22, color: L.text1, fontFamily: "'Syne',sans-serif" }}>
                {t("অ্যানালিটিক্স", "Analytics")}
              </h1>
              <p className="text-xs mt-0.5" style={{ color: L.text3 }}>
                {t("স্টোরের অপারেশনাল বিশ্লেষণ", "Store operational overview")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* countdown */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
              style={{ background: L.card, border: `1px solid ${L.border}`, boxShadow: L.shadow }}>
              <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full" style={{ background: C.green }}/>
              <span className="text-[11px] font-medium" style={{ color: L.text3 }}>
                {t("অটো আপডেট", "Auto update")}
              </span>
              <span className="text-[11px] font-bold" style={{ color: C.green }}>
                {fmtCountdown(countdown)}
              </span>
            </div>

            {/* last sync */}
            {lastSync && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl"
                style={{ background: L.card, border: `1px solid ${L.border}`, boxShadow: L.shadow }}>
                <Clock size={11} style={{ color: L.text3 }}/>
                <span className="text-[11px]" style={{ color: L.text3 }}>
                  {lastSync.toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              </div>
            )}

            {/* refresh */}
            <button onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
              style={{ background: L.accentBg, border: `1px solid ${L.accentBd}`, color: C.indigo }}>
              <RefreshCw size={13} className={loading ? "animate-spin" : ""}/>
              <span className="hidden sm:inline">{t("এখনই আপডেট", "Refresh Now")}</span>
            </button>
          </div>
        </motion.div>

        {/* error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
              style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)", color: C.red }}>
              <XCircle size={15}/> {error}
              <button onClick={fetchData} className="ml-auto underline text-xs">{t("আবার", "Retry")}</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── KPI Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {kpis.map((k, i) => (
            <KpiCard key={k.label} {...k} loading={loading} index={i}/>
          ))}
        </div>

        {/* ── Order trend — orders only, no revenue ── */}
        <ChartCard
          title={t("অর্ডার ট্রেন্ড", "Order Trend")}
          subtitle={t("গত ১২ মাস", "Last 12 months")}
          icon={Activity} color={C.indigo} loading={loading} delay={0.15}>

          {/* tabs */}
          <div className="flex gap-2 mb-5">
            {[
              { key: "orders", label: t("মাসিক", "Monthly") },
              { key: "daily",  label: t("দৈনিক (৩০দিন)", "Daily (30d)") },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setTab(key)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: tab === key ? L.accentBg : "#f8f9ff",
                  border:     `1px solid ${tab === key ? L.accentBd : L.border}`,
                  color:      tab === key ? C.indigo : L.text3,
                }}>
                {label}
              </button>
            ))}
          </div>

          {tab === "daily" ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data?.dailyOrders || []} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="saDaily" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.indigo} stopOpacity={0.18}/>
                    <stop offset="95%" stopColor={C.indigo} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStyle.stroke}/>
                <XAxis dataKey="label" tick={axisStyle} interval={4}/>
                <YAxis tick={axisStyle}/>
                <Tooltip content={<LightTooltip/>}/>
                <Area type="monotone" dataKey="count" name={t("অর্ডার", "Orders")}
                  stroke={C.indigo} fill="url(#saDaily)" strokeWidth={2} dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data?.revenueByMonth || []} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStyle.stroke}/>
                <XAxis dataKey="label" tick={axisStyle}/>
                <YAxis tick={axisStyle}/>
                <Tooltip content={<LightTooltip/>}/>
                <Bar dataKey="orders" name={t("অর্ডার", "Orders")} fill={C.indigo} radius={[4, 4, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* ── Two-column row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Status donut */}
          <ChartCard
            title={t("অর্ডার স্ট্যাটাস", "Order Status")}
            subtitle={t("স্ট্যাটাস অনুযায়ী বিভাজন", "Breakdown by status")}
            icon={PieChart} color={C.purple} loading={loading} delay={0.2}>
            <ResponsiveContainer width="100%" height={240}>
              <RechartsPie>
                <Pie data={statusData} cx="50%" cy="50%"
                  innerRadius={60} outerRadius={95}
                  paddingAngle={3} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={{ stroke: "rgba(99,102,241,0.2)" }}>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} stroke="transparent"/>
                  ))}
                </Pie>
                <Tooltip content={<LightTooltip/>}/>
              </RechartsPie>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-2">
              {statusData.map(s => (
                <span key={s.name} className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: `${s.fill}10`, color: s.fill, border: `1px solid ${s.fill}22` }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.fill }}/>
                  {s.name} ({s.value})
                </span>
              ))}
            </div>
          </ChartCard>

          {/* Payment method — orders only */}
          <ChartCard
            title={t("পেমেন্ট পদ্ধতি", "Payment Methods")}
            subtitle={t("অর্ডার সংখ্যা অনুযায়ী", "By order count")}
            icon={BarChart2} color={C.teal} loading={loading} delay={0.25}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={payCountData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStyle.stroke}/>
                <XAxis dataKey="name" tick={axisStyle}/>
                <YAxis tick={axisStyle}/>
                <Tooltip content={<LightTooltip/>}/>
                <Bar dataKey="count" name={t("অর্ডার", "Orders")} radius={[4, 4, 0, 0]}>
                  {payCountData.map((e, i) => <Cell key={i} fill={e.fill}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* ── Two-column row 2 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Top products — quantity only, no revenue */}
          <ChartCard
            title={t("সেরা পণ্য", "Top Products")}
            subtitle={t("বিক্রির পরিমাণ অনুযায়ী", "By units sold")}
            icon={Star} color={C.orange} loading={loading} delay={0.3}>
            <div className="space-y-3">
              {(data?.topProducts || []).map((p, i) => {
                const maxQty = data.topProducts[0]?.qty || 1;
                const pct    = Math.round((p.qty / maxQty) * 100);
                const colors = [C.orange, C.indigo, C.purple, C.teal, C.blue];
                const c      = colors[i % colors.length];
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0"
                          style={{ background: `${c}12`, color: c }}>
                          {i + 1}
                        </span>
                        <span className="text-xs font-medium truncate" style={{ color: L.text1 }}>{p.name}</span>
                      </div>
                      <span className="text-xs font-bold ml-3 flex-shrink-0" style={{ color: c }}>
                        {p.qty} {t("পিস", "pcs")}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: `${c}10` }}>
                      <motion.div className="h-full rounded-full"
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.4 + i * 0.08, duration: 0.6, ease: "easeOut" }}
                        style={{ background: c }}/>
                    </div>
                  </div>
                );
              })}
              {(!data?.topProducts || data.topProducts.length === 0) && (
                <p className="text-sm text-center py-8" style={{ color: L.text3 }}>
                  {t("কোনো বিক্রয় নেই", "No sales data yet")}
                </p>
              )}
            </div>
          </ChartCard>

          {/* Top districts */}
          <ChartCard
            title={t("শীর্ষ জেলা", "Top Districts")}
            subtitle={t("অর্ডার সংখ্যা অনুযায়ী", "By order count")}
            icon={MapPin} color={C.sky} loading={loading} delay={0.35}>
            <div className="space-y-3">
              {(data?.topDistricts || []).map((d, i) => {
                const maxCount = data.topDistricts[0]?.count || 1;
                const pct      = Math.round((d.count / maxCount) * 100);
                const distColors = [C.sky, C.teal, C.purple, C.blue, C.green];
                const c = distColors[i % distColors.length];
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0"
                          style={{ background: `${c}12`, color: c }}>{i + 1}</span>
                        <span className="text-xs font-medium" style={{ color: L.text1 }}>{d.district}</span>
                      </div>
                      <span className="text-xs font-bold" style={{ color: c }}>
                        {d.count} {t("অর্ডার", "orders")}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: `${c}10` }}>
                      <motion.div className="h-full rounded-full"
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.4 + i * 0.08, duration: 0.6, ease: "easeOut" }}
                        style={{ background: c }}/>
                    </div>
                  </div>
                );
              })}
              {(!data?.topDistricts || data.topDistricts.length === 0) && (
                <p className="text-sm text-center py-8" style={{ color: L.text3 }}>
                  {t("কোনো ডেটা নেই", "No data yet")}
                </p>
              )}
            </div>
          </ChartCard>
        </div>

        {/* ── Daily order count (last 30 days) — revenue নেই ── */}
        <ChartCard
          title={t("দৈনিক অর্ডার", "Daily Orders")}
          subtitle={t("গত ৩০ দিন", "Last 30 days")}
          icon={Activity} color={C.green} loading={loading} delay={0.4}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data?.dailyOrders || []} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="saDailyGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.green} stopOpacity={0.18}/>
                  <stop offset="95%" stopColor={C.green} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStyle.stroke}/>
              <XAxis dataKey="label" tick={axisStyle} interval={4}/>
              <YAxis tick={axisStyle}/>
              <Tooltip content={<LightTooltip/>}/>
              <Area type="monotone" dataKey="count" name={t("অর্ডার", "Orders")}
                stroke={C.green} fill="url(#saDailyGreen)" strokeWidth={2} dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>
    </>
  );
}