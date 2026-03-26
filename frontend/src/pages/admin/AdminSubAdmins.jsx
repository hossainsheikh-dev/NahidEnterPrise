import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, ShieldX, Trash2, Clock, CheckCircle,
  XCircle, Loader, AlertCircle, RefreshCw, Users,
  Mail, Calendar, Search, X, UserCog, Phone,
} from "lucide-react";
import { useAdminLang } from "../../context/AdminLangContext";

const API = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;
const getToken = () => localStorage.getItem("token") || "";

const STATUS_CONFIG = {
  pending:  { labelEn: "Pending",  labelBn: "অপেক্ষমাণ",   color: "#e8a427", bg: "rgba(232,164,39,0.1)",  border: "rgba(232,164,39,0.25)", icon: Clock        },
  approved: { labelEn: "Approved", labelBn: "অনুমোদিত",    color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.25)", icon: CheckCircle  },
  rejected: { labelEn: "Rejected", labelBn: "প্রত্যাখ্যাত", color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.2)", icon: XCircle      },
};

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#fa709a,#fee140)",
  "linear-gradient(135deg,#a18cd1,#fbc2eb)",
];

export default function AdminSubAdmins() {
  const { t } = useAdminLang();

  const [subAdmins,      setSubAdmins]      = useState([]);
  const [changeReqs,     setChangeReqs]     = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [crLoading,      setCrLoading]      = useState(true);
  const [actionId,       setActionId]       = useState(null);
  const [crActionId,     setCrActionId]     = useState(null);
  const [toast,          setToast]          = useState(null);
  const [filter,         setFilter]         = useState("all");
  const [search,         setSearch]         = useState("");
  const [confirmModal,   setConfirmModal]   = useState(null);
  const [crConfirmModal, setCrConfirmModal] = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Fetch subadmins ── */
  const fetchSubAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const r = await fetch(`${API}/api/subadmin`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!r.ok) throw new Error();
      const d = await r.json();
      setSubAdmins(d);
    } catch {
      showToast("error", t("সাব-অ্যাডমিন লোড করতে ব্যর্থ।","Failed to load SubAdmins."));
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Fetch change requests ── */
  const fetchChangeRequests = useCallback(async () => {
    try {
      setCrLoading(true);
      const r = await fetch(`${API}/api/subadmin/change-requests`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!r.ok) throw new Error();
      const d = await r.json();
      setChangeReqs(d.data || []);
    } catch {
      /* silent — not critical */
    } finally {
      setCrLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubAdmins(); fetchChangeRequests(); }, [fetchSubAdmins, fetchChangeRequests]);

  /* ── SubAdmin actions ── */
  const handleApprove = async (id) => {
    setActionId(id);
    try {
      const r = await fetch(`${API}/api/subadmin/approve/${id}`, { method:"PUT", headers:{ Authorization:`Bearer ${getToken()}` } });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      setSubAdmins(prev => prev.map(s => s._id === id ? { ...s, status:"approved" } : s));
      showToast("success", t("সাব-অ্যাডমিন অনুমোদিত!","SubAdmin approved!"));
    } catch (err) { showToast("error", err.message || t("অ্যাকশন ব্যর্থ।","Action failed.")); }
    finally { setActionId(null); setConfirmModal(null); }
  };

  const handleReject = async (id) => {
    setActionId(id);
    try {
      const r = await fetch(`${API}/api/subadmin/reject/${id}`, { method:"PUT", headers:{ Authorization:`Bearer ${getToken()}` } });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      setSubAdmins(prev => prev.map(s => s._id === id ? { ...s, status:"rejected" } : s));
      showToast("success", t("প্রত্যাখ্যান করা হয়েছে।","SubAdmin rejected."));
    } catch (err) { showToast("error", err.message || t("অ্যাকশন ব্যর্থ।","Action failed.")); }
    finally { setActionId(null); setConfirmModal(null); }
  };

  const handleDelete = async (id) => {
    setActionId(id);
    try {
      const r = await fetch(`${API}/api/subadmin/${id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${getToken()}` } });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      setSubAdmins(prev => prev.filter(s => s._id !== id));
      showToast("success", t("ডিলিট সম্পন্ন।","SubAdmin deleted."));
    } catch (err) { showToast("error", err.message || t("অ্যাকশন ব্যর্থ।","Action failed.")); }
    finally { setActionId(null); setConfirmModal(null); }
  };

  /* ── Change request actions ── */
  const handleResolveChangeReq = async (subAdminId, requestId, action) => {
    setCrActionId(requestId);
    try {
      const r = await fetch(`${API}/api/subadmin/change-requests/resolve`, {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${getToken()}` },
        body: JSON.stringify({ subAdminId, requestId, action }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      setChangeReqs(prev => prev.filter(cr => cr.requestId.toString() !== requestId.toString()));
      showToast("success", action === "approve"
        ? t("পরিবর্তন অনুমোদিত ও প্রয়োগ হয়েছে।","Change approved and applied.")
        : t("পরিবর্তন প্রত্যাখ্যাত।","Change rejected.")
      );
      fetchSubAdmins(); // refresh list to show updated email/phone
    } catch (err) { showToast("error", err.message || t("অ্যাকশন ব্যর্থ।","Action failed.")); }
    finally { setCrActionId(null); setCrConfirmModal(null); }
  };

  const counts = {
    all:      subAdmins.length,
    pending:  subAdmins.filter(s => s.status === "pending").length,
    approved: subAdmins.filter(s => s.status === "approved").length,
    rejected: subAdmins.filter(s => s.status === "rejected").length,
  };

  const filtered = subAdmins.filter(s => {
    const matchFilter = filter === "all" || s.status === filter;
    const matchSearch = !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-BD", { day:"numeric", month:"short", year:"numeric" }) : "—";
  const getGradient = (name="") => AVATAR_GRADIENTS[(name.charCodeAt(0) || 0) % AVATAR_GRADIENTS.length];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        .sa-wrap { font-family: 'DM Sans', sans-serif; }
        .sa-tab { display:inline-flex; align-items:center; gap:6px; padding:7px 14px; border-radius:10px; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.18s; border:1px solid transparent; white-space:nowrap; }
        .sa-tab-count { min-width:18px; height:18px; border-radius:6px; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; padding:0 4px; }
        .sa-card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:18px; padding:18px 20px; transition:all 0.2s; position:relative; overflow:hidden; }
        .sa-card::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,0.02) 0%,transparent 60%); pointer-events:none; }
        .sa-card:hover { background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.1); transform:translateY(-1px); box-shadow:0 8px 32px rgba(0,0,0,0.3); }
        .sa-btn { display:inline-flex; align-items:center; gap:6px; padding:7px 14px; border-radius:10px; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.15s; border:1px solid transparent; font-family:'DM Sans',sans-serif; }
        .sa-btn:disabled { opacity:0.45; cursor:not-allowed; }
        .sa-btn:not(:disabled):hover { transform:translateY(-1px); }
        .sa-btn:not(:disabled):active { transform:scale(0.96); }
        .sa-btn-approve { background:rgba(52,211,153,0.1); border-color:rgba(52,211,153,0.2); color:#34d399; }
        .sa-btn-approve:not(:disabled):hover { background:rgba(52,211,153,0.18); border-color:rgba(52,211,153,0.35); box-shadow:0 4px 12px rgba(52,211,153,0.15); }
        .sa-btn-reject { background:rgba(232,164,39,0.1); border-color:rgba(232,164,39,0.2); color:#e8a427; }
        .sa-btn-reject:not(:disabled):hover { background:rgba(232,164,39,0.18); border-color:rgba(232,164,39,0.35); box-shadow:0 4px 12px rgba(232,164,39,0.15); }
        .sa-btn-delete { width:34px; height:34px; padding:0; display:flex; align-items:center; justify-content:center; border-radius:10px; background:rgba(248,113,113,0.08); border:1px solid rgba(248,113,113,0.15); color:#f87171; cursor:pointer; transition:all 0.15s; font-family:'DM Sans',sans-serif; }
        .sa-btn-delete:disabled { opacity:0.4; cursor:not-allowed; }
        .sa-btn-delete:not(:disabled):hover { background:rgba(248,113,113,0.16); border-color:rgba(248,113,113,0.3); box-shadow:0 4px 12px rgba(248,113,113,0.15); }
        .sa-search-wrap { position:relative; }
        .sa-search-input { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:11px 16px 11px 40px; font-size:13px; color:#e2e8f0; outline:none; transition:border-color 0.2s,background 0.2s; font-family:'DM Sans',sans-serif; }
        .sa-search-input::placeholder { color:#475569; }
        .sa-search-input:focus { border-color:rgba(201,168,76,0.35); background:rgba(201,168,76,0.03); }
        .sa-search-icon { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:#475569; pointer-events:none; }
        .sa-search-clear { position:absolute; right:12px; top:50%; transform:translateY(-50%); color:#475569; cursor:pointer; transition:color 0.15s; }
        .sa-search-clear:hover { color:#94a3b8; }
        .sa-toast-success { background:rgba(17,24,39,0.95); border:1px solid rgba(52,211,153,0.3); color:#34d399; backdrop-filter:blur(20px); }
        .sa-toast-error { background:rgba(17,24,39,0.95); border:1px solid rgba(248,113,113,0.3); color:#f87171; backdrop-filter:blur(20px); }
        .sa-modal { background:#111827; border:1px solid rgba(255,255,255,0.08); border-radius:22px; box-shadow:0 30px 80px rgba(0,0,0,0.6); }
        .sa-stat { flex:1; min-width:0; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:14px 16px; display:flex; flex-direction:column; gap:4px; transition:all 0.2s; }
        .sa-stat:hover { background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.1); }
      `}</style>

      <div className="sa-wrap max-w-4xl mx-auto pb-12 px-0 sm:px-2">

        {/* ══ TOAST ══ */}
        <AnimatePresence>
          {toast && (
            <motion.div
              className={`fixed bottom-6 left-1/2 z-[60] flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-semibold ${toast.type==="success"?"sa-toast-success":"sa-toast-error"}`}
              style={{ whiteSpace:"nowrap", boxShadow:"0 8px 32px rgba(0,0,0,0.4)" }}
              initial={{ opacity:0, y:20, x:"-50%" }} animate={{ opacity:1, y:0, x:"-50%" }} exit={{ opacity:0, y:10, x:"-50%" }}>
              {toast.type==="success" ? <CheckCircle size={15}/> : <AlertCircle size={15}/>}
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══ CONFIRM MODAL (subadmin actions) ══ */}
        <AnimatePresence>
          {confirmModal && (
            <>
              <motion.div className="fixed inset-0 z-40" style={{ background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)" }}
                initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={() => setConfirmModal(null)}/>
              <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <motion.div className="sa-modal pointer-events-auto w-full max-w-sm p-7"
                  initial={{ scale:0.92, opacity:0, y:10 }} animate={{ scale:1, opacity:1, y:0 }} exit={{ scale:0.92, opacity:0, y:10 }}
                  transition={{ type:"spring", damping:26, stiffness:300 }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                    style={{ background:confirmModal.type==="delete"?"rgba(248,113,113,0.1)":confirmModal.type==="approve"?"rgba(52,211,153,0.1)":"rgba(232,164,39,0.1)", border:`1px solid ${confirmModal.type==="delete"?"rgba(248,113,113,0.2)":confirmModal.type==="approve"?"rgba(52,211,153,0.2)":"rgba(232,164,39,0.2)"}` }}>
                    {confirmModal.type==="delete" ? <Trash2 size={22} color="#f87171"/> : confirmModal.type==="approve" ? <ShieldCheck size={22} color="#34d399"/> : <ShieldX size={22} color="#e8a427"/>}
                  </div>
                  <h3 className="text-base font-bold text-center mb-2" style={{ color:"#f1f5f9", letterSpacing:"-0.01em" }}>
                    {confirmModal.type==="delete" ? t("সাব-অ্যাডমিন ডিলিট করবেন?","Delete SubAdmin?") : confirmModal.type==="approve" ? t("সাব-অ্যাডমিন অনুমোদন করবেন?","Approve SubAdmin?") : t("সাব-অ্যাডমিন প্রত্যাখ্যান করবেন?","Reject SubAdmin?")}
                  </h3>
                  <p className="text-sm text-center mb-7" style={{ color:"#64748b" }}>
                    {confirmModal.type==="delete" ? t("এই অ্যাকশন পূর্বাবস্থায় ফেরানো যাবে না।","This action cannot be undone.") : confirmModal.type==="approve" ? t("সাব-অ্যাডমিনকে অনুমোদনের ইমেইল পাঠানো হবে।","An approval email will be sent.") : t("সাব-অ্যাডমিনকে প্রত্যাখ্যানের ইমেইল পাঠানো হবে।","A rejection email will be sent.")}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setConfirmModal(null)} className="sa-btn py-3 justify-center" style={{ background:"rgba(255,255,255,0.05)", borderColor:"rgba(255,255,255,0.08)", color:"#64748b" }}>{t("বাতিল","Cancel")}</button>
                    <button onClick={() => { if (confirmModal.type==="approve") handleApprove(confirmModal.id); else if (confirmModal.type==="reject") handleReject(confirmModal.id); else handleDelete(confirmModal.id); }} disabled={actionId===confirmModal.id} className="sa-btn py-3 justify-center"
                      style={{ background:confirmModal.type==="delete"?"linear-gradient(135deg,#f87171,#ef4444)":confirmModal.type==="approve"?"linear-gradient(135deg,#34d399,#10b981)":"linear-gradient(135deg,#fbbf24,#e8a427)", color:"#fff", boxShadow:confirmModal.type==="delete"?"0 4px 16px rgba(248,113,113,0.3)":confirmModal.type==="approve"?"0 4px 16px rgba(52,211,153,0.3)":"0 4px 16px rgba(232,164,39,0.3)" }}>
                      {actionId===confirmModal.id ? <Loader size={14} className="animate-spin"/> : t("নিশ্চিত","Confirm")}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ══ CONFIRM MODAL (change requests) ══ */}
        <AnimatePresence>
          {crConfirmModal && (
            <>
              <motion.div className="fixed inset-0 z-40" style={{ background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)" }}
                initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={() => setCrConfirmModal(null)}/>
              <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <motion.div className="sa-modal pointer-events-auto w-full max-w-sm p-7"
                  initial={{ scale:0.92, opacity:0, y:10 }} animate={{ scale:1, opacity:1, y:0 }} exit={{ scale:0.92, opacity:0, y:10 }}
                  transition={{ type:"spring", damping:26, stiffness:300 }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                    style={{ background:crConfirmModal.action==="approve"?"rgba(52,211,153,0.1)":"rgba(248,113,113,0.1)", border:`1px solid ${crConfirmModal.action==="approve"?"rgba(52,211,153,0.2)":"rgba(248,113,113,0.2)"}` }}>
                    {crConfirmModal.action==="approve" ? <CheckCircle size={22} color="#34d399"/> : <XCircle size={22} color="#f87171"/>}
                  </div>
                  <h3 className="text-base font-bold text-center mb-2" style={{ color:"#f1f5f9" }}>
                    {crConfirmModal.action==="approve" ? t("পরিবর্তন অনুমোদন করবেন?","Approve this change?") : t("পরিবর্তন প্রত্যাখ্যান করবেন?","Reject this change?")}
                  </h3>
                  <div className="rounded-xl p-3 mb-6 text-center" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}>
                    <p className="text-xs" style={{ color:"#94a3b8" }}>{crConfirmModal.type === "email" ? "Email" : "Phone"}</p>
                    <p className="text-sm font-bold mt-1" style={{ color:"#f1f5f9" }}>{crConfirmModal.newValue}</p>
                    <p className="text-xs mt-1" style={{ color:"#475569" }}>{crConfirmModal.subAdminName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setCrConfirmModal(null)} className="sa-btn py-3 justify-center" style={{ background:"rgba(255,255,255,0.05)", borderColor:"rgba(255,255,255,0.08)", color:"#64748b" }}>{t("বাতিল","Cancel")}</button>
                    <button onClick={() => handleResolveChangeReq(crConfirmModal.subAdminId, crConfirmModal.requestId, crConfirmModal.action)}
                      disabled={crActionId===crConfirmModal.requestId} className="sa-btn py-3 justify-center"
                      style={{ background:crConfirmModal.action==="approve"?"linear-gradient(135deg,#34d399,#10b981)":"linear-gradient(135deg,#f87171,#ef4444)", color:"#fff" }}>
                      {crActionId===crConfirmModal.requestId ? <Loader size={14} className="animate-spin"/> : t("নিশ্চিত","Confirm")}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ══ HEADER ══ */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
          className="relative rounded-2xl overflow-hidden mb-6"
          style={{ background:"linear-gradient(135deg,#0d1426 0%,#111827 50%,#0f172a 100%)", border:"1px solid rgba(255,255,255,0.07)", boxShadow:"0 20px 60px rgba(0,0,0,0.4)" }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.6) 30%,rgba(139,92,246,0.6) 70%,transparent)" }}/>
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage:"linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize:"32px 32px" }}/>
          <div className="absolute pointer-events-none" style={{ top:"-60px", right:"-40px", width:"220px", height:"220px", borderRadius:"50%", background:"radial-gradient(circle,rgba(201,168,76,0.08) 0%,transparent 70%)" }}/>
          <div className="absolute pointer-events-none" style={{ bottom:"-40px", left:"-20px", width:"160px", height:"160px", borderRadius:"50%", background:"radial-gradient(circle,rgba(139,92,246,0.07) 0%,transparent 70%)" }}/>
          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background:"linear-gradient(135deg,rgba(201,168,76,0.15),rgba(201,168,76,0.05))", border:"1px solid rgba(201,168,76,0.2)" }}>
                  <ShieldCheck size={22} style={{ color:"#c9a84c" }}/>
                </div>
                <div>
                  <h1 style={{ fontFamily:"'Instrument Serif',serif", fontSize:"22px", color:"#f1f5f9", letterSpacing:"-0.01em", lineHeight:1.2 }}>
                    {t("সাব-অ্যাডমিন ম্যানেজমেন্ট","SubAdmin Management")}
                  </h1>
                  <p className="text-xs mt-1" style={{ color:"#475569" }}>
                    {t("অ্যাক্সেস রিকোয়েস্ট পর্যালোচনা ও পরিচালনা করুন","Review and manage access requests")}
                  </p>
                </div>
              </div>
              <button onClick={() => { fetchSubAdmins(); fetchChangeRequests(); }} className="sa-btn self-start sm:self-auto"
                style={{ background:"rgba(255,255,255,0.05)", borderColor:"rgba(255,255,255,0.08)", color:"#94a3b8", padding:"9px 16px" }}>
                <RefreshCw size={13}/> {t("রিফ্রেশ","Refresh")}
              </button>
            </div>
            <div className="flex gap-3 flex-wrap sm:flex-nowrap">
              {[
                { key:"all", labelBn:"মোট", labelEn:"Total", count:counts.all, color:"#c9a84c" },
                { key:"pending", labelBn:"অপেক্ষমাণ", labelEn:"Pending", count:counts.pending, color:"#e8a427" },
                { key:"approved", labelBn:"অনুমোদিত", labelEn:"Approved", count:counts.approved, color:"#34d399" },
                { key:"rejected", labelBn:"প্রত্যাখ্যাত", labelEn:"Rejected", count:counts.rejected, color:"#f87171" },
              ].map(({ key, labelBn, labelEn, count, color }) => (
                <motion.button key={key} whileTap={{ scale:0.96 }} onClick={() => setFilter(key)} className="sa-stat text-left"
                  style={{ borderColor:filter===key?`${color}30`:"rgba(255,255,255,0.06)", background:filter===key?`${color}08`:"rgba(255,255,255,0.03)", boxShadow:filter===key?`0 0 0 1px ${color}20`:"none", cursor:"pointer" }}>
                  <span className="text-2xl font-bold" style={{ color:filter===key?color:"#94a3b8", lineHeight:1 }}>{count}</span>
                  <span className="text-[11px] font-medium" style={{ color:filter===key?color:"#475569" }}>{t(labelBn, labelEn)}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ══ CHANGE REQUESTS SECTION ══ */}
        <AnimatePresence>
          {(crLoading || changeReqs.length > 0) && (
            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
              className="mb-6 rounded-2xl overflow-hidden"
              style={{ background:"rgba(56,189,248,0.04)", border:"1px solid rgba(56,189,248,0.18)", boxShadow:"0 4px 24px rgba(56,189,248,0.08)" }}>

              {/* section header */}
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom:"1px solid rgba(56,189,248,0.12)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:"rgba(56,189,248,0.12)", border:"1px solid rgba(56,189,248,0.22)" }}>
                    <UserCog size={15} style={{ color:"#38bdf8" }}/>
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color:"#e2e8f0" }}>
                      {t("প্রোফাইল পরিবর্তনের অনুরোধ","Profile Change Requests")}
                    </p>
                    <p className="text-xs" style={{ color:"#475569" }}>
                      {t("সাব-অ্যাডমিনের ইমেইল / ফোন পরিবর্তনের অনুমোদন দিন","Approve or reject email/phone change requests")}
                    </p>
                  </div>
                </div>
                {changeReqs.length > 0 && (
                  <span className="text-[11px] font-black px-2.5 py-1 rounded-full" style={{ background:"rgba(56,189,248,0.15)", color:"#38bdf8", border:"1px solid rgba(56,189,248,0.25)" }}>
                    {changeReqs.length}
                  </span>
                )}
              </div>

              {/* requests list */}
              <div className="p-4 space-y-3">
                {crLoading ? (
                  <div className="flex items-center justify-center py-6 gap-2">
                    <Loader size={16} className="animate-spin" style={{ color:"#38bdf8" }}/>
                    <span className="text-xs" style={{ color:"#475569" }}>{t("লোড হচ্ছে…","Loading…")}</span>
                  </div>
                ) : changeReqs.length === 0 ? (
                  <p className="text-center text-xs py-4" style={{ color:"#475569" }}>
                    {t("কোনো অনুরোধ নেই","No pending requests")}
                  </p>
                ) : (
                  changeReqs.map((cr, idx) => (
                    <motion.div key={cr.requestId} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:idx*0.05 }}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl"
                      style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>

                      {/* type icon */}
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background:cr.type==="email"?"rgba(99,102,241,0.12)":"rgba(16,185,129,0.12)", border:`1px solid ${cr.type==="email"?"rgba(99,102,241,0.22)":"rgba(16,185,129,0.22)"}` }}>
                        {cr.type === "email"
                          ? <Mail size={14} style={{ color:cr.type==="email"?"#818cf8":"#34d399" }}/>
                          : <Phone size={14} style={{ color:"#34d399" }}/>
                        }
                      </div>

                      {/* info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold" style={{ color:"#f1f5f9" }}>{cr.subAdminName}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wide"
                            style={{ background:cr.type==="email"?"rgba(99,102,241,0.12)":"rgba(16,185,129,0.12)", color:cr.type==="email"?"#818cf8":"#34d399", border:`1px solid ${cr.type==="email"?"rgba(99,102,241,0.2)":"rgba(16,185,129,0.2)"}` }}>
                            {cr.type}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color:"#475569" }}>
                          <span>
                            {t("বর্তমান","Current")}: <span style={{ color:"#64748b" }}>{cr.type==="email" ? cr.subAdminEmail : (cr.currentPhone||"—")}</span>
                          </span>
                          <span style={{ color:"#334155" }}>→</span>
                          <span>
                            {t("নতুন","New")}: <span className="font-semibold" style={{ color:"#38bdf8" }}>{cr.newValue}</span>
                          </span>
                          <span style={{ color:"#334155" }}>·</span>
                          <span>{fmtDate(cr.createdAt)}</span>
                        </div>
                      </div>

                      {/* action buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => setCrConfirmModal({ requestId:cr.requestId, subAdminId:cr.subAdminId, subAdminName:cr.subAdminName, type:cr.type, newValue:cr.newValue, action:"approve" })}
                          disabled={crActionId===cr.requestId}
                          className="sa-btn sa-btn-approve">
                          {crActionId===cr.requestId ? <Loader size={12} className="animate-spin"/> : <CheckCircle size={13}/>}
                          {t("অনুমোদন","Approve")}
                        </button>
                        <button
                          onClick={() => setCrConfirmModal({ requestId:cr.requestId, subAdminId:cr.subAdminId, subAdminName:cr.subAdminName, type:cr.type, newValue:cr.newValue, action:"reject" })}
                          disabled={crActionId===cr.requestId}
                          className="sa-btn sa-btn-reject">
                          <XCircle size={13}/>
                          {t("প্রত্যাখ্যান","Reject")}
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══ SEARCH + FILTER TABS ══ */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="sa-search-wrap flex-1">
            <Search size={14} className="sa-search-icon"/>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t("নাম বা ইমেইল দিয়ে খুঁজুন…","Search by name or email…")}
              className="sa-search-input"/>
            {search && <button className="sa-search-clear" onClick={() => setSearch("")}><X size={13}/></button>}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { key:"all", labelBn:"সব", labelEn:"All", color:"#94a3b8" },
              { key:"pending", labelBn:"অপেক্ষমাণ", labelEn:"Pending", color:"#e8a427" },
              { key:"approved", labelBn:"অনুমোদিত", labelEn:"Approved", color:"#34d399" },
              { key:"rejected", labelBn:"প্রত্যাখ্যাত", labelEn:"Rejected", color:"#f87171" },
            ].map(({ key, labelBn, labelEn, color }) => (
              <button key={key} onClick={() => setFilter(key)} className="sa-tab"
                style={{ background:filter===key?`${color}12`:"rgba(255,255,255,0.03)", borderColor:filter===key?`${color}25`:"rgba(255,255,255,0.07)", color:filter===key?color:"#475569" }}>
                {t(labelBn, labelEn)}
                <span className="sa-tab-count" style={{ background:filter===key?`${color}18`:"rgba(255,255,255,0.05)", color:filter===key?color:"#475569" }}>
                  {key==="all"?counts.all:key==="pending"?counts.pending:key==="approved"?counts.approved:counts.rejected}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ══ SUBADMIN LIST ══ */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background:"rgba(201,168,76,0.08)", border:"1px solid rgba(201,168,76,0.15)" }}>
              <Loader size={20} className="animate-spin" style={{ color:"#c9a84c" }}/>
            </div>
            <p className="text-xs font-medium" style={{ color:"#475569" }}>{t("লোড হচ্ছে…","Loading…")}</p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
              <Users size={24} style={{ color:"#334155" }}/>
            </div>
            <p className="text-sm font-medium" style={{ color:"#475569" }}>
              {search ? t("কোনো ফলাফল পাওয়া যায়নি।","No results found.") : t("কোনো সাব-অ্যাডমিন পাওয়া যায়নি।","No SubAdmins found.")}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filtered.map((s, i) => {
              const cfg = STATUS_CONFIG[s.status];
              const StatusIcon = cfg.icon;
              return (
                <motion.div key={s._id} className="sa-card"
                  initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05, duration:0.3 }}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm select-none"
                      style={{ background:getGradient(s.name), boxShadow:"0 4px 12px rgba(0,0,0,0.3)" }}>
                      {(s.name||"S").slice(0,1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h3 className="text-sm font-semibold" style={{ color:"#f1f5f9", letterSpacing:"-0.01em" }}>{s.name}</h3>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide"
                          style={{ background:cfg.bg, border:`1px solid ${cfg.border}`, color:cfg.color }}>
                          <StatusIcon size={9}/> {t(cfg.labelBn ?? cfg.label, cfg.labelEn ?? cfg.label)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <span className="flex items-center gap-1.5 text-xs" style={{ color:"#475569" }}><Mail size={11} style={{ color:"#334155" }}/> {s.email}</span>
                        <span className="flex items-center gap-1.5 text-xs" style={{ color:"#475569" }}><Calendar size={11} style={{ color:"#334155" }}/> {fmtDate(s.createdAt)}</span>
                        {s.phone && <span className="flex items-center gap-1.5 text-xs" style={{ color:"#475569" }}><Phone size={11} style={{ color:"#334155" }}/> {s.phone}</span>}
                      </div>
                    </div>
                    <div className="sm:hidden h-px w-full" style={{ background:"rgba(255,255,255,0.05)" }}/>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {s.status === "pending" && (
                        <>
                          <button className="sa-btn sa-btn-approve" onClick={() => setConfirmModal({ id:s._id, type:"approve" })} disabled={actionId===s._id}>
                            {actionId===s._id ? <Loader size={12} className="animate-spin"/> : <ShieldCheck size={13}/>}
                            {t("অনুমোদন","Approve")}
                          </button>
                          <button className="sa-btn sa-btn-reject" onClick={() => setConfirmModal({ id:s._id, type:"reject" })} disabled={actionId===s._id}>
                            <ShieldX size={13}/> {t("প্রত্যাখ্যান","Reject")}
                          </button>
                        </>
                      )}
                      <button className="sa-btn-delete" onClick={() => setConfirmModal({ id:s._id, type:"delete" })} disabled={actionId===s._id}>
                        {actionId===s._id ? <Loader size={12} className="animate-spin"/> : <Trash2 size={13}/>}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}