import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Trash2, Search, RefreshCw,
  ChevronDown, Eye, X, Clock, Loader2,
  UserPlus, UserCheck, UserX, KeyRound,
  FilePen, Send, CheckCircle, XCircle,
} from "lucide-react";
import { useAdminLang } from "../../../context/AdminLangContext";

const API = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;
const getToken = () => localStorage.getItem("token") || "";

const ACTION_CFG = {
  registered:       { labelEn:"Registered",        labelBn:"রেজিস্ট্রেশন",       color:"#38bdf8", bg:"rgba(56,189,248,0.1)",  border:"rgba(56,189,248,0.25)",  icon:UserPlus    },
  approved:         { labelEn:"Approved",           labelBn:"অনুমোদিত",            color:"#34d399", bg:"rgba(52,211,153,0.1)",  border:"rgba(52,211,153,0.25)",  icon:UserCheck   },
  rejected:         { labelEn:"Rejected",           labelBn:"প্রত্যাখ্যাত",         color:"#fbbf24", bg:"rgba(251,191,36,0.1)",  border:"rgba(251,191,36,0.25)",  icon:UserX       },
  deleted:          { labelEn:"Deleted",            labelBn:"ডিলিট",               color:"#f87171", bg:"rgba(248,113,113,0.1)", border:"rgba(248,113,113,0.2)",  icon:Trash2      },
  profile_updated:  { labelEn:"Profile Updated",    labelBn:"প্রোফাইল আপডেট",     color:"#818cf8", bg:"rgba(129,140,248,0.1)", border:"rgba(129,140,248,0.25)", icon:FilePen     },
  password_changed: { labelEn:"Password Changed",   labelBn:"পাসওয়ার্ড পরিবর্তন", color:"#a78bfa", bg:"rgba(167,139,250,0.1)", border:"rgba(167,139,250,0.25)", icon:KeyRound    },
  change_requested: { labelEn:"Change Requested",   labelBn:"পরিবর্তনের অনুরোধ",  color:"#fb923c", bg:"rgba(251,146,60,0.1)",  border:"rgba(251,146,60,0.25)",  icon:Send        },
  change_approved:  { labelEn:"Change Approved",    labelBn:"পরিবর্তন অনুমোদিত",  color:"#34d399", bg:"rgba(52,211,153,0.1)",  border:"rgba(52,211,153,0.25)",  icon:CheckCircle },
  change_rejected:  { labelEn:"Change Rejected",    labelBn:"পরিবর্তন প্রত্যাখ্যাত",color:"#f87171",bg:"rgba(248,113,113,0.1)",border:"rgba(248,113,113,0.2)", icon:XCircle    },
};

const SORT_OPTIONS = [
  { labelBn:"নতুন প্রথমে",          labelEn:"Newest First",      value:"newest"           },
  { labelBn:"পুরনো প্রথমে",         labelEn:"Oldest First",      value:"oldest"           },
  { labelBn:"রেজিস্ট্রেশন",         labelEn:"Registrations",     value:"registered"       },
  { labelBn:"অনুমোদন",              labelEn:"Approvals",         value:"approved"         },
  { labelBn:"প্রত্যাখ্যান",          labelEn:"Rejections",        value:"rejected"         },
  { labelBn:"ডিলিট",                labelEn:"Deletions",         value:"deleted"          },
  { labelBn:"প্রোফাইল আপডেট",       labelEn:"Profile Updates",   value:"profile_updated"  },
  { labelBn:"পাসওয়ার্ড পরিবর্তন",   labelEn:"Password Changes",  value:"password_changed" },
  { labelBn:"পরিবর্তনের অনুরোধ",    labelEn:"Change Requests",   value:"change_requested" },
];

