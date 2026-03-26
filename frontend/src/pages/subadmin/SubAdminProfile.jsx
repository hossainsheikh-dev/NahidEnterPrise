import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, Shield, Calendar,
  CheckCircle, XCircle, Loader2, Edit2, Save, X, Clock,
  Lock, Send, Eye, EyeOff, AlertCircle,
} from "lucide-react";
import { useSubLang } from "../../context/SubAdminLangContext";
import { showUpdateSuccessToast } from "../../utils/toast/successUpdateToast";

const API          = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;
const PROFILE_API  = `${API}/api/subadmin/profile`;
const PASSWORD_API = `${API}/api/subadmin/change-password`;
const REQUEST_API  = `${API}/api/subadmin/request-change`;
const getToken     = () => localStorage.getItem("subAdminToken") || "";

const STATUS_CFG = {
  approved: { label:"Approved", color:"#059669", bg:"rgba(16,185,129,0.08)", border:"rgba(16,185,129,0.2)", icon:CheckCircle },
  pending:  { label:"Pending",  color:"#d97706", bg:"rgba(245,158,11,0.08)",  border:"rgba(245,158,11,0.2)",  icon:Clock       },
  rejected: { label:"Rejected", color:"#e11d48", bg:"rgba(244,63,94,0.08)",   border:"rgba(244,63,94,0.2)",   icon:XCircle     },
};

const stagger = {
  container: { hidden:{}, show:{ transition:{ staggerChildren:0.07 } } },
  item: { hidden:{ opacity:0, y:14 }, show:{ opacity:1, y:0, transition:{ type:"spring", stiffness:280, damping:24 } } },
};

const inputBase = (err) => ({
  width:"100%", outline:"none",
  background: err ? "rgba(244,63,94,0.03)" : "#f8f9ff",
  border: `1.5px solid ${err ? "rgba(244,63,94,0.35)" : "rgba(99,102,241,0.14)"}`,
  borderRadius:13, padding:"11px 14px",
  fontSize:13.5, color:"#1e293b",
  fontFamily:"'DM Sans',sans-serif",
  transition:"all .18s ease",
});

const cardStyle = {
  background:"linear-gradient(160deg,#ffffff,#fafbff)",
  border:"1px solid rgba(99,102,241,0.10)", borderRadius:20,
  boxShadow:"0 4px 24px rgba(99,102,241,0.07)", overflow:"hidden",
};

const cardHeader = {
  padding:"14px 20px", borderBottom:"1px solid rgba(99,102,241,0.08)",
  background:"rgba(99,102,241,0.025)",
  display:"flex", alignItems:"center", justifyContent:"space-between",
};

const rowIcon = (bg, border, color, Icon) => (
  <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background:bg, border:`1px solid ${border}` }}>
    <Icon size={15} style={{ color }} strokeWidth={1.8} />
  </div>
);

