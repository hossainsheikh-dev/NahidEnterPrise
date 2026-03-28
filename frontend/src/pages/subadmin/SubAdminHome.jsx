import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, CheckCircle, XCircle, Package, Link2, Layers,
  AlertCircle, RefreshCw, Clock, Zap, BarChart2, Activity,
  Truck, Star, ArrowRight, Target, ShieldCheck,
} from "lucide-react";
import {
  Card, Button, Tag, Skeleton, Alert, Badge, Tooltip,
  Typography, Space, Row, Col, Statistic, Progress,
  ConfigProvider, theme,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useSubLang } from "../../context/SubAdminLangContext";

const { Title, Text } = Typography;

const API = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;
const getToken = () => localStorage.getItem("subAdminToken") || "";
const safeArray = (v) =>
  Array.isArray(v) ? v :
  Array.isArray(v?.orders)   ? v.orders   :
  Array.isArray(v?.products) ? v.products :
  Array.isArray(v?.links)    ? v.links    :
  Array.isArray(v?.data)     ? v.data     : [];

/* ── Design Tokens ── */
const T = {
  // Content / top area — clean white
  bg:          "#f8f9fc",
  surface:     "#ffffff",
  surfaceHover:"#f5f7ff",
  border:      "#eaecf5",
  borderAccent:"#d4d7f5",

  // Sidebar dark (applied globally as CSS vars for sidebar)
  sidebarBg:   "#0d0f1a",
  sidebarText: "#e2e4f3",
  sidebarMuted:"#5b5f7a",
  sidebarAccent:"#7c7ff5",

  // Typography
  textPrimary:  "#0c0e1a",
  textSecondary:"#52556e",
  textMuted:    "#9799b8",

  // Brand accent
  accent:      "#5b5ef5",
  accentLight: "rgba(91,94,245,0.08)",
  accentBorder:"rgba(91,94,245,0.16)",

  // Status
  green:       "#12b76a",
  greenBg:     "rgba(18,183,106,0.08)",
  amber:       "#f59e0b",
  amberBg:     "rgba(245,158,11,0.08)",
  red:         "#ef4444",
  redBg:       "rgba(239,68,68,0.08)",
  blue:        "#3b82f6",
  blueBg:      "rgba(59,130,246,0.08)",
  violet:      "#8b5cf6",
  violetBg:    "rgba(139,92,246,0.08)",
  cyan:        "#06b6d4",
  cyanBg:      "rgba(6,182,212,0.08)",
  teal:        "#0d9488",
  tealBg:      "rgba(13,148,136,0.08)",

  shadow:      "0 1px 4px rgba(12,14,26,0.06), 0 4px 16px rgba(12,14,26,0.04)",
  shadowMd:    "0 4px 24px rgba(12,14,26,0.08), 0 1px 4px rgba(12,14,26,0.04)",
  shadowLg:    "0 8px 40px rgba(12,14,26,0.1)",

  radius:      "14px",
  radiusSm:    "10px",
};

/* ── Animated Counter ── */
function Counter({ value, prefix = "", suffix = "" }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const target = Number(value) || 0;
    const diff = target - prev.current;
    if (diff === 0) return;
    const steps = 48;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setDisplay(Math.round(prev.current + diff * (step / steps)));
      if (step >= steps) { clearInterval(timer); prev.current = target; }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <>{prefix}{display.toLocaleString("en-IN")}{suffix}</>;
}

