import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Mail, Lock, Eye, EyeOff, User, AlertCircle,
  Loader2, ShieldCheck, ArrowRight, CheckCircle, KeyRound,
} from "lucide-react";
import { showLoginToast } from "../../utils/toast/loginToast";

const API = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;
const INVITE_TOKEN = process.env.REACT_APP_SUBADMIN_TOKEN || "nahid-enterprise-secret-2024";
const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

const T = {
  en: {
    brand: "Nahid Enterprise", portal: "SubAdmin Portal",
    signIn: "Sign In", register: "Register",
    loginTitle: "Welcome back", loginSub: "Sign in to your SubAdmin account",
    regTitle: "Create account", regSub: "Register as a SubAdmin",
    name: "Full Name", email: "Email Address", password: "Password",
    confirmPass: "Confirm Password", continue: "Continue", submit: "Submit Registration",
    sending: "Sending OTP…", verifying: "Verifying…", submitting: "Submitting…",
    otpSentTo: "Code sent to", verify: "Verify & Sign In", resend: "Resend Code",
    maxResend: "Max resends", back: "← Back", expiresIn: "Expires in", expired: "Code expired",
    successTitle: "Registration Submitted!", successMsg: "Your request has been sent to the admin. You'll receive an email once approved.",
    goSignIn: "Go to Sign In", forgotPass: "Forgot password?",
    forgotTitle: "Reset Password", forgotSub: "Enter your email to receive OTP",
    newPass: "New Password", confirmNewPass: "Confirm New Password",
    resetBtn: "Reset Password", resetting: "Resetting…",
    resetSuccess: "Password reset successfully! Please sign in.",
    restricted: "Restricted to authorized SubAdmins only", lang: "বাংলা",
  },
  bn: {
    brand: "নাহিদ এন্টারপ্রাইজ", portal: "সাবএডমিন পোর্টাল",
    signIn: "সাইন ইন", register: "রেজিস্ট্রেশন",
    loginTitle: "স্বাগতম", loginSub: "আপনার সাবএডমিন অ্যাকাউন্টে প্রবেশ করুন",
    regTitle: "অ্যাকাউন্ট তৈরি করুন", regSub: "সাবএডমিন হিসেবে নিবন্ধন করুন",
    name: "পুরো নাম", email: "ইমেইল ঠিকানা", password: "পাসওয়ার্ড",
    confirmPass: "পাসওয়ার্ড নিশ্চিত করুন", continue: "পরবর্তী", submit: "রেজিস্ট্রেশন জমা দিন",
    sending: "OTP পাঠানো হচ্ছে…", verifying: "যাচাই হচ্ছে…", submitting: "জমা দেওয়া হচ্ছে…",
    otpSentTo: "কোড পাঠানো হয়েছে", verify: "যাচাই করুন ও প্রবেশ করুন", resend: "কোড পুনরায় পাঠান",
    maxResend: "সর্বোচ্চ চেষ্টা শেষ", back: "← পিছনে", expiresIn: "মেয়াদ শেষ হবে", expired: "কোড মেয়াদোত্তীর্ণ",
    successTitle: "রেজিস্ট্রেশন সম্পন্ন!", successMsg: "আপনার অনুরোধ অ্যাডমিনের কাছে পাঠানো হয়েছে।",
    goSignIn: "সাইন ইনে যান", forgotPass: "পাসওয়ার্ড ভুলে গেছেন?",
    forgotTitle: "পাসওয়ার্ড রিসেট", forgotSub: "OTP পেতে আপনার ইমেইল দিন",
    newPass: "নতুন পাসওয়ার্ড", confirmNewPass: "পাসওয়ার্ড নিশ্চিত করুন",
    resetBtn: "পাসওয়ার্ড রিসেট করুন", resetting: "রিসেট হচ্ছে…",
    resetSuccess: "পাসওয়ার্ড রিসেট হয়েছে! সাইন ইন করুন।",
    restricted: "শুধুমাত্র অনুমোদিত সাবএডমিনদের জন্য", lang: "English",
  },
};

