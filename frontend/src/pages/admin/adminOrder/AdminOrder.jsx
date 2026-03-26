import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ChevronDown, Trash2, Loader2, X,
  Eye, Package, Truck, CheckCircle, Clock,
  XCircle, RefreshCw, Star, Box, Phone,
  MapPin, CreditCard, Hash, Image as ImageIcon,
  AlertTriangle, ShoppingCart, ArrowRight,
} from "lucide-react";
import ConfirmModal from "../../../utils/modal/confirmModal";
import { showDeleteSuccessToast } from "../../../utils/toast/successDeleteToast";
import { showUpdateSuccessToast } from "../../../utils/toast/successUpdateToast";
import { useAdminLang } from "../../../context/AdminLangContext";

const API       = process.env.REACT_APP_API_URL || "http://localhost:5000";
const ORDER_API = `${API}/api/orders`;

const STATUS_FLOW = ["pending","processing","shipped","confirmed","delivered"];

const STATUS_CFG = {
  pending:    { label:"Pending",    color:"#e8a427", bg:"rgba(232,164,39,0.1)",  border:"rgba(232,164,39,0.25)", dot:"#e8a427", barBg:"#e8a427", icon:Clock,       step:0  },
  processing: { label:"Processing", color:"#a78bfa", bg:"rgba(167,139,250,0.1)", border:"rgba(167,139,250,0.25)",dot:"#a78bfa", barBg:"#a78bfa", icon:Box,         step:1  },
  shipped:    { label:"Shipped",    color:"#60a5fa", bg:"rgba(96,165,250,0.1)",  border:"rgba(96,165,250,0.25)", dot:"#60a5fa", barBg:"#60a5fa", icon:Truck,       step:2  },
  confirmed:  { label:"Confirmed",  color:"#38bdf8", bg:"rgba(56,189,248,0.1)",  border:"rgba(56,189,248,0.25)", dot:"#38bdf8", barBg:"#38bdf8", icon:CheckCircle, step:3  },
  delivered:  { label:"Delivered",  color:"#34d399", bg:"rgba(52,211,153,0.1)",  border:"rgba(52,211,153,0.25)", dot:"#34d399", barBg:"#34d399", icon:Star,        step:4  },
  cancelled:  { label:"Cancelled",  color:"#f87171", bg:"rgba(248,113,113,0.1)", border:"rgba(248,113,113,0.2)", dot:"#f87171", barBg:"#f87171", icon:XCircle,     step:-1 },
};

function getAllowedNextStatuses(currentStatus) {
  if (currentStatus === "cancelled" || currentStatus === "delivered") return [];
  const currentStep = STATUS_CFG[currentStatus]?.step ?? 0;
  const next = STATUS_FLOW.filter(s => STATUS_CFG[s].step > currentStep);
  return [...next, "cancelled"];
}

const PAY_LABEL = { cod:"COD", bkash:"bKash", nagad:"Nagad" };