/* ── Stat Card ── */
function StatCard({ icon: Icon, label, value, sub, color, colorBg, loading, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card
        variant="outlined"
        style={{
          borderRadius: T.radius,
          border: `1px solid ${T.border}`,
          background: T.surface,
          boxShadow: T.shadow,
          overflow: "hidden",
          position: "relative",
        }}
        styles={{ body: { padding: "20px 22px" } }}
      >
        {/* Subtle gradient top accent */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          borderRadius: "14px 14px 0 0",
        }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: T.textMuted, display: "block", marginBottom: 10 }}>
              {label}
            </Text>
            {loading ? (
              <Skeleton.Input active size="large" style={{ width: 80, height: 36 }} />
            ) : (
              <div style={{ fontSize: 32, fontWeight: 800, color: T.textPrimary, lineHeight: 1, letterSpacing: "-0.02em" }}>
                {typeof value === "number" ? <Counter value={value} /> : value}
              </div>
            )}
            {sub && <Text style={{ fontSize: 11, color: T.textMuted, display: "block", marginTop: 6 }}>{sub}</Text>}
          </div>
          <div style={{
            width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
            background: colorBg, flexShrink: 0, marginLeft: 12,
          }}>
            <Icon size={18} color={color} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/* ══════════════════════════════════
   ORDER BREAKDOWN
══════════════════════════════════ */
function OrderBreakdown({ stats, loading, t }) {
  if (!loading && !stats.totalOrders) return null;
  const pending = (stats.totalOrders || 0) - (stats.successOrders || 0) - (stats.cancelledOrders || 0);

  const rows = [
    {
      label: t("ডেলিভার্ড", "Delivered"), val: stats.successOrders || 0,
      pct: stats.totalOrders ? Math.round((stats.successOrders / stats.totalOrders) * 100) : 0,
      color: T.green, bg: T.greenBg, icon: CheckCircle,
    },
    {
      label: t("বাকি", "Pending"), val: pending,
      pct: stats.totalOrders ? Math.round((pending / stats.totalOrders) * 100) : 0,
      color: T.amber, bg: T.amberBg, icon: Clock,
    },
    {
      label: t("বাতিল", "Cancelled"), val: stats.cancelledOrders || 0,
      pct: stats.totalOrders ? Math.round(((stats.cancelledOrders || 0) / stats.totalOrders) * 100) : 0,
      color: T.red, bg: T.redBg, icon: XCircle,
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card
        variant="outlined"
        style={{ borderRadius: T.radius, border: `1px solid ${T.border}`, background: T.surface, boxShadow: T.shadow }}
        styles={{ body: { padding: 0 } }}
      >
        {/* Header */}
        <div style={{
          padding: "18px 24px", borderBottom: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Space size={12}>
            <div style={{
              width: 36, height: 36, borderRadius: T.radiusSm, display: "flex", alignItems: "center", justifyContent: "center",
              background: T.accentLight, border: `1px solid ${T.accentBorder}`,
            }}>
              <BarChart2 size={15} color={T.accent} />
            </div>
            <div>
              <Text strong style={{ fontSize: 14, color: T.textPrimary, display: "block", lineHeight: 1.3 }}>
                {t("অর্ডার ব্রেকডাউন", "Order Breakdown")}
              </Text>
              <Text style={{ fontSize: 11, color: T.textMuted }}>
                {stats.totalOrders} {t("টি মোট", "total orders")}
              </Text>
            </div>
          </Space>
          <Link to="/subadmin/orders">
            <Button
              size="small"
              style={{
                borderRadius: 8, fontSize: 11, fontWeight: 700,
                background: T.accentLight, borderColor: T.accentBorder, color: T.accent,
                height: 30,
              }}
              icon={<ArrowRight size={10} />}
              iconPosition="end"
            >
              {t("সব দেখুন", "View All")}
            </Button>
          </Link>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {/* Stacked bar */}
          <div style={{
            display: "flex", height: 6, borderRadius: 99, overflow: "hidden", gap: 2,
            background: "rgba(91,94,245,0.06)", marginBottom: 20,
          }}>
            {rows.map(({ val, color, pct }, i) =>
              pct > 0 ? (
                <motion.div
                  key={i}
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.4 + i * 0.08, duration: 0.7, ease: "easeOut" }}
                  style={{ height: "100%", borderRadius: 99, background: color }}
                />
              ) : null
            )}
          </div>

          {/* Stat tiles */}
          <Row gutter={[10, 10]}>
            {rows.map(({ label, val, pct, color, bg, icon: Icon }) => (
              <Col span={8} key={label}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45, duration: 0.3 }}
                >
                  <div style={{
                    borderRadius: T.radiusSm, padding: "14px 12px", textAlign: "center",
                    background: bg, border: `1px solid ${color}22`,
                  }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 10px", background: `${color}18`,
                    }}>
                      <Icon size={13} color={color} />
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 900, color, lineHeight: 1, letterSpacing: "-0.02em" }}>
                      {loading ? "—" : val}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: T.textMuted, marginTop: 4 }}>{label}</div>
                    <div style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                      <div style={{ flex: 1, height: 3, borderRadius: 99, background: `${color}18`, maxWidth: 44 }}>
                        <motion.div
                          style={{ height: "100%", borderRadius: 99, background: color }}
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.6, duration: 0.6 }}
                        />
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 800, color }}>{pct}%</span>
                    </div>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </div>
      </Card>
    </motion.div>
  );
}

