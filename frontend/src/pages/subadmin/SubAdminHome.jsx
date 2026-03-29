import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, CheckCircle, XCircle, Package, Link2, Layers,
  AlertCircle, RefreshCw, Clock, Zap, BarChart2, Activity,
  Truck, Star, ArrowRight, Target, ShieldCheck, TrendingUp,
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
  bg:           "#f0f2fa",
  surface:      "#ffffff",
  surfaceHover: "#f6f7ff",
  glass:        "rgba(255,255,255,0.72)",
  glassBorder:  "rgba(255,255,255,0.9)",
  border:       "#e4e7f5",
  borderAccent: "#c9cdf0",

  textPrimary:  "#0a0c1e",
  textSecondary:"#4a4e6b",
  textMuted:    "#8f93b8",

  accent:       "#5b5ef5",
  accentLight:  "rgba(91,94,245,0.07)",
  accentBorder: "rgba(91,94,245,0.15)",
  accentGlow:   "rgba(91,94,245,0.18)",

  green:        "#00b96b",
  greenLight:   "rgba(0,185,107,0.08)",
  greenGlow:    "rgba(0,185,107,0.22)",
  amber:        "#f59e0b",
  amberLight:   "rgba(245,158,11,0.08)",
  amberGlow:    "rgba(245,158,11,0.22)",
  red:          "#ef4444",
  redLight:     "rgba(239,68,68,0.08)",
  redGlow:      "rgba(239,68,68,0.2)",
  blue:         "#3b82f6",
  blueLight:    "rgba(59,130,246,0.08)",
  violet:       "#8b5cf6",
  violetLight:  "rgba(139,92,246,0.08)",
  cyan:         "#06b6d4",
  cyanLight:    "rgba(6,182,212,0.08)",
  teal:         "#0d9488",
  tealLight:    "rgba(13,148,136,0.08)",

  shadow:    "0 1px 3px rgba(10,12,30,0.05), 0 6px 20px rgba(10,12,30,0.04)",
  shadowMd:  "0 4px 24px rgba(10,12,30,0.07), 0 1px 4px rgba(10,12,30,0.04)",
  shadowLg:  "0 12px 48px rgba(10,12,30,0.1)",
  shadowGlow:"0 8px 32px rgba(91,94,245,0.16)",

  radius:   "16px",
  radiusSm: "11px",
  radiusXs: "8px",
};

/* ── Animated Counter ── */
function Counter({ value, prefix = "", suffix = "" }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const target = Number(value) || 0;
    const diff = target - prev.current;
    if (diff === 0) return;
    const steps = 52;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const ease = 1 - Math.pow(1 - step / steps, 3);
      setDisplay(Math.round(prev.current + diff * ease));
      if (step >= steps) { clearInterval(timer); prev.current = target; }
    }, 14);
    return () => clearInterval(timer);
  }, [value]);
  return <>{prefix}{display.toLocaleString("en-IN")}{suffix}</>;
}

