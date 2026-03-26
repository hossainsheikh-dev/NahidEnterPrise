import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, ShoppingBag, CheckCircle,
  XCircle, Package, Link2, Layers, Users, RefreshCw,
  BarChart2, PieChart, Activity, MapPin, Star,
  ArrowUpRight, ArrowDownRight, Loader2,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { useAdminLang } from "../../context/AdminLangContext";

const API      = process.env.REACT_APP_API_URL || "http://localhost:5000";
const getToken = () => localStorage.getItem("token") || "";

/* ─── colors ─── */
const COLORS = {
  gold:    "#c9a84c",
  green:   "#34d399",
  red:     "#f87171",
  blue:    "#60a5fa",
  purple:  "#a78bfa",
  sky:     "#38bdf8",
  orange:  "#fb923c",
  teal:    "#2dd4bf",
};

const STATUS_COLORS = {
  pending:    "#e8a427",
  confirmed:  "#38bdf8",
  processing: "#a78bfa",
  shipped:    "#60a5fa",
  delivered:  "#34d399",
  cancelled:  "#f87171",
};

/* ─── custom tooltip ─── */
function DarkTooltip({ active, payload, label, prefix = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#1a2235", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"10px 14px", boxShadow:"0 8px 32px rgba(0,0,0,0.5)" }}>
      <p style={{ color:"#64748b", fontSize:11, marginBottom:6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || "#e2e8f0", fontSize:13, fontWeight:700, margin:"2px 0" }}>
          {prefix}{typeof p.value === "number" ? p.value.toLocaleString() : p.value}
          {" "}<span style={{ color:"#475569", fontWeight:400, fontSize:11 }}>{p.name}</span>
        </p>
      ))}
    </div>
  );
}

