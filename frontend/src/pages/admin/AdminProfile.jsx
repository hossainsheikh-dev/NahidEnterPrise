import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Lock, Save,
  Eye, EyeOff, CheckCircle, AlertCircle,
  Loader, Shield, Edit3, Calendar, Clock,
  Key, X, Link2, Fingerprint, Activity,
  BadgeCheck,
} from "lucide-react";
import { useAdminLang } from "../../context/AdminLangContext";

const API = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;
const getToken = () => localStorage.getItem("token") || "";

/* ── Avatar ── */
function Avatar({ name, src, size = 88 }) {
  const initials = (name || "A")
    .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  if (src && src.startsWith("http"))
    return (
      <img src={src} alt={name}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
        onError={e => { e.target.style.display = "none"; }}/>
    );
  return (
    <div className="rounded-full flex items-center justify-center text-white font-black select-none"
      style={{
        width: size, height: size, fontSize: size * 0.29,
        background: "linear-gradient(145deg,#c9a84c 0%,#e8c876 50%,#c9a84c 100%)",
        letterSpacing: "-0.02em",
        boxShadow: "inset 0 2px 4px rgba(255,255,255,0.2), 0 8px 32px rgba(201,168,76,0.45)",
        color: "#0a0f1e",
      }}>
      {initials}
    </div>
  );
}

/* ── Password Input ── */
function PassInput({ label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-[0.15em]"
        style={{ color:"#475569" }}>{label}</label>
      <div className="relative">
        <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color:"#334155" }}/>
        <input type={show ? "text" : "password"} value={value} onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-9 pr-10 py-3 rounded-xl text-sm font-medium outline-none transition-all"
          style={{ background:"rgba(255,255,255,0.05)", border:"1.5px solid rgba(255,255,255,0.09)", color:"#e2e8f0" }}
          onFocus={e => { e.target.style.borderColor="rgba(201,168,76,0.4)"; e.target.style.background="rgba(201,168,76,0.04)"; }}
          onBlur={e  => { e.target.style.borderColor="rgba(255,255,255,0.09)"; e.target.style.background="rgba(255,255,255,0.05)"; }}
        />
        <button type="button" onClick={() => setShow(s => !s)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color:"#475569" }}>
          {show ? <EyeOff size={13}/> : <Eye size={13}/>}
        </button>
      </div>
    </div>
  );
}

/* ── Text Input ── */
function TextInput({ label, icon: Icon, type = "text", value, onChange, placeholder, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-[0.15em]"
        style={{ color:"#475569" }}>{label}</label>
      <div className="relative">
        <Icon size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color:"#334155" }}/>
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-all"
          style={{ background:"rgba(255,255,255,0.05)", border:"1.5px solid rgba(255,255,255,0.09)", color:"#e2e8f0" }}
          onFocus={e => { e.target.style.borderColor="rgba(201,168,76,0.4)"; e.target.style.background="rgba(201,168,76,0.04)"; }}
          onBlur={e  => { e.target.style.borderColor="rgba(255,255,255,0.09)"; e.target.style.background="rgba(255,255,255,0.05)"; }}
        />
      </div>
      {hint && <p className="text-[11px] pl-0.5" style={{ color:"#475569" }}>{hint}</p>}
    </div>
  );
}

