import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ChevronDown, Plus, Pencil, Trash2,
  Loader2, X, Layers, RefreshCw,
} from "lucide-react";

const SublinkShow = ({
  sublinks, loading,
  search, setSearch,
  sort, setSort, sortOptions,
  dropdownOpen, setDropdownOpen, dropdownRef,
  setView, handleDelete, handleEdit,
  parents, onRefresh, t,
}) => {
  const [filterParent,    setFilterParent]    = useState("");
  const [parentDropdown,  setParentDropdown]  = useState(false);
  const parentRef = useRef(null);

  // pagination
  const [page, setPage] = useState(1);
  const limit = 15;

  useEffect(() => {
    const handler = (e) => {
      if (!parentRef.current?.contains(e.target)) setParentDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // reset page on filter/search change
  useEffect(() => { setPage(1); }, [search, sort, filterParent]);

  const selectedParentName = parents.find(p => p._id === filterParent)?.name;

  const filtered = sublinks.filter(s => {
    if (!filterParent) return true;
    return (s.parent?._id || s.parent) === filterParent;
  });

  const pages = Math.max(1, Math.ceil(filtered.length / limit));
  const displayed = filtered.slice((page - 1) * limit, page * limit);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        .ss-wrap * { box-sizing: border-box; }
        .ss-wrap { font-family: 'DM Sans', sans-serif; }

        .ss-search-input {
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
          padding: 11px 16px 11px 40px; font-size: 13px; color: #e2e8f0;
          outline: none; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
        }
        .ss-search-input::placeholder { color: #475569; }
        .ss-search-input:focus { border-color: rgba(201,168,76,0.35); background: rgba(201,168,76,0.03); }

        .ss-sort-btn {
          display: flex; align-items: center; justify-content: space-between; gap: 8px;
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 11px;
          padding: 10px 13px; font-size: 12px; color: #94a3b8;
          cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif;
        }
        .ss-sort-btn:hover { border-color: rgba(255,255,255,0.15); color: #cbd5e1; }

        .ss-dropdown {
          background: #1a2235; border: 1px solid rgba(255,255,255,0.09);
          border-radius: 14px; overflow: hidden; box-shadow: 0 16px 48px rgba(0,0,0,0.5);
        }
        .ss-dropdown-item { padding: 10px 16px; font-size: 12px; color: #94a3b8; cursor: pointer; transition: all 0.12s; }
        .ss-dropdown-item:hover { background: rgba(255,255,255,0.05); color: #e2e8f0; }
        .ss-dropdown-item.active { background: rgba(201,168,76,0.08); color: #c9a84c; font-weight: 600; }
        .ss-dropdown-item.all { font-style: italic; color: #475569; }
        .ss-dropdown-item.all.selected { color: #c9a84c; }

        .ss-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 16px; border-radius: 10px;
          font-size: 12px; font-weight: 600; cursor: pointer;
          transition: all 0.15s; border: 1px solid transparent;
          font-family: 'DM Sans', sans-serif;
        }
        .ss-btn:hover { transform: translateY(-1px); }

        .ss-col-header {
          display: grid; align-items: center;
          padding: 11px 20px;
          grid-template-columns: 28px 1fr 100px 90px 56px;
          gap: 8px; background: #0f1929;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          position: sticky; top: 0; z-index: 10;
        }

        .ss-row {
          display: grid; align-items: center;
          padding: 15px 20px;
          grid-template-columns: 28px 1fr 100px 90px 56px;
          gap: 8px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: background 0.15s;
        }
        .ss-row:last-child { border-bottom: none; }
        .ss-row:hover { background: rgba(255,255,255,0.025); }

        /* ── Mobile: hide parent column ── */
        @media (max-width: 640px) {
          .ss-col-header { grid-template-columns: 22px 1fr 80px 36px; padding: 9px 12px; gap: 6px; }
          .ss-col-header .col-parent { display: none; }
          .ss-row { grid-template-columns: 22px 1fr 80px 36px; padding: 11px 12px; gap: 6px; }
          .ss-row .cell-parent { display: none; }
        }

        .ss-icon-btn {
          width: 28px; height: 28px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.15s; border: none;
          font-family: 'DM Sans', sans-serif;
        }
        .ss-icon-btn:hover { transform: translateY(-1px); }

        .ss-page-btn {
          display: flex; align-items: center; justify-content: center;
          padding: 7px 14px; border-radius: 10px; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.15s;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          color: #64748b; font-family: 'DM Sans', sans-serif;
        }
        .ss-page-btn:hover:not(:disabled) { border-color: rgba(255,255,255,0.15); color: #94a3b8; }
        .ss-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

        .ss-page-num {
          width: 32px; height: 32px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
      `}</style>

      <div className="ss-wrap">
        <AnimatePresence mode="wait">
          <motion.div key="home"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            className="space-y-4">

            {/* ══ HEADER CARD ══ */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg,#0d1426 0%,#111827 50%,#0f172a 100%)",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
              }}>

              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg,transparent,rgba(201,168,76,0.6) 30%,rgba(139,92,246,0.6) 70%,transparent)" }}/>
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
                backgroundSize: "32px 32px",
              }}/>
              <div className="absolute pointer-events-none" style={{
                top: "-60px", right: "-40px", width: "200px", height: "200px", borderRadius: "50%",
                background: "radial-gradient(circle,rgba(201,168,76,0.07) 0%,transparent 70%)",
              }}/>
              <div className="absolute pointer-events-none" style={{
                bottom: "-40px", left: "-20px", width: "150px", height: "150px", borderRadius: "50%",
                background: "radial-gradient(circle,rgba(167,139,250,0.06) 0%,transparent 70%)",
              }}/>

              <div className="relative p-6 sm:p-7">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(135deg,rgba(167,139,250,0.15),rgba(167,139,250,0.05))", border: "1px solid rgba(167,139,250,0.2)" }}>
                      <Layers size={20} style={{ color: "#a78bfa" }}/>
                    </div>
                    <div>
                      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "20px", color: "#f1f5f9", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                        {t("সাব নেভিগেশন লিংক","Sub Navigation Links")}
                      </h1>
                      <p className="text-xs mt-1" style={{ color: "#475569" }}>
                        {t("সাব নেভিগেশন লিংক পরিচালনা করুন।","Manage sub navigation links.")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button onClick={onRefresh} disabled={loading}
                      className="ss-btn"
                      style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.08)", color: "#94a3b8" }}>
                      <RefreshCw size={13} className={loading ? "animate-spin" : ""}/>
                      <span className="hidden sm:inline">{t("রিফ্রেশ","Refresh")}</span>
                    </button>
                    <button onClick={() => setView("add")}
                      className="ss-btn"
                      style={{ background: "linear-gradient(135deg,rgba(167,139,250,0.2),rgba(167,139,250,0.1))", borderColor: "rgba(167,139,250,0.3)", color: "#c4b5fd", boxShadow: "0 4px 16px rgba(167,139,250,0.12)" }}>
                      <Plus size={14}/> {t("সাবলিংক যোগ করুন","Add Sublink")}
                    </button>
                  </div>
                </div>

                {/* stat cards — 2 col on mobile, 4 on sm+ */}
                <div className="grid grid-cols-2 sm:flex sm:flex-nowrap gap-3">
                  {[
                    { labelBn: "মোট",      labelEn: "Total",    count: sublinks.length,                          color: "#c9a84c" },
                    { labelBn: "সক্রিয়",   labelEn: "Active",   count: sublinks.filter(s=>s.isActive).length,   color: "#34d399" },
                    { labelBn: "নিষ্ক্রিয়",labelEn: "Inactive", count: sublinks.filter(s=>!s.isActive).length,  color: "#f87171" },
                    { labelBn: "প্যারেন্ট", labelEn: "Parents",  count: parents.length,                          color: "#a78bfa" },
                  ].map(({ labelBn, labelEn, count, color }) => (
                    <div key={labelEn} className="sm:flex-1 min-w-0 rounded-xl p-3"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="text-xl font-bold" style={{ color, lineHeight: 1 }}>{count}</div>
                      <div className="text-[11px] font-medium mt-1" style={{ color: "#475569" }}>{t(labelBn, labelEn)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ══ CONTROLS ══ */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* search */}
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#475569" }}/>
                <input type="text"
                  placeholder={t("সাবলিংক খুঁজুন...","Search sublink...")}
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="ss-search-input"/>
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 transition" style={{ color: "#475569" }}>
                    <X size={13}/>
                  </button>
                )}
              </div>

              {/* parent filter */}
              <div className="relative sm:w-48" ref={parentRef}>
                <button className="ss-sort-btn" onClick={() => setParentDropdown(!parentDropdown)}>
                  <span style={{ color: filterParent ? "#c9a84c" : "#64748b", fontWeight: filterParent ? 600 : 400 }}>
                    {selectedParentName || t("লিংক ফিল্টার","Filter by Link")}
                  </span>
                  <ChevronDown size={13}/>
                </button>
                <AnimatePresence>
                  {parentDropdown && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                      className="ss-dropdown absolute right-0 mt-2 w-full z-50 max-h-52 overflow-y-auto">
                      <div
                        className={`ss-dropdown-item all ${!filterParent ? "selected" : ""}`}
                        onClick={() => { setFilterParent(""); setParentDropdown(false); }}>
                        — {t("সব","All")} —
                      </div>
                      {parents.map(p => (
                        <div key={p._id}
                          className={`ss-dropdown-item ${filterParent === p._id ? "active" : ""}`}
                          onClick={() => { setFilterParent(p._id); setParentDropdown(false); }}>
                          {p.name}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* sort */}
              <div className="relative sm:w-48" ref={dropdownRef}>
                <button className="ss-sort-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <span style={{ color: "#cbd5e1" }}>
                    {sortOptions.find(o => o.value === sort)?.label}
                  </span>
                  <ChevronDown size={13}/>
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                      className="ss-dropdown absolute right-0 mt-2 w-full z-50">
                      {sortOptions.map(option => (
                        <div key={option.value}
                          className={`ss-dropdown-item ${sort === option.value ? "active" : ""}`}
                          onClick={() => { setSort(option.value); setDropdownOpen(false); }}>
                          {option.label}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* clear filter */}
              {filterParent && (
                <button onClick={() => setFilterParent("")}
                  className="ss-btn"
                  style={{ background: "rgba(248,113,113,0.08)", borderColor: "rgba(248,113,113,0.15)", color: "#f87171" }}>
                  <X size={12}/> {t("ক্লিয়ার","Clear")}
                </button>
              )}
            </div>

            {/* ══ TABLE ══ */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "#0d1426", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>

              <div className="ss-col-header">
                <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#2d3f55" }}>#</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#2d3f55" }}>{t("নাম","Name")}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider col-parent" style={{ color: "#2d3f55" }}>{t("প্যারেন্ট","Parent")}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#2d3f55" }}>{t("স্ট্যাটাস","Status")}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#2d3f55" }}></div>
              </div>

              <div>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.15)" }}>
                      <Loader2 size={20} className="animate-spin" style={{ color: "#a78bfa" }}/>
                    </div>
                    <p className="text-xs font-medium" style={{ color: "#475569" }}>{t("লোড হচ্ছে…","Loading…")}</p>
                  </div>
                ) : displayed.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <Layers size={24} style={{ color: "#1e293b" }}/>
                    </div>
                    <p className="text-sm font-medium" style={{ color: "#475569" }}>
                      {t("কোনো সাবলিংক পাওয়া যায়নি।","No sublinks found.")}
                    </p>
                  </div>
                ) : (
                  displayed.map((sublink, index) => (
                    <motion.div key={sublink._id} className="ss-row"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}>

                      <div className="text-xs font-medium" style={{ color: "#2d3f55" }}>
                        {(page - 1) * limit + index + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm font-medium" style={{ color: "#e2e8f0", wordBreak: "break-word" }}>{sublink.name}</div>
                      </div>

                      <div className="min-w-0 cell-parent">
                        {sublink.parent?.name ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold"
                            style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.15)", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                            {sublink.parent.name}
                          </span>
                        ) : (
                          <span style={{ color: "#334155", fontSize: "12px" }}>—</span>
                        )}
                      </div>

                      <div>
                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold"
                          style={{
                            background: sublink.isActive ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
                            color:      sublink.isActive ? "#34d399" : "#f87171",
                            border:     `1px solid ${sublink.isActive ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}`,
                          }}>
                          {sublink.isActive ? t("সক্রিয়","Active") : t("নিষ্ক্রিয়","Inactive")}
                        </span>
                      </div>

                      <div className="flex justify-end items-center gap-1.5">
                        <button className="ss-icon-btn"
                          style={{ background: "rgba(129,140,248,0.08)", color: "#818cf8" }}
                          onClick={() => handleEdit(sublink)}>
                          <Pencil size={13}/>
                        </button>
                        <button className="ss-icon-btn"
                          style={{ background: "rgba(248,113,113,0.08)", color: "#f87171" }}
                          onClick={() => handleDelete(sublink)}>
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* ══ PAGINATION ══ */}
            {pages > 1 && (
              <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-xs font-medium" style={{ color: "#475569" }}>
                  {t("পেজ","Page")} <span style={{ color: "#94a3b8" }}>{page}</span> {t("এর মধ্যে","of")} <span style={{ color: "#94a3b8" }}>{pages}</span>
                  {" · "}<span style={{ color: "#64748b" }}>{filtered.length} {t("মোট","total")}</span>
                </p>
                <div className="flex items-center gap-1.5">
                  <button className="ss-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    ← {t("আগে","Prev")}
                  </button>
                  {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                    const p = page <= 3 ? i + 1 : page - 2 + i;
                    if (p > pages) return null;
                    return (
                      <button key={p} className="ss-page-num" onClick={() => setPage(p)}
                        style={{
                          background: page === p ? "linear-gradient(135deg,#a78bfa,#c4b5fd)" : "rgba(255,255,255,0.04)",
                          border: `1px solid ${page === p ? "transparent" : "rgba(255,255,255,0.08)"}`,
                          color: page === p ? "#fff" : "#64748b",
                          boxShadow: page === p ? "0 4px 12px rgba(167,139,250,0.3)" : "none",
                        }}>
                        {p}
                      </button>
                    );
                  })}
                  <button className="ss-page-btn" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>
                    {t("পরে","Next")} →
                  </button>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
};

export default SublinkShow;