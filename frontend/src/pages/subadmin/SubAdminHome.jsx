import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, CheckCircle, XCircle, Package, Link2, Layers,
  Clock, Zap, BarChart2, Activity, Truck, Star,
  ArrowRight, Target, ShieldCheck, TrendingUp, RefreshCw,
} from "lucide-react";
import {
  Button, Skeleton, Alert, Row, Col,
  ConfigProvider, theme, Typography,
} from "antd";
import { useSubLang } from "../../context/SubAdminLangContext";

const { Text } = Typography;

const API = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;
const getToken = () => localStorage.getItem("subAdminToken") || "";
const safeArray = (v) =>
  Array.isArray(v) ? v :
  Array.isArray(v?.orders)   ? v.orders   :
  Array.isArray(v?.products) ? v.products :
  Array.isArray(v?.links)    ? v.links    :
  Array.isArray(v?.data)     ? v.data     : [];

const T = {
  bg:          "#f1f3fb",
  surface:     "#ffffff",
  surfaceHover:"#f7f8ff",
  border:      "#e5e8f4",

  textPrimary:  "#0b0d1f",
  textSecondary:"#4a4e6e",
  textMuted:    "#9298bc",

  accent:      "#5c60f5",
  accentSoft:  "rgba(92,96,245,0.08)",
  accentBorder:"rgba(92,96,245,0.18)",

  green:       "#00b96b",
  greenSoft:   "rgba(0,185,107,0.08)",
  amber:       "#f5a623",
  amberSoft:   "rgba(245,166,35,0.08)",
  red:         "#f04444",
  redSoft:     "rgba(240,68,68,0.08)",
  blue:        "#3b82f6",
  blueSoft:    "rgba(59,130,246,0.08)",
  violet:      "#8b5cf6",
  violetSoft:  "rgba(139,92,246,0.08)",
  cyan:        "#06b6d4",
  cyanSoft:    "rgba(6,182,212,0.08)",
  teal:        "#0d9488",
  tealSoft:    "rgba(13,148,136,0.08)",

  shadow:  "0 1px 3px rgba(11,13,31,0.05), 0 4px 14px rgba(11,13,31,0.04)",
  radius:  "13px",
  radiusSm:"10px",
};

/* ── Animated Counter ── */
function Counter({ value }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const target = Number(value) || 0;
    const diff = target - prev.current;
    if (diff === 0) return;
    const steps = 50; let step = 0;
    const timer = setInterval(() => {
      step++;
      const ease = 1 - Math.pow(1 - step / steps, 3);
      setDisplay(Math.round(prev.current + diff * ease));
      if (step >= steps) { clearInterval(timer); prev.current = target; }
    }, 14);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display.toLocaleString("en-IN")}</>;
}

/* ── Stat Card ── */
function StatCard({ icon: Icon, label, value, sub, color, colorSoft, loading, delay = 0 }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.44, ease: [0.22, 1, 0.36, 1] }}
      style={{ height: "100%" }}
    >
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          borderRadius: T.radius,
          border: `1.5px solid ${hov ? color + "30" : T.border}`,
          background: T.surface,
          boxShadow: hov ? `0 6px 24px ${color}18` : T.shadow,
          overflow: "hidden",
          position: "relative",
          height: "100%",
          minHeight: 130,
          display: "flex",
          flexDirection: "column",
          transition: "box-shadow 0.2s, border-color 0.2s",
        }}
      >
        {/* top color bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${color}, ${color}55)`,
          opacity: hov ? 1 : 0.5,
          transition: "opacity 0.2s",
        }} />

        <div style={{ padding: "16px 15px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          {/* icon + label */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, display: "flex",
              alignItems: "center", justifyContent: "center",
              background: colorSoft, border: `1px solid ${color}1e`,
              flexShrink: 0,
            }}>
              <Icon size={15} color={color} strokeWidth={2} />
            </div>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
              textTransform: "uppercase", color: T.textMuted,
              textAlign: "right", lineHeight: 1.45,
            }}>
              {label}
            </span>
          </div>

          {/* value */}
          {loading ? (
            <Skeleton.Input active size="large" style={{ width: "55%", maxWidth: 76, height: 32, borderRadius: 6, display: "block" }} />
          ) : (
            <div style={{ fontSize: 28, fontWeight: 800, color: T.textPrimary, lineHeight: 1, letterSpacing: "-0.025em" }}>
              {typeof value === "number" ? <Counter value={value} /> : value}
            </div>
          )}

          {/* sub */}
          {sub && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, opacity: 0.5 }} />
              <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 500 }}>{sub}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Order Breakdown ── */
