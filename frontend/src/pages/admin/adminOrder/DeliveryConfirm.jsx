import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ChevronDown, Loader2, X,
  Package, Truck, CheckCircle, Clock,
  XCircle, RefreshCw, Star, Box,
  Phone, MapPin, CreditCard, Hash,
  Image as ImageIcon, AlertTriangle,
  FileText, TrendingUp,
} from "lucide-react";
import { showUpdateSuccessToast } from "../../../utils/toast/successUpdateToast";
import { useAdminLang } from "../../../context/AdminLangContext";

const API       = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;
const ORDER_API = `${API}/api/orders`;

const STATUS_CFG = {
  pending:    { label:"Pending",    color:"#e8a427", bg:"rgba(232,164,39,0.1)",  border:"rgba(232,164,39,0.25)", dot:"#e8a427", barBg:"#e8a427", icon:Clock       },
  confirmed:  { label:"Confirmed",  color:"#38bdf8", bg:"rgba(56,189,248,0.1)",  border:"rgba(56,189,248,0.25)", dot:"#38bdf8", barBg:"#38bdf8", icon:CheckCircle },
  processing: { label:"Processing", color:"#a78bfa", bg:"rgba(167,139,250,0.1)", border:"rgba(167,139,250,0.25)",dot:"#a78bfa", barBg:"#a78bfa", icon:Box         },
  shipped:    { label:"Shipped",    color:"#60a5fa", bg:"rgba(96,165,250,0.1)",  border:"rgba(96,165,250,0.25)", dot:"#60a5fa", barBg:"#60a5fa", icon:Truck       },
  delivered:  { label:"Delivered",  color:"#34d399", bg:"rgba(52,211,153,0.1)",  border:"rgba(52,211,153,0.25)", dot:"#34d399", barBg:"#34d399", icon:Star        },
  cancelled:  { label:"Cancelled",  color:"#f87171", bg:"rgba(248,113,113,0.1)", border:"rgba(248,113,113,0.2)", dot:"#f87171", barBg:"#f87171", icon:XCircle     },
};
const PAY_LABEL = { cod:"COD", bkash:"bKash", nagad:"Nagad" };
const SORT_OPTS = (t) => [
  { value:"newest", label:t("নতুন আগে","Newest First")    },
  { value:"oldest", label:t("পুরনো আগে","Oldest First")   },
  { value:"total",  label:t("সর্বোচ্চ মোট","Highest Total") },
];

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
        <img src={url} alt="payment proof" className="w-full max-h-44 object-contain p-1"
          style={{ background: "rgba(255,255,255,0.03)" }}/>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
          style={{ background: "rgba(0,0,0,0.2)" }}>
          <span className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg"
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
            <button className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center"
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
function OrderDetailModal({ order, onClose, onSuccess, onFail, t }) {
  const [note, setNote] = useState("");
  if (!order) return null;
  const cfg    = STATUS_CFG[order.status] || STATUS_CFG.confirmed;
  const isDig  = order.paymentMethod !== "cod";
  const proofOk = isDig && order.transactionId && order.screenshotUrl;
  const canAct = order.status === "confirmed";

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

          <div className="h-1 w-full rounded-t-2xl" style={{ background: cfg.barBg }}/>

          {/* header */}
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                <cfg.icon size={15} style={{ color: cfg.color }}/>
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "#f1f5f9" }}>{order.orderId}</p>
                <p className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition"
              style={{ background: "rgba(255,255,255,0.06)", color: "#64748b" }}>
              <X size={13}/>
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-5 space-y-4">

            {/* cancellation reason */}
            {order.status === "cancelled" && (
              <div className="flex items-start gap-2.5 rounded-xl px-4 py-3"
                style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}>
                <AlertTriangle size={13} style={{ color: "#f87171", flexShrink: 0, marginTop: "2px" }}/>
                <div>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: "#f87171" }}>{t("বাতিলের কারণ","Cancellation Reason")}</p>
                  <p className="text-sm" style={{ color: "#fca5a5" }}>{order.cancellationReason || t("কোনো কারণ দেওয়া হয়নি","No reason provided")}</p>
                </div>
              </div>
            )}

            {/* delivery note */}
            {order.deliveryNote && order.status !== "cancelled" && (
              <div className="flex items-start gap-2.5 rounded-xl px-4 py-3"
                style={{ background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)" }}>
                <FileText size={13} style={{ color: "#38bdf8", flexShrink: 0, marginTop: "2px" }}/>
                <div>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: "#38bdf8" }}>{t("ডেলিভারি নোট","Delivery Note")}</p>
                  <p className="text-sm" style={{ color: "#7dd3fc" }}>{order.deliveryNote}</p>
                </div>
              </div>
            )}

            {/* customer */}
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

            {/* items */}
            <div className="rounded-xl p-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "#475569" }}>
                {t("পণ্যসমূহ","Products")} ({order.items?.length})
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
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold" style={{ color: "#c9a84c" }}>
                        ৳{((item.salePrice || item.price || 0) * (item.quantity || 1)).toLocaleString()}
                      </p>
                      {canAct && (
                        <p className="text-[10px]" style={{ color: "#f87171" }}>−{item.quantity} {t("স্টক","stock")}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* payment proof */}
            {isDig && (
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
                    style={{ background: proofOk ? "rgba(52,211,153,0.1)" : "rgba(232,164,39,0.1)", color: proofOk ? "#34d399" : "#e8a427" }}>
                    {proofOk ? t("✓ সম্পূর্ণ","✓ Complete") : t("⚠ অসম্পূর্ণ","⚠ Incomplete")}
                  </span>
                </div>
                <div className="space-y-1.5 mb-3">
                  {[
                    { icon:Phone, label:t("প্রেরক","Sender"), val:order.paymentNumber, mono:false },
                    { icon:Hash,  label:t("ট্রানজেকশন আইডি","TrxID"), val:order.transactionId, mono:true },
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

            {/* summary */}
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
                <span>{t("মোট","Total")}</span>
                <span style={{ color: "#c9a84c" }}>৳{order.total?.toLocaleString()}</span>
              </div>
            </div>

            {/* delivery note input */}
            {canAct && (
              <div className="rounded-xl p-4"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-2 flex items-center gap-1.5" style={{ color: "#475569" }}>
                  <FileText size={10}/> {t("ডেলিভারি নোট (ঐচ্ছিক)","Delivery Note (optional)")}
                </p>
                <input type="text" value={note} onChange={e => setNote(e.target.value)}
                  placeholder={t("যেমন: গেটে রেখেছি...","e.g. Left at gate...")}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }}/>
              </div>
            )}
          </div>

          {/* action buttons */}
          {canAct && (
            <div className="px-5 pb-5 pt-3 flex gap-2.5"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <button onClick={() => { onSuccess(order, note); onClose(); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition"
                style={{ background: "linear-gradient(135deg,#34d399,#10b981)", color: "#fff", boxShadow: "0 4px 16px rgba(52,211,153,0.3)" }}>
                <CheckCircle size={14}/> {t("ডেলিভার্ড ✓","Delivered ✓")}
              </button>
              <button onClick={() => { onFail(order, note); onClose(); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition"
                style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171" }}>
                <XCircle size={14}/> {t("ব্যর্থ ✗","Failed ✗")}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─────────────── Confirm Action Modal ─────────────── */
function ConfirmActionModal({ order, type, note, onClose, onConfirm, loading, t }) {
  const isSuccess = type === "success";
  if (!order) return null;
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <motion.div initial={{ scale:0.92, opacity:0, y:10 }} animate={{ scale:1, opacity:1, y:0 }}
        exit={{ scale:0.92, opacity:0, y:10 }}
        transition={{ type:"spring", stiffness:300, damping:25 }}
        className="w-full max-w-sm p-7 rounded-2xl"
        style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}
        onClick={e => e.stopPropagation()}>

        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: isSuccess ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)", border: `1px solid ${isSuccess ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}` }}>
          {isSuccess
            ? <CheckCircle size={26} style={{ color: "#34d399" }}/>
            : <XCircle    size={26} style={{ color: "#f87171" }}/>
          }
        </div>

        <h3 className="text-base font-bold text-center mb-1" style={{ color: "#f1f5f9", letterSpacing: "-0.01em" }}>
          {isSuccess ? t("ডেলিভারি নিশ্চিত করবেন?","Confirm Delivery?") : t("ব্যর্থ হিসেবে চিহ্নিত করবেন?","Mark as Failed?")}
        </h3>
        <p className="text-sm text-center mb-4" style={{ color: "#64748b" }}>
          <span style={{ fontWeight: 600, color: "#94a3b8" }}>{order.orderId}</span>
        </p>

        <div className="rounded-xl p-3 mb-4 space-y-1"
          style={{ background: isSuccess ? "rgba(52,211,153,0.06)" : "rgba(248,113,113,0.06)", border: `1px solid ${isSuccess ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)"}` }}>
          <p className="text-xs font-semibold" style={{ color: isSuccess ? "#34d399" : "#f87171" }}>
            {isSuccess ? t("✓ এটি করবে:","✓ This will:") : t("⚠ এটি করবে:","⚠ This will:")}
          </p>
          {isSuccess ? (
            <>
              <p className="text-xs pl-2" style={{ color: "#64748b" }}>• {t("স্ট্যাটাস → ডেলিভার্ড","Status → Delivered")}</p>
              <p className="text-xs pl-2" style={{ color: "#64748b" }}>• {t("পেমেন্ট → পরিশোধিত","Payment → Paid")}</p>
              <p className="text-xs pl-2" style={{ color: "#64748b" }}>• {t("সকল পণ্যের স্টক কমবে","Stock decremented for all items")}</p>
            </>
          ) : (
            <>
              <p className="text-xs pl-2" style={{ color: "#64748b" }}>• {t("স্ট্যাটাস → বাতিল","Status → Cancelled")}</p>
              <p className="text-xs pl-2" style={{ color: "#64748b" }}>• {t("পেমেন্ট → ব্যর্থ","Payment → Failed")}</p>
              <p className="text-xs pl-2" style={{ color: "#64748b" }}>• {t("স্টক অপরিবর্তিত","Stock unchanged")}</p>
            </>
          )}
        </div>

        {note && (
          <div className="rounded-xl p-3 mb-4"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: "#475569" }}>{t("নোট","Note")}</p>
            <p className="text-sm" style={{ color: "#94a3b8" }}>"{note}"</p>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b" }}>
            {t("বাতিল","Cancel")}
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition"
            style={{
              background: isSuccess ? "linear-gradient(135deg,#34d399,#10b981)" : "linear-gradient(135deg,#f87171,#ef4444)",
              color: "#fff",
              boxShadow: isSuccess ? "0 4px 16px rgba(52,211,153,0.3)" : "0 4px 16px rgba(248,113,113,0.3)",
              opacity: loading ? 0.6 : 1,
            }}>
            {loading
              ? <Loader2 size={14} className="animate-spin"/>
              : isSuccess
                ? <><CheckCircle size={13}/> {t("নিশ্চিত","Confirm")}</>
                : <><XCircle size={13}/> {t("ব্যর্থ চিহ্নিত","Mark Failed")}</>
            }
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   MAIN
═══════════════════════════════════════ */
export default function DeliveryConfirm() {
  const { t } = useAdminLang();

  const FILTER_TABS = [
    { value:"confirmed", label:t("কনফার্মড","Confirmed"), dot:"#38bdf8" },
    { value:"delivered", label:t("ডেলিভার্ড","Delivered"), dot:"#34d399" },
    { value:"cancelled", label:t("বাতিল","Cancelled"),    dot:"#f87171" },
    { value:"all",       label:t("সব","All"),             dot:"#64748b" },
  ];

  const [orders,      setOrders    ] = useState([]);
  const [loading,     setLoading   ] = useState(false);
  const [search,      setSearch    ] = useState("");
  const [filter,      setFilter    ] = useState("delivered");
  const [sort,        setSort      ] = useState("newest");
  const [sortOpen,    setSortOpen  ] = useState(false);
  const [detailOrder, setDetail    ] = useState(null);
  const [modal,       setModal     ] = useState(null);
  const [confirming,  setConfirming] = useState(false);
  const [resultBanner,setResult    ] = useState(null);

  const sortRef = useRef(null);

  useEffect(() => {
    const h = e => { if (!sortRef.current?.contains(e.target)) setSortOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${ORDER_API}/delivery`, { headers:{ Authorization:`Bearer ${token}` } });
      const data  = await res.json();
      if (data.success) setOrders(data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchOrders(); }, []);

  const handleConfirm = async () => {
    if (!modal) return;
    setConfirming(true);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${ORDER_API}/${modal.order._id}/confirm-delivery`, {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ success: modal.type === "success", note: modal.note || "" }),
      });
      const data = await res.json();
      if (data.success) {
        showUpdateSuccessToast(modal.type === "success" ? t("ডেলিভারি নিশ্চিত!","Delivery confirmed!") : t("ব্যর্থ হিসেবে চিহ্নিত","Marked as failed"));
        setOrders(prev => prev.map(o => o._id === modal.order._id ? data.data : o));
        setResult({ type: modal.type, order: data.data, stockErrors: data.stockErrors });
        setModal(null);
      }
    } catch (e) { console.error(e); }
    finally { setConfirming(false); }
  };

  const displayed = orders
    .filter(o => {
      const q  = search.toLowerCase();
      const ms = !q || o.orderId?.toLowerCase().includes(q)
        || o.customer?.name?.toLowerCase().includes(q)
        || o.customer?.phone?.includes(q);
      return ms && (filter === "all" || o.status === filter);
    })
    .sort((a, b) => {
      if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      return b.total - a.total;
    });

  const counts = {
    confirmed: orders.filter(o => o.status === "confirmed").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
  };
  const revenue = orders.filter(o => o.status === "delivered").reduce((s, o) => s + (o.total || 0), 0);
  const sortOpts = SORT_OPTS(t);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        .dc-wrap * { box-sizing: border-box; }
        .dc-wrap { font-family: 'DM Sans', sans-serif; }
        .dc-search-input {
          background: transparent; border: none; outline: none;
          font-size: 13px; color: #e2e8f0; width: 100%;
          font-family: 'DM Sans', sans-serif;
        }
        .dc-search-input::placeholder { color: #475569; }
        .dc-col-header {
          display: grid; align-items: center; padding: 11px 20px;
          grid-template-columns: 28px 1fr 1fr 1fr 60px 80px 80px;
          gap: 8px; background: #0f1929;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          position: sticky; top: 0; z-index: 10;
        }
        .dc-row {
          display: grid; align-items: center; padding: 13px 20px;
          grid-template-columns: 28px 1fr 1fr 1fr 60px 80px 80px;
          gap: 8px; border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: background 0.15s; cursor: pointer;
        }
        @media (max-width: 640px) {
          .dc-col-header { grid-template-columns: 28px 1fr 80px; }
          .dc-row { grid-template-columns: 28px 1fr 80px; }
          .dc-hide-sm { display: none; }
        }
        .dc-row:last-child { border-bottom: none; }
        .dc-row:hover { background: rgba(255,255,255,0.03); }
      `}</style>

      <div className="dc-wrap max-w-5xl mx-auto pb-10">
        <AnimatePresence mode="wait">
          <motion.div key="dc" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
            exit={{ opacity:0 }} transition={{ duration:0.25 }} className="space-y-4">

            {/* ══ HEADER CARD ══ */}
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
              transition={{ duration:0.4 }}
              className="relative rounded-2xl overflow-hidden"
              style={{ background: "linear-gradient(135deg,#0d1426 0%,#111827 50%,#0f172a 100%)", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>

              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg,transparent,rgba(52,211,153,0.6) 30%,rgba(56,189,248,0.6) 70%,transparent)" }}/>
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
                backgroundSize: "32px 32px",
              }}/>
              <div className="absolute pointer-events-none" style={{ top: "-60px", right: "-40px", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle,rgba(52,211,153,0.07) 0%,transparent 70%)" }}/>

              <div className="relative p-6 sm:p-7">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(135deg,rgba(52,211,153,0.15),rgba(52,211,153,0.05))", border: "1px solid rgba(52,211,153,0.2)" }}>
                      <Truck size={20} style={{ color: "#34d399" }}/>
                    </div>
                    <div>
                      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "20px", color: "#f1f5f9", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                        {t("ডেলিভারি","Delivery")}
                      </h1>
                      <p className="text-xs mt-1" style={{ color: "#475569" }}>
                        {t("অর্ডার ডেলিভারি নিশ্চিত ও পরিচালনা করুন","Manage and confirm your order deliveries")}
                      </p>
                    </div>
                  </div>
                  <button onClick={fetchOrders}
                    className="flex items-center gap-2 self-start sm:self-auto rounded-xl px-4 py-2.5 text-xs font-semibold transition"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" }}>
                    <RefreshCw size={13} className={loading ? "animate-spin" : ""}/>
                    <span className="hidden sm:inline">{t("রিফ্রেশ","Refresh")}</span>
                  </button>
                </div>

                {/* stat cards */}
                <div className="flex gap-3 flex-wrap sm:flex-nowrap">
                  {[
                    { labelBn:"কনফার্মড", labelEn:"Confirmed", count:counts.confirmed, color:"#38bdf8" },
                    { labelBn:"ডেলিভার্ড",labelEn:"Delivered", count:counts.delivered, color:"#34d399" },
                    { labelBn:"বাতিল",    labelEn:"Cancelled", count:counts.cancelled, color:"#f87171" },
                    { labelBn:"রেভিনিউ",  labelEn:"Revenue",   count:`৳${revenue.toLocaleString()}`, color:"#a78bfa" },
                  ].map(({ labelBn, labelEn, count, color }) => (
                    <div key={labelEn} className="flex-1 min-w-0 rounded-xl p-3"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="text-xl font-bold truncate" style={{ color, lineHeight: 1 }}>{count}</div>
                      <div className="text-[11px] font-medium mt-1" style={{ color: "#475569" }}>{t(labelBn, labelEn)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* result banner */}
            <AnimatePresence>
              {resultBanner && (
                <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                  className="rounded-2xl p-4 flex items-start gap-3"
                  style={{
                    background: resultBanner.type === "success" ? "rgba(52,211,153,0.06)" : "rgba(248,113,113,0.06)",
                    border: `1px solid ${resultBanner.type === "success" ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}`,
                  }}>
                  {resultBanner.type === "success"
                    ? <CheckCircle size={16} style={{ color: "#34d399", flexShrink: 0, marginTop: "2px" }}/>
                    : <XCircle    size={16} style={{ color: "#f87171", flexShrink: 0, marginTop: "2px" }}/>
                  }
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: resultBanner.type === "success" ? "#34d399" : "#f87171" }}>
                      {resultBanner.type === "success" ? t("✓ ডেলিভার্ড ও স্টক আপডেট!","✓ Delivered & stock updated!") : t("অর্ডার ব্যর্থ হিসেবে চিহ্নিত","Order marked as failed")}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>{resultBanner.order?.orderId}</p>
                    {resultBanner.stockErrors?.map((e, i) => (
                      <p key={i} className="text-xs mt-0.5" style={{ color: "#e8a427" }}>• {e}</p>
                    ))}
                  </div>
                  <button onClick={() => setResult(null)} style={{ color: "#475569" }}>
                    <X size={14}/>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ══ CONTROLS ══ */}
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
              {/* search */}
              <div className="relative flex-1 flex items-center gap-2 rounded-xl px-3"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Search size={14} style={{ color: "#475569", flexShrink: 0 }}/>
                <input type="text"
                  placeholder={t("নাম, ফোন, অর্ডার আইডি খুঁজুন…","Search name, phone, order ID…")}
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="dc-search-input py-2.5"/>
                {search && (
                  <button onClick={() => setSearch("")} style={{ color: "#475569" }}>
                    <X size={13}/>
                  </button>
                )}
              </div>

              {/* filter tabs */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {FILTER_TABS.map(tab => {
                  const count  = tab.value === "all" ? orders.length : (counts[tab.value] || 0);
                  const active = filter === tab.value;
                  return (
                    <button key={tab.value} onClick={() => setFilter(tab.value)}
                      className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: active ? `${tab.dot}18` : "rgba(255,255,255,0.04)",
                        border: `1px solid ${active ? `${tab.dot}35` : "rgba(255,255,255,0.08)"}`,
                        color: active ? tab.dot : "#64748b",
                        boxShadow: active ? `0 0 0 1px ${tab.dot}20` : "none",
                      }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: active ? tab.dot : "#334155" }}/>
                      {tab.label}
                      {count > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                          style={{ background: active ? `${tab.dot}20` : "rgba(255,255,255,0.06)", color: active ? tab.dot : "#475569" }}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* sort */}
              <div className="relative" ref={sortRef}>
                <button onClick={() => setSortOpen(o => !o)}
                  className="flex items-center gap-2 text-xs rounded-xl px-3 py-2.5 transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" }}>
                  <span style={{ color: "#cbd5e1", fontWeight: 500 }}>{sortOpts.find(o => o.value === sort)?.label}</span>
                  <ChevronDown size={12} style={{ color: "#475569" }}/>
                </button>
                <AnimatePresence>
                  {sortOpen && (
                    <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }}
                      exit={{ opacity:0 }} transition={{ duration:0.15 }}
                      className="absolute right-0 top-full mt-1.5 w-44 z-50 rounded-xl overflow-hidden"
                      style={{ background: "#1a2235", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 16px 48px rgba(0,0,0,0.5)" }}>
                      {sortOpts.map(opt => (
                        <div key={opt.value} onClick={() => { setSort(opt.value); setSortOpen(false); }}
                          className="px-4 py-2.5 text-xs cursor-pointer transition"
                          style={{ color: sort === opt.value ? "#c9a84c" : "#94a3b8", background: sort === opt.value ? "rgba(201,168,76,0.08)" : "transparent", fontWeight: sort === opt.value ? 600 : 400 }}>
                          {opt.label}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ══ TABLE ══ */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "#0d1426", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>

              <div className="dc-col-header">
                {["#", t("অর্ডার","Order"), t("কাস্টমার","Customer"), t("লোকেশন","Location"), t("পণ্য","Items"), t("মোট","Total"), t("নোট","Note")].map((h, i) => (
                  <div key={i}
                    className={`text-[10px] font-semibold uppercase tracking-wider ${i >= 2 ? "dc-hide-sm" : ""}`}
                    style={{ color: "#2d3f55" }}>{h}</div>
                ))}
              </div>

              <div className="overflow-y-auto" style={{ maxHeight: "60vh" }}>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)" }}>
                      <Loader2 size={20} className="animate-spin" style={{ color: "#34d399" }}/>
                    </div>
                    <p className="text-xs font-medium" style={{ color: "#475569" }}>{t("লোড হচ্ছে…","Loading…")}</p>
                  </div>
                ) : displayed.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <Truck size={24} style={{ color: "#1e293b" }}/>
                    </div>
                    <p className="text-sm font-medium" style={{ color: "#475569" }}>
                      {t("কোনো অর্ডার পাওয়া যায়নি।","No orders found.")}
                    </p>
                  </div>
                ) : displayed.map((order, idx) => {
                  const cfg   = STATUS_CFG[order.status] || STATUS_CFG.confirmed;
                  const items = order.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 0;
                  const note  = order.cancellationReason || order.deliveryNote || "";
                  return (
                    <motion.div key={order._id} className="dc-row"
                      initial={{ opacity:0 }} animate={{ opacity:1 }}
                      transition={{ delay: idx * 0.015 }}
                      onClick={() => setDetail(order)}>

                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.dot }}/>
                        <span className="text-xs font-medium" style={{ color: "#2d3f55" }}>{idx + 1}</span>
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "#e2e8f0" }}>{order.orderId}</p>
                        <span className="text-xs font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
                      </div>

                      <div className="min-w-0 dc-hide-sm">
                        <p className="text-sm font-medium truncate" style={{ color: "#94a3b8" }}>{order.customer?.name}</p>
                        <p className="text-xs" style={{ color: "#475569" }}>{order.customer?.phone}</p>
                      </div>

                      <div className="min-w-0 dc-hide-sm">
                        <p className="text-sm truncate" style={{ color: "#94a3b8" }}>{order.customer?.district}</p>
                        <p className="text-xs truncate" style={{ color: "#475569" }}>{order.customer?.thana}</p>
                      </div>

                      <div className="dc-hide-sm">
                        <p className="text-sm font-semibold" style={{ color: "#94a3b8" }}>{items}</p>
                      </div>

                      <div className="dc-hide-sm">
                        <p className="text-sm font-bold" style={{ color: "#c9a84c" }}>৳{order.total?.toLocaleString()}</p>
                        <p className="text-xs" style={{ color: "#475569" }}>{PAY_LABEL[order.paymentMethod]}</p>
                      </div>

                      <div className="dc-hide-sm">
                        {note
                          ? <p className="text-xs truncate max-w-[80px]" style={{ color: "#475569" }} title={note}>{note}</p>
                          : <span style={{ color: "#1e293b", fontSize: "12px" }}>—</span>
                        }
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {detailOrder && (
            <OrderDetailModal order={detailOrder} onClose={() => setDetail(null)}
              onSuccess={(o, note) => { setDetail(null); setModal({ order:o, type:"success", note }); }}
              onFail={(o, note)    => { setDetail(null); setModal({ order:o, type:"fail",    note }); }}
              t={t}/>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {modal && (
            <ConfirmActionModal order={modal.order} type={modal.type} note={modal.note}
              onClose={() => setModal(null)} onConfirm={handleConfirm} loading={confirming} t={t}/>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}