export default function SubAdminProfile() {
  const { t } = useSubLang();

  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  /* name-only edit */
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [nameForm, setNameForm] = useState({ name:"" });
  const [nameErr,  setNameErr]  = useState({});


  /* email/phone change request */
  const [reqOpen,   setReqOpen]   = useState(false);
  const [reqForm,   setReqForm]   = useState({ newEmail:"", newPhone:"" });
  const [reqErr,    setReqErr]    = useState({});
  const [reqSaving, setReqSaving] = useState(false);
  const [reqDone,   setReqDone]   = useState(false);


  /* password change */
  const [pwOpen,   setPwOpen]   = useState(false);
  const [pwForm,   setPwForm]   = useState({ current:"", newPw:"", confirm:"" });
  const [pwErr,    setPwErr]    = useState({});
  const [pwSaving, setPwSaving] = useState(false);
  const [pwDone,   setPwDone]   = useState(false);
  const [showPw,   setShowPw]   = useState({ current:false, newPw:false, confirm:false });


  /* fetch */
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(PROFILE_API, { headers:{ Authorization:`Bearer ${getToken()}` } });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load profile");
        setProfile(data);
        setNameForm({ name: data.name || "" });
        setReqForm({ newEmail: data.email || "", newPhone: data.phone || "" });
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, []);

  const getInitials = (name="") => {
    const w = name.trim().split(/\s+/);
    return ((w[0]?.[0]||"")+(w[1]?.[0]||"")).toUpperCase()||"SA";
  };

  const fmt = (iso) =>
    iso ? new Date(iso).toLocaleDateString("en-BD",{ day:"numeric", month:"long", year:"numeric" }) : "—";



  /* ── Save name ── */
  const handleSaveName = async () => {
    if (!nameForm.name.trim()) { setNameErr({ name: t("নাম আবশ্যক","Name is required") }); return; }
    setNameErr({}); setSaving(true);
    try {
      const res  = await fetch(PROFILE_API, {
        method:"PUT",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${getToken()}` },
        body: JSON.stringify({ name: nameForm.name.trim(), phone: profile.phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      setProfile(data);
      const stored = JSON.parse(localStorage.getItem("subAdminInfo") || "{}");
      localStorage.setItem("subAdminInfo", JSON.stringify({ ...stored, name: data.name }));
      showUpdateSuccessToast(data.name);
      setEditing(false);
    } catch (e) { setNameErr({ general: e.message }); }
    finally { setSaving(false); }
  };




  /* ── Send email/phone change request ── */
  const handleSendRequest = async () => {
    const errs = {};
    if (!reqForm.newEmail.trim()) errs.newEmail = t("ইমেইল আবশ্যক","Email is required");
    if (Object.keys(errs).length) { setReqErr(errs); return; }
    setReqErr({}); setReqSaving(true);
    try {
      const res  = await fetch(REQUEST_API, {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${getToken()}` },
        body: JSON.stringify({ newEmail: reqForm.newEmail.trim(), newPhone: reqForm.newPhone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Request failed");
      setReqDone(true);
      setTimeout(() => { setReqOpen(false); setReqDone(false); }, 3000);
    } catch (e) { setReqErr({ general: e.message }); }
    finally { setReqSaving(false); }
  };



  /* ── Change password ── */
  const handleChangePassword = async () => {
    const errs = {};
    if (!pwForm.current.trim())  errs.current = t("বর্তমান পাসওয়ার্ড দিন","Enter current password");
    if (pwForm.newPw.length < 6) errs.newPw   = t("কমপক্ষে ৬ অক্ষর","At least 6 characters");
    if (pwForm.newPw !== pwForm.confirm) errs.confirm = t("পাসওয়ার্ড মিলছে না","Passwords do not match");
    if (Object.keys(errs).length) { setPwErr(errs); return; }
    setPwErr({}); setPwSaving(true);
    try {
      const res  = await fetch(PASSWORD_API, {
        method:"PUT",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${getToken()}` },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      setPwDone(true);
      setPwForm({ current:"", newPw:"", confirm:"" });
      setTimeout(() => { setPwOpen(false); setPwDone(false); }, 3000);
    } catch (e) { setPwErr({ general: e.message }); }
    finally { setPwSaving(false); }
  };

  const toggleShow = (field) => setShowPw(p => ({ ...p, [field]: !p[field] }));


  
  /* ── Loading / Error ── */
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <Loader2 size={26} className="animate-spin" style={{ color:"#c4cdd8" }} />
      <p style={{ fontSize:13, color:"#94a3b8" }}>{t("লোড হচ্ছে…","Loading…")}</p>
    </div>
  );
  if (error) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <XCircle size={26} style={{ color:"#f43f5e" }} />
      <p style={{ fontSize:13, color:"#f43f5e" }}>{error}</p>
    </div>
  );

  const statusCfg  = STATUS_CFG[profile.status] || STATUS_CFG.pending;
  const StatusIcon = statusCfg.icon;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        .pf-wrap, .pf-wrap * { box-sizing:border-box; font-family:'DM Sans',sans-serif; }
        .pf-syne { font-family:'Syne',sans-serif !important; }
        .pf-pw-toggle { position:absolute; right:14px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#94a3b8; display:flex; align-items:center; }
        .pf-pw-toggle:hover { color:#6366f1; }
      `}</style>

      <div className="pf-wrap px-2 sm:px-4 md:px-6 lg:px-8">

        {/* ── Title ── */}
        <div className="text-center mb-8">
          <h1 className="pf-syne font-black tracking-[-0.03em] text-[20px] sm:text-[24px] md:text-[28px]" style={{ color:"#1e293b" }}>
            {t("আমার প্রোফাইল","My Profile")}
          </h1>
          <p className="text-[12.5px] sm:text-sm mt-1" style={{ color:"#94a3b8" }}>
            {t("আপনার অ্যাকাউন্টের তথ্য দেখুন ও পরিচালনা করুন","View and manage your account")}
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          <motion.div variants={stagger.container} initial="hidden" animate="show" className="space-y-4">

            {/* ── Avatar card ── */}
            <motion.div variants={stagger.item}
              style={{ ...cardStyle, padding:"32px 24px", textAlign:"center", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:-40, right:-40, width:180, height:180, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.08) 0%,transparent 70%)", pointerEvents:"none" }} />
              <motion.div whileHover={{ scale:1.06 }} transition={{ type:"spring", stiffness:360, damping:20 }}
                style={{ width:80, height:80, borderRadius:22, background:"linear-gradient(135deg,#818cf8,#6366f1)", boxShadow:"0 8px 28px rgba(99,102,241,0.38),inset 0 1px 0 rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800, color:"#fff" }}>
                {getInitials(profile.name)}
              </motion.div>
              <p className="pf-syne font-black text-[20px] tracking-[-0.03em]" style={{ color:"#1e293b", marginBottom:8 }}>{profile.name}</p>
              <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 14px", borderRadius:99, fontSize:11.5, fontWeight:700, letterSpacing:".04em", textTransform:"uppercase", background:statusCfg.bg, color:statusCfg.color, border:`1px solid ${statusCfg.border}` }}>
                <StatusIcon size={11} strokeWidth={2.5} />
                {t(profile.status==="approved"?"অনুমোদিত":profile.status==="pending"?"অপেক্ষায়":"প্রত্যাখ্যাত", statusCfg.label)}
              </span>
            </motion.div>

            {/* ── Account details card ── */}
            <motion.div variants={stagger.item} style={cardStyle}>
              <div style={cardHeader}>
                <p className="pf-syne font-black text-[13.5px] tracking-[-0.02em]" style={{ color:"#1e293b" }}>
                  {t("অ্যাকাউন্টের তথ্য","Account Details")}
                </p>
                {!editing ? (
                  <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} onClick={() => setEditing(true)}
                    style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:10, fontSize:12, fontWeight:600, color:"#6366f1", background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.15)", cursor:"pointer" }}>
                    <Edit2 size={12} /> {t("নাম সম্পাদনা","Edit Name")}
                  </motion.button>
                ) : (
                  <div style={{ display:"flex", gap:6 }}>
                    <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} onClick={() => { setEditing(false); setNameErr({}); setNameForm({ name:profile.name }); }}
                      style={{ width:30, height:30, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(244,63,94,0.08)", border:"1px solid rgba(244,63,94,0.18)", color:"#f43f5e", cursor:"pointer" }}>
                      <X size={13} />
                    </motion.button>
                    <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} onClick={handleSaveName} disabled={saving}
                      style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:8, fontSize:12, fontWeight:700, color:"#fff", background:"linear-gradient(135deg,#6366f1,#4f46e5)", border:"none", cursor:saving?"not-allowed":"pointer", boxShadow:"0 3px 10px rgba(99,102,241,0.3)", opacity:saving?0.7:1 }}>
                      {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                      {saving ? t("সংরক্ষণ…","Saving…") : t("সংরক্ষণ","Save")}
                    </motion.button>
                  </div>
                )}
              </div>

              <div style={{ padding:"8px 0" }}>
                <AnimatePresence>
                  {nameErr.general && (
                    <motion.p initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                      style={{ fontSize:12, color:"#f43f5e", padding:"0 20px 8px", fontWeight:500 }}>{nameErr.general}</motion.p>
                  )}
                </AnimatePresence>

                {/* Name */}
                <div style={{ display:"flex", alignItems:editing?"flex-start":"center", gap:14, padding:"12px 20px", borderBottom:"1px solid rgba(99,102,241,0.06)" }}>
                  {rowIcon("rgba(99,102,241,0.09)","rgba(99,102,241,0.18)","#6366f1",User)}
                  <div style={{ flex:1, minWidth:0, marginTop:editing?2:0 }}>
                    <p style={{ fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".06em", marginBottom:4 }}>{t("নাম","Name")}</p>
                    {editing ? (
                      <>
                        <input value={nameForm.name} onChange={e => { setNameForm(f=>({...f,name:e.target.value})); setNameErr({}); }}
                          placeholder={t("আপনার নাম","Your name")} style={inputBase(nameErr.name)}
                          onFocus={e => { e.target.style.background="#fff"; e.target.style.borderColor="rgba(99,102,241,0.45)"; e.target.style.boxShadow="0 0 0 4px rgba(99,102,241,0.08)"; }}
                          onBlur={e  => { e.target.style.background=nameErr.name?"rgba(244,63,94,0.03)":"#f8f9ff"; e.target.style.borderColor=nameErr.name?"rgba(244,63,94,0.35)":"rgba(99,102,241,0.14)"; e.target.style.boxShadow="none"; }} />
                        {nameErr.name && <p style={{ fontSize:12, color:"#f43f5e", marginTop:5, fontWeight:500 }}>{nameErr.name}</p>}
                      </>
                    ) : (
                      <p style={{ fontSize:13.5, fontWeight:600, color:"#1e293b" }}>{profile.name}</p>
                    )}
                  </div>
                </div>

                {/* Email — view only, change via request */}
                <div style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 20px", borderBottom:"1px solid rgba(99,102,241,0.06)" }}>
                  {rowIcon("rgba(14,165,233,0.09)","rgba(14,165,233,0.18)","#0284c7",Mail)}
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".06em", marginBottom:4 }}>{t("ইমেইল","Email")}</p>
                    <p style={{ fontSize:13.5, fontWeight:600, color:"#1e293b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{profile.email}</p>
                    <p style={{ fontSize:11, color:"#c4cdd8", marginTop:2 }}>{t("পরিবর্তন করতে অ্যাডমিনের অনুমতি লাগবে","Requires admin approval to change")}</p>
                  </div>
                </div>

                {/* Phone — view only, change via request */}
                <div style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 20px", borderBottom:"1px solid rgba(99,102,241,0.06)" }}>
                  {rowIcon("rgba(16,185,129,0.09)","rgba(16,185,129,0.18)","#059669",Phone)}
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".06em", marginBottom:4 }}>{t("ফোন","Phone")}</p>
                    <p style={{ fontSize:13.5, fontWeight:profile.phone?600:400, color:profile.phone?"#1e293b":"#c4cdd8", fontStyle:profile.phone?"normal":"italic" }}>
                      {profile.phone || t("যোগ করা হয়নি","Not added")}
                    </p>
                    <p style={{ fontSize:11, color:"#c4cdd8", marginTop:2 }}>{t("পরিবর্তন করতে অ্যাডমিনের অনুমতি লাগবে","Requires admin approval to change")}</p>
                  </div>
                </div>

                {/* Role */}
                <div style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 20px" }}>
                  {rowIcon("rgba(139,92,246,0.09)","rgba(139,92,246,0.18)","#7c3aed",Shield)}
                  <div>
                    <p style={{ fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".06em", marginBottom:4 }}>{t("ভূমিকা","Role")}</p>
                    <p style={{ fontSize:13.5, fontWeight:600, color:"#1e293b", textTransform:"capitalize" }}>{profile.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Email/Phone change request card ── */}
            <motion.div variants={stagger.item} style={cardStyle}>
              <div style={cardHeader}>
                <div>
                  <p className="pf-syne font-black text-[13.5px] tracking-[-0.02em]" style={{ color:"#1e293b" }}>
                    {t("ইমেইল / ফোন পরিবর্তন","Change Email / Phone")}
                  </p>
                  <p style={{ fontSize:11.5, color:"#94a3b8", marginTop:2 }}>
                    {t("অ্যাডমিনের অনুমতি প্রয়োজন","Requires admin approval")}
                  </p>
                </div>
                <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                  onClick={() => { setReqOpen(o=>!o); setReqErr({}); setReqDone(false); }}
                  style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:10, fontSize:12, fontWeight:600, color:reqOpen?"#e11d48":"#6366f1", background:reqOpen?"rgba(244,63,94,0.08)":"rgba(99,102,241,0.08)", border:`1px solid ${reqOpen?"rgba(244,63,94,0.18)":"rgba(99,102,241,0.15)"}`, cursor:"pointer" }}>
                  {reqOpen ? <><X size={12}/> {t("বন্ধ করুন","Close")}</> : <><Send size={12}/> {t("অনুরোধ পাঠান","Send Request")}</>}
                </motion.button>
              </div>

              <AnimatePresence>
                {reqOpen && (
                  <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }}
                    style={{ overflow:"hidden" }}>
                    <div style={{ padding:"16px 20px", display:"flex", flexDirection:"column", gap:14 }}>

                      {/* success */}
                      <AnimatePresence>
                        {reqDone && (
                          <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                            style={{ display:"flex", alignItems:"center", gap:9, padding:"11px 14px", borderRadius:12, background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.2)" }}>
                            <CheckCircle size={15} style={{ color:"#059669", flexShrink:0 }} />
                            <p style={{ fontSize:13, fontWeight:600, color:"#059669" }}>{t("অনুরোধ পাঠানো হয়েছে!","Request sent to admin!")}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* notice */}
                      <div style={{ display:"flex", alignItems:"flex-start", gap:9, padding:"11px 14px", borderRadius:12, background:"rgba(245,158,11,0.07)", border:"1px solid rgba(245,158,11,0.2)" }}>
                        <AlertCircle size={14} style={{ color:"#d97706", flexShrink:0, marginTop:1 }} />
                        <p style={{ fontSize:12.5, color:"#92400e", lineHeight:1.55 }}>
                          {t("এই অনুরোধটি অ্যাডমিনের কাছে পাঠানো হবে। অ্যাডমিন অনুমোদন করলে আপনার তথ্য আপডেট হবে।","This request will be sent to the admin. Your info will be updated after approval.")}
                        </p>
                      </div>

                      {/* new email */}
                      <div>
                        <label style={{ fontSize:11.5, fontWeight:700, color:"#64748b", letterSpacing:".06em", textTransform:"uppercase", display:"block", marginBottom:7 }}>
                          {t("নতুন ইমেইল","New Email")} <span style={{ color:"#f43f5e" }}>*</span>
                        </label>
                        <input value={reqForm.newEmail} onChange={e => { setReqForm(f=>({...f,newEmail:e.target.value})); setReqErr({}); }}
                          placeholder="example@gmail.com"
                          style={inputBase(reqErr.newEmail)}
                          onFocus={e => { e.target.style.background="#fff"; e.target.style.borderColor="rgba(99,102,241,0.45)"; e.target.style.boxShadow="0 0 0 4px rgba(99,102,241,0.08)"; }}
                          onBlur={e  => { e.target.style.background="#f8f9ff"; e.target.style.borderColor="rgba(99,102,241,0.14)"; e.target.style.boxShadow="none"; }} />
                        {reqErr.newEmail && <p style={{ fontSize:12, color:"#f43f5e", marginTop:5, fontWeight:500 }}>{reqErr.newEmail}</p>}
                      </div>

                      {/* new phone */}
                      <div>
                        <label style={{ fontSize:11.5, fontWeight:700, color:"#64748b", letterSpacing:".06em", textTransform:"uppercase", display:"block", marginBottom:7 }}>
                          {t("নতুন ফোন নম্বর","New Phone Number")}
                        </label>
                        <input value={reqForm.newPhone} onChange={e => setReqForm(f=>({...f,newPhone:e.target.value}))}
                          placeholder="+880 1xxxxxxxxx"
                          style={inputBase(false)}
                          onFocus={e => { e.target.style.background="#fff"; e.target.style.borderColor="rgba(99,102,241,0.45)"; e.target.style.boxShadow="0 0 0 4px rgba(99,102,241,0.08)"; }}
                          onBlur={e  => { e.target.style.background="#f8f9ff"; e.target.style.borderColor="rgba(99,102,241,0.14)"; e.target.style.boxShadow="none"; }} />
                      </div>

                      {reqErr.general && <p style={{ fontSize:12, color:"#f43f5e", fontWeight:500 }}>{reqErr.general}</p>}

                      <motion.button whileHover={{ scale:1.02, y:-1 }} whileTap={{ scale:0.97 }}
                        onClick={handleSendRequest} disabled={reqSaving}
                        style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px 20px", borderRadius:13, fontSize:13.5, fontWeight:700, color:"#fff", background:"linear-gradient(135deg,#6366f1,#4f46e5)", border:"none", cursor:reqSaving?"not-allowed":"pointer", boxShadow:"0 6px 20px rgba(99,102,241,0.32),inset 0 1px 0 rgba(255,255,255,0.18)", opacity:reqSaving?0.7:1, letterSpacing:"-.01em" }}>
                        {reqSaving ? <><Loader2 size={14} className="animate-spin" />{t("পাঠানো হচ্ছে…","Sending…")}</> : <><Send size={14}/>{t("অ্যাডমিনের কাছে পাঠান","Send to Admin")}</>}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ── Password change card ── */}
            <motion.div variants={stagger.item} style={cardStyle}>
              <div style={cardHeader}>
                <div>
                  <p className="pf-syne font-black text-[13.5px] tracking-[-0.02em]" style={{ color:"#1e293b" }}>
                    {t("পাসওয়ার্ড পরিবর্তন","Change Password")}
                  </p>
                  <p style={{ fontSize:11.5, color:"#94a3b8", marginTop:2 }}>
                    {t("যেকোনো সময় পাসওয়ার্ড পরিবর্তন করুন","Update your password anytime")}
                  </p>
                </div>
                <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                  onClick={() => { setPwOpen(o=>!o); setPwErr({}); setPwDone(false); setPwForm({ current:"", newPw:"", confirm:"" }); }}
                  style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:10, fontSize:12, fontWeight:600, color:pwOpen?"#e11d48":"#6366f1", background:pwOpen?"rgba(244,63,94,0.08)":"rgba(99,102,241,0.08)", border:`1px solid ${pwOpen?"rgba(244,63,94,0.18)":"rgba(99,102,241,0.15)"}`, cursor:"pointer" }}>
                  {pwOpen ? <><X size={12}/>{t("বন্ধ করুন","Close")}</> : <><Lock size={12}/>{t("পরিবর্তন করুন","Change")}</>}
                </motion.button>
              </div>

              <AnimatePresence>
                {pwOpen && (
                  <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }}
                    style={{ overflow:"hidden" }}>
                    <div style={{ padding:"16px 20px", display:"flex", flexDirection:"column", gap:14 }}>

                      <AnimatePresence>
                        {pwDone && (
                          <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                            style={{ display:"flex", alignItems:"center", gap:9, padding:"11px 14px", borderRadius:12, background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.2)" }}>
                            <CheckCircle size={15} style={{ color:"#059669", flexShrink:0 }} />
                            <p style={{ fontSize:13, fontWeight:600, color:"#059669" }}>{t("পাসওয়ার্ড পরিবর্তন হয়েছে!","Password changed successfully!")}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* current password */}
                      {[
                        { key:"current",  label:t("বর্তমান পাসওয়ার্ড","Current Password"),  placeholder:"••••••••" },
                        { key:"newPw",    label:t("নতুন পাসওয়ার্ড","New Password"),          placeholder:t("কমপক্ষে ৬ অক্ষর","At least 6 characters") },
                        { key:"confirm",  label:t("নতুন পাসওয়ার্ড নিশ্চিত করুন","Confirm New Password"), placeholder:"••••••••" },
                      ].map(({ key, label, placeholder }) => (
                        <div key={key}>
                          <label style={{ fontSize:11.5, fontWeight:700, color:"#64748b", letterSpacing:".06em", textTransform:"uppercase", display:"block", marginBottom:7 }}>
                            {label}
                          </label>
                          <div style={{ position:"relative" }}>
                            <input
                              type={showPw[key] ? "text" : "password"}
                              value={pwForm[key]}
                              onChange={e => { setPwForm(f=>({...f,[key]:e.target.value})); setPwErr(p=>({...p,[key]:""})); }}
                              placeholder={placeholder}
                              style={{ ...inputBase(pwErr[key]), paddingRight:42 }}
                              onFocus={e => { e.target.style.background="#fff"; e.target.style.borderColor="rgba(99,102,241,0.45)"; e.target.style.boxShadow="0 0 0 4px rgba(99,102,241,0.08)"; }}
                              onBlur={e  => { e.target.style.background=pwErr[key]?"rgba(244,63,94,0.03)":"#f8f9ff"; e.target.style.borderColor=pwErr[key]?"rgba(244,63,94,0.35)":"rgba(99,102,241,0.14)"; e.target.style.boxShadow="none"; }}
                            />
                            <button className="pf-pw-toggle" type="button" onClick={() => toggleShow(key)}>
                              {showPw[key] ? <EyeOff size={15}/> : <Eye size={15}/>}
                            </button>
                          </div>
                          {pwErr[key] && <p style={{ fontSize:12, color:"#f43f5e", marginTop:5, fontWeight:500 }}>{pwErr[key]}</p>}
                        </div>
                      ))}

                      {pwErr.general && <p style={{ fontSize:12, color:"#f43f5e", fontWeight:500 }}>{pwErr.general}</p>}

                      <motion.button whileHover={{ scale:1.02, y:-1 }} whileTap={{ scale:0.97 }}
                        onClick={handleChangePassword} disabled={pwSaving}
                        style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px 20px", borderRadius:13, fontSize:13.5, fontWeight:700, color:"#fff", background:"linear-gradient(135deg,#6366f1,#4f46e5)", border:"none", cursor:pwSaving?"not-allowed":"pointer", boxShadow:"0 6px 20px rgba(99,102,241,0.32),inset 0 1px 0 rgba(255,255,255,0.18)", opacity:pwSaving?0.7:1, letterSpacing:"-.01em" }}>
                        {pwSaving ? <><Loader2 size={14} className="animate-spin" />{t("পরিবর্তন হচ্ছে…","Changing…")}</> : <><Lock size={14}/>{t("পাসওয়ার্ড পরিবর্তন করুন","Change Password")}</>}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ── Dates card ── */}
            <motion.div variants={stagger.item} style={cardStyle}>
              <div style={{ ...cardHeader, justifyContent:"flex-start" }}>
                <p className="pf-syne font-black text-[13.5px] tracking-[-0.02em]" style={{ color:"#1e293b" }}>
                  {t("তারিখ","Dates")}
                </p>
              </div>
              {[
                { label:t("নিবন্ধন তারিখ","Registered"), value:fmt(profile.createdAt), color:"#6366f1", bg:"rgba(99,102,241,0.07)" },
                { label:t("অনুমোদনের তারিখ","Approved At"), value:fmt(profile.approvedAt), color:"#059669", bg:"rgba(16,185,129,0.07)" },
              ].map((row, i, arr) => (
                <div key={row.label} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 20px", borderBottom:i<arr.length-1?"1px solid rgba(99,102,241,0.06)":"none" }}>
                  <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background:row.bg, border:`1px solid ${row.bg.replace("0.07","0.15")}` }}>
                    <Calendar size={15} style={{ color:row.color }} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p style={{ fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".06em", marginBottom:4 }}>{row.label}</p>
                    <p style={{ fontSize:13.5, fontWeight:600, color:"#1e293b" }}>{row.value}</p>
                  </div>
                </div>
              ))}
            </motion.div>

          </motion.div>
        </div>
      </div>
    </>
  );
}