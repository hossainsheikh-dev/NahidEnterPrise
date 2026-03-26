import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Plus, Pencil, Trash2, Search,
  RefreshCw, ChevronDown, Eye, X,
  Layers, Clock, Loader2, ShieldCheck, User,
} from "lucide-react";
import { useAdminLang } from "../../../context/AdminLangContext";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
const getToken = () => localStorage.getItem("token") || "";

const ACTION_CONFIG = {
  created: { colorEn: "Created", colorBn: "তৈরি",   color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.25)",  icon: Plus   },
  updated: { colorEn: "Updated", colorBn: "আপডেট",  color: "#818cf8", bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.25)", icon: Pencil },
  deleted: { colorEn: "Deleted", colorBn: "মুছেছে", color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.2)",  icon: Trash2 },
};

const ROLE_CONFIG = {
  admin:    { labelEn: "Admin",    labelBn: "এডমিন",    color: "#c9a84c", bg: "rgba(201,168,76,0.1)",  icon: User       },
  subadmin: { labelEn: "SubAdmin", labelBn: "সাবএডমিন", color: "#a78bfa", bg: "rgba(167,139,250,0.1)", icon: ShieldCheck },
};

const SORT_OPTIONS = [
  { labelBn: "নতুন প্রথমে",   labelEn: "Newest First",  value: "newest"   },
  { labelBn: "পুরনো প্রথমে",  labelEn: "Oldest First",  value: "oldest"   },
  { labelBn: "শুধু তৈরি",     labelEn: "Created Only",  value: "created"  },
  { labelBn: "শুধু আপডেট",    labelEn: "Updated Only",  value: "updated"  },
  { labelBn: "শুধু মুছা",     labelEn: "Deleted Only",  value: "deleted"  },
  { labelBn: "শুধু এডমিন",    labelEn: "Admin Only",    value: "admin"    },
  { labelBn: "শুধু সাবএডমিন", labelEn: "SubAdmin Only", value: "subadmin" },
];

