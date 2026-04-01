import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ShoppingBag, MapPin, User, FileText,
  ChevronDown, CheckCircle, Loader2, AlertCircle, Banknote,
  Package, Shield, Truck, Clock, Search, ChevronRight, Copy, Check,
  Upload, X,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useT } from "../../context/LanguageContext";
import BD_LOCATIONS from "../../data/Bdlocations";

import bkashLogo from "../../assets/bkash.png";
import nagadLogo from "../../assets/nagad.png";

const API = process.env.REACT_APP_API_URL;

const getPaymentMethods = (t) => [
  {
    id: "cod",
    label: t("ক্যাশ অন ডেলিভারি", "Cash on Delivery"),
    sublabel: t("পেমেন্ট পরে করুন", "Pay after delivery"),
    emoji: "💵", logo: null,
    color: "#1a2e1a", light: "#e8f5e9", border: "#a5d6a7",
    number: null, instruction: null,
  },
  {
    id: "bkash",
    label: "bKash",
    sublabel: t("মার্চেন্ট · সেন্ড মানি", "Merchant · Send Money"),
    logo: bkashLogo,
    color: "#c2185b", light: "#fce4ec", border: "#f48fb1",
    number: "01938360666",
    instruction: t(
      "উপরের নম্বরে bKash Send Money করুন। Order ID টি reference এ লিখুন।",
      "Send money to the number above via bKash. Write the Order ID in the reference."
    ),
  },
  {
    id: "nagad",
    label: "Nagad",
    sublabel: t("মার্চেন্ট · সেন্ড মানি", "Merchant · Send Money"),
    logo: nagadLogo,
    color: "#e65100", light: "#fff3e0", border: "#ffcc80",
    number: "01938360666",
    instruction: t(
      "উপরের নম্বরে Nagad Send Money করুন। Order ID টি reference এ লিখুন।",
      "Send money to the number above via Nagad. Write the Order ID in the reference."
    ),
  },
];

/* ── Copy button ── */
function CopyButton({ text }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button type="button" onClick={handleCopy}
      className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all"
      style={{ backgroundColor: copied ? "#dcfce7" : "#f1f5f9", color: copied ? "#16a34a" : "#64748b" }}>
      {copied ? <><Check size={11}/> {t("কপি হয়েছে!", "Copied!")}</> : <><Copy size={11}/> {t("কপি", "Copy")}</>}
    </button>
  );
}

/* ── Screenshot upload ── */
function ScreenshotUpload({ value, onChange, color, border, light }) {
  const t = useT();
  const inputRef = useRef(null);
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange({ file, preview: ev.target.result });
    reader.readAsDataURL(file);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => onChange({ file, preview: ev.target.result });
      reader.readAsDataURL(file);
    }
  };

  if (value?.preview) {
    return (
      <div className="relative rounded-2xl overflow-hidden border-2" style={{ borderColor: border }}>
        <img src={value.preview} alt="Payment screenshot" className="w-full max-h-52 object-contain bg-white"/>
        <button type="button" onClick={() => onChange(null)}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition">
          <X size={13} className="text-white"/>
        </button>
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center gap-1.5" style={{ backgroundColor: light }}>
          <CheckCircle size={12} style={{ color }}/>
          <span className="text-[11px] font-bold" style={{ color }}>{t("স্ক্রিনশট আপলোড হয়েছে", "Screenshot uploaded")}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop} onDragOver={e => e.preventDefault()}
      className="w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 py-6 cursor-pointer transition-all hover:opacity-80"
      style={{ borderColor: border, backgroundColor: light }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
        <Upload size={18} style={{ color }}/>
      </div>
      <p className="text-[12px] font-bold" style={{ color }}>
        {t("Payment Screenshot আপলোড করুন", "Upload Payment Screenshot")}
      </p>
      <p className="text-[10px]" style={{ color, opacity: 0.6 }}>
        {t("Click বা drag & drop করুন · JPG, PNG", "Click or drag & drop · JPG, PNG")}
      </p>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile}/>
    </div>
  );
}

