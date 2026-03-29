import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ChevronDown, Plus, Pencil, Trash2,
  Loader2, X, RefreshCw, Link2,
} from "lucide-react";
import { showAddSuccessToast }    from "../../../utils/toast/successAddToast";
import { showUpdateSuccessToast } from "../../../utils/toast/successUpdateToast";
import { showDeleteSuccessToast } from "../../../utils/toast/successDeleteToast";
import { useSubLang } from "../../../context/SubAdminLangContext";

const API      = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;
const LINK_API = `${API}/api/links`;

const getToken = () => localStorage.getItem("subAdminToken") || "";

const SORT_OPTIONS = [
  { labelBn: "নাম অনুযায়ী",   labelEn: "Sort by Name",   value: "name"   },
  { labelBn: "তারিখ অনুযায়ী", labelEn: "Sort by Date",   value: "date"   },
  { labelBn: "নতুন প্রথমে",    labelEn: "Newest First",   value: "newest" },
  { labelBn: "স্ট্যাটাস",      labelEn: "Sort by Status", value: "status" },
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
              <h3 style={{ fontSize: 15, fontWeight: 900, color: "#0f172a", fontFamily: "'Plus Jakarta Sans',sans-serif", letterSpacing: "-0.02em" }}>
                {title}
              </h3>
              <p style={{ fontSize: 13, marginTop: 8, color: "#64748b", lineHeight: 1.6 }}>{message}</p>
              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <button onClick={onClose} style={{ flex: 1, padding: "10px 0", borderRadius: 12, fontSize: 13, fontWeight: 600, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.13)", color: "#475569", cursor: "pointer" }}>
                  {cancelText}
                </button>
                <button onClick={onConfirm} style={{ flex: 1, padding: "10px 0", borderRadius: 12, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", border: "none", background: danger ? "linear-gradient(135deg,#f43f5e,#e11d48)" : "linear-gradient(135deg,#6366f1,#4f46e5)", boxShadow: danger ? "0 4px 14px rgba(244,63,94,0.3)" : "0 4px 14px rgba(99,102,241,0.3)" }}>
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
   LINK SHOW
════════════════════════════════════════ */
function LinkShow({
  links, loading, search, setSearch,
  sort, setSort, sortOpen, setSortOpen, sortRef,
  setView, handleDelete, handleEdit, onRefresh,
}) {
  const { t } = useSubLang();

  const dropdownPanel = {
    position: "absolute", right: 0, top: "calc(100% + 6px)",
    width: "100%", borderRadius: 14,
    background: "#fff",
    border: "1px solid rgba(99,102,241,0.12)",
    boxShadow: "0 16px 48px rgba(99,102,241,0.13), 0 2px 8px rgba(0,0,0,0.05)",
    overflow: "hidden", zIndex: 50,
  };

  const dropdownItemStyle = (active) => ({
    padding: "10px 14px", fontSize: 13, cursor: "pointer",
    background: active ? "rgba(99,102,241,0.07)" : "transparent",
    color: active ? "#6366f1" : "#374151",
    fontWeight: active ? 600 : 400,
    transition: "background .12s ease",
  });

  const dropdownBtnStyle = {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    width: "100%", background: "#fff",
    border: "1px solid rgba(99,102,241,0.15)",
    borderRadius: 12, padding: "9px 14px",
    fontSize: 13, fontWeight: 500, color: "#374151",
    cursor: "pointer", transition: "all .15s ease",
    boxShadow: "0 1px 4px rgba(99,102,241,0.05)",
  };

  /* same grid as sublinks: serial | name | actions */
  const gridCols = "28px 1fr 80px";

  return (
    <div style={{ marginTop: 28 }}>
      <AnimatePresence mode="wait">
        <motion.div
          key="home"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
        >

          {/* ── TOP BAR ── */}
          <div style={{
            display: "flex", flexWrap: "wrap", alignItems: "center",
            justifyContent: "space-between", gap: 12,
            background: "linear-gradient(160deg,#ffffff,#fafbff)",
            border: "1px solid rgba(99,102,241,0.10)",
            borderRadius: 18, padding: "14px 16px", marginBottom: 16,
            boxShadow: "0 4px 20px rgba(99,102,241,0.06)",
          }}>
            {/* Search */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              flex: "1 1 220px", maxWidth: 340,
              background: "rgba(99,102,241,0.05)",
              border: "1px solid rgba(99,102,241,0.12)",
              borderRadius: 11, padding: "8px 13px",
            }}>
              <Search size={14} style={{ color: "#a8b4c8", flexShrink: 0 }} />
              <input
                type="text"
                placeholder={t("লিংক খুঁজুন...", "Search link...")}
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ background: "transparent", outline: "none", border: "none", fontSize: 13, color: "#374151", width: "100%", fontFamily: "'Plus Jakarta Sans',sans-serif" }}
              />
              {search && <button onClick={() => setSearch("")} style={{ color: "#a8b4c8", lineHeight: 1, background: "none", border: "none", cursor: "pointer" }}><X size={12} /></button>}
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={onRefresh} disabled={loading}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.14)", borderRadius: 11, padding: "9px 14px", fontSize: 13, fontWeight: 500, color: "#6366f1", cursor: "pointer" }}
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                <span>{t("রিফ্রেশ", "Refresh")}</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                onClick={() => setView("add")}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg,#6366f1,#4f46e5)", border: "none", borderRadius: 11, padding: "9px 16px", fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", boxShadow: "0 4px 16px rgba(99,102,241,0.32)" }}
              >
                <Plus size={14} strokeWidth={2.5} />
                {t("লিংক যোগ করুন", "Add Link")}
              </motion.button>
            </div>
          </div>

          {/* ── TABLE CARD ── */}
          <div style={{
            background: "linear-gradient(160deg,#ffffff,#fafbff)",
            border: "1px solid rgba(99,102,241,0.10)",
            borderRadius: 18,
            boxShadow: "0 4px 24px rgba(99,102,241,0.06)",
            overflow: "hidden",
          }}>

            {/* Card header with sort */}
            <div style={{
              display: "flex", flexWrap: "wrap", alignItems: "center",
              justifyContent: "space-between", gap: 12,
              padding: "14px 20px",
              borderBottom: "1px solid rgba(99,102,241,0.08)",
              background: "rgba(99,102,241,0.025)",
            }}>
              <h2 style={{ fontSize: 14, fontWeight: 900, color: "#1e293b", fontFamily: "'Plus Jakarta Sans',sans-serif", letterSpacing: "-0.02em" }}>
                {t("প্যারেন্ট লিংক তালিকা", "Parent Links List")}
                <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 500, color: "#94a3b8" }}>
                  ({links.length})
                </span>
              </h2>

              {/* Sort */}
              <div style={{ position: "relative", width: 168 }} ref={sortRef}>
                <button onClick={() => setSortOpen(!sortOpen)} style={dropdownBtnStyle}>
                  <span style={{ fontSize: 13 }}>
                    {t(
                      SORT_OPTIONS.find(o => o.value === sort)?.labelBn,
                      SORT_OPTIONS.find(o => o.value === sort)?.labelEn
                    )}
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
                      {SORT_OPTIONS.map(opt => (
                        <div key={opt.value} onClick={() => { setSort(opt.value); setSortOpen(false); }} style={dropdownItemStyle(sort === opt.value)}>
                          {t(opt.labelBn, opt.labelEn)}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Column headers — same as sublinks */}
            <div style={{
              display: "grid",
              gridTemplateColumns: gridCols,
              alignItems: "center",
              padding: "10px 20px",
              fontSize: 10.5, fontWeight: 700, color: "#94a3b8",
              letterSpacing: ".06em", textTransform: "uppercase",
              borderBottom: "1px solid rgba(99,102,241,0.08)",
              background: "rgba(99,102,241,0.02)",
            }}>
              <div>#</div>
              <div>{t("নাম", "Name")}</div>
              <div style={{ textAlign: "right" }}>{t("কার্যক্রম", "Actions")}</div>
            </div>

            {/* Rows */}
            <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 0", gap: 12 }}>
                  <Loader2 size={26} style={{ color: "#c4cdd8" }} className="animate-spin" />
                  <p style={{ fontSize: 13, color: "#94a3b8" }}>{t("লোড হচ্ছে…", "Loading…")}</p>
                </div>
              ) : links.length === 0 ? (
                <div style={{ padding: "56px 0", textAlign: "center" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                    <Link2 size={22} style={{ color: "#c4cdd8" }} />
                  </div>
                  <p style={{ fontSize: 13, color: "#94a3b8" }}>{t("কোনো লিংক নেই।", "No links found.")}</p>
                </div>
              ) : links.map((link, index) => (
                <motion.div
                  key={link._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  style={{
                    display: "grid",
                    gridTemplateColumns: gridCols,
                    alignItems: "center",
                    padding: "12px 20px",
                    borderBottom: "1px solid rgba(99,102,241,0.06)",
                    transition: "background .12s ease",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.025)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {/* # */}
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#c4cdd8" }}>{index + 1}</div>

                  {/* Name + status below — same as sublinks */}
                  <div style={{ minWidth: 0, paddingRight: 12 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {link.name}
                    </p>
                    <p style={{ fontSize: 10, marginTop: 2, fontWeight: 700, letterSpacing: ".04em", color: link.isActive ? "#10b981" : "#f43f5e" }}>
                      {link.isActive ? t("সক্রিয়", "Active") : t("নিষ্ক্রিয়", "Inactive")}
                    </p>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
                    <motion.button
                      whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
                      onClick={() => handleEdit(link)}
                      style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.13)", color: "#6366f1", cursor: "pointer" }}
                    >
                      <Pencil size={13} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(link)}
                      style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(244,63,94,0.07)", border: "1px solid rgba(244,63,94,0.13)", color: "#f43f5e", cursor: "pointer" }}
                    >
                      <Trash2 size={13} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
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
function LinkAdd({
  name, setName, isActive, setIsActive,
  handleSubmit, setView, resetForm, nameError, editId, submitting,
}) {
  const { t } = useSubLang();

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 32, padding: "0 8px" }}>
      <div style={{ width: "100%", maxWidth: 520 }}>
        <AnimatePresence mode="wait">
          <motion.form
            key="add"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            onSubmit={handleSubmit}
            style={{ background: "#ffffff", borderRadius: 24, border: "1px solid rgba(99,102,241,0.10)", boxShadow: "0 20px 60px rgba(99,102,241,0.10), 0 4px 16px rgba(0,0,0,0.04)", overflow: "visible", position: "relative" }}
          >
            {/* Floating icon */}
            <div style={{ position: "absolute", top: -22, left: "50%", transform: "translateX(-50%)", width: 44, height: 44, borderRadius: 14, background: editId ? "linear-gradient(135deg,#8b5cf6,#7c3aed)" : "linear-gradient(135deg,#6366f1,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(99,102,241,0.38)", zIndex: 10 }}>
              <Link2 size={20} color="#fff" strokeWidth={1.8} />
            </div>

            {/* Ambient blobs */}
            <div style={{ position: "absolute", inset: 0, borderRadius: 24, overflow: "hidden", pointerEvents: "none" }}>
              <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.06) 0%,transparent 70%)" }} />
              <div style={{ position: "absolute", bottom: -30, left: -30, width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,0.05) 0%,transparent 70%)" }} />
            </div>

            <div style={{ padding: "44px 28px 28px", position: "relative" }}>
              {/* Title */}
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 20, fontWeight: 800, color: "#1e293b", letterSpacing: "-0.03em" }}>
                  {editId ? t("লিংক আপডেট করুন", "Update Link") : t("নতুন লিংক", "New Link")}
                </h2>
                <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 6 }}>
                  {editId ? t("নিচের তথ্য পরিবর্তন করুন", "Edit the details below and save") : t("লিংকের তথ্য পূরণ করুন", "Fill in the information to add a link")}
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                {/* Name */}
                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#64748b", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 7 }}>
                    {t("লিংকের নাম", "Link Name")} <span style={{ color: "#f43f5e" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder={t("যেমন: Electronics, Fashion…", "e.g. Electronics, Fashion…")}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    style={{ width: "100%", outline: "none", background: nameError ? "rgba(244,63,94,0.03)" : "#f8f9ff", border: `1.5px solid ${nameError ? "rgba(244,63,94,0.35)" : "rgba(99,102,241,0.14)"}`, borderRadius: 13, padding: "12px 16px", fontSize: 13.5, color: "#1e293b", fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "all .18s ease" }}
                    onFocus={e => { e.target.style.background = "#fff"; e.target.style.borderColor = "rgba(99,102,241,0.45)"; e.target.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.08)"; }}
                    onBlur={e => { e.target.style.background = nameError ? "rgba(244,63,94,0.03)" : "#f8f9ff"; e.target.style.borderColor = nameError ? "rgba(244,63,94,0.35)" : "rgba(99,102,241,0.14)"; e.target.style.boxShadow = "none"; }}
                  />
                  <AnimatePresence>
                    {nameError && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ fontSize: 12, color: "#f43f5e", marginTop: 6, fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#f43f5e", display: "inline-block" }} />
                        {nameError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Status */}
                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#64748b", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 7 }}>
                    {t("স্ট্যাটাস", "Status")}
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {STATUS_OPTIONS.map(option => {
                      const sel      = isActive === option.value;
                      const dotColor = option.value ? "#10b981" : "#f43f5e";
                      return (
                        <motion.button key={String(option.value)} type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setIsActive(option.value)}
                          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 14px", borderRadius: 13, cursor: "pointer", background: sel ? (option.value ? "rgba(16,185,129,0.07)" : "rgba(244,63,94,0.06)") : "#f8f9ff", border: `1.5px solid ${sel ? (option.value ? "rgba(16,185,129,0.3)" : "rgba(244,63,94,0.28)") : "rgba(99,102,241,0.10)"}`, color: sel ? (option.value ? "#059669" : "#e11d48") : "#94a3b8", fontSize: 13.5, fontWeight: sel ? 700 : 500, transition: "all .18s ease" }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: sel ? dotColor : "#d1d9e0", boxShadow: sel ? `0 0 0 3px ${dotColor}22` : "none", transition: "all .18s" }} />
                          {t(option.labelBn, option.labelEn)}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div style={{ height: 1, background: "rgba(99,102,241,0.07)", margin: "24px 0 20px" }} />

              {/* Submit / Cancel */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <motion.button type="submit" disabled={submitting}
                  whileHover={!submitting ? { scale: 1.02, y: -1 } : {}} whileTap={!submitting ? { scale: 0.97 } : {}}
                  style={{ flex: 1, minWidth: 140, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "linear-gradient(135deg,#6366f1,#4f46e5)", border: "none", borderRadius: 13, padding: "12px 20px", fontSize: 13.5, fontWeight: 700, color: "#fff", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.72 : 1, boxShadow: "0 6px 20px rgba(99,102,241,0.35)" }}>
                  {submitting ? <><Loader2 size={14} className="animate-spin" /> {t("অপেক্ষা করুন…", "Please wait…")}</> : editId ? t("আপডেট করুন", "Save Changes") : t("তৈরি করুন", "Create Link")}
                </motion.button>
                <motion.button type="button" disabled={submitting}
                  whileHover={!submitting ? { scale: 1.02 } : {}} whileTap={!submitting ? { scale: 0.97 } : {}}
                  onClick={() => { setView("home"); resetForm(); }}
                  style={{ flex: 1, minWidth: 140, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(99,102,241,0.05)", border: "1.5px solid rgba(99,102,241,0.13)", borderRadius: 13, padding: "12px 20px", fontSize: 13.5, fontWeight: 600, color: "#6366f1", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.5 : 1 }}>
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
export default function SubAdminLinks() {
  const { t } = useSubLang();

  const [links,      setLinks]      = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [view,       setView]       = useState("home");
  const [sort,       setSort]       = useState("newest");
  const [search,     setSearch]     = useState("");

  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  const [name,      setName]      = useState("");
  const [isActive,  setIsActive]  = useState(true);
  const [nameError, setNameError] = useState("");
  const [editId,    setEditId]    = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId,   setDeleteId]   = useState(null);
  const [deleteName, setDeleteName] = useState("");

  useEffect(() => {
    const handler = (e) => {
      if (!sortRef.current?.contains(e.target)) setSortOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const res  = await fetch(LINK_API);
      const data = await res.json();
      setLinks(data.data || []);
    } catch (err) { console.log(err); }
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

  const resetForm = () => { setName(""); setIsActive(true); setNameError(""); setEditId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNameError("");

    const exist = links.find(l => l.name.toLowerCase() === name.toLowerCase() && l._id !== editId);
    if (exist) { setNameError(t("লিংকের নাম ইতিমধ্যে বিদ্যমান", "Link name already exists")); return; }

    try {
      setSubmitting(true);
      const url    = editId ? `${LINK_API}/${editId}` : LINK_API;
      const method = editId ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ name, isActive }),
      });
      if (!res.ok) { const err = await res.json(); setNameError(err.message || t("ত্রুটি হয়েছে", "An error occurred")); return; }
      editId ? showUpdateSuccessToast(name) : showAddSuccessToast(name);
      resetForm(); setView("home"); fetchLinks();
    } catch (err) { console.log(err); }
    finally { setSubmitting(false); }
  };

  const handleDelete = (link) => { setDeleteId(link._id); setDeleteName(link.name); setDeleteOpen(true); };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`${LINK_API}/${deleteId}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
    if (res.ok) { showDeleteSuccessToast(deleteName); fetchLinks(); }
    setDeleteOpen(false); setDeleteId(null); setDeleteName("");
  };

  const handleEdit = (link) => { setName(link.name); setIsActive(link.isActive); setEditId(link._id); setView("add"); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        .lk-wrap, .lk-wrap * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      <div className="lk-wrap" style={{ padding: "0 8px 32px" }}>
        <div>

          {/* Page title */}
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <h1 style={{ fontSize: "clamp(20px,4vw,28px)", fontWeight: 900, color: "#1e293b", fontFamily: "'Plus Jakarta Sans',sans-serif", letterSpacing: "-0.03em" }}>
              {t("প্যারেন্ট নেভিগেশন লিংক", "Parent Navigation Links")}
            </h1>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
              {t("শুধুমাত্র প্রধান মেনু নেভিগেশন পরিচালনা করুন।", "Manage only main menu navigation.")}
            </p>
          </div>

          {/* Breadcrumb */}
          <div style={{ marginBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              {view === "home" && (
                <span style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 8, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.13)", color: "#6366f1", fontWeight: 600, fontSize: 12 }}>
                  <Link2 size={12} /> {t("লিংক", "Links")}
                </span>
              )}
              {view === "add" && (
                <>
                  <button onClick={() => { setView("home"); resetForm(); }}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 8, background: "transparent", border: "1px solid rgba(99,102,241,0.10)", color: "#94a3b8", fontWeight: 500, fontSize: 12, cursor: "pointer" }}>
                    <Link2 size={12} /> {t("লিংক", "Links")}
                  </button>
                  <span style={{ color: "#e2e8f0" }}>/</span>
                  <span style={{ padding: "4px 12px", borderRadius: 8, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.13)", color: "#6366f1", fontWeight: 600, fontSize: 12 }}>
                    {editId ? t("আপডেট", "Update") : t("যোগ করুন", "Add")}
                  </span>
                </>
              )}
            </div>
          </div>

          {view === "home" && (
            <LinkShow
              links={processedLinks} loading={loading}
              search={search} setSearch={setSearch}
              sort={sort} setSort={setSort}
              sortOpen={sortOpen} setSortOpen={setSortOpen} sortRef={sortRef}
              setView={setView}
              handleDelete={handleDelete} handleEdit={handleEdit}
              onRefresh={fetchLinks}
            />
          )}

          {view === "add" && (
            <LinkAdd
              name={name} setName={setName}
              isActive={isActive} setIsActive={setIsActive}
              handleSubmit={handleSubmit}
              setView={setView} resetForm={resetForm}
              nameError={nameError} editId={editId}
              submitting={submitting}
            />
          )}

          <ConfirmModal
            isOpen={deleteOpen} onClose={() => setDeleteOpen(false)}
            onConfirm={confirmDelete}
            title={t("লিংক মুছবেন?", "Delete Link?")}
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