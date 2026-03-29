import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ChevronDown, Plus, Pencil, Trash2,
  Loader2, X, Layers, RefreshCw,
} from "lucide-react";
import { showAddSuccessToast }    from "../../../utils/toast/successAddToast";
import { showUpdateSuccessToast } from "../../../utils/toast/successUpdateToast";
import { showDeleteSuccessToast } from "../../../utils/toast/successDeleteToast";
import { useSubLang } from "../../../context/SubAdminLangContext";

const API         = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;
const SUBLINK_API = `${API}/api/sublinks`;
const LINK_API    = `${API}/api/links`;

const getToken = () => localStorage.getItem("subAdminToken") || "";

const SORT_OPTIONS = [
  { labelBn: "নাম অনুযায়ী",    labelEn: "Sort by Name",   value: "name"   },
  { labelBn: "তারিখ অনুযায়ী",  labelEn: "Sort by Date",   value: "date"   },
  { labelBn: "নতুন প্রথমে",     labelEn: "Newest First",   value: "newest" },
  { labelBn: "স্ট্যাটাস",       labelEn: "Sort by Status", value: "status" },
];

const STATUS_OPTIONS = [
  { labelBn: "সক্রিয়",    labelEn: "Active",   value: true  },
  { labelBn: "নিষ্ক্রিয়", labelEn: "Inactive", value: false },
];