/* ══════════════════════════════════
   RECENT ORDERS
══════════════════════════════════ */
function RecentOrders({ orders, loading, t }) {
  const STATUS = {
    pending:    { label: t("অপেক্ষা", "Pending"),    color: T.amber,  bg: T.amberBg   },
    processing: { label: t("প্যাকেজিং", "Packing"),  color: T.violet, bg: T.violetBg  },
    shipped:    { label: t("পথে", "Shipped"),         color: T.blue,   bg: T.blueBg    },
    confirmed:  { label: t("নিশ্চিত", "Confirmed"),  color: T.cyan,   bg: T.cyanBg    },
    delivered:  { label: t("পৌঁছেছে", "Delivered"),  color: T.green,  bg: T.greenBg   },
    cancelled:  { label: t("বাতিল", "Cancelled"),    color: T.red,    bg: T.redBg     },
  };
  const recent = orders.slice(0, 5);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
      <Card
        variant="outlined"
        style={{ borderRadius: T.radius, border: `1px solid ${T.border}`, background: T.surface, boxShadow: T.shadow }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{
          padding: "18px 24px", borderBottom: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Space size={12}>
            <div style={{
              width: 36, height: 36, borderRadius: T.radiusSm, display: "flex", alignItems: "center", justifyContent: "center",
              background: T.amberBg, border: "1px solid rgba(245,158,11,0.18)",
            }}>
              <Activity size={15} color={T.amber} />
            </div>
            <div>
              <Text strong style={{ fontSize: 14, color: T.textPrimary, display: "block", lineHeight: 1.3 }}>
                {t("সাম্প্রতিক অর্ডার", "Recent Orders")}
              </Text>
              <Text style={{ fontSize: 11, color: T.textMuted }}>
                {t("সর্বশেষ ৫টি", "Latest 5 orders")}
              </Text>
            </div>
          </Space>
          <Link to="/subadmin/delivery">
            <Button
              size="small"
              style={{
                borderRadius: 8, fontSize: 11, fontWeight: 700,
                background: T.amberBg, borderColor: "rgba(245,158,11,0.22)", color: T.amber,
                height: 30,
              }}
              icon={<ArrowRight size={10} />}
              iconPosition="end"
            >
              {t("সব দেখুন", "View All")}
            </Button>
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: "8px 0" }}>
            {Array(4).fill(0).map((_, i) => (
              <div key={i} style={{ padding: "14px 24px", borderBottom: `1px solid ${T.border}` }}>
                <Skeleton active avatar={{ size: 36, shape: "square" }} paragraph={{ rows: 1, width: "60%" }} title={false} />
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <ShoppingBag size={28} color={T.textMuted} strokeWidth={1.2} style={{ margin: "0 auto 10px", display: "block" }} />
            <Text style={{ color: T.textMuted, fontSize: 13 }}>{t("কোনো অর্ডার নেই", "No orders yet")}</Text>
          </div>
        ) : (
          recent.map((order, i) => {
            const st = STATUS[order.status] || STATUS.pending;
            const initial = (order.customer?.name || "?")[0].toUpperCase();
            return (
              <motion.div
                key={order._id || i}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "13px 24px",
                  borderBottom: i < recent.length - 1 ? `1px solid ${T.border}` : "none",
                  transition: "background 0.15s",
                  cursor: "default",
                }}
                onMouseEnter={e => e.currentTarget.style.background = T.surfaceHover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                {/* Avatar */}
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: T.accentLight, border: `1px solid ${T.accentBorder}`,
                  fontSize: 14, fontWeight: 800, color: T.accent,
                }}>
                  {initial}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text strong style={{ fontSize: 13, color: T.textPrimary, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {order.customer?.name || "—"}
                  </Text>
                  <Text style={{ fontSize: 11, color: T.textMuted }}>{order.orderId}</Text>
                </div>

                {/* Right */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <Text strong style={{ fontSize: 13, color: T.accent, display: "block" }}>
                    ৳{(order.total || 0).toLocaleString()}
                  </Text>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                    background: st.bg, color: st.color, display: "inline-block", marginTop: 2,
                  }}>
                    {st.label}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </Card>
    </motion.div>
  );
}

/* ══════════════════════════════════
   PERFORMANCE SUMMARY
══════════════════════════════════ */
function PerformanceSummary({ stats, loading, t }) {
  const deliveryRate = stats.totalOrders > 0 ? Math.round((stats.successOrders / stats.totalOrders) * 100) : 0;
  const cancelRate   = stats.totalOrders > 0 ? Math.round((stats.cancelledOrders / stats.totalOrders) * 100) : 0;

  const metrics = [
    { label: t("ডেলিভারি রেট", "Delivery Rate"), val: `${deliveryRate}%`, raw: deliveryRate, color: T.green,  colorBg: T.greenBg,  icon: Target,   sub: t("সফল ডেলিভারি", "Successful") },
    { label: t("বাতিল রেট", "Cancel Rate"),       val: `${cancelRate}%`,  raw: cancelRate,   color: T.red,    colorBg: T.redBg,    icon: XCircle,  sub: t("বাতিলকৃত", "Cancelled")     },
    { label: t("মোট পণ্য", "Products"),           val: stats.totalProducts || 0, color: T.accent, colorBg: T.accentLight, icon: Package, sub: t("আইটেম", "Items")              },
    { label: t("নেভ লিংক", "Nav Links"),          val: stats.totalLinks || 0,    color: T.cyan,   colorBg: T.cyanBg,   icon: Link2,    sub: t("লিংক", "Links")               },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
      <Card
        variant="outlined"
        style={{ borderRadius: T.radius, border: `1px solid ${T.border}`, background: T.surface, boxShadow: T.shadow }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: T.radiusSm, display: "flex", alignItems: "center", justifyContent: "center",
            background: T.greenBg, border: "1px solid rgba(18,183,106,0.18)",
          }}>
            <Star size={15} color={T.green} />
          </div>
          <div>
            <Text strong style={{ fontSize: 14, color: T.textPrimary, display: "block", lineHeight: 1.3 }}>
              {t("পারফরম্যান্স", "Performance")}
            </Text>
            <Text style={{ fontSize: 11, color: T.textMuted }}>{t("স্টোর মেট্রিক্স", "Store metrics")}</Text>
          </div>
        </div>

        <div style={{ padding: "18px 20px" }}>
          <Row gutter={[10, 10]}>
            {metrics.map(({ label, val, raw, color, colorBg, icon: Icon, sub }, i) => (
              <Col span={12} key={label}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.32 + i * 0.05 }}
                >
                  <div style={{
                    borderRadius: T.radiusSm, padding: "14px 14px",
                    background: colorBg, border: `1px solid ${color}20`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <Icon size={14} color={color} />
                      <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color, opacity: 0.5 }}>
                        {t("লাইভ", "live")}
                      </span>
                    </div>
                    {loading ? (
                      <Skeleton.Input active size="default" style={{ width: 60, height: 28 }} />
                    ) : (
                      <>
                        <div style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1, letterSpacing: "-0.02em" }}>
                          {typeof val === "number" ? <Counter value={val} /> : val}
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, marginTop: 4 }}>{label}</div>
                        <div style={{ fontSize: 9, color: T.textMuted, opacity: 0.75, marginTop: 2 }}>{sub}</div>
                        {typeof raw === "number" && (
                          <Progress
                            percent={raw}
                            size={[null, 3]}
                            showInfo={false}
                            strokeColor={color}
                            trailColor={`${color}18`}
                            style={{ marginTop: 8, marginBottom: 0 }}
                          />
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </div>
      </Card>
    </motion.div>
  );
}

/* ══════════════════════════════════
   QUICK ACTIONS
══════════════════════════════════ */
function QuickActions({ t }) {
  const actions = [
    { to: "/subadmin/orders",   icon: ShoppingBag, label: t("অর্ডার", "Orders"),     sub: t("ম্যানেজ করুন", "Manage"),    color: T.amber,  grad: "linear-gradient(135deg,#fbbf24,#f59e0b)" },
    { to: "/subadmin/products", icon: Package,     label: t("পণ্য", "Products"),      sub: t("স্টক দেখুন", "View stock"),  color: T.accent, grad: "linear-gradient(135deg,#818cf8,#5b5ef5)" },
    { to: "/subadmin/delivery", icon: Truck,       label: t("ডেলিভারি", "Delivery"),  sub: t("কনফার্ম করুন", "Confirm"),   color: T.green,  grad: "linear-gradient(135deg,#34d399,#12b76a)" },
    { to: "/subadmin/links",    icon: Link2,       label: t("লিংক", "Links"),         sub: t("নেভ লিংক", "Nav links"),     color: T.cyan,   grad: "linear-gradient(135deg,#38bdf8,#06b6d4)" },
    { to: "/subadmin/sublinks", icon: Layers,      label: t("সাবলিংক", "Sublinks"),   sub: t("ক্যাটাগরি", "Categories"),   color: T.violet, grad: "linear-gradient(135deg,#a78bfa,#8b5cf6)" },
    { to: "/subadmin/users",    icon: ShieldCheck, label: t("কাস্টমার", "Customers"), sub: t("ব্যবহারকারী", "Users"),      color: T.teal,   grad: "linear-gradient(135deg,#2dd4bf,#0d9488)"  },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <Zap size={13} color={T.accent} />
        <Text style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.textMuted }}>
          {t("দ্রুত অ্যাকশন", "Quick Actions")}
        </Text>
      </div>
      <Row gutter={[10, 10]}>
        {actions.map(({ to, icon: Icon, label, sub, color, grad }, i) => (
          <Col xs={8} sm={4} key={to}>
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 + i * 0.04 }}
              whileHover={{ y: -3 }}
            >
              <Link to={to} style={{ textDecoration: "none" }}>
                <Card
                  variant="outlined"
                  hoverable
                  style={{
                    borderRadius: T.radius, border: `1px solid ${T.border}`,
                    background: T.surface, boxShadow: T.shadow, textAlign: "center",
                    transition: "all 0.2s",
                  }}
                  styles={{ body: { padding: "16px 10px 14px" } }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = `${color}30`;
                    e.currentTarget.style.boxShadow = `0 8px 28px ${color}18`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = T.border;
                    e.currentTarget.style.boxShadow = T.shadow;
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center",
                    justifyContent: "center", margin: "0 auto 10px",
                    background: grad, boxShadow: `0 4px 14px ${color}28`,
                  }}>
                    <Icon size={18} color="#fff" strokeWidth={2} />
                  </div>
                  <Text strong style={{ fontSize: 11, color: T.textPrimary, display: "block", lineHeight: 1.3 }}>
                    {label}
                  </Text>
                  <Text style={{ fontSize: 10, color: T.textMuted, display: "none" }}>{sub}</Text>
                </Card>
              </Link>
            </motion.div>
          </Col>
        ))}
      </Row>
    </motion.div>
  );
}

