import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Mail, Lock, Eye, EyeOff, User, Phone,
  AlertCircle, CheckCircle, Loader2,
  ShoppingBag, Heart, Package, Shield,
  ArrowLeft, MapPin, HelpCircle, ChevronRight, ChevronDown,
  LogOut, KeyRound, Info, Settings,
} from "lucide-react";
import { useT } from "../../context/LanguageContext";
import { useCart } from "../../context/CartContext";
import BD_LOCATIONS from "../../data/Bdlocations";
import logo from "../../assets/logo.png";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const notify = () => window.dispatchEvent(new Event("customerAuthChanged"));

/* ══════════════════════════════════════════
   INLINE ALERT
══════════════════════════════════════════ */
function InlineAlert({ type, msg }) {
  if (!msg) return null;
  const cfg = {
    error:   { bg: "rgba(220,38,38,0.07)",  border: "rgba(220,38,38,0.2)",  text: "#dc2626", Icon: AlertCircle },
    success: { bg: "rgba(22,163,74,0.07)",  border: "rgba(22,163,74,0.2)",  text: "#16a34a", Icon: CheckCircle },
    info:    { bg: "rgba(46,125,50,0.07)",  border: "rgba(46,125,50,0.2)",  text: "#2e7d32", Icon: CheckCircle },
  }[type] || { bg: "rgba(220,38,38,0.07)", border: "rgba(220,38,38,0.2)", text: "#dc2626", Icon: AlertCircle };
  const { Icon } = cfg;
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-5">
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl text-[13px] font-medium"
        style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text }}>
        <Icon size={14} className="shrink-0 mt-0.5" />{msg}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════
   INPUT FIELD — Premium floating label style
══════════════════════════════════════════ */
function InputField({ icon: Icon, type = "text", value, onChange, placeholder, hasError, rightEl, autoComplete, disabled, onFocusCb, onBlurCb }) {
  const [focused, setFocused] = useState(false);
  const active = focused || (value && value.length > 0);
  return (
    <div className="relative group">
      {Icon && (
        <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200 z-10"
          style={{ color: focused ? "#15803d" : hasError ? "#ef4444" : "#94a3b8" }} />
      )}
      <input
        type={type} value={value} onChange={onChange}
        placeholder={placeholder} autoComplete={autoComplete} disabled={disabled}
        onFocus={() => { setFocused(true); onFocusCb?.(); }}
        onBlur={() => { setFocused(false); onBlurCb?.(); }}
        className="w-full text-[14.5px] font-medium rounded-2xl outline-none transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          color: "#0f172a",
          padding: Icon ? "14px 14px 14px 44px" : "14px 14px",
          paddingRight: rightEl ? "48px" : "14px",
          border: hasError
            ? "2px solid #fca5a5"
            : focused
            ? "2px solid #16a34a"
            : "2px solid #e2e8f0",
          background: hasError
            ? "#fff5f5"
            : focused
            ? "#f0fdf4"
            : "#f8fafc",
          boxShadow: focused && !hasError
            ? "0 0 0 4px rgba(22,163,74,0.08)"
            : hasError
            ? "0 0 0 4px rgba(239,68,68,0.06)"
            : "none",
          letterSpacing: type === "password" && value ? "0.15em" : "normal",
        }}
      />
      {rightEl && <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10">{rightEl}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════
   FIELD WRAPPER
══════════════════════════════════════════ */
function FieldWrap({ label, error, children, hint }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[12px] font-bold text-slate-500 tracking-wide">{label}</label>
      )}
      {children}
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="flex items-center gap-1.5 text-[12px] text-red-500 font-medium overflow-hidden">
            <AlertCircle size={12} className="shrink-0" />{error}
          </motion.p>
        )}
        {!error && hint && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: hint.color }}>
            {hint.icon}{hint.text}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════
   SUBMIT BUTTON — Premium gradient
══════════════════════════════════════════ */
function SubmitBtn({ loading, children, disabled, onClick, type = "submit" }) {
  return (
    <motion.button type={type} disabled={loading || disabled} onClick={onClick}
      whileHover={!loading && !disabled ? { scale: 1.015, y: -1 } : {}}
      whileTap={!loading && !disabled ? { scale: 0.985 } : {}}
      className="w-full flex items-center justify-center gap-2.5 py-[14px] px-5 rounded-2xl text-[14.5px] font-black tracking-wide transition-all duration-200 relative overflow-hidden"
      style={{
        background: loading || disabled
          ? "#f1f5f9"
          : "linear-gradient(135deg, #14532d 0%, #16a34a 50%, #22c55e 100%)",
        color: loading || disabled ? "#94a3b8" : "#fff",
        cursor: loading || disabled ? "not-allowed" : "pointer",
        boxShadow: loading || disabled
          ? "none"
          : "0 4px 24px rgba(22,163,74,0.4), 0 1px 0 rgba(255,255,255,0.15) inset",
        border: "none",
        letterSpacing: "0.02em",
      }}>
      {!loading && !disabled && (
        <>
          <motion.div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-400"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)" }}/>
          <motion.div className="absolute -inset-1 opacity-0 group-hover:opacity-100"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.15), transparent)" }}/>
        </>
      )}
      {children}
    </motion.button>
  );
}

/* ══════════════════════════════════════════
   EYE TOGGLE
══════════════════════════════════════════ */
function EyeToggle({ show, onToggle }) {
  return (
    <motion.button type="button" onClick={onToggle} whileTap={{ scale: 0.9 }}
      className="flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-150 cursor-pointer border-none"
      style={{ background: show ? "rgba(22,163,74,0.08)" : "transparent", color: show ? "#16a34a" : "#94a3b8" }}>
      {show ? <EyeOff size={15} /> : <Eye size={15} />}
    </motion.button>
  );
}