/* ─── KPI card ─── */
function KpiCard({ icon:Icon, label, value, sub, color, growth, loading, index }) {
  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
      transition={{ delay:0.05+index*0.04, type:"spring", stiffness:200, damping:22 }}
      whileHover={{ y:-3, transition:{ duration:0.15 } }}
      className="relative overflow-hidden rounded-2xl group"
      style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${color}20`, boxShadow:"0 4px 16px rgba(0,0,0,0.2)" }}>

      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background:`linear-gradient(90deg,transparent,${color}50,transparent)` }}/>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background:`radial-gradient(ellipse at 50% 0%,${color}08,transparent 65%)` }}/>

      <div className="relative p-4 sm:p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background:`${color}15`, border:`1px solid ${color}25` }}>
            <Icon size={18} style={{ color }}/>
          </div>
          {growth !== undefined && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold"
              style={{
                background: growth >= 0 ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
                color: growth >= 0 ? "#34d399" : "#f87171",
                border: `1px solid ${growth >= 0 ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}`,
              }}>
              {growth >= 0 ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>}
              {Math.abs(growth)}%
            </div>
          )}
        </div>
        {loading ? (
          <div className="space-y-2">
            <div className="h-8 w-20 rounded-lg animate-pulse" style={{ background:"rgba(255,255,255,0.07)" }}/>
            <div className="h-3 w-24 rounded animate-pulse" style={{ background:"rgba(255,255,255,0.04)" }}/>
          </div>
        ) : (
          <>
            <p className="font-black leading-none mb-1"
              style={{ fontSize:"clamp(1.5rem,3vw,2rem)", color, letterSpacing:"-0.03em" }}>
              {value}
            </p>
            <p className="text-[11px] font-medium" style={{ color:"#64748b" }}>{label}</p>
            {sub && <p className="text-[10px] mt-0.5" style={{ color:"#334155" }}>{sub}</p>}
          </>
        )}
      </div>
    </motion.div>
  );
}

/* ─── chart card wrapper ─── */
function ChartCard({ title, subtitle, icon:Icon, color, children, loading, delay=0 }) {
  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
      transition={{ delay, duration:0.4 }}
      className="relative rounded-2xl overflow-hidden"
      style={{ background:"#0d1426", border:"1px solid rgba(255,255,255,0.07)", boxShadow:"0 8px 32px rgba(0,0,0,0.3)" }}>

      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background:`linear-gradient(90deg,transparent,${color}40,transparent)` }}/>

      <div className="px-5 sm:px-6 pt-5 pb-4 flex items-center justify-between"
        style={{ borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background:`${color}12`, border:`1px solid ${color}20` }}>
            <Icon size={14} style={{ color }}/>
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color:"#f1f5f9" }}>{title}</p>
            {subtitle && <p className="text-[10px]" style={{ color:"#475569" }}>{subtitle}</p>}
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <Loader2 size={20} className="animate-spin" style={{ color }}/>
            <span className="text-sm" style={{ color:"#475569" }}>লোড হচ্ছে…</span>
          </div>
        ) : children}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════
   MAIN
══════════════════════════════════ */
const AUTO_REFRESH_SEC = 5 * 60; // 5 minutes

export default function AdminAnalytics() {
  const { t } = useAdminLang();
  const [data,      setData     ] = useState(null);
  const [loading,   setLoading  ] = useState(true);
  const [error,     setError    ] = useState(null);
  const [tab,       setTab      ] = useState("revenue");
  const [countdown, setCountdown] = useState(AUTO_REFRESH_SEC);
  const [lastSync,  setLastSync ] = useState(null);
  const intervalRef  = useRef(null);
  const countdownRef = useRef(null);

  const fetch_ = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API}/api/analytics`, {
        headers: { Authorization:`Bearer ${getToken()}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setData(json.data);
      setLastSync(new Date());
      setCountdown(AUTO_REFRESH_SEC); // reset countdown after each fetch
    } catch (e) {
      setError(e.message || "Failed to load analytics");
    } finally { setLoading(false); }
  };

  // auto-refresh every 5 minutes
  useEffect(() => {
    fetch_();
    intervalRef.current = setInterval(() => { fetch_(); }, AUTO_REFRESH_SEC * 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  // countdown ticker (every second)
  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setCountdown(prev => (prev <= 1 ? AUTO_REFRESH_SEC : prev - 1));
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, []);

  const fmtCountdown = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const kpi = data?.kpi || {};

  /* ─── KPI cards config ─── */
  const kpis = [
    { icon:TrendingUp, label:t("মোট রেভিনিউ","Total Revenue"),       value:`৳${(kpi.totalRevenue||0).toLocaleString()}`,       color:COLORS.gold,   growth:kpi.revenueGrowth, sub:`এই মাস: ৳${(kpi.thisMonthRevenue||0).toLocaleString()}` },
    { icon:ShoppingBag,label:t("মোট অর্ডার","Total Orders"),          value:(kpi.totalOrders||0).toLocaleString(),               color:COLORS.blue,   growth:undefined },
    { icon:CheckCircle,label:t("ডেলিভার্ড","Delivered"),              value:(kpi.deliveredOrders||0).toLocaleString(),            color:COLORS.green,  growth:undefined, sub:`${kpi.deliveryRate||0}% ডেলিভারি রেট` },
    { icon:XCircle,    label:t("বাতিল","Cancelled"),                  value:(kpi.cancelledOrders||0).toLocaleString(),            color:COLORS.red,    growth:undefined, sub:`${kpi.cancelRate||0}% বাতিল রেট` },
    { icon:BarChart2,  label:t("গড় অর্ডার মূল্য","Avg Order Value"), value:`৳${(kpi.avgOrderValue||0).toLocaleString()}`,       color:COLORS.purple, growth:undefined },
    { icon:Package,    label:t("পণ্য","Products"),                    value:(kpi.totalProducts||0).toLocaleString(),              color:COLORS.sky,    growth:undefined },
    { icon:Link2,      label:t("লিংক","Links"),                       value:(kpi.totalLinks||0).toLocaleString(),                 color:COLORS.teal,   growth:undefined },
    { icon:Users,      label:t("সাবএডমিন","SubAdmins"),               value:(kpi.totalSubAdmins||0).toLocaleString(),            color:COLORS.orange, growth:undefined },
  ];

  /* ─── donut data for status ─── */
  const statusData = (data?.statusCount||[]).map(s => ({
    name: s.status, value: s.count, fill: STATUS_COLORS[s.status] || "#64748b",
  }));

  /* ─── payment data ─── */
  const payData = (data?.paymentCount||[]).map(p => ({
    name: p.method.toUpperCase(), count: p.count, revenue: p.revenue,
    fill: p.method==="cod" ? COLORS.gold : p.method==="bkash" ? COLORS.purple : COLORS.teal,
  }));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        .an-wrap * { box-sizing: border-box; }
        .an-wrap { font-family: 'DM Sans', sans-serif; }
        .recharts-cartesian-grid-horizontal line,
        .recharts-cartesian-grid-vertical line { stroke: rgba(255,255,255,0.05) !important; }
        .recharts-text { fill: #475569 !important; font-family: 'DM Sans', sans-serif !important; font-size: 11px !important; }
        .recharts-legend-item-text { color: #94a3b8 !important; font-size: 11px !important; }
      `}</style>

      <div className="an-wrap max-w-6xl mx-auto pb-10 space-y-6">

        {/* ── Header ── */}
        <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
          className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background:"linear-gradient(135deg,rgba(201,168,76,0.15),rgba(201,168,76,0.05))", border:"1px solid rgba(201,168,76,0.2)" }}>
              <BarChart2 size={22} style={{ color:COLORS.gold }}/>
            </div>
            <div>
              <h1 style={{ fontFamily:"'Instrument Serif', serif", fontSize:"22px", color:"#f1f5f9", letterSpacing:"-0.01em" }}>
                {t("বিশ্লেষন","Analytics")}
              </h1>
              <p className="text-xs mt-0.5" style={{ color:"#475569" }}>
                {t("আপনার স্টোরের সম্পূর্ণ বিশ্লেষণ","Complete store analysis")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* countdown badge */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
              style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}>
              <motion.div
                animate={{ opacity:[1, 0.4, 1] }}
                transition={{ duration:1, repeat:Infinity }}
                className="w-1.5 h-1.5 rounded-full" style={{ background:COLORS.green }}/>
              <span className="text-[11px] font-medium" style={{ color:"#64748b" }}>
                {t("অটো আপডেট","Auto update")}
              </span>
              <span className="text-[11px] font-bold" style={{ color:COLORS.green }}>
                {fmtCountdown(countdown)}
              </span>
            </div>

            {/* last sync */}
            {lastSync && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl"
                style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}>
                <Activity size={11} style={{ color:"#475569" }}/>
                <span className="text-[11px]" style={{ color:"#475569" }}>
                  {lastSync.toLocaleTimeString("en-BD", { hour:"2-digit", minute:"2-digit", second:"2-digit" })}
                </span>
              </div>
            )}

            {/* manual refresh */}
            <button onClick={fetch_}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition"
              style={{ background:"rgba(201,168,76,0.1)", border:"1px solid rgba(201,168,76,0.2)", color:COLORS.gold }}>
              <RefreshCw size={13} className={loading ? "animate-spin" : ""}/>
              <span className="hidden sm:inline">{t("এখনই আপডেট","Refresh Now")}</span>
            </button>
          </div>
        </motion.div>

        {/* error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
              style={{ background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.2)", color:"#f87171" }}>
              <XCircle size={15}/> {error}
              <button onClick={fetch_} className="ml-auto underline text-xs">{t("আবার","Retry")}</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── KPI Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {kpis.map((k, i) => (
            <KpiCard key={k.label} {...k} loading={loading} index={i}/>
          ))}
        </div>

        {/* ── Revenue / Orders line chart with tabs ── */}
        <ChartCard
          title={t("রেভিনিউ ও অর্ডার ট্রেন্ড","Revenue & Order Trend")}
          subtitle={t("গত ১২ মাস","Last 12 months")}
          icon={TrendingUp} color={COLORS.gold} loading={loading} delay={0.15}>

          {/* tab switcher */}
          <div className="flex gap-2 mb-5">
            {[
              { key:"revenue", label:t("রেভিনিউ","Revenue") },
              { key:"orders",  label:t("অর্ডার","Orders") },
              { key:"daily",   label:t("দৈনিক (৩০দিন)","Daily (30d)") },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setTab(key)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                style={{
                  background: tab===key ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${tab===key ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.08)"}`,
                  color: tab===key ? COLORS.gold : "#64748b",
                }}>
                {label}
              </button>
            ))}
          </div>

          {tab === "daily" ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data?.dailyOrders||[]} margin={{ top:5, right:10, left:0, bottom:5 }}>
                <defs>
                  <linearGradient id="dailyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={COLORS.sky}  stopOpacity={0.25}/>
                    <stop offset="95%" stopColor={COLORS.sky}  stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="label" tick={{ fontSize:10 }} interval={4}/>
                <YAxis tick={{ fontSize:10 }}/>
                <Tooltip content={<DarkTooltip/>}/>
                <Area type="monotone" dataKey="count" name={t("অর্ডার","Orders")}
                  stroke={COLORS.sky} fill="url(#dailyGrad)" strokeWidth={2} dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          ) : tab === "orders" ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.revenueByMonth||[]} margin={{ top:5, right:10, left:0, bottom:5 }}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="label" tick={{ fontSize:10 }}/>
                <YAxis tick={{ fontSize:10 }}/>
                <Tooltip content={<DarkTooltip/>}/>
                <Bar dataKey="orders" name={t("অর্ডার","Orders")} fill={COLORS.blue} radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data?.revenueByMonth||[]} margin={{ top:5, right:10, left:0, bottom:5 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={COLORS.gold} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.gold} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="label" tick={{ fontSize:10 }}/>
                <YAxis tick={{ fontSize:10 }} tickFormatter={v => `৳${(v/1000).toFixed(0)}k`}/>
                <Tooltip content={<DarkTooltip prefix="৳"/>}/>
                <Area type="monotone" dataKey="revenue" name={t("রেভিনিউ","Revenue")}
                  stroke={COLORS.gold} fill="url(#revGrad)" strokeWidth={2.5} dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* ── Two-column row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Donut — order status */}
          <ChartCard title={t("স্ট্যাটাস ব্রেকডাউন","Status Breakdown")}
            subtitle={t("অর্ডার অনুযায়ী","By order status")}
            icon={PieChart} color={COLORS.purple} loading={loading} delay={0.2}>
            <ResponsiveContainer width="100%" height={260}>
              <RechartsPie>
                <Pie data={statusData} cx="50%" cy="50%"
                  innerRadius={65} outerRadius={100}
                  paddingAngle={3} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={{ stroke:"rgba(255,255,255,0.15)" }}>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} stroke="transparent"/>
                  ))}
                </Pie>
                <Tooltip content={<DarkTooltip/>}/>
              </RechartsPie>
            </ResponsiveContainer>
            {/* legend */}
            <div className="flex flex-wrap gap-2 mt-1">
              {statusData.map(s => (
                <span key={s.name} className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background:`${s.fill}15`, color:s.fill, border:`1px solid ${s.fill}25` }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background:s.fill }}/>
                  {s.name} ({s.value})
                </span>
              ))}
            </div>
          </ChartCard>

          {/* Payment method bar */}
          <ChartCard title={t("পেমেন্ট পদ্ধতি","Payment Methods")}
            subtitle={t("অর্ডার সংখ্যা ও রেভিনিউ","Count & revenue")}
            icon={BarChart2} color={COLORS.teal} loading={loading} delay={0.25}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={payData} margin={{ top:5, right:10, left:0, bottom:5 }}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="name" tick={{ fontSize:11 }}/>
                <YAxis yAxisId="left"  tick={{ fontSize:10 }}/>
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize:10 }} tickFormatter={v=>`৳${(v/1000).toFixed(0)}k`}/>
                <Tooltip content={<DarkTooltip/>}/>
                <Bar yAxisId="left"  dataKey="count"   name={t("অর্ডার","Orders")}  radius={[4,4,0,0]}>
                  {payData.map((e,i) => <Cell key={i} fill={e.fill}/>)}
                </Bar>
                <Bar yAxisId="right" dataKey="revenue" name={t("রেভিনিউ","Revenue")} radius={[4,4,0,0]} opacity={0.5}>
                  {payData.map((e,i) => <Cell key={i} fill={e.fill}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* ── Two-column row 2 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Top products */}
          <ChartCard title={t("সেরা পণ্য","Top Products")}
            subtitle={t("বিক্রির সংখ্যা অনুযায়ী","By units sold")}
            icon={Star} color={COLORS.gold} loading={loading} delay={0.3}>
            <div className="space-y-3">
              {(data?.topProducts||[]).map((p, i) => {
                const maxQty = data.topProducts[0]?.qty || 1;
                const pct    = Math.round((p.qty / maxQty) * 100);
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0"
                          style={{ background: i===0?"rgba(201,168,76,0.2)":"rgba(255,255,255,0.05)", color: i===0?COLORS.gold:"#64748b" }}>
                          {i+1}
                        </span>
                        <span className="text-xs font-medium truncate" style={{ color:"#e2e8f0" }}>{p.name}</span>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <span className="text-xs font-bold" style={{ color:COLORS.gold }}>{p.qty} {t("পিস","pcs")}</span>
                        <p className="text-[10px]" style={{ color:"#475569" }}>৳{p.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.06)" }}>
                      <motion.div className="h-full rounded-full"
                        initial={{ width:0 }} animate={{ width:`${pct}%` }}
                        transition={{ delay:0.4+i*0.08, duration:0.6, ease:"easeOut" }}
                        style={{ background: i===0 ? `linear-gradient(90deg,${COLORS.gold},${COLORS.orange})` : `linear-gradient(90deg,${COLORS.purple},${COLORS.blue})` }}/>
                    </div>
                  </div>
                );
              })}
              {(!data?.topProducts||data.topProducts.length===0) && (
                <p className="text-sm text-center py-8" style={{ color:"#475569" }}>
                  {t("কোনো বিক্রয় নেই","No sales data yet")}
                </p>
              )}
            </div>
          </ChartCard>

          {/* Top districts */}
          <ChartCard title={t("শীর্ষ জেলা","Top Districts")}
            subtitle={t("অর্ডার সংখ্যা অনুযায়ী","By order count")}
            icon={MapPin} color={COLORS.sky} loading={loading} delay={0.35}>
            <div className="space-y-3">
              {(data?.topDistricts||[]).map((d, i) => {
                const maxCount = data.topDistricts[0]?.count || 1;
                const pct      = Math.round((d.count / maxCount) * 100);
                const distColors = [COLORS.sky, COLORS.teal, COLORS.purple, COLORS.blue, COLORS.green];
                const c = distColors[i % distColors.length];
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0"
                          style={{ background:`${c}18`, color:c }}>{i+1}</span>
                        <span className="text-xs font-medium" style={{ color:"#e2e8f0" }}>{d.district}</span>
                      </div>
                      <span className="text-xs font-bold" style={{ color:c }}>{d.count} {t("অর্ডার","orders")}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.06)" }}>
                      <motion.div className="h-full rounded-full"
                        initial={{ width:0 }} animate={{ width:`${pct}%` }}
                        transition={{ delay:0.4+i*0.08, duration:0.6, ease:"easeOut" }}
                        style={{ background:c }}/>
                    </div>
                  </div>
                );
              })}
              {(!data?.topDistricts||data.topDistricts.length===0) && (
                <p className="text-sm text-center py-8" style={{ color:"#475569" }}>
                  {t("কোনো ডেটা নেই","No data yet")}
                </p>
              )}
            </div>
          </ChartCard>
        </div>

        {/* ── Daily revenue area (last 30 days) ── */}
        <ChartCard title={t("দৈনিক রেভিনিউ","Daily Revenue")}
          subtitle={t("গত ৩০ দিন","Last 30 days")}
          icon={Activity} color={COLORS.green} loading={loading} delay={0.4}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.dailyOrders||[]} margin={{ top:5, right:10, left:0, bottom:5 }}>
              <defs>
                <linearGradient id="drGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={COLORS.green} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={COLORS.green} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="label" tick={{ fontSize:10 }} interval={4}/>
              <YAxis tick={{ fontSize:10 }} tickFormatter={v => v>0?`৳${(v/1000).toFixed(0)}k`:0}/>
              <Tooltip content={<DarkTooltip prefix="৳"/>}/>
              <Area type="monotone" dataKey="revenue" name={t("রেভিনিউ","Revenue")}
                stroke={COLORS.green} fill="url(#drGrad)" strokeWidth={2} dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>
    </>
  );
}