/* ── Sparkline SVG ── */
function Sparkline({ color, height = 36 }) {
  const pts = useRef(
    Array.from({ length: 10 }, () => Math.random() * 0.6 + 0.2)
  ).current;
  const w = 80, h = height;
  const points = pts.map((v, i) => `${(i / (pts.length - 1)) * w},${h - v * h}`).join(" ");
  const area = `M0,${h} L${points.split(" ").map(p => p).join(" L")} L${w},${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace("#","")})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      {/* Last dot */}
      {(() => {
        const last = pts[pts.length - 1];
        return <circle cx={w} cy={h - last * h} r="3" fill={color} opacity="0.9" />;
      })()}
    </svg>
  );
}

/* ── Stat Card ── */
function StatCard({ icon: Icon, label, value, sub, color, colorBg, loading, delay = 0, trend }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ height: "100%" }}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderRadius: T.radius,
          border: `1px solid ${hovered ? color + "30" : T.border}`,
          background: T.surface,
          boxShadow: hovered
            ? `0 8px 32px ${color}18, 0 1px 4px rgba(10,12,30,0.06)`
            : T.shadow,
          overflow: "hidden",
          position: "relative",
          height: "100%",
          minHeight: 148,
          display: "flex",
          flexDirection: "column",
          transition: "box-shadow 0.25s, border-color 0.25s",
          cursor: "default",
        }}
      >
        {/* Top gradient bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${color}cc, ${color}44)`,
          borderRadius: "16px 16px 0 0",
          transition: "opacity 0.2s",
          opacity: hovered ? 1 : 0.6,
        }} />

        {/* Subtle background glow */}
        <div style={{
          position: "absolute", top: -30, right: -20, width: 110, height: 110,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`,
          pointerEvents: "none",
          transition: "opacity 0.3s",
          opacity: hovered ? 1 : 0.5,
        }} />

        <div style={{ padding: "20px 22px 16px", flex: 1, display: "flex", flexDirection: "column", position: "relative", zIndex: 1 }}>
          {/* Top row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
              background: colorBg,
              border: `1px solid ${color}20`,
              boxShadow: hovered ? `0 4px 16px ${color}22` : "none",
              transition: "box-shadow 0.25s",
              flexShrink: 0,
            }}>
              <Icon size={17} color={color} strokeWidth={2} />
            </div>
            {/* Sparkline */}
            <div style={{ opacity: 0.65, marginTop: 2 }}>
              <Sparkline color={color} height={32} />
            </div>
          </div>

          {/* Value */}
          {loading ? (
            <Skeleton.Input active size="large" style={{ width: 88, height: 38, borderRadius: 8 }} />
          ) : (
            <div style={{
              fontSize: 34, fontWeight: 900, color: T.textPrimary,
              lineHeight: 1, letterSpacing: "-0.03em",
              fontFamily: "'Syne', sans-serif",
            }}>
              {typeof value === "number" ? <Counter value={value} /> : value}
            </div>
          )}

          {/* Label + sub */}
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: T.textMuted }}>
              {label}
            </div>
            {sub && (
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, opacity: 0.6 }} />
                {sub}
              </div>
            )}
          </div>
        </div>
      </div>
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
    { label: t("ডেলিভার্ড", "Delivered"), val: stats.successOrders || 0, pct: stats.totalOrders ? Math.round((stats.successOrders / stats.totalOrders) * 100) : 0, color: T.green,  bg: T.greenLight,  icon: CheckCircle },
    { label: t("বাকি", "Pending"),        val: pending,                   pct: stats.totalOrders ? Math.round((pending / stats.totalOrders) * 100) : 0,               color: T.amber,  bg: T.amberLight,  icon: Clock       },
    { label: t("বাতিল", "Cancelled"),    val: stats.cancelledOrders || 0, pct: stats.totalOrders ? Math.round(((stats.cancelledOrders || 0) / stats.totalOrders) * 100) : 0, color: T.red, bg: T.redLight, icon: XCircle  },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ height: "100%" }}>
      <div style={{
        borderRadius: T.radius, border: `1px solid ${T.border}`,
        background: T.surface, boxShadow: T.shadow, overflow: "hidden", height: "100%",
        display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 22px", borderBottom: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "linear-gradient(135deg, #fafaff 0%, #ffffff 100%)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: T.radiusSm, display: "flex", alignItems: "center", justifyContent: "center",
              background: T.accentLight, border: `1px solid ${T.accentBorder}`,
              boxShadow: "0 2px 8px rgba(91,94,245,0.1)",
            }}>
              <BarChart2 size={15} color={T.accent} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.textPrimary, lineHeight: 1.3, fontFamily: "'Syne', sans-serif" }}>
                {t("অর্ডার ব্রেকডাউন", "Order Breakdown")}
              </div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>
                {stats.totalOrders} {t("টি মোট", "total orders")}
              </div>
            </div>
          </div>
          <Link to="/subadmin/orders">
            <button style={{
              display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
              borderRadius: T.radiusXs, fontSize: 11, fontWeight: 700,
              background: T.accentLight, border: `1px solid ${T.accentBorder}`, color: T.accent,
              cursor: "pointer", outline: "none", transition: "all 0.15s",
            }}>
              {t("সব দেখুন", "View All")} <ArrowRight size={10} />
            </button>
          </Link>
        </div>

        <div style={{ padding: "20px 22px", flex: 1 }}>
          {/* Segmented bar */}
          <div style={{
            display: "flex", height: 8, borderRadius: 99, overflow: "hidden", gap: 3,
            background: "rgba(91,94,245,0.05)", marginBottom: 22,
            boxShadow: "inset 0 1px 3px rgba(10,12,30,0.06)",
          }}>
            {rows.map(({ val, color, pct }, i) =>
              pct > 0 ? (
                <motion.div key={i}
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                  style={{ height: "100%", borderRadius: 99, background: color, boxShadow: `0 0 8px ${color}55` }}
                />
              ) : null
            )}
          </div>

          {/* Tiles */}
          <Row gutter={[10, 10]}>
            {rows.map(({ label, val, pct, color, bg, icon: Icon }) => (
              <Col span={8} key={label}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45, duration: 0.3 }}
                >
                  <div style={{
                    borderRadius: T.radiusSm, padding: "14px 10px 12px", textAlign: "center",
                    background: bg, border: `1px solid ${color}22`,
                    position: "relative", overflow: "hidden",
                  }}>
                    <div style={{
                      position: "absolute", bottom: -8, right: -8, width: 50, height: 50,
                      borderRadius: "50%", background: `${color}10`, pointerEvents: "none",
                    }} />
                    <div style={{
                      width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 10px", background: `${color}16`, border: `1px solid ${color}24`,
                    }}>
                      <Icon size={13} color={color} />
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1, letterSpacing: "-0.02em", fontFamily: "'Syne', sans-serif" }}>
                      {loading ? "—" : val}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
                    <div style={{ marginTop: 9, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                      <div style={{ flex: 1, height: 3, borderRadius: 99, background: `${color}14`, maxWidth: 40, overflow: "hidden" }}>
                        <motion.div
                          style={{ height: "100%", borderRadius: 99, background: color }}
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.6, duration: 0.7 }}
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
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════
   RECENT ORDERS
══════════════════════════════════ */
function RecentOrders({ orders, loading, t }) {
  const STATUS = {
    pending:    { label: t("অপেক্ষা", "Pending"),    color: T.amber,  bg: T.amberLight  },
    processing: { label: t("প্যাকেজিং", "Packing"),  color: T.violet, bg: T.violetLight },
    shipped:    { label: t("পথে", "Shipped"),         color: T.blue,   bg: T.blueLight   },
    confirmed:  { label: t("নিশ্চিত", "Confirmed"),  color: T.cyan,   bg: T.cyanLight   },
    delivered:  { label: t("পৌঁছেছে", "Delivered"),  color: T.green,  bg: T.greenLight  },
    cancelled:  { label: t("বাতিল", "Cancelled"),    color: T.red,    bg: T.redLight    },
  };
  const recent = orders.slice(0, 5);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
      <div style={{
        borderRadius: T.radius, border: `1px solid ${T.border}`,
        background: T.surface, boxShadow: T.shadow, overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 22px", borderBottom: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "linear-gradient(135deg, #fffdf5 0%, #ffffff 100%)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: T.radiusSm, display: "flex", alignItems: "center", justifyContent: "center",
              background: T.amberLight, border: "1px solid rgba(245,158,11,0.2)",
              boxShadow: "0 2px 8px rgba(245,158,11,0.12)",
            }}>
              <Activity size={15} color={T.amber} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.textPrimary, lineHeight: 1.3, fontFamily: "'Syne', sans-serif" }}>
                {t("সাম্প্রতিক অর্ডার", "Recent Orders")}
              </div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>
                {t("সর্বশেষ ৫টি", "Latest 5 orders")}
              </div>
            </div>
          </div>
          <Link to="/subadmin/delivery">
            <button style={{
              display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
              borderRadius: T.radiusXs, fontSize: 11, fontWeight: 700,
              background: T.amberLight, border: "1px solid rgba(245,158,11,0.22)", color: T.amber,
              cursor: "pointer", outline: "none",
            }}>
              {t("সব দেখুন", "View All")} <ArrowRight size={10} />
            </button>
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: "6px 0" }}>
            {Array(4).fill(0).map((_, i) => (
              <div key={i} style={{ padding: "14px 22px", borderBottom: `1px solid ${T.border}` }}>
                <Skeleton active avatar={{ size: 38, shape: "square" }} paragraph={{ rows: 1, width: "55%" }} title={false} />
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div style={{ padding: "52px 22px", textAlign: "center" }}>
            <ShoppingBag size={28} color={T.textMuted} strokeWidth={1.2} style={{ margin: "0 auto 10px", display: "block" }} />
            <div style={{ color: T.textMuted, fontSize: 13 }}>{t("কোনো অর্ডার নেই", "No orders yet")}</div>
          </div>
        ) : (
          recent.map((order, i) => {
            const st = STATUS[order.status] || STATUS.pending;
            const initial = (order.customer?.name || "?")[0].toUpperCase();
            return (
              <motion.div
                key={order._id || i}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.055 }}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "13px 22px",
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
                  background: `linear-gradient(135deg, ${T.accentLight}, rgba(91,94,245,0.14))`,
                  border: `1px solid ${T.accentBorder}`,
                  fontSize: 14, fontWeight: 900, color: T.accent,
                  fontFamily: "'Syne', sans-serif",
                }}>
                  {initial}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {order.customer?.name || "—"}
                  </div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>{order.orderId}</div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: T.accent }}>
                    ৳{(order.total || 0).toLocaleString()}
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                    background: st.bg, color: st.color, display: "inline-block", marginTop: 3,
                    border: `1px solid ${st.color}20`,
                  }}>
                    {st.label}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
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
    { label: t("ডেলিভারি রেট", "Delivery Rate"), val: `${deliveryRate}%`, raw: deliveryRate, color: T.green,  colorBg: T.greenLight,  icon: Target,  sub: t("সফল ডেলিভারি", "Successful") },
    { label: t("বাতিল রেট", "Cancel Rate"),       val: `${cancelRate}%`,  raw: cancelRate,   color: T.red,    colorBg: T.redLight,    icon: XCircle, sub: t("বাতিলকৃত", "Cancelled")     },
    { label: t("মোট পণ্য", "Products"),           val: stats.totalProducts || 0, color: T.accent, colorBg: T.accentLight, icon: Package, sub: t("আইটেম", "Items")             },
    { label: t("নেভ লিংক", "Nav Links"),          val: stats.totalLinks || 0,    color: T.cyan,   colorBg: T.cyanLight,   icon: Link2,   sub: t("লিংক", "Links")              },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} style={{ height: "100%" }}>
      <div style={{
        borderRadius: T.radius, border: `1px solid ${T.border}`,
        background: T.surface, boxShadow: T.shadow, overflow: "hidden", height: "100%",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{
          padding: "18px 22px", borderBottom: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", gap: 12,
          background: "linear-gradient(135deg, #f5fff9 0%, #ffffff 100%)",
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: T.radiusSm, display: "flex", alignItems: "center", justifyContent: "center",
            background: T.greenLight, border: "1px solid rgba(0,185,107,0.2)",
            boxShadow: "0 2px 8px rgba(0,185,107,0.12)",
          }}>
            <TrendingUp size={15} color={T.green} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: T.textPrimary, lineHeight: 1.3, fontFamily: "'Syne', sans-serif" }}>
              {t("পারফরম্যান্স", "Performance")}
            </div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>{t("স্টোর মেট্রিক্স", "Store metrics")}</div>
          </div>
        </div>

        <div style={{ padding: "18px 18px", flex: 1 }}>
          <Row gutter={[10, 10]}>
            {metrics.map(({ label, val, raw, color, colorBg, icon: Icon, sub }, i) => (
              <Col span={12} key={label}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.32 + i * 0.06 }}
                >
                  <div style={{
                    borderRadius: T.radiusSm, padding: "14px 13px",
                    background: colorBg, border: `1px solid ${color}1e`,
                    position: "relative", overflow: "hidden",
                  }}>
                    <div style={{
                      position: "absolute", top: -12, right: -12, width: 60, height: 60,
                      borderRadius: "50%", background: `${color}0d`, pointerEvents: "none",
                    }} />
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                        background: `${color}14`, border: `1px solid ${color}20`,
                      }}>
                        <Icon size={13} color={color} />
                      </div>
                      <span style={{ fontSize: 8.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color, opacity: 0.55 }}>
                        {t("লাইভ", "live")}
                      </span>
                    </div>
                    {loading ? (
                      <Skeleton.Input active size="default" style={{ width: 60, height: 28, borderRadius: 6 }} />
                    ) : (
                      <>
                        <div style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1, letterSpacing: "-0.02em", fontFamily: "'Syne', sans-serif" }}>
                          {typeof val === "number" ? <Counter value={val} /> : val}
                        </div>
                        <div style={{ fontSize: 10.5, fontWeight: 700, color: T.textMuted, marginTop: 4 }}>{label}</div>
                        <div style={{ fontSize: 9.5, color: T.textMuted, opacity: 0.7, marginTop: 2 }}>{sub}</div>
                        {typeof raw === "number" && (
                          <div style={{ marginTop: 9, height: 3, borderRadius: 99, background: `${color}18`, overflow: "hidden" }}>
                            <motion.div
                              style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${color}, ${color}aa)` }}
                              initial={{ width: 0 }} animate={{ width: `${raw}%` }}
                              transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                            />
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