/* ── Confirm Modal ── */
function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText }) {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={onClose}/>
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div initial={{ scale:0.92, opacity:0, y:10 }} animate={{ scale:1, opacity:1, y:0 }}
              exit={{ scale:0.92, opacity:0, y:10 }}
              transition={{ type:"spring", damping:26, stiffness:300 }}
              className="w-full max-w-sm pointer-events-auto p-7"
              style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"22px", boxShadow:"0 30px 80px rgba(0,0,0,0.6)" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.2)" }}>
                <Trash2 size={20} style={{ color:"#f87171" }}/>
              </div>
              <h3 className="text-base font-bold text-center mb-2" style={{ color:"#f1f5f9" }}>{title}</h3>
              <p className="text-sm text-center mb-7" style={{ color:"#64748b" }}>{message}</p>
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold"
                  style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", color:"#64748b" }}>
                  {cancelText}
                </button>
                <button onClick={onConfirm} className="flex-1 py-3 rounded-xl text-sm font-bold"
                  style={{ background:"linear-gradient(135deg,#f87171,#ef4444)", color:"#fff", boxShadow:"0 4px 16px rgba(248,113,113,0.3)" }}>
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Detail Modal ── */
function DetailModal({ log, onClose, onDelete, t }) {
  if (!log) return null;
  const ac = ACTION_CFG[log.action] || ACTION_CFG.profile_updated;
  const ActionIcon = ac.icon;
  const fmtFull = (d) => new Date(d).toLocaleDateString("en-BD", { day:"numeric", month:"long", year:"numeric", hour:"2-digit", minute:"2-digit", second:"2-digit" });

  return (
    <AnimatePresence>
      {log && (
        <>
          <motion.div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={onClose}/>
          <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
            <motion.div initial={{ y:"100%", opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:"100%", opacity:0 }}
              transition={{ type:"spring", stiffness:300, damping:30 }}
              className="w-full sm:max-w-md pointer-events-auto overflow-hidden"
              style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"22px 22px 0 0", boxShadow:"0 -20px 60px rgba(0,0,0,0.5)", maxHeight:"90vh" }}>

              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 rounded-full" style={{ background:"rgba(255,255,255,0.1)" }}/>
              </div>

              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:ac.bg, border:`1px solid ${ac.border}` }}>
                    <ActionIcon size={16} style={{ color:ac.color }}/>
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color:"#f1f5f9" }}>{t("লগের বিবরণ","Log Detail")}</p>
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background:ac.bg, color:ac.color }}>
                      {t(ac.labelBn, ac.labelEn)}
                    </span>
                  </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background:"rgba(255,255,255,0.05)", color:"#64748b" }}>
                  <X size={15}/>
                </button>
              </div>

              <div className="px-5 py-4 space-y-3 overflow-y-auto" style={{ maxHeight:"55vh" }}>

                {/* SubAdmin info */}
                <div className="rounded-xl p-4" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color:"#475569" }}>{t("সাবএডমিন","SubAdmin")}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:"rgba(167,139,250,0.12)", border:"1px solid rgba(167,139,250,0.2)" }}>
                      <ShieldCheck size={14} style={{ color:"#a78bfa" }}/>
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color:"#e2e8f0" }}>{log.subAdminName}</p>
                      <p className="text-xs" style={{ color:"#64748b" }}>{log.subAdminEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Performed by */}
                {log.performedByName && (
                  <div className="rounded-xl p-4" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color:"#475569" }}>{t("সম্পাদনকারী","Performed By")}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold" style={{ color:"#e2e8f0" }}>{log.performedByName}</p>
                      <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-lg"
                        style={{ background:log.performedByRole==="admin"?"rgba(201,168,76,0.1)":"rgba(167,139,250,0.1)", color:log.performedByRole==="admin"?"#c9a84c":"#a78bfa" }}>
                        {log.performedByRole}
                      </span>
                    </div>
                  </div>
                )}

                {/* Time */}
                <div className="flex items-center gap-2 text-xs px-1" style={{ color:"#64748b" }}>
                  <Clock size={12} className="flex-shrink-0" style={{ color:"#475569" }}/>
                  <span>{fmtFull(log.createdAt)}</span>
                </div>

                {/* Changes */}
                {log.changes && Object.keys(log.changes).length > 0 && (
                  <div className="rounded-xl p-4" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color:"#475569" }}>{t("পরিবর্তনের বিবরণ","Change Details")}</p>
                    <div className="space-y-2">
                      {Object.entries(log.changes).map(([key, val]) => (
                        <div key={key} className="flex items-start gap-2 text-xs flex-wrap">
                          <span className="px-2 py-0.5 rounded-lg font-bold flex-shrink-0" style={{ background:"rgba(129,140,248,0.1)", color:"#818cf8" }}>{key}</span>
                          {typeof val === "object" && val?.from !== undefined ? (
                            <span className="break-all" style={{ color:"#94a3b8" }}>
                              <span style={{ color:"#f87171", textDecoration:"line-through" }}>{String(val.from)}</span>
                              {" → "}
                              <span style={{ color:"#34d399", fontWeight:600 }}>{String(val.to)}</span>
                            </span>
                          ) : (
                            <span className="break-all" style={{ color:"#94a3b8" }}>{String(val)}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-5 py-4 flex gap-3" style={{ borderTop:"1px solid rgba(255,255,255,0.07)" }}>
                <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", color:"#94a3b8" }}>
                  {t("বন্ধ করুন","Close")}
                </button>
                <button onClick={() => { onDelete(log); onClose(); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.2)", color:"#f87171" }}>
                  <Trash2 size={14}/> {t("লগ মুছুন","Delete Log")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ════════════════════════════════════════
   MAIN
════════════════════════════════════════ */
export default function AdminSubAdminLogs() {
  const { t } = useAdminLang();

  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [total,   setTotal]   = useState(0);
  const [pages,   setPages]   = useState(1);
  const [page,    setPage]    = useState(1);

  const [search,   setSearch]   = useState("");
  const [sort,     setSort]     = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  const [detailLog,  setDetailLog]  = useState(null);
  const [deleteId,   setDeleteId]   = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [clearOpen,  setClearOpen]  = useState(false);

  useEffect(() => {
    const h = (e) => { if (!sortRef.current?.contains(e.target)) setSortOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit:15 });
      if (search) params.append("search", search);
      if (sort !== "newest" && sort !== "oldest") params.append("action", sort);
      if (sort === "oldest") params.append("order", "asc");
      const r = await fetch(`${API}/api/subadmin-logs?${params}`, {
        headers: { Authorization:`Bearer ${getToken()}` },
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      setLogs(d.data);
      setTotal(d.total);
      setPages(d.pages);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, search, sort]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => {
    const timer = setTimeout(() => setPage(1), 400);
    return () => clearTimeout(timer);
  }, [search, sort]);

  const handleDeleteTrigger = (log) => { setDeleteId(log._id); setDeleteName(log.subAdminName); setDeleteOpen(true); };

  const confirmDelete = async () => {
    try {
      await fetch(`${API}/api/subadmin-logs/${deleteId}`, { method:"DELETE", headers:{ Authorization:`Bearer ${getToken()}` } });
      setLogs(prev => prev.filter(l => l._id !== deleteId));
      setTotal(n => n-1);
    } catch (err) { console.error(err); }
    setDeleteOpen(false);
  };

  const confirmClearAll = async () => {
    try {
      await fetch(`${API}/api/subadmin-logs/all`, { method:"DELETE", headers:{ Authorization:`Bearer ${getToken()}` } });
      setLogs([]); setTotal(0); setPages(1);
    } catch (err) { console.error(err); }
    setClearOpen(false);
  };

  const fmtShort = (d) => new Date(d).toLocaleDateString("en-BD", { day:"numeric", month:"short", year:"2-digit" });

  const stats = [
    { labelBn:"মোট",              labelEn:"Total",           count:total,                                          color:"#a78bfa" },
    { labelBn:"রেজিস্ট্রেশন",     labelEn:"Registered",      count:logs.filter(l=>l.action==="registered").length,  color:"#38bdf8" },
    { labelBn:"অনুমোদন",           labelEn:"Approved",        count:logs.filter(l=>l.action==="approved").length,    color:"#34d399" },
    { labelBn:"প্রোফাইল আপডেট",   labelEn:"Profile Updates", count:logs.filter(l=>l.action==="profile_updated").length, color:"#818cf8" },
    { labelBn:"পরিবর্তনের অনুরোধ", labelEn:"Change Requests", count:logs.filter(l=>l.action==="change_requested").length, color:"#fb923c" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        .sal-wrap * { box-sizing:border-box; }
        .sal-wrap { font-family:'DM Sans',sans-serif; }
        .sal-search { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:11px 16px 11px 40px; font-size:13px; color:#e2e8f0; outline:none; transition:all 0.2s; font-family:'DM Sans',sans-serif; }
        .sal-search::placeholder { color:#475569; }
        .sal-search:focus { border-color:rgba(167,139,250,0.35); background:rgba(167,139,250,0.03); }
        .sal-sort-btn { display:flex; align-items:center; justify-content:space-between; gap:8px; width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:11px; padding:10px 13px; font-size:12px; color:#94a3b8; cursor:pointer; transition:all 0.15s; font-family:'DM Sans',sans-serif; }
        .sal-sort-btn:hover { border-color:rgba(255,255,255,0.15); color:#cbd5e1; }
        .sal-dropdown { background:#1a2235; border:1px solid rgba(255,255,255,0.09); border-radius:14px; overflow:hidden; box-shadow:0 16px 48px rgba(0,0,0,0.5); }
        .sal-drop-item { padding:10px 16px; font-size:12px; color:#94a3b8; cursor:pointer; transition:all 0.12s; }
        .sal-drop-item:hover { background:rgba(255,255,255,0.05); color:#e2e8f0; }
        .sal-drop-item.active { background:rgba(167,139,250,0.08); color:#a78bfa; font-weight:600; }
        .sal-btn { display:inline-flex; align-items:center; gap:5px; padding:9px 15px; border-radius:10px; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.15s; border:1px solid transparent; font-family:'DM Sans',sans-serif; }
        .sal-btn:hover { transform:translateY(-1px); }
        .sal-col { display:grid; align-items:center; padding:11px 20px; grid-template-columns:28px 1fr 120px 100px 56px; gap:8px; background:#0f1929; border-bottom:1px solid rgba(255,255,255,0.07); position:sticky; top:0; z-index:10; }
        .sal-row { display:grid; align-items:center; padding:14px 20px; grid-template-columns:28px 1fr 120px 100px 56px; gap:8px; border-bottom:1px solid rgba(255,255,255,0.05); transition:background 0.15s; }
        .sal-row:last-child { border-bottom:none; }
        .sal-row:hover { background:rgba(255,255,255,0.025); }
        .sal-icon-btn { width:28px; height:28px; border-radius:8px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.15s; border:none; }
        .sal-icon-btn:hover { transform:translateY(-1px); }
        .sal-page-btn { display:flex; align-items:center; justify-content:center; padding:7px 14px; border-radius:10px; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.15s; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); color:#64748b; font-family:'DM Sans',sans-serif; }
        .sal-page-btn:hover:not(:disabled) { border-color:rgba(255,255,255,0.15); color:#94a3b8; }
        .sal-page-btn:disabled { opacity:0.35; cursor:not-allowed; }
        .sal-page-num { width:32px; height:32px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.15s; font-family:'DM Sans',sans-serif; }
      `}</style>

      <div className="sal-wrap max-w-5xl mx-auto pb-10">

        <DetailModal log={detailLog} t={t} onClose={() => setDetailLog(null)} onDelete={handleDeleteTrigger}/>
        <ConfirmModal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={confirmDelete}
          title={t("লগ মুছবেন?","Delete Log?")}
          message={`"${deleteName}" ${t("এর লগ মুছে যাবে।","log will be permanently deleted.")}`}
          confirmText={t("মুছুন","Delete")} cancelText={t("বাতিল","Cancel")}/>
        <ConfirmModal isOpen={clearOpen} onClose={() => setClearOpen(false)} onConfirm={confirmClearAll}
          title={t("সব লগ মুছবেন?","Clear All Logs?")}
          message={t("সব সাবএডমিন অ্যাক্টিভিটি লগ স্থায়ীভাবে মুছে যাবে।","All SubAdmin activity logs will be permanently deleted.")}
          confirmText={t("সব মুছুন","Clear All")} cancelText={t("বাতিল","Cancel")}/>

        {/* ══ HEADER ══ */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
          className="relative rounded-2xl overflow-hidden mb-6"
          style={{ background:"linear-gradient(135deg,#0d1426 0%,#111827 50%,#0f172a 100%)", border:"1px solid rgba(255,255,255,0.07)", boxShadow:"0 20px 60px rgba(0,0,0,0.4)" }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background:"linear-gradient(90deg,transparent,rgba(167,139,250,0.6) 30%,rgba(139,92,246,0.6) 70%,transparent)" }}/>
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage:"linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize:"32px 32px" }}/>
          <div className="absolute pointer-events-none" style={{ top:"-60px", right:"-40px", width:"200px", height:"200px", borderRadius:"50%", background:"radial-gradient(circle,rgba(167,139,250,0.08) 0%,transparent 70%)" }}/>

          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background:"linear-gradient(135deg,rgba(167,139,250,0.15),rgba(167,139,250,0.05))", border:"1px solid rgba(167,139,250,0.2)" }}>
                  <ShieldCheck size={22} style={{ color:"#a78bfa" }}/>
                </div>
                <div>
                  <h1 style={{ fontFamily:"'Instrument Serif',serif", fontSize:"22px", color:"#f1f5f9", letterSpacing:"-0.01em", lineHeight:1.2 }}>
                    {t("সাবএডমিন অ্যাক্টিভিটি লগ","SubAdmin Activity Log")}
                  </h1>
                  <p className="text-xs mt-1" style={{ color:"#475569" }}>
                    {t("রেজিস্ট্রেশন, প্রোফাইল পরিবর্তন ও অ্যাডমিন অ্যাকশন ট্র্যাক করুন","Track registrations, profile changes and admin actions")}
                  </p>
                </div>
              </div>
              <button onClick={fetchLogs} className="sal-btn self-start sm:self-auto"
                style={{ background:"rgba(255,255,255,0.05)", borderColor:"rgba(255,255,255,0.08)", color:"#94a3b8" }}>
                <RefreshCw size={13}/> {t("রিফ্রেশ","Refresh")}
              </button>
            </div>

            <div className="flex gap-3 flex-wrap sm:flex-nowrap">
              {stats.map(({ labelBn, labelEn, count, color }) => (
                <div key={labelEn} className="flex-1 min-w-0 rounded-xl p-3 sm:p-4"
                  style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
                  <div className="text-xl font-bold" style={{ color, lineHeight:1 }}>{count}</div>
                  <div className="text-[10px] font-medium mt-1" style={{ color:"#475569" }}>{t(labelBn, labelEn)}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ══ CONTROLS ══ */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color:"#475569" }}/>
            <input type="text" placeholder={t("নাম বা ইমেইল দিয়ে খুঁজুন...","Search by name or email...")}
              value={search} onChange={e => setSearch(e.target.value)} className="sal-search"/>
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color:"#475569" }}><X size={13}/></button>}
          </div>
          <div className="relative sm:w-52" ref={sortRef}>
            <button className="sal-sort-btn" onClick={() => setSortOpen(!sortOpen)}>
              <span style={{ color:"#cbd5e1" }}>{t(SORT_OPTIONS.find(o=>o.value===sort)?.labelBn, SORT_OPTIONS.find(o=>o.value===sort)?.labelEn)}</span>
              <ChevronDown size={13}/>
            </button>
            <AnimatePresence>
              {sortOpen && (
                <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.15 }}
                  className="sal-dropdown absolute right-0 mt-2 w-full z-50">
                  {SORT_OPTIONS.map(opt => (
                    <div key={opt.value} className={`sal-drop-item ${sort===opt.value?"active":""}`}
                      onClick={() => { setSort(opt.value); setSortOpen(false); setPage(1); }}>
                      {t(opt.labelBn, opt.labelEn)}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {logs.length > 0 && (
            <button onClick={() => setClearOpen(true)} className="sal-btn"
              style={{ background:"rgba(248,113,113,0.08)", borderColor:"rgba(248,113,113,0.15)", color:"#f87171" }}>
              <Trash2 size={13}/> <span className="hidden sm:inline">{t("সব মুছুন","Clear All")}</span>
            </button>
          )}
        </div>

        {/* ══ TABLE ══ */}
        <div className="rounded-2xl overflow-hidden" style={{ background:"#0d1426", border:"1px solid rgba(255,255,255,0.07)", boxShadow:"0 8px 32px rgba(0,0,0,0.3)" }}>
          <div className="sal-col">
            {["#", t("সাবএডমিন","SubAdmin"), t("কার্যক্রম","Action"), t("কে / কখন","By / When"), ""].map((h,i) => (
              <div key={i} className="text-[10px] font-semibold uppercase tracking-wider" style={{ color:"#2d3f55" }}>{h}</div>
            ))}
          </div>

          <div className="overflow-y-auto" style={{ maxHeight:"60vh" }}>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background:"rgba(167,139,250,0.08)", border:"1px solid rgba(167,139,250,0.15)" }}>
                  <Loader2 size={20} className="animate-spin" style={{ color:"#a78bfa" }}/>
                </div>
                <p className="text-xs font-medium" style={{ color:"#475569" }}>{t("লোড হচ্ছে…","Loading…")}</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
                  <ShieldCheck size={24} style={{ color:"#1e293b" }}/>
                </div>
                <p className="text-sm font-medium" style={{ color:"#475569" }}>{t("কোনো লগ নেই।","No logs found.")}</p>
              </div>
            ) : logs.map((log, idx) => {
              const ac = ACTION_CFG[log.action] || ACTION_CFG.profile_updated;
              const ActionIcon = ac.icon;
              return (
                <motion.div key={log._id} className="sal-row"
                  initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:idx*0.02 }}>
                  <div className="text-xs font-medium" style={{ color:"#2d3f55" }}>{(page-1)*15+idx+1}</div>
                  <div className="min-w-0 pr-2">
                    <p className="truncate text-sm font-medium" style={{ color:"#e2e8f0" }}>{log.subAdminName}</p>
                    <p className="truncate text-[10px] mt-0.5" style={{ color:"#334155" }}>{log.subAdminEmail}</p>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase"
                      style={{ background:ac.bg, color:ac.color, border:`1px solid ${ac.border}` }}>
                      <ActionIcon size={8}/>
                      <span className="hidden sm:inline">{t(ac.labelBn, ac.labelEn)}</span>
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium" style={{ color:"#94a3b8" }}>{log.performedByName || "—"}</p>
                    <p className="text-[10px] mt-0.5" style={{ color:"#334155" }}>{fmtShort(log.createdAt)}</p>
                  </div>
                  <div className="flex justify-end items-center gap-1.5">
                    <button className="sal-icon-btn" style={{ background:"rgba(129,140,248,0.08)", color:"#818cf8" }} onClick={() => setDetailLog(log)}><Eye size={13}/></button>
                    <button className="sal-icon-btn hidden sm:flex" style={{ background:"rgba(248,113,113,0.08)", color:"#f87171" }} onClick={() => handleDeleteTrigger(log)}><Trash2 size={12}/></button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ══ PAGINATION ══ */}
        {pages > 1 && (
          <div className="flex items-center justify-between mt-5 flex-wrap gap-3">
            <p className="text-xs font-medium" style={{ color:"#475569" }}>
              {t("পেজ","Page")} <span style={{ color:"#94a3b8" }}>{page}</span> {t("এর মধ্যে","of")} <span style={{ color:"#94a3b8" }}>{pages}</span>
              {" · "}<span style={{ color:"#64748b" }}>{total} {t("মোট","total")}</span>
            </p>
            <div className="flex items-center gap-1.5">
              <button className="sal-page-btn" onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1}>← {t("আগে","Prev")}</button>
              {Array.from({ length:Math.min(5,pages) }, (_,i) => {
                const p = page<=3 ? i+1 : page-2+i;
                if (p>pages) return null;
                return (
                  <button key={p} className="sal-page-num" onClick={() => setPage(p)}
                    style={{ background:page===p?"linear-gradient(135deg,#a78bfa,#8b5cf6)":"rgba(255,255,255,0.04)", border:`1px solid ${page===p?"transparent":"rgba(255,255,255,0.08)"}`, color:page===p?"#fff":"#64748b", boxShadow:page===p?"0 4px 12px rgba(167,139,250,0.3)":"none" }}>
                    {p}
                  </button>
                );
              })}
              <button className="sal-page-btn" onClick={() => setPage(p=>Math.min(pages,p+1))} disabled={page===pages}>{t("পরে","Next")} →</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}