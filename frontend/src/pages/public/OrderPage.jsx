import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone, Search, Package, Truck,
  CheckCircle, Clock, XCircle, Star,
  Box, MapPin, CreditCard, Gift,
  RefreshCw, ArrowRight, ShoppingBag,
  AlertTriangle, X, ChevronDown,
  Sparkles, Shield, History, Trash2,
  HeadphonesIcon, ExternalLink, ZoomIn, Mail,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useT } from "../../context/LanguageContext";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

/* ══ Cookie helpers — fallback (not logged in) ══ */
const PHONE_KEY   = "nahid_tracked_phones";
const COOKIE_DAYS = 30;

function getCookie(name) {
  const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : null;
}
function setCookie(name, value, days) {
  const exp = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${exp}; path=/; SameSite=Lax`;
}
function getPhones()  { try { return JSON.parse(getCookie(PHONE_KEY) || "[]"); } catch { return []; } }
function savePhone(p) { const l=getPhones().filter(x=>x!==p); l.unshift(p); setCookie(PHONE_KEY, JSON.stringify(l.slice(0,5)), COOKIE_DAYS); }

/* ══ API hide helper ══ */
async function apiHideOrder(orderId) {
  const token = localStorage.getItem("customerToken");
  if (!token) return false;
  try {
    const res = await fetch(`${API}/api/orders/${orderId}/hide`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch { return false; }
}

/* ══ Status config ══ */
const getStatusCfg = (t) => ({
  pending:    { label:t("অপেক্ষমাণ",   "Placed"),      step:0,  color:"#d97706", bg:"#fffbeb", border:"#fde68a", icon:Clock        },
  processing: { label:t("প্যাকেজিং",   "Packaging"),   step:1,  color:"#7c3aed", bg:"#f5f3ff", border:"#ddd6fe", icon:Box          },
  shipped:    { label:t("পথে আছে",      "On the Way"),  step:2,  color:"#1d4ed8", bg:"#eff6ff", border:"#bfdbfe", icon:Truck        },
  confirmed:  { label:t("নিশ্চিত",      "Confirmed"),   step:3,  color:"#0284c7", bg:"#f0f9ff", border:"#bae6fd", icon:CheckCircle  },
  delivered:  { label:t("পৌঁছে গেছে",  "Delivered"),   step:4,  color:"#059669", bg:"#ecfdf5", border:"#a7f3d0", icon:Star         },
  cancelled:  { label:t("বাতিল",        "Cancelled"),   step:-1, color:"#dc2626", bg:"#fff1f2", border:"#fecdd3", icon:XCircle      },
});

const STEPS = ["pending","processing","shipped","confirmed","delivered"];

const getPayLabel = (t) => ({
  cod:   t("ক্যাশ অন ডেলিভারি", "Cash on Delivery"),
  bkash: "bKash",
  nagad: "Nagad",
});
const PAY_COLOR = { cod:"#6b7280", bkash:"#e2136e", nagad:"#f7941d" };

/* ══ Product Image Modal ══ */
function ProductModal({ item, onClose }) {
  const t = useT();
  if (!item) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}>
        <motion.div
          initial={{opacity:0,y:60}} animate={{opacity:1,y:0}} exit={{opacity:0,y:60}}
          transition={{type:"spring",stiffness:300,damping:30}}
          className="bg-white w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl"
          onClick={e=>e.stopPropagation()}>
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 bg-slate-200 rounded-full"/>
          </div>
          <div className="bg-slate-50 mx-4 mt-3 sm:mt-4 rounded-2xl overflow-hidden border border-slate-100" style={{minHeight:200}}>
            {item.image
              ? <img src={item.image} alt={item.name} className="w-full object-contain p-4" style={{maxHeight:240}}/>
              : <div className="w-full h-48 flex items-center justify-center"><Package size={48} className="text-slate-200"/></div>}
          </div>
          <div className="px-5 py-4 space-y-3">
            <div>
              <h3 className="text-base font-bold text-slate-800 leading-snug">{item.name}</h3>
              {item.slug && (
                <Link to={`/product/${item.slug}`} onClick={onClose}
                  className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                  <ExternalLink size={11}/> {t("পণ্য দেখুন", "View Product")}
                </Link>
              )}
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">{t("একক মূল্য", "Unit Price")}</p>
                <p className="text-lg font-black text-slate-800">৳{(item.salePrice||item.price||0).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 mb-0.5">{t("পরিমাণ × মূল্য", "Qty × Price")}</p>
                <p className="text-base font-black text-emerald-600">
                  {item.quantity} × ৳{(item.salePrice||item.price||0).toLocaleString()}
                  <span className="text-xs font-semibold text-slate-400 ml-1">= ৳{((item.salePrice||item.price||0)*(item.quantity||1)).toLocaleString()}</span>
                </p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold transition-colors">
              {t("বন্ধ করুন", "Close")}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ══ Delete Confirm Modal ══ */
function DeleteModal({ orderId, onClose, onConfirm, loading }) {
  const t = useT();
  return (
    <AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={!loading ? onClose : undefined}>
        <motion.div
          initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} exit={{opacity:0,y:40}}
          transition={{type:"spring",stiffness:300,damping:28}}
          className="bg-white w-full sm:max-w-sm sm:rounded-2xl rounded-t-3xl shadow-2xl p-6"
          onClick={e=>e.stopPropagation()}>
          <div className="flex justify-center pt-1 pb-4 sm:hidden">
            <div className="w-10 h-1 bg-slate-200 rounded-full"/>
          </div>

          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-red-50 border border-red-100">
            <Trash2 size={26} className="text-red-400"/>
          </div>

          <h3 className="text-base font-bold text-slate-800 text-center mb-1">
            {t("তালিকা থেকে সরাবেন?", "Remove from list?")}
          </h3>
          <p className="text-xs text-slate-500 text-center mb-1 font-semibold">{orderId}</p>
          <p className="text-xs text-slate-400 text-center mb-6 leading-relaxed">
            {t("অর্ডারটি আপনার তালিকা থেকে লুকানো হবে।","The order will be hidden from your list.")}<br/>
            <span className="text-emerald-600 font-medium">
              {t("ডেটাবেজ থেকে মুছবে না — ডেলিভারি স্বাভাবিক থাকবে।","It won't be deleted — delivery continues normally.")}
            </span>
          </p>

          <div className="flex gap-2.5">
            <button onClick={onClose} disabled={loading}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40">
              {t("থাকুক", "Keep It")}
            </button>
            <button onClick={onConfirm} disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-40">
              {loading
                ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>
                : <><Trash2 size={13}/> {t("লুকান", "Hide")}</>
              }
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ══ Timeline ══ */
function Timeline({ status }) {
  const t = useT();
  const STATUS_CFG = getStatusCfg(t);
  const cfg     = STATUS_CFG[status] || STATUS_CFG.pending;
  const current = cfg.step;
  if (status === "cancelled") return null;
  const pct = current === 0 ? 0 : (current / (STEPS.length - 1)) * 100;
  return (
    <div className="px-4 sm:px-6 pb-5">
      <div className="relative">
        <div className="absolute top-4 sm:top-5 left-4 right-4 h-[2px] sm:h-[3px] bg-slate-100 rounded-full"/>
        <motion.div className="absolute top-4 sm:top-5 left-4 h-[2px] sm:h-[3px] rounded-full"
          style={{background:`linear-gradient(90deg,${cfg.color},${cfg.color}cc)`}}
          initial={{width:"0%"}} animate={{width:pct>0?`calc(${pct}% - 0px)`:"0%"}}
          transition={{duration:1,ease:"easeOut",delay:0.3}}/>
        <div className="relative flex justify-between">
          {STEPS.map((s,i)=>{
            const sc=STATUS_CFG[s]; const done=i<=current; const active=i===current; const Icon=sc.icon;
            return (
              <div key={s} className="flex flex-col items-center gap-1.5 sm:gap-2">
                <motion.div
                  initial={{scale:0.7,opacity:0}} animate={{scale:1,opacity:1}}
                  transition={{delay:0.1+i*0.08,type:"spring",stiffness:300}}
                  className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center z-10"
                  style={{
                    background:done?(active?cfg.color:"#10b981"):"#f8fafc",
                    border:`2px solid ${done?(active?cfg.color:"#10b981"):"#e2e8f0"}`,
                    boxShadow:active?`0 0 0 5px ${cfg.color}22`:"none",
                  }}>
                  {done?<Icon size={13} color="white" strokeWidth={2.5}/>:<span className="w-2 h-2 rounded-full bg-slate-200"/>}
                  {active&&(
                    <motion.span className="absolute inset-0 rounded-full" style={{background:`${cfg.color}30`}}
                      animate={{scale:[1,1.7,1]}} transition={{duration:2.5,repeat:Infinity,ease:"easeInOut"}}/>
                  )}
                </motion.div>
                <div className="text-center">
                  <p className="text-[9px] sm:text-[10px] font-bold leading-tight" style={{color:done?(active?cfg.color:"#10b981"):"#cbd5e1"}}>{sc.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ══ Cancelled Card ══ */
function CancelledCard({ order, index, onHide }) {
  const t = useT();
  const PAY_LABEL  = getPayLabel(t);
  const [delOpen,   setDelOpen  ] = useState(false);
  const [delLoading,setDelLoading] = useState(false);
  const [expanded,  setExpanded ] = useState(false);
  const date = new Date(order.createdAt).toLocaleDateString(t("bn-BD","en-GB"),{year:"numeric",month:"long",day:"numeric"});
  const qty  = order.items?.reduce((s,i)=>s+(i.quantity||1),0)||0;

  const handleDelete = async () => {
    setDelLoading(true);
    await apiHideOrder(order._id);
    setDelLoading(false);
    setDelOpen(false);
    onHide(order._id);
  };

  return (
    <>
      <motion.div
        initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
        transition={{delay:index*0.08,type:"spring",stiffness:200,damping:20}}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm"
        style={{background:"linear-gradient(135deg,#1a0a0a 0%,#2d0f0f 40%,#1a0808 100%)",border:"1px solid #7f1d1d"}}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 pointer-events-none"
          style={{background:"radial-gradient(circle,#ef4444,transparent)",transform:"translate(30%,-30%)"}}/>
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10 pointer-events-none"
          style={{background:"radial-gradient(circle,#fca5a5,transparent)",transform:"translate(-30%,30%)"}}/>
        <div className="h-1 w-full" style={{background:"linear-gradient(90deg,#dc2626,#ef4444,#dc2626)"}}/>
        <div className="relative px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={()=>setExpanded(p=>!p)}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{background:"rgba(239,68,68,0.2)",border:"1.5px solid rgba(239,68,68,0.4)"}}>
                <XCircle size={20} style={{color:"#ef4444"}}/>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-sm sm:text-base font-bold text-white leading-tight">{order.orderId}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{background:"rgba(239,68,68,0.2)",color:"#fca5a5",border:"1px solid rgba(239,68,68,0.3)"}}>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"/>{t("বাতিল","Cancelled")}
                  </span>
                </div>
                <p className="text-xs" style={{color:"rgba(255,255,255,0.4)"}}>{date} · {t(`${qty} টি পণ্য`, `${qty} item${qty!==1?"s":""}`)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className="text-right cursor-pointer" onClick={()=>setExpanded(p=>!p)}>
                <p className="text-base sm:text-xl font-black text-white leading-none">৳{order.total?.toLocaleString()}</p>
                <p className="text-[10px] mt-0.5" style={{color:PAY_COLOR[order.paymentMethod]||"#6b7280"}}>
                  {PAY_LABEL[order.paymentMethod]||order.paymentMethod}
                </p>
              </div>
              <button onClick={()=>setDelOpen(true)}
                className="w-7 h-7 rounded-xl flex items-center justify-center transition-all hover:scale-110 flex-shrink-0 border-none cursor-pointer"
                style={{background:"rgba(239,68,68,0.2)",border:"1px solid rgba(239,68,68,0.3)"}}>
                <Trash2 size={12} style={{color:"#fca5a5"}}/>
              </button>
              <motion.div animate={{rotate:expanded?180:0}} transition={{duration:0.25}}
                className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer"
                style={{background:"rgba(255,255,255,0.08)"}} onClick={()=>setExpanded(p=>!p)}>
                <ChevronDown size={13} style={{color:"rgba(255,255,255,0.5)"}}/>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="mx-4 sm:mx-6 mb-4 sm:mb-5">
          <div className="rounded-xl sm:rounded-2xl px-4 py-3 sm:py-4 space-y-2"
            style={{background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.25)"}}>
            <div className="flex items-center gap-2">
              <AlertTriangle size={12} style={{color:"#f87171"}}/>
              <p className="text-xs font-bold" style={{color:"#fca5a5"}}>{t("বাতিলের কারণ","Cancellation Reason")}</p>
            </div>
            <p className="text-sm leading-relaxed" style={{color:"rgba(255,255,255,0.75)"}}>
              {order.cancellationReason||t("এই অর্ডারটি বাতিল হয়েছে। বিস্তারিত জানতে আমাদের সাথে যোগাযোগ করুন।","This order has been cancelled. Please contact us for more details.")}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <XCircle size={10} style={{color:"#f87171"}}/>
              <p className="text-xs font-semibold" style={{color:"#f87171"}}>
                {t(
                  `কোনো স্টক বাদ যায়নি · পেমেন্ট পরিস্থিতি: ${order.paymentMethod==="cod"?"প্রযোজ্য নয়":"ফেরত প্রক্রিয়া চলছে"}`,
                  `No stock deducted · Payment status: ${order.paymentMethod==="cod"?"N/A":"Refund in progress"}`
                )}
              </p>
            </div>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {expanded&&(
            <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}}
              exit={{height:0,opacity:0}} transition={{duration:0.3,ease:[0.4,0,0.2,1]}} className="overflow-hidden">
              <div className="px-4 sm:px-6 pb-5 space-y-3" style={{borderTop:"1px solid rgba(255,255,255,0.06)"}}>
                <div className="pt-3"/>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{color:"rgba(255,255,255,0.3)"}}>{t("পণ্যের তালিকা","Items")}</p>
                  <div className="space-y-2">
                    {order.items?.map((item,i)=>(
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl"
                        style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}>
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                          style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.1)"}}>
                          {item.image
                            ?<img src={item.image} alt={item.name} className="w-full h-full object-contain p-0.5"/>
                            :<div className="w-full h-full flex items-center justify-center"><Package size={13} style={{color:"rgba(255,255,255,0.2)"}}/></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate" style={{color:"rgba(255,255,255,0.75)"}}>{item.name}</p>
                          <p className="text-xs" style={{color:"rgba(255,255,255,0.35)"}}>৳{(item.salePrice||item.price||0).toLocaleString()} × {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold flex-shrink-0" style={{color:"rgba(255,255,255,0.6)"}}>
                          ৳{((item.salePrice||item.price||0)*(item.quantity||1)).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl p-3 space-y-1.5" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}>
                  <div className="flex justify-between text-xs" style={{color:"rgba(255,255,255,0.4)"}}>
                    <span>{t("সাবটোটাল","Subtotal")}</span><span>৳{order.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs" style={{color:"rgba(255,255,255,0.4)"}}>
                    <span>{t("ডেলিভারি","Delivery")}</span>
                    <span>{order.deliveryCharge===0?t("বিনামূল্যে","Free"):`৳${order.deliveryCharge}`}</span>
                  </div>
                  <div className="h-px" style={{background:"rgba(255,255,255,0.08)"}}/>
                  <div className="flex justify-between text-sm font-bold" style={{color:"rgba(255,255,255,0.6)"}}>
                    <span>{t("সর্বমোট","Total")}</span><span>৳{order.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {delOpen && (
          <DeleteModal
            orderId={order.orderId}
            loading={delLoading}
            onClose={()=>!delLoading&&setDelOpen(false)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ══ Normal Order Card ══ */
function OrderCard({ order, index, onHide }) {
  const t = useT();
  const PAY_LABEL  = getPayLabel(t);
  const [expanded,   setExpanded  ] = useState(index===0);
  const [delOpen,    setDelOpen   ] = useState(false);
  const [delLoading, setDelLoading] = useState(false);
  const [selItem,    setSelItem   ] = useState(null);
  const STATUS_CFG = getStatusCfg(t);
  const cfg    = STATUS_CFG[order.status]||STATUS_CFG.pending;
  const qty    = order.items?.reduce((s,i)=>s+(i.quantity||1),0)||0;
  const date   = new Date(order.createdAt).toLocaleDateString(t("bn-BD","en-GB"),{year:"numeric",month:"long",day:"numeric"});
  const canHide= order.status==="delivered"||order.status==="cancelled";

  const handleDelete = async () => {
    setDelLoading(true);
    await apiHideOrder(order._id);
    setDelLoading(false);
    setDelOpen(false);
    onHide(order._id);
  };

  return (
    <>
      <motion.div
        initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
        transition={{delay:index*0.08,type:"spring",stiffness:200,damping:20}}
        className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
        style={{border:`1px solid ${cfg.border}`}}>
        <div className="h-1 w-full" style={{background:`linear-gradient(90deg,${cfg.color},${cfg.color}88)`}}/>

        <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 cursor-pointer select-none" onClick={()=>setExpanded(p=>!p)}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
                style={{background:cfg.bg,border:`1.5px solid ${cfg.border}`}}>
                <cfg.icon size={18} style={{color:cfg.color}}/>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-sm sm:text-base font-bold text-slate-800 leading-tight">{order.orderId}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full"
                    style={{background:cfg.bg,color:cfg.color,border:`1px solid ${cfg.border}`}}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{background:cfg.color}}/>{cfg.label}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{date} · {t(`${qty} টি পণ্য`, `${qty} item${qty!==1?"s":""}`)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <div className="text-right cursor-pointer" onClick={()=>setExpanded(p=>!p)}>
                <p className="text-base sm:text-xl font-black text-slate-800 leading-none">৳{order.total?.toLocaleString()}</p>
                <p className="text-[10px] sm:text-xs mt-1" style={{color:PAY_COLOR[order.paymentMethod]||"#6b7280"}}>
                  {PAY_LABEL[order.paymentMethod]||order.paymentMethod}
                </p>
              </div>
              {canHide&&(
                <button onClick={()=>setDelOpen(true)}
                  className="w-7 h-7 rounded-xl flex items-center justify-center transition-all hover:scale-110 flex-shrink-0 cursor-pointer border-none"
                  style={{background:"#fff1f2",border:"1px solid #fecdd3"}}>
                  <Trash2 size={12} className="text-red-400"/>
                </button>
              )}
              <motion.div animate={{rotate:expanded?180:0}} transition={{duration:0.25}}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 cursor-pointer"
                onClick={()=>setExpanded(p=>!p)}>
                <ChevronDown size={14} className="text-slate-500"/>
              </motion.div>
            </div>
          </div>
        </div>

        <Timeline status={order.status}/>

        {order.status==="delivered"&&(
          <div className="mx-4 sm:mx-6 mb-4">
            <div className="flex items-center gap-2.5 rounded-xl sm:rounded-2xl px-4 py-3"
              style={{background:"#ecfdf5",border:"1px solid #a7f3d0"}}>
              <Star size={14} className="text-emerald-500 flex-shrink-0"/>
              <p className="text-xs font-semibold text-emerald-700">
                {t("🎉 অর্ডার সফলভাবে পৌঁছে গেছে! ধন্যবাদ।","🎉 Order delivered successfully! Thank you.")}
              </p>
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {expanded&&(
            <motion.div key="det"
              initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}}
              exit={{height:0,opacity:0}} transition={{duration:0.3,ease:[0.4,0,0.2,1]}}
              className="overflow-hidden">
              <div className="px-4 sm:px-6 pb-5 pt-0 space-y-3 sm:space-y-4">
                <div className="h-px bg-slate-100"/>
                {order.items?.length>0&&(
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                      {t("পণ্যের তালিকা","Items")}
                      <span className="text-[9px] text-slate-300 font-normal">({t("ক্লিক করুন বিস্তারিত দেখতে","click for details")})</span>
                    </p>
                    <div className="space-y-2">
                      {order.items.map((item,i)=>(
                        <motion.div key={i}
                          initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}
                          onClick={()=>setSelItem(item)}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:border-slate-200 hover:bg-slate-100/60 hover:shadow-sm transition-all group">
                          <div className="relative w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden flex-shrink-0 shadow-sm">
                            {item.image
                              ?<img src={item.image} alt={item.name} className="w-full h-full object-contain p-1"/>
                              :<div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-slate-200"/></div>}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all flex items-center justify-center">
                              <ZoomIn size={12} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-all"/>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight truncate group-hover:text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">৳{(item.salePrice||item.price||0).toLocaleString()} × {item.quantity}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-black text-slate-800">৳{((item.salePrice||item.price||0)*(item.quantity||1)).toLocaleString()}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t("ডেলিভারি তথ্য","Delivery Info")}</p>
                    <p className="text-sm font-bold text-slate-800">{order.customer?.name}</p>
                    <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5">
                      <Phone size={10} className="text-slate-400 flex-shrink-0"/>{order.customer?.phone}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500 flex items-start gap-1.5">
                      <MapPin size={10} className="text-slate-400 flex-shrink-0 mt-0.5"/>
                      <span className="leading-relaxed">{order.customer?.address}, {order.customer?.thana}, {order.customer?.district}</span>
                    </p>
                    {order.customer?.note&&(
                      <p className="text-xs text-slate-400 italic bg-white rounded-lg px-3 py-1.5 border border-slate-100">"{order.customer.note}"</p>
                    )}
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t("মূল্য বিবরণ","Price Details")}</p>
                    <div className="flex justify-between text-xs sm:text-sm text-slate-500">
                      <span>{t("সাবটোটাল","Subtotal")}</span><span>৳{order.subtotal?.toLocaleString()}</span>
                    </div>
                    {order.savings>0&&(
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-emerald-600 flex items-center gap-1"><Gift size={10}/>{t("সাশ্রয়","Savings")}</span>
                        <span className="text-emerald-600 font-semibold">−৳{order.savings?.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs sm:text-sm text-slate-500">
                      <span className="flex items-center gap-1"><Truck size={10}/>{t("ডেলিভারি","Delivery")}</span>
                      <span className={order.deliveryCharge===0?"text-emerald-600 font-semibold":""}>
                        {order.deliveryCharge===0?t("বিনামূল্যে 🎉","Free 🎉"):`৳${order.deliveryCharge}`}
                      </span>
                    </div>
                    <div className="h-px bg-slate-200 my-1"/>
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm font-bold text-slate-700">{t("সর্বমোট","Total")}</span>
                      <span className="text-sm sm:text-base font-black text-slate-900">৳{order.total?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-0.5">
                      <CreditCard size={10} className="text-slate-400"/>
                      <span className="text-xs font-medium" style={{color:PAY_COLOR[order.paymentMethod]||"#6b7280"}}>
                        {PAY_LABEL[order.paymentMethod]||order.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {selItem&&<ProductModal item={selItem} onClose={()=>setSelItem(null)}/>}
      </AnimatePresence>
      <AnimatePresence>
        {delOpen && (
          <DeleteModal
            orderId={order.orderId}
            loading={delLoading}
            onClose={()=>!delLoading&&setDelOpen(false)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ══ MAIN ══ */
export default function OrderPage() {
  const t        = useT();
  const location = useLocation();

  const [phone,       setPhone      ] = useState("");
  const [orders,      setOrders     ] = useState([]);
  const [status,      setStatus     ] = useState("idle");
  const [searched,    setSearched   ] = useState("");
  const [searchType,  setSearchType ] = useState("phone");
  const [history,     setHistory    ] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef   = useRef(null);
  const historyRef = useRef(null);

  const doSearch = useCallback(async (val) => {
    const v = val.trim();
    if (v.length < 5) return;
    setShowHistory(false);
    setSearched(v);
    setStatus("loading");
    const isEmail = v.includes("@");
    const param   = isEmail ? `email=${encodeURIComponent(v)}` : `phone=${encodeURIComponent(v)}`;
    setSearchType(isEmail ? "email" : "phone");
    try {
      const token = localStorage.getItem("customerToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res  = await fetch(`${API}/api/orders/track?${param}`, { headers });
      const json = await res.json();
      if (json.success) {
        setOrders(json.data);
        setStatus(json.data.length > 0 ? "found" : "empty");
        if (json.data.length > 0 && !isEmail) { savePhone(v); setHistory(getPhones()); }
      } else { setStatus("error"); }
    } catch { setStatus("error"); }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setHistory(getPhones());
    const params     = new URLSearchParams(location.search);
    const phoneParam = params.get("phone");
    const emailParam = params.get("email");
    if (phoneParam && phoneParam.trim().length >= 10) { setPhone(phoneParam.trim()); doSearch(phoneParam.trim()); }
    else if (emailParam && emailParam.trim().includes("@")) { setPhone(emailParam.trim()); doSearch(emailParam.trim()); }
  }, [doSearch, location.search]);

  useEffect(() => {
    const h = e => { if (!historyRef.current?.contains(e.target)) setShowHistory(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleHide = (id) => {
    setOrders(prev => {
      const updated = prev.filter(o => o._id !== id);
      if (updated.length === 0) setStatus("empty");
      return updated;
    });
  };

  const stats = {
    total:     orders.length,
    active:    orders.filter(o => !["delivered","cancelled"].includes(o.status)).length,
    delivered: orders.filter(o => o.status === "delivered").length,
    spent:     orders.reduce((s, o) => s + (o.total || 0), 0),
  };

  const SearchedIcon = searchType === "email" ? Mail : Phone;

  return (
    <div className="min-h-screen" style={{background:"#f8f7f4"}}>
      <div className="relative overflow-hidden" style={{background:"linear-gradient(135deg,#0f1f0f 0%,#1a2e1a 50%,#0d1f0d 100%)"}}>
        <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 rounded-full opacity-5 pointer-events-none"
          style={{background:"radial-gradient(circle,#4ade80,transparent)",transform:"translate(30%,-30%)"}}/>
        <div className="absolute bottom-0 left-0 w-48 sm:w-64 h-48 sm:h-64 rounded-full opacity-5 pointer-events-none"
          style={{background:"radial-gradient(circle,#86efac,transparent)",transform:"translate(-30%,30%)"}}/>
        <div className="relative max-w-2xl mx-auto px-4 sm:px-5 pt-8 sm:pt-12 pb-16 sm:pb-20">
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
            className="inline-flex items-center gap-2 mb-4 sm:mb-5">
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 sm:px-4 py-1.5">
              <Sparkles size={11} className="text-emerald-400"/>
              <span className="text-xs font-semibold text-emerald-400 tracking-wide">{t("লাইভ ট্র্যাকিং","Live Tracking")}</span>
            </div>
          </motion.div>
          <motion.h1 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.15}}
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-2 leading-tight tracking-tight">
            {t(<>আপনার অর্ডার <span style={{color:"#4ade80"}}>ট্র্যাক</span> করুন</>, <>Track Your <span style={{color:"#4ade80"}}>Order</span></>)}
          </motion.h1>
          <motion.p initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
            className="text-xs sm:text-sm text-white/50 mb-6 sm:mb-8">
            {t("ফোন নম্বর বা ইমেইল দিয়ে রিয়েল-টাইম ডেলিভারি আপডেট দেখুন","Enter your phone number or email to see real-time delivery updates")}
          </motion.p>

          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.25}} className="relative" ref={historyRef}>
            <div className="flex items-center gap-2 bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden"
              style={{boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
              <div className="flex items-center justify-center w-12 sm:w-14 pl-2 flex-shrink-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center" style={{background:"#ecfdf5"}}>
                  {phone.includes("@") ? <Mail size={14} style={{color:"#059669"}}/> : <Phone size={14} style={{color:"#059669"}}/>}
                </div>
              </div>
              <input ref={inputRef} type="text" value={phone}
                onChange={e => setPhone(e.target.value)}
                onKeyDown={e => e.key === "Enter" && doSearch(phone)}
                onFocus={() => history.length > 0 && setShowHistory(true)}
                placeholder={t("ফোন নম্বর বা ইমেইল লিখুন", "Phone number or email")}
                maxLength={80}
                className="flex-1 bg-transparent text-slate-800 text-sm sm:text-base font-bold py-3 sm:py-4 pr-2 outline-none placeholder:text-slate-300 placeholder:font-normal min-w-0"/>
              {phone && (
                <button onClick={() => { setPhone(""); inputRef.current?.focus(); }} className="px-2 flex-shrink-0">
                  <X size={14} className="text-slate-300 hover:text-slate-500"/>
                </button>
              )}
              <button onClick={() => doSearch(phone)} disabled={status === "loading" || phone.trim().length < 5}
                className="m-1.5 sm:m-2 px-4 sm:px-6 h-9 sm:h-11 text-white text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl flex items-center gap-1.5 sm:gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                style={{background:"linear-gradient(135deg,#16a34a,#15803d)", boxShadow: phone.trim().length >= 5 ? "0 4px 15px #16a34a55" : "none"}}>
                {status === "loading"
                  ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>
                  : <><Search size={13}/>{t("খুঁজুন","Search")}</>}
              </button>
            </div>

            <AnimatePresence>
              {showHistory && history.length > 0 && (
                <motion.div initial={{opacity:0,y:-4,scale:0.98}} animate={{opacity:1,y:0,scale:1}}
                  exit={{opacity:0,y:-4,scale:0.98}} transition={{duration:0.15}}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden z-50 border border-slate-100">
                  <div className="px-4 py-2 border-b border-slate-50">
                    <p className="text-[10px] font-semibold text-slate-400 flex items-center gap-1.5">
                      <History size={10}/>{t("সাম্প্রতিক অনুসন্ধান","Recent Searches")}
                    </p>
                  </div>
                  {history.map((p, i) => (
                    <button key={i} onClick={() => { setPhone(p); doSearch(p); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left">
                      <Phone size={12} className="text-slate-300 flex-shrink-0"/>
                      <span className="text-sm font-semibold text-slate-700">{p}</span>
                      <ArrowRight size={11} className="text-slate-300 ml-auto"/>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.35}}
            className="flex items-start gap-2 mt-3 sm:mt-4 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3"
            style={{background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.2)"}}>
            <AlertTriangle size={12} className="text-amber-400 flex-shrink-0 mt-0.5"/>
            <p className="text-xs leading-relaxed" style={{color:"rgba(255,255,255,0.55)"}}>
              <span className="font-bold text-amber-400">{t("গুরুত্বপূর্ণ:","Important:")}</span>{" "}
              {t("bKash/Nagad পেমেন্টে Transaction ID ও স্ক্রিনশট বাধ্যতামূলক।","Transaction ID and screenshot are required for bKash/Nagad payments.")}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-3 sm:px-4 mt-5 sm:mt-6 pb-20 sm:pb-24 space-y-4 sm:space-y-5">
        {status === "idle" && (
          <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="space-y-3 sm:space-y-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-8 sm:p-10 text-center">
              <motion.div animate={{y:[0,-6,0]}} transition={{duration:3,repeat:Infinity,ease:"easeInOut"}}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl mx-auto mb-4 sm:mb-5 flex items-center justify-center shadow-sm"
                style={{background:"linear-gradient(135deg,#ecfdf5,#d1fae5)",border:"1.5px solid #a7f3d0"}}>
                <Package size={30} style={{color:"#059669"}}/>
              </motion.div>
              <h3 className="text-base sm:text-lg font-black text-slate-800 mb-2">{t("অর্ডার খুঁজুন","Search Orders")}</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {t("উপরে আপনার ফোন নম্বর বা ইমেইল দিন","Enter your phone number or email above")}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                {icon:Shield,         color:"#0284c7", bg:"#f0f9ff", label:t("নিরাপদ","Secure"),        sub:t("এনক্রিপ্টেড","Encrypted")  },
                {icon:RefreshCw,      color:"#059669", bg:"#ecfdf5", label:t("রিয়েল-টাইম","Real-Time"), sub:t("লাইভ আপডেট","Live Updates") },
                {icon:HeadphonesIcon, color:"#7c3aed", bg:"#f5f3ff", label:t("সাপোর্ট","Support"),      sub:t("সবসময় আছি","Always Here")  },
              ].map((b, i) => (
                <div key={i} className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center border border-slate-100 shadow-sm">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2" style={{background:b.bg}}>
                    <b.icon size={16} style={{color:b.color}}/>
                  </div>
                  <p className="text-xs font-bold text-slate-700">{b.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{b.sub}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {status === "loading" && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}}
            className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm p-12 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{background:"linear-gradient(135deg,#ecfdf5,#d1fae5)",border:"1.5px solid #a7f3d0"}}>
              <div className="w-6 h-6 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"/>
            </div>
            <p className="text-sm font-bold text-slate-600">{t("অর্ডার খোঁজা হচ্ছে…","Searching orders…")}</p>
            <p className="text-xs text-slate-400 mt-1">{searched}</p>
          </motion.div>
        )}

        {status === "found" && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-3 sm:space-y-4">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm px-4 sm:px-5 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800">
                  {t(`${orders.length} টি অর্ডার পাওয়া গেছে`,`${orders.length} order${orders.length!==1?"s":""} found`)}
                </p>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <SearchedIcon size={10}/>{searched}
                </p>
              </div>
              <button onClick={() => doSearch(searched)}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex-shrink-0"
                style={{background:"#f0fdf4",color:"#16a34a",border:"1px solid #bbf7d0"}}>
                <RefreshCw size={10}/>{t("রিফ্রেশ","Refresh")}
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                {label:t("মোট","Total"),         val:stats.total,                        color:"#1e293b",bg:"#f8fafc",border:"#e2e8f0"},
                {label:t("চলমান","Active"),       val:stats.active,                       color:"#d97706",bg:"#fffbeb",border:"#fde68a"},
                {label:t("পৌঁছেছে","Delivered"), val:stats.delivered,                    color:"#059669",bg:"#ecfdf5",border:"#a7f3d0"},
                {label:t("খরচ","Spent"),         val:`৳${stats.spent.toLocaleString()}`, color:"#7c3aed",bg:"#f5f3ff",border:"#ddd6fe"},
              ].map((s, i) => (
                <motion.div key={i} initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} transition={{delay:i*0.05}}
                  className="rounded-xl sm:rounded-2xl px-2 sm:px-3 py-2.5 sm:py-3 text-center"
                  style={{background:s.bg,border:`1.5px solid ${s.border}`}}>
                  <p className="text-sm sm:text-base font-black leading-none" style={{color:s.color}}>{s.val}</p>
                  <p className="text-[9px] sm:text-[10px] font-medium mt-1" style={{color:`${s.color}99`}}>{s.label}</p>
                </motion.div>
              ))}
            </div>

            {orders.some(o => o.status === "delivered" || o.status === "cancelled") && (
              <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{background:"#fff7ed",border:"1px solid #fed7aa"}}>
                <Trash2 size={12} className="text-orange-400 flex-shrink-0"/>
                <p className="text-xs text-orange-600">
                  <span className="font-bold">{t("টিপ:","Tip:")}</span>{" "}
                  {t("পৌঁছানো বা বাতিল অর্ডারের 🗑 বোতামে ক্লিক করে তালিকা থেকে লুকাতে পারবেন।","Click the 🗑 button on delivered or cancelled orders to hide them.")}
                </p>
              </div>
            )}

            <AnimatePresence>
              {orders.map((order, i) =>
                order.status === "cancelled"
                  ? <CancelledCard key={order._id} order={order} index={i} onHide={handleHide}/>
                  : <OrderCard     key={order._id} order={order} index={i} onHide={handleHide}/>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {status === "empty" && (
          <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}
            className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm p-10 sm:p-12 text-center">
            <motion.div animate={{rotate:[0,10,-10,0]}} transition={{duration:2,delay:0.5}} className="text-4xl sm:text-5xl mb-4">📦</motion.div>
            <h3 className="text-base sm:text-lg font-black text-slate-800 mb-2">{t("কোনো অর্ডার পাওয়া যায়নি","No Orders Found")}</h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
              <span className="font-bold text-slate-600">{searched}</span>{" "}
              {t("এ কোনো অর্ডার নেই।","has no orders.")}
            </p>
            <Link to="/" className="inline-flex items-center gap-2 text-white text-sm font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl transition-all"
              style={{background:"linear-gradient(135deg,#1a2e1a,#2e7d32)"}}>
              <ShoppingBag size={14}/> {t("কেনাকাটা করুন","Go Shopping")} <ArrowRight size={13}/>
            </Link>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}
            className="bg-white rounded-2xl sm:rounded-3xl border border-red-100 shadow-sm p-10 sm:p-12 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4"
              style={{background:"#fff1f2",border:"1.5px solid #fecdd3"}}>
              <XCircle size={24} style={{color:"#e11d48"}}/>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-800 mb-2">{t("সংযোগ সমস্যা","Connection Error")}</h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-6">{t("ইন্টারনেট চেক করুন এবং আবার চেষ্টা করুন।","Check your internet connection and try again.")}</p>
            <button onClick={() => doSearch(searched)} className="inline-flex items-center gap-2 text-white text-sm font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl transition-all"
              style={{background:"linear-gradient(135deg,#1a2e1a,#2e7d32)"}}>
              <RefreshCw size={13}/>{t("আবার চেষ্টা করুন","Try Again")}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}