/* ── Modal ── */
function Modal({ open, onClose, title, subtitle, accent, icon: Icon, children }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center p-4"
            style={{ background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)" }}
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={onClose}/>
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div className="w-full pointer-events-auto flex flex-col"
              style={{
                maxWidth:480, maxHeight:"90vh",
                background:"#111827",
                border:"1px solid rgba(255,255,255,0.09)",
                borderRadius:22,
                boxShadow:"0 30px 80px rgba(0,0,0,0.6)",
              }}
              initial={{ scale:0.93, opacity:0, y:16 }}
              animate={{ scale:1,    opacity:1, y:0  }}
              exit={{    scale:0.93, opacity:0, y:16 }}
              transition={{ type:"spring", damping:28, stiffness:320 }}>

              {/* top accent line */}
              <div className="absolute top-0 left-0 right-0 h-px rounded-t-[22px]"
                style={{ background:`linear-gradient(90deg,transparent,${accent}80,transparent)` }}/>

              <div className="flex-shrink-0 px-6 pt-6 pb-5"
                style={{ borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background:`${accent}15`, border:`1px solid ${accent}25` }}>
                      <Icon size={18} style={{ color:accent }}/>
                    </div>
                    <div>
                      <h3 className="text-base font-bold" style={{ color:"#f1f5f9", letterSpacing:"-0.01em" }}>
                        {title}
                      </h3>
                      <p className="text-xs mt-0.5" style={{ color:"#475569" }}>{subtitle}</p>
                    </div>
                  </div>
                  <button onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition mt-0.5"
                    style={{ color:"#64748b", background:"rgba(255,255,255,0.06)" }}>
                    <X size={15}/>
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Info Row ── */
function InfoRow({ icon: Icon, label, value, accent, last }) {
  return (
    <div className={`flex items-center gap-4 py-3.5 ${!last ? "border-b" : ""}`}
      style={{ borderColor:"rgba(255,255,255,0.06)" }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background:`${accent}12`, border:`1px solid ${accent}18` }}>
        <Icon size={14} style={{ color:accent }}/>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] mb-0.5"
          style={{ color:"#475569" }}>{label}</p>
        <p className="text-sm font-semibold"
          style={{ color: value ? "#e2e8f0" : "#334155", wordBreak:"break-all" }}>
          {value || "Not set"}
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   MAIN
══════════════════════════════════ */
export default function AdminProfile() {
  const { t } = useAdminLang();

  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState(null);
  const [modal,   setModal]   = useState(null);
  const [info,    setInfo]    = useState({});

  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [phone,   setPhone]   = useState("");
  const [address, setAddress] = useState("");
  const [avatar,  setAvatar]  = useState("");

  const [curPass, setCurPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [conPass, setConPass] = useState("");

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const syncForm = d => {
    setName(d.name || ""); setEmail(d.email || "");
    setPhone(d.phone || ""); setAddress(d.address || "");
    setAvatar(d.avatar || "");
  };

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API}/api/auth/profile`, {
          headers: { Authorization:`Bearer ${getToken()}` },
        });
        if (!r.ok) throw new Error();
        const d = await r.json();
        setInfo(d); syncForm(d);
      } catch {
        const c = JSON.parse(localStorage.getItem("adminInfo") || "{}");
        setInfo(c); syncForm(c);
      } finally { setLoading(false); }
    })();
  }, []);

  const handleSaveInfo = async () => {
    if (!name.trim() || !email.trim())
      return showToast("error", t("নাম ও ইমেইল আবশ্যক।","Name and email are required."));
    setSaving(true);
    try {
      const r = await fetch(`${API}/api/auth/profile`, {
        method:"PUT",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${getToken()}` },
        body: JSON.stringify({ name, email, phone, address, avatar }),
      });
      const d = await r.json();
      if (!r.ok) return showToast("error", d.message || t("আপডেট ব্যর্থ হয়েছে।","Update failed."));
      localStorage.setItem("adminInfo", JSON.stringify(d));
      if (d.token) localStorage.setItem("token", d.token);
      setInfo(d); syncForm(d); setModal(null);
      showToast("success", t("প্রোফাইল আপডেট সফল!","Profile updated successfully!"));
    } catch { showToast("error", t("নেটওয়ার্ক সমস্যা।","Network error. Try again.")); }
    finally  { setSaving(false); }
  };

  const handleSavePassword = async () => {
    if (!curPass || !newPass || !conPass)
      return showToast("error", t("সব ঘর পূরণ করুন।","Please fill all fields."));
    if (newPass !== conPass)
      return showToast("error", t("নতুন পাসওয়ার্ড মিলছে না।","New passwords do not match."));
    if (newPass.length < 6)
      return showToast("error", t("পাসওয়ার্ড কমপক্ষে ৬ অক্ষর।","Password must be at least 6 characters."));
    setSaving(true);
    try {
      const r = await fetch(`${API}/api/auth/profile`, {
        method:"PUT",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${getToken()}` },
        body: JSON.stringify({ currentPassword:curPass, newPassword:newPass }),
      });
      const d = await r.json();
      if (!r.ok) return showToast("error", d.message || t("আপডেট ব্যর্থ হয়েছে।","Update failed."));
      if (d.token) localStorage.setItem("token", d.token);
      setCurPass(""); setNewPass(""); setConPass(""); setModal(null);
      showToast("success", t("পাসওয়ার্ড পরিবর্তন সফল!","Password changed successfully!"));
    } catch { showToast("error", t("নেটওয়ার্ক সমস্যা।","Network error. Try again.")); }
    finally  { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background:"rgba(201,168,76,0.1)", border:"1px solid rgba(201,168,76,0.2)" }}>
          <Loader size={18} className="animate-spin" style={{ color:"#c9a84c" }}/>
        </div>
        <p className="text-xs font-semibold" style={{ color:"#475569" }}>
          {t("প্রোফাইল লোড হচ্ছে…","Loading profile…")}
        </p>
      </div>
    </div>
  );

  const fmtDate = (d, full = false) => d
    ? new Date(d).toLocaleDateString(t("bn-BD","en-BD"), full
        ? { day:"numeric", month:"long",  year:"numeric" }
        : { day:"numeric", month:"short", year:"numeric" })
    : null;

  const passwordMatch    = newPass && conPass && newPass === conPass;
  const passwordMismatch = newPass && conPass && newPass !== conPass;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        .ap-wrap * { box-sizing: border-box; }
        .ap-wrap { font-family: 'DM Sans', sans-serif; }
        .ap-input-placeholder::placeholder { color: #334155; }
      `}</style>

      <div className="ap-wrap w-full max-w-xl mx-auto pb-10 px-4 sm:px-0">

        {/* ── Toast ── */}
        <AnimatePresence>
          {toast && (
            <motion.div
              className="fixed bottom-6 left-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-semibold"
              style={{
                background:"#111827",
                border:`1.5px solid ${toast.type==="success" ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
                color: toast.type==="success" ? "#34d399" : "#f87171",
                boxShadow:"0 8px 32px rgba(0,0,0,0.5)", whiteSpace:"nowrap",
              }}
              initial={{ opacity:0, y:20, x:"-50%" }}
              animate={{ opacity:1, y:0,  x:"-50%" }}
              exit={{    opacity:0, y:10, x:"-50%" }}>
              {toast.type==="success" ? <CheckCircle size={15}/> : <AlertCircle size={15}/>}
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Hero Profile Card ── */}
        <motion.div className="rounded-3xl overflow-hidden mb-4 relative"
          style={{
            background:"linear-gradient(135deg,#0d1426 0%,#111827 55%,#0f172a 100%)",
            border:"1px solid rgba(255,255,255,0.07)",
            boxShadow:"0 20px 60px rgba(0,0,0,0.4)",
          }}
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>

          {/* banner */}
          <div className="relative h-28 sm:h-32 overflow-hidden">
            {/* grid */}
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage:"linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
              backgroundSize:"32px 32px",
            }}/>
            {/* orbs */}
            <div className="absolute pointer-events-none" style={{ top:"-40px", right:"-30px", width:"200px", height:"200px", borderRadius:"50%", background:"radial-gradient(circle,rgba(201,168,76,0.12) 0%,transparent 70%)" }}/>
            <div className="absolute pointer-events-none" style={{ top:"10px", left:"-20px", width:"150px", height:"150px", borderRadius:"50%", background:"radial-gradient(circle,rgba(139,92,246,0.08) 0%,transparent 70%)" }}/>
            {/* top accent line */}
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.7) 30%,rgba(139,92,246,0.7) 70%,transparent)" }}/>
            {/* decorative circles */}
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full border"
              style={{ borderColor:"rgba(255,255,255,0.05)" }}/>
            <div className="absolute -right-2 top-4 w-16 h-16 rounded-full border"
              style={{ borderColor:"rgba(255,255,255,0.04)" }}/>
          </div>

          <div className="px-5 sm:px-7 pb-6 sm:pb-7">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 -mt-10 sm:-mt-12 mb-4 sm:mb-5">
              <motion.div
                initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }}
                transition={{ delay:0.15, type:"spring", stiffness:260 }}
                style={{ padding:3, background:"rgba(10,15,30,0.8)", borderRadius:"50%",
                  boxShadow:"0 4px 20px rgba(0,0,0,0.4)", width:"fit-content",
                  border:"2px solid rgba(201,168,76,0.3)" }}>
                <Avatar name={info.name} src={info.avatar} size={80}/>
              </motion.div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
                  style={{ background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.2)" }}>
                  <motion.div animate={{ opacity:[1,0.4,1] }} transition={{ duration:2, repeat:Infinity }}
                    className="w-1.5 h-1.5 rounded-full" style={{ background:"#34d399" }}/>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color:"#34d399" }}>
                    {t("সক্রিয়","Active")}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
                  style={{ background:"rgba(201,168,76,0.1)", border:"1px solid rgba(201,168,76,0.2)" }}>
                  <Shield size={9} style={{ color:"#c9a84c" }}/>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color:"#c9a84c" }}>
                    {info.role || "admin"}
                  </span>
                </div>
              </div>
            </div>

            <h1 style={{ fontFamily:"'Instrument Serif', serif", fontSize:"clamp(1.3rem,4vw,1.7rem)", color:"#f1f5f9", letterSpacing:"-0.02em", lineHeight:1.1, marginBottom:"4px" }}>
              {info.name || t("প্রশাসক","Administrator")}
            </h1>
            <p className="text-sm font-medium mb-4" style={{ color:"#64748b" }}>{info.email}</p>

            <div className="flex flex-wrap gap-2">
              {fmtDate(info.createdAt, true) && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                  style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", color:"#94a3b8" }}>
                  <Calendar size={11} style={{ color:"#475569" }}/>
                  {t("যোগদান","Joined")} {fmtDate(info.createdAt, true)}
                </span>
              )}
              {fmtDate(info.updatedAt) && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                  style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", color:"#94a3b8" }}>
                  <Clock size={11} style={{ color:"#475569" }}/>
                  {t("আপডেট","Updated")} {fmtDate(info.updatedAt)}
                </span>
              )}
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", color:"#94a3b8" }}>
                <Activity size={11} style={{ color:"#475569" }}/>
                Nahid Enterprise
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Info Card ── */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.1, duration:0.35 }}>

          <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-3 px-1"
            style={{ color:"#334155" }}>
            {t("অ্যাকাউন্ট বিবরণ","Account Details")}
          </p>

          <div className="rounded-2xl px-5 mb-4"
            style={{ background:"#0d1426", border:"1px solid rgba(255,255,255,0.07)", boxShadow:"0 4px 16px rgba(0,0,0,0.25)" }}>
            <InfoRow icon={User}   label={t("পুরো নাম","Full Name")}        value={info.name}    accent="#c9a84c"/>
            <InfoRow icon={Mail}   label={t("ইমেইল","Email Address")}       value={info.email}   accent="#38bdf8"/>
            <InfoRow icon={Phone}  label={t("ফোন","Phone")}                 value={info.phone}   accent="#a78bfa"/>
            <InfoRow icon={MapPin} label={t("ঠিকানা","Address")}            value={info.address} accent="#34d399"/>
            <InfoRow icon={Shield} label={t("ভূমিকা","Role")}               value={info.role}    accent="#c9a84c"/>
            <InfoRow icon={Link2}  label={t("অ্যাভাটার URL","Avatar URL")}  value={info.avatar ? t("কাস্টম URL সেট","Custom URL set") : null} accent="#2dd4bf"/>
            <InfoRow icon={Key}    label={t("পাসওয়ার্ড","Password")}        value="••••••••••"   accent="#f87171" last/>
          </div>

          {/* Security card */}
          <div className="rounded-2xl p-5 mb-4 relative overflow-hidden"
            style={{
              background:"linear-gradient(135deg,#0d1426 0%,#111827 60%,#0f172a 100%)",
              border:"1px solid rgba(201,168,76,0.15)",
              boxShadow:"0 4px 20px rgba(0,0,0,0.3)",
            }}>
            {/* golden top line */}
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.5),transparent)" }}/>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background:"rgba(201,168,76,0.1)", border:"1px solid rgba(201,168,76,0.2)" }}>
                <Fingerprint size={15} style={{ color:"#c9a84c" }}/>
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color:"#c9a84c" }}>
                {t("নিরাপত্তা স্ট্যাটাস","Security Status")}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon:BadgeCheck, label:t("অথেনটিকেশন","Authentication"), value:"JWT Token",               color:"#c9a84c" },
                { icon:Shield,     label:t("রোল অ্যাক্সেস","Role Access"),  value:info.role || "admin",       color:"#a78bfa" },
                { icon:Activity,   label:t("অ্যাকাউন্ট","Account Status"),  value:t("সক্রিয়","Active"),      color:"#34d399" },
                { icon:Key,        label:t("পাসওয়ার্ড","Password"),         value:t("সুরক্ষিত","Protected"), color:"#38bdf8" },
              ].map(({ icon:Icon, label, value, color }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <Icon size={13} style={{ color, flexShrink:0 }}/>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color:"#334155" }}>{label}</p>
                    <p className="text-xs font-semibold" style={{ color:"#94a3b8" }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button whileHover={{ y:-2, transition:{ duration:0.15 } }} whileTap={{ scale:0.97 }}
              onClick={() => setModal("edit")}
              className="flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-bold"
              style={{
                background:"linear-gradient(135deg,rgba(201,168,76,0.2),rgba(201,168,76,0.1))",
                color:"#e8c876",
                border:"1px solid rgba(201,168,76,0.3)",
                boxShadow:"0 4px 16px rgba(201,168,76,0.15)",
              }}>
              <Edit3 size={15}/> {t("প্রোফাইল আপডেট","Update Profile")}
            </motion.button>
            <motion.button whileHover={{ y:-2, transition:{ duration:0.15 } }} whileTap={{ scale:0.97 }}
              onClick={() => setModal("password")}
              className="flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-bold"
              style={{
                background:"rgba(255,255,255,0.04)",
                color:"#94a3b8",
                border:"1px solid rgba(255,255,255,0.09)",
              }}>
              <Lock size={15}/> {t("পাসওয়ার্ড পরিবর্তন","Change Password")}
            </motion.button>
          </div>
        </motion.div>

        {/* ── Edit Modal ── */}
        <Modal open={modal==="edit"} onClose={() => setModal(null)}
          title={t("প্রোফাইল আপডেট","Update Profile")}
          subtitle={t("অ্যাকাউন্ট তথ্য সম্পাদনা করুন","Edit your account information")}
          accent="#c9a84c" icon={Edit3}>
          <div className="space-y-4">
            <TextInput label={t("পুরো নাম","Full Name")}       icon={User}   value={name}    onChange={e=>setName(e.target.value)}    placeholder={t("আপনার পুরো নাম","Your full name")}/>
            <TextInput label={t("ইমেইল","Email")}              icon={Mail}   type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@email.com"/>
            <TextInput label={t("ফোন","Phone")}                icon={Phone}  value={phone}   onChange={e=>setPhone(e.target.value)}   placeholder="01XXXXXXXXX"/>
            <TextInput label={t("ঠিকানা","Address")}           icon={MapPin} value={address} onChange={e=>setAddress(e.target.value)} placeholder={t("আপনার ঠিকানা","Your address")}/>
            <TextInput label={t("অ্যাভাটার URL","Avatar URL")} icon={Link2}  value={avatar}  onChange={e=>setAvatar(e.target.value)}
              placeholder="https://i.imgur.com/photo.jpg"
              hint={t("সরাসরি ইমেজ লিংক দিন।","Paste a direct image link.")}/>

            {avatar && avatar.startsWith("http") && (
              <div className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
                <Avatar name={name} src={avatar} size={36}/>
                <p className="text-xs font-medium" style={{ color:"#64748b" }}>
                  {t("অ্যাভাটার প্রিভিউ","Avatar preview")}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button onClick={() => setModal(null)}
                className="py-3 rounded-xl text-sm font-semibold transition"
                style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", color:"#64748b" }}>
                {t("বাতিল","Cancel")}
              </button>
              <button onClick={handleSaveInfo} disabled={saving}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold disabled:opacity-60 transition"
                style={{ background:"linear-gradient(135deg,#c9a84c,#e8c876)", color:"#0a0f1e", boxShadow:"0 4px 14px rgba(201,168,76,0.3)" }}>
                {saving ? <Loader size={14} className="animate-spin"/> : <Save size={14}/>}
                {saving ? t("সংরক্ষণ হচ্ছে…","Saving…") : t("পরিবর্তন সংরক্ষণ","Save Changes")}
              </button>
            </div>
          </div>
        </Modal>

        {/* ── Password Modal ── */}
        <Modal open={modal==="password"} onClose={() => setModal(null)}
          title={t("পাসওয়ার্ড পরিবর্তন","Change Password")}
          subtitle={t("আপনার অ্যাকাউন্ট সুরক্ষিত রাখুন","Keep your account secure")}
          accent="#f87171" icon={Lock}>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 rounded-xl"
              style={{ background:"rgba(232,164,39,0.07)", border:"1px solid rgba(232,164,39,0.2)" }}>
              <AlertCircle size={13} className="flex-shrink-0 mt-0.5" style={{ color:"#e8a427" }}/>
              <p className="text-xs leading-relaxed" style={{ color:"#94a3b8" }}>
                {t("পাসওয়ার্ড পরিবর্তনের পর সেশন টোকেন রিফ্রেশ হবে।",
                  "Your session token will be refreshed after changing your password.")}
              </p>
            </div>

            <PassInput label={t("বর্তমান পাসওয়ার্ড","Current Password")}         value={curPass} onChange={e=>setCurPass(e.target.value)} placeholder={t("বর্তমান পাসওয়ার্ড দিন","Enter current password")}/>
            <PassInput label={t("নতুন পাসওয়ার্ড","New Password")}               value={newPass} onChange={e=>setNewPass(e.target.value)} placeholder={t("কমপক্ষে ৬ অক্ষর","Minimum 6 characters")}/>
            <PassInput label={t("নতুন পাসওয়ার্ড নিশ্চিত","Confirm New Password")} value={conPass} onChange={e=>setConPass(e.target.value)} placeholder={t("পুনরায় নতুন পাসওয়ার্ড","Repeat new password")}/>

            <AnimatePresence>
              {(passwordMatch || passwordMismatch) && (
                <motion.div initial={{ opacity:0,y:-4 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}
                  className="flex items-center gap-2 text-xs font-semibold"
                  style={{ color: passwordMatch ? "#34d399" : "#f87171" }}>
                  {passwordMatch
                    ? <><CheckCircle size={13}/>{t("পাসওয়ার্ড মিলেছে","Passwords match")}</>
                    : <><AlertCircle size={13}/>{t("পাসওয়ার্ড মিলছে না","Passwords do not match")}</>}
                </motion.div>
              )}
            </AnimatePresence>

            {newPass && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color:"#475569" }}>
                  {t("পাসওয়ার্ড শক্তি","Password strength")}
                </p>
                <div className="flex gap-1">
                  {[
                    newPass.length >= 6,
                    newPass.length >= 10,
                    /[A-Z]/.test(newPass),
                    /[0-9]/.test(newPass),
                    /[^A-Za-z0-9]/.test(newPass),
                  ].map((met, i) => (
                    <div key={i} className="flex-1 h-1.5 rounded-full transition-colors duration-300"
                      style={{ background: met
                        ? i < 2 ? "#e8a427" : i < 4 ? "#c9a84c" : "#34d399"
                        : "rgba(255,255,255,0.08)" }}/>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button onClick={() => { setModal(null); setCurPass(""); setNewPass(""); setConPass(""); }}
                className="py-3 rounded-xl text-sm font-semibold transition"
                style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", color:"#64748b" }}>
                {t("বাতিল","Cancel")}
              </button>
              <button onClick={handleSavePassword} disabled={saving}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold disabled:opacity-60 transition"
                style={{ background:"linear-gradient(135deg,#f87171,#ef4444)", color:"#fff", boxShadow:"0 4px 14px rgba(248,113,113,0.3)" }}>
                {saving ? <Loader size={14} className="animate-spin"/> : <Lock size={14}/>}
                {saving ? t("সংরক্ষণ হচ্ছে…","Saving…") : t("পাসওয়ার্ড পরিবর্তন","Change Password")}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}