function OrderBreakdown({ stats, loading, t }) {
  if (!loading && !stats.totalOrders) return null;
  const pending = (stats.totalOrders || 0) - (stats.successOrders || 0) - (stats.cancelledOrders || 0);
  const rows = [
    { label: t("ডেলিভার্ড", "Delivered"), val: stats.successOrders || 0, pct: stats.totalOrders ? Math.round((stats.successOrders / stats.totalOrders) * 100) : 0, color: T.green, soft: T.greenSoft, icon: CheckCircle },
    { label: t("বাকি", "Pending"), val: pending, pct: stats.totalOrders ? Math.round((pending / stats.totalOrders) * 100) : 0, color: T.amber, soft: T.amberSoft, icon: Clock },
    { label: t("বাতিল", "Cancelled"), val: stats.cancelledOrders || 0, pct: stats.totalOrders ? Math.round(((stats.cancelledOrders || 0) / stats.totalOrders) * 100) : 0, color: T.red, soft: T.redSoft, icon: XCircle },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ height: "100%" }}>
      <div style={{ borderRadius: T.radius, border: `1.5px solid ${T.border}`, background: T.surface, boxShadow: T.shadow, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: T.accentSoft, border: `1px solid ${T.accentBorder}` }}>
              <BarChart2 size={13} color={T.accent} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{t("অর্ডার ব্রেকডাউন", "Order Breakdown")}</div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>{stats.totalOrders} {t("টি মোট", "total orders")}</div>
            </div>
          </div>
          <Link to="/subadmin/orders" style={{ textDecoration: "none" }}>
            <div className="sa-chip-btn" style={{ "--chip-color": T.accent, "--chip-soft": T.accentSoft, "--chip-border": T.accentBorder }}>
              {t("সব দেখুন", "View All")} <ArrowRight size={10} />
            </div>
          </Link>
        </div>
        <div style={{ padding: "16px 16px", flex: 1 }}>
          <div style={{ display: "flex", height: 6, borderRadius: 99, overflow: "hidden", gap: 2, background: "rgba(92,96,245,0.05)", marginBottom: 16 }}>
            {rows.map(({ color, pct }, i) => pct > 0 ? (
              <motion.div key={i} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.4 + i * 0.1, duration: 0.7, ease: "easeOut" }} style={{ height: "100%", borderRadius: 99, background: color }} />
            ) : null)}
          </div>
          <Row gutter={[8, 8]}>
            {rows.map(({ label, val, pct, color, soft, icon: Icon }) => (
              <Col span={8} key={label}>
                <motion.div initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.44 }}>
                  <div style={{ borderRadius: T.radiusSm, padding: "12px 8px 10px", textAlign: "center", background: soft, border: `1px solid ${color}1e` }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", background: `${color}14` }}>
                      <Icon size={11} color={color} />
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1, letterSpacing: "-0.02em" }}>{loading ? "—" : val}</div>
                    <div style={{ fontSize: 9.5, fontWeight: 600, color: T.textMuted, marginTop: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                    <div style={{ marginTop: 7, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                      <div style={{ flex: 1, height: 3, borderRadius: 99, background: `${color}14`, maxWidth: 36, overflow: "hidden" }}>
                        <motion.div style={{ height: "100%", borderRadius: 99, background: color }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.6, duration: 0.65 }} />
                      </div>
                      <span style={{ fontSize: 9.5, fontWeight: 800, color }}>{pct}%</span>
                    </div>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Recent Orders ── */
function RecentOrders({ orders, loading, t }) {
  const STATUS = {
    pending:    { label: t("অপেক্ষা", "Pending"),    color: T.amber,  soft: T.amberSoft  },
    processing: { label: t("প্যাকেজিং", "Packing"),  color: T.violet, soft: T.violetSoft },
    shipped:    { label: t("পথে", "Shipped"),         color: T.blue,   soft: T.blueSoft   },
    confirmed:  { label: t("নিশ্চিত", "Confirmed"),  color: T.cyan,   soft: T.cyanSoft   },
    delivered:  { label: t("পৌঁছেছে", "Delivered"),  color: T.green,  soft: T.greenSoft  },
    cancelled:  { label: t("বাতিল", "Cancelled"),    color: T.red,    soft: T.redSoft    },
  };
  const recent = orders.slice(0, 5);

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}>
      <div style={{ borderRadius: T.radius, border: `1.5px solid ${T.border}`, background: T.surface, boxShadow: T.shadow, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: T.amberSoft, border: "1px solid rgba(245,166,35,0.2)" }}>
              <Activity size={13} color={T.amber} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{t("সাম্প্রতিক অর্ডার", "Recent Orders")}</div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>{t("সর্বশেষ ৫টি", "Latest 5 orders")}</div>
            </div>
          </div>
          <Link to="/subadmin/delivery" style={{ textDecoration: "none" }}>
            <div className="sa-chip-btn" style={{ "--chip-color": T.amber, "--chip-soft": T.amberSoft, "--chip-border": "rgba(245,166,35,0.22)" }}>
              {t("সব দেখুন", "View All")} <ArrowRight size={10} />
            </div>
          </Link>
        </div>
        {loading ? (
          <div>{Array(4).fill(0).map((_, i) => <div key={i} style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}><Skeleton active avatar={{ size: 34, shape: "square" }} paragraph={{ rows: 1, width: "50%" }} title={false} /></div>)}</div>
        ) : recent.length === 0 ? (
          <div style={{ padding: "44px 16px", textAlign: "center" }}>
            <ShoppingBag size={24} color={T.textMuted} strokeWidth={1.2} style={{ margin: "0 auto 8px", display: "block" }} />
            <div style={{ color: T.textMuted, fontSize: 13 }}>{t("কোনো অর্ডার নেই", "No orders yet")}</div>
          </div>
        ) : recent.map((order, i) => {
          const st = STATUS[order.status] || STATUS.pending;
          const ini = (order.customer?.name || "?")[0].toUpperCase();
          return (
            <motion.div
              key={order._id || i}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.28 + i * 0.05 }}
              style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 16px", borderBottom: i < recent.length - 1 ? `1px solid ${T.border}` : "none", transition: "background 0.13s", cursor: "default" }}
              onMouseEnter={e => e.currentTarget.style.background = T.surfaceHover}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: T.accentSoft, border: `1px solid ${T.accentBorder}`, fontSize: 13, fontWeight: 800, color: T.accent }}>
                {ini}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: T.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{order.customer?.name || "—"}</div>
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>{order.orderId}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: T.accent }}>৳{(order.total || 0).toLocaleString()}</div>
                <span style={{ fontSize: 9.5, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: st.soft, color: st.color, display: "inline-block", marginTop: 3, border: `1px solid ${st.color}20` }}>
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