/* ════════════════════════════════
   TOP-LEVEL — এগুলো function এর বাইরে
════════════════════════════════ */

function LabelEl({ children }) {
  return (
    <label style={{ display: "block", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", color: "#4b5563", marginBottom: 7 }}>
      {children}
    </label>
  );
}

function InputEl({ icon: Icon, type = "text", value, onChange, placeholder, error, right }) {
  return (
    <div>
      <div style={{ position: "relative" }}>
        <Icon size={13} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#4b5563", pointerEvents: "none" }} />
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`sa-inp${error ? " sa-inp-err" : ""}${right ? " sa-inp-r" : ""}`}
        />
        {right && (
          <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>
            {right}
          </div>
        )}
      </div>
      {error && <p style={{ color: "#f87171", fontSize: 11, marginTop: 4, marginLeft: 2 }}>{error}</p>}
    </div>
  );
}

function SubmitBtn({ children, disabled }) {
  return (
    <button type="submit" disabled={disabled} className="sa-btn-primary" style={{ opacity: disabled ? 0.5 : 1 }}>
      {children}
    </button>
  );
}

function OtpPanel({ otp, otpTimer, resendCount, loading, t, onVerify, onResend, onBack, onOtpChange, onOtpKey, onOtpPaste, otpRefs, email }) {
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return (
    <form onSubmit={onVerify} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: 16, background: "linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.15))", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", boxShadow: "0 4px 16px rgba(99,102,241,0.15)" }}>
          <Mail size={20} color="#a5b4fc" />
        </div>
        <p style={{ color: "#94a3b8", fontSize: 12, margin: 0, fontWeight: 500 }}>{t.otpSentTo}</p>
        <p style={{ color: "#a5b4fc", fontSize: 13, fontWeight: 800, margin: "3px 0 0" }}>{email}</p>
      </div>
      <div>
        <LabelEl>Verification Code</LabelEl>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }} onPaste={onOtpPaste}>
          {otp.map((d, i) => (
            <input
              key={i}
              ref={el => otpRefs.current[i] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => onOtpChange(i, e.target.value)}
              onKeyDown={e => onOtpKey(i, e)}
              className="sa-otp"
            />
          ))}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: otpTimer > 0 ? "#6ee7b7" : "#f87171", display: "flex", alignItems: "center", gap: 5 }}>
          {otpTimer > 0 && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6ee7b7", display: "inline-block", animation: "pulse-dot 1.5s infinite" }} />}
          {otpTimer > 0 ? `${t.expiresIn} ${fmt(otpTimer)}` : t.expired}
        </span>
        <button type="button" onClick={onResend} disabled={otpTimer > 0 || resendCount >= 3}
          style={{ background: "none", border: "none", fontSize: 11, fontWeight: 800, cursor: otpTimer > 0 || resendCount >= 3 ? "not-allowed" : "pointer", color: otpTimer > 0 || resendCount >= 3 ? "#374151" : "#818cf8", fontFamily: "inherit" }}>
          {resendCount >= 3 ? t.maxResend : t.resend}
        </button>
      </div>
      <button type="submit" disabled={loading || otp.join("").length < 6} className="sa-btn-primary"
        style={{ opacity: loading || otp.join("").length < 6 ? 0.5 : 1 }}>
        {loading ? <><Loader2 size={14} className="animate-spin" />{t.verifying}</> : t.verify}
      </button>
      <button type="button" onClick={onBack} className="sa-btn-ghost">{t.back}</button>
    </form>
  );
}

