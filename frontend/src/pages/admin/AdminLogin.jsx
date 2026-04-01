import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { showLoginToast } from "../../utils/toast/loginToast";

const API = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;

const T = {
  en: {
    title: "Admin Portal",
    subtitle: "Nahid Enterprise",
    email: "Email Address",
    password: "Password",
    continue: "Continue",
    sendingOtp: "Sending OTP…",
    verifying: "Verifying…",
    resetting: "Resetting…",
    otpTitle: "Check Your Inbox",
    otpSubtitle: "We sent a 6-digit code to",
    verifyBtn: "Verify & Sign In",
    resend: "Resend Code",
    maxResend: "Max resends reached",
    back: "← Back",
    forgotPassword: "Forgot password?",
    forgotTitle: "Reset Password",
    forgotSubtitle: "Enter your admin email to receive OTP",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    resetBtn: "Reset Password",
    resetSuccess: "Password reset! Please login.",
    expiredIn: "Expires in",
    expired: "Code expired",
    emailPlaceholder: "admin@example.com",
    passwordPlaceholder: "••••••••",
    step1: "Credentials",
    step2: "Verification",
    lang: "বাংলা",
  },
  bn: {
    title: "অ্যাডমিন পোর্টাল",
    subtitle: "নাহিদ এন্টারপ্রাইজ",
    email: "ইমেইল ঠিকানা",
    password: "পাসওয়ার্ড",
    continue: "পরবর্তী",
    sendingOtp: "OTP পাঠানো হচ্ছে…",
    verifying: "যাচাই হচ্ছে…",
    resetting: "রিসেট হচ্ছে…",
    otpTitle: "ইমেইল চেক করুন",
    otpSubtitle: "৬ সংখ্যার কোড পাঠানো হয়েছে",
    verifyBtn: "যাচাই করুন ও প্রবেশ করুন",
    resend: "কোড পুনরায় পাঠান",
    maxResend: "সর্বোচ্চ চেষ্টা শেষ",
    back: "← পিছনে",
    forgotPassword: "পাসওয়ার্ড ভুলে গেছেন?",
    forgotTitle: "পাসওয়ার্ড রিসেট",
    forgotSubtitle: "OTP পেতে অ্যাডমিন ইমেইল দিন",
    newPassword: "নতুন পাসওয়ার্ড",
    confirmPassword: "পাসওয়ার্ড নিশ্চিত করুন",
    resetBtn: "পাসওয়ার্ড রিসেট করুন",
    resetSuccess: "পাসওয়ার্ড রিসেট হয়েছে! লগইন করুন।",
    expiredIn: "মেয়াদ শেষ হবে",
    expired: "কোড মেয়াদোত্তীর্ণ",
    emailPlaceholder: "admin@example.com",
    passwordPlaceholder: "••••••••",
    step1: "তথ্য",
    step2: "যাচাইকরণ",
    lang: "English",
  },
};