/* ── Performance Summary ── */
function PerformanceSummary({ stats, loading, t }) {
  const deliveryRate = stats.totalOrders > 0 ? Math.round((stats.successOrders / stats.totalOrders) * 100) : 0;
  const cancelRate   = stats.totalOrders > 0 ? Math.round((stats.cancelledOrders / stats.totalOrders) * 100) : 0;
  const metrics = [
    { label: t("ডেলিভারি রেট", "Delivery Rate"), val: `${deliveryRate}%`, raw: deliveryRate, color: T.green,  soft: T.greenSoft,  icon: Target,  sub: t("সফল", "Successful") },
    { label: t("বাতিল রেট", "Cancel Rate"),       val: `${cancelRate}%`,  raw: cancelRate,   color: T.red,    soft: T.redSoft,    icon: XCircle, sub: t("বাতিল", "Cancelled") },
    { label: t("মোট পণ্য", "Products"),           val: stats.totalProducts || 0, color: T.accent, soft: T.accentSoft, icon: Package, sub: t("আইটেম", "Items") },
    { label: t("নেভ লিংক", "Nav Links"),          val: stats.totalLinks || 0,    color: T.cyan,   soft: T.cyanSoft,   icon: Link2,   sub: t("লিংক", "Links")  },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} style={{ height: "100%" }}>
      <div style={{ borderRadius: T.radius, border: `1.5px solid ${T.border}`, background: T.surface, boxShadow: T.shadow, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: T.greenSoft, border: "1px solid rgba(0,185,107,0.2)" }}>
            <TrendingUp size={13} color={T.green} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{t("পারফরম্যান্স", "Performance")}</div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>{t("স্টোর মেট্রিক্স", "Store metrics")}</div>
          </div>
        </div>
        <div style={{ padding: "14px 14px", flex: 1 }}>
          <Row gutter={[8, 8]}>
            {metrics.map(({ label, val, raw, color, soft, icon: Icon, sub }, i) => (
              <Col span={12} key={label}>
                <motion.div initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.06 }}>
                  <div style={{ borderRadius: T.radiusSm, padding: "12px 11px", background: soft, border: `1px solid ${color}1c` }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ width: 25, height: 25, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: `${color}12`, border: `1px solid ${color}1e` }}>
                        <Icon size={11} color={color} />
                      </div>
                      <span style={{ fontSize: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color, opacity: 0.5 }}>{t("লাইভ", "live")}</span>
                    </div>
                    {loading ? (
                      <Skeleton.Input active size="default" style={{ width: "60%", maxWidth: 52, height: 24, borderRadius: 6, display: "block" }} />
                    ) : (
                      <>
                        <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1, letterSpacing: "-0.02em" }}>
                          {typeof val === "number" ? <Counter value={val} /> : val}
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: T.textMuted, marginTop: 3 }}>{label}</div>
                        <div style={{ fontSize: 9.5, color: T.textMuted, opacity: 0.65, marginTop: 1 }}>{sub}</div>
                        {typeof raw === "number" && (
                          <div style={{ marginTop: 8, height: 3, borderRadius: 99, background: `${color}16`, overflow: "hidden" }}>
                            <motion.div style={{ height: "100%", borderRadius: 99, background: color }} initial={{ width: 0 }} animate={{ width: `${raw}%` }} transition={{ delay: 0.6, duration: 0.7 }} />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Quick Actions ── */
function QuickActions({ t }) {
  const actions = [
    { to: "/subadmin/orders",   icon: ShoppingBag, label: t("অর্ডার", "Orders"),     color: T.amber,  grad: "linear-gradient(135deg,#fbbf24,#f59e0b)" },
    { to: "/subadmin/products", icon: Package,     label: t("পণ্য", "Products"),      color: T.accent, grad: "linear-gradient(135deg,#818cf8,#5c60f5)" },
    { to: "/subadmin/delivery", icon: Truck,       label: t("ডেলিভারি", "Delivery"),  color: T.green,  grad: "linear-gradient(135deg,#34d399,#00b96b)" },
    { to: "/subadmin/links",    icon: Link2,       label: t("লিংক", "Links"),         color: T.cyan,   grad: "linear-gradient(135deg,#38bdf8,#06b6d4)" },
    { to: "/subadmin/sublinks", icon: Layers,      label: t("সাবলিংক", "Sublinks"),   color: T.violet, grad: "linear-gradient(135deg,#a78bfa,#8b5cf6)" },
    { to: "/subadmin/users",    icon: ShieldCheck, label: t("কাস্টমার", "Customers"), color: T.teal,   grad: "linear-gradient(135deg,#2dd4bf,#0d9488)"  },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 11 }}>
        <Zap size={11} color={T.accent} />
        <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.textMuted }}>
          {t("দ্রুত অ্যাকশন", "Quick Actions")}
        </span>
      </div>
      <Row gutter={[10, 10]}>
        {actions.map(({ to, icon: Icon, label, color, grad }, i) => (
          <Col xs={8} sm={4} key={to}>
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36 + i * 0.04 }}
              whileHover={{ y: -3, transition: { duration: 0.16 } }}
            >
              <Link to={to} style={{ textDecoration: "none" }}>
                <div
                  className="sa-action-card"
                  style={{ "--ac": color }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 9px", background: grad, boxShadow: `0 4px 12px ${color}28` }}>
                    <Icon size={16} color="#fff" strokeWidth={2} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.textPrimary, lineHeight: 1.3 }}>{label}</div>
                </div>
              </Link>
            </motion.div>
          </Col>
        ))}
      </Row>
    </motion.div>
  );
}

