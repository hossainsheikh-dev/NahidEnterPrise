import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ChevronDown, Plus, Pencil, Trash2,
  Loader2, X, Star, Upload, Package,
} from "lucide-react";
import { showAddSuccessToast }    from "../../../utils/toast/successAddToast";
import { showUpdateSuccessToast } from "../../../utils/toast/successUpdateToast";
import { showDeleteSuccessToast } from "../../../utils/toast/successDeleteToast";
import { useSubLang } from "../../../context/SubAdminLangContext";

const API         = process.env.REACT_APP_API_URL;
const PRODUCT_API = `${API}/api/products`;
const SUBLINK_API = `${API}/api/sublinks`;
const LINK_API    = `${API}/api/links`;

const getToken = () => localStorage.getItem("subAdminToken") || "";

const MAX_IMAGE_SIZE_MB     = 3;
const MAX_IMAGE_SIZE_BYTES  = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const MIN_DESCRIPTION_WORDS = 60;
const countWords = (text) => text.trim().split(/\s+/).filter((w) => w.length > 0).length;

const statusOptions = [
  { labelBn: "সক্রিয়",    labelEn: "Active",   value: true  },
  { labelBn: "নিষ্ক্রিয়", labelEn: "Inactive", value: false },
];

const discountTypeOptions = [
  { labelBn: "কোনো ছাড় নেই",  labelEn: "No Discount",     value: "none"    },
  { labelBn: "শতাংশ ছাড় (%)", labelEn: "Percent Off (%)", value: "percent" },
  { labelBn: "সমতল ছাড় (৳)",  labelEn: "Flat Off (৳)",    value: "flat"    },
];

const SORT_OPTIONS = [
  { labelBn: "নাম অনুযায়ী",       labelEn: "Sort by Name",    value: "name"      },
  { labelBn: "তারিখ অনুযায়ী",     labelEn: "Sort by Date",    value: "date"      },
  { labelBn: "নতুন প্রথমে",        labelEn: "Newest First",    value: "newest"    },
  { labelBn: "স্ট্যাটাস অনুযায়ী", labelEn: "Sort by Status",  value: "status"    },
  { labelBn: "ফিচার্ড প্রথমে",     labelEn: "Featured First",  value: "featured"  },
  { labelBn: "স্টক: কম→বেশি",      labelEn: "Stock: Low→High", value: "stockAsc"  },
  { labelBn: "স্টক: বেশি→কম",      labelEn: "Stock: High→Low", value: "stockDesc" },
];

const FEATURE_ROWS = [
  { icon: "🎨", keyPlaceholder: "Color",      valuePlaceholder: "e.g. Black / Blue / Yellow / Green"        },
  { icon: "📐", keyPlaceholder: "Size",       valuePlaceholder: "e.g. Free Size / S / M / L / XL"           },
  { icon: "🧵", keyPlaceholder: "Material",   valuePlaceholder: "e.g. Polyester / PVC / Nylon"              },
  { icon: "🧥", keyPlaceholder: "Type",       valuePlaceholder: "e.g. Poncho / Jacket / Suit / Riding Coat" },
  { icon: "⚖️", keyPlaceholder: "Weight",     valuePlaceholder: "e.g. 300g / 450g / 600g"                   },
  { icon: "👤", keyPlaceholder: "Gender",     valuePlaceholder: "e.g. Men / Women / Unisex / Kids"          },
  { icon: "💧", keyPlaceholder: "Waterproof", valuePlaceholder: "e.g. 100% Waterproof / Water Resistant"    },
  { icon: "🛡️", keyPlaceholder: "Warranty",   valuePlaceholder: "e.g. No Warranty / 6 Months / 1 Year"      },
  { icon: "🌍", keyPlaceholder: "Country",    valuePlaceholder: "e.g. Bangladesh / China / India"           },
  { icon: "🪖", keyPlaceholder: "Hood",       valuePlaceholder: "e.g. Yes / No / Detachable"                },
];

const emptyFeatures = () => Array.from({ length: 10 }, () => ({ key: "", value: "" }));

/* ─────────────────────────────────────
   SHARED STYLE HELPERS
───────────────────────────────────── */
const formCard = {
  background: "#ffffff",
  borderRadius: 24,
  border: "1px solid rgba(99,102,241,0.10)",
  boxShadow: "0 20px 60px rgba(99,102,241,0.10), 0 4px 16px rgba(0,0,0,0.04)",
  overflow: "visible",
  position: "relative",
};

const fieldLabel = (text, required = false) => (
  <label style={{
    display: "block", fontSize: 11.5, fontWeight: 700,
    color: "#64748b", letterSpacing: ".06em", textTransform: "uppercase",
    marginBottom: 7,
  }}>
    {text}{required && <span style={{ color: "#f43f5e", marginLeft: 3 }}>*</span>}
  </label>
);

const inputStyle = (hasError = false) => ({
  width: "100%", outline: "none",
  background: hasError ? "rgba(244,63,94,0.03)" : "#f8f9ff",
  border: `1.5px solid ${hasError ? "rgba(244,63,94,0.35)" : "rgba(99,102,241,0.14)"}`,
  borderRadius: 13, padding: "12px 16px",
  fontSize: 13.5, color: "#1e293b",
  fontFamily: "'DM Sans',sans-serif",
  transition: "all .18s ease",
});

const onFocusInput = (e) => {
  e.target.style.background = "#fff";
  e.target.style.borderColor = "rgba(99,102,241,0.45)";
  e.target.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.08)";
};
const onBlurInput = (e, hasError = false) => {
  e.target.style.background = hasError ? "rgba(244,63,94,0.03)" : "#f8f9ff";
  e.target.style.borderColor = hasError ? "rgba(244,63,94,0.35)" : "rgba(99,102,241,0.14)";
  e.target.style.boxShadow = "none";
};

const dropdownBtnStyle = (selected = false, hasError = false) => ({
  display: "flex", alignItems: "center", justifyContent: "space-between",
  width: "100%", cursor: "pointer",
  background: selected ? "#fff" : "#f8f9ff",
  border: `1.5px solid ${hasError ? "rgba(244,63,94,0.35)" : selected ? "rgba(99,102,241,0.3)" : "rgba(99,102,241,0.14)"}`,
  borderRadius: 13, padding: "12px 16px",
  fontSize: 13.5, color: selected ? "#1e293b" : "#a8b4c8",
  transition: "all .18s ease",
  boxShadow: selected ? "0 0 0 4px rgba(99,102,241,0.06)" : "none",
});

const dropdownPanelStyle = {
  position: "absolute", left: 0, top: "calc(100% + 8px)",
  width: "100%", borderRadius: 16,
  background: "#fff",
  border: "1px solid rgba(99,102,241,0.12)",
  boxShadow: "0 20px 56px rgba(99,102,241,0.14), 0 4px 12px rgba(0,0,0,0.06)",
  overflow: "hidden", zIndex: 50,
  maxHeight: 210, overflowY: "auto",
};