/* ── Searchable dropdown ── */
function SearchDropdown({ value, onChange, options, placeholder, disabled, error }) {
  const t = useT();
  const [open,  setOpen ] = useState(false);
  const [query, setQuery] = useState("");
  const ref      = useRef(null);
  const inputRef = useRef(null);
  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const h = e => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (open) { setQuery(""); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button type="button" disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 h-[50px] rounded-2xl border-2 text-sm transition-all duration-200 ${
          disabled ? "bg-gray-50 border-gray-100 cursor-not-allowed text-gray-300"
          : error   ? "border-red-300 bg-red-50"
          : open    ? "border-[#1a2e1a] bg-white shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300"
        }`}>
        <span className={`font-medium ${value ? "text-gray-800" : "text-gray-400"}`}>{value || placeholder}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={15} className="text-gray-400"/>
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0, y:-8, scale:0.98 }} animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:-8, scale:0.98 }} transition={{ duration:0.18 }}
            className="absolute left-0 top-full mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="px-3 pt-3 pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                <Search size={13} className="text-gray-400 flex-shrink-0"/>
                <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)}
                  placeholder={t("খুঁজুন...", "Search...")}
                  className="text-sm bg-transparent outline-none text-gray-700 w-full placeholder:text-gray-400"/>
              </div>
            </div>
            <div className="max-h-44 overflow-y-auto py-1">
              {filtered.length === 0
                ? <p className="px-4 py-3 text-sm text-gray-400 text-center">{t("কোনো ফলাফল নেই", "No results")}</p>
                : filtered.map(o => (
                    <button key={o} type="button" onClick={() => { onChange(o); setOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        value === o ? "bg-[#e8f5e9] text-[#1a2e1a] font-semibold" : "text-gray-700 hover:bg-gray-50"
                      }`}>{o}
                    </button>
                  ))
              }
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Field wrapper ── */
function Field({ label, required, optional, error, children, fieldRef }) {
  const t = useT();
  return (
    <div className="space-y-1.5" ref={fieldRef}>
      <div className="flex items-center gap-1.5">
        <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">{label}</label>
        {required && <span className="text-red-400 text-xs">*</span>}
        {optional && <span className="text-[10px] text-gray-300 font-normal">({t("ঐচ্ছিক", "optional")})</span>}
      </div>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
            <AlertCircle size={11}/> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Input ── */
function Input({ value, onChange, placeholder, type="text", rows, error }) {
  const cls = `w-full px-4 border-2 rounded-2xl text-sm font-medium text-gray-800 outline-none transition-all duration-200 placeholder:text-gray-300 placeholder:font-normal ${
    error ? "border-red-300 bg-red-50 focus:border-red-400" : "border-gray-200 bg-white focus:border-[#1a2e1a] focus:shadow-md"
  }`;
  if (rows) return <textarea rows={rows} value={value} onChange={onChange} placeholder={placeholder} className={`${cls} py-3.5 resize-none`}/>;
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} className={`${cls} py-3.5 h-[50px]`}/>;
}

/* ── Section card ── */
function SectionCard({ icon, title, step, children }) {
  const t = useT();
  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
      className="bg-white rounded-3xl border border-gray-100 overflow-hidden"
      style={{ boxShadow:"0 2px 20px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
        <div className="w-8 h-8 rounded-xl bg-[#e8f5e9] flex items-center justify-center text-[#2e7d32] flex-shrink-0">{icon}</div>
        <h2 className="text-[15px] font-black text-gray-900 flex-1">{title}</h2>
        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{t(`ধাপ ${step}`, `Step ${step}`)}</span>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </motion.div>
  );
}

/* ══════════════════════════════
   MAIN CHECKOUT
══════════════════════════════ */
export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT();
  const {
    cartItems, cartSubtotal, cartSavings,
    deliveryCharge, cartTotal, clearCart,
    setSelectedZone, deliverySettings,
  } = useCart();

  const PAYMENT_METHODS = getPaymentMethods(t);

  const [name,          setName         ] = useState("");
  const [phone,         setPhone        ] = useState("");
  const [email,         setEmail        ] = useState("");
  const [address,       setAddress      ] = useState("");
  const [district,      setDistrict     ] = useState("");
  const [thana,         setThana        ] = useState("");
  const [note,          setNote         ] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [senderNumber,  setSenderNumber ] = useState("");
  const [txnId,         setTxnId        ] = useState("");
  const [screenshot,    setScreenshot   ] = useState(null);
  const [loading,       setLoading      ] = useState(false);
  const [errors,        setErrors       ] = useState({});
  const [success,       setSuccess      ] = useState(null);

  // saved address থেকে auto-fill হয়েছে কিনা
  const [addressAutoFilled, setAddressAutoFilled] = useState(false);

  // field refs for scroll-to-error
  const fieldRefs = {
    name:         useRef(null),
    phone:        useRef(null),
    address:      useRef(null),
    district:     useRef(null),
    thana:        useRef(null),
    senderNumber: useRef(null),
    txnId:        useRef(null),
    screenshot:   useRef(null),
  };

  const districts = Object.keys(BD_LOCATIONS).sort();
  const thanas    = district ? (BD_LOCATIONS[district] || []).sort() : [];
  const selPM     = PAYMENT_METHODS.find(p => p.id === paymentMethod);

  /* ── Scroll to top on mount ── */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  /* ════════════════════════════════════════
     AUTO-FILL — customer info + saved address
  ════════════════════════════════════════ */
  useEffect(() => {
    try {
      const info = localStorage.getItem("customerInfo");
      if (!info) return;
      const customer = JSON.parse(info);

      // Basic info
      if (customer?.name)  setName(customer.name);
      if (customer?.email) setEmail(customer.email);

      // Phone — customer phone অথবা saved address phone
      const fillPhone = customer?.phone || customer?.address?.phone || "";
      if (fillPhone) setPhone(fillPhone);

      // Saved address auto-fill
      const addr = customer?.address;
      if (addr?.street || addr?.district || addr?.thana) {
        if (addr.street)   setAddress(addr.street);
        if (addr.district) {
          setDistrict(addr.district);
          if (addr.thana) setTimeout(() => setThana(addr.thana), 50);
        }
        setAddressAutoFilled(true);
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]); // location.key — প্রতিটা navigate এ unique, তাই re-run হবে

  /* ── Zone detect from district ── */
  useEffect(() => {
    if (!district) return;
    const dhakaDistricts = ["ঢাকা", "Dhaka"];
    setSelectedZone(dhakaDistricts.includes(district) ? "dhaka" : "outside");
  }, [district, setSelectedZone]);

  const validate = () => {
    const e = {};
    if (!name.trim())    e.name     = t("নাম লিখুন",                   "Please enter your name");
    if (!phone.trim())   e.phone    = t("ফোন নম্বর লিখুন",             "Please enter your phone number");
    else {
      const normalized = phone.trim().replace(/\s/g,"").replace(/^\+880/,"0").replace(/^880/,"0");
      if (!/^01[3-9]\d{8}$/.test(normalized))
        e.phone = t("সঠিক বাংলাদেশি নম্বর দিন", "Enter a valid Bangladeshi number");
    }
    if (!address.trim()) e.address  = t("ঠিকানা লিখুন",                "Please enter your address");
    if (!district)       e.district = t("জেলা সিলেক্ট করুন",           "Please select a district");
    if (!thana)          e.thana    = t("উপজেলা সিলেক্ট করুন",         "Please select a thana");
    if (paymentMethod !== "cod") {
      if (!senderNumber.trim()) e.senderNumber = t("আপনার পেমেন্ট নম্বর লিখুন", "Enter your payment number");
      if (!txnId.trim())        e.txnId        = t("Transaction ID লিখুন",        "Enter Transaction ID");
      if (!screenshot)          e.screenshot   = t("Payment screenshot আপলোড করুন", "Upload payment screenshot");
    }
    setErrors(e);
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      // প্রথম error field এ scroll করো
      const order = ["name", "phone", "district", "thana", "address", "senderNumber", "txnId", "screenshot"];
      for (const key of order) {
        if (e[key] && fieldRefs[key]?.current) {
          fieldRefs[key].current.scrollIntoView({ behavior: "smooth", block: "center" });
          break;
        }
      }
      return;
    }
    setLoading(true);
    try {
      let screenshotUrl = "";
      if (paymentMethod !== "cod" && screenshot?.file) {
        const formData = new FormData();
        formData.append("file", screenshot.file);
        formData.append("upload_preset", "s9wkz9wg");
        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || "dkuhvo2zh"}/image/upload`,
          { method: "POST", body: formData }
        );
        const uploadData = await uploadRes.json();
        screenshotUrl = uploadData.secure_url || "";
      }

      const res = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name, phone, email, address, district, thana, note },
          paymentMethod, paymentNumber: senderNumber, transactionId: txnId, screenshotUrl,
          items: cartItems.map(item => ({
            productId: item._id, name: item.name, slug: item.slug,
            image: item.image, price: item.price, salePrice: item.salePrice,
            discountType: item.discountType, discountValue: item.discountValue,
            quantity: item.quantity, stock: item.stock,
          })),
          subtotal: cartSubtotal, savings: cartSavings, deliveryCharge, total: cartTotal,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.message === "duplicate_txn") {
          setErrors({ txnId: t("এই TrxID আগেই ব্যবহার হয়েছে", "This TrxID has already been used"), submit: data.messagebn });
          return;
        }
        throw new Error(data.message || "Order failed");
      }
      clearCart();
      setSuccess(data.data);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  /* ── Success screen ── */
  if (success) {
    const pm = PAYMENT_METHODS.find(p => p.id === success.paymentMethod);
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center px-4 py-16">
        <motion.div initial={{ opacity:0, scale:0.9, y:24 }} animate={{ opacity:1, scale:1, y:0 }}
          transition={{ duration:0.5, ease:[0.22,1,0.36,1] }}
          className="bg-white rounded-3xl p-8 sm:p-12 max-w-md w-full text-center"
          style={{ boxShadow:"0 24px 80px rgba(0,0,0,0.1)" }}>
          <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
            transition={{ delay:0.2, type:"spring", stiffness:260, damping:18 }}
            className="w-24 h-24 bg-[#e8f5e9] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-[#2e7d32]" strokeWidth={1.5}/>
          </motion.div>
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}>
            <h1 className="text-2xl font-black text-gray-900 mb-1">{t("অর্ডার সফল! 🎉", "Order Placed! 🎉")}</h1>
            <p className="text-gray-400 text-sm mb-6">{t("আপনার অর্ডার গ্রহণ করা হয়েছে।", "Your order has been received.")}</p>
            <div className="bg-[#f8f8f5] rounded-2xl p-5 mb-5 text-left space-y-3">
              {[
                { label: t("অর্ডার আইডি",   "Order ID"),   value: success.orderId,                                             bold: true  },
                { label: t("পেমেন্ট",       "Payment"),    value: pm?.label,                                                   bold: false },
                { label: t("মোট",           "Total"),      value: `৳${success.total?.toLocaleString()}`,                       bold: true  },
                { label: t("ডেলিভারি দিন",  "Deliver to"), value: `${success.customer?.thana}, ${success.customer?.district}`, bold: false },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">{r.label}</span>
                  <span className={`text-sm ${r.bold ? "font-black text-[#1a2e1a]" : "font-semibold text-gray-700"}`}>{r.value}</span>
                </div>
              ))}
            </div>
            {success.paymentMethod !== "cod" && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
                className="rounded-2xl p-4 mb-5 text-left"
                style={{ backgroundColor: pm?.light, border: `1.5px solid ${pm?.border}` }}>
                <p className="text-[13px] font-black mb-3" style={{ color: pm?.color }}>
                  {t("পেমেন্ট যাচাই চলছে…", "Payment verification in progress…")}
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: pm?.color, opacity:0.75 }}>
                  {t(
                    "আপনার payment screenshot ও transaction ID আমাদের কাছে পৌঁছে গেছে। ১-২ ঘণ্টার মধ্যে confirm করা হবে।",
                    "Your payment screenshot and transaction ID have been received. It will be confirmed within 1-2 hours."
                  )}
                </p>
              </motion.div>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-400 justify-center mb-6">
              <Clock size={12}/> {t("আমাদের টিম ১-২ ঘণ্টার মধ্যে confirm করবে", "Our team will confirm within 1-2 hours")}
            </div>
            <button onClick={() => navigate("/")}
              className="w-full bg-[#1a2e1a] hover:bg-[#2e7d32] text-white py-4 rounded-2xl text-sm font-black tracking-wide transition-colors flex items-center justify-center gap-2"
              style={{ boxShadow:"0 8px 32px rgba(26,46,26,0.25)" }}>
              <ShoppingBag size={16}/> {t("কেনাকাটা চালিয়ে যান", "Continue Shopping")}
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  /* ── Empty cart ── */
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex flex-col items-center justify-center gap-4 px-4">
        <ShoppingBag size={52} strokeWidth={1} className="text-gray-300"/>
        <p className="text-gray-500 font-bold text-lg">{t("কার্ট খালি", "Cart is empty")}</p>
        <Link to="/" className="flex items-center gap-2 bg-[#1a2e1a] text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-[#2e7d32] transition-colors">
          <ArrowLeft size={15}/> {t("কেনাকাটায় যান", "Go Shopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/cart" className="w-10 h-10 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-all">
            <ArrowLeft size={18}/>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900">{t("চেকআউট", "Checkout")}</h1>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <Shield size={10} className="text-[#2e7d32]"/>
              {t(`নিরাপদ অর্ডার · ${cartItems.length}টি পণ্য`, `Secure Order · ${cartItems.length} item${cartItems.length > 1 ? "s" : ""}`)}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8 text-[11px] font-bold text-gray-400">
          <span className="flex items-center gap-1 text-[#2e7d32]"><CheckCircle size={12} strokeWidth={2.5}/> {t("কার্ট", "Cart")}</span>
          <ChevronRight size={11}/>
          <span className="text-gray-900">{t("চেকআউট", "Checkout")}</span>
          <ChevronRight size={11}/>
          <span>{t("নিশ্চিতকরণ", "Confirmation")}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

          {/* LEFT */}
          <div className="space-y-5">

            {/* Customer Info */}
            <SectionCard icon={<User size={15}/>} title={t("গ্রাহকের তথ্য", "Customer Information")} step="1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={t("পুরো নাম", "Full Name")} required error={errors.name} fieldRef={fieldRefs.name}>
                  <Input value={name} onChange={e => { setName(e.target.value); setErrors(p => ({...p, name:""})); }}
                    placeholder={t("আপনার পুরো নাম", "Your full name")} error={errors.name}/>
                </Field>
                <Field label={t("ফোন নম্বর", "Phone Number")} required error={errors.phone} fieldRef={fieldRefs.phone}>
                  <Input type="tel" value={phone} onChange={e => { setPhone(e.target.value); setErrors(p => ({...p, phone:""})); }}
                    placeholder="01XXXXXXXXX" error={errors.phone}/>
                </Field>
              </div>
              <Field label={t("ইমেইল ঠিকানা", "Email Address")} optional>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com"/>
              </Field>
            </SectionCard>

            {/* Delivery Address */}
            <SectionCard icon={<MapPin size={15}/>} title={t("ডেলিভারি ঠিকানা", "Delivery Address")} step="2">

              {/* Auto-fill badge */}
              {addressAutoFilled && (
                <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold"
                  style={{ background:"#e8f5e9", border:"1px solid #a5d6a7", color:"#2e7d32" }}>
                  <CheckCircle size={13}/>
                  {t("সেভ করা ঠিকানা থেকে পূরণ করা হয়েছে","Auto-filled from saved address")}
                  <button type="button"
                    onClick={() => { setAddress(""); setDistrict(""); setThana(""); setAddressAutoFilled(false); }}
                    className="ml-auto text-[11px] font-bold underline cursor-pointer bg-transparent border-none"
                    style={{ color:"#2e7d32" }}>
                    {t("পরিবর্তন করুন","Change")}
                  </button>
                </motion.div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={t("জেলা", "District")} required error={errors.district} fieldRef={fieldRefs.district}>
                  <SearchDropdown value={district}
                    onChange={v => { setDistrict(v); setThana(""); setErrors(p => ({...p, district:"", thana:""})); }}
                    options={districts} placeholder={t("জেলা সিলেক্ট করুন", "Select district")} error={errors.district}/>
                </Field>
                <Field label={t("উপজেলা / থানা", "Upazila / Thana")} required error={errors.thana} fieldRef={fieldRefs.thana}>
                  <SearchDropdown value={thana} onChange={v => { setThana(v); setErrors(p => ({...p, thana:""})); }}
                    options={thanas}
                    placeholder={district ? t("উপজেলা সিলেক্ট করুন", "Select upazila") : t("আগে জেলা বেছে নিন", "Select district first")}
                    disabled={!district} error={errors.thana}/>
                </Field>
              </div>

              {/* Zone indicator */}
              {district && (
                <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold"
                  style={{
                    background: ["ঢাকা","Dhaka"].includes(district) ? "#e8f5e9" : "#fff3e0",
                    color:      ["ঢাকা","Dhaka"].includes(district) ? "#2e7d32" : "#e65100",
                    border:     `1px solid ${["ঢাকা","Dhaka"].includes(district) ? "#a5d6a7" : "#ffcc80"}`,
                  }}>
                  <Truck size={13}/>
                  {["ঢাকা","Dhaka"].includes(district)
                    ? t(`ঢাকার ভেতরে — ডেলিভারি চার্জ ৳${deliverySettings?.deliveryInDhaka ?? 60}`,       `Inside Dhaka — Delivery ৳${deliverySettings?.deliveryInDhaka ?? 60}`)
                    : t(`ঢাকার বাইরে — ডেলিভারি চার্জ ৳${deliverySettings?.deliveryOutsideDhaka ?? 120}`, `Outside Dhaka — Delivery ৳${deliverySettings?.deliveryOutsideDhaka ?? 120}`)
                  }
                  {deliveryCharge === 0 && (
                    <span className="ml-1 text-[#2e7d32] font-black">{t("(ফ্রি ডেলিভারি 🎉)", "(Free Delivery 🎉)")}</span>
                  )}
                </motion.div>
              )}

              <Field label={t("পুরো ঠিকানা", "Full Address")} required error={errors.address} fieldRef={fieldRefs.address}>
                <Input rows={3} value={address} onChange={e => { setAddress(e.target.value); setErrors(p => ({...p, address:""})); }}
                  placeholder={t("বাড়ি নং, রোড নং, এলাকার নাম...", "House no, road no, area name...")} error={errors.address}/>
              </Field>
              <Field label={t("অর্ডার নোট", "Order Note")} optional>
                <Input rows={2} value={note} onChange={e => setNote(e.target.value)}
                  placeholder={t("ডেলিভারি সম্পর্কে বিশেষ নির্দেশনা থাকলে লিখুন...", "Any special delivery instructions...")}/>
              </Field>
            </SectionCard>

            {/* Payment */}
            <SectionCard icon={<Banknote size={15}/>} title={t("পেমেন্ট পদ্ধতি", "Payment Method")} step="3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PAYMENT_METHODS.map(pm => (
                  <motion.button key={pm.id} type="button" whileTap={{ scale:0.96 }}
                    onClick={() => {
                      setPaymentMethod(pm.id);
                      setSenderNumber(""); setTxnId(""); setScreenshot(null);
                      setErrors(p => ({...p, senderNumber:"", txnId:"", screenshot:""}));
                    }}
                    className="relative flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border-2 transition-all duration-200"
                    style={paymentMethod === pm.id
                      ? { borderColor: pm.border, backgroundColor: pm.light }
                      : { borderColor: "#e5e7eb", backgroundColor: "#fff" }}>
                    {paymentMethod === pm.id && (
                      <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
                        className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: pm.color }}>
                        <Check size={10} className="text-white" strokeWidth={3}/>
                      </motion.div>
                    )}
                    {pm.logo
                      ? <img src={pm.logo} alt={pm.label} className="h-7 w-auto object-contain"/>
                      : <span className="text-2xl">💵</span>
                    }
                    <p className="text-[12px] font-black text-center leading-tight"
                      style={{ color: paymentMethod === pm.id ? pm.color : "#374151" }}>
                      {pm.label}
                    </p>
                  </motion.button>
                ))}
              </div>

              <AnimatePresence>
                {paymentMethod !== "cod" && (
                  <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
                    exit={{ opacity:0, height:0 }} className="overflow-hidden">
                    <div className="rounded-2xl p-5 space-y-4 mt-1"
                      style={{ backgroundColor: selPM.light, border: `1.5px solid ${selPM.border}` }}>

                      <div>
                        <p className="text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: selPM.color }}>
                          ① {t("এই নম্বরে Send Money করুন", "Send Money to this number")}
                        </p>
                        <div className="bg-white rounded-xl px-4 py-3 flex items-center justify-between"
                          style={{ border: `1px solid ${selPM.border}` }}>
                          <span className="text-[20px] font-black tracking-widest" style={{ color: selPM.color }}>
                            {selPM.number}
                          </span>
                          <CopyButton text={selPM.number}/>
                        </div>
                        <p className="text-[11px] mt-2 leading-relaxed" style={{ color: selPM.color, opacity:0.8 }}>
                          {selPM.instruction}
                        </p>
                      </div>

                      <div className="space-y-1.5" ref={fieldRefs.senderNumber}>
                        <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: selPM.color }}>
                          ② {t(`আপনার ${selPM.label} নম্বর *`, `Your ${selPM.label} number *`)}
                        </p>
                        <input type="tel"
                          placeholder={t("যে নম্বর থেকে পাঠিয়েছেন", "The number you sent from")}
                          value={senderNumber}
                          onChange={e => { setSenderNumber(e.target.value); setErrors(p => ({...p, senderNumber:""})); }}
                          className="w-full px-4 h-[48px] border-2 rounded-xl text-sm font-semibold text-gray-800 outline-none transition-all bg-white placeholder:text-gray-300"
                          style={{ borderColor: errors.senderNumber ? "#fca5a5" : selPM.border }}
                        />
                        {errors.senderNumber && (
                          <p className="text-[11px] text-red-500 flex items-center gap-1">
                            <AlertCircle size={11}/> {errors.senderNumber}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5" ref={fieldRefs.txnId}>
                        <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: selPM.color }}>
                          ③ Transaction ID *
                        </p>
                        <input type="text"
                          placeholder={t("Transaction ID / TrxID লিখুন", "Enter Transaction ID / TrxID")}
                          value={txnId}
                          onChange={e => { setTxnId(e.target.value); setErrors(p => ({...p, txnId:""})); }}
                          className="w-full px-4 h-[48px] border-2 rounded-xl text-sm font-semibold text-gray-800 outline-none transition-all bg-white placeholder:text-gray-300"
                          style={{ borderColor: errors.txnId ? "#fca5a5" : selPM.border }}
                        />
                        {errors.txnId && (
                          <p className="text-[11px] text-red-500 flex items-center gap-1">
                            <AlertCircle size={11}/> {errors.txnId}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5" ref={fieldRefs.screenshot}>
                        <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: selPM.color }}>
                          ④ Payment Screenshot *
                        </p>
                        <ScreenshotUpload value={screenshot}
                          onChange={val => { setScreenshot(val); setErrors(p => ({...p, screenshot:""})); }}
                          color={selPM.color} border={selPM.border} light={selPM.light}/>
                        {errors.screenshot && (
                          <p className="text-[11px] text-red-500 flex items-center gap-1">
                            <AlertCircle size={11}/> {errors.screenshot}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </SectionCard>
          </div>

          {/* RIGHT SUMMARY */}
          <div>
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden"
                style={{ boxShadow:"0 2px 20px rgba(0,0,0,0.04)" }}>
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50"
                  style={{ background: "linear-gradient(135deg,#1a2e1a,#2e5230)" }}>
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                    <Package size={15} className="text-white"/>
                  </div>
                  <h2 className="text-[15px] font-black text-white">{t("অর্ডার সারসংক্ষেপ", "Order Summary")}</h2>
                </div>

                <div className="p-5 space-y-3 border-b border-gray-50 max-h-52 overflow-y-auto">
                  {cartItems.map(item => (
                    <div key={item._id} className="flex gap-3 items-center">
                      <div className="w-11 h-11 rounded-xl border border-gray-100 bg-gray-50 flex-shrink-0 overflow-hidden">
                        {item.image
                          ? <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1"/>
                          : <Package size={14} className="text-gray-200 m-auto mt-3"/>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{t("পরিমাণ", "Qty")}: {item.quantity}</p>
                      </div>
                      <span className="text-[13px] font-bold text-gray-900 flex-shrink-0">
                        ৳{(item.salePrice * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-5 space-y-2.5">
                  <div className="flex justify-between text-[13px] text-gray-500">
                    <span>{t("সাবটোটাল", "Subtotal")}</span>
                    <span>৳{cartSubtotal.toLocaleString()}</span>
                  </div>
                  {cartSavings > 0 && (
                    <div className="flex justify-between text-[13px] font-semibold text-[#2e7d32]">
                      <span>{t("ছাড়", "Discount")}</span>
                      <span>−৳{cartSavings.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[13px] text-gray-500">
                    <span>
                      {t("ডেলিভারি", "Delivery")}
                      {district && (
                        <span className="ml-1 text-[10px] text-gray-400">
                          ({["ঢাকা","Dhaka"].includes(district) ? t("ঢাকা", "Dhaka") : t("ঢাকার বাইরে", "Outside Dhaka")})
                        </span>
                      )}
                    </span>
                    <span className={deliveryCharge === 0 ? "text-[#2e7d32] font-semibold" : ""}>
                      {deliveryCharge === 0 ? t("ফ্রি 🎉", "Free 🎉") : `৳${deliveryCharge}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-[16px] font-black text-gray-900 pt-2.5 border-t border-gray-100">
                    <span>{t("মোট", "Total")}</span>
                    <span>৳{cartTotal.toLocaleString()}</span>
                  </div>
                </div>

                {cartSavings > 0 && (
                  <div className="mx-5 mb-5 bg-[#e8f5e9] rounded-2xl py-2.5 px-4 text-center border border-[#c8e6c9]">
                    <p className="text-[11px] text-[#2e7d32] font-bold">
                      🎉 {t(`আপনি ৳${cartSavings.toLocaleString()} সাশ্রয় করছেন!`, `You're saving ৳${cartSavings.toLocaleString()}!`)}
                    </p>
                  </div>
                )}
              </div>

              {/* Selected payment badge */}
              <div className="rounded-2xl px-4 py-3.5 flex items-center gap-3 border"
                style={{ backgroundColor: selPM.light, borderColor: selPM.border }}>
                {selPM.logo
                  ? <img src={selPM.logo} alt={selPM.label} className="h-7 w-auto object-contain"/>
                  : <span className="text-2xl">💵</span>
                }
                <div>
                  <p className="text-[13px] font-black" style={{ color: selPM.color }}>{selPM.label}</p>
                  <p className="text-[10px]" style={{ color: selPM.color, opacity:0.65 }}>{selPM.sublabel}</p>
                </div>
              </div>

              {errors.submit && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex gap-2.5">
                  <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5"/>
                  <p className="text-[12px] text-red-600 font-semibold">{errors.submit}</p>
                </div>
              )}

              <motion.button whileTap={{ scale:0.98 }} onClick={handleSubmit} disabled={loading}
                className="w-full bg-[#1a2e1a] hover:bg-[#2e7d32] disabled:bg-gray-300 text-white py-4 rounded-2xl text-[14px] font-black tracking-wide transition-all flex items-center justify-center gap-2.5"
                style={{ boxShadow: loading ? "none" : "0 8px 32px rgba(26,46,26,0.28)" }}>
                {loading
                  ? <><Loader2 size={16} className="animate-spin"/> {t("প্রসেস হচ্ছে...", "Processing...")}</>
                  : <><CheckCircle size={16} strokeWidth={2.5}/> {t(`অর্ডার করুন · ৳${cartTotal.toLocaleString()}`, `Place Order · ৳${cartTotal.toLocaleString()}`)}</>
                }
              </motion.button>

              <Link to="/cart"
                className="w-full border-2 border-gray-200 text-gray-500 hover:bg-gray-50 py-3 rounded-2xl text-[13px] font-semibold transition-colors flex items-center justify-center gap-1.5">
                <ArrowLeft size={13}/> {t("কার্টে ফিরুন", "Back to Cart")}
              </Link>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon:<Shield size={13}/>, text: t("নিরাপদ",         "Secure")        },
                  { icon:<Truck size={13}/>,  text: t("দ্রুত ডেলিভারি", "Fast Delivery") },
                  { icon:<Clock size={13}/>,  text: t("সাপোর্ট",        "Support")       },
                ].map(b => (
                  <div key={b.text} className="flex flex-col items-center gap-1.5 bg-white rounded-2xl py-3 border border-gray-100">
                    <span className="text-[#2e7d32]">{b.icon}</span>
                    <p className="text-[9px] font-bold text-gray-500">{b.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}