const Spinner = () => (
  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
    <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export default function AdminLogin() {
  const navigate = useNavigate();
  const [lang, setLang] = useState("en");
  const t = T[lang];

  // mode: "login" | "forgot"
  const [mode, setMode] = useState("login");

  // login steps: 1=credentials, 2=otp
  // forgot steps: 1=email, 2=otp, 3=newpassword
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({ email: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  const [tempToken, setTempToken] = useState("");
  const [tempData, setTempData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const info = localStorage.getItem("adminInfo");
    if (token && info) {
      try {
        if (JSON.parse(info).role === "admin") navigate("/manage-x9k2/dashboard", { replace: true });
      } catch (_) {}
    }
  }, [navigate]);

  useEffect(() => {
    if (otpTimer > 0) {
      timerRef.current = setTimeout(() => setOtpTimer(t => t - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [otpTimer]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleError = (msg) => {
    setError(msg);
    triggerShake();
  };

  const resetOtp = () => {
    setOtp(["", "", "", "", "", ""]);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  // ── OTP handlers ──
  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const n = [...otp]; n[i] = val; setOtp(n);
    setError("");
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKey = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) otpRefs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const n = [...otp];
    p.split("").forEach((c, i) => { n[i] = c; });
    setOtp(n);
    otpRefs.current[Math.min(p.length, 5)]?.focus();
  };

  // ══════════════════════
  // LOGIN FLOW
  // ══════════════════════
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return handleError("Please fill all fields");
    try {
      setLoading(true); setError("");
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      if (data.role !== "admin") throw new Error("Access denied. Admins only.");

      setTempToken(data.token);
      setTempData(data);

      // Send OTP
      const otpRes = await fetch(`${API}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.token}` },
        body: JSON.stringify({ email: form.email }),
      });
      const otpData = await otpRes.json();
      if (!otpRes.ok) throw new Error(otpData.message);

      setOtpTimer(120);
      setStep(2);
    } catch (err) {
      handleError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLoginOtp = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) return handleError("Enter the complete 6-digit code");
    try {
      setLoading(true); setError("");
      const res = await fetch(`${API}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tempToken}` },
        body: JSON.stringify({ email: form.email, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem("token", tempToken);
      localStorage.setItem("adminInfo", JSON.stringify(tempData));
      showLoginToast(tempData.name);
      navigate("/manage-x9k2/dashboard", { replace: true });
    } catch (err) {
      handleError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendLoginOtp = async () => {
    if (otpTimer > 0 || resendCount >= 3) return;
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tempToken}` },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOtpTimer(120);
      setResendCount(c => c + 1);
      resetOtp();
    } catch (err) {
      handleError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ══════════════════════
  // FORGOT PASSWORD FLOW
  // ══════════════════════
  const handleSendForgotOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return handleError("Enter your email");
    try {
      setLoading(true); setError("");
      const res = await fetch(`${API}/api/auth/forgot-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOtpTimer(120);
      setStep(2);
    } catch (err) {
      handleError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyForgotOtp = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) return handleError("Enter the complete 6-digit code");
    try {
      setLoading(true); setError("");
      const res = await fetch(`${API}/api/auth/verify-forgot-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStep(3);
    } catch (err) {
      handleError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return handleError("Fill all fields");
    if (newPassword !== confirmPassword) return handleError("Passwords do not match");
    if (newPassword.length < 6) return handleError("Minimum 6 characters");
    try {
      setLoading(true); setError("");
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(t.resetSuccess);
      setTimeout(() => {
        setMode("login"); setStep(1); setSuccess(""); setForgotEmail("");
        setNewPassword(""); setConfirmPassword(""); resetOtp();
      }, 2000);
    } catch (err) {
      handleError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendForgotOtp = async () => {
    if (otpTimer > 0 || resendCount >= 3) return;
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/auth/forgot-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOtpTimer(120);
      setResendCount(c => c + 1);
      resetOtp();
    } catch (err) {
      handleError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setError(""); setStep(s => s - 1);
    if (step === 1) { setMode("login"); setStep(1); }
  };

  const totalSteps = mode === "login" ? 2 : 3;

  // Eye icon
  const EyeIcon = ({ show }) => show ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
      padding: "24px 16px",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .al-input { width:100%; padding:12px 16px; border-radius:12px; font-size:14px; font-family:inherit; outline:none; transition:all 0.2s; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.12); color:#fff; }
        .al-input::placeholder { color:rgba(255,255,255,0.3); }
        .al-input:focus { background:rgba(255,255,255,0.1); border-color:rgba(99,102,241,0.6); box-shadow:0 0 0 3px rgba(99,102,241,0.15); }
        .al-input-err { border-color:rgba(239,68,68,0.6) !important; background:rgba(239,68,68,0.07) !important; }
        .al-btn { width:100%; padding:13px; border-radius:12px; border:none; font-size:14px; font-weight:700; font-family:inherit; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:all 0.2s; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; box-shadow:0 4px 20px rgba(99,102,241,0.4); }
        .al-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 24px rgba(99,102,241,0.5); }
        .al-btn:disabled { opacity:0.7; cursor:not-allowed; transform:none; }
        .al-otp { width:100%; aspect-ratio:1; text-align:center; font-size:22px; font-weight:800; border-radius:12px; border:1.5px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.07); color:#fff; outline:none; font-family:inherit; transition:all 0.2s; }
        .al-otp:focus { border-color:rgba(99,102,241,0.7); background:rgba(99,102,241,0.15); box-shadow:0 0 0 3px rgba(99,102,241,0.2); }
        .al-otp.filled { border-color:rgba(99,102,241,0.5); background:rgba(99,102,241,0.12); color:#a5b4fc; }

        /* Animated background orbs */
        .orb { position:absolute; border-radius:50%; filter:blur(80px); opacity:0.15; animation:orb-float 8s ease-in-out infinite; }
        @keyframes orb-float { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(-30px) scale(1.05);} }
        @keyframes grid-move { 0%{transform:translateY(0);} 100%{transform:translateY(40px);} }
      `}</style>

      {/* Background orbs */}
      <div className="orb" style={{ width: 400, height: 400, background: "#6366f1", top: "-10%", left: "-10%", animationDelay: "0s" }} />
      <div className="orb" style={{ width: 300, height: 300, background: "#8b5cf6", bottom: "-5%", right: "-5%", animationDelay: "3s" }} />
      <div className="orb" style={{ width: 200, height: 200, background: "#06b6d4", top: "50%", left: "60%", animationDelay: "6s" }} />

      {/* Grid overlay */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.03,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      {/* Lang toggle */}
      <button
        onClick={() => setLang(l => l === "en" ? "bn" : "en")}
        style={{
          position: "fixed", top: 20, right: 20,
          background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
          color: "#fff", borderRadius: 10, padding: "6px 14px", fontSize: 12,
          fontWeight: 700, cursor: "pointer", fontFamily: "inherit", zIndex: 100,
          backdropFilter: "blur(10px)",
        }}
      >
        {t.lang}
      </button>

      {/* Card */}
      <motion.div
        animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
        transition={{ duration: 0.4 }}
        style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", marginBottom: 24 }}
        >
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 14, padding: "10px 20px", backdropFilter: "blur(10px)",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 15, letterSpacing: 0.5 }}>
              {t.subtitle}
            </span>
          </div>
        </motion.div>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 28 }}
          style={{
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: "0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset",
          }}
        >
          {/* Top gradient bar */}
          <div style={{ height: 3, background: "linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4)" }} />

          <div style={{ padding: "32px 32px 28px" }}>

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>
                {mode === "login" ? t.title : t.forgotTitle}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "6px 0 0" }}>
                {mode === "login"
                  ? (step === 1 ? (lang === "en" ? "Sign in to your admin panel" : "অ্যাডমিন প্যানেলে প্রবেশ করুন") : `${t.otpSubtitle} ${form.email}`)
                  : (step === 1 ? t.forgotSubtitle : step === 2 ? `${t.otpSubtitle} ${forgotEmail}` : (lang === "en" ? "Set your new password" : "নতুন পাসওয়ার্ড সেট করুন"))
                }
              </p>
            </div>

            {/* Step indicator */}
            <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} style={{
                  height: 3, flex: 1, borderRadius: 99,
                  background: i < step
                    ? "linear-gradient(90deg,#6366f1,#8b5cf6)"
                    : "rgba(255,255,255,0.1)",
                  transition: "background 0.4s",
                }} />
              ))}
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)",
                    borderRadius: 10, padding: "10px 14px", marginBottom: 16,
                    color: "#fca5a5", fontSize: 13, display: "flex", alignItems: "center", gap: 8,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#fca5a5" strokeWidth="2" />
                    <path d="M12 8v4m0 4h.01" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)",
                    borderRadius: 10, padding: "10px 14px", marginBottom: 16,
                    color: "#6ee7b7", fontSize: 13, display: "flex", alignItems: "center", gap: 8,
                  }}
                >
                  ✓ {success}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">

              {/* ── LOGIN STEP 1 ── */}
              {mode === "login" && step === 1 && (
                <motion.form key="login1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>{t.email}</label>
                    <input className="al-input" type="email" value={form.email} onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setError(""); }} placeholder={t.emailPlaceholder} />
                  </div>
                  <div>
                    <label style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>{t.password}</label>
                    <div style={{ position: "relative" }}>
                      <input className="al-input" type={showPassword ? "text" : "password"} value={form.password} onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setError(""); }} placeholder={t.passwordPlaceholder} style={{ paddingRight: 44 }} />
                      <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 0 }}>
                        <EyeIcon show={showPassword} />
                      </button>
                    </div>
                  </div>
                  <button className="al-btn" type="submit" disabled={loading}>
                    {loading ? <><Spinner />{t.sendingOtp}</> : <>{t.continue} <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-7-7l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></>}
                  </button>
                  <button type="button" onClick={() => { setMode("forgot"); setStep(1); setError(""); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", fontFamily: "inherit", marginTop: -4 }}>
                    {t.forgotPassword}
                  </button>
                </motion.form>
              )}

              {/* ── LOGIN STEP 2 (OTP) ── */}
              {mode === "login" && step === 2 && (
                <motion.form key="login2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleVerifyLoginOtp} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <label style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 12 }}>Verification Code</label>
                    <div style={{ display: "flex", gap: 8 }} onPaste={handleOtpPaste}>
                      {otp.map((d, i) => (
                        <input key={i} ref={el => otpRefs.current[i] = el} className={`al-otp${d ? " filled" : ""}`} type="text" inputMode="numeric" maxLength={1} value={d} onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKey(i, e)} />
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: otpTimer > 0 ? "#6ee7b7" : "#fca5a5" }}>
                      {otpTimer > 0 ? `${t.expiredIn} ${String(Math.floor(otpTimer / 60)).padStart(2, "0")}:${String(otpTimer % 60).padStart(2, "0")}` : t.expired}
                    </span>
                    <button type="button" onClick={handleResendLoginOtp} disabled={otpTimer > 0 || resendCount >= 3} style={{ background: "none", border: "none", fontSize: 12, fontWeight: 700, cursor: otpTimer > 0 || resendCount >= 3 ? "not-allowed" : "pointer", color: otpTimer > 0 || resendCount >= 3 ? "rgba(255,255,255,0.2)" : "#a5b4fc", fontFamily: "inherit" }}>
                      {resendCount >= 3 ? t.maxResend : t.resend}
                    </button>
                  </div>
                  <button className="al-btn" type="submit" disabled={loading || otp.join("").length < 6}>
                    {loading ? <><Spinner />{t.verifying}</> : t.verifyBtn}
                  </button>
                  <button type="button" onClick={() => { setStep(1); setError(""); resetOtp(); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                    {t.back}
                  </button>
                </motion.form>
              )}

              {/* ── FORGOT STEP 1 (Email) ── */}
              {mode === "forgot" && step === 1 && (
                <motion.form key="forgot1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSendForgotOtp} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>{t.email}</label>
                    <input className="al-input" type="email" value={forgotEmail} onChange={e => { setForgotEmail(e.target.value); setError(""); }} placeholder={t.emailPlaceholder} />
                  </div>
                  <button className="al-btn" type="submit" disabled={loading}>
                    {loading ? <><Spinner />{t.sendingOtp}</> : <>{t.continue} <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-7-7l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></>}
                  </button>
                  <button type="button" onClick={() => { setMode("login"); setStep(1); setError(""); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                    {t.back}
                  </button>
                </motion.form>
              )}

              {/* ── FORGOT STEP 2 (OTP) ── */}
              {mode === "forgot" && step === 2 && (
                <motion.form key="forgot2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleVerifyForgotOtp} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <label style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 12 }}>Verification Code</label>
                    <div style={{ display: "flex", gap: 8 }} onPaste={handleOtpPaste}>
                      {otp.map((d, i) => (
                        <input key={i} ref={el => otpRefs.current[i] = el} className={`al-otp${d ? " filled" : ""}`} type="text" inputMode="numeric" maxLength={1} value={d} onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKey(i, e)} />
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: otpTimer > 0 ? "#6ee7b7" : "#fca5a5" }}>
                      {otpTimer > 0 ? `${t.expiredIn} ${String(Math.floor(otpTimer / 60)).padStart(2, "0")}:${String(otpTimer % 60).padStart(2, "0")}` : t.expired}
                    </span>
                    <button type="button" onClick={handleResendForgotOtp} disabled={otpTimer > 0 || resendCount >= 3} style={{ background: "none", border: "none", fontSize: 12, fontWeight: 700, cursor: otpTimer > 0 || resendCount >= 3 ? "not-allowed" : "pointer", color: otpTimer > 0 || resendCount >= 3 ? "rgba(255,255,255,0.2)" : "#a5b4fc", fontFamily: "inherit" }}>
                      {resendCount >= 3 ? t.maxResend : t.resend}
                    </button>
                  </div>
                  <button className="al-btn" type="submit" disabled={loading || otp.join("").length < 6}>
                    {loading ? <><Spinner />{t.verifying}</> : t.verifyBtn}
                  </button>
                  <button type="button" onClick={() => { setStep(1); setError(""); resetOtp(); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                    {t.back}
                  </button>
                </motion.form>
              )}

              {/* ── FORGOT STEP 3 (New Password) ── */}
              {mode === "forgot" && step === 3 && (
                <motion.form key="forgot3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>{t.newPassword}</label>
                    <div style={{ position: "relative" }}>
                      <input className="al-input" type={showNewPass ? "text" : "password"} value={newPassword} onChange={e => { setNewPassword(e.target.value); setError(""); }} placeholder={t.passwordPlaceholder} style={{ paddingRight: 44 }} />
                      <button type="button" onClick={() => setShowNewPass(v => !v)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 0 }}>
                        <EyeIcon show={showNewPass} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>{t.confirmPassword}</label>
                    <input className="al-input" type="password" value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setError(""); }} placeholder={t.passwordPlaceholder} />
                  </div>
                  <button className="al-btn" type="submit" disabled={loading}>
                    {loading ? <><Spinner />{t.resetting}</> : t.resetBtn}
                  </button>
                </motion.form>
              )}

            </AnimatePresence>
          </div>
        </motion.div>

        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 12, marginTop: 20 }}>
          {lang === "en" ? "Restricted to authorized admins only" : "শুধুমাত্র অনুমোদিত অ্যাডমিনদের জন্য"}
        </p>
      </motion.div>
    </div>
  );
}