/* ── Confirm Modal ── */
function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, danger }) {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}/>
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
              className="w-full max-w-sm pointer-events-auto p-7"
              style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "22px", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)" }}>
                <Trash2 size={20} style={{ color: "#f87171" }}/>
              </div>
              <h3 className="text-base font-bold text-center mb-2" style={{ color: "#f1f5f9", letterSpacing: "-0.01em" }}>{title}</h3>
              <p className="text-sm text-center mb-7" style={{ color: "#64748b" }}>{message}</p>
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold transition"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b" }}>
                  {cancelText}
                </button>
                <button onClick={onConfirm} className="flex-1 py-3 rounded-xl text-sm font-bold transition"
                  style={{ background: "linear-gradient(135deg,#f87171,#ef4444)", color: "#fff", boxShadow: "0 4px 16px rgba(248,113,113,0.3)" }}>
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
  const ac = ACTION_CONFIG[log.action] || ACTION_CONFIG.updated;
  const rc = ROLE_CONFIG[log.performedByRole] || ROLE_CONFIG.admin;
  const ActionIcon = ac.icon;
  const RoleIcon   = rc.icon;

  const fmtDateFull = (d) => new Date(d).toLocaleDateString("en-BD", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  return (
    <AnimatePresence>
      {log && (
        <>
          <motion.div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}/>
          <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
            <motion.div
              initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full sm:max-w-md pointer-events-auto overflow-hidden"
              style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "22px 22px 0 0", boxShadow: "0 -20px 60px rgba(0,0,0,0.5)", maxHeight: "90vh" }}>

              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}/>
              </div>

              {/* header */}
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: ac.bg, border: `1px solid ${ac.border}` }}>
                    <ActionIcon size={16} style={{ color: ac.color }}/>
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#f1f5f9" }}>{t("কার্যক্রমের বিবরণ","Activity Detail")}</p>
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                      style={{ background: ac.bg, color: ac.color }}>
                      {t(ac.colorBn, ac.colorEn)}
                    </span>
                  </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center transition"
                  style={{ background: "rgba(255,255,255,0.05)", color: "#64748b" }}>
                  <X size={15}/>
                </button>
              </div>

              {/* body */}
              <div className="px-5 py-4 space-y-3 overflow-y-auto" style={{ maxHeight: "55vh" }}>
                {/* sublink info */}
                <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: "#475569" }}>
                    {t("সাবলিংক","Sublink")}
                  </p>
                  <div className="flex items-center gap-2">
                    <Layers size={14} style={{ color: "#475569" }} className="flex-shrink-0"/>
                    <p className="text-sm font-semibold break-all" style={{ color: "#e2e8f0" }}>{log.sublinkName}</p>
                  </div>
                  {log.sublinkSlug && (
                    <p className="text-xs mt-1 ml-5" style={{ color: "#475569" }}>/{log.sublinkSlug}</p>
                  )}
                  {log.parentName && (
                    <div className="mt-2 ml-5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold"
                        style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa" }}>
                        {t("প্যারেন্ট:","Parent:")} {log.parentName}
                      </span>
                    </div>
                  )}
                </div>

                {/* performer */}
                <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: "#475569" }}>
                    {t("সম্পাদনকারী","Performed By")}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: rc.bg }}>
                      <RoleIcon size={13} style={{ color: rc.color }}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "#e2e8f0" }}>{log.performedByName}</p>
                      <p className="text-xs truncate" style={{ color: "#64748b" }}>{log.performedByEmail}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-lg flex-shrink-0"
                      style={{ background: rc.bg, color: rc.color }}>
                      {t(rc.labelBn, rc.labelEn)}
                    </span>
                  </div>
                </div>

                {/* time */}
                <div className="flex items-center gap-2 text-xs px-1" style={{ color: "#64748b" }}>
                  <Clock size={12} className="flex-shrink-0" style={{ color: "#475569" }}/>
                  <span>{fmtDateFull(log.createdAt)}</span>
                </div>

                {/* changes */}
                {log.changes && Object.keys(log.changes).length > 0 && (
                  <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color: "#475569" }}>
                      {t("যা পরিবর্তিত হয়েছে","What Changed")}
                    </p>
                    <div className="space-y-2">
                      {Object.entries(log.changes).map(([key, val]) => (
                        <div key={key} className="flex items-start gap-2 text-xs flex-wrap">
                          <span className="px-2 py-0.5 rounded-lg font-bold flex-shrink-0"
                            style={{ background: "rgba(129,140,248,0.1)", color: "#818cf8" }}>
                            {key}
                          </span>
                          {typeof val === "object" && val.from !== undefined ? (
                            <span className="break-all" style={{ color: "#94a3b8" }}>
                              <span style={{ color: "#f87171", textDecoration: "line-through" }}>{String(val.from)}</span>
                              {" → "}
                              <span style={{ color: "#34d399", fontWeight: 600 }}>{String(val.to)}</span>
                            </span>
                          ) : (
                            <span className="break-all" style={{ color: "#94a3b8" }}>{String(val)}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* footer */}
              <div className="px-5 py-4 flex gap-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" }}>
                  {t("বন্ধ করুন","Close")}
                </button>
                <button onClick={() => { onDelete(log); onClose(); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition"
                  style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171" }}>
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
export default function AdminSublinkLogs() {
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
    const handler = (e) => {
      if (!sortRef.current?.contains(e.target)) setSortOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append("search", search);
      if (["created","updated","deleted"].includes(sort)) params.append("action", sort);
      if (["admin","subadmin"].includes(sort))            params.append("role",   sort);
      const r = await fetch(`${API}/api/sublinks/logs?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
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
    const timer = setTimeout(() => { setPage(1); }, 400);
    return () => clearTimeout(timer);
  }, [search, sort]);

  const handleDeleteTrigger = (log) => {
    setDeleteId(log._id);
    setDeleteName(log.sublinkName);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await fetch(`${API}/api/sublinks/logs/${deleteId}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` },
      });
      setLogs(prev => prev.filter(l => l._id !== deleteId));
      setTotal(n => n - 1);
    } catch (err) { console.error(err); }
    setDeleteOpen(false);
  };

  const confirmClearAll = async () => {
    try {
      await fetch(`${API}/api/sublinks/logs`, {
        method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` },
      });
      setLogs([]); setTotal(0); setPages(1);
    } catch (err) { console.error(err); }
    setClearOpen(false);
  };

  const fmtShort = (d) => new Date(d).toLocaleDateString("en-BD", {
    day: "numeric", month: "short", year: "2-digit",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        .ll-wrap * { box-sizing: border-box; }
        .ll-wrap { font-family: 'DM Sans', sans-serif; }

        .ll-search-input {
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
          padding: 11px 16px 11px 40px; font-size: 13px; color: #e2e8f0;
          outline: none; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
        }
        .ll-search-input::placeholder { color: #475569; }
        .ll-search-input:focus { border-color: rgba(201,168,76,0.35); background: rgba(201,168,76,0.03); }

        .ll-sort-btn {
          display: flex; align-items: center; justify-content: space-between; gap: 8px;
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 11px;
          padding: 10px 13px; font-size: 12px; color: #94a3b8;
          cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif;
        }
        .ll-sort-btn:hover { border-color: rgba(255,255,255,0.15); color: #cbd5e1; }

        .ll-sort-dropdown {
          background: #1a2235; border: 1px solid rgba(255,255,255,0.09);
          border-radius: 14px; overflow: hidden; box-shadow: 0 16px 48px rgba(0,0,0,0.5);
        }
        .ll-sort-item { padding: 10px 16px; font-size: 12px; color: #94a3b8; cursor: pointer; transition: all 0.12s; }
        .ll-sort-item:hover { background: rgba(255,255,255,0.05); color: #e2e8f0; }
        .ll-sort-item.active { background: rgba(201,168,76,0.08); color: #c9a84c; font-weight: 600; }

        .ll-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 9px 15px; border-radius: 10px;
          font-size: 12px; font-weight: 600; cursor: pointer;
          transition: all 0.15s; border: 1px solid transparent;
          font-family: 'DM Sans', sans-serif;
        }
        .ll-btn:hover { transform: translateY(-1px); }

        .ll-col-header {
          display: grid; align-items: center;
          padding: 11px 20px;
          grid-template-columns: 28px 1fr 84px 84px 56px;
          gap: 8px;
          background: #0f1929;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          position: sticky; top: 0; z-index: 10;
        }

        .ll-row {
          display: grid; align-items: center;
          padding: 15px 20px;
          grid-template-columns: 28px 1fr 84px 84px 56px;
          gap: 8px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: background 0.15s;
        }
        .ll-row:last-child { border-bottom: none; }
        .ll-row:hover { background: rgba(255,255,255,0.025); }

        .ll-icon-btn {
          width: 28px; height: 28px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.15s; border: none;
          font-family: 'DM Sans', sans-serif;
        }
        .ll-icon-btn:hover { transform: translateY(-1px); }

        .ll-page-btn {
          display: flex; align-items: center; justify-content: center;
          padding: 7px 14px; border-radius: 10px; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.15s;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          color: #64748b; font-family: 'DM Sans', sans-serif;
        }
        .ll-page-btn:hover:not(:disabled) { border-color: rgba(255,255,255,0.15); color: #94a3b8; }
        .ll-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

        .ll-page-num {
          width: 32px; height: 32px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
      `}</style>

      <div className="ll-wrap max-w-5xl mx-auto pb-10">

        <DetailModal log={detailLog} t={t} onClose={() => setDetailLog(null)} onDelete={handleDeleteTrigger}/>
        <ConfirmModal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={confirmDelete} danger
          title={t("লগ মুছবেন?","Delete Log?")}
          message={`"${deleteName}" ${t("এর লগ মুছে যাবে।","log will be permanently deleted.")}`}
          confirmText={t("মুছুন","Delete")} cancelText={t("বাতিল","Cancel")}/>
        <ConfirmModal isOpen={clearOpen} onClose={() => setClearOpen(false)} onConfirm={confirmClearAll} danger
          title={t("সব লগ মুছবেন?","Clear All Logs?")}
          message={t("সব সাবলিংক লগ স্থায়ীভাবে মুছে যাবে।","This will permanently delete all sublink logs.")}
          confirmText={t("সব মুছুন","Clear All")} cancelText={t("বাতিল","Cancel")}/>

        {/* ══ HEADER ══ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-2xl overflow-hidden mb-6"
          style={{ background: "linear-gradient(135deg,#0d1426 0%,#111827 50%,#0f172a 100%)", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>

          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg,transparent,rgba(201,168,76,0.6) 30%,rgba(139,92,246,0.6) 70%,transparent)" }}/>
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
            backgroundSize: "32px 32px",
          }}/>
          <div className="absolute pointer-events-none" style={{ top: "-60px", right: "-40px", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle,rgba(201,168,76,0.07) 0%,transparent 70%)" }}/>
          <div className="absolute pointer-events-none" style={{ bottom: "-40px", left: "-20px", width: "160px", height: "160px", borderRadius: "50%", background: "radial-gradient(circle,rgba(129,140,248,0.06) 0%,transparent 70%)" }}/>

          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,rgba(201,168,76,0.15),rgba(201,168,76,0.05))", border: "1px solid rgba(201,168,76,0.2)" }}>
                  <Activity size={22} style={{ color: "#c9a84c" }}/>
                </div>
                <div>
                  <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "22px", color: "#f1f5f9", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                    {t("সাবলিংক লগ","Sublink Logs")}
                  </h1>
                  <p className="text-xs mt-1" style={{ color: "#475569" }}>
                    {t("এডমিন ও সাবএডমিনের সাবলিংক কার্যক্রম ট্র্যাক করুন।","Track all sublink activity by admin and subadmin.")}
                  </p>
                </div>
              </div>
              <button onClick={fetchLogs} className="ll-btn self-start sm:self-auto"
                style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.08)", color: "#94a3b8" }}>
                <RefreshCw size={13}/> {t("রিফ্রেশ","Refresh")}
              </button>
            </div>

            {/* stat cards */}
            <div className="flex gap-3 flex-wrap sm:flex-nowrap">
              {[
                { labelBn: "মোট লগ", labelEn: "Total",   count: total,                                       color: "#c9a84c" },
                { labelBn: "তৈরি",   labelEn: "Created", count: logs.filter(l=>l.action==="created").length, color: "#34d399" },
                { labelBn: "আপডেট",  labelEn: "Updated", count: logs.filter(l=>l.action==="updated").length, color: "#818cf8" },
                { labelBn: "মুছেছে", labelEn: "Deleted", count: logs.filter(l=>l.action==="deleted").length, color: "#f87171" },
              ].map(({ labelBn, labelEn, count, color }) => (
                <div key={labelEn} className="flex-1 min-w-0 rounded-xl p-4"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="text-2xl font-bold" style={{ color, lineHeight: 1 }}>{count}</div>
                  <div className="text-[11px] font-medium mt-1" style={{ color: "#475569" }}>{t(labelBn, labelEn)}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ══ CONTROLS ══ */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#475569" }}/>
            <input type="text"
              placeholder={t("সাবলিংক বা ব্যবহারকারী খুঁজুন...","Search sublink or user...")}
              value={search} onChange={e => setSearch(e.target.value)}
              className="ll-search-input"/>
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 transition" style={{ color: "#475569" }}>
                <X size={13}/>
              </button>
            )}
          </div>

          <div className="relative sm:w-48" ref={sortRef}>
            <button className="ll-sort-btn" onClick={() => setSortOpen(!sortOpen)}>
              <span style={{ color: "#cbd5e1" }}>
                {SORT_OPTIONS.find(o => o.value === sort) &&
                  t(SORT_OPTIONS.find(o => o.value === sort).labelBn,
                    SORT_OPTIONS.find(o => o.value === sort).labelEn)}
              </span>
              <ChevronDown size={13}/>
            </button>
            <AnimatePresence>
              {sortOpen && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                  className="ll-sort-dropdown absolute right-0 mt-2 w-full z-50">
                  {SORT_OPTIONS.map(option => (
                    <div key={option.value}
                      className={`ll-sort-item ${sort === option.value ? "active" : ""}`}
                      onClick={() => { setSort(option.value); setSortOpen(false); setPage(1); }}>
                      {t(option.labelBn, option.labelEn)}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {logs.length > 0 && (
            <button onClick={() => setClearOpen(true)} className="ll-btn"
              style={{ background: "rgba(248,113,113,0.08)", borderColor: "rgba(248,113,113,0.15)", color: "#f87171" }}>
              <Trash2 size={13}/> <span className="hidden sm:inline">{t("সব মুছুন","Clear All")}</span>
            </button>
          )}
        </div>

        {/* ══ TABLE ══ */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "#0d1426", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>

          <div className="ll-col-header">
            {["#", t("সাবলিংক","Sublink"), t("কার্যক্রম","Action"), t("কে করেছে","By"), ""].map((h, i) => (
              <div key={i} className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#2d3f55" }}>{h}</div>
            ))}
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: "60vh" }}>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)" }}>
                  <Loader2 size={20} className="animate-spin" style={{ color: "#c9a84c" }}/>
                </div>
                <p className="text-xs font-medium" style={{ color: "#475569" }}>{t("লোড হচ্ছে…","Loading…")}</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <Activity size={24} style={{ color: "#1e293b" }}/>
                </div>
                <p className="text-sm font-medium" style={{ color: "#475569" }}>{t("কোনো লগ নেই।","No logs found.")}</p>
              </div>
            ) : (
              logs.map((log, index) => {
                const ac = ACTION_CONFIG[log.action] || ACTION_CONFIG.updated;
                const rc = ROLE_CONFIG[log.performedByRole] || ROLE_CONFIG.admin;
                const ActionIcon = ac.icon;
                const RoleIcon   = rc.icon;
                return (
                  <motion.div key={log._id} className="ll-row"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}>

                    <div className="text-xs font-medium" style={{ color: "#2d3f55" }}>
                      {(page - 1) * 15 + index + 1}
                    </div>

                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Layers size={11} className="flex-shrink-0" style={{ color: "#334155" }}/>
                        <span className="truncate text-sm font-medium" style={{ color: "#e2e8f0" }}>
                          {log.sublinkName}
                        </span>
                      </div>
                      {log.parentName && (
                        <span className="hidden sm:inline-flex ml-4 text-[9px] px-1.5 py-0.5 rounded font-semibold"
                          style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa" }}>
                          {log.parentName}
                        </span>
                      )}
                      <p className="text-[10px] mt-0.5 sm:hidden pl-4" style={{ color: "#334155" }}>
                        {fmtShort(log.createdAt)}
                      </p>
                    </div>

                    <div>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase"
                        style={{ background: ac.bg, color: ac.color, border: `1px solid ${ac.border}` }}>
                        <ActionIcon size={8}/>
                        <span className="hidden sm:inline">{t(ac.colorBn, ac.colorEn)}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: rc.bg }}>
                        <RoleIcon size={10} style={{ color: rc.color }}/>
                      </div>
                      <span className="truncate text-xs font-medium" style={{ color: "#94a3b8" }}>
                        {log.performedByName}
                      </span>
                    </div>

                    <div className="flex justify-end items-center gap-1.5">
                      <button className="ll-icon-btn"
                        style={{ background: "rgba(129,140,248,0.08)", color: "#818cf8" }}
                        onClick={() => setDetailLog(log)}>
                        <Eye size={13}/>
                      </button>
                      <button className="ll-icon-btn hidden sm:flex"
                        style={{ background: "rgba(248,113,113,0.08)", color: "#f87171" }}
                        onClick={() => handleDeleteTrigger(log)}>
                        <Trash2 size={12}/>
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* ══ PAGINATION ══ */}
        {pages > 1 && (
          <div className="flex items-center justify-between mt-5 flex-wrap gap-3">
            <p className="text-xs font-medium" style={{ color: "#475569" }}>
              {t("পেজ","Page")} <span style={{ color: "#94a3b8" }}>{page}</span> {t("এর মধ্যে","of")} <span style={{ color: "#94a3b8" }}>{pages}</span>
              {" · "}<span style={{ color: "#64748b" }}>{total} {t("মোট","total")}</span>
            </p>
            <div className="flex items-center gap-1.5">
              <button className="ll-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                ← {t("আগে","Prev")}
              </button>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page - 2 + i;
                if (p > pages) return null;
                return (
                  <button key={p} className="ll-page-num" onClick={() => setPage(p)}
                    style={{
                      background: page === p ? "linear-gradient(135deg,#c9a84c,#e8c876)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${page === p ? "transparent" : "rgba(255,255,255,0.08)"}`,
                      color: page === p ? "#0a0f1e" : "#64748b",
                      boxShadow: page === p ? "0 4px 12px rgba(201,168,76,0.3)" : "none",
                    }}>
                    {p}
                  </button>
                );
              })}
              <button className="ll-page-btn" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>
                {t("পরে","Next")} →
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}