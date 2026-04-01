import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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

/* ── Portal ── */
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
                src={url} alt="proof" style={{ maxWidth:"100%", maxHeight:"90vh", borderRadius:16, objectFit:"contain" }} />
              <button onClick={() => setZoomed(false)} style={{ position:"absolute", top:20, right:20, width:40, height:40, borderRadius:"50%", background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.2)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
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
function OrderDetailModal({ order, onClose, onSuccess, onFail, t }) {
  const [note, setNote] = useState("");

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  if (!order) return null;
  const cfg    = STATUS_CFG[order.status] || STATUS_CFG.confirmed;
  const isDig  = order.paymentMethod !== "cod";
  const proofOk = isDig && order.transactionId && order.screenshotUrl;
  const canAct = order.status === "confirmed";

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
            display:"flex", alignItems:"flex-start", justifyContent:"center",
            padding:"16px 16px 32px", overflowY:"auto",
          }}
          onClick={onClose}>
          <motion.div
            initial={{ opacity:0, y:-24, scale:0.97 }}
            animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:-16, scale:0.97 }}
            transition={{ type:"spring", stiffness:320, damping:28 }}
            style={{
              background:"#ffffff", borderRadius:24,
              border:"1px solid rgba(99,102,241,0.14)",
              boxShadow:"0 0 0 1px rgba(99,102,241,0.06), 0 32px 80px rgba(15,23,42,0.28)",
              width:"100%", maxWidth:520,
              display:"flex", flexDirection:"column", overflow:"hidden", marginTop:0,
            }}
            onClick={e => e.stopPropagation()}>

            <div style={{ height:4, background:`linear-gradient(90deg, ${cfg.barBg}, ${cfg.barBg}cc)`, flexShrink:0 }} />

            {/* Header */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", flexShrink:0, borderBottom:"1px solid rgba(99,102,241,0.08)", background:"rgba(99,102,241,0.02)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", background:cfg.bg, border:`1.5px solid ${cfg.border}`, flexShrink:0 }}>
                  <cfg.icon size={18} style={{ color:cfg.color }} />
                </div>
                <div>
                  <p style={{ fontSize:10, fontWeight:800, color:"#94a3b8", letterSpacing:".1em", textTransform:"uppercase" }}>{t("অর্ডার বিবরণ","Order Details")}</p>
                  <p style={{ fontSize:15, fontWeight:800, color:"#0f172a", marginTop:1, letterSpacing:"-0.02em" }}>{order.orderId}</p>
                  <span style={{ fontSize:11, fontWeight:700, color:cfg.color, display:"flex", alignItems:"center", gap:4, marginTop:2 }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:cfg.dot, display:"inline-block" }} />
                    {cfg.label}
                  </span>
                </div>
              </div>
              <button onClick={onClose} style={{ width:34, height:34, borderRadius:10, background:"rgba(99,102,241,0.07)", border:"1px solid rgba(99,102,241,0.13)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                <X size={15} style={{ color:"#6366f1" }} />
              </button>
            </div>

            <div style={{ padding:"16px 18px", display:"flex", flexDirection:"column", gap:10 }}>

              {order.status === "cancelled" && (
                <div style={{ display:"flex", alignItems:"flex-start", gap:10, background:"rgba(248,113,113,0.06)", border:"1px solid rgba(248,113,113,0.18)", borderRadius:14, padding:"12px 14px" }}>
                  <AlertTriangle size={13} style={{ color:"#f87171", flexShrink:0, marginTop:1 }} />
                  <div>
                    <p style={{ fontSize:11, fontWeight:700, color:"#f87171", marginBottom:3, textTransform:"uppercase", letterSpacing:".05em" }}>{t("বাতিলের কারণ","Cancellation Reason")}</p>
                    <p style={{ fontSize:13, color:"#e11d48" }}>{order.cancellationReason || t("কোনো কারণ দেওয়া হয়নি","No reason provided")}</p>
                  </div>
                </div>
              )}

              {order.deliveryNote && order.status !== "cancelled" && (
                <div style={{ display:"flex", alignItems:"flex-start", gap:10, background:"rgba(56,189,248,0.06)", border:"1px solid rgba(56,189,248,0.18)", borderRadius:14, padding:"12px 14px" }}>
                  <FileText size={13} style={{ color:"#38bdf8", flexShrink:0, marginTop:1 }} />
                  <div>
                    <p style={{ fontSize:11, fontWeight:700, color:"#38bdf8", marginBottom:3, textTransform:"uppercase", letterSpacing:".05em" }}>{t("ডেলিভারি নোট","Delivery Note")}</p>
                    <p style={{ fontSize:13, color:"#0284c7" }}>{order.deliveryNote}</p>
                  </div>
                </div>
              )}

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
                  <div style={{ display:"flex", alignItems:"flex-start", gap:7 }}><MapPin size={11} style={{ color:"#a8b4c8", flexShrink:0, marginTop:2 }} /><span style={{ fontSize:13, color:"#64748b" }}>{order.customer?.address}, {order.customer?.thana}, {order.customer?.district}</span></div>
                  {order.customer?.note && <p style={{ fontSize:12, color:"#94a3b8", fontStyle:"italic", background:"rgba(99,102,241,0.04)", borderRadius:10, padding:"8px 12px", border:"1px solid rgba(99,102,241,0.08)" }}>"{order.customer.note}"</p>}
                </div>
              </div>

              {/* Items */}
              <div style={sec}>
                <span style={secLabel}>{t("পণ্যসমূহ","Products")} ({order.items?.length})</span>
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
                      <div style={{ textAlign:"right", flexShrink:0 }}>
                        <p style={{ fontSize:13.5, fontWeight:700, color:"#1e293b" }}>৳{((item.salePrice||item.price||0)*(item.quantity||1)).toLocaleString()}</p>
                        {canAct && <p style={{ fontSize:10, color:"#f87171", marginTop:2 }}>−{item.quantity} {t("স্টক","stock")}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment */}
              {isDig && (
                <div style={{ ...sec, background:proofOk?"rgba(52,211,153,0.05)":"rgba(232,164,39,0.05)", border:`1px solid ${proofOk?"rgba(52,211,153,0.18)":"rgba(232,164,39,0.2)"}` }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                    <span style={{ ...secLabel, marginBottom:0 }}>{t("পেমেন্ট","Payment")} — {PAY_LABEL[order.paymentMethod]}</span>
                    <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99, background:proofOk?"rgba(52,211,153,0.1)":"rgba(232,164,39,0.1)", color:proofOk?"#059669":"#d97706", border:`1px solid ${proofOk?"rgba(52,211,153,0.2)":"rgba(232,164,39,0.2)"}` }}>
                      {proofOk ? t("✓ সম্পূর্ণ","✓ Complete") : t("⚠ অসম্পূর্ণ","⚠ Incomplete")}
                    </span>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:10 }}>
                    {[{ icon:Phone, label:t("প্রেরক","Sender"), val:order.paymentNumber, mono:false },{ icon:Hash, label:t("ট্রানজেকশন আইডি","TrxID"), val:order.transactionId, mono:true }].map(r => (
                      <div key={r.label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#fff", borderRadius:10, padding:"8px 12px", border:"1px solid rgba(99,102,241,0.08)" }}>
                        <span style={{ fontSize:11, color:"#94a3b8", display:"flex", alignItems:"center", gap:5 }}><r.icon size={10} />{r.label}</span>
                        <span style={{ fontSize:12, fontWeight:600, fontFamily:r.mono?"monospace":"inherit", color:r.val?"#374151":"#f87171", fontStyle:r.val?"normal":"italic" }}>{r.val||t("দেওয়া হয়নি","Not provided")}</span>
                      </div>
                    ))}
                  </div>
                  <ScreenshotViewer url={order.screenshotUrl} />
                </div>
              )}

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
                </div>
              </div>

              {/* Delivery note input */}
              {canAct && (
                <div style={sec}>
                  <span style={secLabel}>{t("ডেলিভারি নোট (ঐচ্ছিক)","Delivery Note (optional)")}</span>
                  <input type="text" value={note} onChange={e => setNote(e.target.value)}
                    placeholder={t("যেমন: গেটে রেখেছি...","e.g. Left at gate...")}
                    style={{ width:"100%", outline:"none", background:"#f8f9ff", border:"1.5px solid rgba(99,102,241,0.14)", borderRadius:13, padding:"10px 14px", fontSize:13, color:"#1e293b", fontFamily:"'Plus Jakarta Sans',sans-serif", transition:"all .15s" }}
                    onFocus={e => { e.target.style.background="#fff"; e.target.style.borderColor="rgba(99,102,241,0.45)"; e.target.style.boxShadow="0 0 0 4px rgba(99,102,241,0.08)"; }}
                    onBlur={e => { e.target.style.background="#f8f9ff"; e.target.style.borderColor="rgba(99,102,241,0.14)"; e.target.style.boxShadow="none"; }} />
                </div>
              )}

              <p style={{ fontSize:11.5, textAlign:"center", color:"#c4cdd8" }}>{new Date(order.createdAt).toLocaleString("en-BD")}</p>

              {/* Action buttons */}
              {canAct && (
                <div style={{ display:"flex", gap:10, paddingTop:4 }}>
                  <motion.button whileHover={{ scale:1.02, y:-1 }} whileTap={{ scale:0.97 }}
                    onClick={() => { onSuccess(order, note); onClose(); }}
                    style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:7, background:"linear-gradient(135deg,#34d399,#10b981)", border:"none", color:"#fff", borderRadius:13, padding:"13px 16px", fontSize:13.5, fontWeight:700, cursor:"pointer", boxShadow:"0 6px 20px rgba(52,211,153,0.35)", letterSpacing:"-.01em" }}>
                    <CheckCircle size={15} /> {t("ডেলিভার্ড ✓","Delivered ✓")}
                  </motion.button>
                  <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                    onClick={() => { onFail(order, note); onClose(); }}
                    style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:7, background:"rgba(248,113,113,0.07)", border:"1.5px solid rgba(248,113,113,0.25)", color:"#e11d48", borderRadius:13, padding:"13px 16px", fontSize:13.5, fontWeight:700, cursor:"pointer", letterSpacing:"-.01em", transition:"all .15s" }}
                    onMouseEnter={e => e.currentTarget.style.background="rgba(248,113,113,0.14)"}
                    onMouseLeave={e => e.currentTarget.style.background="rgba(248,113,113,0.07)"}>
                    <XCircle size={15} /> {t("ব্যর্থ ✗","Failed ✗")}
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </ModalPortal>
  );
}