/* ── Confirm Modal ── */
function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, danger }) {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 backdrop-blur-sm"
            style={{ background: "rgba(30,27,75,0.28)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className="w-full max-w-sm pointer-events-auto"
              style={{
                background: "linear-gradient(160deg,#ffffff 0%,#fafbff 100%)",
                borderRadius: 20,
                border: "1px solid rgba(99,102,241,0.13)",
                boxShadow: "0 24px 64px rgba(99,102,241,0.14), 0 4px 20px rgba(0,0,0,0.06)",
                padding: "24px",
              }}
            >
              <h3 className="text-[15px] font-black tracking-[-0.02em]" style={{ color: "#0f172a", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                {title}
              </h3>
              <p className="text-[13px] mt-2 leading-relaxed" style={{ color: "#64748b" }}>
                {message}
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
                  style={{
                    background: "rgba(99,102,241,0.06)",
                    border: "1px solid rgba(99,102,241,0.13)",
                    color: "#475569",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.10)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(99,102,241,0.06)"}
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all"
                  style={{
                    background: danger
                      ? "linear-gradient(135deg,#f43f5e,#e11d48)"
                      : "linear-gradient(135deg,#6366f1,#4f46e5)",
                    boxShadow: danger
                      ? "0 4px 14px rgba(244,63,94,0.3)"
                      : "0 4px 14px rgba(99,102,241,0.3)",
                    border: "none",
                  }}
                >
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

/* ════════════════════════════════════════
   SUBLINK SHOW
════════════════════════════════════════ */
function SublinkShow({
  sublinks, loading, search, setSearch,
  sort, setSort, sortOpen, setSortOpen, sortRef,
  parentFilter, setParentFilter, parentFilterOpen, setParentFilterOpen, parentFilterRef,
  setView, handleDelete, handleEdit, parentLinks, onRefresh,
}) {
  const { t } = useSubLang();

  const selectedParentName = parentLinks.find(p => p._id === parentFilter)?.name;

  const displayed = sublinks.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.parent?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchParent = !parentFilter || (s.parent?._id || s.parent) === parentFilter;
    return matchSearch && matchParent;
  });

  /* shared dropdown style */
  const dropdownBtn = (extra = {}) => ({
    display: "flex", alignItems: "center", justifyContent: "space-between",
    width: "100%", background: "#fff",
    border: "1px solid rgba(99,102,241,0.15)",
    borderRadius: 12, padding: "9px 14px",
    fontSize: 13, fontWeight: 500, color: "#374151",
    cursor: "pointer", transition: "all .15s ease",
    boxShadow: "0 1px 4px rgba(99,102,241,0.05)",
    ...extra,
  });

  const dropdownPanel = {
    position: "absolute", right: 0, top: "calc(100% + 6px)",
    width: "100%", borderRadius: 14,
    background: "#fff",
    border: "1px solid rgba(99,102,241,0.12)",
    boxShadow: "0 16px 48px rgba(99,102,241,0.13), 0 2px 8px rgba(0,0,0,0.05)",
    overflow: "hidden", zIndex: 50,
  };

  const dropdownItem = (active) => ({
    padding: "10px 14px", fontSize: 13, cursor: "pointer",
    background: active ? "rgba(99,102,241,0.07)" : "transparent",
    color: active ? "#6366f1" : "#374151",
    fontWeight: active ? 600 : 400,
    transition: "background .12s ease",
  });

  return (
    <div className="mt-6 sm:mt-8 space-y-5">
      <AnimatePresence mode="wait">
        <motion.div
          key="home"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
          className="space-y-5"
        >

          {/* ── TOP BAR ── */}
          <div
            className="sticky top-0 z-20 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3"
            style={{
              background: "linear-gradient(160deg,#ffffff,#fafbff)",
              border: "1px solid rgba(99,102,241,0.10)",
              borderRadius: 18,
              padding: "14px 16px",
              boxShadow: "0 4px 20px rgba(99,102,241,0.06), 0 1px 0 rgba(99,102,241,0.05)",
            }}
          >
            {/* Search */}
            <div
              className="flex items-center gap-2.5 w-full lg:w-80"
              style={{
                background: "rgba(99,102,241,0.05)",
                border: "1px solid rgba(99,102,241,0.12)",
                borderRadius: 11, padding: "8px 13px",
                transition: "all .15s",
              }}
              onFocus={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.35)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.09)"; e.currentTarget.style.background = "#fff"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.12)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.background = "rgba(99,102,241,0.05)"; }}
            >
              <Search size={14} style={{ color: "#a8b4c8", flexShrink: 0 }} />
              <input
                type="text"
                placeholder={t("সাবলিংক খুঁজুন...", "Search sublink...")}
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  background: "transparent", outline: "none", border: "none",
                  fontSize: 13, color: "#374151", width: "100%",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{ color: "#a8b4c8", lineHeight: 1 }}>
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={onRefresh}
                disabled={loading}
                className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2"
                style={{
                  background: "rgba(99,102,241,0.06)",
                  border: "1px solid rgba(99,102,241,0.14)",
                  borderRadius: 11, padding: "9px 16px",
                  fontSize: 13, fontWeight: 500, color: "#6366f1",
                  cursor: "pointer", transition: "all .15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.11)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(99,102,241,0.06)"}
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                <span className="hidden sm:inline">{t("রিফ্রেশ", "Refresh")}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                onClick={() => setView("add")}
                className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg,#6366f1,#4f46e5)",
                  border: "none", borderRadius: 11,
                  padding: "9px 18px",
                  fontSize: 13, fontWeight: 600, color: "#fff",
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(99,102,241,0.32), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
              >
                <Plus size={14} strokeWidth={2.5} />
                {t("সাবলিংক যোগ করুন", "Add Sublink")}
              </motion.button>
            </div>
          </div>

          {/* ── TABLE CARD ── */}
          <div
            style={{
              background: "linear-gradient(160deg,#ffffff,#fafbff)",
              border: "1px solid rgba(99,102,241,0.10)",
              borderRadius: 18,
              boxShadow: "0 4px 24px rgba(99,102,241,0.06)",
              overflow: "hidden",
            }}
          >

            {/* Table header */}
            <div
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 sm:px-5 py-4"
              style={{ borderBottom: "1px solid rgba(99,102,241,0.08)", background: "rgba(99,102,241,0.025)" }}
            >
              <h2
                className="text-center md:text-left text-[13.5px] sm:text-sm md:text-base font-black tracking-[-0.02em] shrink-0"
                style={{ color: "#1e293b", fontFamily: "'Plus Jakarta Sans',sans-serif" }}
              >
                {t("সাবলিংক তালিকা", "Sublinks List")}
                {displayed.length !== sublinks.length && (
                  <span className="ml-2 text-[11px] font-medium" style={{ color: "#94a3b8" }}>
                    ({displayed.length} {t("এর মধ্যে", "of")} {sublinks.length})
                  </span>
                )}
              </h2>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">

                {/* Parent filter */}
                <div className="relative w-full sm:w-48 md:w-44" ref={parentFilterRef}>
                  <button
                    type="button"
                    onClick={() => setParentFilterOpen(!parentFilterOpen)}
                    style={dropdownBtn()}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.15)"}
                  >
                    <span style={{ color: parentFilter ? "#374151" : "#a8b4c8", fontWeight: parentFilter ? 500 : 400, fontSize: 13 }}>
                      {selectedParentName || t("লিংক ফিল্টার", "Filter by Link")}
                    </span>
                    <ChevronDown size={14} style={{ color: "#a8b4c8", flexShrink: 0 }} />
                  </button>
                  <AnimatePresence>
                    {parentFilterOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.97 }}
                        transition={{ duration: 0.18 }}
                        style={{ ...dropdownPanel, maxHeight: 200, overflowY: "auto" }}
                      >
                        <div
                          onClick={() => { setParentFilter(""); setParentFilterOpen(false); }}
                          style={dropdownItem(!parentFilter)}
                          onMouseEnter={e => !parentFilter ? null : e.currentTarget.style.background = "rgba(99,102,241,0.04)"}
                          onMouseLeave={e => !parentFilter ? null : e.currentTarget.style.background = "transparent"}
                        >
                          — {t("সব", "All")} —
                        </div>
                        {parentLinks.map(p => (
                          <div
                            key={p._id}
                            onClick={() => { setParentFilter(p._id); setParentFilterOpen(false); }}
                            style={dropdownItem(parentFilter === p._id)}
                            onMouseEnter={e => parentFilter !== p._id && (e.currentTarget.style.background = "rgba(99,102,241,0.04)")}
                            onMouseLeave={e => parentFilter !== p._id && (e.currentTarget.style.background = "transparent")}
                          >
                            {p.name}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {parentFilter && (
                  <button
                    onClick={() => setParentFilter("")}
                    className="flex items-center justify-center gap-1 w-full sm:w-auto"
                    style={{ fontSize: 12, fontWeight: 600, color: "#ef4444", cursor: "pointer", background: "none", border: "none" }}
                  >
                    <X size={12} /> {t("ক্লিয়ার", "Clear")}
                  </button>
                )}

                {/* Sort */}
                <div className="relative w-full sm:w-48 md:w-44" ref={sortRef}>
                  <button
                    onClick={() => setSortOpen(!sortOpen)}
                    style={dropdownBtn()}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.15)"}
                  >
                    <span style={{ fontSize: 13 }}>
                      {SORT_OPTIONS.find(o => o.value === sort) &&
                        t(SORT_OPTIONS.find(o => o.value === sort).labelBn,
                          SORT_OPTIONS.find(o => o.value === sort).labelEn)}
                    </span>
                    <ChevronDown size={14} style={{ color: "#a8b4c8", flexShrink: 0 }} />
                  </button>
                  <AnimatePresence>
                    {sortOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.97 }}
                        transition={{ duration: 0.18 }}
                        style={dropdownPanel}
                      >
                        {SORT_OPTIONS.map(option => (
                          <div
                            key={option.value}
                            onClick={() => { setSort(option.value); setSortOpen(false); }}
                            style={dropdownItem(sort === option.value)}
                            onMouseEnter={e => sort !== option.value && (e.currentTarget.style.background = "rgba(99,102,241,0.04)")}
                            onMouseLeave={e => sort !== option.value && (e.currentTarget.style.background = "transparent")}
                          >
                            {t(option.labelBn, option.labelEn)}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Column headers */}
            <div
              className="sl-trow items-center px-3 sm:px-5 py-3"
              style={{
                fontSize: 10.5, fontWeight: 700, color: "#94a3b8",
                letterSpacing: ".06em", textTransform: "uppercase",
                borderBottom: "1px solid rgba(99,102,241,0.08)",
                background: "rgba(99,102,241,0.02)",
              }}
            >
              <div>#</div>
              <div className="sl-col-name">{t("নাম", "Name")}</div>
              <div>{t("প্যারেন্ট", "Parent")}</div>
              <div style={{ textAlign: "right" }}>{t("কার্যক্রম", "Actions")}</div>
            </div>

            {/* Rows */}
            <div className="overflow-y-auto" style={{ maxHeight: "60vh" }}>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 size={26} style={{ color: "#c4cdd8" }} className="animate-spin" />
                  <p style={{ fontSize: 13, color: "#94a3b8" }}>{t("লোড হচ্ছে…", "Loading…")}</p>
                </div>
              ) : displayed.length === 0 ? (
                <div className="py-14 text-center">
                  <div
                    className="mx-auto mb-4 w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.12)" }}
                  >
                    <Layers size={22} style={{ color: "#c4cdd8" }} />
                  </div>
                  <p style={{ fontSize: 13, color: "#94a3b8" }}>{t("কোনো সাবলিংক নেই।", "No sublinks found.")}</p>
                </div>
              ) : (
                displayed.map((sub, index) => (
                  <motion.div
                    key={sub._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="sl-trow items-center px-3 sm:px-5 py-3.5"
                    style={{
                      borderBottom: "1px solid rgba(99,102,241,0.06)",
                      transition: "background .12s ease",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.025)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#c4cdd8" }}>{index + 1}</div>

                    <div className="sl-col-name min-w-0 pr-2">
                      <p className="truncate" style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
                        {sub.name}
                      </p>
                      <p
                        style={{
                          fontSize: 10, marginTop: 2, fontWeight: 700, letterSpacing: ".04em",
                          color: sub.isActive ? "#10b981" : "#f43f5e",
                        }}
                      >
                        {sub.isActive ? t("সক্রিয়", "Active") : t("নিষ্ক্রিয়", "Inactive")}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <span className="sl-parent-badge inline-flex items-center truncate"
                        style={{
                          padding: "3px 9px", borderRadius: 8,
                          fontSize: 11, fontWeight: 600,
                          background: "rgba(99,102,241,0.08)",
                          border: "1px solid rgba(99,102,241,0.13)",
                          color: "#6366f1",
                        }}
                      >
                        {sub.parent?.name || "—"}
                      </span>
                    </div>

                    <div className="flex justify-end items-center gap-2 sm:gap-2.5">
                      <motion.button
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(sub)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                        style={{
                          background: "rgba(99,102,241,0.07)",
                          border: "1px solid rgba(99,102,241,0.13)",
                          color: "#6366f1",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.14)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(99,102,241,0.07)"}
                      >
                        <Pencil size={12} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(sub)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                        style={{
                          background: "rgba(244,63,94,0.07)",
                          border: "1px solid rgba(244,63,94,0.13)",
                          color: "#f43f5e",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(244,63,94,0.14)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(244,63,94,0.07)"}
                      >
                        <Trash2 size={12} />
                      </motion.button>
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
   SUBLINK ADD / EDIT
════════════════════════════════════════ */
function SublinkAdd({
  name, setName, parentId, setParentId, isActive, setIsActive,
  parentLinks, handleSubmit, setView, resetForm, nameError, editId, submitting,
}) {
  const { t } = useSubLang();
  const [parentDropdown, setParentDropdown] = useState(false);
  const [statusDropdown, setStatusDropdown] = useState(false);
  const parentRef = useRef(null);
  const statusRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!parentRef.current?.contains(e.target)) setParentDropdown(false);
      if (!statusRef.current?.contains(e.target)) setStatusDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedParentName = parentLinks.find(p => p._id === parentId)?.name;
  const currentStatus      = STATUS_OPTIONS.find(o => o.value === isActive);

  return (
    <div className="flex justify-center mt-8 px-2 sm:px-4 md:px-6">
      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          <motion.form
            key="add"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            onSubmit={handleSubmit}
            style={{
              background: "#ffffff",
              borderRadius: 24,
              border: "1px solid rgba(99,102,241,0.10)",
              boxShadow: "0 20px 60px rgba(99,102,241,0.10), 0 4px 16px rgba(0,0,0,0.04)",
              overflow: "visible",
              position: "relative",
            }}
          >
            {/* floating icon badge */}
            <div style={{
              position: "absolute", top: -22, left: "50%", transform: "translateX(-50%)",
              width: 44, height: 44, borderRadius: 14,
              background: editId
                ? "linear-gradient(135deg,#8b5cf6,#7c3aed)"
                : "linear-gradient(135deg,#6366f1,#4f46e5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 6px 20px rgba(99,102,241,0.38), inset 0 1px 0 rgba(255,255,255,0.18)",
              zIndex: 10,
            }}>
              <Layers size={20} color="#fff" strokeWidth={1.8} />
            </div>

            {/* ambient glow blobs */}
            <div style={{
              position: "absolute", inset: 0, borderRadius: 24, overflow: "hidden", pointerEvents: "none",
            }}>
              <div style={{
                position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%",
                background: "radial-gradient(circle,rgba(99,102,241,0.06) 0%,transparent 70%)",
              }} />
              <div style={{
                position: "absolute", bottom: -30, left: -30, width: 150, height: 150, borderRadius: "50%",
                background: "radial-gradient(circle,rgba(139,92,246,0.05) 0%,transparent 70%)",
              }} />
            </div>

            <div style={{ padding: "44px 28px 28px", position: "relative" }}>

              {/* Title */}
              <div className="text-center" style={{ marginBottom: 28 }}>
                <h2 style={{
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                  fontSize: 20, fontWeight: 800,
                  color: "#1e293b", letterSpacing: "-0.03em", lineHeight: 1.2,
                }}>
                  {editId ? t("সাবলিংক আপডেট", "Update Sublink") : t("নতুন সাবলিংক", "New Sublink")}
                </h2>
                <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 6, lineHeight: 1.5 }}>
                  {editId
                    ? t("নিচের তথ্য পরিবর্তন করুন", "Edit the details below and save")
                    : t("সাবলিংকের তথ্য পূরণ করুন", "Fill in the information to add a sublink")}
                </p>
              </div>

              {/* Fields */}
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                {/* Name */}
                <div>
                  <label style={{
                    display: "block", fontSize: 11.5, fontWeight: 700,
                    color: "#64748b", letterSpacing: ".06em", textTransform: "uppercase",
                    marginBottom: 7,
                  }}>
                    {t("সাবলিংকের নাম", "Sublink Name")}
                    <span style={{ color: "#f43f5e", marginLeft: 3 }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      placeholder={t("যেমন: Electronics, Fashion…", "e.g. Electronics, Fashion…")}
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      style={{
                        width: "100%", outline: "none",
                        background: nameError ? "rgba(244,63,94,0.03)" : "#f8f9ff",
                        border: `1.5px solid ${nameError ? "rgba(244,63,94,0.35)" : "rgba(99,102,241,0.14)"}`,
                        borderRadius: 13, padding: "12px 16px",
                        fontSize: 13.5, color: "#1e293b",
                        fontFamily: "'Plus Jakarta Sans',sans-serif",
                        transition: "all .18s ease",
                      }}
                      onFocus={e => {
                        e.target.style.background = "#fff";
                        e.target.style.borderColor = "rgba(99,102,241,0.45)";
                        e.target.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.08)";
                      }}
                      onBlur={e => {
                        e.target.style.background = nameError ? "rgba(244,63,94,0.03)" : "#f8f9ff";
                        e.target.style.borderColor = nameError ? "rgba(244,63,94,0.35)" : "rgba(99,102,241,0.14)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                  <AnimatePresence>
                    {nameError && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ fontSize: 12, color: "#f43f5e", marginTop: 6, fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}
                      >
                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#f43f5e", display: "inline-block", flexShrink: 0 }} />
                        {nameError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Parent Link */}
                <div>
                  <label style={{
                    display: "block", fontSize: 11.5, fontWeight: 700,
                    color: "#64748b", letterSpacing: ".06em", textTransform: "uppercase",
                    marginBottom: 7,
                  }}>
                    {t("প্যারেন্ট লিংক", "Parent Link")}
                    <span style={{ color: "#f43f5e", marginLeft: 3 }}>*</span>
                  </label>
                  <div style={{ position: "relative" }} ref={parentRef}>
                    <button
                      type="button"
                      onClick={() => setParentDropdown(!parentDropdown)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        width: "100%", cursor: "pointer",
                        background: parentId ? "#fff" : "#f8f9ff",
                        border: `1.5px solid ${!parentId && nameError ? "rgba(244,63,94,0.35)" : parentId ? "rgba(99,102,241,0.3)" : "rgba(99,102,241,0.14)"}`,
                        borderRadius: 13, padding: "12px 16px",
                        fontSize: 13.5, color: parentId ? "#1e293b" : "#a8b4c8",
                        transition: "all .18s ease",
                        boxShadow: parentId ? "0 0 0 4px rgba(99,102,241,0.06)" : "none",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)"; e.currentTarget.style.background = "#fff"; }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = !parentId && nameError ? "rgba(244,63,94,0.35)" : parentId ? "rgba(99,102,241,0.3)" : "rgba(99,102,241,0.14)";
                        e.currentTarget.style.background = parentId ? "#fff" : "#f8f9ff";
                      }}
                    >
                      <span style={{ fontWeight: parentId ? 500 : 400 }}>
                        {selectedParentName || t("লিংক নির্বাচন করুন", "Select a parent link")}
                      </span>
                      <motion.span animate={{ rotate: parentDropdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown size={15} style={{ color: "#a8b4c8" }} />
                      </motion.span>
                    </button>
                    <AnimatePresence>
                      {parentDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.97 }}
                          transition={{ type: "spring", stiffness: 380, damping: 28 }}
                          style={{
                            position: "absolute", left: 0, top: "calc(100% + 8px)",
                            width: "100%", borderRadius: 16,
                            background: "#fff",
                            border: "1px solid rgba(99,102,241,0.12)",
                            boxShadow: "0 20px 56px rgba(99,102,241,0.14), 0 4px 12px rgba(0,0,0,0.06)",
                            overflow: "hidden", zIndex: 50,
                            maxHeight: 210, overflowY: "auto",
                          }}
                        >
                          {parentLinks.length === 0 ? (
                            <div style={{ padding: "14px 16px", fontSize: 13, color: "#94a3b8", textAlign: "center" }}>
                              {t("কোনো লিংক নেই", "No links found.")}
                            </div>
                          ) : parentLinks.map((p, i) => (
                            <div
                              key={p._id}
                              onClick={() => { setParentId(p._id); setParentDropdown(false); }}
                              style={{
                                padding: "11px 16px", fontSize: 13.5, cursor: "pointer",
                                background: parentId === p._id ? "rgba(99,102,241,0.07)" : "transparent",
                                color: parentId === p._id ? "#6366f1" : "#374151",
                                fontWeight: parentId === p._id ? 600 : 400,
                                borderBottom: i < parentLinks.length - 1 ? "1px solid rgba(99,102,241,0.05)" : "none",
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                transition: "background .12s",
                              }}
                              onMouseEnter={e => parentId !== p._id && (e.currentTarget.style.background = "rgba(99,102,241,0.04)")}
                              onMouseLeave={e => parentId !== p._id && (e.currentTarget.style.background = "transparent")}
                            >
                              {p.name}
                              {parentId === p._id && (
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", display: "inline-block" }} />
                              )}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Status — toggle cards */}
                <div>
                  <label style={{
                    display: "block", fontSize: 11.5, fontWeight: 700,
                    color: "#64748b", letterSpacing: ".06em", textTransform: "uppercase",
                    marginBottom: 7,
                  }}>
                    {t("স্ট্যাটাস", "Status")}
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {STATUS_OPTIONS.map(option => {
                      const isSelected = isActive === option.value;
                      const dotColor   = option.value ? "#10b981" : "#f43f5e";
                      const selBg      = option.value ? "rgba(16,185,129,0.07)" : "rgba(244,63,94,0.06)";
                      const selBorder  = option.value ? "rgba(16,185,129,0.3)" : "rgba(244,63,94,0.28)";
                      const selColor   = option.value ? "#059669" : "#e11d48";
                      return (
                        <motion.button
                          key={String(option.value)}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setIsActive(option.value)}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            padding: "11px 14px", borderRadius: 13, cursor: "pointer",
                            background: isSelected ? selBg : "#f8f9ff",
                            border: `1.5px solid ${isSelected ? selBorder : "rgba(99,102,241,0.10)"}`,
                            color: isSelected ? selColor : "#94a3b8",
                            fontSize: 13.5, fontWeight: isSelected ? 700 : 500,
                            transition: "all .18s ease",
                            boxShadow: isSelected ? `0 2px 12px ${dotColor}18` : "none",
                          }}
                        >
                          <span style={{
                            width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                            background: isSelected ? dotColor : "#d1d9e0",
                            boxShadow: isSelected ? `0 0 0 3px ${dotColor}22` : "none",
                            transition: "all .18s",
                          }} />
                          {t(option.labelBn, option.labelEn)}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "rgba(99,102,241,0.07)", margin: "24px 0 20px" }} />

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={!submitting ? { scale: 1.02, y: -1 } : {}}
                  whileTap={!submitting ? { scale: 0.97 } : {}}
                  className="w-full sm:w-1/2 inline-flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
                    border: "none", borderRadius: 13,
                    padding: "12px 20px",
                    fontSize: 13.5, fontWeight: 700, color: "#fff",
                    cursor: submitting ? "not-allowed" : "pointer",
                    opacity: submitting ? 0.72 : 1,
                    boxShadow: "0 6px 20px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
                    letterSpacing: "-.01em",
                  }}
                >
                  {submitting ? (
                    <><Loader2 size={14} className="animate-spin" /> {t("অপেক্ষা করুন…", "Please wait…")}</>
                  ) : (
                    editId ? t("আপডেট করুন", "Save Changes") : t("তৈরি করুন", "Create Sublink")
                  )}
                </motion.button>

                <motion.button
                  type="button"
                  disabled={submitting}
                  whileHover={!submitting ? { scale: 1.02 } : {}}
                  whileTap={!submitting ? { scale: 0.97 } : {}}
                  onClick={() => { setView("home"); resetForm(); }}
                  className="w-full sm:w-1/2 inline-flex items-center justify-center gap-2"
                  style={{
                    background: "rgba(99,102,241,0.05)",
                    border: "1.5px solid rgba(99,102,241,0.13)",
                    borderRadius: 13, padding: "12px 20px",
                    fontSize: 13.5, fontWeight: 600, color: "#6366f1",
                    cursor: submitting ? "not-allowed" : "pointer",
                    opacity: submitting ? 0.5 : 1,
                    transition: "all .15s",
                    letterSpacing: "-.01em",
                  }}
                  onMouseEnter={e => !submitting && (e.currentTarget.style.background = "rgba(99,102,241,0.10)")}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(99,102,241,0.05)"}
                >
                  {t("বাতিল করুন", "Cancel")}
                </motion.button>
              </div>

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
export default function SubAdminSublinks() {
  const { t } = useSubLang();

  const [sublinks,     setSublinks]     = useState([]);
  const [parentLinks,  setParentLinks]  = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [view,         setView]         = useState("home");
  const [sort,         setSort]         = useState("newest");
  const [search,       setSearch]       = useState("");

  /* dropdowns */
  const [sortOpen,         setSortOpen]         = useState(false);
  const [parentFilterOpen, setParentFilterOpen] = useState(false);
  const [parentFilter,     setParentFilter]     = useState("");
  const sortRef         = useRef(null);
  const parentFilterRef = useRef(null);

  /* form */
  const [name,      setName]      = useState("");
  const [parentId,  setParentId]  = useState("");
  const [isActive,  setIsActive]  = useState(true);
  const [nameError, setNameError] = useState("");
  const [editId,    setEditId]    = useState(null);

  /* delete */
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId,   setDeleteId]   = useState(null);
  const [deleteName, setDeleteName] = useState("");

  /* close dropdowns on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (!sortRef.current?.contains(e.target))         setSortOpen(false);
      if (!parentFilterRef.current?.contains(e.target)) setParentFilterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchParentLinks = async () => {
    try {
      const res  = await fetch(LINK_API);
      const data = await res.json();
      setParentLinks(data.data || []);
    } catch (err) { console.log(err); }
  };

  const fetchSublinks = async () => {
    try {
      setLoading(true);
      const res  = await fetch(SUBLINK_API);
      const data = await res.json();
      setSublinks(data.data || []);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchParentLinks(); fetchSublinks(); }, []);

  const processedSublinks = [...sublinks].sort((a, b) => {
    if (sort === "name")   return a.name.localeCompare(b.name);
    if (sort === "date")   return new Date(a.createdAt) - new Date(b.createdAt);
    if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sort === "status") return b.isActive - a.isActive;
    return 0;
  });

  const resetForm = () => {
    setName(""); setParentId(""); setIsActive(true);
    setNameError(""); setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNameError("");

    if (!name.trim()) {
      setNameError(t("সাবলিংকের নাম আবশ্যক", "Sublink name is required"));
      return;
    }
    if (!parentId) {
      setNameError(t("প্যারেন্ট লিংক নির্বাচন করুন", "Please select a parent link"));
      return;
    }

    try {
      setSubmitting(true);
      const url    = editId ? `${SUBLINK_API}/${editId}` : SUBLINK_API;
      const method = editId ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name, parent: parentId, isActive }),
      });

      if (!res.ok) {
        const err = await res.json();
        setNameError(err.message || t("ত্রুটি হয়েছে", "An error occurred"));
        return;
      }

      editId ? showUpdateSuccessToast(name) : showAddSuccessToast(name);
      resetForm();
      setView("home");
      fetchSublinks();
    } catch (err) { console.log(err); }
    finally { setSubmitting(false); }
  };

  const handleDelete = (sub) => {
    setDeleteId(sub._id);
    setDeleteName(sub.name);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`${SUBLINK_API}/${deleteId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (res.ok) { showDeleteSuccessToast(deleteName); fetchSublinks(); }
    setDeleteOpen(false);
    setDeleteId(null);
    setDeleteName("");
  };

  const handleEdit = (sub) => {
    setName(sub.name);
    setParentId(sub.parent?._id || sub.parent || "");
    setIsActive(sub.isActive);
    setEditId(sub._id);
    setView("add");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .sl-wrap, .sl-wrap * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }

        /* ── Responsive table row grid ── */
        /* Desktop: serial | name(span 2 cols) | parent | actions */
        .sl-trow {
          display: grid;
          grid-template-columns: 28px 1fr 1fr 96px 68px;
          align-items: center;
        }
        /* name cell always spans 2 of the middle columns */
        .sl-col-name {
          grid-column: span 2;
        }

        /* Tablet  ≤ 640px */
        @media (max-width: 640px) {
          .sl-trow {
            grid-template-columns: 22px 1fr 1fr 54px 60px;
          }
        }

        /* Mobile  ≤ 480px */
        @media (max-width: 480px) {
          .sl-trow {
            grid-template-columns: 18px 1fr 1fr 38px 56px;
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
        }

        /* ── Parent badge: shrinks on small screens ── */
        .sl-parent-badge {
          display: inline-flex;
          align-items: center;
          max-width: 88px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        @media (max-width: 640px) {
          .sl-parent-badge {
            max-width: 50px;
            padding: 3px 6px !important;
            font-size: 10px !important;
          }
        }
        @media (max-width: 480px) {
          .sl-parent-badge {
            max-width: 34px;
            padding: 2px 5px !important;
            font-size: 9.5px !important;
            border-radius: 6px !important;
          }
        }
      `}</style>

      <div className="sl-wrap px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="w-full">

          {/* ── Page title ── */}
          <div className="space-y-3 sm:space-y-4">
            <div className="text-center">
              <h1
                className="text-[20px] sm:text-[24px] md:text-[28px] font-black tracking-[-0.03em]"
                style={{ color: "#1e293b", fontFamily: "'Plus Jakarta Sans',sans-serif" }}
              >
                {t("সাবলিংক", "Sublinks")}
              </h1>
              <p className="text-[12.5px] sm:text-sm mt-1" style={{ color: "#94a3b8" }}>
                {t("নেভিগেশন সাবলিংক ম্যানেজ করুন।", "Manage navigation sublinks.")}
              </p>
            </div>

            {/* breadcrumb */}
            <div className="flex justify-start">
              <div
                className="flex flex-wrap items-center gap-1.5 text-[12px] sm:text-[13px]"
                style={{ color: "#94a3b8" }}
              >
                {view === "home" && (
                  <span
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg"
                    style={{
                      background: "rgba(99,102,241,0.08)",
                      border: "1px solid rgba(99,102,241,0.13)",
                      color: "#6366f1", fontWeight: 600, fontSize: 12,
                    }}
                  >
                    <Layers size={12} />
                    {t("সাবলিংক", "Sublinks")}
                  </span>
                )}
                {view === "add" && (
                  <>
                    <button
                      onClick={() => { setView("home"); resetForm(); }}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all"
                      style={{
                        background: "transparent",
                        border: "1px solid rgba(99,102,241,0.10)",
                        color: "#94a3b8", fontWeight: 500, fontSize: 12, cursor: "pointer",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.06)"; e.currentTarget.style.color = "#6366f1"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}
                    >
                      <Layers size={12} />
                      {t("সাবলিংক", "Sublinks")}
                    </button>
                    <span style={{ color: "#e2e8f0" }}>/</span>
                    <span
                      className="px-3 py-1 rounded-lg"
                      style={{
                        background: "rgba(99,102,241,0.08)",
                        border: "1px solid rgba(99,102,241,0.13)",
                        color: "#6366f1", fontWeight: 600, fontSize: 12,
                      }}
                    >
                      {editId ? t("আপডেট", "Update") : t("যোগ করুন", "Add")}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── Views ── */}
          {view === "home" && (
            <SublinkShow
              sublinks={processedSublinks} loading={loading}
              search={search} setSearch={setSearch}
              sort={sort} setSort={setSort}
              sortOpen={sortOpen} setSortOpen={setSortOpen} sortRef={sortRef}
              parentFilter={parentFilter} setParentFilter={setParentFilter}
              parentFilterOpen={parentFilterOpen} setParentFilterOpen={setParentFilterOpen}
              parentFilterRef={parentFilterRef}
              setView={setView} handleDelete={handleDelete} handleEdit={handleEdit}
              parentLinks={parentLinks}
              onRefresh={fetchSublinks}
            />
          )}

          {view === "add" && (
            <SublinkAdd
              name={name} setName={setName}
              parentId={parentId} setParentId={setParentId}
              isActive={isActive} setIsActive={setIsActive}
              parentLinks={parentLinks}
              handleSubmit={handleSubmit}
              setView={setView} resetForm={resetForm}
              nameError={nameError} editId={editId}
              submitting={submitting}
            />
          )}

          <ConfirmModal
            isOpen={deleteOpen} onClose={() => setDeleteOpen(false)}
            onConfirm={confirmDelete}
            title={t("সাবলিংক মুছবেন?", "Delete Sublink?")}
            message={`"${deleteName}" ${t("মুছতে চান?", "Are you sure you want to delete this?")}`}
            confirmText={t("মুছুন", "Delete")}
            cancelText={t("বাতিল", "Cancel")}
            danger
          />
        </div>
      </div>
    </>
  );
}