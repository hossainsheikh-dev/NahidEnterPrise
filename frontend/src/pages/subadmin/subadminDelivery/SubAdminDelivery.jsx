import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ChevronDown, Loader2, X,
  Package, Truck, CheckCircle, Clock,
  XCircle, RefreshCw, Star, Box,
  Phone, MapPin, Hash, Eye,
  Image as ImageIcon, AlertTriangle,
  FileText, TrendingUp, CreditCard,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { showUpdateSuccessToast } from "../../../utils/toast/successUpdateToast";
import { useSubLang } from "../../../context/SubAdminLangContext";

const API       = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;
const ORDER_API = `${API}/api/orders`;
const getToken  = () => localStorage.getItem("subAdminToken") || "";

const PAGE_SIZE = 15;

const STATUS_CFG = {
  pending:    { label:"Pending",    dotColor:"#f59e0b", barBg:"#f59e0b", textColor:"#d97706", bg:"rgba(245,158,11,0.08)",  border:"rgba(245,158,11,0.2)",  icon:Clock       },
  confirmed:  { label:"Confirmed",  dotColor:"#0ea5e9", barBg:"#0ea5e9", textColor:"#0284c7", bg:"rgba(14,165,233,0.08)",  border:"rgba(14,165,233,0.2)",  icon:CheckCircle },
  processing: { label:"Processing", dotColor:"#8b5cf6", barBg:"#8b5cf6", textColor:"#7c3aed", bg:"rgba(139,92,246,0.08)", border:"rgba(139,92,246,0.2)", icon:Box         },
  shipped:    { label:"Shipped",    dotColor:"#3b82f6", barBg:"#3b82f6", textColor:"#2563eb", bg:"rgba(59,130,246,0.08)",  border:"rgba(59,130,246,0.2)",  icon:Truck       },
  delivered:  { label:"Delivered",  dotColor:"#10b981", barBg:"#10b981", textColor:"#059669", bg:"rgba(16,185,129,0.08)",  border:"rgba(16,185,129,0.2)",  icon:Star        },
  cancelled:  { label:"Cancelled",  dotColor:"#f43f5e", barBg:"#f43f5e", textColor:"#e11d48", bg:"rgba(244,63,94,0.08)",   border:"rgba(244,63,94,0.2)",   icon:XCircle     },
};
const PAY_LABEL = { cod:"COD", bkash:"bKash", nagad:"Nagad" };

const tblDropBtn = () => ({
  display:"flex", alignItems:"center", justifyContent:"space-between",
  width:"100%", background:"#fff",
  border:"1px solid rgba(99,102,241,0.15)",
  borderRadius:12, padding:"9px 14px",
  fontSize:13, fontWeight:500, color:"#374151",
  cursor:"pointer", transition:"all .15s ease",
  boxShadow:"0 1px 4px rgba(99,102,241,0.05)",
  fontFamily:"'Plus Jakarta Sans',sans-serif",
});
const tblDropPanel = {
  position:"absolute", right:0, top:"calc(100% + 6px)",
  minWidth:"100%", borderRadius:14,
  background:"#fff", border:"1px solid rgba(99,102,241,0.12)",
  boxShadow:"0 16px 48px rgba(99,102,241,0.13), 0 2px 8px rgba(0,0,0,0.05)",
  overflow:"hidden", zIndex:50,
};
const tblDropItem = (active) => ({
  padding:"10px 14px", fontSize:13, cursor:"pointer",
  background: active ? "rgba(99,102,241,0.07)" : "transparent",
  color: active ? "#6366f1" : "#374151",
  fontWeight: active ? 600 : 400,
  transition:"background .12s", whiteSpace:"nowrap",
  fontFamily:"'Plus Jakarta Sans',sans-serif",
});

/* ── Portal wrapper so modals escape any overflow/transform parent ── */
function ModalPortal({ children }) {
  return createPortal(children, document.body);
}