/* ─────────────── Confirm Action Modal ─────────────── */
function ConfirmActionModal({ order, type, note, onClose, onConfirm, loading, t }) {
  const isSuccess = type === "success";

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  if (!order) return null;
  return (
    <ModalPortal>
      <AnimatePresence>
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          style={{
            position:"fixed", inset:0, zIndex:9100,
            background:"rgba(15,23,42,0.6)",
            backdropFilter:"blur(12px)",
            WebkitBackdropFilter:"blur(12px)",
            display:"flex", alignItems:"center", justifyContent:"center", padding:16,
          }}
          onClick={onClose}>
          <motion.div
            initial={{ scale:0.9, opacity:0, y:16 }} animate={{ scale:1, opacity:1, y:0 }}
            exit={{ scale:0.9, opacity:0, y:16 }}
            transition={{ type:"spring", stiffness:360, damping:30 }}
            style={{ background:"#ffffff", borderRadius:22, border:"1px solid rgba(99,102,241,0.14)", boxShadow:"0 40px 100px rgba(15,23,42,0.3)", padding:"28px 24px", width:"100%", maxWidth:380 }}
            onClick={e => e.stopPropagation()}>

            <div style={{ width:60, height:60, borderRadius:18, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px", background:isSuccess?"rgba(52,211,153,0.1)":"rgba(248,113,113,0.08)", border:`1.5px solid ${isSuccess?"rgba(52,211,153,0.25)":"rgba(248,113,113,0.22)"}` }}>
              {isSuccess ? <CheckCircle size={28} style={{ color:"#34d399" }} /> : <XCircle size={28} style={{ color:"#f87171" }} />}
            </div>

            <h3 style={{ fontSize:17, fontWeight:900, color:"#0f172a", textAlign:"center", fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:"-.025em", marginBottom:6 }}>
              {isSuccess ? t("ডেলিভারি নিশ্চিত করবেন?","Confirm Delivery?") : t("ব্যর্থ হিসেবে চিহ্নিত করবেন?","Mark as Failed?")}
            </h3>
            <p style={{ fontSize:13, color:"#94a3b8", textAlign:"center", marginBottom:18 }}>
              <span style={{ fontWeight:700, color:"#374151" }}>{order.orderId}</span>
            </p>

            <div style={{ borderRadius:13, padding:"12px 14px", marginBottom:16, background:isSuccess?"rgba(52,211,153,0.06)":"rgba(248,113,113,0.05)", border:`1px solid ${isSuccess?"rgba(52,211,153,0.18)":"rgba(248,113,113,0.15)"}` }}>
              {(isSuccess
                ? [t("স্ট্যাটাস → ডেলিভার্ড","Status → Delivered"), t("পেমেন্ট → পরিশোধিত","Payment → Paid"), t("সকল পণ্যের স্টক কমবে","Stock decremented")]
                : [t("স্ট্যাটাস → বাতিল","Status → Cancelled"), t("পেমেন্ট → ব্যর্থ","Payment → Failed")]
              ).map(txt => (
                <p key={txt} style={{ fontSize:12, color:isSuccess?"#059669":"#e11d48", display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                  <span style={{ width:4, height:4, borderRadius:"50%", background:isSuccess?"#34d399":"#f87171", display:"inline-block", flexShrink:0 }} />{txt}
                </p>
              ))}
            </div>

            {note && (
              <div style={{ background:"rgba(99,102,241,0.04)", border:"1px solid rgba(99,102,241,0.10)", borderRadius:12, padding:"10px 14px", marginBottom:16 }}>
                <p style={{ fontSize:12, color:"#64748b", fontStyle:"italic" }}>"{note}"</p>
              </div>
            )}

            <div style={{ display:"flex", gap:10 }}>
              <button onClick={onClose} disabled={loading}
                style={{ flex:1, padding:"12px 16px", borderRadius:13, fontSize:13.5, fontWeight:600, color:"#475569", cursor:"pointer", background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.13)", transition:"all .15s" }}>
                {t("বাতিল","Cancel")}
              </button>
              <motion.button onClick={onConfirm} disabled={loading}
                whileHover={!loading?{ scale:1.02, y:-1 }:{}} whileTap={!loading?{ scale:0.97 }:{}}
                style={{ flex:1, padding:"12px 16px", borderRadius:13, fontSize:13.5, fontWeight:700, color:"#fff", cursor:loading?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, border:"none", background:isSuccess?"linear-gradient(135deg,#34d399,#10b981)":"linear-gradient(135deg,#f87171,#ef4444)", boxShadow:isSuccess?"0 6px 20px rgba(52,211,153,0.35)":"0 6px 20px rgba(248,113,113,0.32)", letterSpacing:"-.01em" }}>
                {loading ? <Loader2 size={14} className="animate-spin" />
                  : isSuccess ? <><CheckCircle size={14} /> {t("নিশ্চিত","Confirm")}</>
                  : <><XCircle size={14} /> {t("ব্যর্থ চিহ্নিত","Mark Failed")}</>}
              </motion.button>
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

  const statCards = [
    { labelBn:"কনফার্মড", labelEn:"Confirmed", count:counts.confirmed, color:"#0284c7", soft:"rgba(56,189,248,0.08)",  border:"rgba(56,189,248,0.22)",  grad:"linear-gradient(135deg,#38bdf8,#0ea5e9)",  icon:CheckCircle },
    { labelBn:"ডেলিভার্ড",labelEn:"Delivered", count:counts.delivered, color:"#059669", soft:"rgba(52,211,153,0.08)",  border:"rgba(52,211,153,0.22)",  grad:"linear-gradient(135deg,#34d399,#10b981)",  icon:Star        },
    { labelBn:"বাতিল",    labelEn:"Cancelled", count:counts.cancelled, color:"#e11d48", soft:"rgba(248,113,113,0.08)", border:"rgba(248,113,113,0.22)", grad:"linear-gradient(135deg,#fb7185,#f43f5e)",  icon:XCircle     },
    { labelBn:"রেভিনিউ",  labelEn:"Revenue",   count:`৳${revenue.toLocaleString()}`, color:"#7c3aed", soft:"rgba(167,139,250,0.08)", border:"rgba(167,139,250,0.22)", grad:"linear-gradient(135deg,#a78bfa,#8b5cf6)", icon:TrendingUp  },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        .dc-wrap, .dc-wrap * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }

        /* ── stat grid: 4 col desktop, 2×2 mobile ── */
        .dc-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        @media (max-width: 640px) {
          .dc-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 9px; }
        }

        /* ── table ── */
        .dc-col-header, .dc-row {
          display: grid;
          align-items: center;
          grid-template-columns: 22px 1fr 1fr 72px 36px;
          gap: 8px;
        }
        .dc-col-header {
          padding: 10px 20px;
          font-size: 10.5px; font-weight: 700; color: #94a3b8;
          letter-spacing: .06em; text-transform: uppercase;
          border-bottom: 1px solid rgba(99,102,241,0.08);
          background: rgba(99,102,241,0.02);
          position: sticky; top: 0; z-index: 10;
        }
        .dc-row {
          padding: 12px 20px;
          border-bottom: 1px solid rgba(99,102,241,0.06);
          transition: background 0.12s; cursor: pointer;
        }
        .dc-row:last-child { border-bottom: none; }
        .dc-row:hover { background: rgba(99,102,241,0.025); }

        @media (max-width: 640px) {
          .dc-col-header, .dc-row {
            grid-template-columns: 16px 1fr 1fr 58px 32px;
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
          .dc-hide-sm { display: none !important; }
        }
        @media (max-width: 400px) {
          .dc-col-header, .dc-row {
            grid-template-columns: 14px 1fr 1fr 50px 28px;
            padding-left: 8px !important;
            padding-right: 8px !important;
          }
        }
      `}</style>

      <div className="dc-wrap" style={{ padding:"0 8px 32px" }}>
        <AnimatePresence mode="wait">
          <motion.div key="dc" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
            exit={{ opacity:0 }} transition={{ duration:0.25 }}>

            {/* ── PAGE TITLE ── */}
            <div style={{ textAlign:"center", marginBottom:12 }}>
              <h1 style={{ fontSize:"clamp(20px,4vw,28px)", fontWeight:900, color:"#1e293b", letterSpacing:"-0.03em" }}>
                {t("ডেলিভারি","Delivery")}
              </h1>
              <p style={{ fontSize:13, color:"#94a3b8", marginTop:4 }}>
                {t("অর্ডার ডেলিভারি নিশ্চিত ও পরিচালনা করুন","Manage and confirm your order deliveries")}
              </p>
            </div>

            <div style={{ marginBottom:14 }}>
              <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 12px", borderRadius:8, background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.2)", color:"#059669", fontWeight:600, fontSize:12 }}>
                <Truck size={12} /> {t("ডেলিভারি","Delivery")}
              </span>
            </div>

            {/* result banner */}
            <AnimatePresence>
              {resultBanner && (
                <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                  style={{ borderRadius:16, padding:"12px 16px", display:"flex", alignItems:"flex-start", gap:10, marginBottom:14,
                    background:resultBanner.type==="success"?"rgba(52,211,153,0.07)":"rgba(248,113,113,0.06)",
                    border:`1px solid ${resultBanner.type==="success"?"rgba(52,211,153,0.2)":"rgba(248,113,113,0.18)"}` }}>
                  {resultBanner.type==="success"
                    ? <CheckCircle size={15} style={{ color:"#34d399", flexShrink:0, marginTop:1 }} />
                    : <XCircle    size={15} style={{ color:"#f87171", flexShrink:0, marginTop:1 }} />
                  }
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, fontWeight:700, color:resultBanner.type==="success"?"#059669":"#e11d48" }}>
                      {resultBanner.type==="success" ? t("✓ ডেলিভার্ড ও স্টক আপডেট!","✓ Delivered & stock updated!") : t("অর্ডার ব্যর্থ হিসেবে চিহ্নিত","Order marked as failed")}
                    </p>
                    <p style={{ fontSize:11.5, color:"#94a3b8", marginTop:2 }}>{resultBanner.order?.orderId}</p>
                    {resultBanner.stockErrors?.map((e, i) => (
                      <p key={i} style={{ fontSize:11.5, color:"#d97706", marginTop:2 }}>• {e}</p>
                    ))}
                  </div>
                  <button onClick={() => setResult(null)} style={{ background:"none", border:"none", cursor:"pointer" }}><X size={14} style={{ color:"#94a3b8" }} /></button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── TOP BAR ── */}
            <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:12, background:"linear-gradient(160deg,#ffffff,#fafbff)", border:"1px solid rgba(99,102,241,0.10)", borderRadius:18, padding:"14px 16px", marginBottom:14, boxShadow:"0 4px 20px rgba(99,102,241,0.06)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, flex:"1 1 220px", maxWidth:340, background:"rgba(99,102,241,0.05)", border:"1px solid rgba(99,102,241,0.12)", borderRadius:11, padding:"8px 13px" }}>
                <Search size={14} style={{ color:"#a8b4c8", flexShrink:0 }} />
                <input type="text"
                  placeholder={t("নাম, ফোন, অর্ডার আইডি…","Search name, phone, order ID…")}
                  value={search} onChange={e => setSearch(e.target.value)}
                  style={{ background:"transparent", outline:"none", border:"none", fontSize:13, color:"#374151", width:"100%", fontFamily:"'Plus Jakarta Sans',sans-serif" }} />
                {search && <button onClick={() => setSearch("")} style={{ color:"#a8b4c8", lineHeight:1, background:"none", border:"none", cursor:"pointer" }}><X size={12} /></button>}
              </div>
              <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                onClick={fetchOrders}
                style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.14)", borderRadius:11, padding:"9px 14px", fontSize:13, fontWeight:500, color:"#6366f1", cursor:"pointer", flexShrink:0 }}>
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                <span>{t("রিফ্রেশ","Refresh")}</span>
              </motion.button>
            </div>

            {/* ── STAT CARDS (2×2 on mobile) ── */}
            <div className="dc-stats-grid" style={{ marginBottom:14 }}>
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
                      <p style={{ fontSize:typeof s.count==="string"&&s.count.length>6?17:26, fontWeight:900, color:s.color, lineHeight:1, letterSpacing:"-0.03em", marginBottom:5, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.count}</p>
                      <p style={{ fontSize:10.5, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".07em" }}>{t(s.labelBn, s.labelEn)}</p>
                    </div>
                    <div style={{ position:"absolute", bottom:-12, right:-12, width:60, height:60, borderRadius:"50%", background:`radial-gradient(circle,${s.color}12 0%,transparent 70%)`, pointerEvents:"none" }} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ── TABLE CARD ── */}
            <div style={{ background:"linear-gradient(160deg,#ffffff,#fafbff)", border:"1px solid rgba(99,102,241,0.10)", borderRadius:18, boxShadow:"0 4px 24px rgba(99,102,241,0.06)", overflow:"hidden" }}>

              {/* table top */}
              <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:10, padding:"14px 20px", borderBottom:"1px solid rgba(99,102,241,0.08)", background:"rgba(99,102,241,0.025)" }}>
                <h2 style={{ fontSize:14, fontWeight:900, color:"#1e293b", letterSpacing:"-0.02em" }}>
                  {t("ডেলিভারি তালিকা","Delivery List")}
                  {displayed.length !== orders.length && (
                    <span style={{ marginLeft:8, fontSize:11, fontWeight:500, color:"#94a3b8" }}>
                      ({displayed.length} {t("এর","of")} {orders.length})
                    </span>
                  )}
                </h2>
                <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:8 }}>
                  {/* filter tabs */}
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {FILTER_TABS.map(tab => {
                      const count  = tab.value === "all" ? orders.length : (counts[tab.value] || 0);
                      const active = filter === tab.value;
                      return (
                        <motion.button key={tab.value} type="button"
                          whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                          onClick={() => setFilter(tab.value)}
                          style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:10, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all .15s", background:active?"linear-gradient(135deg,#6366f1,#4f46e5)":"#fff", border:`1.5px solid ${active?"transparent":"rgba(99,102,241,0.14)"}`, color:active?"#fff":"#64748b", boxShadow:active?"0 3px 12px rgba(99,102,241,0.28)":"none" }}>
                          <span style={{ width:6, height:6, borderRadius:"50%", background:active?"rgba(255,255,255,0.7)":tab.dot, display:"inline-block" }} />
                          {tab.label}
                          {count > 0 && <span style={{ fontSize:10, fontWeight:700, padding:"1px 6px", borderRadius:99, background:active?"rgba(255,255,255,0.2)":"rgba(99,102,241,0.08)", color:active?"#fff":"#6366f1" }}>{count}</span>}
                        </motion.button>
                      );
                    })}
                  </div>
                  {/* sort */}
                  <div style={{ position:"relative" }} ref={sortRef}>
                    <button onClick={() => setSortOpen(o => !o)}
                      style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, borderRadius:12, padding:"9px 14px", cursor:"pointer", background:"#fff", border:"1px solid rgba(99,102,241,0.15)", color:"#374151", fontWeight:500, boxShadow:"0 1px 4px rgba(99,102,241,0.05)", fontFamily:"inherit" }}>
                      <span>{sortOpts.find(o => o.value === sort)?.label}</span>
                      <ChevronDown size={12} style={{ color:"#a8b4c8" }}/>
                    </button>
                    <AnimatePresence>
                      {sortOpen && (
                        <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.15 }}
                          style={{ position:"absolute", right:0, top:"calc(100% + 6px)", minWidth:"100%", borderRadius:14, background:"#fff", border:"1px solid rgba(99,102,241,0.12)", boxShadow:"0 16px 48px rgba(99,102,241,0.13)", overflow:"hidden", zIndex:50 }}>
                          {sortOpts.map(opt => (
                            <div key={opt.value} onClick={() => { setSort(opt.value); setSortOpen(false); }}
                              style={{ padding:"10px 14px", fontSize:13, cursor:"pointer", background: sort===opt.value?"rgba(99,102,241,0.07)":"transparent", color: sort===opt.value?"#6366f1":"#374151", fontWeight: sort===opt.value?600:400, whiteSpace:"nowrap" }}>
                              {opt.label}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* col headers */}
              <div className="dc-col-header">
                <div>#</div>
                <div>{t("অর্ডার","Order")}</div>
                <div className="dc-hide-sm">{t("কাস্টমার","Customer")}</div>
                <div>{t("মোট","Total")}</div>
                <div />
              </div>

              <div style={{ overflowY:"auto", maxHeight:"60vh" }}>
                {loading ? (
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"64px 0", gap:12 }}>
                    <Loader2 size={26} style={{ color:"#c4cdd8" }} className="animate-spin" />
                    <p style={{ fontSize:13, color:"#94a3b8" }}>{t("লোড হচ্ছে…","Loading…")}</p>
                  </div>
                ) : displayed.length === 0 ? (
                  <div style={{ padding:"56px 0", textAlign:"center" }}>
                    <div style={{ width:48, height:48, borderRadius:14, background:"rgba(99,102,241,0.07)", border:"1px solid rgba(99,102,241,0.12)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
                      <Truck size={22} style={{ color:"#c4cdd8" }} />
                    </div>
                    <p style={{ fontSize:13, color:"#94a3b8" }}>{t("কোনো অর্ডার পাওয়া যায়নি।","No orders found.")}</p>
                  </div>
                ) : displayed.map((order, idx) => {
                  const cfg  = STATUS_CFG[order.status] || STATUS_CFG.confirmed;
                  return (
                    <motion.div key={order._id} className="dc-row"
                      initial={{ opacity:0 }} animate={{ opacity:1 }}
                      transition={{ delay: idx * 0.015 }}
                      onClick={() => setDetail(order)}>

                      <div style={{ fontSize:11.5, fontWeight:600, color:"#c4cdd8" }}>{idx+1}</div>

                      <div style={{ minWidth:0, paddingRight:8 }}>
                        <p style={{ fontSize:12.5, fontWeight:700, color:"#1e293b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{order.orderId}</p>
                        <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
                          <span style={{ width:5, height:5, borderRadius:"50%", background:cfg.dot, display:"inline-block", flexShrink:0 }} />
                          <span style={{ fontSize:10, fontWeight:700, color:cfg.color }}>{cfg.label}</span>
                        </div>
                      </div>

                      <div className="dc-hide-sm" style={{ minWidth:0, paddingRight:6 }}>
                        <p style={{ fontSize:12.5, fontWeight:600, color:"#374151", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{order.customer?.name}</p>
                        <p style={{ fontSize:11, color:"#94a3b8" }}>{order.customer?.district}</p>
                      </div>

                      <div>
                        <p style={{ fontSize:12.5, fontWeight:800, color:"#1e293b", whiteSpace:"nowrap" }}>৳{order.total?.toLocaleString()}</p>
                        <p style={{ fontSize:10.5, color:"#94a3b8" }}>{PAY_LABEL[order.paymentMethod]}</p>
                      </div>

                      <div style={{ display:"flex", justifyContent:"flex-end" }}>
                        <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
                          onClick={e => { e.stopPropagation(); setDetail(order); }}
                          style={{ width:28, height:28, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(99,102,241,0.07)", border:"1px solid rgba(99,102,241,0.13)", color:"#6366f1", cursor:"pointer" }}
                          onMouseEnter={e => e.currentTarget.style.background="rgba(99,102,241,0.14)"}
                          onMouseLeave={e => e.currentTarget.style.background="rgba(99,102,241,0.07)"}>
                          <Truck size={12}/>
                        </motion.button>
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