/* ══════════════════════════════════
   MAIN — SubAdminHome
══════════════════════════════════ */
export default function SubAdminHome() {
  const { t } = useSubLang();

  const [stats,   setStats  ] = useState({});
  const [orders,  setOrders ] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError  ] = useState(null);
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

  useEffect(() => { fetchStats(); }, []); // eslint-disable-line

  const hour  = new Date().getHours();
  const greet = hour < 12
    ? t("শুভ সকাল 🌅", "Good Morning 🌅")
    : hour < 17
    ? t("শুভ দুপুর ☀️", "Good Afternoon ☀️")
    : t("শুভ সন্ধ্যা 🌙", "Good Evening 🌙");

  const topStats = [
    { icon: ShoppingBag, label: t("মোট অর্ডার", "Total Orders"),        value: stats.totalOrders || 0,   color: T.accent, colorBg: T.accentLight, sub: t("সব মিলিয়ে", "All orders"),       delay: 0.08 },
    { icon: CheckCircle,  label: t("সফল ডেলিভারি", "Delivered"),        value: stats.successOrders || 0, color: T.green,  colorBg: T.greenBg,     sub: t("সফলভাবে", "Successfully"),       delay: 0.12 },
    { icon: Star,         label: t("মোট রাজস্ব", "Total Revenue"),      value: `৳${(stats.totalRevenue || 0).toLocaleString()}`, color: T.amber,  colorBg: T.amberBg, sub: t("মোট আয়", "Earned"),           delay: 0.16 },
    { icon: Package,      label: t("মোট পণ্য", "Total Products"),       value: stats.totalProducts || 0, color: T.violet, colorBg: T.violetBg,    sub: t("স্টোরে", "In store"),            delay: 0.20 },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#5b5ef5",
          borderRadius: 10,
          fontFamily: "'DM Sans', sans-serif",
          colorBgContainer: T.surface,
          colorBorder: T.border,
        },
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&display=swap');

        /* ── Dark Sidebar Override ── */
        .ant-layout-sider,
        [class*="sider"],
        aside.ant-layout-sider {
          background: ${T.sidebarBg} !important;
        }
        .ant-menu-dark,
        .ant-layout-sider .ant-menu {
          background: ${T.sidebarBg} !important;
        }
        .ant-menu-dark .ant-menu-item,
        .ant-menu-dark .ant-menu-sub,
        .ant-layout-sider .ant-menu-item {
          color: ${T.sidebarText} !important;
        }
        .ant-menu-dark .ant-menu-item-selected,
        .ant-layout-sider .ant-menu-item-selected {
          background: rgba(124,127,245,0.18) !important;
          color: ${T.sidebarAccent} !important;
        }
        .ant-layout-sider .ant-menu-item:hover {
          background: rgba(124,127,245,0.1) !important;
          color: ${T.sidebarAccent} !important;
        }
        .ant-layout-header {
          background: ${T.surface} !important;
          border-bottom: 1px solid ${T.border} !important;
          box-shadow: 0 1px 0 ${T.border} !important;
        }

        /* Global dash styles */
        .sa-dash-v2 * { box-sizing: border-box; }
        .sa-dash-v2 {
          font-family: 'DM Sans', sans-serif;
          background: ${T.bg};
          min-height: 100vh;
        }
        .sa-dash-v2 .ant-card { transition: box-shadow 0.2s, border-color 0.2s; }
      `}</style>

      <div className="sa-dash-v2" style={{ padding: "24px 20px", maxWidth: 1100, margin: "0 auto" }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 24 }}
        >
          <div>
            <Title level={3} style={{
              margin: 0, fontWeight: 900, letterSpacing: "-0.02em",
              color: T.textPrimary, lineHeight: 1.2,
            }}>
              {greet}, <span style={{ color: T.accent }}>{subAdminInfo?.name?.split(" ")[0] || "SubAdmin"}</span> 👋
            </Title>
            <Space size={6} style={{ marginTop: 6 }}>
              <Clock size={11} color={T.textMuted} />
              <Text style={{ fontSize: 12, color: T.textMuted }}>
                {lastSync
                  ? `${t("সর্বশেষ সিঙ্ক", "Last synced")}: ${lastSync.toLocaleTimeString(t("bn-BD","en-BD"), { hour: "2-digit", minute: "2-digit" })}`
                  : t("লোড হচ্ছে...", "Loading...")}
              </Text>
            </Space>
          </div>

          <Tooltip title={t("ডেটা রিফ্রেশ করুন", "Refresh data")}>
            <Button
              icon={<ReloadOutlined spin={loading} />}
              onClick={fetchStats}
              style={{
                borderRadius: T.radiusSm, fontWeight: 700, fontSize: 13,
                background: T.accentLight, borderColor: T.accentBorder, color: T.accent,
                height: 38, paddingInline: 16,
              }}
            >
              {t("রিফ্রেশ", "Refresh")}
            </Button>
          </Tooltip>
        </motion.div>

        {/* ── Error ── */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginBottom: 20 }}>
              <Alert
                message={error}
                type="error"
                showIcon
                closable
                action={
                  <Button size="small" onClick={fetchStats} style={{ fontSize: 11, color: T.red, borderColor: T.red }}>
                    {t("আবার চেষ্টা", "Retry")}
                  </Button>
                }
                style={{ borderRadius: T.radiusSm }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Top Stat Cards ── */}
        <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
          {topStats.map((s, i) => (
            <Col xs={12} sm={6} key={s.label}>
              <StatCard {...s} loading={loading} />
            </Col>
          ))}
        </Row>

        {/* ── Order Breakdown + Performance ── */}
        <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
          <Col xs={24} lg={12}>
            <OrderBreakdown stats={stats} loading={loading} t={t} />
          </Col>
          <Col xs={24} lg={12}>
            <PerformanceSummary stats={stats} loading={loading} t={t} />
          </Col>
        </Row>

        {/* ── Recent Orders ── */}
        <div style={{ marginBottom: 16 }}>
          <RecentOrders orders={orders} loading={loading} t={t} />
        </div>

        {/* ── Quick Actions ── */}
        <QuickActions t={t} />
      </div>
    </ConfigProvider>
  );
}