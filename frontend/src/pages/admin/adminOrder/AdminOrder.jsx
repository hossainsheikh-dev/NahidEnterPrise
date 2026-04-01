import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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

const API       = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;
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

/* ─────────────── Portal ─────────────── */
function ModalPortal({ children }) {
  return createPortal(children, document.body);
}

/* ─────────────── Screenshot Viewer ─────────────── */
function ScreenshotViewer({ url }) {
  const [zoomed, setZoomed] = useState(false);
  if (!url) return (
    <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(99,102,241,0.04)", border:"1px dashed rgba(99,102,241,0.2)", borderRadius:10, padding:"10px 14px" }}>
      <ImageIcon size={13} style={{ color:"#c4cdd8" }} />
      <span style={{ fontSize:12, color:"#94a3b8", fontStyle:"italic" }}>No screenshot uploaded</span>
    </div>
  );
  return (
    <>
      <div onClick={() => setZoomed(true)} style={{ position:"relative", borderRadius:12, overflow:"hidden", border:"1px solid rgba(99,102,241,0.12)", cursor:"zoom-in" }}>
        <img src={url} alt="payment proof" style={{ width:"100%", maxHeight:176, objectFit:"contain", background:"#f8f9ff", padding:4, display:"block" }} />
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0)", transition:"background .2s" }}
          onMouseEnter={e => e.currentTarget.style.background="rgba(0,0,0,0.12)"}
          onMouseLeave={e => e.currentTarget.style.background="rgba(0,0,0,0)"}>
          <span style={{ fontSize:11, fontWeight:600, color:"#fff", background:"rgba(0,0,0,0.55)", padding:"4px 10px", borderRadius:8 }}>🔍 Click to zoom</span>
        </div>
      </div>
      <AnimatePresence>
        {zoomed && (
          <ModalPortal>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.92)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}
              onClick={() => setZoomed(false)}>
              <motion.img initial={{ scale:0.85 }} animate={{ scale:1 }} exit={{ scale:0.85 }}
                transition={{ type:"spring", stiffness:280, damping:22 }}
                src={url} alt="proof" style={{ maxWidth:"100%", maxHeight:"90vh", borderRadius:16, boxShadow:"0 24px 64px rgba(0,0,0,0.6)", objectFit:"contain" }} />
              <button style={{ position:"absolute", top:20, right:20, width:40, height:40, borderRadius:"50%", background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.2)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <X size={18} style={{ color:"#fff" }} />
              </button>
            </motion.div>
          </ModalPortal>
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

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

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

  const sec = { background:"rgba(99,102,241,0.025)", border:"1px solid rgba(99,102,241,0.09)", borderRadius:16, padding:"14px 16px" };
  const secLabel = { fontSize:10, fontWeight:800, color:"#94a3b8", letterSpacing:".1em", textTransform:"uppercase", marginBottom:10, display:"block" };

  return (
    <ModalPortal>
      <AnimatePresence>
        <motion.div
          initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          style={{
            position:"fixed", inset:0, zIndex:9000,
            background:"rgba(15,23,42,0.55)",
            backdropFilter:"blur(10px)",
            WebkitBackdropFilter:"blur(10px)",
            display:"flex",
            alignItems:"flex-start",
            justifyContent:"center",
            padding:"16px 16px 32px",
            overflowY:"auto",
          }}
          onClick={onClose}>
          <motion.div
            initial={{ opacity:0, y:-24, scale:0.97 }}
            animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:-16, scale:0.97 }}
            transition={{ type:"spring", stiffness:320, damping:28 }}
            style={{
              background:"#ffffff",
              borderRadius:24,
              border:"1px solid rgba(99,102,241,0.14)",
              boxShadow:"0 0 0 1px rgba(99,102,241,0.06), 0 32px 80px rgba(15,23,42,0.28), 0 8px 24px rgba(99,102,241,0.12)",
              width:"100%",
              maxWidth:520,
              display:"flex",
              flexDirection:"column",
              overflow:"hidden",
              marginTop:0,
            }}
            onClick={e => e.stopPropagation()}>

            <div style={{ height:4, background:`linear-gradient(90deg, ${currentCfg.barBg}, ${currentCfg.barBg}cc)`, flexShrink:0 }} />

            {/* Header */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", flexShrink:0, borderBottom:"1px solid rgba(99,102,241,0.08)", background:"rgba(99,102,241,0.02)" }}>
              <div>
                <p style={{ fontSize:10, fontWeight:800, color:"#94a3b8", letterSpacing:".1em", textTransform:"uppercase" }}>{t("অর্ডার বিবরণ","Order Details")}</p>
                <p style={{ fontSize:15, fontWeight:800, color:"#0f172a", marginTop:2, letterSpacing:"-0.02em" }}>{order.orderId}</p>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:11, fontWeight:700, padding:"5px 12px", borderRadius:99, background:currentCfg.bg, color:currentCfg.color, border:`1.5px solid ${currentCfg.border}`, display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:currentCfg.dot, display:"inline-block" }} />{currentCfg.label}
                </span>
                <button onClick={onClose} style={{ width:34, height:34, borderRadius:10, background:"rgba(99,102,241,0.07)", border:"1px solid rgba(99,102,241,0.13)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                  <X size={15} style={{ color:"#6366f1" }} />
                </button>
              </div>
            </div>

            <div style={{ padding:"16px 18px", display:"flex", flexDirection:"column", gap:10 }}>

              {/* Status updater */}
              <div style={{ ...sec, background:"rgba(99,102,241,0.03)" }}>
                <span style={secLabel}>{t("স্ট্যাটাস আপডেট","Update Status")}</span>
                {isFinished ? (
                  <div style={{ display:"flex", alignItems:"center", gap:10, background:currentCfg.bg, border:`1px solid ${currentCfg.border}`, borderRadius:12, padding:"12px 14px" }}>
                    <currentCfg.icon size={15} style={{ color:currentCfg.color, flexShrink:0 }} />
                    <p style={{ fontSize:13, fontWeight:600, color:currentCfg.color }}>
                      {order.status === "delivered" ? t("✓ অর্ডার ডেলিভার্ড — আর পরিবর্তন নেই","✓ Delivered — no more changes") : t("✗ অর্ডার বাতিল","✗ Order cancelled")}
                    </p>
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                      <span style={{ fontSize:12, fontWeight:600, color:currentCfg.color }}>{currentCfg.label}</span>
                      <ArrowRight size={11} style={{ color:"#c4cdd8" }} />
                      <span style={{ fontSize:12, color:"#94a3b8" }}>{t("একাধিক স্টেপ বেছে নিন:","Select steps:")}</span>
                    </div>
                    <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                      {allowed.map(s => {
                        const c=STATUS_CFG[s]; const selIdx=selected.indexOf(s); const isOn=selIdx!==-1; const isCan=s==="cancelled";
                        return (
                          <motion.button key={s} type="button" whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                            onClick={() => toggleStatus(s)}
                            style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 12px", borderRadius:10, fontSize:12, fontWeight:600, cursor:"pointer", background:isOn?c.bg:"#f8f9ff", border:`1.5px solid ${isOn?c.border:isCan?"rgba(248,113,113,0.2)":"rgba(99,102,241,0.12)"}`, color:isOn?c.color:isCan?"#f87171":"#94a3b8", transition:"all .15s" }}>
                            {isOn && <span style={{ width:16, height:16, borderRadius:"50%", fontSize:9, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, background:isCan?"#f87171":c.dot, color:"#fff" }}>{selIdx+1}</span>}
                            <c.icon size={12} />{c.label}
                          </motion.button>
                        );
                      })}
                    </div>
                    {selected.length > 0 && (
                      <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap", gap:4, background:"rgba(99,102,241,0.05)", borderRadius:10, padding:"8px 12px" }}>
                        <span style={{ fontSize:11, fontWeight:600, color:currentCfg.color }}>{currentCfg.label}</span>
                        {selected.map(s => { const c=STATUS_CFG[s]; return (<span key={s} style={{ display:"flex", alignItems:"center", gap:4 }}><ArrowRight size={9} style={{ color:"#c4cdd8" }} /><span style={{ fontSize:11, fontWeight:700, color:c.color }}>{c.label}</span></span>); })}
                        <span style={{ marginLeft:"auto", fontSize:10, color:"#94a3b8" }}>→ {t("চূড়ান্ত","final")}: <span style={{ fontWeight:700, color:"#374151" }}>{STATUS_CFG[finalStatus]?.label}</span></span>
                      </div>
                    )}
                    <AnimatePresence>
                      {hasCancelled && (
                        <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }} style={{ overflow:"hidden" }}>
                          <div style={{ paddingTop:4, display:"flex", flexDirection:"column", gap:6 }}>
                            <p style={{ fontSize:12, fontWeight:600, color:"#f87171", display:"flex", alignItems:"center", gap:5 }}>
                              <AlertTriangle size={11} /> {t("বাতিলের কারণ (আবশ্যক)","Cancellation reason (required)")}
                            </p>
                            <input type="text" value={reason} onChange={e => { setReason(e.target.value); setErr(""); }}
                              placeholder={t("যেমন: ভুল ঠিকানা...","e.g. Wrong address...")} autoFocus
                              style={{ width:"100%", outline:"none", background:"#fff", border:"1.5px solid rgba(248,113,113,0.3)", borderRadius:12, padding:"10px 14px", fontSize:13, color:"#1e293b", fontFamily:"inherit", transition:"all .15s" }} />
                            {err && <p style={{ fontSize:12, color:"#f87171", fontWeight:500 }}>{err}</p>}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <motion.button onClick={handleSave} disabled={saving||!finalStatus}
                      whileHover={!saving&&finalStatus?{scale:1.01,y:-1}:{}} whileTap={!saving&&finalStatus?{scale:0.97}:{}}
                      style={{ width:"100%", padding:"12px 20px", borderRadius:13, fontSize:13.5, fontWeight:700, color:hasCancelled?"#fff":"#0a0f1e", border:"none", cursor:!finalStatus?"not-allowed":"pointer", opacity:!finalStatus?0.45:1, background:hasCancelled?"linear-gradient(135deg,#f87171,#ef4444)":"linear-gradient(135deg,#c9a84c,#e8c876)", boxShadow:!finalStatus?"none":hasCancelled?"0 6px 20px rgba(248,113,113,0.3)":"0 6px 20px rgba(201,168,76,0.3)", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"all .15s" }}>
                      {saving ? <><Loader2 size={14} className="animate-spin" /> {t("সংরক্ষণ হচ্ছে…","Saving…")}</> : !finalStatus ? t("স্টেপ বেছে নিন","Select a step") : hasCancelled ? t("✗ অর্ডার বাতিল করুন","✗ Cancel Order") : `→ ${t("করুন","Set")} ${STATUS_CFG[finalStatus]?.label}`}
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Customer */}
              <div style={sec}>
                <span style={secLabel}>{t("কাস্টমার","Customer")}</span>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:36, height:36, borderRadius:11, flexShrink:0, background:"linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.12))", border:"1px solid rgba(99,102,241,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"#6366f1" }}>
                      {order.customer?.name?.[0]?.toUpperCase()}
                    </div>
                    <span style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>{order.customer?.name}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:7 }}><Phone size={11} style={{ color:"#a8b4c8", flexShrink:0 }} /><span style={{ fontSize:13, color:"#64748b" }}>{order.customer?.phone}</span></div>
                  {order.customer?.email && <span style={{ fontSize:12, color:"#94a3b8" }}>{order.customer.email}</span>}
                  <div style={{ display:"flex", alignItems:"flex-start", gap:7 }}><MapPin size={11} style={{ color:"#a8b4c8", flexShrink:0, marginTop:2 }} /><span style={{ fontSize:13, color:"#64748b" }}>{order.customer?.address}, {order.customer?.thana}, {order.customer?.district}</span></div>
                  {order.customer?.note && <p style={{ fontSize:12, color:"#94a3b8", fontStyle:"italic", background:"rgba(99,102,241,0.04)", borderRadius:10, padding:"8px 12px", border:"1px solid rgba(99,102,241,0.08)" }}>"{order.customer.note}"</p>}
                </div>
              </div>

              {order.status === "cancelled" && order.cancellationReason && (
                <div style={{ display:"flex", alignItems:"flex-start", gap:10, background:"rgba(248,113,113,0.06)", border:"1px solid rgba(248,113,113,0.18)", borderRadius:14, padding:"12px 14px" }}>
                  <AlertTriangle size={13} style={{ color:"#f87171", flexShrink:0, marginTop:1 }} />
                  <div>
                    <p style={{ fontSize:11, fontWeight:700, color:"#f87171", marginBottom:3, textTransform:"uppercase", letterSpacing:".05em" }}>{t("বাতিলের কারণ","Cancellation Reason")}</p>
                    <p style={{ fontSize:13, color:"#ef4444" }}>{order.cancellationReason}</p>
                  </div>
                </div>
              )}

              {isDigital && (
                <div style={{ ...sec, background:proofOk?"rgba(52,211,153,0.05)":"rgba(232,164,39,0.05)", border:`1px solid ${proofOk?"rgba(52,211,153,0.18)":"rgba(232,164,39,0.2)"}` }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                    <span style={{ ...secLabel, marginBottom:0 }}>{t("পেমেন্ট","Payment")} — {PAY_LABEL[order.paymentMethod]}</span>
                    <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99, background:proofOk?"rgba(52,211,153,0.1)":"rgba(232,164,39,0.1)", color:proofOk?"#059669":"#d97706", border:`1px solid ${proofOk?"rgba(52,211,153,0.2)":"rgba(232,164,39,0.2)"}` }}>
                      {proofOk ? t("✓ সম্পূর্ণ","✓ Complete") : t("⚠ অসম্পূর্ণ","⚠ Incomplete")}
                    </span>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:10 }}>
                    {[{ icon:Phone, label:t("প্রেরকের নম্বর","Sender #"), val:order.paymentNumber, mono:false },{ icon:Hash, label:t("ট্রানজেকশন আইডি","TrxID"), val:order.transactionId, mono:true }].map(r => (
                      <div key={r.label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#fff", borderRadius:10, padding:"8px 12px", border:"1px solid rgba(99,102,241,0.08)" }}>
                        <span style={{ fontSize:11, color:"#94a3b8", display:"flex", alignItems:"center", gap:5 }}><r.icon size={10} />{r.label}</span>
                        <span style={{ fontSize:12, fontWeight:600, fontFamily:r.mono?"monospace":"inherit", color:r.val?"#374151":"#f87171", fontStyle:r.val?"normal":"italic" }}>{r.val||t("দেওয়া হয়নি","Not provided")}</span>
                      </div>
                    ))}
                  </div>
                  <ScreenshotViewer url={order.screenshotUrl} />
                </div>
              )}

              {/* Items */}
              <div style={sec}>
                <span style={secLabel}>{t("পণ্যসমূহ","Items")} ({order.items?.length})</span>
                <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                  {order.items?.map((item, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:10, background:"#fff", borderRadius:11, padding:"8px 10px", border:"1px solid rgba(99,102,241,0.07)" }}>
                      <div style={{ width:40, height:40, borderRadius:9, flexShrink:0, background:"rgba(99,102,241,0.04)", border:"1px solid rgba(99,102,241,0.09)", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {item.image ? <img src={item.image} alt={item.name} style={{ width:"100%", height:"100%", objectFit:"contain", padding:2 }} /> : <Package size={13} style={{ color:"#c4cdd8" }} />}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:12.5, fontWeight:600, color:"#1e293b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</p>
                        <p style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>৳{(item.salePrice||item.price||0).toLocaleString()} × {item.quantity}</p>
                      </div>
                      <p style={{ fontSize:13.5, fontWeight:700, color:"#1e293b", flexShrink:0 }}>৳{((item.salePrice||item.price||0)*(item.quantity||1)).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div style={sec}>
                <span style={secLabel}>{t("সারসংক্ষেপ","Summary")}</span>
                <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                  {[
                    { label:t("সাবটোটাল","Subtotal"), val:`৳${order.subtotal?.toLocaleString()}`, color:"#64748b" },
                    ...(order.savings>0?[{ label:t("সাশ্রয়","Savings"), val:`−৳${order.savings?.toLocaleString()}`, color:"#059669" }]:[]),
                    { label:t("ডেলিভারি","Delivery"), val:order.deliveryCharge===0?t("বিনামূল্যে","Free"):`৳${order.deliveryCharge}`, color:"#64748b" },
                  ].map(r => (
                    <div key={r.label} style={{ display:"flex", justifyContent:"space-between" }}>
                      <span style={{ fontSize:13, color:"#94a3b8" }}>{r.label}</span>
                      <span style={{ fontSize:13, color:r.color, fontWeight:500 }}>{r.val}</span>
                    </div>
                  ))}
                  <div style={{ height:1, background:"rgba(99,102,241,0.08)", margin:"2px 0" }} />
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontSize:14, fontWeight:700, color:"#1e293b" }}>{t("মোট","Total")}</span>
                    <span style={{ fontSize:15, fontWeight:900, color:"#0f172a" }}>৳{order.total?.toLocaleString()}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, paddingTop:2 }}>
                    <CreditCard size={11} style={{ color:"#a8b4c8" }} />
                    <span style={{ fontSize:12, color:"#94a3b8" }}>{PAY_LABEL[order.paymentMethod]}</span>
                    <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:99, marginLeft:"auto",
                      background:order.paymentStatus==="paid"?"rgba(52,211,153,0.08)":order.paymentStatus==="awaiting_confirmation"?"rgba(56,189,248,0.08)":"rgba(232,164,39,0.08)",
                      color:order.paymentStatus==="paid"?"#059669":order.paymentStatus==="awaiting_confirmation"?"#0284c7":"#d97706",
                      border:`1px solid ${order.paymentStatus==="paid"?"rgba(52,211,153,0.2)":order.paymentStatus==="awaiting_confirmation"?"rgba(56,189,248,0.2)":"rgba(232,164,39,0.2)"}` }}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              <p style={{ fontSize:11.5, textAlign:"center", color:"#c4cdd8" }}>{new Date(order.createdAt).toLocaleString("en-BD")}</p>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </ModalPortal>
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

  const silentFetch = async () => {
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(ORDER_API, { headers: { Authorization: `Bearer ${token}` } });
      const data  = await res.json();
      if (data.success) setOrders(data.data);
    } catch (e) { console.error(e); }
  };

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

  useEffect(() => {
    fetchOrders();
    intervalRef.current = setInterval(() => { silentFetch(); setCountdown(10); }, 10000);
    countdownRef.current = setInterval(() => { setCountdown(p => (p <= 1 ? 10 : p - 1)); }, 1000);
    return () => { clearInterval(intervalRef.current); clearInterval(countdownRef.current); };
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

  const displayed = useMemo(() => orders
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
    }), [orders, search, fStatus, fPay, sort]);

  const stats = {
    total:      orders.length,
    pending:    orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    shipped:    orders.filter(o => o.status === "shipped").length,
  };

  const statCards = [
    { labelBn:"মোট",      labelEn:"Total",      count:stats.total,      color:"#c9a84c", soft:"rgba(201,168,76,0.08)",  border:"rgba(201,168,76,0.22)",  grad:"linear-gradient(135deg,#e8c876,#c9a84c)", icon:ShoppingCart },
    { labelBn:"অপেক্ষা",  labelEn:"Pending",    count:stats.pending,    color:"#d97706", soft:"rgba(232,164,39,0.08)", border:"rgba(232,164,39,0.22)", grad:"linear-gradient(135deg,#fbbf24,#f59e0b)", icon:Clock        },
    { labelBn:"প্রসেসিং", labelEn:"Processing", count:stats.processing, color:"#7c3aed", soft:"rgba(167,139,250,0.08)", border:"rgba(167,139,250,0.22)", grad:"linear-gradient(135deg,#a78bfa,#7c3aed)", icon:Box          },
    { labelBn:"পথে",      labelEn:"Shipped",    count:stats.shipped,    color:"#2563eb", soft:"rgba(96,165,250,0.08)",  border:"rgba(96,165,250,0.22)",  grad:"linear-gradient(135deg,#60a5fa,#3b82f6)", icon:Truck        },
  ];

  /* inline dropdown */
  const DDBtn = ({ refEl, open, setOpen, value, options, onChange }) => (
    <div style={{ position:"relative" }} ref={refEl}>
      <button type="button" onClick={() => setOpen(o => !o)}
        style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, fontSize:13, borderRadius:12, padding:"9px 14px", cursor:"pointer", background:"#fff", border:"1px solid rgba(99,102,241,0.15)", color:"#374151", fontWeight:500, minWidth:130, boxShadow:"0 1px 4px rgba(99,102,241,0.05)", fontFamily:"inherit" }}>
        <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{options.find(o => o.value === value)?.label}</span>
        <ChevronDown size={12} style={{ color:"#a8b4c8", flexShrink:0 }}/>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }}
            exit={{ opacity:0 }} transition={{ duration:0.15 }}
            style={{ position:"absolute", right:0, top:"calc(100% + 6px)", minWidth:"100%", borderRadius:14, background:"#fff", border:"1px solid rgba(99,102,241,0.12)", boxShadow:"0 16px 48px rgba(99,102,241,0.13)", overflow:"hidden", zIndex:50 }}>
            {options.map(opt => (
              <div key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{ padding:"10px 14px", fontSize:13, cursor:"pointer", background: value === opt.value ? "rgba(99,102,241,0.07)" : "transparent", color: value === opt.value ? "#6366f1" : "#374151", fontWeight: value === opt.value ? 600 : 400, whiteSpace:"nowrap" }}
                onMouseEnter={e => { if (value !== opt.value) e.currentTarget.style.background = "rgba(99,102,241,0.04)"; }}
                onMouseLeave={e => { if (value !== opt.value) e.currentTarget.style.background = "transparent"; }}>
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
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        .ao-wrap, .ao-wrap * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }

        /* ── stat grid: 4 col desktop, 2 col mobile ── */
        .ao-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        @media (max-width: 640px) {
          .ao-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 9px; }
        }

        /* ── table rows ── */
        .ao-col-header, .ao-row {
          display: grid;
          align-items: center;
          grid-template-columns: 22px 1fr 1fr 72px 62px;
          gap: 8px;
        }
        .ao-col-header {
          padding: 10px 20px;
          font-size: 10.5px; font-weight: 700; color: #94a3b8;
          letter-spacing: .06em; text-transform: uppercase;
          border-bottom: 1px solid rgba(99,102,241,0.08);
          background: rgba(99,102,241,0.02);
          position: sticky; top: 0; z-index: 10;
        }
        .ao-row {
          padding: 12px 20px;
          border-bottom: 1px solid rgba(99,102,241,0.06);
          transition: background 0.12s;
        }
        .ao-row:last-child { border-bottom: none; }
        .ao-row:hover { background: rgba(99,102,241,0.025); }

        @media (max-width: 640px) {
          .ao-col-header, .ao-row {
            grid-template-columns: 16px 1fr 1fr 58px 54px;
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
          .ao-hide-sm { display: none !important; }
        }
        @media (max-width: 400px) {
          .ao-col-header, .ao-row {
            grid-template-columns: 14px 1fr 1fr 50px 48px;
            padding-left: 8px !important;
            padding-right: 8px !important;
          }
        }

        .ao-icon-btn {
          width: 28px; height: 28px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.15s; border: none;
        }
      `}</style>

      <div className="ao-wrap" style={{ padding:"0 8px 32px" }}>
        <AnimatePresence mode="wait">
          <motion.div key="ao" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
            exit={{ opacity:0 }} transition={{ duration:0.25 }}>

            {/* ── PAGE TITLE ── */}
            <div style={{ textAlign:"center", marginBottom:12 }}>
              <h1 style={{ fontSize:"clamp(20px,4vw,28px)", fontWeight:900, color:"#1e293b", letterSpacing:"-0.03em" }}>
                {t("অর্ডার","Orders")}
              </h1>
              <p style={{ fontSize:13, color:"#94a3b8", marginTop:4 }}>
                {t("সকল অর্ডার পরিচালনা করুন","Manage all your orders")}
              </p>
            </div>

            <div style={{ marginBottom:14 }}>
              <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 12px", borderRadius:8, background:"rgba(201,168,76,0.1)", border:"1px solid rgba(201,168,76,0.22)", color:"#c9a84c", fontWeight:600, fontSize:12 }}>
                <ShoppingCart size={12} /> {t("অর্ডার","Orders")}
              </span>
            </div>

            {/* ── TOP BAR (search + refresh + live) ── */}
            <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:12, background:"linear-gradient(160deg,#ffffff,#fafbff)", border:"1px solid rgba(99,102,241,0.10)", borderRadius:18, padding:"14px 16px", marginBottom:14, boxShadow:"0 4px 20px rgba(99,102,241,0.06)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, flex:"1 1 220px", maxWidth:340, background:"rgba(99,102,241,0.05)", border:"1px solid rgba(99,102,241,0.12)", borderRadius:11, padding:"8px 13px" }}>
                <Search size={14} style={{ color:"#a8b4c8", flexShrink:0 }} />
                <input type="text"
                  placeholder={t("নাম, ফোন, অর্ডার আইডি…","Search name, phone, order ID…")}
                  value={search} onChange={e => setSearch(e.target.value)}
                  style={{ background:"transparent", outline:"none", border:"none", fontSize:13, color:"#374151", width:"100%", fontFamily:"'Plus Jakarta Sans',sans-serif" }} />
                {search && <button onClick={() => setSearch("")} style={{ color:"#a8b4c8", lineHeight:1, background:"none", border:"none", cursor:"pointer" }}><X size={12} /></button>}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:10, background:"rgba(52,211,153,0.06)", border:"1px solid rgba(52,211,153,0.15)" }}>
                  <motion.div animate={{ opacity:[1,0.3,1] }} transition={{ duration:1, repeat:Infinity }}
                    style={{ width:6, height:6, borderRadius:"50%", background:"#34d399" }} />
                  <span style={{ fontSize:11, fontWeight:600, color:"#34d399" }}>Live</span>
                  <span style={{ fontSize:11, fontWeight:700, color:"#34d399" }}>{countdown}s</span>
                </div>
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                  onClick={() => { fetchOrders(); setCountdown(10); }}
                  style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.14)", borderRadius:11, padding:"9px 14px", fontSize:13, fontWeight:500, color:"#6366f1", cursor:"pointer" }}>
                  <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                  <span>{t("রিফ্রেশ","Refresh")}</span>
                </motion.button>
              </div>
            </div>

            {/* ── STAT CARDS (2×2 on mobile) ── */}
            <div className="ao-stats-grid" style={{ marginBottom:14 }}>
              {statCards.map((s,i) => (
                <motion.div key={s.labelEn}
                  initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:i*0.06, duration:0.38, ease:[0.22,1,0.36,1] }}>
                  <div style={{ background:"#fff", borderRadius:16, border:`1.5px solid ${s.border}`, boxShadow:`0 4px 20px ${s.soft}, 0 1px 4px rgba(0,0,0,0.04)`, overflow:"hidden", position:"relative" }}>
                    <div style={{ height:3, background:s.grad }} />
                    <div style={{ padding:"13px 14px 14px" }}>
                      <div style={{ width:36, height:36, borderRadius:10, background:s.grad, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10, boxShadow:`0 4px 12px ${s.color}28` }}>
                        <s.icon size={15} color="#fff" strokeWidth={2.2} />
                      </div>
                      <p style={{ fontSize:26, fontWeight:900, color:s.color, lineHeight:1, letterSpacing:"-0.03em", marginBottom:5 }}>{s.count}</p>
                      <p style={{ fontSize:10.5, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".07em" }}>{t(s.labelBn, s.labelEn)}</p>
                    </div>
                    <div style={{ position:"absolute", bottom:-12, right:-12, width:60, height:60, borderRadius:"50%", background:`radial-gradient(circle,${s.color}12 0%,transparent 70%)`, pointerEvents:"none" }} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ── FILTER ROW ── */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:14 }}>
              <div style={{ display:"flex", alignItems:"center", flex:"none" }}>
                <DDBtn refEl={statusRef} open={statusOpen} setOpen={setStatusOpen} value={fStatus} options={STATUS_OPTS} onChange={setFStatus}/>
              </div>
              <div style={{ display:"flex", alignItems:"center", flex:"none" }}>
                <DDBtn refEl={payRef}    open={payOpen}    setOpen={setPayOpen}    value={fPay}    options={PAY_OPTS}    onChange={setFPay}/>
              </div>
              <div style={{ display:"flex", alignItems:"center", flex:"none" }}>
                <DDBtn refEl={sortRef}   open={sortOpen}   setOpen={setSortOpen}   value={sort}    options={SORT_OPTS}   onChange={setSort}/>
              </div>
            </div>

            {/* ── TABLE CARD ── */}
            <div style={{ background:"linear-gradient(160deg,#ffffff,#fafbff)", border:"1px solid rgba(99,102,241,0.10)", borderRadius:18, boxShadow:"0 4px 24px rgba(99,102,241,0.06)", overflow:"hidden" }}>

              {/* table header label */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:"1px solid rgba(99,102,241,0.08)", background:"rgba(99,102,241,0.025)" }}>
                <h2 style={{ fontSize:14, fontWeight:900, color:"#1e293b", letterSpacing:"-0.02em" }}>
                  {t("অর্ডার তালিকা","Orders List")}
                  {displayed.length !== orders.length && (
                    <span style={{ marginLeft:8, fontSize:11, fontWeight:500, color:"#94a3b8" }}>
                      ({displayed.length} {t("এর","of")} {orders.length})
                    </span>
                  )}
                </h2>
              </div>

              {/* col headers */}
              <div className="ao-col-header">
                <div>#</div>
                <div>{t("অর্ডার","Order")}</div>
                <div className="ao-hide-sm">{t("কাস্টমার","Customer")}</div>
                <div>{t("মোট","Total")}</div>
                <div style={{ textAlign:"right" }}>{t("অ্যাকশন","Action")}</div>
              </div>

              <div style={{ overflowY:"auto", maxHeight:"60vh" }}>
                {loading ? (
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"64px 0", gap:12 }}>
                    <Loader2 size={26} style={{ color:"#c4cdd8" }} className="animate-spin" />
                    <p style={{ fontSize:13, color:"#94a3b8" }}>{t("অর্ডার লোড হচ্ছে…","Loading orders…")}</p>
                  </div>
                ) : displayed.length === 0 ? (
                  <div style={{ padding:"56px 0", textAlign:"center" }}>
                    <div style={{ width:48, height:48, borderRadius:14, background:"rgba(99,102,241,0.07)", border:"1px solid rgba(99,102,241,0.12)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
                      <Package size={22} style={{ color:"#c4cdd8" }} />
                    </div>
                    <p style={{ fontSize:13, color:"#94a3b8" }}>{t("কোনো অর্ডার পাওয়া যায়নি।","No orders found.")}</p>
                  </div>
                ) : displayed.map((order, idx) => {
                  const cfg   = STATUS_CFG[order.status] || STATUS_CFG.pending;
                  const isDig = order.paymentMethod !== "cod";
                  const proofOk = isDig && order.transactionId && order.screenshotUrl;
                  const proofBd = isDig && (!order.transactionId || !order.screenshotUrl);
                  return (
                    <motion.div key={order._id} className="ao-row"
                      initial={{ opacity:0 }} animate={{ opacity:1 }}
                      transition={{ delay: idx * 0.015 }}>

                      <div style={{ fontSize:11.5, fontWeight:600, color:"#c4cdd8" }}>{idx+1}</div>

                      <div style={{ minWidth:0, paddingRight:8 }}>
                        <p style={{ fontSize:12.5, fontWeight:700, color:"#1e293b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{order.orderId}</p>
                        <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
                          <span style={{ width:5, height:5, borderRadius:"50%", background:cfg.dot, display:"inline-block", flexShrink:0 }} />
                          <span style={{ fontSize:10, fontWeight:700, color:cfg.color }}>{cfg.label}</span>
                        </div>
                      </div>

                      <div className="ao-hide-sm" style={{ minWidth:0, paddingRight:6 }}>
                        <p style={{ fontSize:12.5, fontWeight:600, color:"#374151", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{order.customer?.name}</p>
                        <p style={{ fontSize:11, color:"#94a3b8" }}>{order.customer?.phone}</p>
                      </div>

                      <div>
                        <p style={{ fontSize:12.5, fontWeight:800, color:"#1e293b", whiteSpace:"nowrap" }}>৳{order.total?.toLocaleString()}</p>
                        <p style={{ fontSize:10.5, color:"#94a3b8" }}>{PAY_LABEL[order.paymentMethod]}</p>
                        {proofOk && <p style={{ fontSize:10, color:"#059669", marginTop:1 }}>✓ {t("প্রমাণ","Proof")}</p>}
                        {proofBd && <p style={{ fontSize:10, color:"#d97706", marginTop:1 }}>⚠ {t("প্রমাণ নেই","No proof")}</p>}
                      </div>

                      <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", gap:6 }}>
                        <motion.button className="ao-icon-btn" whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
                          style={{ background:"rgba(99,102,241,0.07)", border:"1px solid rgba(99,102,241,0.13)", color:"#6366f1" }}
                          onClick={() => setSelOrder(order)}
                          onMouseEnter={e => e.currentTarget.style.background="rgba(99,102,241,0.14)"}
                          onMouseLeave={e => e.currentTarget.style.background="rgba(99,102,241,0.07)"}>
                          <Eye size={13}/>
                        </motion.button>
                        <motion.button className="ao-icon-btn" whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
                          style={{ background:"rgba(248,113,113,0.07)", border:"1px solid rgba(248,113,113,0.13)", color:"#f87171" }}
                          onClick={() => { setDelId(order._id); setDelName(order.orderId); setDelOpen(true); }}
                          onMouseEnter={e => e.currentTarget.style.background="rgba(248,113,113,0.14)"}
                          onMouseLeave={e => e.currentTarget.style.background="rgba(248,113,113,0.07)"}>
                          <Trash2 size={13}/>
                        </motion.button>
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