/* ─────────────── Screenshot Viewer ─────────────── */
function ScreenshotViewer({ url }) {
  const [zoomed, setZoomed] = useState(false);
  if (!url) return (
    <div className="flex items-center gap-2 rounded-xl px-3 py-2.5"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)" }}>
      <ImageIcon size={12} style={{ color: "#334155" }}/>
      <span className="text-xs italic" style={{ color: "#475569" }}>No screenshot uploaded</span>
    </div>
  );
  return (
    <>
      <div onClick={() => setZoomed(true)}
        className="relative rounded-xl overflow-hidden cursor-zoom-in group"
        style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
        <img src={url} alt="payment proof"
          className="w-full max-h-44 object-contain p-1"
          style={{ background: "rgba(255,255,255,0.03)" }}/>
        <div className="absolute inset-0 flex items-center justify-center transition-all"
          style={{ background: "rgba(0,0,0,0)" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.2)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0)"}>
          <span className="text-xs font-semibold text-white opacity-0 group-hover:opacity-100 px-3 py-1.5 rounded-lg transition-all"
            style={{ background: "rgba(0,0,0,0.6)" }}>🔍 Click to zoom</span>
        </div>
      </div>
      <AnimatePresence>
        {zoomed && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
            style={{ background: "rgba(0,0,0,0.92)" }}
            onClick={() => setZoomed(false)}>
            <motion.img initial={{ scale:0.85 }} animate={{ scale:1 }} exit={{ scale:0.85 }}
              transition={{ type:"spring", stiffness:280, damping:22 }}
              src={url} alt="proof" className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain"/>
            <button className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center transition"
              style={{ background: "rgba(255,255,255,0.15)" }}>
              <X size={18} color="#fff"/>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─────────────── Order Detail Modal ─────────────── */
function OrderModal({ order, onClose, onStatusChange, t }) {
  const [selected, setSelected] = useState([]);
  const [reason,   setReason  ] = useState("");
  const [saving,   setSaving  ] = useState(false);
  const [err,      setErr     ] = useState("");
  if (!order) return null;

  const allowed    = getAllowedNextStatuses(order.status);
  const isFinished = allowed.length === 0;
  const isDigital  = order.paymentMethod !== "cod";
  const proofOk    = isDigital && order.transactionId && order.screenshotUrl && order.paymentNumber;
  const currentCfg = STATUS_CFG[order.status] || STATUS_CFG.pending;

  const finalStatus  = selected[selected.length - 1] ?? null;
  const hasCancelled = selected.includes("cancelled");

  const toggleStatus = (s) => {
    setErr(""); setReason("");
    setSelected(prev => {
      if (prev.includes(s)) return prev.slice(0, prev.indexOf(s));
      if (s === "cancelled") return [...prev.filter(x => x !== "cancelled"), "cancelled"];
      return [...prev.filter(x => x !== "cancelled"), s];
    });
  };

  const handleSave = async () => {
    if (!finalStatus) return;
    if (hasCancelled && !reason.trim()) { setErr(t("কারণ লিখুন","Please enter a reason")); return; }
    setErr(""); setSaving(true);
    await onStatusChange(order._id, finalStatus, reason.trim() || undefined);
    setSaving(false); onClose();
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        onClick={onClose}>
        <motion.div
          initial={{ opacity:0, scale:0.95, y:16 }} animate={{ opacity:1, scale:1, y:0 }}
          exit={{ opacity:0, scale:0.95, y:16 }}
          transition={{ type:"spring", stiffness:300, damping:28 }}
          className="w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden rounded-2xl"
          style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}
          onClick={e => e.stopPropagation()}>

          <div className="h-1 w-full rounded-t-2xl" style={{ background: currentCfg.barBg }}/>

          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#475569" }}>{t("অর্ডার বিবরণ","Order Details")}</p>
              <p className="text-sm font-bold mt-0.5" style={{ color: "#f1f5f9" }}>{order.orderId}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: currentCfg.bg, color: currentCfg.color, border: `1px solid ${currentCfg.border}` }}>
                {currentCfg.label}
              </span>
              <button onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition"
                style={{ background: "rgba(255,255,255,0.06)", color: "#64748b" }}>
                <X size={13}/>
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 p-5 space-y-4">

            <div className="rounded-xl p-4 space-y-3"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#475569" }}>{t("স্ট্যাটাস আপডেট","Update Status")}</p>

              {isFinished ? (
                <div className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{ background: currentCfg.bg, border: `1px solid ${currentCfg.border}` }}>
                  <currentCfg.icon size={16} style={{ color: currentCfg.color }}/>
                  <p className="text-sm font-semibold" style={{ color: currentCfg.color }}>
                    {order.status === "delivered"
                      ? t("✓ অর্ডার ডেলিভার্ড — আর পরিবর্তন সম্ভব নয়","✓ Delivered — no more changes")
                      : t("✗ অর্ডার বাতিল","✗ Order cancelled")}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 flex-wrap text-xs" style={{ color: "#475569" }}>
                    <span style={{ color: currentCfg.color, fontWeight: 600 }}>{currentCfg.label}</span>
                    <ArrowRight size={11}/>
                    <span>{t("একাধিক স্টেপ বেছে নিন:","Select steps:")}</span>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {allowed.map(s => {
                      const c      = STATUS_CFG[s];
                      const selIdx = selected.indexOf(s);
                      const isOn   = selIdx !== -1;
                      return (
                        <button key={s} onClick={() => toggleStatus(s)}
                          className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                          style={{
                            background: isOn ? c.bg : "rgba(255,255,255,0.04)",
                            border: `1px solid ${isOn ? c.border : "rgba(255,255,255,0.08)"}`,
                            color: isOn ? c.color : "#64748b",
                            boxShadow: isOn ? `0 0 0 2px ${c.bg}` : "none",
                          }}>
                          {isOn && (
                            <span className="w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center flex-shrink-0"
                              style={{ background: s === "cancelled" ? "#f87171" : "#c9a84c", color: "#0a0f1e" }}>
                              {selIdx + 1}
                            </span>
                          )}
                          <c.icon size={13}/>
                          {c.label}
                        </button>
                      );
                    })}
                  </div>

                  {selected.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap rounded-xl px-3 py-2"
                      style={{ background: "rgba(255,255,255,0.04)" }}>
                      <span style={{ color: currentCfg.color, fontSize: "10px", fontWeight: 600 }}>{currentCfg.label}</span>
                      {selected.map(s => {
                        const c = STATUS_CFG[s];
                        return (
                          <span key={s} className="flex items-center gap-1">
                            <ArrowRight size={10} style={{ color: "#334155" }}/>
                            <span style={{ fontSize: "10px", fontWeight: 700, color: c.color }}>{c.label}</span>
                          </span>
                        );
                      })}
                      <span className="ml-auto text-[10px]" style={{ color: "#475569" }}>
                        → {t("চূড়ান্ত","final")}: <span style={{ fontWeight: 700, color: "#94a3b8" }}>{STATUS_CFG[finalStatus]?.label}</span>
                      </span>
                    </div>
                  )}

                  <AnimatePresence>
                    {hasCancelled && (
                      <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
                        exit={{ opacity:0, height:0 }} className="overflow-hidden">
                        <div className="pt-1 space-y-1.5">
                          <p className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "#f87171" }}>
                            <AlertTriangle size={11}/> {t("বাতিলের কারণ (আবশ্যক)","Cancellation reason (required)")}
                          </p>
                          <input type="text" value={reason}
                            onChange={e => { setReason(e.target.value); setErr(""); }}
                            placeholder={t("যেমন: ভুল ঠিকানা...","e.g. Wrong address...")}
                            autoFocus
                            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(248,113,113,0.3)", color: "#e2e8f0" }}/>
                          {err && <p className="text-xs font-medium" style={{ color: "#f87171" }}>{err}</p>}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button onClick={handleSave} disabled={saving || !finalStatus}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: hasCancelled ? "linear-gradient(135deg,#f87171,#ef4444)" : "linear-gradient(135deg,#c9a84c,#e8c876)",
                      color: hasCancelled ? "#fff" : "#0a0f1e",
                      boxShadow: hasCancelled ? "0 4px 16px rgba(248,113,113,0.3)" : "0 4px 16px rgba(201,168,76,0.3)",
                    }}>
                    {saving
                      ? <Loader2 size={14} className="animate-spin"/>
                      : !finalStatus ? t("স্টেপ বেছে নিন","Select a step")
                      : hasCancelled ? t("✗ অর্ডার বাতিল করুন","✗ Cancel Order")
                      : `→ ${t("করুন","Set")} ${STATUS_CFG[finalStatus]?.label}`
                    }
                  </button>
                </>
              )}
            </div>

            <div className="rounded-xl p-4 space-y-2"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: "#475569" }}>{t("কাস্টমার","Customer")}</p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,rgba(167,139,250,0.2),rgba(201,168,76,0.2))", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <span className="text-sm font-bold" style={{ color: "#c9a84c" }}>{order.customer?.name?.[0]?.toUpperCase()}</span>
                </div>
                <span className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>{order.customer?.name}</span>
              </div>
              <p className="text-sm flex items-center gap-1.5" style={{ color: "#94a3b8" }}>
                <Phone size={11} style={{ color: "#475569" }}/>{order.customer?.phone}
              </p>
              {order.customer?.email && <p className="text-xs" style={{ color: "#64748b" }}>{order.customer.email}</p>}
              <p className="text-sm flex items-start gap-1.5" style={{ color: "#94a3b8" }}>
                <MapPin size={11} style={{ color: "#475569", marginTop: "2px", flexShrink: 0 }}/>
                {order.customer?.address}, {order.customer?.thana}, {order.customer?.district}
              </p>
              {order.customer?.note && (
                <p className="text-xs italic px-3 py-2 rounded-lg" style={{ color: "#64748b", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  "{order.customer.note}"
                </p>
              )}
            </div>

            {order.status === "cancelled" && order.cancellationReason && (
              <div className="flex items-start gap-2.5 rounded-xl px-4 py-3"
                style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}>
                <AlertTriangle size={13} style={{ color: "#f87171", flexShrink: 0, marginTop: "2px" }}/>
                <div>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: "#f87171" }}>{t("বাতিলের কারণ","Cancellation Reason")}</p>
                  <p className="text-sm" style={{ color: "#fca5a5" }}>{order.cancellationReason}</p>
                </div>
              </div>
            )}

            {isDigital && (
              <div className="rounded-xl p-4"
                style={{
                  background: proofOk ? "rgba(52,211,153,0.05)" : "rgba(232,164,39,0.05)",
                  border: `1px solid ${proofOk ? "rgba(52,211,153,0.2)" : "rgba(232,164,39,0.2)"}`,
                }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#475569" }}>
                    {t("পেমেন্ট","Payment")} — {PAY_LABEL[order.paymentMethod]}
                  </p>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      background: proofOk ? "rgba(52,211,153,0.1)" : "rgba(232,164,39,0.1)",
                      color: proofOk ? "#34d399" : "#e8a427",
                    }}>
                    {proofOk ? t("✓ সম্পূর্ণ","✓ Complete") : t("⚠ অসম্পূর্ণ","⚠ Incomplete")}
                  </span>
                </div>
                <div className="space-y-1.5 mb-3">
                  {[
                    { icon:Phone, label:t("প্রেরকের নম্বর","Sender #"), val:order.paymentNumber, mono:false },
                    { icon:Hash,  label:t("ট্রানজেকশন আইডি","TrxID"),   val:order.transactionId,  mono:true  },
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between rounded-lg px-3 py-2"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <span className="text-xs flex items-center gap-1.5" style={{ color: "#475569" }}>
                        <r.icon size={10}/>{r.label}
                      </span>
                      <span className={`text-xs font-semibold ${r.mono ? "font-mono" : ""}`}
                        style={{ color: r.val ? "#e2e8f0" : "#f87171", fontStyle: r.val ? "normal" : "italic" }}>
                        {r.val || t("দেওয়া হয়নি","Not provided")}
                      </span>
                    </div>
                  ))}
                </div>
                <ScreenshotViewer url={order.screenshotUrl}/>
              </div>
            )}

            <div className="rounded-xl p-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "#475569" }}>
                {t("পণ্যসমূহ","Items")} ({order.items?.length})
              </p>
              <div className="space-y-2">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      {item.image
                        ? <img src={item.image} alt={item.name} className="w-full h-full object-contain p-0.5"/>
                        : <div className="w-full h-full flex items-center justify-center"><Package size={13} style={{ color: "#334155" }}/></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: "#e2e8f0" }}>{item.name}</p>
                      <p className="text-xs" style={{ color: "#64748b" }}>৳{(item.salePrice || item.price || 0).toLocaleString()} × {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold flex-shrink-0" style={{ color: "#c9a84c" }}>
                      ৳{((item.salePrice || item.price || 0) * (item.quantity || 1)).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl p-4 space-y-1.5"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "#475569" }}>{t("সারসংক্ষেপ","Summary")}</p>
              <div className="flex justify-between text-sm" style={{ color: "#64748b" }}>
                <span>{t("সাবটোটাল","Subtotal")}</span><span>৳{order.subtotal?.toLocaleString()}</span>
              </div>
              {order.savings > 0 && (
                <div className="flex justify-between text-sm" style={{ color: "#34d399" }}>
                  <span>{t("সাশ্রয়","Savings")}</span><span>−৳{order.savings?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm" style={{ color: "#64748b" }}>
                <span>{t("ডেলিভারি","Delivery")}</span>
                <span>{order.deliveryCharge === 0 ? t("বিনামূল্যে","Free") : `৳${order.deliveryCharge}`}</span>
              </div>
              <div className="my-1.5" style={{ height: "1px", background: "rgba(255,255,255,0.07)" }}/>
              <div className="flex justify-between text-sm font-bold" style={{ color: "#f1f5f9" }}>
                <span>{t("মোট","Total")}</span><span style={{ color: "#c9a84c" }}>৳{order.total?.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <CreditCard size={10} style={{ color: "#475569" }}/>
                <span className="text-xs" style={{ color: "#64748b" }}>{PAY_LABEL[order.paymentMethod]}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full ml-auto"
                  style={{
                    background: order.paymentStatus === "paid" ? "rgba(52,211,153,0.1)" : order.paymentStatus === "awaiting_confirmation" ? "rgba(56,189,248,0.1)" : "rgba(232,164,39,0.1)",
                    color: order.paymentStatus === "paid" ? "#34d399" : order.paymentStatus === "awaiting_confirmation" ? "#38bdf8" : "#e8a427",
                  }}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            <p className="text-xs text-center" style={{ color: "#334155" }}>
              {new Date(order.createdAt).toLocaleString("en-BD")}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════
   MAIN
═══════════════════════════════════════ */
export default function AdminOrder() {
  const { t } = useAdminLang();

  const SORT_OPTS   = [
    { value:"newest", label:t("নতুন আগে","Newest First")    },
    { value:"oldest", label:t("পুরনো আগে","Oldest First")   },
    { value:"total",  label:t("সর্বোচ্চ মোট","Highest Total") },
  ];
  const STATUS_OPTS = ["all","pending","processing","shipped","confirmed","delivered","cancelled"].map(s => ({
    value: s,
    label: s === "all" ? t("সব স্ট্যাটাস","All Status") : STATUS_CFG[s]?.label,
  }));
  const PAY_OPTS = [
    { value:"all",   label:t("সব পেমেন্ট","All Payment") },
    { value:"cod",   label:"COD"   },
    { value:"bkash", label:"bKash" },
    { value:"nagad", label:"Nagad" },
  ];

  const [orders,    setOrders  ] = useState([]);
  const [loading,   setLoading ] = useState(false);
  const [search,    setSearch  ] = useState("");
  const [sort,      setSort    ] = useState("newest");
  const [fStatus,   setFStatus ] = useState("all");
  const [fPay,      setFPay    ] = useState("all");
  const [countdown, setCountdown] = useState(10);

  const [sortOpen,   setSortOpen  ] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [payOpen,    setPayOpen   ] = useState(false);
  const [selOrder,   setSelOrder  ] = useState(null);
  const [delOpen,    setDelOpen   ] = useState(false);
  const [delId,      setDelId     ] = useState(null);
  const [delName,    setDelName   ] = useState("");

  const sortRef      = useRef(null);
  const statusRef    = useRef(null);
  const payRef       = useRef(null);
  const intervalRef  = useRef(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    const h = e => {
      if (!sortRef.current?.contains(e.target))   setSortOpen(false);
      if (!statusRef.current?.contains(e.target)) setStatusOpen(false);
      if (!payRef.current?.contains(e.target))    setPayOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* ── silent fetch — loading spinner দেখাবে না ── */
  const silentFetch = async () => {
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(ORDER_API, { headers: { Authorization: `Bearer ${token}` } });
      const data  = await res.json();
      if (data.success) setOrders(data.data);
    } catch (e) { console.error(e); }
  };

  /* ── initial fetch with loading spinner ── */
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(ORDER_API, { headers: { Authorization: `Bearer ${token}` } });
      const data  = await res.json();
      if (data.success) setOrders(data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  /* ── auto-refresh every 10 seconds ── */
  useEffect(() => {
    fetchOrders();

    // silent refresh interval
    intervalRef.current = setInterval(() => {
      silentFetch();
      setCountdown(10);
    }, 10000);

    // countdown ticker
    countdownRef.current = setInterval(() => {
      setCountdown(p => (p <= 1 ? 10 : p - 1));
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(countdownRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusChange = async (id, newStatus, cancelReason) => {
    try {
      const token = localStorage.getItem("token");
      const body  = { status: newStatus };
      if (cancelReason) body.cancellationReason = cancelReason;
      const res = await fetch(`${ORDER_API}/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        if (newStatus === "cancelled") setOrders(prev => prev.filter(o => o._id !== id));
        else setOrders(prev => prev.map(o => o._id === id ? data.data : o));
        showUpdateSuccessToast(t("অর্ডার স্ট্যাটাস","Order status"));
      }
    } catch (e) { console.error(e); }
  };

  const confirmDelete = async () => {
    const token = localStorage.getItem("token");
    const res   = await fetch(`${ORDER_API}/${delId}`, {
      method:"DELETE", headers:{ Authorization:`Bearer ${token}` },
    });
    if (res.ok) {
      showDeleteSuccessToast(delName);
      setOrders(prev => prev.filter(o => o._id !== delId));
      if (selOrder?._id === delId) setSelOrder(null);
    }
    setDelOpen(false);
  };

  const displayed = orders
    .filter(o => {
      const q  = search.toLowerCase();
      const ms = !q || o.orderId?.toLowerCase().includes(q)
        || o.customer?.name?.toLowerCase().includes(q)
        || o.customer?.phone?.includes(q);
      return ms && (fStatus === "all" || o.status === fStatus)
        && (fPay === "all" || o.paymentMethod === fPay);
    })
    .sort((a, b) => {
      if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      return b.total - a.total;
    });

  const stats = {
    total:      orders.length,
    pending:    orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    shipped:    orders.filter(o => o.status === "shipped").length,
  };

  /* ── inline dropdown ── */
  const DDBtn = ({ refEl, open, setOpen, value, options, onChange }) => (
    <div className="relative" ref={refEl}>
      <button type="button" onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between gap-2 text-xs rounded-xl px-3 py-2.5 transition-all"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8", minWidth: "130px" }}>
        <span style={{ color: "#cbd5e1", fontWeight: 500 }} className="truncate">{options.find(o => o.value === value)?.label}</span>
        <ChevronDown size={12} style={{ color: "#475569", flexShrink: 0 }}/>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }}
            exit={{ opacity:0 }} transition={{ duration:0.15 }}
            className="absolute right-0 top-full mt-1.5 w-full z-50 rounded-xl overflow-hidden"
            style={{ background: "#1a2235", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 16px 48px rgba(0,0,0,0.5)" }}>
            {options.map(opt => (
              <div key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }}
                className="px-4 py-2.5 text-xs cursor-pointer transition"
                style={{
                  color: value === opt.value ? "#c9a84c" : "#94a3b8",
                  background: value === opt.value ? "rgba(201,168,76,0.08)" : "transparent",
                  fontWeight: value === opt.value ? 600 : 400,
                }}
                onMouseEnter={e => { if (value !== opt.value) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#e2e8f0"; }}
                onMouseLeave={e => { if (value !== opt.value) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; } }}>
                {opt.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        .ao-wrap * { box-sizing: border-box; }
        .ao-wrap { font-family: 'DM Sans', sans-serif; }
        .ao-search-input {
          background: transparent; border: none; outline: none;
          font-size: 13px; color: #e2e8f0; width: 100%;
          font-family: 'DM Sans', sans-serif;
        }
        .ao-search-input::placeholder { color: #475569; }
        .ao-col-header {
          display: grid; align-items: center; padding: 11px 20px;
          grid-template-columns: 28px 1fr 1fr 80px 80px 56px;
          gap: 8px; background: #0f1929;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          position: sticky; top: 0; z-index: 10;
        }
        .ao-row {
          display: grid; align-items: center; padding: 14px 20px;
          grid-template-columns: 28px 1fr 1fr 80px 80px 56px;
          gap: 8px; border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: background 0.15s;
        }
        @media (max-width: 640px) {
          .ao-col-header { grid-template-columns: 28px 1fr 80px 56px; }
          .ao-row { grid-template-columns: 28px 1fr 80px 56px; }
          .ao-hide-sm { display: none; }
        }
        .ao-row:last-child { border-bottom: none; }
        .ao-row:hover { background: rgba(255,255,255,0.025); }
        .ao-icon-btn {
          width: 28px; height: 28px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.15s; border: none;
          font-family: 'DM Sans', sans-serif;
        }
        .ao-icon-btn:hover { transform: translateY(-1px); }
      `}</style>

      <div className="ao-wrap max-w-5xl mx-auto pb-10">
        <AnimatePresence mode="wait">
          <motion.div key="ao" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
            exit={{ opacity:0 }} transition={{ duration:0.25 }} className="space-y-4">

            {/* ══ HEADER CARD ══ */}
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
              transition={{ duration:0.4 }}
              className="relative rounded-2xl overflow-hidden"
              style={{ background: "linear-gradient(135deg,#0d1426 0%,#111827 50%,#0f172a 100%)", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>

              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg,transparent,rgba(201,168,76,0.6) 30%,rgba(139,92,246,0.6) 70%,transparent)" }}/>
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
                backgroundSize: "32px 32px",
              }}/>
              <div className="absolute pointer-events-none" style={{ top: "-60px", right: "-40px", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle,rgba(201,168,76,0.07) 0%,transparent 70%)" }}/>

              <div className="relative p-6 sm:p-7">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(135deg,rgba(201,168,76,0.15),rgba(201,168,76,0.05))", border: "1px solid rgba(201,168,76,0.2)" }}>
                      <ShoppingCart size={20} style={{ color: "#c9a84c" }}/>
                    </div>
                    <div>
                      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "20px", color: "#f1f5f9", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                        {t("অর্ডার","Orders")}
                      </h1>
                      <p className="text-xs mt-1" style={{ color: "#475569" }}>
                        {t("আপনার সকল অর্ডার পরিচালনা করুন","Manage all your orders")}
                      </p>
                    </div>
                  </div>

                  {/* refresh button + live countdown */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {/* live indicator */}
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
                      style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)" }}>
                      <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }}
                        className="w-1.5 h-1.5 rounded-full" style={{ background: "#34d399" }}/>
                      <span className="text-[11px] font-medium" style={{ color: "#34d399" }}>Live</span>
                      <span className="text-[11px] font-bold tabular-nums" style={{ color: "#34d399" }}>{countdown}s</span>
                    </div>

                    <button onClick={() => { fetchOrders(); setCountdown(10); }}
                      className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" }}>
                      <RefreshCw size={13} className={loading ? "animate-spin" : ""}/>
                      <span className="hidden sm:inline">{t("রিফ্রেশ","Refresh")}</span>
                    </button>
                  </div>
                </div>

                {/* stat cards */}
                <div className="flex gap-3 flex-wrap sm:flex-nowrap">
                  {[
                    { labelBn:"মোট",      labelEn:"Total",      count:stats.total,      color:"#c9a84c", icon:ShoppingCart },
                    { labelBn:"অপেক্ষা",  labelEn:"Pending",    count:stats.pending,    color:"#e8a427", icon:Clock        },
                    { labelBn:"প্রসেসিং", labelEn:"Processing", count:stats.processing, color:"#a78bfa", icon:Box          },
                    { labelBn:"পথে",      labelEn:"Shipped",    count:stats.shipped,    color:"#60a5fa", icon:Truck        },
                  ].map(({ labelBn, labelEn, count, color, icon: Icon }) => (
                    <div key={labelEn} className="flex-1 min-w-0 rounded-xl p-3"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="text-xl font-bold" style={{ color, lineHeight: 1 }}>{count}</div>
                      <div className="text-[11px] font-medium mt-1" style={{ color: "#475569" }}>{t(labelBn, labelEn)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ══ CONTROLS ══ */}
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
              <div className="relative flex-1 flex items-center gap-2 rounded-xl px-3"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Search size={14} style={{ color: "#475569", flexShrink: 0 }}/>
                <input type="text"
                  placeholder={t("নাম, ফোন, অর্ডার আইডি খুঁজুন…","Search name, phone, order ID…")}
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="ao-search-input py-2.5"/>
                {search && (
                  <button onClick={() => setSearch("")} style={{ color: "#475569" }}>
                    <X size={13}/>
                  </button>
                )}
              </div>

              <DDBtn refEl={statusRef} open={statusOpen} setOpen={setStatusOpen} value={fStatus} options={STATUS_OPTS} onChange={setFStatus}/>
              <DDBtn refEl={payRef}    open={payOpen}    setOpen={setPayOpen}    value={fPay}    options={PAY_OPTS}    onChange={setFPay}/>
              <DDBtn refEl={sortRef}   open={sortOpen}   setOpen={setSortOpen}   value={sort}    options={SORT_OPTS}   onChange={setSort}/>
            </div>

            {/* ══ TABLE ══ */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "#0d1426", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>

              <div className="ao-col-header">
                {["#", t("অর্ডার","Order"), t("কাস্টমার","Customer"), t("মোট","Total"), t("পেমেন্ট","Payment"), ""].map((h, i) => (
                  <div key={i}
                    className={`text-[10px] font-semibold uppercase tracking-wider ${i === 2 || i === 3 || i === 4 ? "ao-hide-sm" : ""}`}
                    style={{ color: "#2d3f55" }}>{h}</div>
                ))}
              </div>

              <div className="overflow-y-auto" style={{ maxHeight: "60vh" }}>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)" }}>
                      <Loader2 size={20} className="animate-spin" style={{ color: "#c9a84c" }}/>
                    </div>
                    <p className="text-xs font-medium" style={{ color: "#475569" }}>{t("অর্ডার লোড হচ্ছে…","Loading orders…")}</p>
                  </div>
                ) : displayed.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <Package size={24} style={{ color: "#1e293b" }}/>
                    </div>
                    <p className="text-sm font-medium" style={{ color: "#475569" }}>
                      {t("কোনো অর্ডার পাওয়া যায়নি।","No orders found.")}
                    </p>
                  </div>
                ) : displayed.map((order, idx) => {
                  const cfg   = STATUS_CFG[order.status] || STATUS_CFG.pending;
                  const items = order.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 0;
                  const isDig = order.paymentMethod !== "cod";
                  const proofOk = isDig && order.transactionId && order.screenshotUrl;
                  const proofBd = isDig && (!order.transactionId || !order.screenshotUrl);
                  return (
                    <motion.div key={order._id} className="ao-row"
                      initial={{ opacity:0 }} animate={{ opacity:1 }}
                      transition={{ delay: idx * 0.015 }}>

                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.dot }}/>
                        <span className="text-xs font-medium" style={{ color: "#2d3f55" }}>{idx + 1}</span>
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "#e2e8f0" }}>{order.orderId}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
                          {new Date(order.createdAt).toLocaleDateString("en-BD", { day:"numeric", month:"short" })}
                        </p>
                      </div>

                      <div className="min-w-0 ao-hide-sm">
                        <p className="text-sm font-medium truncate" style={{ color: "#94a3b8" }}>{order.customer?.name}</p>
                        <p className="text-xs" style={{ color: "#475569" }}>{order.customer?.phone}</p>
                      </div>

                      <div className="ao-hide-sm">
                        <p className="text-sm font-bold" style={{ color: "#c9a84c" }}>৳{order.total?.toLocaleString()}</p>
                        <p className="text-xs" style={{ color: "#475569" }}>{items} {t("পণ্য","items")}</p>
                      </div>

                      <div className="ao-hide-sm">
                        <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-lg"
                          style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8" }}>
                          {PAY_LABEL[order.paymentMethod] || order.paymentMethod}
                        </span>
                        {proofOk && <p className="text-xs mt-0.5" style={{ color: "#34d399" }}>✓ {t("প্রমাণ","Proof")}</p>}
                        {proofBd && <p className="text-xs mt-0.5" style={{ color: "#e8a427" }}>⚠ {t("প্রমাণ নেই","No proof")}</p>}
                      </div>

                      <div className="flex items-center justify-end gap-1.5">
                        <button className="ao-icon-btn"
                          style={{ background: "rgba(129,140,248,0.08)", color: "#818cf8" }}
                          onClick={() => setSelOrder(order)}>
                          <Eye size={13}/>
                        </button>
                        <button className="ao-icon-btn"
                          style={{ background: "rgba(248,113,113,0.08)", color: "#f87171" }}
                          onClick={() => { setDelId(order._id); setDelName(order.orderId); setDelOpen(true); }}>
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

          </motion.div>
        </AnimatePresence>

        {selOrder && (
          <OrderModal order={selOrder} onClose={() => setSelOrder(null)} onStatusChange={handleStatusChange} t={t}/>
        )}

        <ConfirmModal
          isOpen={delOpen} onClose={() => setDelOpen(false)} onConfirm={confirmDelete}
          title={t("অর্ডার ডিলিট করবেন?","Delete Order?")}
          message={`${t("ডিলিট করবেন","Delete")} "${delName}"? ${t("এটি পূর্বাবস্থায় ফেরানো যাবে না।","This cannot be undone.")}`}
          confirmText={t("ডিলিট","Delete")} cancelText={t("বাতিল","Cancel")} danger
        />
      </div>
    </>
  );
}