/* ══════════════════════════════════
   QUICK ACTIONS
══════════════════════════════════ */
function QuickActions({ t }) {
  const actions = [
    { to: "/subadmin/orders",   icon: ShoppingBag, label: t("অর্ডার", "Orders"),     sub: t("ম্যানেজ করুন", "Manage"),    color: T.amber,  grad: "linear-gradient(135deg,#fbbf24,#f59e0b)" },
    { to: "/subadmin/products", icon: Package,     label: t("পণ্য", "Products"),      sub: t("স্টক দেখুন", "View stock"),  color: T.accent, grad: "linear-gradient(135deg,#818cf8,#5b5ef5)" },
    { to: "/subadmin/delivery", icon: Truck,       label: t("ডেলিভারি", "Delivery"),  sub: t("কনফার্ম করুন", "Confirm"),   color: T.green,  grad: "linear-gradient(135deg,#34d399,#00b96b)" },
    { to: "/subadmin/links",    icon: Link2,       label: t("লিংক", "Links"),         sub: t("নেভ লিংক", "Nav links"),     color: T.cyan,   grad: "linear-gradient(135deg,#38bdf8,#06b6d4)" },
    { to: "/subadmin/sublinks", icon: Layers,      label: t("সাবলিংক", "Sublinks"),   sub: t("ক্যাটাগরি", "Categories"),   color: T.violet, grad: "linear-gradient(135deg,#a78bfa,#8b5cf6)" },
    { to: "/subadmin/users",    icon: ShieldCheck, label: t("কাস্টমার", "Customers"), sub: t("ব্যবহারকারী", "Users"),      color: T.teal,   grad: "linear-gradient(135deg,#2dd4bf,#0d9488)"  },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{
          width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
          background: T.accentLight, border: `1px solid ${T.accentBorder}`,
        }}>
          <Zap size={11} color={T.accent} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: T.textMuted }}>
          {t("দ্রুত অ্যাকশন", "Quick Actions")}
        </span>
      </div>
      <Row gutter={[10, 10]}>
        {actions.map(({ to, icon: Icon, label, sub, color, grad }, i) => (
          <Col xs={8} sm={4} key={to}>
            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 + i * 0.045 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <Link to={to} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    borderRadius: T.radius, border: `1px solid ${T.border}`,
                    background: T.surface, boxShadow: T.shadow, textAlign: "center",
                    padding: "18px 10px 15px",
                    transition: "all 0.22s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = `${color}28`;
                    e.currentTarget.style.boxShadow = `0 10px 32px ${color}18, 0 2px 8px rgba(10,12,30,0.06)`;
                    e.currentTarget.style.background = `linear-gradient(180deg, ${color}04 0%, #ffffff 100%)`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = T.border;
                    e.currentTarget.style.boxShadow = T.shadow;
                    e.currentTarget.style.background = T.surface;
                  }}
                >
                  <div style={{
                    width: 46, height: 46, borderRadius: 13, display: "flex", alignItems: "center",
                    justifyContent: "center", margin: "0 auto 11px",
                    background: grad, boxShadow: `0 6px 18px ${color}30`,
                  }}>
                    <Icon size={19} color="#fff" strokeWidth={2} />
                  </div>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: T.textPrimary, fontFamily: "'Syne', sans-serif" }}>
                    {label}
                  </div>
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
   MAIN — SubAdminHome
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
    { icon: ShoppingBag, label: t("মোট অর্ডার", "Total Orders"),   value: stats.totalOrders || 0,   color: T.accent, colorBg: T.accentLight, sub: t("সব মিলিয়ে", "All orders"),  delay: 0.08 },
    { icon: CheckCircle, label: t("সফল ডেলিভারি", "Delivered"),    value: stats.successOrders || 0, color: T.green,  colorBg: T.greenLight,  sub: t("সফলভাবে", "Successfully"), delay: 0.13 },
    { icon: Star,        label: t("মোট রাজস্ব", "Total Revenue"),  value: `৳${(stats.totalRevenue || 0).toLocaleString()}`, color: T.amber, colorBg: T.amberLight, sub: t("মোট আয়", "Earned"), delay: 0.18 },
    { icon: Package,     label: t("মোট পণ্য", "Total Products"),   value: stats.totalProducts || 0, color: T.violet, colorBg: T.violetLight, sub: t("স্টোরে", "In store"),       delay: 0.23 },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#5b5ef5",
          borderRadius: 11,
          fontFamily: "'DM Sans', sans-serif",
          colorBgContainer: T.surface,
          colorBorder: T.border,
        },
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        .sa-dash-v3 *, .sa-dash-v3 *::before, .sa-dash-v3 *::after { box-sizing: border-box; }
        .sa-dash-v3 { font-family: 'DM Sans', sans-serif; background: ${T.bg}; min-height: 100vh; }

        /* Background mesh pattern */
        .sa-dash-v3::before {
          content: '';
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background-image:
            radial-gradient(circle at 20% 10%, rgba(91,94,245,0.04) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(0,185,107,0.03) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(245,158,11,0.02) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
        }

        .sa-dash-v3 > * { position: relative; z-index: 1; }

        /* Stat card equal height */
        .stat-row .ant-col { display: flex; }
        .stat-row .ant-col > * { flex: 1; }
      `}</style>

      <div className="sa-dash-v3" style={{ padding: "24px 20px 32px", maxWidth: 1100, margin: "0 auto" }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 28 }}
        >
          <div>
            <h2 style={{
              margin: 0, fontWeight: 900, letterSpacing: "-0.03em",
              color: T.textPrimary, lineHeight: 1.15, fontSize: 26,
              fontFamily: "'Syne', sans-serif",
            }}>
              {greet},{" "}
              <span style={{
                background: `linear-gradient(135deg, ${T.accent}, #8b8ff8)`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                {subAdminInfo?.name?.split(" ")[0] || "SubAdmin"}
              </span>{" "}
              👋
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 7 }}>
              <Clock size={11} color={T.textMuted} />
              <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 500 }}>
                {lastSync
                  ? `${t("সর্বশেষ সিঙ্ক", "Last synced")}: ${lastSync.toLocaleTimeString(t("bn-BD", "en-BD"), { hour: "2-digit", minute: "2-digit" })}`
                  : t("লোড হচ্ছে...", "Loading...")}
              </span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={fetchStats}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "9px 18px", borderRadius: T.radiusSm, fontWeight: 700, fontSize: 13,
              background: loading
                ? T.accentLight
                : `linear-gradient(135deg, ${T.accent}, #7b7ef8)`,
              border: `1px solid ${T.accentBorder}`,
              color: loading ? T.accent : "#fff",
              cursor: "pointer", outline: "none",
              boxShadow: loading ? "none" : `0 4px 16px ${T.accentGlow}`,
              transition: "all 0.2s",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
            {t("রিফ্রেশ", "Refresh")}
          </motion.button>
        </motion.div>

        {/* ── Error ── */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginBottom: 20 }}>
              <Alert
                message={error} type="error" showIcon closable
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

        {/* ── Top Stat Cards — equal height via flex row ── */}
        <div
          className="stat-row"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
            marginBottom: 16,
          }}
        >
          {topStats.map((s, i) => (
            <StatCard key={s.label} {...s} loading={loading} />
          ))}
        </div>

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

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </ConfigProvider>
  );
}