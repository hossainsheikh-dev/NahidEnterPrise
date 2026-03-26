import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2, Plus, Search, ChevronDown, Pencil,
  Trash2, Loader2, X, RefreshCw,
} from "lucide-react";
import ConfirmModal from "../../../utils/modal/confirmModal";
import { useAdminLang } from "../../../context/AdminLangContext";
import { showAddSuccessToast }    from "../../../utils/toast/successAddToast";
import { showUpdateSuccessToast } from "../../../utils/toast/successUpdateToast";
import { showDeleteSuccessToast } from "../../../utils/toast/successDeleteToast";

const API      = `${process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`}/api/links`;
const getToken = () => localStorage.getItem("token") || "";

const SORT_OPTIONS = [
  { labelBn: "নামে সাজান",   labelEn: "Sort by Name",   value: "name"   },
  { labelBn: "তারিখে সাজান", labelEn: "Sort by Date",   value: "date"   },
  { labelBn: "নতুন আগে",     labelEn: "Newest First",   value: "newest" },
  { labelBn: "স্ট্যাটাস",    labelEn: "Sort by Status", value: "status" },
];

const STATUS_OPTIONS = [
  { labelBn: "সক্রিয়",    labelEn: "Active",   value: true  },
  { labelBn: "নিষ্ক্রিয়", labelEn: "Inactive", value: false },
];

/* ════════════════════════════════════════
   LINK SHOW
════════════════════════════════════════ */
function LinkShow({
  links, loading, search, setSearch,
  sort, setSort, sortOpen, setSortOpen, sortRef,
  setView, handleDelete, handleEdit, onRefresh, t,
}) {
  return (
    <div className="mt-6 space-y-5">
      <AnimatePresence mode="wait">
        <motion.div key="home" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-5">

          {/* TOP BAR */}
          <div className="sticky top-0 z-20 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3"
            style={{ background: "rgba(13,20,38,0.92)", backdropFilter: "blur(16px)", padding: "14px 16px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="relative flex-1 lg:max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#475569" }}/>
              <input type="text"
                placeholder={t("লিংক খুঁজুন...","Search link...")}
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "9px 12px 9px 36px", fontSize: "13px", color: "#e2e8f0", outline: "none", fontFamily: "inherit" }}
                onFocus={e => e.target.style.borderColor = "rgba(201,168,76,0.35)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }}>
                  <X size={13}/>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onRefresh} disabled={loading}
                className="inline-flex items-center gap-1.5"
                style={{ padding: "9px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: 600, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8", cursor: "pointer", fontFamily: "inherit" }}>
                <RefreshCw size={13} className={loading ? "animate-spin" : ""}/>
                <span className="hidden sm:inline">{t("রিফ্রেশ","Refresh")}</span>
              </button>
              <button onClick={() => setView("add")}
                className="inline-flex items-center gap-1.5"
                style={{ padding: "9px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, background: "linear-gradient(135deg,#c9a84c,#e8c876)", color: "#0a0f1e", cursor: "pointer", boxShadow: "0 4px 16px rgba(201,168,76,0.25)", border: "none", fontFamily: "inherit" }}>
                <Plus size={15}/> {t("লিংক যোগ করুন","Add Link")}
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "#0d1426", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>

            {/* table header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "#0f1929" }}>
              <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#e2e8f0" }}>
                {t("প্যারেন্ট লিংক তালিকা","Parent Links List")}
                <span style={{ marginLeft: "8px", fontSize: "12px", fontWeight: 400, color: "#334155" }}>({links.length})</span>
              </h2>
              <div className="relative sm:w-52" ref={sortRef}>
                <button onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center justify-between gap-2 w-full"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "8px 13px", fontSize: "12px", color: "#cbd5e1", cursor: "pointer", fontFamily: "inherit" }}>
                  <span>{SORT_OPTIONS.find(o => o.value === sort) && t(SORT_OPTIONS.find(o => o.value === sort).labelBn, SORT_OPTIONS.find(o => o.value === sort).labelEn)}</span>
                  <ChevronDown size={13} style={{ color: "#475569" }}/>
                </button>
                <AnimatePresence>
                  {sortOpen && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-1.5 w-full z-50"
                      style={{ background: "#1a2235", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "12px", overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,0.5)" }}>
                      {SORT_OPTIONS.map(option => (
                        <div key={option.value}
                          onClick={() => { setSort(option.value); setSortOpen(false); }}
                          style={{ padding: "10px 16px", fontSize: "12px", cursor: "pointer", color: sort === option.value ? "#c9a84c" : "#94a3b8", background: sort === option.value ? "rgba(201,168,76,0.08)" : "transparent", fontWeight: sort === option.value ? 600 : 400 }}>
                          {t(option.labelBn, option.labelEn)}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* col headers */}
            <div className="grid items-center px-5 py-2.5"
              style={{ gridTemplateColumns: "40px 1fr 90px 72px", background: "#0f1929", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["#", t("নাম","Name"), t("স্ট্যাটাস","Status"), t("অ্যাকশন","Actions")].map((h, i) => (
                <div key={i} style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#2d3f55", textAlign: i === 3 ? "right" : "left" }}>{h}</div>
              ))}
            </div>

            {/* rows */}
            <div style={{ overflowY: "auto", maxHeight: "60vh" }}>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div style={{ width: "44px", height: "44px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)" }}>
                    <Loader2 size={18} className="animate-spin" style={{ color: "#c9a84c" }}/>
                  </div>
                  <p style={{ fontSize: "12px", color: "#475569" }}>{t("লোড হচ্ছে…","Loading…")}</p>
                </div>
              ) : links.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div style={{ width: "48px", height: "48px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <Link2 size={20} style={{ color: "#1e293b" }}/>
                  </div>
                  <p style={{ fontSize: "13px", color: "#475569" }}>{t("কোনো লিংক পাওয়া যায়নি।","No parent links found.")}</p>
                </div>
              ) : (
                links.map((link, index) => (
                  <motion.div key={link._id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="grid items-center px-5"
                    style={{ gridTemplateColumns: "40px 1fr 90px 72px", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div style={{ fontSize: "12px", fontWeight: 500, color: "#2d3f55" }}>{index + 1}</div>
                    <div style={{ fontSize: "13px", fontWeight: 500, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: "12px" }}>{link.name}</div>
                    <div>
                      <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: "8px", fontSize: "10px", fontWeight: 700, background: link.isActive ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)", color: link.isActive ? "#34d399" : "#f87171", border: `1px solid ${link.isActive ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}` }}>
                        {link.isActive ? t("সক্রিয়","Active") : t("নিষ্ক্রিয়","Inactive")}
                      </span>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(link)}
                        style={{ width: "28px", height: "28px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(129,140,248,0.08)", border: "none", color: "#818cf8", cursor: "pointer", transition: "all 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(129,140,248,0.18)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(129,140,248,0.08)"}>
                        <Pencil size={13}/>
                      </button>
                      <button onClick={() => handleDelete(link)}
                        style={{ width: "28px", height: "28px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(248,113,113,0.08)", border: "none", color: "#f87171", cursor: "pointer", transition: "all 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(248,113,113,0.18)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(248,113,113,0.08)"}>
                        <Trash2 size={12}/>
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ════════════════════════════════════════
   LINK ADD / EDIT
════════════════════════════════════════ */
function LinkAdd({ name, setName, isActive, setIsActive, handleSubmit, setView, nameError, editId, t }) {
  const [statusDropdown, setStatusDropdown] = useState(false);
  const statusRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (!statusRef.current?.contains(e.target)) setStatusDropdown(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentStatus = STATUS_OPTIONS.find(o => o.value === isActive);

  return (
    <div className="flex justify-center mt-8 px-2">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.form key="add"
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            style={{ background: "#0d1426", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "28px", boxShadow: "0 16px 48px rgba(0,0,0,0.4)", display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* prismatic line */}
            <div style={{ height: "1px", background: "linear-gradient(90deg,transparent,rgba(201,168,76,0.5) 40%,rgba(139,92,246,0.5) 70%,transparent)", marginBottom: "2px" }}/>

            <div className="text-center">
              <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "20px", color: "#f1f5f9", letterSpacing: "-0.01em" }}>
                {editId ? t("লিংক আপডেট করুন","Update Link") : t("লিংক যোগ করুন","Add Link")}
              </h2>
            </div>

            {/* name */}
            <div className="flex flex-col gap-1.5">
              <input type="text"
                placeholder={t("লিংকের নাম","Link Name")}
                value={name} onChange={e => setName(e.target.value)} required
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "11px 16px", fontSize: "13px", color: "#e2e8f0", outline: "none", fontFamily: "inherit", transition: "border-color 0.2s", width: "100%" }}
                onFocus={e => e.target.style.borderColor = "rgba(201,168,76,0.35)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
              {nameError && <p style={{ fontSize: "12px", color: "#f87171", paddingLeft: "4px" }}>{nameError}</p>}
            </div>

            {/* status */}
            <div className="relative" ref={statusRef}>
              <button type="button" onClick={() => setStatusDropdown(!statusDropdown)}
                className="flex items-center justify-between gap-2 w-full"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "11px 16px", fontSize: "13px", color: "#e2e8f0", cursor: "pointer", fontFamily: "inherit" }}>
                <span>{currentStatus && t(currentStatus.labelBn, currentStatus.labelEn)}</span>
                <ChevronDown size={14} style={{ color: "#475569" }}/>
              </button>
              <AnimatePresence>
                {statusDropdown && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-1.5 w-full z-50"
                    style={{ background: "#1a2235", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "12px", overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,0.5)" }}>
                    {STATUS_OPTIONS.map(option => (
                      <div key={String(option.value)}
                        onClick={() => { setIsActive(option.value); setStatusDropdown(false); }}
                        style={{ padding: "11px 16px", fontSize: "13px", cursor: "pointer", color: "#94a3b8", transition: "all 0.12s", fontFamily: "inherit" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#e2e8f0"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}>
                        {t(option.labelBn, option.labelEn)}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* buttons */}
            <div className="flex gap-3 mt-1">
              <button type="submit"
                style={{ flex: 1, padding: "12px", borderRadius: "12px", fontSize: "13px", fontWeight: 600, background: "linear-gradient(135deg,#c9a84c,#e8c876)", color: "#0a0f1e", border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(201,168,76,0.25)", fontFamily: "inherit" }}>
                {editId ? t("আপডেট করুন","Update") : t("তৈরি করুন","Create")}
              </button>
              <button type="button" onClick={() => setView("home")}
                style={{ flex: 1, padding: "12px", borderRadius: "12px", fontSize: "13px", fontWeight: 500, background: "rgba(255,255,255,0.05)", color: "#64748b", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", fontFamily: "inherit" }}>
                {t("বাতিল","Cancel")}
              </button>
            </div>
          </motion.form>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN
════════════════════════════════════════ */
const LinkHome = () => {
  const { t } = useAdminLang();

  const [links,      setLinks]      = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [view,       setView]       = useState("home");
  const [sort,       setSort]       = useState("newest");
  const [search,     setSearch]     = useState("");
  const [sortOpen,   setSortOpen]   = useState(false);
  const [nameError,  setNameError]  = useState("");
  const [editId,     setEditId]     = useState(null);
  const [name,       setName]       = useState("");
  const [isActive,   setIsActive]   = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId,   setDeleteId]   = useState(null);
  const [deleteName, setDeleteName] = useState("");

  const sortRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (!sortRef.current?.contains(e.target)) setSortOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const res    = await fetch(API);
      const result = await res.json();
      setLinks(result.success && Array.isArray(result.data) ? result.data : []);
    } catch { setLinks([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLinks(); }, []);

  const processedLinks = [...links]
    .filter(l => l.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "name")   return a.name.localeCompare(b.name);
      if (sort === "date")   return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "status") return b.isActive - a.isActive;
      return 0;
    });

  const handleSubmit = async (e) => {
    e.preventDefault(); setNameError("");
    const exist = links.find(l => l.name.toLowerCase() === name.toLowerCase() && l._id !== editId);
    if (exist) { setNameError(t("লিংকের নাম ইতিমধ্যে বিদ্যমান","Link name already exists")); return; }
    try {
      const url = editId ? `${API}/${editId}` : API;
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ name, isActive }),
      });
      if (!res.ok) return;
      editId ? showUpdateSuccessToast(name) : showAddSuccessToast(name);
      setName(""); setIsActive(true); setEditId(null); setView("home");
      fetchLinks();
    } catch (err) { console.log(err); }
  };

  const handleDelete  = (link) => { setDeleteId(link._id); setDeleteName(link.name); setDeleteOpen(true); };
  const confirmDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`${API}/${deleteId}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
    if (res.ok) { showDeleteSuccessToast(deleteName); fetchLinks(); }
    setDeleteOpen(false); setDeleteId(null); setDeleteName("");
  };
  const handleEdit = (link) => { setName(link.name); setIsActive(link.isActive); setEditId(link._id); setView("add"); };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');`}</style>

      <div style={{ fontFamily: "'DM Sans',sans-serif", maxWidth: "960px", margin: "0 auto", paddingBottom: "40px" }}>

        {/* ══ HEADER CARD ══ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ position: "relative", borderRadius: "18px", overflow: "hidden", marginBottom: "20px", background: "linear-gradient(135deg,#0d1426 0%,#111827 50%,#0f172a 100%)", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>

          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg,transparent,rgba(201,168,76,0.6) 30%,rgba(139,92,246,0.6) 70%,transparent)" }}/>
          <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "32px 32px" }}/>
          <div style={{ position: "absolute", top: "-60px", right: "-40px", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle,rgba(201,168,76,0.07) 0%,transparent 70%)", pointerEvents: "none" }}/>

          <div style={{ position: "relative", padding: "22px 26px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,rgba(201,168,76,0.15),rgba(201,168,76,0.05))", border: "1px solid rgba(201,168,76,0.2)", flexShrink: 0 }}>
                <Link2 size={20} style={{ color: "#c9a84c" }}/>
              </div>
              <div>
                <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "20px", color: "#f1f5f9", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                  {t("প্যারেন্ট নেভিগেশন লিংক","Parent Navigation Links")}
                </h1>
                <p style={{ fontSize: "12px", color: "#475569", marginTop: "2px" }}>
                  {t("শুধুমাত্র প্রধান মেনু নেভিগেশন পরিচালনা করুন।","Manage only main menu navigation.")}
                </p>
              </div>
            </div>
            {/* breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
              {view === "home" && <span style={{ color: "#c9a84c", fontWeight: 600 }}>linkhome</span>}
              {view === "add" && (
                <>
                  <span style={{ color: "#475569", cursor: "pointer" }}
                    onClick={() => { setView("home"); setName(""); setEditId(null); setNameError(""); }}>
                    linkhome
                  </span>
                  <span style={{ color: "#334155" }}>/</span>
                  <span style={{ color: "#c9a84c", fontWeight: 600 }}>{editId ? "update-link" : "add-link"}</span>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* ══ VIEWS ══ */}
        {view === "home" && (
          <LinkShow
            links={processedLinks} loading={loading}
            search={search} setSearch={setSearch}
            sort={sort} setSort={setSort}
            sortOpen={sortOpen} setSortOpen={setSortOpen} sortRef={sortRef}
            setView={setView} handleDelete={handleDelete} handleEdit={handleEdit}
            onRefresh={fetchLinks} t={t}
          />
        )}
        {view === "add" && (
          <LinkAdd
            name={name} setName={setName}
            isActive={isActive} setIsActive={setIsActive}
            handleSubmit={handleSubmit} setView={setView}
            nameError={nameError} editId={editId} t={t}
          />
        )}

        <ConfirmModal
          isOpen={deleteOpen} onClose={() => setDeleteOpen(false)}
          onConfirm={confirmDelete}
          title={t("লিংক ডিলিট করবেন?","Delete Link?")}
          message={`${t("আপনি কি নিশ্চিতভাবে মুছতে চান","Are you sure you want to delete")} "${deleteName}"?`}
          confirmText={t("ডিলিট","Delete")} cancelText={t("বাতিল","Cancel")} danger
        />
      </div>
    </>
  );
};

export default LinkHome;