/* ══════════════════════════════════
   MAIN
══════════════════════════════════ */
export default function SubAdminHome() {
  const { t } = useSubLang();

  const [stats,    setStats   ] = useState({});
  const [orders,   setOrders  ] = useState([]);
  const [loading,  setLoading ] = useState(true);
  const [error,    setError   ] = useState(null);
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
      const [ordersRaw, deliveryRaw, productsRaw, linksRaw] = results.map(r => r.status === "fulfilled" ? r.value : []);
      const pendingOrders  = safeArray(ordersRaw);
      const deliveryOrders = safeArray(deliveryRaw);
      const seen = new Set();
      const allOrders = [...pendingOrders, ...deliveryOrders].filter(o => { if (seen.has(o._id)) return false; seen.add(o._id); return true; });
      const products = safeArray(productsRaw);
      const links    = safeArray(linksRaw);
      const successOrders   = allOrders.filter(o => ["delivered", "confirmed"].includes(o.status)).length;
      const cancelledOrders = allOrders.filter(o => o.status === "cancelled").length;
      const totalRevenue    = allOrders.filter(o => ["delivered", "confirmed"].includes(o.status)).reduce((s, o) => s + (Number(o.total) || 0), 0);
      setStats({ totalOrders: allOrders.length, successOrders, cancelledOrders, totalProducts: products.length, totalLinks: links.length, totalRevenue });
      setOrders([...allOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setLastSync(new Date());
    } catch (err) {
      console.error(err);
      setError(t("ডেটা লোড করতে সমস্যা হয়েছে।", "Failed to load data."));
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []); // eslint-disable-line

  const hour  = new Date().getHours();
  const greet = hour < 12 ? t("শুভ সকাল 🌅", "Good Morning 🌅") : hour < 17 ? t("শুভ দুপুর ☀️", "Good Afternoon ☀️") : t("শুভ সন্ধ্যা 🌙", "Good Evening 🌙");

  const topStats = [
    { icon: ShoppingBag, label: t("মোট অর্ডার", "Total Orders"),   value: stats.totalOrders || 0,   color: T.accent, colorSoft: T.accentSoft, sub: t("সব মিলিয়ে", "All orders"),  delay: 0.07 },
    { icon: CheckCircle, label: t("সফল ডেলিভারি", "Delivered"),    value: stats.successOrders || 0, color: T.green,  colorSoft: T.greenSoft,  sub: t("সফলভাবে", "Successfully"), delay: 0.12 },
    { icon: Star,        label: t("মোট রাজস্ব", "Total Revenue"),  value: `৳${(stats.totalRevenue || 0).toLocaleString()}`, color: T.amber, colorSoft: T.amberSoft, sub: t("মোট আয়", "Earned"), delay: 0.17 },
    { icon: Package,     label: t("মোট পণ্য", "Total Products"),   value: stats.totalProducts || 0, color: T.violet, colorSoft: T.violetSoft, sub: t("স্টোরে", "In store"),       delay: 0.22 },
  ];

  return (
    <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm, token: { colorPrimary: "#5c60f5", borderRadius: 10, fontFamily: "'Plus Jakarta Sans', sans-serif", colorBgContainer: T.surface, colorBorder: T.border } }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .sa-home { font-family: 'Plus Jakarta Sans', sans-serif; background: ${T.bg}; min-height: 100vh; }
        .sa-home *, .sa-home *::before, .sa-home *::after { box-sizing: border-box; }

        .sa-wrap { padding: 18px 14px 28px; max-width: 1100px; margin: 0 auto; }
        @media (max-width: 640px) { .sa-wrap { padding: 12px 10px 20px; } }
        @media (max-width: 380px) { .sa-wrap { padding: 10px 8px 18px; } }

        .sa-header-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin-bottom: 18px; }

        .sa-greeting { margin: 0; font-weight: 800; letter-spacing: -0.022em; color: ${T.textPrimary}; line-height: 1.2; font-size: 21px; }
        @media (max-width: 480px) { .sa-greeting { font-size: 17px; } }

        /* Stat grid: 4col → 2col */
        .sa-stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 12px; align-items: stretch; }
        @media (max-width: 860px) { .sa-stat-grid { grid-template-columns: repeat(2, 1fr); gap: 9px; } }
        @media (max-width: 400px) { .sa-stat-grid { grid-template-columns: repeat(2, 1fr); gap: 7px; } }

        /* Fix Ant skeleton not respecting percentage width on mobile */
        .sa-home .ant-skeleton-input { min-width: unset !important; width: 55% !important; max-width: 76px !important; }

        /* chip button */
        .sa-chip-btn {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 5px 10px; border-radius: 8px; font-size: 11px; font-weight: 700;
          background: var(--chip-soft); border: 1px solid var(--chip-border); color: var(--chip-color);
          cursor: pointer; white-space: nowrap; transition: opacity 0.15s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .sa-chip-btn:hover { opacity: 0.8; }

        /* action card */
        .sa-action-card {
          border-radius: ${T.radius}; border: 1.5px solid ${T.border};
          background: ${T.surface}; box-shadow: ${T.shadow};
          text-align: center; padding: 15px 8px 13px;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
          cursor: pointer;
        }
        .sa-action-card:hover {
          border-color: color-mix(in srgb, var(--ac) 25%, transparent);
          box-shadow: 0 8px 22px color-mix(in srgb, var(--ac) 16%, transparent);
        }

        /* kill ant row negative margin */
        .sa-home .ant-row { margin-left: 0 !important; margin-right: 0 !important; }

        /* refresh btn */
        .sa-refresh {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 15px; border-radius: 10px; font-size: 12.5px; font-weight: 700;
          background: ${T.accentSoft}; border: 1.5px solid ${T.accentBorder}; color: ${T.accent};
          cursor: pointer; outline: none; white-space: nowrap;
          transition: background 0.15s, color 0.15s, box-shadow 0.15s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .sa-refresh:hover { background: ${T.accent}; color: #fff; box-shadow: 0 4px 14px rgba(92,96,245,0.24); }
        @media (max-width: 480px) { .sa-refresh { padding: 7px 11px; font-size: 12px; } }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .sa-spin { animation: spin 0.75s linear infinite; }

        /* gap between sections */
        .sa-sec { margin-bottom: 12px; }
      `}</style>

      <div className="sa-home">
        <div className="sa-wrap">

          {/* ── Header ── */}
          <motion.div
            className="sa-header-row"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            <div>
              <h2 className="sa-greeting">
                {greet},{" "}
                <span style={{ color: T.accent }}>{subAdminInfo?.name?.split(" ")[0] || "SubAdmin"}</span> 👋
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5 }}>
                <Clock size={10} color={T.textMuted} />
                <span style={{ fontSize: 11.5, color: T.textMuted, fontWeight: 500 }}>
                  {lastSync
                    ? `${t("সর্বশেষ সিঙ্ক", "Last synced")}: ${lastSync.toLocaleTimeString(t("bn-BD", "en-BD"), { hour: "2-digit", minute: "2-digit" })}`
                    : t("লোড হচ্ছে...", "Loading...")}
                </span>
              </div>
            </div>

            <button className="sa-refresh" onClick={fetchStats}>
              <RefreshCw size={12} className={loading ? "sa-spin" : ""} />
              {t("রিফ্রেশ", "Refresh")}
            </button>
          </motion.div>

          {/* ── Error ── */}
          <AnimatePresence>
            {error && (
              <motion.div className="sa-sec" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Alert message={error} type="error" showIcon closable
                  action={<Button size="small" onClick={fetchStats} style={{ fontSize: 11, color: T.red, borderColor: T.red }}>{t("আবার চেষ্টা", "Retry")}</Button>}
                  style={{ borderRadius: T.radiusSm }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Stat Cards ── */}
          <div className="sa-stat-grid">
            {topStats.map(s => <StatCard key={s.label} {...s} loading={loading} />)}
          </div>

          {/* ── Breakdown + Performance ── */}
          <div className="sa-sec">
            <Row gutter={[12, 12]}>
              <Col xs={24} lg={12}><OrderBreakdown stats={stats} loading={loading} t={t} /></Col>
              <Col xs={24} lg={12}><PerformanceSummary stats={stats} loading={loading} t={t} /></Col>
            </Row>
          </div>

          {/* ── Recent Orders ── */}
          <div className="sa-sec">
            <RecentOrders orders={orders} loading={loading} t={t} />
          </div>

          {/* ── Quick Actions ── */}
          <QuickActions t={t} />

        </div>
      </div>
    </ConfigProvider>
  );
}