/* ── Screenshot Viewer ── */
function ScreenshotViewer({ url }) {
  const [zoomed, setZoomed] = useState(false);
  if (!url) return (
    <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(99,102,241,0.04)", border:"1px dashed rgba(99,102,241,0.2)", borderRadius:10, padding:"10px 14px" }}>
      <ImageIcon size={13} style={{ color:"#c4cdd8" }} />
      <span style={{ fontSize:12, color:"#94a3b8", fontStyle:"italic" }}>No screenshot</span>
    </div>
  );
  return (
    <>
      <div onClick={() => setZoomed(true)} style={{ position:"relative", borderRadius:12, overflow:"hidden", border:"1px solid rgba(99,102,241,0.12)", cursor:"zoom-in", boxShadow:"0 2px 8px rgba(99,102,241,0.08)" }}>
        <img src={url} alt="proof" style={{ width:"100%", maxHeight:176, objectFit:"contain", background:"#f8f9ff", padding:4, display:"block" }} />
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0)", transition:"background .2s" }}
          onMouseEnter={e => e.currentTarget.style.background="rgba(0,0,0,0.12)"}
          onMouseLeave={e => e.currentTarget.style.background="rgba(0,0,0,0)"}>
          <span style={{ fontSize:11, fontWeight:600, color:"#fff", background:"rgba(0,0,0,0.55)", padding:"4px 10px", borderRadius:8 }}>🔍 Zoom</span>
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

/* ── Order Detail Modal ── */
function OrderDetailModal({ order, onClose, onSuccess, onFail, t }) {
  const [note, setNote] = useState("");

  /* lock body scroll while modal is open */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  if (!order) return null;

  const cfg     = STATUS_CFG[order.status] || STATUS_CFG.confirmed;
  const isDigit = order.paymentMethod !== "cod";
  const proofOk = isDigit && order.transactionId && order.screenshotUrl;
  const canAct  = order.status === "confirmed";

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

            {/* colour bar */}
            <div style={{ height:4, background:`linear-gradient(90deg, ${cfg.barBg}, ${cfg.barBg}cc)`, flexShrink:0 }} />

            {/* Header */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", flexShrink:0, borderBottom:"1px solid rgba(99,102,241,0.08)", background:"rgba(99,102,241,0.02)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", background:cfg.bg, border:`1.5px solid ${cfg.border}`, flexShrink:0, boxShadow:`0 4px 12px ${cfg.dotColor}22` }}>
                  <cfg.icon size={18} style={{ color:cfg.textColor }} />
                </div>
                <div>
                  <p style={{ fontSize:10, fontWeight:800, color:"#94a3b8", letterSpacing:".1em", textTransform:"uppercase" }}>{t("অর্ডার বিবরণ","Order Details")}</p>
                  <p style={{ fontSize:15, fontWeight:800, color:"#0f172a", marginTop:1, fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:"-0.02em" }}>{order.orderId}</p>
                  <span style={{ fontSize:11, fontWeight:700, color:cfg.textColor, display:"flex", alignItems:"center", gap:4, marginTop:2 }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:cfg.dotColor, display:"inline-block", boxShadow:`0 0 0 3px ${cfg.dotColor}28` }} />
                    {cfg.label}
                  </span>
                </div>
              </div>
              <button onClick={onClose} style={{ width:34, height:34, borderRadius:10, background:"rgba(99,102,241,0.07)", border:"1px solid rgba(99,102,241,0.13)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all .15s" }}
                onMouseEnter={e => e.currentTarget.style.background="rgba(99,102,241,0.14)"}
                onMouseLeave={e => e.currentTarget.style.background="rgba(99,102,241,0.07)"}>
                <X size={15} style={{ color:"#6366f1" }} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding:"16px 18px", display:"flex", flexDirection:"column", gap:10 }}>

              {order.status === "cancelled" && (
                <div style={{ display:"flex", alignItems:"flex-start", gap:10, background:"rgba(244,63,94,0.06)", border:"1px solid rgba(244,63,94,0.18)", borderRadius:14, padding:"12px 14px" }}>
                  <AlertTriangle size={13} style={{ color:"#f43f5e", flexShrink:0, marginTop:1 }} />
                  <div>
                    <p style={{ fontSize:11, fontWeight:700, color:"#f43f5e", marginBottom:3, textTransform:"uppercase", letterSpacing:".05em" }}>{t("বাতিলের কারণ","Cancellation Reason")}</p>
                    <p style={{ fontSize:13, color:"#e11d48" }}>{order.cancellationReason || t("কোনো কারণ নেই","No reason provided")}</p>
                  </div>
                </div>
              )}

              {order.deliveryNote && order.status !== "cancelled" && (
                <div style={{ display:"flex", alignItems:"flex-start", gap:10, background:"rgba(14,165,233,0.06)", border:"1px solid rgba(14,165,233,0.18)", borderRadius:14, padding:"12px 14px" }}>
                  <FileText size={13} style={{ color:"#0284c7", flexShrink:0, marginTop:1 }} />
                  <div>
                    <p style={{ fontSize:11, fontWeight:700, color:"#0284c7", marginBottom:3, textTransform:"uppercase", letterSpacing:".05em" }}>{t("ডেলিভারি নোট","Delivery Note")}</p>
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
                        {canAct && <p style={{ fontSize:10, color:"#f43f5e", marginTop:2 }}>−{item.quantity} {t("স্টক","stock")}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment proof */}
              {isDigit && (
                <div style={{ ...sec, background:proofOk?"rgba(16,185,129,0.05)":"rgba(245,158,11,0.05)", border:`1px solid ${proofOk?"rgba(16,185,129,0.18)":"rgba(245,158,11,0.2)"}` }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                    <span style={{ ...secLabel, marginBottom:0 }}>{t("পেমেন্ট","Payment")} — {PAY_LABEL[order.paymentMethod]}</span>
                    <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99, background:proofOk?"rgba(16,185,129,0.1)":"rgba(245,158,11,0.1)", color:proofOk?"#059669":"#d97706", border:`1px solid ${proofOk?"rgba(16,185,129,0.2)":"rgba(245,158,11,0.2)"}` }}>
                      {proofOk ? t("✓ সম্পূর্ণ","✓ Complete") : t("⚠ অসম্পূর্ণ","⚠ Incomplete")}
                    </span>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:10 }}>
                    {[{ icon:Phone, label:t("প্রেরক","Sender"), val:order.paymentNumber, mono:false },{ icon:Hash, label:t("ট্রানজেকশন আইডি","TrxID"), val:order.transactionId, mono:true }].map(r => (
                      <div key={r.label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#fff", borderRadius:10, padding:"8px 12px", border:"1px solid rgba(99,102,241,0.08)" }}>
                        <span style={{ fontSize:11, color:"#94a3b8", display:"flex", alignItems:"center", gap:5 }}><r.icon size={10} />{r.label}</span>
                        <span style={{ fontSize:12, fontWeight:600, fontFamily:r.mono?"monospace":"inherit", color:r.val?"#374151":"#f43f5e", fontStyle:r.val?"normal":"italic" }}>{r.val||t("দেওয়া হয়নি","Not provided")}</span>
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
                    <span style={{ fontSize:15, fontWeight:900, color:"#0f172a", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>৳{order.total?.toLocaleString()}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, paddingTop:2 }}>
                    <CreditCard size={11} style={{ color:"#a8b4c8" }} />
                    <span style={{ fontSize:12, color:"#94a3b8" }}>{PAY_LABEL[order.paymentMethod]}</span>
                    <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:99, marginLeft:"auto",
                      background:order.paymentStatus==="paid"?"rgba(16,185,129,0.08)":order.paymentStatus==="awaiting_confirmation"?"rgba(14,165,233,0.08)":"rgba(245,158,11,0.08)",
                      color:order.paymentStatus==="paid"?"#059669":order.paymentStatus==="awaiting_confirmation"?"#0284c7":"#d97706",
                      border:`1px solid ${order.paymentStatus==="paid"?"rgba(16,185,129,0.2)":order.paymentStatus==="awaiting_confirmation"?"rgba(14,165,233,0.2)":"rgba(245,158,11,0.2)"}` }}>
                      {order.paymentStatus}
                    </span>
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

              {/* Footer buttons inline in body so they're always visible */}
              {canAct && (
                <div style={{ display:"flex", gap:10, paddingTop:4 }}>
                  <motion.button whileHover={{ scale:1.02, y:-1 }} whileTap={{ scale:0.97 }}
                    onClick={() => { onSuccess(order, note); onClose(); }}
                    style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:7, background:"linear-gradient(135deg,#10b981,#059669)", border:"none", color:"#fff", borderRadius:13, padding:"13px 16px", fontSize:13.5, fontWeight:700, cursor:"pointer", boxShadow:"0 6px 20px rgba(16,185,129,0.35), inset 0 1px 0 rgba(255,255,255,0.15)", letterSpacing:"-.01em" }}>
                    <CheckCircle size={15} /> {t("ডেলিভার্ড ✓","Delivered ✓")}
                  </motion.button>
                  <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                    onClick={() => { onFail(order, note); onClose(); }}
                    style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:7, background:"rgba(244,63,94,0.07)", border:"1.5px solid rgba(244,63,94,0.25)", color:"#e11d48", borderRadius:13, padding:"13px 16px", fontSize:13.5, fontWeight:700, cursor:"pointer", letterSpacing:"-.01em", transition:"all .15s" }}
                    onMouseEnter={e => e.currentTarget.style.background="rgba(244,63,94,0.14)"}
                    onMouseLeave={e => e.currentTarget.style.background="rgba(244,63,94,0.07)"}>
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

/* ── Confirm Action Modal ── */
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
            initial={{ scale:0.9, opacity:0, y:16 }} animate={{ scale:1, opacity:1, y:0 }} exit={{ scale:0.9, opacity:0, y:16 }}
            transition={{ type:"spring", stiffness:360, damping:30 }}
            style={{ background:"#ffffff", borderRadius:22, border:"1px solid rgba(99,102,241,0.14)", boxShadow:"0 0 0 1px rgba(99,102,241,0.06), 0 40px 100px rgba(15,23,42,0.3), 0 8px 32px rgba(99,102,241,0.14)", padding:"28px 24px", width:"100%", maxWidth:380 }}
            onClick={e => e.stopPropagation()}>

            <div style={{ width:60, height:60, borderRadius:18, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px", background:isSuccess?"rgba(16,185,129,0.1)":"rgba(244,63,94,0.08)", border:`1.5px solid ${isSuccess?"rgba(16,185,129,0.25)":"rgba(244,63,94,0.22)"}`, boxShadow:isSuccess?"0 8px 24px rgba(16,185,129,0.18)":"0 8px 24px rgba(244,63,94,0.14)" }}>
              {isSuccess ? <CheckCircle size={28} style={{ color:"#10b981" }} /> : <XCircle size={28} style={{ color:"#f43f5e" }} />}
            </div>

            <h3 style={{ fontSize:17, fontWeight:900, color:"#0f172a", textAlign:"center", fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:"-.025em", marginBottom:6 }}>
              {isSuccess ? t("ডেলিভারি নিশ্চিত করবেন?","Confirm Delivery?") : t("ব্যর্থ হিসেবে চিহ্নিত করবেন?","Mark as Failed?")}
            </h3>
            <p style={{ fontSize:13, color:"#94a3b8", textAlign:"center", marginBottom:18 }}>
              <span style={{ fontWeight:700, color:"#374151" }}>{order.orderId}</span>
            </p>

            <div style={{ borderRadius:13, padding:"12px 14px", marginBottom:16, background:isSuccess?"rgba(16,185,129,0.06)":"rgba(244,63,94,0.05)", border:`1px solid ${isSuccess?"rgba(16,185,129,0.18)":"rgba(244,63,94,0.15)"}` }}>
              {(isSuccess
                ? [t("স্ট্যাটাস → ডেলিভার্ড","Status → Delivered"), t("পেমেন্ট → পরিশোধিত","Payment → Paid"), t("সকল পণ্যের স্টক কমবে","Stock decremented")]
                : [t("স্ট্যাটাস → বাতিল","Status → Cancelled"), t("পেমেন্ট → ব্যর্থ","Payment → Failed")]
              ).map(txt => (
                <p key={txt} style={{ fontSize:12, color:isSuccess?"#059669":"#e11d48", display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                  <span style={{ width:4, height:4, borderRadius:"50%", background:isSuccess?"#10b981":"#f43f5e", display:"inline-block", flexShrink:0 }} />{txt}
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
                style={{ flex:1, padding:"12px 16px", borderRadius:13, fontSize:13.5, fontWeight:600, color:"#475569", cursor:"pointer", background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.13)", transition:"all .15s" }}
                onMouseEnter={e => e.currentTarget.style.background="rgba(99,102,241,0.10)"}
                onMouseLeave={e => e.currentTarget.style.background="rgba(99,102,241,0.06)"}>
                {t("বাতিল","Cancel")}
              </button>
              <motion.button onClick={onConfirm} disabled={loading}
                whileHover={!loading?{ scale:1.02, y:-1 }:{}} whileTap={!loading?{ scale:0.97 }:{}}
                style={{ flex:1, padding:"12px 16px", borderRadius:13, fontSize:13.5, fontWeight:700, color:"#fff", cursor:loading?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, border:"none", background:isSuccess?"linear-gradient(135deg,#10b981,#059669)":"linear-gradient(135deg,#f43f5e,#e11d48)", boxShadow:isSuccess?"0 6px 20px rgba(16,185,129,0.35)":"0 6px 20px rgba(244,63,94,0.32)", letterSpacing:"-.01em" }}>
                {loading ? <Loader2 size={14} className="animate-spin" />
                  : isSuccess ? <><CheckCircle size={14} /> {t("নিশ্চিত","Confirm")}</>
                  : <><XCircle size={14} /> {t("ব্যর্থ","Mark Failed")}</>}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </ModalPortal>
  );
}

/* ── Table Dropdown ── */
function TableDropdown({ open, setOpen, refEl, value, options, onChange }) {
  return (
    <div style={{ position:"relative", width:"100%" }} ref={refEl}>
      <button type="button" onClick={() => setOpen(o => !o)}
        style={tblDropBtn()}
        onMouseEnter={e => e.currentTarget.style.borderColor="rgba(99,102,241,0.3)"}
        onMouseLeave={e => e.currentTarget.style.borderColor="rgba(99,102,241,0.15)"}>
        <span style={{ fontSize:13, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {options.find(o => o.value===value)?.label}
        </span>
        <motion.span animate={{ rotate:open?180:0 }} transition={{ duration:0.2 }}>
          <ChevronDown size={14} style={{ color:"#a8b4c8", flexShrink:0 }} />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity:0, y:-6, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:-4, scale:0.97 }} transition={{ duration:0.18 }}
            style={tblDropPanel}>
            {options.map(opt => (
              <div key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }}
                style={tblDropItem(value===opt.value)}
                onMouseEnter={e => value!==opt.value&&(e.currentTarget.style.background="rgba(99,102,241,0.04)")}
                onMouseLeave={e => value!==opt.value&&(e.currentTarget.style.background="transparent")}>
                {opt.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN — SubAdminDelivery
════════════════════════════════════════ */
export default function SubAdminDelivery() {
  const { t } = useSubLang();

  const FILTER_TABS = [
    { value:"all",       label:t("সব","All"),              dotColor:"#6366f1" },
    { value:"confirmed", label:t("কনফার্মড","Confirmed"),  dotColor:"#0ea5e9" },
    { value:"delivered", label:t("ডেলিভার্ড","Delivered"), dotColor:"#10b981" },
    { value:"cancelled", label:t("বাতিল","Cancelled"),     dotColor:"#f43f5e" },
  ];
  const SORT_OPTS = [
    { value:"newest", label:t("নতুন আগে","Newest First")      },
    { value:"oldest", label:t("পুরনো আগে","Oldest First")     },
    { value:"total",  label:t("সর্বোচ্চ মোট","Highest Total") },
  ];

  const [orders,       setOrders]     = useState([]);
  const [loading,      setLoading]    = useState(false);
  const [search,       setSearch]     = useState("");
  const [filter,       setFilter]     = useState("all");
  const [sort,         setSort]       = useState("newest");
  const [sortOpen,     setSortOpen]   = useState(false);
  const [detailOrder,  setDetail]     = useState(null);
  const [modal,        setModal]      = useState(null);
  const [confirming,   setConfirming] = useState(false);
  const [resultBanner, setResult]     = useState(null);
  const [page,         setPage]       = useState(1);

  const sortRef = useRef(null);

  useEffect(() => {
    const h = e => { if (!sortRef.current?.contains(e.target)) setSortOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${ORDER_API}/delivery`, { headers:{ Authorization:`Bearer ${getToken()}` } });
      const data = await res.json();
      if (data.success) setOrders(data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => { setPage(1); }, [filter, search, sort]);

  const handleConfirm = async () => {
    if (!modal) return;
    setConfirming(true);
    try {
      const res = await fetch(`${ORDER_API}/${modal.order._id}/confirm-delivery`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${getToken()}` },
        body: JSON.stringify({ success: modal.type==="success", note: modal.note||"" }),
      });
      const data = await res.json();
      if (data.success) {
        showUpdateSuccessToast(modal.type==="success" ? t("ডেলিভারি নিশ্চিত!","Delivery confirmed!") : t("ব্যর্থ হিসেবে চিহ্নিত","Marked as failed"));
        setOrders(prev => prev.map(o => o._id===modal.order._id ? data.data : o));
        setResult({ type: modal.type, order: data.data });
        setModal(null);
      }
    } catch (e) { console.error(e); }
    finally { setConfirming(false); }
  };

  const filtered = orders.filter(o => {
    const q  = search.toLowerCase();
    const ms = !q || o.orderId?.toLowerCase().includes(q) || o.customer?.name?.toLowerCase().includes(q) || o.customer?.phone?.includes(q);
    return ms && (filter==="all" || o.status===filter);
  }).sort((a, b) => {
    if (sort==="newest") return new Date(b.createdAt)-new Date(a.createdAt);
    if (sort==="oldest") return new Date(a.createdAt)-new Date(b.createdAt);
    return b.total-a.total;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const displayed  = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  const counts = {
    confirmed: orders.filter(o => o.status==="confirmed").length,
    delivered: orders.filter(o => o.status==="delivered").length,
    cancelled: orders.filter(o => o.status==="cancelled").length,
  };
  const revenue = orders.filter(o => o.status==="delivered").reduce((s,o) => s+(o.total||0), 0);

  const statCards = [
    { label:t("কনফার্মড","Confirmed"), val:counts.confirmed, icon:Clock,      color:"#0284c7", soft:"rgba(14,165,233,0.08)",  border:"rgba(14,165,233,0.22)", grad:"linear-gradient(135deg,#38bdf8,#0ea5e9)"  },
    { label:t("ডেলিভার্ড","Delivered"), val:counts.delivered, icon:Star,       color:"#059669", soft:"rgba(16,185,129,0.08)",  border:"rgba(16,185,129,0.22)", grad:"linear-gradient(135deg,#34d399,#10b981)"  },
    { label:t("বাতিল","Cancelled"),    val:counts.cancelled, icon:XCircle,    color:"#e11d48", soft:"rgba(244,63,94,0.08)",   border:"rgba(244,63,94,0.22)",  grad:"linear-gradient(135deg,#fb7185,#f43f5e)"  },
    { label:t("রেভিনিউ","Revenue"),    val:`৳${revenue.toLocaleString()}`, icon:TrendingUp, color:"#7c3aed", soft:"rgba(139,92,246,0.08)", border:"rgba(139,92,246,0.22)", grad:"linear-gradient(135deg,#a78bfa,#8b5cf6)" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        .dlv-wrap, .dlv-wrap * { box-sizing:border-box; font-family:'Plus Jakarta Sans',sans-serif; }

        .dlv-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        @media (max-width: 640px) {
          .dlv-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 9px; }
        }

        /* # | Order | Customer | Total | Eye */
        .dlv-trow {
          display: grid;
          grid-template-columns: 22px 1fr 1fr 72px 36px;
          align-items: center;
        }
        @media (max-width: 640px) {
          .dlv-trow {
            grid-template-columns: 16px 1fr 1fr 58px 32px;
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
          /* hide date dot+text on mobile inside order cell */
          .dlv-trow .dlv-date { display: none !important; }
        }
        @media (max-width: 400px) {
          .dlv-trow {
            grid-template-columns: 14px 1fr 1fr 50px 28px;
            padding-left: 8px !important;
            padding-right: 8px !important;
          }
        }

        .dlv-page-btn {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 32px; height: 32px; border-radius: 9px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          border: 1px solid rgba(99,102,241,0.15);
          background: #fff; color: #64748b;
          transition: all .15s; padding: 0 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .dlv-page-btn:hover:not(:disabled) { border-color: rgba(99,102,241,0.4); color:#6366f1; background:rgba(99,102,241,0.05); }
        .dlv-page-btn.active { background:linear-gradient(135deg,#6366f1,#4f46e5); border-color:transparent; color:#fff; box-shadow:0 3px 10px rgba(99,102,241,0.28); }
        .dlv-page-btn:disabled { opacity:.38; cursor:not-allowed; }
      `}</style>

      <div className="dlv-wrap" style={{ padding:"0 8px 32px" }}>
        <AnimatePresence mode="wait">
          <motion.div key="sd"
            initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
            exit={{ opacity:0 }} transition={{ duration:0.25 }}>

            <div style={{ textAlign:"center", marginBottom:12 }}>
              <h1 style={{ fontSize:"clamp(20px,4vw,28px)", fontWeight:900, color:"#1e293b", letterSpacing:"-0.03em" }}>
                {t("ডেলিভারি","Delivery")}
              </h1>
              <p style={{ fontSize:13, color:"#94a3b8", marginTop:4 }}>
                {t("অর্ডার ডেলিভারি নিশ্চিত ও পরিচালনা করুন","Manage and confirm order deliveries")}
              </p>
            </div>

            <div style={{ marginBottom:16 }}>
              <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 12px", borderRadius:8, background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.13)", color:"#6366f1", fontWeight:600, fontSize:12 }}>
                <Truck size={12} /> {t("ডেলিভারি","Delivery")}
              </span>
            </div>

            <AnimatePresence>
              {resultBanner && (
                <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                  style={{ borderRadius:16, padding:"12px 16px", display:"flex", alignItems:"flex-start", gap:10, marginBottom:14, background:resultBanner.type==="success"?"rgba(16,185,129,0.07)":"rgba(244,63,94,0.06)", border:`1px solid ${resultBanner.type==="success"?"rgba(16,185,129,0.2)":"rgba(244,63,94,0.18)"}` }}>
                  {resultBanner.type==="success" ? <CheckCircle size={15} style={{ color:"#10b981", flexShrink:0, marginTop:1 }} /> : <XCircle size={15} style={{ color:"#f43f5e", flexShrink:0, marginTop:1 }} />}
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, fontWeight:700, color:resultBanner.type==="success"?"#059669":"#e11d48" }}>
                      {resultBanner.type==="success" ? t("✓ ডেলিভার্ড ও স্টক আপডেট!","✓ Delivered & stock updated!") : t("অর্ডার ব্যর্থ হিসেবে চিহ্নিত","Order marked as failed")}
                    </p>
                    <p style={{ fontSize:11.5, color:"#94a3b8", marginTop:2 }}>{resultBanner.order?.orderId}</p>
                  </div>
                  <button onClick={() => setResult(null)} style={{ background:"none", border:"none", cursor:"pointer" }}><X size={14} style={{ color:"#94a3b8" }} /></button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TOP BAR */}
            <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:12, background:"linear-gradient(160deg,#ffffff,#fafbff)", border:"1px solid rgba(99,102,241,0.10)", borderRadius:18, padding:"14px 16px", marginBottom:14, boxShadow:"0 4px 20px rgba(99,102,241,0.06)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, flex:"1 1 220px", maxWidth:340, background:"rgba(99,102,241,0.05)", border:"1px solid rgba(99,102,241,0.12)", borderRadius:11, padding:"8px 13px" }}>
                <Search size={14} style={{ color:"#a8b4c8", flexShrink:0 }} />
                <input type="text"
                  placeholder={t("নাম, ফোন, অর্ডার আইডি...","Search name, phone, order ID…")}
                  value={search} onChange={e => setSearch(e.target.value)}
                  style={{ background:"transparent", outline:"none", border:"none", fontSize:13, color:"#374151", width:"100%", fontFamily:"'Plus Jakarta Sans',sans-serif" }} />
                {search && <button onClick={() => setSearch("")} style={{ color:"#a8b4c8", lineHeight:1, background:"none", border:"none", cursor:"pointer" }}><X size={12} /></button>}
              </div>
              <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                onClick={fetchOrders}
                style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.14)", borderRadius:11, padding:"9px 16px", fontSize:13, fontWeight:500, color:"#6366f1", cursor:"pointer", flexShrink:0 }}
                onMouseEnter={e => e.currentTarget.style.background="rgba(99,102,241,0.11)"}
                onMouseLeave={e => e.currentTarget.style.background="rgba(99,102,241,0.06)"}>
                <RefreshCw size={13} className={loading?"animate-spin":""} />
                <span>{t("রিফ্রেশ","Refresh")}</span>
              </motion.button>
            </div>

            {/* STAT CARDS */}
            <div className="dlv-stats-grid" style={{ marginBottom:14 }}>
              {statCards.map((s,i) => (
                <motion.div key={s.label}
                  initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:i*0.06, duration:0.38, ease:[0.22,1,0.36,1] }}>
                  <div style={{ background:"#fff", borderRadius:16, border:`1.5px solid ${s.border}`, boxShadow:`0 4px 20px ${s.soft}, 0 1px 4px rgba(0,0,0,0.04)`, overflow:"hidden", position:"relative" }}>
                    <div style={{ height:3, background:s.grad }} />
                    <div style={{ padding:"13px 14px 14px" }}>
                      <div style={{ width:36, height:36, borderRadius:10, background:s.grad, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10, boxShadow:`0 4px 12px ${s.color}28` }}>
                        <s.icon size={15} color="#fff" strokeWidth={2.2} />
                      </div>
                      <p style={{ fontSize:typeof s.val==="string"&&s.val.length>6?17:26, fontWeight:900, color:s.color, lineHeight:1, letterSpacing:"-0.03em", marginBottom:5, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.val}</p>
                      <p style={{ fontSize:10.5, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".07em" }}>{s.label}</p>
                    </div>
                    <div style={{ position:"absolute", bottom:-12, right:-12, width:60, height:60, borderRadius:"50%", background:`radial-gradient(circle,${s.color}12 0%,transparent 70%)`, pointerEvents:"none" }} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* TABLE CARD */}
            <div style={{ background:"linear-gradient(160deg,#ffffff,#fafbff)", border:"1px solid rgba(99,102,241,0.10)", borderRadius:18, boxShadow:"0 4px 24px rgba(99,102,241,0.06)", overflow:"hidden" }}>

              {/* Table header */}
              <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:10, padding:"14px 20px", borderBottom:"1px solid rgba(99,102,241,0.08)", background:"rgba(99,102,241,0.025)" }}>
                <div>
                  <h2 style={{ fontSize:14, fontWeight:900, color:"#1e293b", letterSpacing:"-0.02em" }}>
                    {t("ডেলিভারি তালিকা","Delivery List")}
                    {filtered.length!==orders.length && (
                      <span style={{ marginLeft:8, fontSize:11, fontWeight:500, color:"#94a3b8" }}>
                        ({filtered.length} {t("এর","of")} {orders.length})
                      </span>
                    )}
                  </h2>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:8 }}>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {FILTER_TABS.map(tab => {
                      const count  = tab.value==="all" ? orders.length : (counts[tab.value]||0);
                      const active = filter===tab.value;
                      return (
                        <motion.button key={tab.value} type="button"
                          whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                          onClick={() => setFilter(tab.value)}
                          style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:10, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all .15s", background:active?"linear-gradient(135deg,#6366f1,#4f46e5)":"#fff", border:`1.5px solid ${active?"transparent":"rgba(99,102,241,0.14)"}`, color:active?"#fff":"#64748b", boxShadow:active?"0 3px 12px rgba(99,102,241,0.28)":"none" }}>
                          <span style={{ width:6, height:6, borderRadius:"50%", background:active?"rgba(255,255,255,0.7)":tab.dotColor, display:"inline-block" }} />
                          {tab.label}
                          {count>0 && <span style={{ fontSize:10, fontWeight:700, padding:"1px 6px", borderRadius:99, background:active?"rgba(255,255,255,0.2)":"rgba(99,102,241,0.08)", color:active?"#fff":"#6366f1" }}>{count}</span>}
                        </motion.button>
                      );
                    })}
                  </div>
                  <div style={{ width:138 }} ref={sortRef}>
                    <TableDropdown open={sortOpen} setOpen={setSortOpen} refEl={sortRef} value={sort} options={SORT_OPTS} onChange={setSort} />
                  </div>
                </div>
              </div>

              {/* Column headers */}
              <div className="dlv-trow"
                style={{ padding:"10px 20px", fontSize:10.5, fontWeight:700, color:"#94a3b8", letterSpacing:".06em", textTransform:"uppercase", borderBottom:"1px solid rgba(99,102,241,0.08)", background:"rgba(99,102,241,0.02)" }}>
                <div>#</div>
                <div>{t("অর্ডার","Order")}</div>
                <div>{t("কাস্টমার","Customer")}</div>
                <div>{t("মোট","Total")}</div>
                <div />
              </div>

              {/* Rows */}
              <div style={{ overflowY:"auto", maxHeight:"58vh" }}>
                {loading ? (
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"64px 0", gap:12 }}>
                    <Loader2 size={26} style={{ color:"#c4cdd8" }} className="animate-spin" />
                    <p style={{ fontSize:13, color:"#94a3b8" }}>{t("লোড হচ্ছে…","Loading…")}</p>
                  </div>
                ) : displayed.length===0 ? (
                  <div style={{ padding:"56px 0", textAlign:"center" }}>
                    <div style={{ width:48, height:48, borderRadius:14, background:"rgba(99,102,241,0.07)", border:"1px solid rgba(99,102,241,0.12)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
                      <Truck size={22} style={{ color:"#c4cdd8" }} />
                    </div>
                    <p style={{ fontSize:13, color:"#94a3b8" }}>{t("কোনো অর্ডার নেই।","No orders found.")}</p>
                  </div>
                ) : displayed.map((order, idx) => {
                  const cfg       = STATUS_CFG[order.status] || STATUS_CFG.confirmed;
                  const globalIdx = (page-1)*PAGE_SIZE + idx + 1;
                  return (
                    <motion.div key={order._id}
                      initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                      transition={{ delay:idx*0.015 }}
                      className="dlv-trow"
                      style={{ padding:"12px 20px", borderBottom:"1px solid rgba(99,102,241,0.06)", transition:"background .12s ease" }}
                      onMouseEnter={e => e.currentTarget.style.background="rgba(99,102,241,0.025)"}
                      onMouseLeave={e => e.currentTarget.style.background="transparent"}>

                      <div style={{ fontSize:11.5, fontWeight:600, color:"#c4cdd8" }}>{globalIdx}</div>

                      <div style={{ minWidth:0, paddingRight:8 }}>
                        <p style={{ fontSize:12.5, fontWeight:700, color:"#1e293b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{order.orderId}</p>
                        <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
                          <span style={{ width:5, height:5, borderRadius:"50%", background:cfg.dotColor, display:"inline-block", flexShrink:0 }} />
                          <span style={{ fontSize:10, fontWeight:700, color:cfg.textColor }}>{cfg.label}</span>
                          {/* hidden on mobile via CSS class */}
                          <span className="dlv-date" style={{ display:"flex", alignItems:"center", gap:4 }}>
                            <span style={{ color:"#e2e8f0", fontSize:9 }}>·</span>
                            <span style={{ fontSize:10, color:"#94a3b8" }}>{new Date(order.createdAt).toLocaleDateString("en-BD",{day:"numeric",month:"short"})}</span>
                          </span>
                        </div>
                      </div>

                      <div style={{ minWidth:0, paddingRight:6 }}>
                        <p style={{ fontSize:12.5, fontWeight:600, color:"#374151", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{order.customer?.name}</p>
                        <p style={{ fontSize:10.5, color:"#94a3b8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{order.customer?.district}</p>
                      </div>

                      <div>
                        <p style={{ fontSize:12.5, fontWeight:800, color:"#1e293b", whiteSpace:"nowrap" }}>৳{order.total?.toLocaleString()}</p>
                        <p style={{ fontSize:10.5, color:"#94a3b8" }}>{PAY_LABEL[order.paymentMethod]}</p>
                      </div>

                      <div style={{ display:"flex", justifyContent:"flex-end" }}>
                        <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
                          onClick={() => setDetail(order)}
                          style={{ width:28, height:28, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(99,102,241,0.07)", border:"1px solid rgba(99,102,241,0.13)", color:"#6366f1", cursor:"pointer" }}
                          onMouseEnter={e => e.currentTarget.style.background="rgba(99,102,241,0.14)"}
                          onMouseLeave={e => e.currentTarget.style.background="rgba(99,102,241,0.07)"}>
                          <Eye size={12} />
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* PAGINATION */}
              {!loading && filtered.length > PAGE_SIZE && (
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10, padding:"12px 20px", borderTop:"1px solid rgba(99,102,241,0.08)", background:"rgba(99,102,241,0.015)" }}>
                  <p style={{ fontSize:12, color:"#94a3b8", fontWeight:500 }}>
                    {t("দেখাচ্ছে","Showing")} <span style={{ color:"#374151", fontWeight:700 }}>{(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE,filtered.length)}</span> {t("এর","of")} <span style={{ color:"#374151", fontWeight:700 }}>{filtered.length}</span>
                  </p>
                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <button className="dlv-page-btn" disabled={page===1} onClick={() => setPage(p => p-1)}><ChevronLeft size={14} /></button>
                    {Array.from({ length:totalPages }, (_,i) => i+1)
                      .filter(p => p===1 || p===totalPages || Math.abs(p-page)<=1)
                      .reduce((acc, p, i, arr) => { if (i>0 && p-arr[i-1]>1) acc.push("…"); acc.push(p); return acc; }, [])
                      .map((p, i) =>
                        p==="…"
                          ? <span key={`e${i}`} style={{ fontSize:13, color:"#c4cdd8", padding:"0 4px" }}>…</span>
                          : <button key={p} className={`dlv-page-btn${page===p?" active":""}`} onClick={() => setPage(p)}>{p}</button>
                      )}
                    <button className="dlv-page-btn" disabled={page===totalPages} onClick={() => setPage(p => p+1)}><ChevronRight size={14} /></button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {detailOrder && (
            <OrderDetailModal
              order={detailOrder} onClose={() => setDetail(null)}
              onSuccess={(o,note) => { setDetail(null); setModal({ order:o, type:"success", note }); }}
              onFail={(o,note)    => { setDetail(null); setModal({ order:o, type:"fail",    note }); }}
              t={t}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {modal && (
            <ConfirmActionModal
              order={modal.order} type={modal.type} note={modal.note}
              onClose={() => setModal(null)}
              onConfirm={handleConfirm}
              loading={confirming}
              t={t}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}