const dropdownItemStyle = (active) => ({
  padding: "11px 16px", fontSize: 13.5, cursor: "pointer",
  background: active ? "rgba(99,102,241,0.07)" : "transparent",
  color: active ? "#6366f1" : "#374151",
  fontWeight: active ? 600 : 400,
  display: "flex", alignItems: "center", justifyContent: "space-between",
  transition: "background .12s",
});

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
              <h3 className="text-[15px] font-black tracking-[-0.02em]"
                style={{ color: "#0f172a", fontFamily: "'Syne',sans-serif" }}>
                {title}
              </h3>
              <p className="text-[13px] mt-2 leading-relaxed" style={{ color: "#64748b" }}>{message}</p>
              <div className="flex gap-3 mt-6">
                <button onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
                  style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.13)", color: "#475569" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.10)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(99,102,241,0.06)"}>
                  {cancelText}
                </button>
                <button onClick={onConfirm}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all"
                  style={{
                    background: danger ? "linear-gradient(135deg,#f43f5e,#e11d48)" : "linear-gradient(135deg,#6366f1,#4f46e5)",
                    boxShadow: danger ? "0 4px 14px rgba(244,63,94,0.3)" : "0 4px 14px rgba(99,102,241,0.3)",
                    border: "none",
                  }}>
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