/* ══════════════════════════════════════════
   OTP INPUTS — Premium
══════════════════════════════════════════ */
function OtpInputs({ otp, onChange, onKey, onPaste, refs }) {
  return (
    <div className="grid grid-cols-6 gap-2" onPaste={onPaste}>
      {otp.map((d, i) => (
        <motion.input key={i} ref={el => refs.current[i] = el}
          type="text" inputMode="numeric" maxLength={1} value={d}
          onChange={e => onChange(i, e.target.value)}
          onKeyDown={e => onKey(i, e)}
          whileFocus={{ scale: 1.05 }}
          className="w-full h-[54px] text-center text-[22px] font-black rounded-2xl outline-none transition-all duration-200"
          style={{
            border: d ? "2px solid #16a34a" : "2px solid #e2e8f0",
            background: d ? "#f0fdf4" : "#f8fafc",
            boxShadow: d ? "0 0 0 4px rgba(22,163,74,0.1)" : "none",
            color: "#15803d",
          }}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   DIVIDER
══════════════════════════════════════════ */
function Divider({ label }) {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-slate-100" />
      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest px-1">{label}</span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

/* ══════════════════════════════════════════
   SOCIAL BUTTONS — Google only (Facebook hidden)
══════════════════════════════════════════ */
function SocialButtons({ t }) {
  return (
    <motion.button type="button"
      whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.98 }}
      onClick={() => { window.location.href = `${API}/api/customer/auth/google`; }}
      className="w-full flex items-center justify-center gap-3 py-[13px] px-5 rounded-2xl text-[14px] font-semibold transition-all duration-200 relative overflow-hidden"
      style={{
        background: "#fff",
        border: "2px solid #e2e8f0",
        color: "#374151",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}>
      <motion.div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
        style={{ background: "linear-gradient(135deg,rgba(66,133,244,0.04),rgba(52,168,83,0.04))" }}/>
      <svg width="20" height="20" viewBox="0 0 24 24" className="shrink-0">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {t("Google দিয়ে প্রবেশ", "Continue with Google")}
    </motion.button>
  );
}

/* backward compat */
function GoogleBtn({ t }) {
  return <SocialButtons t={t} />;
}

/* ══════════════════════════════════════════
   AUTH FORMS
══════════════════════════════════════════ */
function AuthCard({ mode, setMode, onSuccess, t }) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMsg,  setSuccessMsg ] = useState("");

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass,  setLoginPass ] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginErrors,   setLoginErrors  ] = useState({});

  // Register
  const [regName,    setRegName   ] = useState("");
  const [regEmail,   setRegEmail  ] = useState("");
  const [regPhone,   setRegPhone  ] = useState("");
  const [regPass,    setRegPass   ] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [showRegPass, setShowRegPass] = useState(false);
  const [regErrors,   setRegErrors  ] = useState({});
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailValid,    setEmailValid   ] = useState(null);

  // Forgot
  const [forgotEmail,    setForgotEmail   ] = useState("");
  const [newPassword,    setNewPassword   ] = useState("");
  const [confirmNewPass, setConfirmNewPass] = useState("");
  const [showNewPass,    setShowNewPass   ] = useState(false);

  // OTP
  const [otp,         setOtp        ] = useState(["","","","","",""]);
  const [otpTimer,    setOtpTimer   ] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const otpRefs         = useRef([]);
  const timerRef        = useRef(null);
  const emailCheckTimer = useRef(null);

  useEffect(() => {
    if (otpTimer > 0) timerRef.current = setTimeout(() => setOtpTimer(p => p - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [otpTimer]);

  const clear = () => { setServerError(""); setSuccessMsg(""); };
  const go    = (m) => {
    setMode(m); clear();
    setOtp(["","","","","",""]);
    setResendCount(0);
  };
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`;

  // Email existence check
  const handleRegEmailChange = (val) => {
    setRegEmail(val);
    setEmailValid(null);
    setRegErrors(p => ({ ...p, email: "" }));
    clearTimeout(emailCheckTimer.current);
    if (!validateEmail(val)) return;
    setEmailChecking(true);
    emailCheckTimer.current = setTimeout(async () => {
      try {
        const res  = await fetch(`${API}/api/customer/verify-email`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: val }) });
        const data = await res.json();
        setEmailValid(data.exists !== false);
      } catch { setEmailValid(true); }
      finally { setEmailChecking(false); }
    }, 800);
  };

  const handleOtpChange = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    setOtp(prev => { const n = [...prev]; n[i] = v; return n; });
    clear();
    if (v && i < 5) setTimeout(() => otpRefs.current[i + 1]?.focus(), 0);
  };
  const handleOtpKey = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft"  && i > 0) otpRefs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) otpRefs.current[i + 1]?.focus();
  };
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    setOtp(prev => { const n = [...prev]; p.split("").forEach((c, i) => { n[i] = c; }); return n; });
    otpRefs.current[Math.min(p.length, 5)]?.focus();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const er = {};
    if (!validateEmail(loginEmail)) er.email    = t("সঠিক ইমেইল দিন","Enter a valid email");
    if (!loginPass)                 er.password = t("পাসওয়ার্ড দিন","Password required");
    if (Object.keys(er).length) { setLoginErrors(er); return; }
    try {
      setLoading(true); clear();
      const res  = await fetch(`${API}/api/customer/login`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email:loginEmail, password:loginPass}) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      localStorage.setItem("customerToken", data.token);
      localStorage.setItem("customerInfo",  JSON.stringify(data));
      toast.success(t(`স্বাগতম, ${data.name.split(" ")[0]}! 🎉`, `Welcome back, ${data.name.split(" ")[0]}! 🎉`), {
        duration: 3000,
        style: { background:"#1a2e1a", color:"#fff", fontWeight:"600", borderRadius:"16px", padding:"12px 18px" },
        iconTheme: { primary:"#4ade80", secondary:"#1a2e1a" },
      });
      notify(); onSuccess(data);
    } catch (err) { setServerError(err.message); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const er = {};
    if (!regName.trim())          er.name     = t("নাম দিন","Name required");
    if (!validateEmail(regEmail)) er.email    = t("সঠিক ইমেইল দিন","Enter a valid email");
    if (emailValid === false)     er.email    = t("ইমেইল বিদ্যমান নেই","Email does not exist");
    if (regPass.length < 6)       er.password = t("কমপক্ষে ৬ অক্ষর","Min. 6 characters");
    if (regPass !== regConfirm)   er.confirm  = t("পাসওয়ার্ড মেলেনি","Passwords don't match");
    if (Object.keys(er).length) { setRegErrors(er); return; }
    try {
      setLoading(true); clear();
      const res  = await fetch(`${API}/api/customer/register`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({name:regName, email:regEmail, phone:regPhone, password:regPass}) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      localStorage.setItem("customerToken", data.token);
      localStorage.setItem("customerInfo",  JSON.stringify(data));
      toast.success(t(`অ্যাকাউন্ট তৈরি হয়েছে! স্বাগতম 🎉`, `Account created! Welcome 🎉`), {
        duration: 3000,
        style: { background:"#1a2e1a", color:"#fff", fontWeight:"600", borderRadius:"16px", padding:"12px 18px" },
        iconTheme: { primary:"#4ade80", secondary:"#1a2e1a" },
      });
      notify(); onSuccess(data);
    } catch (err) { setServerError(err.message); }
    finally { setLoading(false); }
  };

  const handleSendForgotOtp = async (e) => {
    e.preventDefault();
    if (!validateEmail(forgotEmail)) { setServerError(t("সঠিক ইমেইল দিন","Enter a valid email")); return; }
    try {
      setLoading(true); clear();
      const res  = await fetch(`${API}/api/customer/forgot-otp`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email:forgotEmail}) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOtpTimer(120); go("otp-forgot");
    } catch (err) { setServerError(err.message); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) { setServerError(t("৬ সংখ্যার কোড দিন","Enter 6-digit code")); return; }
    try {
      setLoading(true); clear();
      const res  = await fetch(`${API}/api/customer/verify-forgot-otp`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email:forgotEmail, otp:code}) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      go("forgot-newpass");
    } catch (err) { setServerError(err.message); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (otpTimer > 0 || resendCount >= 3) return;
    try {
      setLoading(true);
      const res  = await fetch(`${API}/api/customer/forgot-otp`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email:forgotEmail}) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOtpTimer(120); setResendCount(c => c + 1); setOtp(["","","","","",""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 140);
    } catch (err) { setServerError(err.message); }
    finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6)        { setServerError(t("কমপক্ষে ৬ অক্ষর","Min. 6 characters")); return; }
    if (newPassword !== confirmNewPass) { setServerError(t("পাসওয়ার্ড মেলেনি","Passwords don't match")); return; }
    try {
      setLoading(true); clear();
      const res  = await fetch(`${API}/api/customer/reset-password`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email:forgotEmail, newPassword}) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccessMsg(t("পাসওয়ার্ড পরিবর্তন হয়েছে!","Password changed successfully!"));
      setTimeout(() => { go("login"); setForgotEmail(""); setNewPassword(""); setConfirmNewPass(""); }, 2000);
    } catch (err) { setServerError(err.message); }
    finally { setLoading(false); }
  };

  const slide = {
    hidden: { opacity: 0, x: 16 },
    show:   { opacity: 1, x: 0, transition: { duration: 0.24, ease: [0.22,1,0.36,1] } },
    exit:   { opacity: 0, x: -16, transition: { duration: 0.16 } },
  };

  return (
    <div className="w-full">
      {/* Card */}
      <div className="relative rounded-3xl overflow-hidden bg-white"
        style={{
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08), 0 32px 64px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
        }}>

        {/* Top accent */}
        <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg,#14532d,#16a34a,#4ade80,#16a34a,#14532d)" }}/>

        {/* Tabs */}
        {(mode === "login" || mode === "register") && (
          <div className="px-6 pt-5">
            <div className="flex gap-1 p-1 rounded-2xl" style={{ background:"#f8fafc", border:"1px solid #e2e8f0" }}>
              {[["login", t("সাইন ইন","Sign In")], ["register", t("রেজিস্ট্রেশন","Register")]].map(([m, lbl]) => (
                <motion.button key={m} onClick={() => go(m)} layout
                  className="flex-1 py-2.5 text-[13.5px] font-bold border-none cursor-pointer transition-all rounded-xl relative"
                  style={{
                    background: mode === m ? "#fff" : "transparent",
                    color: mode === m ? "#15803d" : "#94a3b8",
                    boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)" : "none",
                  }}>
                  {lbl}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        <div className="px-7 py-6">
          <AnimatePresence>
            {serverError && <InlineAlert type="error"   msg={serverError} />}
            {successMsg  && <InlineAlert type="success" msg={successMsg}  />}
          </AnimatePresence>

          <AnimatePresence mode="wait">

            {/* ══ LOGIN ══ */}
            {mode === "login" && (
              <motion.form key="login" variants={slide} initial="hidden" animate="show" exit="exit"
                onSubmit={handleLogin} className="space-y-4">

                <FieldWrap label={t("ইমেইল","Email")} error={loginErrors.email}>
                  <InputField icon={Mail} type="email" value={loginEmail}
                    onChange={e => { setLoginEmail(e.target.value); setLoginErrors(p => ({...p, email:""})); }}
                    placeholder="you@example.com" hasError={!!loginErrors.email} autoComplete="email" />
                </FieldWrap>

                <FieldWrap label={t("পাসওয়ার্ড","Password")} error={loginErrors.password}>
                  <InputField icon={Lock} type={showLoginPass ? "text" : "password"} value={loginPass}
                    onChange={e => { setLoginPass(e.target.value); setLoginErrors(p => ({...p, password:""})); }}
                    placeholder="••••••••" hasError={!!loginErrors.password} autoComplete="current-password"
                    rightEl={<EyeToggle show={showLoginPass} onToggle={() => setShowLoginPass(s => !s)} />} />
                </FieldWrap>

                <div className="flex justify-end -mt-1">
                  <button type="button" onClick={() => go("forgot-email")}
                    className="text-[12.5px] font-semibold cursor-pointer bg-transparent border-none transition-colors"
                    style={{ color: "#2e7d32" }}>
                    {t("পাসওয়ার্ড ভুলে গেছেন?","Forgot password?")}
                  </button>
                </div>

                <SubmitBtn loading={loading}>
                  {loading
                    ? <><Loader2 size={15} className="animate-spin" />{t("লগইন হচ্ছে…","Signing in…")}</>
                    : t("সাইন ইন","Sign In")}
                </SubmitBtn>

                <Divider label={t("অথবা","or")} />
                <SocialButtons t={t} />

                <p className="text-center text-[13px] text-slate-400 font-medium">
                  {t("অ্যাকাউন্ট নেই?","No account?")}{" "}
                  <button type="button" onClick={() => go("register")}
                    className="font-bold cursor-pointer bg-transparent border-none transition-colors"
                    style={{ color: "#15803d" }}>
                    {t("তৈরি করুন","Create one")}
                  </button>
                </p>
              </motion.form>
            )}

            {/* ══ REGISTER ══ */}
            {mode === "register" && (
              <motion.form key="register" variants={slide} initial="hidden" animate="show" exit="exit"
                onSubmit={handleRegister} className="space-y-4">

                <FieldWrap label={t("পুরো নাম","Full Name")} error={regErrors.name}>
                  <InputField icon={User} value={regName}
                    onChange={e => { setRegName(e.target.value); setRegErrors(p => ({...p, name:""})); }}
                    placeholder={t("আপনার নাম","Your name")} hasError={!!regErrors.name} />
                </FieldWrap>

                <FieldWrap label={t("ইমেইল","Email")} error={regErrors.email}
                  hint={
                    !regErrors.email && emailValid === true && validateEmail(regEmail)
                      ? { color: "#16a34a", icon: <CheckCircle size={11} />, text: t("ইমেইল যাচাই হয়েছে","Email verified") }
                      : null
                  }>
                  <div className="relative">
                    <InputField icon={Mail} type="email" value={regEmail}
                      onChange={e => handleRegEmailChange(e.target.value)}
                      placeholder="you@example.com" hasError={!!regErrors.email || emailValid === false} autoComplete="email" />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      {emailChecking && <Loader2 size={14} className="animate-spin" style={{ color: "#94a3b8" }} />}
                      {!emailChecking && emailValid === true  && validateEmail(regEmail) && <CheckCircle size={14} style={{ color: "#16a34a" }} />}
                      {!emailChecking && emailValid === false && validateEmail(regEmail) && <AlertCircle size={14} style={{ color: "#dc2626" }} />}
                    </div>
                  </div>
                </FieldWrap>

                <FieldWrap label={
                  <span>{t("ফোন","Phone")} <span className="text-slate-300 font-normal text-[10.5px] normal-case tracking-normal">({t("ঐচ্ছিক","optional")})</span></span>
                }>
                  <InputField icon={Phone} type="tel" value={regPhone}
                    onChange={e => setRegPhone(e.target.value)} placeholder="01XXXXXXXXX" autoComplete="tel" />
                </FieldWrap>

                <FieldWrap label={t("পাসওয়ার্ড","Password")} error={regErrors.password}>
                  <InputField icon={Lock} type={showRegPass ? "text" : "password"} value={regPass}
                    onChange={e => { setRegPass(e.target.value); setRegErrors(p => ({...p, password:""})); }}
                    placeholder={t("কমপক্ষে ৬ অক্ষর","At least 6 characters")} hasError={!!regErrors.password}
                    rightEl={<EyeToggle show={showRegPass} onToggle={() => setShowRegPass(s => !s)} />} />
                </FieldWrap>

                <FieldWrap label={t("পাসওয়ার্ড নিশ্চিত","Confirm Password")} error={regErrors.confirm}>
                  <InputField icon={Lock} type="password" value={regConfirm}
                    onChange={e => { setRegConfirm(e.target.value); setRegErrors(p => ({...p, confirm:""})); }}
                    placeholder="••••••••" hasError={!!regErrors.confirm} />
                </FieldWrap>

                <SubmitBtn loading={loading}>
                  {loading
                    ? <><Loader2 size={15} className="animate-spin" />{t("তৈরি হচ্ছে…","Creating…")}</>
                    : t("অ্যাকাউন্ট তৈরি করুন","Create Account")}
                </SubmitBtn>

                <Divider label={t("অথবা","or")} />
                <SocialButtons t={t} />
              </motion.form>
            )}

            {/* ══ FORGOT EMAIL ══ */}
            {mode === "forgot-email" && (
              <motion.form key="fe" variants={slide} initial="hidden" animate="show" exit="exit"
                onSubmit={handleSendForgotOtp} className="space-y-5">
                <button type="button" onClick={() => go("login")}
                  className="flex items-center gap-1.5 text-[12.5px] font-semibold cursor-pointer bg-transparent border-none mb-2 transition-colors"
                  style={{ color: "#94a3b8" }}>
                  <ArrowLeft size={14} />{t("সাইন ইনে ফিরুন","Back to Sign In")}
                </button>

                <div>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: "linear-gradient(135deg, rgba(26,46,26,0.08), rgba(46,125,50,0.12))" }}>
                    <KeyRound size={22} style={{ color: "#2e7d32" }} />
                  </div>
                  <h2 className="text-[22px] font-black text-slate-800 tracking-tight">{t("পাসওয়ার্ড রিসেট","Reset Password")}</h2>
                  <p className="text-[13px] text-slate-400 mt-1 font-medium">{t("ইমেইলে OTP পাঠানো হবে","We'll send a recovery code to your email")}</p>
                </div>

                <FieldWrap label={t("আপনার ইমেইল","Your Email")}>
                  <InputField icon={Mail} type="email" value={forgotEmail}
                    onChange={e => { setForgotEmail(e.target.value); clear(); }}
                    placeholder="you@example.com" autoComplete="email" />
                </FieldWrap>

                <SubmitBtn loading={loading}>
                  {loading
                    ? <><Loader2 size={15} className="animate-spin" />{t("পাঠানো হচ্ছে…","Sending…")}</>
                    : t("OTP পাঠান","Send OTP")}
                </SubmitBtn>
              </motion.form>
            )}

            {/* ══ OTP VERIFY ══ */}
            {mode === "otp-forgot" && (
              <motion.form key="otp" variants={slide} initial="hidden" animate="show" exit="exit"
                onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: "linear-gradient(135deg, rgba(26,46,26,0.08), rgba(46,125,50,0.12))" }}>
                    <Mail size={22} style={{ color: "#2e7d32" }} />
                  </div>
                  <h2 className="text-[22px] font-black text-slate-800 tracking-tight">{t("কোড যাচাই","Verify Code")}</h2>
                  <div className="flex items-center gap-2 mt-2 px-3 py-2.5 rounded-xl"
                    style={{ background: "rgba(46,125,50,0.06)", border: "1px solid rgba(46,125,50,0.15)" }}>
                    <Mail size={13} style={{ color: "#2e7d32" }} />
                    <span className="text-[12.5px] font-semibold" style={{ color: "#1a3a1a" }}>{forgotEmail}</span>
                  </div>
                </div>

                <FieldWrap label={t("৬ সংখ্যার কোড","6-Digit Code")}>
                  <OtpInputs otp={otp} onChange={handleOtpChange} onKey={handleOtpKey} onPaste={handleOtpPaste} refs={otpRefs} />
                </FieldWrap>

                <div className="flex justify-between items-center">
                  <span className="text-[12.5px] font-semibold tabular-nums"
                    style={{ color: otpTimer > 0 ? "#64748b" : "#dc2626" }}>
                    {otpTimer > 0 ? `⏱ ${fmt(otpTimer)} ${t("বাকি","remaining")}` : t("মেয়াদ শেষ","Code expired")}
                  </span>
                  <button type="button" onClick={handleResend} disabled={otpTimer > 0 || resendCount >= 3}
                    className="text-[12.5px] font-bold cursor-pointer bg-transparent border-none transition-colors"
                    style={{ color: otpTimer > 0 || resendCount >= 3 ? "#cbd5e1" : "#2e7d32" }}>
                    {resendCount >= 3 ? t("সর্বোচ্চ চেষ্টা","Max resends") : t("আবার পাঠান","Resend")}
                  </button>
                </div>

                <SubmitBtn loading={loading} disabled={otp.join("").length < 6}>
                  {loading
                    ? <><Loader2 size={15} className="animate-spin" />{t("যাচাই হচ্ছে…","Verifying…")}</>
                    : t("যাচাই করুন","Verify")}
                </SubmitBtn>

                <button type="button" onClick={() => go("forgot-email")}
                  className="w-full text-[12.5px] font-semibold cursor-pointer bg-transparent border-none transition-colors text-center"
                  style={{ color: "#94a3b8" }}>
                  ← {t("পিছনে","Back")}
                </button>
              </motion.form>
            )}

            {/* ══ NEW PASSWORD ══ */}
            {mode === "forgot-newpass" && (
              <motion.form key="np" variants={slide} initial="hidden" animate="show" exit="exit"
                onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: "linear-gradient(135deg, rgba(26,46,26,0.08), rgba(46,125,50,0.12))" }}>
                    <Lock size={22} style={{ color: "#2e7d32" }} />
                  </div>
                  <h2 className="text-[22px] font-black text-slate-800 tracking-tight">{t("নতুন পাসওয়ার্ড","New Password")}</h2>
                  <p className="text-[13px] text-slate-400 mt-1 font-medium">{t("শক্তিশালী পাসওয়ার্ড বেছে নিন","Choose a strong password")}</p>
                </div>

                <FieldWrap label={t("নতুন পাসওয়ার্ড","New Password")}>
                  <InputField icon={Lock} type={showNewPass ? "text" : "password"} value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); clear(); }}
                    placeholder={t("কমপক্ষে ৬ অক্ষর","At least 6 characters")}
                    rightEl={<EyeToggle show={showNewPass} onToggle={() => setShowNewPass(s => !s)} />} />
                </FieldWrap>

                <FieldWrap label={t("পাসওয়ার্ড নিশ্চিত","Confirm Password")}>
                  <InputField icon={Lock} type="password" value={confirmNewPass}
                    onChange={e => { setConfirmNewPass(e.target.value); clear(); }}
                    placeholder="••••••••" />
                </FieldWrap>

                <SubmitBtn loading={loading}>
                  {loading
                    ? <><Loader2 size={15} className="animate-spin" />{t("সেভ হচ্ছে…","Saving…")}</>
                    : t("পাসওয়ার্ড সেট করুন","Set Password")}
                </SubmitBtn>
              </motion.form>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PROFILE SIDEBAR (Desktop)
   শুধু renderContent() আপডেট করা হয়েছে —
   প্রতিটা tab click এ sidebar এর সাদা অংশে
   সেই related content দেখাবে।
══════════════════════════════════════════ */
function ProfileSidebar({ customer, onClose, t }) {
  const [activeTab, setActiveTab] = useState("info");
  const [loading,   setLoading  ] = useState(false);
  const [msg,       setMsg      ] = useState({ type: "", text: "" });

  // Change password state
  const [curPass,  setCurPass ] = useState("");
  const [newPass,  setNewPass ] = useState("");
  const [confPass, setConfPass] = useState("");
  const [showCur,  setShowCur ] = useState(false);
  const [showNew,  setShowNew ] = useState(false);

  const navigate = useNavigate();

  const tabs = [
    { id: "info",     icon: Info,       label: t("আমার তথ্য","My Info")        },
    { id: "orders",   icon: Package,    label: t("অর্ডারস","Orders")           },
    { id: "wishlist", icon: Heart,      label: t("উইশলিস্ট","Wishlist")        },
    { id: "address",  icon: MapPin,     label: t("ঠিকানা","Address")           },
    { id: "password", icon: Shield,     label: t("পাসওয়ার্ড","Password")       },
    { id: "faq",      icon: HelpCircle, label: t("FAQs","FAQs")                },
  ];

  const handleLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerInfo");
    notify();
    onClose();
    navigate("/");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!curPass || !newPass || !confPass) { setMsg({ type:"error", text: t("সব ঘর পূরণ করুন","Fill all fields") }); return; }
    if (newPass.length < 6)               { setMsg({ type:"error", text: t("কমপক্ষে ৬ অক্ষর","Min. 6 characters") }); return; }
    if (newPass !== confPass)             { setMsg({ type:"error", text: t("পাসওয়ার্ড মেলেনি","Passwords don't match") }); return; }
    try {
      setLoading(true); setMsg({ type:"", text:"" });
      const token = localStorage.getItem("customerToken");
      const res   = await fetch(`${API}/api/customer/change-password`, {
        method:"PUT", headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
        body: JSON.stringify({ currentPassword: curPass, newPassword: newPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMsg({ type:"success", text: t("পাসওয়ার্ড পরিবর্তন হয়েছে!","Password updated!") });
      setCurPass(""); setNewPass(""); setConfPass("");
    } catch (err) { setMsg({ type:"error", text: err.message }); }
    finally { setLoading(false); }
  };

  const joinDate = customer?.createdAt
    ? new Date(customer.createdAt).toLocaleDateString("en-GB", { year:"numeric", month:"long", day:"numeric" })
    : null;

  const ordersLink = customer?.phone
    ? `/order?phone=${encodeURIComponent(customer.phone)}`
    : `/order?email=${encodeURIComponent(customer?.email || "")}`;

  /* ── UPDATED renderContent ──
     প্রতিটা tab এর content এখন sidebar এর
     সাদা অংশেই দেখায়, navigate করে না।     */
  const renderContent = () => {
    switch (activeTab) {
      case "info":
        return (
          <div className="space-y-4">
            <h3 className="text-[16px] font-black text-slate-800">{t("অ্যাকাউন্ট তথ্য","Account Information")}</h3>
            {[
              { label: t("নাম","Name"),      value: customer?.name,    icon: User  },
              { label: t("ইমেইল","Email"),   value: customer?.email,   icon: Mail  },
              { label: t("ফোন","Phone"),     value: customer?.phone || t("যোগ করা হয়নি","Not added"), icon: Phone },
              ...(joinDate ? [{ label: t("সদস্য হয়েছেন","Member since"), value: joinDate, icon: Info }] : []),
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-start gap-3 p-3.5 rounded-xl"
                style={{ background: "rgba(248,250,252,0.8)", border: "1px solid rgba(148,163,184,0.12)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(46,125,50,0.08)" }}>
                  <Icon size={14} style={{ color: "#2e7d32" }} />
                </div>
                <div>
                  <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                  <p className="text-[14px] font-semibold text-slate-700 mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case "orders":
        return <OrdersPanel customer={customer} t={t} />;


      case "wishlist":
        return <WishlistPanel t={t} />;


      case "address":
        return (
          <div className="space-y-4">
            <h3 className="text-[16px] font-black text-slate-800">{t("ঠিকানা ম্যানেজ","Manage Address")}</h3>
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(230,81,0,0.06)" }}>
                <MapPin size={26} style={{ color: "#e65100" }} />
              </div>
              <p className="text-[14px] font-bold text-slate-600">{t("ডেলিভারি ঠিকানা","Delivery Address")}</p>
              <p className="text-[12.5px] text-slate-400">{t("শীঘ্রই আসছে","Coming soon")}</p>
            </div>
          </div>
        );

      case "password":
        return (
          <div className="space-y-4">
            <h3 className="text-[16px] font-black text-slate-800">{t("পাসওয়ার্ড পরিবর্তন","Change Password")}</h3>
            <AnimatePresence>
              {msg.text && <InlineAlert type={msg.type} msg={msg.text} />}
            </AnimatePresence>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <FieldWrap label={t("বর্তমান পাসওয়ার্ড","Current Password")}>
                <InputField icon={Lock} type={showCur ? "text" : "password"} value={curPass}
                  onChange={e => setCurPass(e.target.value)} placeholder="••••••••"
                  rightEl={<EyeToggle show={showCur} onToggle={() => setShowCur(s => !s)} />} />
              </FieldWrap>
              <FieldWrap label={t("নতুন পাসওয়ার্ড","New Password")}>
                <InputField icon={Lock} type={showNew ? "text" : "password"} value={newPass}
                  onChange={e => setNewPass(e.target.value)} placeholder={t("কমপক্ষে ৬ অক্ষর","At least 6 characters")}
                  rightEl={<EyeToggle show={showNew} onToggle={() => setShowNew(s => !s)} />} />
              </FieldWrap>
              <FieldWrap label={t("পাসওয়ার্ড নিশ্চিত","Confirm Password")}>
                <InputField icon={Lock} type="password" value={confPass}
                  onChange={e => setConfPass(e.target.value)} placeholder="••••••••" />
              </FieldWrap>
              <SubmitBtn loading={loading}>
                {loading
                  ? <><Loader2 size={14} className="animate-spin" />{t("আপডেট হচ্ছে…","Updating…")}</>
                  : t("পাসওয়ার্ড আপডেট করুন","Update Password")}
              </SubmitBtn>
            </form>
          </div>
        );

      case "faq":
        return <FaqPanel t={t} />;


      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
        onClick={onClose} />

      {/* Sidebar panel */}
      <motion.div key="panel"
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1, transition: { duration: 0.32, ease: [0.22,1,0.36,1] } }}
        exit={{ x: "100%", opacity: 0, transition: { duration: 0.24, ease: [0.4,0,1,1] } }}
        className="fixed right-0 top-0 h-full z-50 flex"
        style={{ width: "520px" }}>

        {/* Sidebar nav */}
        <div className="w-[180px] flex flex-col shrink-0 h-full"
          style={{ background: "linear-gradient(180deg, #1a2e1a 0%, #1e3620 100%)" }}>

          {/* Logo area */}
          <div className="px-4 py-5 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.12)" }}>
                <ShoppingBag size={14} color="#a5d6a7" />
              </div>
              <div>
                <p className="text-white text-[12px] font-black">Nahid</p>
                <p className="text-white/40 text-[10px]">Account</p>
              </div>
            </div>
          </div>

          {/* Avatar */}
          <div className="px-4 py-5 border-b border-white/10">
            <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center text-white text-[18px] font-black mb-2.5"
              style={{ background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.15)" }}>
              {customer?.avatar
                ? <img src={customer.avatar} alt="" className="w-full h-full object-cover" />
                : (customer?.name?.[0] || "U").toUpperCase()}
            </div>
            <p className="text-white text-[12.5px] font-bold truncate leading-tight">{customer?.name}</p>
            <p className="text-white/40 text-[10.5px] truncate mt-0.5">{customer?.email}</p>
          </div>

          {/* Nav links */}
          <div className="flex-1 py-3 overflow-y-auto">
            {tabs.map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-left transition-all border-none cursor-pointer relative"
                style={{
                  background: activeTab === id ? "rgba(255,255,255,0.1)" : "transparent",
                  color: activeTab === id ? "#a5d6a7" : "rgba(255,255,255,0.45)",
                }}>
                {activeTab === id && (
                  <motion.div layoutId="sidebar-tab"
                    className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full"
                    style={{ background: "#4caf50" }} />
                )}
                <Icon size={15} />
                <span className="text-[12px] font-semibold">{label}</span>
              </button>
            ))}
          </div>

          {/* Logout */}
          <div className="px-3 py-4 border-t border-white/10">
            <button onClick={handleLogout}
              className="w-full flex items-center gap-2 py-2.5 px-3 rounded-xl text-[12px] font-bold cursor-pointer border-none transition-all"
              style={{ background: "rgba(220,38,38,0.15)", color: "#f87171" }}>
              <LogOut size={14} />
              {t("সাইন আউট","Sign Out")}
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 h-full overflow-y-auto bg-white relative">
          {/* Close button */}
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer border-none transition-all z-10"
            style={{ background: "rgba(148,163,184,0.1)", color: "#94a3b8" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          <div className="p-7 pt-8">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ══════════════════════════════════════════
   STATUS CONFIG — OrderPage এর মতো
══════════════════════════════════════════ */
const STATUS_CFG = {
  pending:    { label:"অপেক্ষমাণ",  color:"#d97706", bg:"#fffbeb", border:"#fde68a" },
  processing: { label:"প্যাকেজিং",  color:"#7c3aed", bg:"#f5f3ff", border:"#ddd6fe" },
  shipped:    { label:"পথে আছে",    color:"#1d4ed8", bg:"#eff6ff", border:"#bfdbfe" },
  confirmed:  { label:"নিশ্চিত",    color:"#0284c7", bg:"#f0f9ff", border:"#bae6fd" },
  delivered:  { label:"পৌঁছে গেছে",color:"#059669", bg:"#ecfdf5", border:"#a7f3d0" },
  cancelled:  { label:"বাতিল",      color:"#dc2626", bg:"#fff1f2", border:"#fecdd3" },
};
const getStatusCfg = (s) => STATUS_CFG[s?.toLowerCase()] || { label: s || "—", color:"#64748b", bg:"#f8fafc", border:"#e2e8f0" };
const STEPS_LIST   = ["pending","processing","shipped","confirmed","delivered"];

/* ── Mini Timeline for sidebar ── */
function MiniTimeline({ status }) {
  if (status === "cancelled") return null;
  const cfg     = getStatusCfg(status);
  const current = STEPS_LIST.indexOf(status);
  const pct     = current <= 0 ? 0 : (current / (STEPS_LIST.length - 1)) * 100;
  return (
    <div className="relative mt-3 mb-1 px-1">
      <div className="absolute top-[7px] left-1 right-1 h-[2px] rounded-full" style={{ background: "#f1f5f9" }}/>
      <motion.div className="absolute top-[7px] left-1 h-[2px] rounded-full"
        style={{ background: cfg.color }}
        initial={{ width: "0%" }} animate={{ width: pct > 0 ? `${pct}%` : "0%" }}
        transition={{ duration: 0.8, ease: "easeOut" }}/>
      <div className="relative flex justify-between">
        {STEPS_LIST.map((s, i) => {
          const done = i <= current;
          const active = i === current;
          return (
            <div key={s} className="flex flex-col items-center gap-1">
              <div className="w-[14px] h-[14px] rounded-full z-10 flex items-center justify-center"
                style={{
                  background: done ? (active ? cfg.color : "#10b981") : "#e2e8f0",
                  border: `2px solid ${done ? (active ? cfg.color : "#10b981") : "#e2e8f0"}`,
                  boxShadow: active ? `0 0 0 3px ${cfg.color}33` : "none",
                }}>
                {done && <div className="w-[4px] h-[4px] rounded-full bg-white"/>}
              </div>
              <p className="text-[8px] font-bold leading-tight text-center" style={{ color: done ? (active ? cfg.color : "#10b981") : "#cbd5e1", maxWidth: "32px" }}>
                {STATUS_CFG[s]?.label || s}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ORDERS PANEL — OrderPage style
══════════════════════════════════════════ */
function OrdersPanel({ customer, t }) {
  const [orders,   setOrders  ] = useState([]);
  const [loading,  setLoading ] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const phone = customer?.phone;
        const email = customer?.email;
        const query = phone
          ? `phone=${encodeURIComponent(phone)}`
          : `email=${encodeURIComponent(email || "")}`;
        const res  = await fetch(`${API}/api/orders/track?${query}`);
        const json = await res.json();
        const list = json.success
          ? json.data
          : (Array.isArray(json) ? json : (json.orders || json.data || []));
        setOrders(list);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [customer]);

  return (
    <div className="space-y-4">
      <h3 className="text-[16px] font-black text-slate-800">{t("আমার অর্ডারস","My Orders")}</h3>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-slate-100 border-t-emerald-500 rounded-full animate-spin"/>
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
          <div className="text-4xl mb-2">📦</div>
          <p className="text-[14px] font-bold text-slate-600">{t("কোনো অর্ডার নেই","No orders yet")}</p>
          <p className="text-[12px] text-slate-400">{t("এখনো কোনো অর্ডার করা হয়নি","You haven't placed any orders yet")}</p>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order, i) => {
            const cfg      = getStatusCfg(order.status);
            const isOpen   = expanded === i;
            const date     = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })
              : "—";
            const qty      = order.items?.reduce((s, x) => s + (x.quantity || 1), 0) || 0;
            const isCancelled = order.status === "cancelled";

            return (
              <div key={order._id || i} className="rounded-2xl overflow-hidden"
                style={{ border: `1px solid ${cfg.border}`, background: isCancelled ? "linear-gradient(135deg,#1a0a0a,#2d0f0f)" : "#fff" }}>
                {/* top color bar */}
                <div className="h-[3px]" style={{ background: `linear-gradient(90deg,${cfg.color},${cfg.color}88)` }}/>

                {/* header row */}
                <div className="flex items-start justify-between gap-2 px-4 py-3 cursor-pointer"
                  onClick={() => setExpanded(isOpen ? null : i)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-[13px] font-bold truncate" style={{ color: isCancelled ? "#fff" : "#1e293b" }}>
                        {order.orderId || `#${String(order._id).slice(-6).toUpperCase()}`}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: isCancelled ? "rgba(239,68,68,0.2)" : cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-[11px]" style={{ color: isCancelled ? "rgba(255,255,255,0.4)" : "#94a3b8" }}>
                      {date} · {qty} {t("টি পণ্য","items")}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[15px] font-black" style={{ color: isCancelled ? "#fff" : "#0f172a" }}>
                      ৳{(order.total || 0).toLocaleString()}
                    </p>
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.22 }}
                      className="w-5 h-5 rounded-lg flex items-center justify-center ml-auto mt-1"
                      style={{ background: isCancelled ? "rgba(255,255,255,0.1)" : "#f1f5f9" }}>
                      <ChevronDown size={12} style={{ color: isCancelled ? "rgba(255,255,255,0.5)" : "#94a3b8" }}/>
                    </motion.div>
                  </div>
                </div>

                {/* timeline — only for non-cancelled */}
                {!isCancelled && <div className="px-4 pb-2"><MiniTimeline status={order.status}/></div>}

                {/* delivered banner */}
                {order.status === "delivered" && (
                  <div className="mx-4 mb-3 px-3 py-2 rounded-xl flex items-center gap-2"
                    style={{ background: "#ecfdf5", border: "1px solid #a7f3d0" }}>
                    <CheckCircle size={12} className="text-emerald-500 flex-shrink-0"/>
                    <p className="text-[11px] font-semibold text-emerald-700">{t("🎉 অর্ডার সফলভাবে পৌঁছে গেছে!","🎉 Order delivered successfully!")}</p>
                  </div>
                )}

                {/* expanded detail */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                      <div className="px-4 pb-4 pt-1 space-y-3"
                        style={{ borderTop: `1px solid ${isCancelled ? "rgba(255,255,255,0.06)" : "#f1f5f9"}` }}>

                        {/* items */}
                        {order.items?.length > 0 && (
                          <div className="space-y-2 pt-2">
                            {order.items.map((item, j) => (
                              <div key={j} className="flex items-center gap-2.5 p-2.5 rounded-xl"
                                style={{ background: isCancelled ? "rgba(255,255,255,0.05)" : "#f8fafc", border: `1px solid ${isCancelled ? "rgba(255,255,255,0.08)" : "#f1f5f9"}` }}>
                                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"
                                  style={{ background: isCancelled ? "rgba(255,255,255,0.1)" : "#fff", border: `1px solid ${isCancelled ? "rgba(255,255,255,0.1)" : "#e2e8f0"}` }}>
                                  {item.image
                                    ? <img src={item.image} alt={item.name} className="w-full h-full object-contain p-0.5"/>
                                    : <div className="w-full h-full flex items-center justify-center"><Package size={12} style={{ color: isCancelled ? "rgba(255,255,255,0.2)" : "#e2e8f0" }}/></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[12px] font-semibold truncate" style={{ color: isCancelled ? "rgba(255,255,255,0.75)" : "#334155" }}>{item.name}</p>
                                  <p className="text-[10.5px]" style={{ color: isCancelled ? "rgba(255,255,255,0.35)" : "#94a3b8" }}>
                                    ৳{(item.salePrice || item.price || 0).toLocaleString()} × {item.quantity}
                                  </p>
                                </div>
                                <p className="text-[12px] font-bold flex-shrink-0" style={{ color: isCancelled ? "rgba(255,255,255,0.6)" : "#0f172a" }}>
                                  ৳{((item.salePrice || item.price || 0) * (item.quantity || 1)).toLocaleString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* price summary */}
                        <div className="rounded-xl p-3 space-y-1.5"
                          style={{ background: isCancelled ? "rgba(255,255,255,0.04)" : "#f8fafc", border: `1px solid ${isCancelled ? "rgba(255,255,255,0.06)" : "#f1f5f9"}` }}>
                          <div className="flex justify-between text-[11px]" style={{ color: isCancelled ? "rgba(255,255,255,0.4)" : "#94a3b8" }}>
                            <span>{t("সাবটোটাল","Subtotal")}</span>
                            <span>৳{(order.subtotal || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-[11px]" style={{ color: isCancelled ? "rgba(255,255,255,0.4)" : "#94a3b8" }}>
                            <span>{t("ডেলিভারি","Delivery")}</span>
                            <span style={{ color: order.deliveryCharge === 0 ? "#059669" : undefined }}>
                              {order.deliveryCharge === 0 ? t("বিনামূল্যে","Free") : `৳${order.deliveryCharge}`}
                            </span>
                          </div>
                          <div className="h-px" style={{ background: isCancelled ? "rgba(255,255,255,0.06)" : "#e2e8f0" }}/>
                          <div className="flex justify-between text-[13px] font-bold" style={{ color: isCancelled ? "rgba(255,255,255,0.7)" : "#0f172a" }}>
                            <span>{t("সর্বমোট","Total")}</span>
                            <span>৳{(order.total || 0).toLocaleString()}</span>
                          </div>
                        </div>

                        {/* delivery info */}
                        {order.customer && (
                          <div className="rounded-xl p-3 space-y-1"
                            style={{ background: isCancelled ? "rgba(255,255,255,0.04)" : "#f8fafc", border: `1px solid ${isCancelled ? "rgba(255,255,255,0.06)" : "#f1f5f9"}` }}>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: isCancelled ? "rgba(255,255,255,0.25)" : "#cbd5e1" }}>{t("ডেলিভারি","Delivery")}</p>
                            <p className="text-[12px] font-semibold" style={{ color: isCancelled ? "rgba(255,255,255,0.7)" : "#334155" }}>{order.customer.name}</p>
                            <p className="text-[11px]" style={{ color: isCancelled ? "rgba(255,255,255,0.4)" : "#94a3b8" }}>{order.customer.phone}</p>
                            <p className="text-[11px]" style={{ color: isCancelled ? "rgba(255,255,255,0.4)" : "#94a3b8" }}>
                              {[order.customer.address, order.customer.thana, order.customer.district].filter(Boolean).join(", ")}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   WISHLIST PANEL — পণ্য card style
══════════════════════════════════════════ */
function WishlistPanel({ t }) {
  const [items,   setItems  ] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem("customerToken");
        const res   = await fetch(`${API}/api/customer/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setItems(data.wishlist || []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-[16px] font-black text-slate-800">{t("উইশলিস্ট","Wishlist")}</h3>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-slate-100 border-t-red-400 rounded-full animate-spin"/>
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
          <div className="text-4xl mb-2">🤍</div>
          <p className="text-[14px] font-bold text-slate-600">{t("উইশলিস্ট খালি","Wishlist is empty")}</p>
          <p className="text-[12px] text-slate-400">{t("পছন্দের পণ্য সেভ করুন","Save your favourite products")}</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="space-y-2.5">
          {items.map((item, i) => (
            <Link key={item._id || i} to={`/product/${item.slug || item._id}`}
              className="no-underline block group">
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 p-3 rounded-2xl transition-all"
                style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#a7f3d0"; e.currentTarget.style.background = "#f0fdf4"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; }}>

                {/* Image */}
                <div className="w-[52px] h-[52px] rounded-xl overflow-hidden flex-shrink-0 bg-white"
                  style={{ border: "1.5px solid #e2e8f0" }}>
                  {item.image
                    ? <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1"/>
                    : <div className="w-full h-full flex items-center justify-center">
                        <Package size={18} className="text-slate-200"/>
                      </div>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-slate-800 truncate leading-snug group-hover:text-emerald-700 transition-colors">
                    {item.name || t("পণ্য","Product")}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {item.price && item.salePrice && item.salePrice < item.price && (
                      <span className="text-[11px] text-slate-400 line-through">৳{item.price.toLocaleString()}</span>
                    )}
                    <span className="text-[13px] font-black" style={{ color: "#059669" }}>
                      ৳{(item.salePrice || item.price || 0).toLocaleString()}
                    </span>
                    {item.price && item.salePrice && item.salePrice < item.price && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-50 text-red-500">
                        -{Math.round((1 - item.salePrice / item.price) * 100)}%
                      </span>
                    )}
                  </div>
                  {item.stock === 0 && (
                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                      {t("স্টক নেই","Out of Stock")}
                    </span>
                  )}
                </div>

                {/* Arrow */}
                <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ background: "#ecfdf5", border: "1px solid #a7f3d0" }}>
                  <ChevronRight size={13} style={{ color: "#059669" }}/>
                </div>
              </motion.div>
            </Link>
          ))}
          <p className="text-[11px] text-slate-400 text-center pt-1">
            {items.length} {t("টি পণ্য সেভ করা","items saved")}
          </p>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   FAQ PANEL — PolicyPage এর exact design ও data
══════════════════════════════════════════ */
const FAQ_SECTIONS = [
  {
    tag: "০১",
    titleBn: "অর্ডার সংক্রান্ত প্রশ্ন", titleEn: "Order Related Questions",
    faqs: [
      { qBn:"কীভাবে অর্ডার করবো?", qEn:"How do I place an order?",
        aBn:"পছন্দের পণ্য কার্টে যোগ করুন, তারপর চেকআউট পেজে গিয়ে আপনার নাম, ফোন নম্বর ও ঠিকানা দিন। পেমেন্ট পদ্ধতি বেছে নিন এবং অর্ডার কনফার্ম করুন। অর্ডার সফল হলে একটি অর্ডার আইডি পাবেন।",
        aEn:"Add your preferred product to the cart, then go to checkout and enter your name, phone number and address. Choose a payment method and confirm the order. Upon successful order, you will receive an order ID." },
      { qBn:"অর্ডার কীভাবে ট্র্যাক করবো?", qEn:"How do I track my order?",
        aBn:"অর্ডার ট্র্যাক পেজে (/order) যান এবং অর্ডার করার সময় যে ফোন নম্বর দিয়েছিলেন সেটি দিন। আপনার সব অর্ডারের সর্বশেষ অবস্থা দেখতে পাবেন।",
        aEn:"Go to the Order Track page (/order) and enter the phone number you used when placing the order. You will see the latest status of all your orders." },
      { qBn:"অর্ডার বাতিল করা যাবে?", qEn:"Can I cancel my order?",
        aBn:"হ্যাঁ, অর্ডার Pending বা Processing অবস্থায় থাকলে বাতিল করা সম্ভব। এর জন্য হেল্পলাইনে যোগাযোগ করুন। Shipped অবস্থায় পৌঁছালে বাতিল করা সম্ভব নাও হতে পারে।",
        aEn:"Yes, it is possible to cancel if the order is in Pending or Processing status. Contact our helpline for this. It may not be possible to cancel once the order has reached Shipped status." },
      { qBn:"একসাথে কতটি পণ্য অর্ডার করা যাবে?", qEn:"How many products can I order at once?",
        aBn:"একটি অর্ডারে যত খুশি পণ্য যোগ করতে পারবেন। বড় অর্ডারে ডেলিভারি বিনামূল্যে (২৫০০ টাকার উপরে)।",
        aEn:"You can add as many products as you like to a single order. For large orders you get free delivery (above ৳2500)." },
    ],
  },
  {
    tag: "০২",
    titleBn: "পেমেন্ট সংক্রান্ত প্রশ্ন", titleEn: "Payment Related Questions",
    faqs: [
      { qBn:"কোন পেমেন্ট পদ্ধতি ব্যবহার করা যাবে?", qEn:"Which payment methods are available?",
        aBn:"আমরা তিনটি পেমেন্ট পদ্ধতি গ্রহণ করি: bKash, Nagad এবং ক্যাশ অন ডেলিভারি (COD)। মার্চেন্ট নম্বর: 01938360666।",
        aEn:"We accept three payment methods: bKash, Nagad and Cash on Delivery (COD). Merchant number: 01938360666." },
      { qBn:"ট্র্যান্সাকশন আইডি (TrxID) কোথায় পাবো?", qEn:"Where do I find the Transaction ID?",
        aBn:"bKash বা Nagad পেমেন্টের পরে আপনার ফোনে কনফার্মেশন SMS আসবে যেখানে TrxID থাকবে। সাধারণত ৮-১০ অক্ষরের কোড।",
        aEn:"After bKash or Nagad payment, you will receive a confirmation SMS containing the TrxID. It is usually an 8-10 character code." },
      { qBn:"COD অর্ডারে কি অতিরিক্ত চার্জ আছে?", qEn:"Are there extra charges for COD orders?",
        aBn:"না, COD তে কোনো অতিরিক্ত চার্জ নেই। শুধু সাধারণ ডেলিভারি চার্জ প্রযোজ্য (২৫০০ টাকার উপরে বিনামূল্যে, অন্যথায় ৬০ টাকা)।",
        aEn:"No extra charges for COD. Only regular delivery charge applies (free above ৳2500, otherwise ৳60)." },
    ],
  },
  {
    tag: "০৩",
    titleBn: "ডেলিভারি সংক্রান্ত প্রশ্ন", titleEn: "Delivery Related Questions",
    faqs: [
      { qBn:"ডেলিভারি কতদিন লাগে?", qEn:"How long does delivery take?",
        aBn:"ঢাকার মধ্যে ১-২ কার্যদিবস, ঢাকার বাইরে ২-৪ কার্যদিবস। ছুটি বা হরতালে বিলম্ব হতে পারে।",
        aEn:"Within Dhaka 1-2 business days, outside Dhaka 2-4 business days. Delays may occur during holidays or strikes." },
      { qBn:"ডেলিভারি চার্জ কত?", qEn:"What is the delivery charge?",
        aBn:"২৫০০ টাকা বা তার বেশি অর্ডারে বিনামূল্যে। ২৫০০ টাকার কম অর্ডারে মাত্র ৬০ টাকা।",
        aEn:"Free for orders ৳2500 or above. Only ৳60 for orders below ৳2500." },
      { qBn:"কি পুরো বাংলাদেশে ডেলিভারি দেওয়া হয়?", qEn:"Do you deliver all over Bangladesh?",
        aBn:"হ্যাঁ, বাংলাদেশের সকল ৬৪টি জেলায় ডেলিভারি প্রদান করি। দুর্গম এলাকায় কিছুটা বেশি সময় লাগতে পারে।",
        aEn:"Yes, we deliver to all 64 districts of Bangladesh. Remote areas may take slightly longer." },
    ],
  },
  {
    tag: "০৪",
    titleBn: "রিটার্ন ও রিফান্ড", titleEn: "Return & Refund",
    faqs: [
      { qBn:"পণ্য ফেরত দেওয়া যাবে?", qEn:"Can I return a product?",
        aBn:"হ্যাঁ, পণ্য পাওয়ার ৭ দিনের মধ্যে মূল প্যাকেজিংসহ ফেরত দেওয়া যাবে। তবে গ্রাহকের কারণে ক্ষতিগ্রস্ত পণ্য ফেরতযোগ্য নয়।",
        aEn:"Yes, products can be returned within 7 days of receipt with original packaging. However, products damaged by the customer are not returnable." },
      { qBn:"রিফান্ড পেতে কতদিন লাগে?", qEn:"How long does a refund take?",
        aBn:"পণ্য পরিদর্শনের পরে ৩-৫ কার্যদিবসের মধ্যে bKash বা Nagad এ রিফান্ড করা হয়।",
        aEn:"After product inspection, refund is processed within 3-5 business days via bKash or Nagad." },
    ],
  },
];

/* ── PolicyPage FaqItem — exact same design ── */
function SidebarFaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  const accent   = "#d97706"; // FAQ page accent
  const accentBg = "#d9770614";
  return (
    <div className="rounded-2xl overflow-hidden border transition-all duration-200"
      style={{
        borderColor: open ? "#d9770644" : "#f1f5f9",
        background:  open ? accentBg : "#fafafa",
      }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left gap-3"
        type="button">
        <p className="text-sm font-semibold leading-snug" style={{ color: "#1e293b" }}>{q}</p>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
          <ChevronDown size={15} style={{ color: accent }}/>
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }}
            exit={{ height:0, opacity:0 }} transition={{ duration:0.25, ease:[0.4,0,0.2,1] }}>
            <p className="px-4 pb-4 text-sm leading-relaxed"
              style={{ color:"#475569", borderTop:"1px solid #f1f5f9" }}>
              <span className="block pt-3">{a}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FaqPanel({ t }) {
  return (
    <div className="space-y-5">
      <h3 className="text-[16px] font-black text-slate-800">{t("সাধারণ জিজ্ঞাসা","FAQs")}</h3>

      {FAQ_SECTIONS.map((sec, si) => (
        <div key={si} className="rounded-2xl overflow-hidden shadow-sm"
          style={{ background: "#ffffff", border: "1px solid #f1f5f9" }}>
          {/* Section header — PolicyPage style */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-50"
            style={{ background: "#d9770614" }}>
            <span className="text-[10px] font-black uppercase tracking-widest flex-shrink-0"
              style={{ color: "#d9770688" }}>{sec.tag}</span>
            <h4 className="text-sm font-bold text-slate-800">{t(sec.titleBn, sec.titleEn)}</h4>
          </div>
          {/* FAQ items */}
          <div className="px-4 py-4 space-y-2.5">
            {sec.faqs.map((faq, fi) => (
              <SidebarFaqItem key={fi} q={t(faq.qBn, faq.qEn)} a={t(faq.aBn, faq.aEn)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   FAQ ACCORDION ITEM (old — kept for compatibility)
══════════════════════════════════════════ */
function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(148,163,184,0.12)" }}>
      <button onClick={() => setOpen(s => !s)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left cursor-pointer border-none transition-all"
        style={{ background: open ? "rgba(46,125,50,0.04)" : "rgba(248,250,252,0.8)" }}>
        <span className="text-[13.5px] font-bold text-slate-700">{question}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
          <ChevronRight size={14} className="text-slate-400 rotate-90" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-1">
              <p className="text-[13px] text-slate-500 leading-relaxed">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════
   MOBILE SECTION CONTENT
   প্রতিটা card click এ এই component দেখায়
══════════════════════════════════════════ */
function MobileSectionContent({ section, customer, t, onNavigate }) {
  /* ── Info ── */
  if (section === "info") {
    const joinDate = customer?.createdAt
      ? new Date(customer.createdAt).toLocaleDateString("en-GB",{year:"numeric",month:"long",day:"numeric"})
      : null;
    const addr = customer?.address || {};
    const hasAddr = addr.street || addr.thana || addr.district;

    return (
      <div className="space-y-3">
        {[
          { label:t("নাম","Name"),    value:customer?.name,  icon:User  },
          { label:t("ইমেইল","Email"), value:customer?.email, icon:Mail  },
          { label:t("ফোন","Phone"),   value:customer?.phone || t("যোগ করা হয়নি","Not added"), icon:Phone },
          ...(joinDate ? [{label:t("সদস্য","Member since"),value:joinDate,icon:Info}] : []),
        ].map(({label,value,icon:Icon})=>(
          <div key={label} className="flex items-start gap-3 p-3.5 rounded-2xl"
            style={{background:"rgba(248,250,252,0.8)",border:"1px solid rgba(148,163,184,0.12)"}}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{background:"rgba(46,125,50,0.08)"}}>
              <Icon size={14} style={{color:"#2e7d32"}}/>
            </div>
            <div>
              <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
              <p className="text-[14px] font-semibold text-slate-700 mt-0.5">{value}</p>
            </div>
          </div>
        ))}
        {hasAddr && (
          <div className="p-3.5 rounded-2xl" style={{background:"#f0f7f0",border:"1px solid #a5d6a7"}}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{color:"#2e7d32"}}>{t("সেভ করা ঠিকানা","Saved Address")}</p>
            {addr.street && <p className="text-[13px] font-semibold text-slate-700">{addr.street}</p>}
            <p className="text-[12px] text-slate-500 mt-0.5">{[addr.thana,addr.district].filter(Boolean).join(", ")}</p>
            {addr.phone && <p className="text-[12px] text-slate-500 mt-0.5">📞 {addr.phone}</p>}
          </div>
        )}
      </div>
    );
  }

  /* ── Orders ── */
  if (section === "orders") {
    return <MobileOrdersPanel customer={customer} t={t} />;
  }

  /* ── Wishlist ── */
  if (section === "wishlist") {
    return <MobileWishlistPanel t={t} onNavigate={onNavigate} />;
  }

  /* ── Cart ── */
  if (section === "cart") {
    return <MobileCartPanel t={t} onNavigate={onNavigate} />;
  }

  /* ── Address ── */
  if (section === "address") {
    return <MobileAddressPanel customer={customer} t={t} />;
  }

  /* ── Password ── */
  if (section === "password") {
    return <MobilePasswordPanel t={t} />;
  }

  /* ── FAQ ── */
  if (section === "faq") {
    return <MobileFaqPanel t={t} />;
  }

  return null;
}

/* ── Mobile Orders Panel ── */
function MobileOrdersPanel({ customer, t }) {
  const [orders,  setOrders ] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    const q = customer?.phone
      ? `phone=${encodeURIComponent(customer.phone)}`
      : `email=${encodeURIComponent(customer?.email||"")}`;
    fetch(`${API}/api/orders/track?${q}`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r=>r.json())
      .then(json=>setOrders(json.success ? json.data : []))
      .catch(()=>setOrders([]))
      .finally(()=>setLoading(false));
  }, [customer]);

  const STATUS_CFG = {
    pending:    { label:"অপেক্ষমাণ", color:"#d97706", bg:"#fffbeb", border:"#fde68a" },
    processing: { label:"প্যাকেজিং", color:"#7c3aed", bg:"#f5f3ff", border:"#ddd6fe" },
    shipped:    { label:"পথে আছে",   color:"#1d4ed8", bg:"#eff6ff", border:"#bfdbfe" },
    confirmed:  { label:"নিশ্চিত",   color:"#0284c7", bg:"#f0f9ff", border:"#bae6fd" },
    delivered:  { label:"পৌঁছেছে",  color:"#059669", bg:"#ecfdf5", border:"#a7f3d0" },
    cancelled:  { label:"বাতিল",     color:"#dc2626", bg:"#fff1f2", border:"#fecdd3" },
  };

  if (loading) return <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-slate-100 border-t-emerald-500 rounded-full animate-spin"/></div>;
  if (orders.length === 0) return <div className="text-center py-8"><div className="text-3xl mb-2">📦</div><p className="text-[14px] font-bold text-slate-500">{t("কোনো অর্ডার নেই","No orders yet")}</p></div>;

  return (
    <div className="space-y-3">
      {orders.map((order,i) => {
        const cfg = STATUS_CFG[order.status] || { label:order.status, color:"#64748b", bg:"#f8fafc", border:"#e2e8f0" };
        const isOpen = expanded === i;
        const isCancelled = order.status === "cancelled";
        const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—";
        const qty = order.items?.reduce((s,x)=>s+(x.quantity||1),0)||0;
        return (
          <div key={order._id||i} className="rounded-2xl overflow-hidden"
            style={{border:`1px solid ${cfg.border}`,background:isCancelled?"linear-gradient(135deg,#1a0a0a,#2d0f0f)":"#fff"}}>
            <div className="h-[3px]" style={{background:`linear-gradient(90deg,${cfg.color},${cfg.color}88)`}}/>
            <div className="flex items-start justify-between gap-2 px-4 py-3 cursor-pointer"
              onClick={()=>setExpanded(isOpen?null:i)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-[13px] font-bold" style={{color:isCancelled?"#fff":"#1e293b"}}>
                    {order.orderId||`#${String(order._id).slice(-6).toUpperCase()}`}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{background:isCancelled?"rgba(239,68,68,0.2)":cfg.bg,color:cfg.color,border:`1px solid ${cfg.border}`}}>
                    {cfg.label}
                  </span>
                </div>
                <p className="text-[11px]" style={{color:isCancelled?"rgba(255,255,255,0.4)":"#94a3b8"}}>{date} · {qty} {t("টি","items")}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <p className="text-[15px] font-black" style={{color:isCancelled?"#fff":"#0f172a"}}>৳{(order.total||0).toLocaleString()}</p>
                <motion.div animate={{rotate:isOpen?180:0}} transition={{duration:0.22}}>
                  <ChevronDown size={14} style={{color:isCancelled?"rgba(255,255,255,0.5)":"#94a3b8"}}/>
                </motion.div>
              </div>
            </div>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}}
                  exit={{height:0,opacity:0}} transition={{duration:0.25}} className="overflow-hidden">
                  <div className="px-4 pb-4 space-y-2.5" style={{borderTop:`1px solid ${isCancelled?"rgba(255,255,255,0.06)":"#f1f5f9"}`}}>
                    {order.items?.slice(0,3).map((item,j)=>(
                      <div key={j} className="flex items-center gap-2.5 p-2.5 rounded-xl"
                        style={{background:isCancelled?"rgba(255,255,255,0.05)":"#f8fafc"}}>
                        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-white">
                          {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-contain p-0.5"/> : <Package size={12} className="m-auto mt-3 text-slate-200"/>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold truncate" style={{color:isCancelled?"rgba(255,255,255,0.75)":"#334155"}}>{item.name}</p>
                          <p className="text-[10.5px]" style={{color:isCancelled?"rgba(255,255,255,0.35)":"#94a3b8"}}>৳{(item.salePrice||item.price||0).toLocaleString()} × {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between text-[13px] font-black pt-1" style={{color:isCancelled?"rgba(255,255,255,0.7)":"#0f172a"}}>
                      <span>{t("মোট","Total")}</span><span>৳{(order.total||0).toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/* ── Mobile Wishlist Panel ── */
function MobileWishlistPanel({ t, onNavigate }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    fetch(`${API}/api/customer/wishlist`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r=>r.json())
      .then(data=>setItems(data.wishlist||[]))
      .catch(()=>setItems([]))
      .finally(()=>setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-slate-100 border-t-red-400 rounded-full animate-spin"/></div>;
  if (items.length === 0) return <div className="text-center py-8"><div className="text-3xl mb-2">🤍</div><p className="text-[14px] font-bold text-slate-500">{t("উইশলিস্ট খালি","Wishlist is empty")}</p></div>;

  return (
    <div className="space-y-2.5">
      {items.map((item,i) => (
        <motion.div key={item._id||i} whileTap={{scale:0.98}}
          onClick={()=>onNavigate(`/product/${item.slug||item._id}`)}
          className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer"
          style={{background:"#f8fafc",border:"1.5px solid #e2e8f0"}}>
          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-white" style={{border:"1.5px solid #e2e8f0"}}>
            {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1"/> : <Package size={18} className="m-auto mt-4 text-slate-200"/>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-slate-800 truncate">{item.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {item.price&&item.salePrice&&item.salePrice<item.price&&<span className="text-[11px] text-slate-400 line-through">৳{item.price.toLocaleString()}</span>}
              <span className="text-[13px] font-black" style={{color:"#059669"}}>৳{(item.salePrice||item.price||0).toLocaleString()}</span>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-300 shrink-0"/>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Mobile Cart Panel ── */
function MobileCartPanel({ t, onNavigate }) {
  const { cartItems, cartCount, cartSubtotal, cartTotal, deliveryCharge, removeFromCart, updateQuantity } = useCart();

  if (cartItems.length === 0) return <div className="text-center py-8"><div className="text-3xl mb-2">🛒</div><p className="text-[14px] font-bold text-slate-500">{t("কার্ট খালি","Cart is empty")}</p></div>;

  return (
    <div className="space-y-3">
      {cartItems.map((item,i) => (
        <div key={item._id||i} className="flex items-center gap-3 p-3 rounded-2xl"
          style={{background:"#f8fafc",border:"1.5px solid #e2e8f0"}}>
          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-white" style={{border:"1.5px solid #e2e8f0"}}>
            {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1"/> : <Package size={18} className="m-auto mt-4 text-slate-200"/>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-slate-800 truncate">{item.name}</p>
            <p className="text-[13px] font-black mt-0.5" style={{color:"#059669"}}>৳{item.salePrice.toLocaleString()}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex items-center rounded-xl overflow-hidden" style={{border:"1.5px solid #e2e8f0"}}>
                <button onClick={()=>item.quantity===1?removeFromCart(item._id):updateQuantity(item._id,item.quantity-1)}
                  className="w-7 h-7 flex items-center justify-center text-slate-500 bg-white border-none cursor-pointer text-[16px] font-bold">
                  {item.quantity===1?"×":"−"}
                </button>
                <span className="px-2 text-[13px] font-bold text-slate-700 bg-white">{item.quantity}</span>
                <button onClick={()=>updateQuantity(item._id,item.quantity+1)}
                  className="w-7 h-7 flex items-center justify-center text-slate-500 bg-white border-none cursor-pointer text-[16px] font-bold">+</button>
              </div>
              <span className="text-[12px] font-bold text-slate-500">৳{(item.salePrice*item.quantity).toLocaleString()}</span>
            </div>
          </div>
        </div>
      ))}
      <div className="rounded-2xl p-4 space-y-2" style={{background:"#f0f7f0",border:"1px solid #a5d6a7"}}>
        <div className="flex justify-between text-[12px] text-slate-500">
          <span>{t("সাবটোটাল","Subtotal")} ({cartCount})</span><span>৳{cartSubtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-[12px] text-slate-500">
          <span>{t("ডেলিভারি","Delivery")}</span>
          <span style={{color:deliveryCharge===0?"#059669":undefined}}>{deliveryCharge===0?t("বিনামূল্যে","Free"):`৳${deliveryCharge}`}</span>
        </div>
        <div className="h-px" style={{background:"#a5d6a7"}}/>
        <div className="flex justify-between text-[14px] font-black" style={{color:"#1a2e1a"}}>
          <span>{t("মোট","Total")}</span><span>৳{cartTotal.toLocaleString()}</span>
        </div>
      </div>
      <motion.button whileTap={{scale:0.98}} onClick={()=>onNavigate("/checkout")}
        className="w-full py-3.5 rounded-2xl text-[14px] font-black text-white border-none cursor-pointer flex items-center justify-center gap-2"
        style={{background:"linear-gradient(135deg,#1a3a1a,#2e7d32)",boxShadow:"0 4px 20px rgba(46,125,50,0.3)"}}>
        <ShoppingBag size={16}/>{t("চেকআউট করুন","Proceed to Checkout")}
      </motion.button>
    </div>
  );
}

/* ── Mobile Address Panel ── */
function MobileAddressPanel({ customer, t }) {
  const saved = customer?.address || {};
  const [street,   setStreet  ] = useState(saved.street   || "");
  const [district, setDistrict] = useState(saved.district || "");
  const [upazila,  setUpazila ] = useState(saved.thana    || "");
  const [phone,    setPhone   ] = useState(saved.phone    || "");
  const [loading,  setLoading ] = useState(false);
  const [msg,      setMsg     ] = useState({ type:"", text:"" });
  const hasPhone = !!customer?.phone;
  const hasAddress = saved.street || saved.thana || saved.district;

  const districts = Object.keys(BD_LOCATIONS).filter(d=>!d.includes("(alt)"));
  const upazilas  = district ? (BD_LOCATIONS[district]||[]) : [];

  const submit = async (e) => {
    e.preventDefault();
    if (!street)   { setMsg({type:"error",text:t("পুরো ঠিকানা দিন","Enter full address")}); return; }
    if (!district) { setMsg({type:"error",text:t("জেলা বেছে নিন","Select district")}); return; }
    if (!upazila)  { setMsg({type:"error",text:t("উপজেলা বেছে নিন","Select upazila")}); return; }
    try {
      setLoading(true); setMsg({type:"",text:""});
      const token = localStorage.getItem("customerToken");
      const body  = { street, thana:upazila, district };
      if (!hasPhone) body.phone = phone;
      const res  = await fetch(`${API}/api/customer/address`,{
        method:"PUT", headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      const info = JSON.parse(localStorage.getItem("customerInfo")||"{}");
      localStorage.setItem("customerInfo",JSON.stringify({...info,address:data.address}));
      setMsg({type:"success",text:t("ঠিকানা সেভ হয়েছে!","Address saved!")});
    } catch(err) { setMsg({type:"error",text:err.message}); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      {hasAddress && (
        <div className="p-4 rounded-2xl" style={{background:"#f0f7f0",border:"1px solid #a5d6a7"}}>
          <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{color:"#2e7d32"}}>{t("বর্তমান ঠিকানা","Current Address")}</p>
          <p className="text-[13px] font-semibold text-slate-700">{[saved.street,saved.thana,saved.district].filter(Boolean).join(", ")}</p>
          {saved.phone && <p className="text-[11.5px] text-slate-500 mt-1">📞 {saved.phone}</p>}
        </div>
      )}
      <AnimatePresence>{msg.text && <InlineAlert type={msg.type} msg={msg.text}/>}</AnimatePresence>
      <form onSubmit={submit} className="space-y-3">
        <FieldWrap label={t("পুরো ঠিকানা","Full Address")}>
          <InputField icon={MapPin} value={street} onChange={e=>setStreet(e.target.value)} placeholder={t("বাড়ি/রাস্তা নম্বর, এলাকা","House/Road, Area")}/>
        </FieldWrap>
        <div>
          <label className="block text-[11.5px] font-bold text-slate-400 uppercase tracking-[0.08em] mb-1.5">{t("জেলা","District")}</label>
          <div className="relative">
            <select value={district} onChange={e=>{setDistrict(e.target.value);setUpazila("");}}
              className="w-full text-[13.5px] font-medium rounded-2xl outline-none appearance-none cursor-pointer"
              style={{padding:"11px 36px 11px 14px",color:district?"#1e293b":"#94a3b8",border:"1.5px solid rgba(148,163,184,0.3)",background:"rgba(248,250,252,0.8)"}}>
              <option value="">{t("জেলা বেছে নিন","Select district")}</option>
              {districts.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"/>
          </div>
        </div>
        <div>
          <label className="block text-[11.5px] font-bold text-slate-400 uppercase tracking-[0.08em] mb-1.5">{t("উপজেলা / থানা","Upazila")}</label>
          <div className="relative">
            <select value={upazila} onChange={e=>setUpazila(e.target.value)} disabled={!district}
              className="w-full text-[13.5px] font-medium rounded-2xl outline-none appearance-none cursor-pointer disabled:opacity-40"
              style={{padding:"11px 36px 11px 14px",color:upazila?"#1e293b":"#94a3b8",border:"1.5px solid rgba(148,163,184,0.3)",background:"rgba(248,250,252,0.8)"}}>
              <option value="">{district?t("উপজেলা বেছে নিন","Select upazila"):t("আগে জেলা বেছে নিন","Select district first")}</option>
              {upazilas.map(u=><option key={u} value={u}>{u}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"/>
          </div>
        </div>
        {!hasPhone && (
          <FieldWrap label={t("ডেলিভারি ফোন","Delivery Phone")}>
            <InputField icon={Phone} type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="01XXXXXXXXX"/>
          </FieldWrap>
        )}
        <SubmitBtn loading={loading}>
          {loading?<><Loader2 size={14} className="animate-spin"/>{t("সেভ হচ্ছে…","Saving…")}</>:t("ঠিকানা সেভ করুন","Save Address")}
        </SubmitBtn>
      </form>
    </div>
  );
}

/* ── Mobile Password Panel ── */
function MobilePasswordPanel({ t }) {
  const [curPass,  setCurPass ] = useState("");
  const [newPass,  setNewPass ] = useState("");
  const [confPass, setConfPass] = useState("");
  const [showCur,  setShowCur ] = useState(false);
  const [showNew,  setShowNew ] = useState(false);
  const [loading,  setLoading ] = useState(false);
  const [msg,      setMsg     ] = useState({ type:"", text:"" });

  const submit = async (e) => {
    e.preventDefault();
    if (!curPass||!newPass||!confPass) { setMsg({type:"error",text:t("সব ঘর পূরণ করুন","Fill all fields")}); return; }
    if (newPass.length<6)             { setMsg({type:"error",text:t("কমপক্ষে ৬ অক্ষর","Min. 6 characters")}); return; }
    if (newPass!==confPass)           { setMsg({type:"error",text:t("পাসওয়ার্ড মেলেনি","Passwords don't match")}); return; }
    try {
      setLoading(true); setMsg({type:"",text:""});
      const token = localStorage.getItem("customerToken");
      const res   = await fetch(`${API}/api/customer/change-password`,{
        method:"PUT", headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({currentPassword:curPass,newPassword:newPass}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMsg({type:"success",text:t("পাসওয়ার্ড পরিবর্তন হয়েছে!","Password updated!")});
      setCurPass(""); setNewPass(""); setConfPass("");
    } catch(err) { setMsg({type:"error",text:err.message}); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>{msg.text && <InlineAlert type={msg.type} msg={msg.text}/>}</AnimatePresence>
      <form onSubmit={submit} className="space-y-4">
        <FieldWrap label={t("বর্তমান পাসওয়ার্ড","Current Password")}>
          <InputField icon={Lock} type={showCur?"text":"password"} value={curPass} onChange={e=>setCurPass(e.target.value)} placeholder="••••••••"
            rightEl={<EyeToggle show={showCur} onToggle={()=>setShowCur(s=>!s)}/>}/>
        </FieldWrap>
        <FieldWrap label={t("নতুন পাসওয়ার্ড","New Password")}>
          <InputField icon={Lock} type={showNew?"text":"password"} value={newPass} onChange={e=>setNewPass(e.target.value)} placeholder={t("কমপক্ষে ৬ অক্ষর","At least 6 characters")}
            rightEl={<EyeToggle show={showNew} onToggle={()=>setShowNew(s=>!s)}/>}/>
        </FieldWrap>
        <FieldWrap label={t("পাসওয়ার্ড নিশ্চিত","Confirm Password")}>
          <InputField icon={Lock} type="password" value={confPass} onChange={e=>setConfPass(e.target.value)} placeholder="••••••••"/>
        </FieldWrap>
        <SubmitBtn loading={loading}>
          {loading?<><Loader2 size={14} className="animate-spin"/>{t("আপডেট হচ্ছে…","Updating…")}</>:t("পাসওয়ার্ড আপডেট করুন","Update Password")}
        </SubmitBtn>
      </form>
    </div>
  );
}

/* ── Mobile FAQ Panel ── */
const MOBILE_FAQ_SECTIONS = [
  { tag:"০১", titleBn:"অর্ডার সংক্রান্ত", titleEn:"Order Questions",
    faqs:[
      { qBn:"কীভাবে অর্ডার করবো?", qEn:"How do I place an order?", aBn:"পণ্য কার্টে যোগ করুন, চেকআউটে নাম-ফোন-ঠিকানা দিন, পেমেন্ট পদ্ধতি বেছে নিন।", aEn:"Add product to cart, enter details at checkout, choose payment." },
      { qBn:"অর্ডার বাতিল করা যাবে?", qEn:"Can I cancel my order?", aBn:"Pending বা Processing অবস্থায় হেল্পলাইনে যোগাযোগ করলে বাতিল করা সম্ভব।", aEn:"Contact helpline while Pending or Processing to cancel." },
    ],
  },
  { tag:"০২", titleBn:"পেমেন্ট সংক্রান্ত", titleEn:"Payment Questions",
    faqs:[
      { qBn:"কোন পেমেন্ট পদ্ধতি আছে?", qEn:"Payment methods?", aBn:"bKash, Nagad এবং ক্যাশ অন ডেলিভারি। মার্চেন্ট: 01938360666।", aEn:"bKash, Nagad and COD. Merchant: 01938360666." },
      { qBn:"COD তে কি অতিরিক্ত চার্জ?", qEn:"Extra charges for COD?", aBn:"না, COD তে কোনো অতিরিক্ত চার্জ নেই।", aEn:"No extra charges for COD." },
    ],
  },
  { tag:"০৩", titleBn:"ডেলিভারি সংক্রান্ত", titleEn:"Delivery Questions",
    faqs:[
      { qBn:"ডেলিভারি কতদিন লাগে?", qEn:"Delivery time?", aBn:"ঢাকায় ১-২ কার্যদিবস, ঢাকার বাইরে ২-৪ কার্যদিবস।", aEn:"Dhaka: 1-2 days, outside: 2-4 business days." },
      { qBn:"ডেলিভারি চার্জ কত?", qEn:"Delivery charge?", aBn:"২৫০০ টাকার উপরে বিনামূল্যে, অন্যথায় ৬০ টাকা।", aEn:"Free above ৳2500, otherwise ৳60." },
    ],
  },
  { tag:"০৪", titleBn:"রিটার্ন ও রিফান্ড", titleEn:"Return & Refund",
    faqs:[
      { qBn:"পণ্য ফেরত দেওয়া যাবে?", qEn:"Can I return?", aBn:"পাওয়ার ৭ দিনের মধ্যে মূল প্যাকেজিংসহ ফেরত দেওয়া যাবে।", aEn:"Within 7 days with original packaging." },
      { qBn:"রিফান্ড পেতে কতদিন?", qEn:"Refund time?", aBn:"৩-৫ কার্যদিবসের মধ্যে bKash/Nagad এ রিফান্ড।", aEn:"3-5 business days via bKash/Nagad." },
    ],
  },
];

function MobileFaqPanel({ t }) {
  const [openFaq, setOpenFaq] = useState(null);
  return (
    <div className="space-y-4">
      {MOBILE_FAQ_SECTIONS.map((sec,si) => (
        <div key={si} className="rounded-2xl overflow-hidden" style={{border:"1px solid #f1f5f9"}}>
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-50" style={{background:"#d9770614"}}>
            <span className="text-[10px] font-black uppercase tracking-widest" style={{color:"#d9770688"}}>{sec.tag}</span>
            <h4 className="text-[13px] font-bold text-slate-800">{t(sec.titleBn,sec.titleEn)}</h4>
          </div>
          <div className="px-4 py-3 space-y-2">
            {sec.faqs.map((faq,fi) => {
              const key=`${si}-${fi}`; const isOpen=openFaq===key;
              return (
                <div key={fi} className="rounded-xl overflow-hidden border transition-all"
                  style={{borderColor:isOpen?"#d9770644":"#f1f5f9",background:isOpen?"#d9770614":"#fafafa"}}>
                  <button onClick={()=>setOpenFaq(isOpen?null:key)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left gap-3 cursor-pointer border-none bg-transparent" type="button">
                    <p className="text-[13px] font-semibold text-slate-800">{t(faq.qBn,faq.qEn)}</p>
                    <motion.div animate={{rotate:isOpen?180:0}} transition={{duration:0.2}} className="shrink-0">
                      <ChevronDown size={14} style={{color:"#d97706"}}/>
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}}
                        exit={{height:0,opacity:0}} transition={{duration:0.22}}>
                        <p className="px-4 pb-3 text-[13px] text-slate-500 leading-relaxed" style={{borderTop:"1px solid #f1f5f9"}}>
                          <span className="block pt-2">{t(faq.aBn,faq.aEn)}</span>
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   BD_LOCATIONS (for mobile address panel)
   — তোমার ../../data/Bdlocations থেকে import করা হচ্ছে
══════════════════════════════════════════ */
function MobileDashboard({ customer, t }) {
  const navigate  = useNavigate();
  const [activeSection, setActiveSection] = useState(null); // null = dashboard home
  const contentRef = useRef(null);

  const notify2 = () => window.dispatchEvent(new Event("customerAuthChanged"));

  const handleLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerInfo");
    notify2();
    navigate("/");
  };

  const menuItems = [
    { id:"info",     icon: Info,       label: t("অ্যাকাউন্ট ইনফো","Account Info"),  sub: t("প্রোফাইল ও তথ্য","Profile & details"),  iconColor:"#2e7d32", iconBg:"rgba(46,125,50,0.1)"    },
    { id:"orders",   icon: Package,    label: t("মাই অর্ডারস","My Orders"),          sub: t("অর্ডার ট্র্যাক","Track orders"),         iconColor:"#1565c0", iconBg:"rgba(21,101,192,0.1)"   },
    { id:"wishlist", icon: Heart,      label: t("উইশলিস্ট","Wishlist"),             sub: t("সেভ করা পণ্য","Saved items"),             iconColor:"#c62828", iconBg:"rgba(198,40,40,0.08)"   },
    { id:"cart",     icon: ShoppingBag,label: t("আমার কার্ট","My Cart"),            sub: t("কার্টের পণ্য","Cart items"),              iconColor:"#0277bd", iconBg:"rgba(2,119,189,0.1)"    },
    { id:"address",  icon: MapPin,     label: t("ঠিকানা","Address"),               sub: t("ডেলিভারি ঠিকানা","Delivery address"),     iconColor:"#e65100", iconBg:"rgba(230,81,0,0.08)"    },
    { id:"password", icon: Shield,     label: t("পাসওয়ার্ড","Password"),           sub: t("নিরাপত্তা আপডেট","Security update"),      iconColor:"#6a1b9a", iconBg:"rgba(106,27,154,0.08)"  },
    { id:"faq",      icon: HelpCircle, label: t("FAQs","FAQs"),                    sub: t("সাহায্য ও প্রশ্ন","Help & support"),       iconColor:"#00695c", iconBg:"rgba(0,105,92,0.08)"    },
  ];

  const handleCardClick = (id) => {
    setActiveSection(id);
    setTimeout(() => contentRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }), 80);
  };

  const activeItem = menuItems.find(m => m.id === activeSection);

  return (
    <div className="min-h-screen" style={{ background:"#f0f4f0" }}>

      {/* ── Hero ── */}
      <div className="relative" style={{ background:"linear-gradient(160deg,#1a2e1a 0%,#2e7d32 60%,#388e3c 100%)" }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
          style={{ background:"radial-gradient(circle,#a5d6a7,transparent)", transform:"translate(30%,-30%)" }}/>
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10"
          style={{ background:"radial-gradient(circle,#81c784,transparent)", transform:"translate(-20%,20%)" }}/>

        <div className="relative px-5 pt-8 pb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center text-white text-2xl font-black shrink-0 shadow-lg"
              style={{ background:"rgba(255,255,255,0.15)", backdropFilter:"blur(8px)", border:"2px solid rgba(255,255,255,0.25)" }}>
              {customer?.avatar
                ? <img src={customer.avatar} alt="" className="w-full h-full object-cover"/>
                : (customer?.name?.[0]||"U").toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-black text-[19px] leading-tight truncate">{customer?.name}</p>
              <p className="text-white/55 text-[12px] mt-0.5 truncate">{customer?.email}</p>
              {customer?.phone && <p className="text-white/40 text-[11px] mt-0.5">{customer.phone}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Cards grid ── */}
      <div className="px-4 pt-4 pb-6" style={{ background:"#f0f4f0" }}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {menuItems.map(({ id, icon:Icon, label, sub, iconColor, iconBg }) => (
            <motion.button key={id}
              whileTap={{ scale:0.96 }} whileHover={{ scale:1.02 }}
              onClick={() => handleCardClick(id)}
              className="bg-white rounded-2xl p-4 flex flex-col text-left border-none cursor-pointer w-full relative overflow-hidden"
              style={{
                boxShadow: activeSection===id
                  ? `0 0 0 2.5px ${iconColor}, 0 4px 16px rgba(0,0,0,0.1)`
                  : "0 2px 12px rgba(0,0,0,0.06)",
                minHeight:"100px",
              }}>
              {/* active indicator */}
              {activeSection===id && (
                <motion.div layoutId="mobile-active"
                  className="absolute top-0 left-0 right-0 h-[3px]"
                  style={{ background:`linear-gradient(90deg,${iconColor},${iconColor}88)` }}/>
              )}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background:iconBg }}>
                <Icon size={18} style={{ color:iconColor }}/>
              </div>
              <p className="text-[13px] font-black text-slate-800 leading-tight">{label}</p>
              <p className="text-[11px] text-slate-400 mt-1 leading-tight">{sub}</p>
            </motion.button>
          ))}
        </div>

        <motion.button onClick={handleLogout} whileTap={{ scale:0.98 }}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[13.5px] font-bold transition-all mt-3 cursor-pointer border-none"
          style={{ background:"rgba(220,38,38,0.08)", color:"#dc2626", border:"1px solid rgba(220,38,38,0.15)" }}>
          <LogOut size={15}/>{t("সাইন আউট","Sign Out")}
        </motion.button>
      </div>

      {/* ── Inline Content Panel ── */}
      <AnimatePresence mode="wait">
        {activeSection && (
          <motion.div ref={contentRef}
            key={activeSection}
            initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:-8 }} transition={{ duration:0.25 }}
            className="mx-4 mb-8 bg-white rounded-3xl overflow-hidden"
            style={{ boxShadow:"0 4px 24px rgba(0,0,0,0.08)", border:"1px solid rgba(0,0,0,0.04)" }}>

            {/* Panel header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
              {activeItem && (
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background:activeItem.iconBg }}>
                  <activeItem.icon size={16} style={{ color:activeItem.iconColor }}/>
                </div>
              )}
              <h3 className="text-[15px] font-black text-slate-800 flex-1">{activeItem?.label}</h3>
              <button onClick={()=>setActiveSection(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer border-none"
                style={{ background:"rgba(148,163,184,0.1)", color:"#94a3b8" }}>
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Panel content */}
            <div className="p-5">
              <MobileSectionContent
                section={activeSection}
                customer={customer}
                t={t}
                onNavigate={navigate}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
/* ── Desktop এ login হলে home এ redirect ── */
function DesktopRedirect({ navigate }) {
  useEffect(() => {
    // শুধু desktop (lg = 1024px+) এ redirect করো
    if (window.innerWidth < 1024) return;
    const timer = setTimeout(() => navigate("/"), 100);
    return () => clearTimeout(timer);
  }, [navigate]);
  return null;
}

export default function AccountPage() {
  const t = useT();
  const navigate = useNavigate();
  const [customer,     setCustomer    ] = useState(null);
  const [mode,         setMode        ] = useState("login");
  const [showProfile,  setShowProfile ] = useState(false);
  const [authChecked,  setAuthChecked ] = useState(false); // ← loading guard

  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    const info  = localStorage.getItem("customerInfo");
    if (token && info) {
      try { setCustomer(JSON.parse(info)); } catch (_) {}
    }
    setAuthChecked(true); // ← check শেষ
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get("token");
    const info   = params.get("info");
    if (token && info) {
      try {
        const parsed = JSON.parse(decodeURIComponent(info));
        localStorage.setItem("customerToken", token);
        localStorage.setItem("customerInfo", JSON.stringify(parsed));
        setCustomer(parsed);
        notify();
        window.history.replaceState({}, "", "/account");
      } catch (_) {}
    }
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/account/password") setShowProfile(true);
  }, []);

  useEffect(() => {
    const handler = () => setShowProfile(true);
    window.addEventListener("openCustomerProfile", handler);
    return () => window.removeEventListener("openCustomerProfile", handler);
  }, []);

  const handleAuthSuccess = (data) => setCustomer(data);

  // auth check শেষ না হওয়া পর্যন্ত কিছু দেখাবে না
  if (!authChecked) return null;

  if (customer) {
    const isDesktop = window.innerWidth >= 1024;
    return (
      <>
        {/* Mobile / Tablet — lg এর নিচে */}
        {!isDesktop && <MobileDashboard customer={customer} t={t} />}

        {/* Desktop — redirect */}
        {isDesktop && <DesktopRedirect navigate={navigate} />}

        {showProfile && (
          <ProfileSidebar customer={customer} onClose={() => setShowProfile(false)} t={t} />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">

      {/* ── Subtle bg pattern ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.018]"
          style={{ backgroundImage:"radial-gradient(#2e7d32 1px, transparent 1px)", backgroundSize:"28px 28px" }}/>
        <div className="absolute top-0 right-0 w-[480px] h-[480px] rounded-full opacity-[0.06]"
          style={{ background:"radial-gradient(circle,#4ade80,transparent)", transform:"translate(30%,-30%)" }}/>
        <div className="absolute bottom-0 left-0 w-[360px] h-[360px] rounded-full opacity-[0.04]"
          style={{ background:"radial-gradient(circle,#86efac,transparent)", transform:"translate(-30%,30%)" }}/>
      </div>

      {/* ── Top header ── */}
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.35 }}
        className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5 border-b border-slate-100">
        <Link to="/" className="no-underline flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background:"linear-gradient(135deg,#1a2e1a,#2e7d32)" }}>
            <ShoppingBag size={14} color="white"/>
          </div>
          <span className="text-[14px] font-black text-slate-800 group-hover:text-[#2e7d32] transition-colors">Nahid Enterprise</span>
        </Link>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
          <span className="text-[11px] font-semibold text-emerald-600">{t("নিরাপদ","Secure")}</span>
        </div>
      </motion.div>

      {/* ── Main ── */}
      <div className="relative z-10 flex flex-col items-center px-4 pt-10 pb-16">

        {/* Headline */}
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.35, delay:0.05 }}
          className="text-center mb-8 max-w-sm">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-4"
            style={{ background:"#f0fdf4", border:"1px solid #bbf7d0" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>
            <span className="text-[11.5px] font-bold text-emerald-700">
              {mode === "register" ? t("বিনামূল্যে","Free Account") : t("আবার স্বাগতম","Welcome Back")}
            </span>
          </div>
          <h1 className="text-[28px] sm:text-[32px] font-black text-slate-900 leading-tight tracking-tight">
            {t("Nahid Enterprise","Nahid Enterprise")}<br/>
            <span style={{ background:"linear-gradient(135deg,#15803d,#4ade80)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              {mode === "register" ? t("রেজিস্ট্রেশন","Registration") : t("লগইন","Sign In")}
            </span>
          </h1>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.38, delay:0.1 }}
          className="w-full max-w-[420px]">
          <AuthCard mode={mode} setMode={setMode} onSuccess={handleAuthSuccess} t={t} />

          {(mode === "login" || mode === "register") && (
            <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
              className="text-center text-[11.5px] text-slate-400 mt-5 leading-relaxed">
              {t("প্রবেশ করে আপনি আমাদের","By continuing, you agree to our")}{" "}
              <Link to="/terms" className="text-slate-600 font-semibold hover:text-slate-800 no-underline transition-colors">{t("শর্তাবলী","Terms")}</Link>
              {" "}{t("ও","&")}{" "}
              <Link to="/privacy" className="text-slate-600 font-semibold hover:text-slate-800 no-underline transition-colors">{t("গোপনীয়তা নীতি","Privacy Policy")}</Link>
              {t(" সম্মত।",".")}
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  );
}