/* ════════════════════════════════
   MAIN
════════════════════════════════ */
export default function SubAdminAuth() {
  const navigate = useNavigate();
  const [lang, setLang] = useState("en");
  const t = T[lang];

  const [mode, setMode] = useState("login");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState({});
  const [showLoginPass, setShowLoginPass] = useState(false);

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regErrors, setRegErrors] = useState({});
  const [showRegPass, setShowRegPass] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPass, setConfirmNewPass] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const otpRefs = useRef([]);
  const timerRef = useRef(null);
  const [tempToken, setTempToken] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("subAdminToken");
    const info = localStorage.getItem("subAdminInfo");
    if (token && info) navigate("/subadmin/dashboard", { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (otpTimer > 0) timerRef.current = setTimeout(() => setOtpTimer(p => p - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [otpTimer]);

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };
  const clearAll = () => { setServerError(""); setSuccessMsg(""); setLoginErrors({}); setRegErrors({}); };
  const resetOtp = () => { setOtp(["", "", "", "", "", ""]); setTimeout(() => otpRefs.current[0]?.focus(), 150); };
  const switchMode = (m) => { setMode(m); clearAll(); resetOtp(); setResendCount(0); };

  const handleOtpChange = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    setOtp(prev => { const n = [...prev]; n[i] = v; return n; });
    setServerError("");
    if (v && i < 5) setTimeout(() => otpRefs.current[i + 1]?.focus(), 0);
  };
  const handleOtpKey = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) otpRefs.current[i - 1]?.focus();
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
    if (!validateEmail(loginEmail)) er.email = "Valid email required.";
    if (!loginPassword) er.password = "Password required.";
    if (Object.keys(er).length) { setLoginErrors(er); triggerShake(); return; }
    try {
      setLoading(true); clearAll();
      const res = await fetch(`${API}/api/subadmin/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: loginEmail, password: loginPassword }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setTempToken(data.tempToken); setOtpTimer(120); switchMode("otp-login");
    } catch (err) { setServerError(err.message); triggerShake(); }
    finally { setLoading(false); }
  };

  const handleVerifyLoginOtp = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) { setServerError("Enter complete 6-digit code."); triggerShake(); return; }
    try {
      setLoading(true); clearAll();
      const res = await fetch(`${API}/api/subadmin/verify-otp`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${tempToken}` }, body: JSON.stringify({ email: loginEmail, otp: code }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      localStorage.setItem("subAdminToken", data.token);
      localStorage.setItem("subAdminInfo", JSON.stringify({ _id: data._id, name: data.name, email: data.email, phone: data.phone, role: data.role, status: data.status }));
      showLoginToast(data.name);
      navigate("/subadmin/dashboard", { replace: true });
    } catch (err) { setServerError(err.message); triggerShake(); }
    finally { setLoading(false); }
  };

  const handleResendLoginOtp = async () => {
    if (otpTimer > 0 || resendCount >= 3) return;
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/subadmin/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: loginEmail, password: loginPassword }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setTempToken(data.tempToken); setOtpTimer(120); setResendCount(c => c + 1); resetOtp();
    } catch (err) { setServerError(err.message); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const er = {};
    if (!regName.trim()) er.name = "Name required.";
    if (!validateEmail(regEmail)) er.email = "Valid email required.";
    if (regPassword.length < 6) er.password = "Min. 6 characters.";
    if (regPassword !== regConfirm) er.confirm = "Passwords do not match.";
    if (Object.keys(er).length) { setRegErrors(er); triggerShake(); return; }
    try {
      setLoading(true); clearAll();
      const res = await fetch(`${API}/api/subadmin/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: regName, email: regEmail, password: regPassword, inviteToken: INVITE_TOKEN }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      switchMode("success");
    } catch (err) { setServerError(err.message); triggerShake(); }
    finally { setLoading(false); }
  };

  const handleSendForgotOtp = async (e) => {
    e.preventDefault();
    if (!validateEmail(forgotEmail)) { setServerError("Valid email required."); triggerShake(); return; }
    try {
      setLoading(true); clearAll();
      const res = await fetch(`${API}/api/subadmin/forgot-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: forgotEmail }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOtpTimer(120); switchMode("otp-forgot");
    } catch (err) { setServerError(err.message); triggerShake(); }
    finally { setLoading(false); }
  };

  const handleVerifyForgotOtp = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) { setServerError("Enter complete 6-digit code."); triggerShake(); return; }
    try {
      setLoading(true); clearAll();
      const res = await fetch(`${API}/api/subadmin/verify-forgot-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: forgotEmail, otp: code }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      switchMode("forgot-newpass");
    } catch (err) { setServerError(err.message); triggerShake(); }
    finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { setServerError("Min. 6 characters."); triggerShake(); return; }
    if (newPassword !== confirmNewPass) { setServerError("Passwords do not match."); triggerShake(); return; }
    try {
      setLoading(true); clearAll();
      const res = await fetch(`${API}/api/subadmin/reset-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: forgotEmail, newPassword }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccessMsg(t.resetSuccess);
      setTimeout(() => { switchMode("login"); setForgotEmail(""); setNewPassword(""); setConfirmNewPass(""); }, 2500);
    } catch (err) { setServerError(err.message); triggerShake(); }
    finally { setLoading(false); }
  };

  const handleResendForgotOtp = async () => {
    if (otpTimer > 0 || resendCount >= 3) return;
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/subadmin/forgot-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: forgotEmail }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOtpTimer(120); setResendCount(c => c + 1); resetOtp();
    } catch (err) { setServerError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "28px 16px", position: "relative", overflow: "hidden", fontFamily: "'Outfit', sans-serif", background: "linear-gradient(145deg,#111827 0%,#1a1f35 50%,#111827 100%)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .sa-inp { width:100%; padding:11px 14px 11px 36px; border-radius:11px; border:1px solid #1f2937; background:rgba(17,24,39,0.8); color:#d1d5db; font-size:13px; font-weight:500; outline:none; transition:border-color 0.15s,box-shadow 0.15s; font-family:inherit; display:block; }
        .sa-inp::placeholder { color:#374151; }
        .sa-inp:focus { border-color:rgba(99,102,241,0.5); box-shadow:0 0 0 3px rgba(99,102,241,0.08); background:rgba(17,24,39,0.95); }
        .sa-inp-err { border-color:rgba(248,113,113,0.4) !important; }
        .sa-inp-r { padding-right:40px; }
        .sa-otp { width:100%; height:44px; text-align:center; font-size:18px; font-weight:900; border-radius:10px; border:1px solid #1f2937; background:rgba(17,24,39,0.8); color:#a5b4fc; outline:none; transition:border-color 0.15s,box-shadow 0.15s,background 0.15s; font-family:inherit; display:block; caret-color:#818cf8; }
        .sa-otp:focus { border-color:rgba(99,102,241,0.5); box-shadow:0 0 0 3px rgba(99,102,241,0.08); background:rgba(30,27,75,0.4); }
        .sa-btn-primary { width:100%; padding:12px; border-radius:11px; border:none; background:linear-gradient(135deg,#6366f1 0%,#7c3aed 100%); color:#fff; font-size:13px; font-weight:800; cursor:pointer; font-family:inherit; display:flex; align-items:center; justify-content:center; gap:7px; transition:transform 0.15s,box-shadow 0.15s; box-shadow:0 4px 20px rgba(99,102,241,0.25),inset 0 1px 0 rgba(255,255,255,0.1); letter-spacing:0.01em; }
        .sa-btn-primary:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 24px rgba(99,102,241,0.35),inset 0 1px 0 rgba(255,255,255,0.1); }
        .sa-btn-primary:disabled { cursor:not-allowed; }
        .sa-btn-ghost { width:100%; background:none; border:none; color:#4b5563; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; text-align:center; padding:4px; transition:color 0.15s; }
        .sa-btn-ghost:hover { color:#6b7280; }
        .sa-tab { flex:1; padding:8px 0; border-radius:9px; border:none; font-size:12px; font-weight:800; cursor:pointer; font-family:inherit; transition:all 0.2s; }
        .sa-tab-active { background:rgba(99,102,241,0.15); color:#a5b4fc; box-shadow:0 1px 8px rgba(99,102,241,0.15); }
        .sa-tab-inactive { background:transparent; color:#374151; }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.5;transform:scale(0.8);} }
        @keyframes blob-float { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(20px,-20px) scale(1.05);} 66%{transform:translate(-15px,10px) scale(0.97);} }
        @keyframes shimmer { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
      `}</style>

      {/* Background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.07) 0%,transparent 70%)", top: "-10%", left: "-10%", animation: "blob-float 15s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.06) 0%,transparent 70%)", bottom: "-10%", right: "-10%", animation: "blob-float 18s ease-in-out infinite reverse" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(99,102,241,0.05) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center,transparent 40%,rgba(0,0,0,0.35) 100%)" }} />
      </div>

      {/* Lang */}
      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        onClick={() => setLang(l => l === "en" ? "bn" : "en")}
        style={{ position: "fixed", top: 18, right: 18, zIndex: 100, padding: "6px 14px", borderRadius: 10, background: "rgba(17,24,39,0.9)", border: "1px solid #1f2937", color: "#6b7280", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
        {t.lang}
      </motion.button>

      <div style={{ width: "100%", maxWidth: 400, position: "relative", zIndex: 1 }}>

        {/* Brand */}
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 11, background: "rgba(17,24,39,0.9)", border: "1px solid #1f2937", borderRadius: 16, padding: "10px 18px", boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(99,102,241,0.4),inset 0 1px 0 rgba(255,255,255,0.15)" }}>
              <ShieldCheck size={16} color="#fff" />
            </div>
            <div style={{ textAlign: "left" }}>
              <p style={{ color: "#e5e7eb", fontWeight: 900, fontSize: 13, letterSpacing: "-0.01em" }}>{t.brand}</p>
              <p style={{ color: "#374151", fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 1 }}>{t.portal}</p>
            </div>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          animate={shake ? { x: [-6, 6, -4, 4, -2, 2, 0] } : { x: 0 }}
          transition={{ duration: 0.35 }}
          style={{ background: "rgba(17,24,39,0.85)", backdropFilter: "blur(24px)", border: "1px solid #1f2937", borderRadius: 22, overflow: "hidden", boxShadow: "0 32px 64px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.04)" }}
        >
          <div style={{ height: 2, background: "linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4,#8b5cf6,#6366f1)", backgroundSize: "200% auto", animation: "shimmer 4s linear infinite" }} />

          {/* Tab */}
          {(mode === "login" || mode === "register") && (
            <div style={{ margin: "16px 18px 0", display: "flex", background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: 3, border: "1px solid #111827", gap: 2 }}>
              {[["login", t.signIn], ["register", t.register]].map(([m, label]) => (
                <button key={m} onClick={() => switchMode(m)} className={`sa-tab ${mode === m ? "sa-tab-active" : "sa-tab-inactive"}`}>
                  {label}
                </button>
              ))}
            </div>
          )}

          <div style={{ padding: "18px 20px 24px" }}>

            <AnimatePresence>
              {serverError && (
                <motion.div initial={{ opacity: 0, y: -6, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 10, padding: "9px 12px", color: "#fca5a5", fontSize: 12 }}>
                    <AlertCircle size={13} style={{ flexShrink: 0 }} />{serverError}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {successMsg && (
                <motion.div initial={{ opacity: 0, y: -6, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 10, padding: "9px 12px", color: "#6ee7b7", fontSize: 12 }}>
                    <CheckCircle size={13} style={{ flexShrink: 0 }} />{successMsg}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── LOGIN ── */}
            {mode === "login" && (
              <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <p style={{ color: "#f3f4f6", fontSize: 16, fontWeight: 900, letterSpacing: "-0.02em" }}>{t.loginTitle}</p>
                  <p style={{ color: "#374151", fontSize: 12, fontWeight: 500, marginTop: 3 }}>{t.loginSub}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                  <div>
                    <LabelEl>{t.email}</LabelEl>
                    <InputEl icon={Mail} type="email" value={loginEmail} onChange={e => { setLoginEmail(e.target.value); setLoginErrors(p => ({ ...p, email: "" })); }} placeholder="you@email.com" error={loginErrors.email} />
                  </div>
                  <div>
                    <LabelEl>{t.password}</LabelEl>
                    <InputEl icon={Lock} type={showLoginPass ? "text" : "password"} value={loginPassword} onChange={e => { setLoginPassword(e.target.value); setLoginErrors(p => ({ ...p, password: "" })); }} placeholder="••••••••" error={loginErrors.password}
                      right={<button type="button" onClick={() => setShowLoginPass(s => !s)} style={{ background: "none", border: "none", cursor: "pointer", color: "#374151", padding: 0, display: "flex" }}>{showLoginPass ? <EyeOff size={14} /> : <Eye size={14} />}</button>} />
                  </div>
                </div>
                <SubmitBtn disabled={loading}>
                  {loading ? <><Loader2 size={14} className="animate-spin" />{t.sending}</> : <>{t.continue}<ArrowRight size={13} /></>}
                </SubmitBtn>
                <button type="button" onClick={() => { setMode("forgot-email"); clearAll(); }}
                  style={{ background: "none", border: "none", color: "#374151", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textAlign: "center" }}>
                  {t.forgotPass}
                </button>
              </form>
            )}

            {/* ── REGISTER ── */}
            {mode === "register" && (
              <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                <div>
                  <p style={{ color: "#f3f4f6", fontSize: 16, fontWeight: 900, letterSpacing: "-0.02em" }}>{t.regTitle}</p>
                  <p style={{ color: "#374151", fontSize: 12, fontWeight: 500, marginTop: 3 }}>{t.regSub}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div><LabelEl>{t.name}</LabelEl><InputEl icon={User} value={regName} onChange={e => { setRegName(e.target.value); setRegErrors(p => ({ ...p, name: "" })); }} placeholder="Your full name" error={regErrors.name} /></div>
                  <div><LabelEl>{t.email}</LabelEl><InputEl icon={Mail} type="email" value={regEmail} onChange={e => { setRegEmail(e.target.value); setRegErrors(p => ({ ...p, email: "" })); }} placeholder="you@email.com" error={regErrors.email} /></div>
                  <div>
                    <LabelEl>{t.password}</LabelEl>
                    <InputEl icon={Lock} type={showRegPass ? "text" : "password"} value={regPassword} onChange={e => { setRegPassword(e.target.value); setRegErrors(p => ({ ...p, password: "" })); }} placeholder="Min. 6 characters" error={regErrors.password}
                      right={<button type="button" onClick={() => setShowRegPass(s => !s)} style={{ background: "none", border: "none", cursor: "pointer", color: "#374151", padding: 0, display: "flex" }}>{showRegPass ? <EyeOff size={14} /> : <Eye size={14} />}</button>} />
                  </div>
                  <div><LabelEl>{t.confirmPass}</LabelEl><InputEl icon={Lock} type="password" value={regConfirm} onChange={e => { setRegConfirm(e.target.value); setRegErrors(p => ({ ...p, confirm: "" })); }} placeholder="Repeat password" error={regErrors.confirm} /></div>
                </div>
                <SubmitBtn disabled={loading}>
                  {loading ? <><Loader2 size={14} className="animate-spin" />{t.submitting}</> : <>{t.submit}<ArrowRight size={13} /></>}
                </SubmitBtn>
              </form>
            )}

            {/* ── OTP LOGIN ── */}
            {mode === "otp-login" && (
              <OtpPanel otp={otp} otpTimer={otpTimer} resendCount={resendCount} loading={loading} t={t}
                email={loginEmail} onVerify={handleVerifyLoginOtp} onResend={handleResendLoginOtp}
                onBack={() => switchMode("login")} onOtpChange={handleOtpChange}
                onOtpKey={handleOtpKey} onOtpPaste={handleOtpPaste} otpRefs={otpRefs} />
            )}

            {/* ── FORGOT EMAIL ── */}
            {mode === "forgot-email" && (
              <form onSubmit={handleSendForgotOtp} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 13, background: "linear-gradient(135deg,rgba(124,58,237,0.2),rgba(99,102,241,0.15))", border: "1px solid rgba(124,58,237,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <KeyRound size={18} color="#a78bfa" />
                  </div>
                  <div>
                    <p style={{ color: "#f3f4f6", fontSize: 15, fontWeight: 900, letterSpacing: "-0.02em" }}>{t.forgotTitle}</p>
                    <p style={{ color: "#374151", fontSize: 12, fontWeight: 500, marginTop: 2 }}>{t.forgotSub}</p>
                  </div>
                </div>
                <div><LabelEl>{t.email}</LabelEl><InputEl icon={Mail} type="email" value={forgotEmail} onChange={e => { setForgotEmail(e.target.value); clearAll(); }} placeholder="you@email.com" /></div>
                <SubmitBtn disabled={loading}>
                  {loading ? <><Loader2 size={14} className="animate-spin" />{t.sending}</> : <>{t.continue}<ArrowRight size={13} /></>}
                </SubmitBtn>
                <button type="button" onClick={() => switchMode("login")} className="sa-btn-ghost">{t.back}</button>
              </form>
            )}

            {/* ── OTP FORGOT ── */}
            {mode === "otp-forgot" && (
              <OtpPanel otp={otp} otpTimer={otpTimer} resendCount={resendCount} loading={loading} t={t}
                email={forgotEmail} onVerify={handleVerifyForgotOtp} onResend={handleResendForgotOtp}
                onBack={() => switchMode("forgot-email")} onOtpChange={handleOtpChange}
                onOtpKey={handleOtpKey} onOtpPaste={handleOtpPaste} otpRefs={otpRefs} />
            )}

            {/* ── NEW PASSWORD ── */}
            {mode === "forgot-newpass" && (
              <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 13, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Lock size={17} color="#6ee7b7" />
                  </div>
                  <div>
                    <p style={{ color: "#f3f4f6", fontSize: 15, fontWeight: 900, letterSpacing: "-0.02em" }}>{lang === "en" ? "Set New Password" : "নতুন পাসওয়ার্ড সেট করুন"}</p>
                    <p style={{ color: "#374151", fontSize: 12, fontWeight: 500, marginTop: 2 }}>{lang === "en" ? "Choose a strong password" : "শক্তিশালী পাসওয়ার্ড বেছে নিন"}</p>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <LabelEl>{t.newPass}</LabelEl>
                    <InputEl icon={Lock} type={showNewPass ? "text" : "password"} value={newPassword} onChange={e => { setNewPassword(e.target.value); clearAll(); }} placeholder="Min. 6 characters"
                      right={<button type="button" onClick={() => setShowNewPass(s => !s)} style={{ background: "none", border: "none", cursor: "pointer", color: "#374151", padding: 0, display: "flex" }}>{showNewPass ? <EyeOff size={14} /> : <Eye size={14} />}</button>} />
                  </div>
                  <div><LabelEl>{t.confirmNewPass}</LabelEl><InputEl icon={Lock} type="password" value={confirmNewPass} onChange={e => { setConfirmNewPass(e.target.value); clearAll(); }} placeholder="Repeat password" /></div>
                </div>
                <SubmitBtn disabled={loading}>
                  {loading ? <><Loader2 size={14} className="animate-spin" />{t.resetting}</> : t.resetBtn}
                </SubmitBtn>
              </form>
            )}

            {/* ── SUCCESS ── */}
            {mode === "success" && (
              <div style={{ textAlign: "center", padding: "8px 0", display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
                <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 14 }}
                  style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.15))", border: "1.5px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(99,102,241,0.2)" }}>
                  <CheckCircle size={26} color="#a5b4fc" />
                </motion.div>
                <div>
                  <h3 style={{ color: "#f3f4f6", fontSize: 16, fontWeight: 900, letterSpacing: "-0.02em" }}>{t.successTitle}</h3>
                  <p style={{ color: "#4b5563", fontSize: 12, marginTop: 8, lineHeight: 1.7 }}>{t.successMsg}</p>
                </div>
                <button onClick={() => switchMode("login")} className="sa-btn-primary" style={{ maxWidth: 180 }}>
                  {t.goSignIn}
                </button>
              </div>
            )}

          </div>
        </motion.div>

        <p style={{ textAlign: "center", color: "#1f2937", fontSize: 11, fontWeight: 600, marginTop: 16 }}>{t.restricted}</p>
      </div>
    </div>
  );
}