/* ─────────────────────────────────────
   PRODUCT SHOW
───────────────────────────────────── */
function ProductShow({
  products, loading, search, setSearch, sort, setSort,
  dropdownOpen, setDropdownOpen, dropdownRef,
  setView, handleDelete, handleEdit, parentLinks, allSublinks,
}) {
  const { t } = useSubLang();
  const [filterParent,    setFilterParent]    = useState("");
  const [filterSublink,   setFilterSublink]   = useState("");
  const [parentDropdown,  setParentDropdown]  = useState(false);
  const [sublinkDropdown, setSublinkDropdown] = useState(false);
  const parentRef  = useRef(null);
  const sublinkRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!parentRef.current?.contains(e.target))  setParentDropdown(false);
      if (!sublinkRef.current?.contains(e.target)) setSublinkDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredSublinks    = allSublinks.filter((s) => s.parent?._id === filterParent || s.parent === filterParent);
  const selectedParentName  = parentLinks.find((p) => p._id === filterParent)?.name;
  const selectedSublinkName = allSublinks.find((s) => s._id === filterSublink)?.name;

  const displayedProducts = products.filter((p) => {
    const sublinkId = p.sublink?._id || p.sublink;
    const linkId    = p.link?._id    || p.link;
    if (filterSublink) return sublinkId === filterSublink;
    if (filterParent)  return linkId === filterParent;
    return true;
  });

  const clearFilters = () => { setFilterParent(""); setFilterSublink(""); };

  /* shared dropdown styles */
  const tblDropBtn = (selected = false) => ({
    display: "flex", alignItems: "center", justifyContent: "space-between",
    width: "100%", background: "#fff",
    border: "1px solid rgba(99,102,241,0.15)",
    borderRadius: 12, padding: "9px 14px",
    fontSize: 13, fontWeight: 500, color: "#374151",
    cursor: "pointer", transition: "all .15s ease",
    boxShadow: "0 1px 4px rgba(99,102,241,0.05)",
  });

  const tblDropPanel = {
    position: "absolute", right: 0, top: "calc(100% + 6px)",
    width: "100%", minWidth: 160, borderRadius: 14,
    background: "#fff",
    border: "1px solid rgba(99,102,241,0.12)",
    boxShadow: "0 16px 48px rgba(99,102,241,0.13), 0 2px 8px rgba(0,0,0,0.05)",
    overflow: "hidden", zIndex: 50,
  };

  const tblDropItem = (active) => ({
    padding: "10px 14px", fontSize: 13, cursor: "pointer",
    background: active ? "rgba(99,102,241,0.07)" : "transparent",
    color: active ? "#6366f1" : "#374151",
    fontWeight: active ? 600 : 400,
    transition: "background .12s",
  });

  const stockBadge = (stock) => {
    if (stock === 0) return (
      <span style={{ fontSize: 11, fontWeight: 700, color: "#e11d48",
        background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.15)",
        padding: "2px 8px", borderRadius: 99 }}>
        {t("শেষ", "Out")}
      </span>
    );
    if (stock <= 5) return (
      <span style={{ fontSize: 11, fontWeight: 700, color: "#d97706",
        background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.18)",
        padding: "2px 8px", borderRadius: 99 }}>
        {stock} {t("বাকি", "left")}
      </span>
    );
    return (
      <span style={{ fontSize: 11, fontWeight: 700, color: "#059669",
        background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.18)",
        padding: "2px 8px", borderRadius: 99 }}>
        {stock}
      </span>
    );
  };

  return (
    <div className="mt-6 sm:mt-8 space-y-5">
      <AnimatePresence mode="wait">
        <motion.div key="home"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
          className="space-y-5">

          {/* ── TOP BAR ── */}
          <div
            className="sticky top-0 z-20 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3"
            style={{
              background: "linear-gradient(160deg,#ffffff,#fafbff)",
              border: "1px solid rgba(99,102,241,0.10)",
              borderRadius: 18, padding: "14px 16px",
              boxShadow: "0 4px 20px rgba(99,102,241,0.06), 0 1px 0 rgba(99,102,241,0.05)",
            }}
          >
            {/* Search */}
            <div
              className="flex items-center gap-2.5 w-full lg:w-80"
              style={{
                background: "rgba(99,102,241,0.05)",
                border: "1px solid rgba(99,102,241,0.12)",
                borderRadius: 11, padding: "8px 13px", transition: "all .15s",
              }}
              onFocus={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.35)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.09)"; e.currentTarget.style.background = "#fff"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.12)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.background = "rgba(99,102,241,0.05)"; }}
            >
              <Search size={14} style={{ color: "#a8b4c8", flexShrink: 0 }} />
              <input
                type="text"
                placeholder={t("পণ্য খুঁজুন...", "Search product...")}
                value={search} onChange={(e) => setSearch(e.target.value)}
                style={{ background: "transparent", outline: "none", border: "none", fontSize: 13, color: "#374151", width: "100%", fontFamily: "'DM Sans',sans-serif" }}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{ color: "#a8b4c8", lineHeight: 1 }}>
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Add button */}
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                onClick={() => setView("add")}
                className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg,#6366f1,#4f46e5)", border: "none", borderRadius: 11,
                  padding: "9px 18px", fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(99,102,241,0.32), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}>
                <Plus size={14} strokeWidth={2.5} />
                {t("পণ্য যোগ করুন", "Add Product")}
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

            {/* Table header */}
            <div
              className="flex flex-col gap-3 px-4 sm:px-5 py-4"
              style={{ borderBottom: "1px solid rgba(99,102,241,0.08)", background: "rgba(99,102,241,0.025)" }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <h2
                  className="text-center md:text-left text-[13.5px] sm:text-sm md:text-base font-black tracking-[-0.02em] shrink-0"
                  style={{ color: "#1e293b", fontFamily: "'Syne',sans-serif" }}
                >
                  {t("পণ্য তালিকা", "Products List")}
                  {displayedProducts.length !== products.length && (
                    <span className="ml-2 text-[11px] font-medium" style={{ color: "#94a3b8" }}>
                      ({displayedProducts.length} {t("এর মধ্যে", "of")} {products.length})
                    </span>
                  )}
                </h2>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">

                  {/* Parent filter */}
                  <div className="relative w-full sm:w-44" ref={parentRef}>
                    <button type="button" onClick={() => setParentDropdown(!parentDropdown)}
                      style={tblDropBtn(!!filterParent)}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.15)"}
                    >
                      <span style={{ color: filterParent ? "#374151" : "#a8b4c8", fontWeight: filterParent ? 500 : 400, fontSize: 13 }}>
                        {selectedParentName || t("লিংক ফিল্টার", "Filter by Link")}
                      </span>
                      <ChevronDown size={14} style={{ color: "#a8b4c8", flexShrink: 0 }} />
                    </button>
                    <AnimatePresence>
                      {parentDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.97 }} transition={{ duration: 0.18 }}
                          style={{ ...tblDropPanel, maxHeight: 200, overflowY: "auto" }}>
                          {parentLinks.map((p) => (
                            <div key={p._id}
                              onClick={() => { setFilterParent(p._id); setFilterSublink(""); setParentDropdown(false); }}
                              style={tblDropItem(filterParent === p._id)}
                              onMouseEnter={e => filterParent !== p._id && (e.currentTarget.style.background = "rgba(99,102,241,0.04)")}
                              onMouseLeave={e => filterParent !== p._id && (e.currentTarget.style.background = "transparent")}>
                              {p.name}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Sublink filter */}
                  {filterParent && (
                    <div className="relative w-full sm:w-44" ref={sublinkRef}>
                      <button type="button" onClick={() => setSublinkDropdown(!sublinkDropdown)}
                        style={tblDropBtn(!!filterSublink)}
                        onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)"}
                        onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.15)"}
                      >
                        <span style={{ color: filterSublink ? "#374151" : "#a8b4c8", fontWeight: filterSublink ? 500 : 400, fontSize: 13 }}>
                          {selectedSublinkName || t("সাবলিংক ফিল্টার", "Filter by Sublink")}
                        </span>
                        <ChevronDown size={14} style={{ color: "#a8b4c8", flexShrink: 0 }} />
                      </button>
                      <AnimatePresence>
                        {sublinkDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.97 }} transition={{ duration: 0.18 }}
                            style={{ ...tblDropPanel, maxHeight: 200, overflowY: "auto" }}>
                            {filteredSublinks.length > 0 ? filteredSublinks.map((s) => (
                              <div key={s._id}
                                onClick={() => { setFilterSublink(s._id); setSublinkDropdown(false); }}
                                style={tblDropItem(filterSublink === s._id)}
                                onMouseEnter={e => filterSublink !== s._id && (e.currentTarget.style.background = "rgba(99,102,241,0.04)")}
                                onMouseLeave={e => filterSublink !== s._id && (e.currentTarget.style.background = "transparent")}>
                                {s.name}
                              </div>
                            )) : (
                              <div style={{ padding: "12px 14px", fontSize: 13, color: "#94a3b8" }}>
                                {t("কোনো সাবলিংক নেই", "No sublinks found.")}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {(filterParent || filterSublink) && (
                    <button onClick={clearFilters}
                      className="flex items-center justify-center gap-1 w-full sm:w-auto"
                      style={{ fontSize: 12, fontWeight: 600, color: "#ef4444", cursor: "pointer", background: "none", border: "none" }}>
                      <X size={12} /> {t("ক্লিয়ার", "Clear")}
                    </button>
                  )}

                  {/* Sort */}
                  <div className="relative w-full sm:w-48" ref={dropdownRef}>
                    <button onClick={() => setDropdownOpen(!dropdownOpen)}
                      style={tblDropBtn(false)}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.15)"}>
                      <span style={{ fontSize: 13 }}>
                        {SORT_OPTIONS.find((o) => o.value === sort) &&
                          t(SORT_OPTIONS.find((o) => o.value === sort).labelBn,
                            SORT_OPTIONS.find((o) => o.value === sort).labelEn)}
                      </span>
                      <ChevronDown size={14} style={{ color: "#a8b4c8", flexShrink: 0 }} />
                    </button>
                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.97 }} transition={{ duration: 0.18 }}
                          style={tblDropPanel}>
                          {SORT_OPTIONS.map((option) => (
                            <div key={option.value}
                              onClick={() => { setSort(option.value); setDropdownOpen(false); }}
                              style={tblDropItem(sort === option.value)}
                              onMouseEnter={e => sort !== option.value && (e.currentTarget.style.background = "rgba(99,102,241,0.04)")}
                              onMouseLeave={e => sort !== option.value && (e.currentTarget.style.background = "transparent")}>
                              {t(option.labelBn, option.labelEn)}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            {/* Column headers */}
            <div
              className="grid grid-cols-7 items-center px-3 sm:px-5 py-3"
              style={{
                fontSize: 10.5, fontWeight: 700, color: "#94a3b8",
                letterSpacing: ".06em", textTransform: "uppercase",
                borderBottom: "1px solid rgba(99,102,241,0.08)",
                background: "rgba(99,102,241,0.02)",
              }}>
              <div>#</div>
              <div>{t("ছবি", "Image")}</div>
              <div className="col-span-2">{t("নাম", "Name")}</div>
              <div>{t("স্টক", "Stock")}</div>
              <div>{t("স্ট্যাটাস", "Status")}</div>
              <div style={{ textAlign: "right" }}>{t("কার্যক্রম", "Actions")}</div>
            </div>

            {/* Rows */}
            <div className="overflow-y-auto" style={{ maxHeight: "60vh" }}>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 size={26} style={{ color: "#c4cdd8" }} className="animate-spin" />
                  <p style={{ fontSize: 13, color: "#94a3b8" }}>{t("পণ্য লোড হচ্ছে…", "Loading products…")}</p>
                </div>
              ) : displayedProducts.length === 0 ? (
                <div className="py-14 text-center">
                  <div className="mx-auto mb-4 w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.12)" }}>
                    <Package size={22} style={{ color: "#c4cdd8" }} />
                  </div>
                  <p style={{ fontSize: 13, color: "#94a3b8" }}>{t("কোনো পণ্য পাওয়া যায়নি।", "No products found.")}</p>
                </div>
              ) : (
                displayedProducts.map((product, index) => (
                  <motion.div key={product._id}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.025 }}
                    className="grid grid-cols-7 items-center px-3 sm:px-5 py-3.5"
                    style={{ borderBottom: "1px solid rgba(99,102,241,0.06)", transition: "background .12s ease" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.025)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

                    <div className="flex items-center gap-1.5" style={{ fontSize: 12, fontWeight: 600, color: "#c4cdd8" }}>
                      {index + 1}
                      {product.isFeatured && (
                        <Star size={10} style={{ color: "#f59e0b", fill: "#f59e0b", flexShrink: 0 }} />
                      )}
                    </div>

                    <div>
                      {product.images?.[0] ? (
                        <img src={product.images[0].url} alt={product.name}
                          style={{ width: 36, height: 36, objectFit: "contain", borderRadius: 9,
                            border: "1px solid rgba(99,102,241,0.10)", background: "#fff", padding: 2 }} />
                      ) : (
                        <div style={{ width: 36, height: 36, borderRadius: 9,
                          background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.10)" }} />
                      )}
                    </div>

                    <div className="col-span-2 min-w-0 pr-1">
                      <p className="truncate" style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
                        {product.name}
                      </p>
                      <p className="sm:hidden" style={{ fontSize: 10, marginTop: 2, fontWeight: 700,
                        color: product.isActive ? "#059669" : "#e11d48" }}>
                        {product.isActive ? t("সক্রিয়", "Active") : t("নিষ্ক্রিয়", "Inactive")}
                      </p>
                    </div>

                    <div>{stockBadge(product.stock ?? 0)}</div>

                    <div className="hidden sm:flex items-center gap-1.5">
                      <span style={{
                        width: 6, height: 6, borderRadius: "50%", display: "inline-block",
                        background: product.isActive ? "#10b981" : "#f43f5e",
                      }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: product.isActive ? "#059669" : "#e11d48" }}>
                        {product.isActive ? t("সক্রিয়", "Active") : t("নিষ্ক্রিয়", "Inactive")}
                      </span>
                    </div>

                    <div className="flex justify-end items-center gap-2 sm:gap-2.5">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(product)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                        style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.13)", color: "#6366f1" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.14)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(99,102,241,0.07)"}>
                        <Pencil size={12} />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(product)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                        style={{ background: "rgba(244,63,94,0.07)", border: "1px solid rgba(244,63,94,0.13)", color: "#f43f5e" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(244,63,94,0.14)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(244,63,94,0.07)"}>
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

/* ─────────────────────────────────────
   PRODUCT ADD / EDIT
───────────────────────────────────── */
function ProductAdd({
  name, setName, description, setDescription, price, setPrice, stock, setStock,
  link, setLink, sublink, setSublink, selectedParent, setSelectedParent,
  parentLinks, allSublinks, isActive, setIsActive,
  discountType, setDiscountType, discountValue, setDiscountValue,
  isFeatured, setIsFeatured, features, setFeatures,
  images, setImages, existingImages,
  handleSubmit, setView, resetForm, nameError, sublinkError, editId,
}) {
  const { t } = useSubLang();
  const [parentDropdown,   setParentDropdown]   = useState(false);
  const [sublinkDropdown,  setSublinkDropdown]  = useState(false);
  const [discountDropdown, setDiscountDropdown] = useState(false);
  const parentRef   = useRef(null);
  const sublinkRef  = useRef(null);
  const discountRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!parentRef.current?.contains(e.target))   setParentDropdown(false);
      if (!sublinkRef.current?.contains(e.target))  setSublinkDropdown(false);
      if (!discountRef.current?.contains(e.target)) setDiscountDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredSublinks    = allSublinks.filter((s) => s.parent?._id === selectedParent || s.parent === selectedParent);
  const selectedParentName  = parentLinks.find((p) => p._id === selectedParent)?.name;
  const selectedSublinkName = allSublinks.find((s) => s._id === sublink)?.name;
  const currentDiscountOption = discountTypeOptions.find((o) => o.value === discountType);

  const salePrice = (() => {
    const p = parseFloat(price); const v = parseFloat(discountValue);
    if (!p || !v || discountType === "none") return null;
    if (discountType === "percent") return Math.round(p - (p * v) / 100);
    if (discountType === "flat")    return Math.max(0, p - v);
    return null;
  })();

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const oversized = files.filter((f) => f.size > MAX_IMAGE_SIZE_BYTES);
    if (oversized.length > 0) {
      alert(`These images exceed ${MAX_IMAGE_SIZE_MB}MB:\n${oversized.map((f) => f.name).join("\n")}`);
      e.target.value = ""; return;
    }
    setImages((prev) => [...prev, ...files].slice(0, 5));
    e.target.value = "";
  };

  const removeNewImage = (index) => setImages((prev) => prev.filter((_, i) => i !== index));
  const wordCount   = countWords(description);
  const wordCountOk = wordCount >= MIN_DESCRIPTION_WORDS;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!selectedParent)                { alert(t("লিংক নির্বাচন করুন (আবশ্যক)", "Please select a Link (required)")); return; }
    if (!editId && images.length === 0) { alert(t("অন্তত একটি ছবি আবশ্যক!", "At least one image is required!")); return; }
    if (!wordCountOk)                   { alert(t(`বর্ণনায় কমপক্ষে ${MIN_DESCRIPTION_WORDS}টি শব্দ দরকার।`, `Description must be at least ${MIN_DESCRIPTION_WORDS} words.`)); return; }
    handleSubmit(e);
  };

  /* reusable premium dropdown button */
  const PremiumDropBtn = ({ onClick, selected, hasError, children, isOpen }) => (
    <button type="button" onClick={onClick}
      style={{ ...dropdownBtnStyle(selected, hasError), fontWeight: selected ? 500 : 400 }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)"; e.currentTarget.style.background = "#fff"; }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = hasError ? "rgba(244,63,94,0.35)" : selected ? "rgba(99,102,241,0.3)" : "rgba(99,102,241,0.14)";
        e.currentTarget.style.background = selected ? "#fff" : "#f8f9ff";
      }}>
      {children}
      <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
        <ChevronDown size={15} style={{ color: "#a8b4c8" }} />
      </motion.span>
    </button>
  );

  return (
    <div className="flex justify-center mt-8 px-2 sm:px-4 md:px-6">
      <div className="w-full max-w-xl">
        <AnimatePresence mode="wait">
          <motion.form key="add"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            onSubmit={handleFormSubmit}
            style={formCard}>

            {/* floating icon badge */}
            <div style={{
              position: "absolute", top: -22, left: "50%", transform: "translateX(-50%)",
              width: 44, height: 44, borderRadius: 14,
              background: editId ? "linear-gradient(135deg,#8b5cf6,#7c3aed)" : "linear-gradient(135deg,#6366f1,#4f46e5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 6px 20px rgba(99,102,241,0.38), inset 0 1px 0 rgba(255,255,255,0.18)", zIndex: 10,
            }}>
              <Package size={20} color="#fff" strokeWidth={1.8} />
            </div>

            {/* ambient blobs */}
            <div style={{ position: "absolute", inset: 0, borderRadius: 24, overflow: "hidden", pointerEvents: "none" }}>
              <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%",
                background: "radial-gradient(circle,rgba(99,102,241,0.06) 0%,transparent 70%)" }} />
              <div style={{ position: "absolute", bottom: -30, left: -30, width: 150, height: 150, borderRadius: "50%",
                background: "radial-gradient(circle,rgba(139,92,246,0.05) 0%,transparent 70%)" }} />
            </div>

            <div style={{ padding: "44px 28px 28px", position: "relative" }}>

              {/* Title */}
              <div className="text-center" style={{ marginBottom: 28 }}>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: "#1e293b", letterSpacing: "-0.03em", lineHeight: 1.2 }}>
                  {editId ? t("পণ্য আপডেট", "Update Product") : t("নতুন পণ্য", "New Product")}
                </h2>
                <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 6, lineHeight: 1.5 }}>
                  {editId
                    ? t("নিচের তথ্য পরিবর্তন করুন", "Edit the details below and save")
                    : t("পণ্যের তথ্য পূরণ করুন", "Fill in the information to add a product")}
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                {/* Name */}
                <div>
                  {fieldLabel(t("পণ্যের নাম", "Product Name"), true)}
                  <input type="text" placeholder={t("পণ্যের নাম লিখুন…", "Enter product name…")}
                    value={name} onChange={(e) => setName(e.target.value)} required
                    style={inputStyle(!!nameError)}
                    onFocus={onFocusInput}
                    onBlur={e => onBlurInput(e, !!nameError)} />
                  <AnimatePresence>
                    {nameError && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ fontSize: 12, color: "#f43f5e", marginTop: 6, fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#f43f5e", display: "inline-block", flexShrink: 0 }} />
                        {nameError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Description */}
                <div>
                  {fieldLabel(t("পণ্যের বিবরণ", "Description"), true)}
                  <textarea
                    placeholder={t(`বিবরণ লিখুন (কমপক্ষে ${MIN_DESCRIPTION_WORDS} শব্দ)`, `Write description (minimum ${MIN_DESCRIPTION_WORDS} words)`)}
                    value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required
                    style={{
                      ...inputStyle(description && !wordCountOk),
                      resize: "none", lineHeight: 1.6,
                    }}
                    onFocus={onFocusInput}
                    onBlur={e => onBlurInput(e, description && !wordCountOk)} />
                  <div className="flex items-center justify-between px-1 mt-1.5">
                    <p style={{ fontSize: 11.5, color: wordCountOk ? "#059669" : "#94a3b8", fontWeight: 500 }}>
                      {wordCount} / {MIN_DESCRIPTION_WORDS} {t("শব্দ", "words")} {wordCountOk && "✓"}
                    </p>
                    {description && !wordCountOk && (
                      <p style={{ fontSize: 11.5, color: "#f43f5e", fontWeight: 500 }}>
                        {MIN_DESCRIPTION_WORDS - wordCount} {t("আরও শব্দ দরকার", "more words needed")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Price & Stock */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    {fieldLabel(t("মূল্য (৳)", "Price (৳)"), true)}
                    <input type="number" placeholder="0" value={price}
                      onChange={(e) => setPrice(e.target.value)} required min={0}
                      style={inputStyle()} onFocus={onFocusInput} onBlur={e => onBlurInput(e)} />
                  </div>
                  <div>
                    {fieldLabel(t("স্টক", "Stock"))}
                    <input type="number" placeholder="0" value={stock}
                      onChange={(e) => setStock(e.target.value)} min={0}
                      style={inputStyle()} onFocus={onFocusInput} onBlur={e => onBlurInput(e)} />
                  </div>
                </div>

                {/* Discount */}
                <div style={{
                  background: "rgba(99,102,241,0.03)", borderRadius: 16,
                  border: "1.5px solid rgba(99,102,241,0.10)", padding: "16px 18px",
                }}>
                  {fieldLabel(t("ছাড়", "Discount"))}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ position: "relative" }} ref={discountRef}>
                      <PremiumDropBtn
                        onClick={() => setDiscountDropdown(!discountDropdown)}
                        selected={discountType !== "none"}
                        isOpen={discountDropdown}>
                        <span style={{ color: "#374151", fontWeight: 500 }}>
                          {currentDiscountOption && t(currentDiscountOption.labelBn, currentDiscountOption.labelEn)}
                        </span>
                      </PremiumDropBtn>
                      <AnimatePresence>
                        {discountDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.97 }}
                            transition={{ type: "spring", stiffness: 380, damping: 28 }}
                            style={dropdownPanelStyle}>
                            {discountTypeOptions.map((o, i) => (
                              <div key={o.value}
                                onClick={() => { setDiscountType(o.value); if (o.value === "none") setDiscountValue(0); setDiscountDropdown(false); }}
                                style={{ ...dropdownItemStyle(discountType === o.value), borderBottom: i < discountTypeOptions.length - 1 ? "1px solid rgba(99,102,241,0.05)" : "none" }}
                                onMouseEnter={e => discountType !== o.value && (e.currentTarget.style.background = "rgba(99,102,241,0.04)")}
                                onMouseLeave={e => discountType !== o.value && (e.currentTarget.style.background = "transparent")}>
                                {t(o.labelBn, o.labelEn)}
                                {discountType === o.value && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", display: "inline-block" }} />}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {discountType !== "none" && (
                      <div>
                        <input type="number"
                          placeholder={discountType === "percent" ? t("ছাড়ের % (যেমন ১০)", "Discount % (e.g. 10)") : t("সমতল পরিমাণ (৳)", "Flat amount (৳)")}
                          value={discountValue} onChange={(e) => setDiscountValue(e.target.value)}
                          min={0} max={discountType === "percent" ? 100 : undefined}
                          style={inputStyle()} onFocus={onFocusInput} onBlur={e => onBlurInput(e)} />
                        {salePrice !== null && (
                          <p style={{ fontSize: 12, color: "#059669", marginTop: 7, fontWeight: 600 }}>
                            {t("বিক্রয় মূল্য:", "Sale price:")} ৳{salePrice.toLocaleString()}
                            <span style={{ color: "#c4cdd8", textDecoration: "line-through", marginLeft: 8, fontWeight: 400 }}>
                              ৳{Number(price).toLocaleString()}
                            </span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Parent Link */}
                <div>
                  {fieldLabel(t("লিংক", "Link"), true)}
                  <div style={{ position: "relative" }} ref={parentRef}>
                    <PremiumDropBtn
                      onClick={() => setParentDropdown(!parentDropdown)}
                      selected={!!selectedParent} hasError={!selectedParent} isOpen={parentDropdown}>
                      <span style={{ fontWeight: selectedParent ? 500 : 400 }}>
                        {selectedParentName || t("লিংক নির্বাচন করুন", "Select Link")}
                      </span>
                    </PremiumDropBtn>
                    <AnimatePresence>
                      {parentDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.97 }}
                          transition={{ type: "spring", stiffness: 380, damping: 28 }}
                          style={dropdownPanelStyle}>
                          {parentLinks.map((p, i) => (
                            <div key={p._id}
                              onClick={() => { setSelectedParent(p._id); setLink(p._id); setSublink(""); setParentDropdown(false); }}
                              style={{ ...dropdownItemStyle(selectedParent === p._id), borderBottom: i < parentLinks.length - 1 ? "1px solid rgba(99,102,241,0.05)" : "none" }}
                              onMouseEnter={e => selectedParent !== p._id && (e.currentTarget.style.background = "rgba(99,102,241,0.04)")}
                              onMouseLeave={e => selectedParent !== p._id && (e.currentTarget.style.background = "transparent")}>
                              {p.name}
                              {selectedParent === p._id && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", display: "inline-block" }} />}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Sublink */}
                {selectedParent && (
                  <div>
                    {fieldLabel(t("সাবলিংক", "Sublink"))}
                    <div style={{ position: "relative" }} ref={sublinkRef}>
                      <PremiumDropBtn
                        onClick={() => setSublinkDropdown(!sublinkDropdown)}
                        selected={!!sublink} isOpen={sublinkDropdown}>
                        <span style={{ fontWeight: sublink ? 500 : 400 }}>
                          {selectedSublinkName || t("সাবলিংক নির্বাচন করুন (ঐচ্ছিক)", "Select Sublink (optional)")}
                        </span>
                      </PremiumDropBtn>
                      <AnimatePresence>
                        {sublinkDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.97 }}
                            transition={{ type: "spring", stiffness: 380, damping: 28 }}
                            style={dropdownPanelStyle}>
                            <div onClick={() => { setSublink(""); setSublinkDropdown(false); }}
                              style={{ ...dropdownItemStyle(!sublink), fontStyle: "italic", borderBottom: "1px solid rgba(99,102,241,0.05)" }}
                              onMouseEnter={e => sublink && (e.currentTarget.style.background = "rgba(99,102,241,0.04)")}
                              onMouseLeave={e => sublink && (e.currentTarget.style.background = "transparent")}>
                              — {t("কোনোটি নয়", "None")} —
                            </div>
                            {filteredSublinks.length > 0 ? filteredSublinks.map((s, i) => (
                              <div key={s._id}
                                onClick={() => { setSublink(s._id); setSublinkDropdown(false); }}
                                style={{ ...dropdownItemStyle(sublink === s._id), borderBottom: i < filteredSublinks.length - 1 ? "1px solid rgba(99,102,241,0.05)" : "none" }}
                                onMouseEnter={e => sublink !== s._id && (e.currentTarget.style.background = "rgba(99,102,241,0.04)")}
                                onMouseLeave={e => sublink !== s._id && (e.currentTarget.style.background = "transparent")}>
                                {s.name}
                                {sublink === s._id && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", display: "inline-block" }} />}
                              </div>
                            )) : (
                              <div style={{ padding: "12px 16px", fontSize: 13, color: "#94a3b8" }}>
                                {t("কোনো সাবলিংক নেই", "No sublinks found.")}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {sublinkError && (
                      <p style={{ fontSize: 12, color: "#f43f5e", marginTop: 6, fontWeight: 500 }}>{sublinkError}</p>
                    )}
                  </div>
                )}

                {/* Status — toggle cards */}
                <div>
                  {fieldLabel(t("স্ট্যাটাস", "Status"))}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {statusOptions.map(option => {
                      const isSelected = isActive === option.value;
                      const dotColor  = option.value ? "#10b981" : "#f43f5e";
                      const selBg     = option.value ? "rgba(16,185,129,0.07)" : "rgba(244,63,94,0.06)";
                      const selBorder = option.value ? "rgba(16,185,129,0.3)" : "rgba(244,63,94,0.28)";
                      const selColor  = option.value ? "#059669" : "#e11d48";
                      return (
                        <motion.button key={String(option.value)} type="button"
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          onClick={() => setIsActive(option.value)}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            padding: "11px 14px", borderRadius: 13, cursor: "pointer",
                            background: isSelected ? selBg : "#f8f9ff",
                            border: `1.5px solid ${isSelected ? selBorder : "rgba(99,102,241,0.10)"}`,
                            color: isSelected ? selColor : "#94a3b8",
                            fontSize: 13.5, fontWeight: isSelected ? 700 : 500, transition: "all .18s ease",
                            boxShadow: isSelected ? `0 2px 12px ${dotColor}18` : "none",
                          }}>
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

                {/* Featured toggle */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 16px", borderRadius: 13,
                  background: isFeatured ? "rgba(245,158,11,0.06)" : "#f8f9ff",
                  border: `1.5px solid ${isFeatured ? "rgba(245,158,11,0.28)" : "rgba(99,102,241,0.10)"}`,
                  transition: "all .18s", cursor: "pointer" }}
                  onClick={() => setIsFeatured(!isFeatured)}>
                  <div className="flex items-center gap-2.5">
                    <Star size={16} style={{ color: isFeatured ? "#f59e0b" : "#d1d9e0", fill: isFeatured ? "#f59e0b" : "none", transition: "all .18s" }} />
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: isFeatured ? "#d97706" : "#94a3b8" }}>
                      {t("ফিচার্ড পণ্য", "Featured Product")}
                    </span>
                  </div>
                  <div style={{
                    width: 40, height: 22, borderRadius: 99, padding: 3, transition: "all .2s",
                    background: isFeatured ? "#f59e0b" : "rgba(99,102,241,0.12)",
                    display: "flex", alignItems: "center", justifyContent: isFeatured ? "flex-end" : "flex-start",
                  }}>
                    <motion.div animate={{ x: isFeatured ? 0 : 0 }}
                      style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} />
                  </div>
                </div>

                {/* Images */}
                <div>
                  {fieldLabel(t("পণ্যের ছবি", "Product Images"), !editId)}
                  <label style={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    width: "100%", height: 110, cursor: "pointer", borderRadius: 13, transition: "all .18s",
                    border: `2px dashed ${!editId && images.length === 0 ? "rgba(244,63,94,0.35)" : "rgba(99,102,241,0.2)"}`,
                    background: !editId && images.length === 0 ? "rgba(244,63,94,0.03)" : "rgba(99,102,241,0.03)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)"; e.currentTarget.style.background = "rgba(99,102,241,0.06)"; }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = !editId && images.length === 0 ? "rgba(244,63,94,0.35)" : "rgba(99,102,241,0.2)";
                    e.currentTarget.style.background = !editId && images.length === 0 ? "rgba(244,63,94,0.03)" : "rgba(99,102,241,0.03)";
                  }}>
                    <Upload size={20} style={{ color: !editId && images.length === 0 ? "#f43f5e" : "#a8b4c8", marginBottom: 6 }} />
                    <span style={{ fontSize: 12.5, color: "#94a3b8", textAlign: "center", padding: "0 16px" }}>
                      {t(`ছবি আপলোড করুন (সর্বোচ্চ ৫টি, প্রতিটি ${MAX_IMAGE_SIZE_MB}MB এর নিচে)`,
                         `Upload images (max 5, each under ${MAX_IMAGE_SIZE_MB}MB)`)}
                    </span>
                    <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleImageChange} />
                  </label>
                  {!editId && images.length === 0 && (
                    <p style={{ fontSize: 11.5, color: "#f43f5e", marginTop: 6, fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#f43f5e", display: "inline-block" }} />
                      {t("অন্তত একটি ছবি আবশ্যক।", "At least one image is required.")}
                    </p>
                  )}

                  {/* Existing images */}
                  {existingImages.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <p style={{ fontSize: 11.5, color: "#94a3b8", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>
                        {t("বর্তমান ছবি:", "Current Images:")}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {existingImages.map((img, i) => (
                          <img key={i} src={img.url} alt="product"
                            style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 10, border: "1px solid rgba(99,102,241,0.12)" }} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New images preview */}
                  {images.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <p style={{ fontSize: 11.5, color: "#94a3b8", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>
                        {t(`নতুন ছবি (${images.length}/৫):`, `New Images (${images.length}/5):`)}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {images.map((img, i) => (
                          <div key={i} style={{ position: "relative" }}>
                            <img src={URL.createObjectURL(img)} alt="preview"
                              style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 10, border: "1px solid rgba(99,102,241,0.12)" }} />
                            <span style={{ position: "absolute", bottom: 0, left: 0, right: 0, textAlign: "center",
                              fontSize: 9, background: "rgba(0,0,0,0.5)", color: "#fff", borderRadius: "0 0 10px 10px", padding: "2px 0" }}>
                              {(img.size / (1024 * 1024)).toFixed(1)}MB
                            </span>
                            <button type="button" onClick={() => removeNewImage(i)}
                              style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18,
                                background: "#f43f5e", color: "#fff", borderRadius: "50%", border: "none",
                                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b" }}>
                        {t("পণ্যের বৈশিষ্ট্য", "Product Specifications")}
                      </p>
                      <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>
                        {t("প্রতিটি বৈশিষ্ট্যের মান দিন — খালি রাখলে সংরক্ষিত হবে না", "Fill the value for each spec — leave blank to skip")}
                      </p>
                    </div>
                    <AnimatePresence>
                      {features.some(f => f.value.trim()) && (
                        <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                          style={{ fontSize: 11, fontWeight: 700, color: "#059669",
                            background: "rgba(16,185,129,0.09)", border: "1px solid rgba(16,185,129,0.2)",
                            padding: "4px 10px", borderRadius: 99, flexShrink: 0 }}>
                          ✓ {features.filter(f => f.value.trim()).length} {t("পূরণ", "filled")}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {FEATURE_ROWS.map((row, i) => {
                      const val      = features[i]?.value || "";
                      const isFilled = val.trim() !== "";
                      return (
                        <motion.div key={i}
                          animate={{ borderColor: isFilled ? "rgba(16,185,129,0.35)" : "rgba(99,102,241,0.10)" }}
                          transition={{ duration: 0.2 }}
                          style={{ border: "1.5px solid", borderRadius: 13, overflow: "hidden", background: "#fff" }}>
                          <div className="flex items-center">
                            <div style={{
                              display: "flex", alignItems: "center", gap: 10,
                              padding: "11px 14px",
                              borderRight: `1.5px solid ${isFilled ? "rgba(16,185,129,0.2)" : "rgba(99,102,241,0.08)"}`,
                              minWidth: 148, flexShrink: 0,
                              background: isFilled ? "rgba(16,185,129,0.04)" : "rgba(99,102,241,0.02)",
                              transition: "all .2s",
                            }}>
                              <span style={{ fontSize: 20 }}>{row.icon}</span>
                              <div>
                                <p style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", lineHeight: 1,
                                  color: isFilled ? "#059669" : "#94a3b8", transition: "color .2s" }}>
                                  {row.keyPlaceholder}
                                </p>
                                <p style={{ fontSize: 9, color: "#c4cdd8", marginTop: 2, fontWeight: 500 }}>
                                  {t("নির্দিষ্ট ক্ষেত্র", "Fixed field")}
                                </p>
                              </div>
                            </div>
                            <div style={{ flex: 1, padding: "11px 14px" }}>
                              <input type="text" placeholder={row.valuePlaceholder} value={val}
                                onChange={(e) => {
                                  const updated = [...features];
                                  updated[i] = { key: row.keyPlaceholder, value: e.target.value };
                                  setFeatures(updated);
                                }}
                                style={{ width: "100%", fontSize: 13, fontWeight: 600, color: "#1e293b",
                                  background: "transparent", outline: "none", border: "none",
                                  fontFamily: "'DM Sans',sans-serif" }}
                              />
                            </div>
                            <div style={{ paddingRight: 14 }}>
                              <motion.div
                                animate={{ scale: isFilled ? 1 : 0.6, background: isFilled ? "#10b981" : "#e2e8f0" }}
                                transition={{ duration: 0.2 }}
                                style={{ width: 10, height: 10, borderRadius: "50%" }} />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between" style={{ marginTop: 10 }}>
                    <p style={{ fontSize: 12, color: "#94a3b8" }}>
                      💡 {t("খালি ক্ষেত্র সংরক্ষিত হবে না", "Blank fields will not be saved")}
                    </p>
                    {features.some(f => f.value.trim()) && (
                      <motion.button type="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        onClick={() => setFeatures(features.map((f) => ({ ...f, value: "" })))}
                        style={{ fontSize: 12, color: "#f43f5e", fontWeight: 600, background: "none", border: "none",
                          cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                        <X size={12} /> {t("সব মুছুন", "Clear all")}
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "rgba(99,102,241,0.07)", margin: "24px 0 20px" }} />

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button type="submit"
                  whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-1/2 inline-flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg,#6366f1,#4f46e5)", border: "none", borderRadius: 13,
                    padding: "12px 20px", fontSize: 13.5, fontWeight: 700, color: "#fff", cursor: "pointer",
                    boxShadow: "0 6px 20px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
                    letterSpacing: "-.01em",
                  }}>
                  {editId ? t("আপডেট করুন", "Save Changes") : t("তৈরি করুন", "Create Product")}
                </motion.button>
                <motion.button type="button"
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { setView("home"); resetForm(); }}
                  className="w-full sm:w-1/2 inline-flex items-center justify-center"
                  style={{
                    background: "rgba(99,102,241,0.05)", border: "1.5px solid rgba(99,102,241,0.13)",
                    borderRadius: 13, padding: "12px 20px", fontSize: 13.5, fontWeight: 600, color: "#6366f1",
                    cursor: "pointer", transition: "all .15s", letterSpacing: "-.01em",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.10)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(99,102,241,0.05)"}>
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
const SubAdminProducts = () => {
  const { t } = useSubLang();
  const [products,     setProducts]     = useState([]);
  const [allSublinks,  setAllSublinks]  = useState([]);
  const [parentLinks,  setParentLinks]  = useState([]);
  const [view,         setView]         = useState("home");
  const [sort,         setSort]         = useState("newest");
  const [search,       setSearch]       = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editId,       setEditId]       = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [nameError,    setNameError]    = useState("");
  const [sublinkError, setSublinkError] = useState("");
  const [deleteOpen,   setDeleteOpen]   = useState(false);
  const [deleteId,     setDeleteId]     = useState(null);
  const [deleteName,   setDeleteName]   = useState("");
  const dropdownRef = useRef(null);

  const [name,           setName]           = useState("");
  const [description,    setDescription]    = useState("");
  const [price,          setPrice]          = useState("");
  const [stock,          setStock]          = useState("");
  const [link,           setLink]           = useState("");
  const [sublink,        setSublink]        = useState("");
  const [selectedParent, setSelectedParent] = useState("");
  const [isActive,       setIsActive]       = useState(true);
  const [discountType,   setDiscountType]   = useState("none");
  const [discountValue,  setDiscountValue]  = useState(0);
  const [isFeatured,     setIsFeatured]     = useState(false);
  const [features,       setFeatures]       = useState(emptyFeatures());
  const [images,         setImages]         = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const fetchParentLinks = async () => {
    try { const res = await fetch(LINK_API); const data = await res.json(); setParentLinks(data.data || []); }
    catch (err) { console.log(err); }
  };
  const fetchSublinks = async () => {
    try { const res = await fetch(SUBLINK_API); const data = await res.json(); setAllSublinks(data.data || []); }
    catch (err) { console.log(err); }
  };
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res  = await fetch(PRODUCT_API, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      setProducts(data.data || []);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchParentLinks(); fetchSublinks(); fetchProducts(); }, []);
  useEffect(() => {
    const handler = (e) => { if (!dropdownRef.current?.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const processedProducts = [...products]
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "name")      return a.name.localeCompare(b.name);
      if (sort === "date")      return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === "newest")    return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "status")    return b.isActive - a.isActive;
      if (sort === "featured")  return b.isFeatured - a.isFeatured;
      if (sort === "stockAsc")  return (a.stock ?? 0) - (b.stock ?? 0);
      if (sort === "stockDesc") return (b.stock ?? 0) - (a.stock ?? 0);
      return 0;
    });

  const resetForm = () => {
    setName(""); setDescription(""); setPrice(""); setStock("");
    setLink(""); setSublink(""); setSelectedParent(""); setIsActive(true);
    setDiscountType("none"); setDiscountValue(0); setIsFeatured(false);
    setFeatures(emptyFeatures()); setImages([]); setExistingImages([]);
    setEditId(null); setNameError(""); setSublinkError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNameError(""); setSublinkError("");
    if (!name.trim()) { setNameError(t("পণ্যের নাম আবশ্যক", "Product name is required")); return; }
    if (!link)        { alert(t("লিংক নির্বাচন করুন (আবশ্যক)", "Please select a Link (required)")); return; }
    try {
      const formData = new FormData();
      formData.append("name", name); formData.append("description", description);
      formData.append("price", price); formData.append("stock", stock);
      formData.append("link", link); formData.append("sublink", sublink || "");
      formData.append("isActive", isActive ? "true" : "false");
      formData.append("discountType", discountType); formData.append("discountValue", discountValue);
      formData.append("isFeatured", isFeatured ? "true" : "false");
      const validFeatures = features.filter((f) => f.key.trim() !== "" && f.value.trim() !== "");
      formData.append("features", JSON.stringify(validFeatures));
      images.forEach((img) => formData.append("images", img));

      const url    = editId ? `${PRODUCT_API}/${editId}` : PRODUCT_API;
      const method = editId ? "PUT" : "POST";
      const res    = await fetch(url, { method, headers: { Authorization: `Bearer ${getToken()}` }, body: formData });
      if (!res.ok) { const err = await res.json(); alert(err.message || "Error saving product"); return; }

      editId ? showUpdateSuccessToast(name) : showAddSuccessToast(name);
      resetForm(); setView("home"); fetchProducts();
    } catch (err) { console.log(err); }
  };

  const handleDelete = (product) => { setDeleteId(product._id); setDeleteName(product.name); setDeleteOpen(true); };
  const confirmDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`${PRODUCT_API}/${deleteId}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
    if (res.ok) { showDeleteSuccessToast(deleteName); fetchProducts(); }
    setDeleteOpen(false);
  };

  const handleEdit = (product) => {
    const sublinkObj = allSublinks.find((s) => s._id === (product.sublink?._id || product.sublink));
    const parentId = product.link?._id || product.link || sublinkObj?.parent?._id || sublinkObj?.parent || "";
    setName(product.name); setDescription(product.description);
    setPrice(product.price); setStock(product.stock);
    setSelectedParent(parentId); setLink(parentId);
    setSublink(product.sublink?._id || product.sublink || "");
    setIsActive(product.isActive);
    setDiscountType(product.discountType || "none"); setDiscountValue(product.discountValue || 0);
    setIsFeatured(product.isFeatured || false);
    const existing = (product.features || []).map((f) => ({ key: f.key || "", value: f.value || "" }));
    const padded = [...existing, ...Array.from({ length: Math.max(0, 10 - existing.length) }, () => ({ key: "", value: "" }))];
    setFeatures(padded); setExistingImages(product.images || []); setImages([]); setEditId(product._id); setView("add");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        .prod-wrap, .prod-wrap * { box-sizing: border-box; font-family: 'DM Sans', sans-serif; }
        .prod-serif { font-family: 'Syne', sans-serif !important; }
      `}</style>

      <div className="prod-wrap px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="w-full">

          {/* Page title */}
          <div className="space-y-3 sm:space-y-4">
            <div className="text-center">
              <h1 className="prod-serif text-[20px] sm:text-[24px] md:text-[28px] font-black tracking-[-0.03em]"
                style={{ color: "#1e293b" }}>
                {t("পণ্য", "Products")}
              </h1>
              <p className="text-[12.5px] sm:text-sm mt-1" style={{ color: "#94a3b8" }}>
                {t("আপনার পণ্য ম্যানেজ করুন।", "Manage your products.")}
              </p>
            </div>

            {/* Breadcrumb */}
            <div className="flex justify-start">
              <div className="flex flex-wrap items-center gap-1.5 text-[12px] sm:text-[13px]" style={{ color: "#94a3b8" }}>
                {view === "home" && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg"
                    style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.13)", color: "#6366f1", fontWeight: 600, fontSize: 12 }}>
                    <Package size={12} /> {t("পণ্য", "Products")}
                  </span>
                )}
                {view === "add" && (
                  <>
                    <button onClick={() => { setView("home"); resetForm(); }}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all"
                      style={{ background: "transparent", border: "1px solid rgba(99,102,241,0.10)", color: "#94a3b8", fontWeight: 500, fontSize: 12, cursor: "pointer" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.06)"; e.currentTarget.style.color = "#6366f1"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}>
                      <Package size={12} /> {t("পণ্য", "Products")}
                    </button>
                    <span style={{ color: "#e2e8f0" }}>/</span>
                    <span className="px-3 py-1 rounded-lg"
                      style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.13)", color: "#6366f1", fontWeight: 600, fontSize: 12 }}>
                      {editId ? t("আপডেট", "Update") : t("যোগ করুন", "Add")}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Views */}
          {view === "home" && (
            <ProductShow
              products={processedProducts} loading={loading}
              search={search} setSearch={setSearch}
              sort={sort} setSort={setSort}
              dropdownOpen={dropdownOpen} setDropdownOpen={setDropdownOpen}
              dropdownRef={dropdownRef} setView={setView}
              handleDelete={handleDelete} handleEdit={handleEdit}
              parentLinks={parentLinks} allSublinks={allSublinks}
            />
          )}
          {view === "add" && (
            <ProductAdd
              name={name} setName={setName} description={description} setDescription={setDescription}
              price={price} setPrice={setPrice} stock={stock} setStock={setStock}
              link={link} setLink={setLink} sublink={sublink} setSublink={setSublink}
              selectedParent={selectedParent} setSelectedParent={setSelectedParent}
              parentLinks={parentLinks} allSublinks={allSublinks}
              isActive={isActive} setIsActive={setIsActive}
              discountType={discountType} setDiscountType={setDiscountType}
              discountValue={discountValue} setDiscountValue={setDiscountValue}
              isFeatured={isFeatured} setIsFeatured={setIsFeatured}
              features={features} setFeatures={setFeatures}
              images={images} setImages={setImages} existingImages={existingImages}
              handleSubmit={handleSubmit} setView={setView} resetForm={resetForm}
              nameError={nameError} sublinkError={sublinkError} editId={editId}
            />
          )}

          <ConfirmModal
            isOpen={deleteOpen} onClose={() => setDeleteOpen(false)}
            onConfirm={confirmDelete}
            title={t("পণ্য মুছবেন?", "Delete Product?")}
            message={`"${deleteName}" ${t("মুছতে চান?", "Are you sure you want to delete this?")}`}
            confirmText={t("মুছুন", "Delete")} cancelText={t("বাতিল", "Cancel")} danger
          />
        </div>
      </div>
    </>
  );
};

export default SubAdminProducts;