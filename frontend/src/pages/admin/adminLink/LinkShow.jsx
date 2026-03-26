import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ChevronDown, Plus, Pencil, Trash2,
  Loader2, X, Link2, RefreshCw,
} from "lucide-react";

const LinkShow = ({
  links, loading,
  search, setSearch,
  sort, setSort, sortOptions,
  dropdownOpen, setDropdownOpen, dropdownRef,
  setView, handleDelete, handleEdit,
  onRefresh, t,
}) => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        .ls-wrap * { box-sizing: border-box; }
        .ls-wrap { font-family: 'DM Sans', sans-serif; }

        .ls-search-input {
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
          padding: 11px 16px 11px 40px; font-size: 13px; color: #e2e8f0;
          outline: none; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
        }
        .ls-search-input::placeholder { color: #475569; }
        .ls-search-input:focus { border-color: rgba(201,168,76,0.35); background: rgba(201,168,76,0.03); }

        .ls-sort-btn {
          display: flex; align-items: center; justify-content: space-between; gap: 8px;
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 11px;
          padding: 10px 13px; font-size: 12px; color: #94a3b8;
          cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif;
        }
        .ls-sort-btn:hover { border-color: rgba(255,255,255,0.15); color: #cbd5e1; }

        .ls-sort-dropdown {
          background: #1a2235; border: 1px solid rgba(255,255,255,0.09);
          border-radius: 14px; overflow: hidden; box-shadow: 0 16px 48px rgba(0,0,0,0.5);
        }
        .ls-sort-item { padding: 10px 16px; font-size: 12px; color: #94a3b8; cursor: pointer; transition: all 0.12s; }
        .ls-sort-item:hover { background: rgba(255,255,255,0.05); color: #e2e8f0; }
        .ls-sort-item.active { background: rgba(201,168,76,0.08); color: #c9a84c; font-weight: 600; }

        .ls-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 16px; border-radius: 10px;
          font-size: 12px; font-weight: 600; cursor: pointer;
          transition: all 0.15s; border: 1px solid transparent;
          font-family: 'DM Sans', sans-serif;
        }
        .ls-btn:hover { transform: translateY(-1px); }

        .ls-col-header {
          display: grid; align-items: center;
          padding: 11px 20px;
          grid-template-columns: 28px 1fr 90px 56px;
          gap: 8px; background: #0f1929;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          position: sticky; top: 0; z-index: 10;
        }

        .ls-row {
          display: grid; align-items: center;
          padding: 15px 20px;
          grid-template-columns: 28px 1fr 90px 56px;
          gap: 8px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: background 0.15s;
        }
        .ls-row:last-child { border-bottom: none; }
        .ls-row:hover { background: rgba(255,255,255,0.025); }

        .ls-icon-btn {
          width: 28px; height: 28px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.15s; border: none;
          font-family: 'DM Sans', sans-serif;
        }
        .ls-icon-btn:hover { transform: translateY(-1px); }
      `}</style>

      <div className="ls-wrap">
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

              <div className="relative p-6 sm:p-7">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(135deg,rgba(201,168,76,0.15),rgba(201,168,76,0.05))", border: "1px solid rgba(201,168,76,0.2)" }}>
                      <Link2 size={20} style={{ color: "#c9a84c" }}/>
                    </div>
                    <div>
                      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "20px", color: "#f1f5f9", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                        {t("প্যারেন্ট নেভিগেশন লিংক","Parent Navigation Links")}
                      </h1>
                      <p className="text-xs mt-1" style={{ color: "#475569" }}>
                        {t("শুধুমাত্র প্রধান মেনু নেভিগেশন পরিচালনা করুন।","Manage only main menu navigation.")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button onClick={onRefresh} disabled={loading}
                      className="ls-btn"
                      style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.08)", color: "#94a3b8" }}>
                      <RefreshCw size={13} className={loading ? "animate-spin" : ""}/>
                      <span className="hidden sm:inline">{t("রিফ্রেশ","Refresh")}</span>
                    </button>
                    <button onClick={() => setView("add")}
                      className="ls-btn"
                      style={{ background: "linear-gradient(135deg,rgba(201,168,76,0.2),rgba(201,168,76,0.1))", borderColor: "rgba(201,168,76,0.3)", color: "#e8c876", boxShadow: "0 4px 16px rgba(201,168,76,0.15)" }}>
                      <Plus size={14}/> {t("লিংক যোগ করুন","Add Link")}
                    </button>
                  </div>
                </div>

                {/* stat */}
                <div className="flex gap-3 flex-wrap sm:flex-nowrap">
                  {[
                    { labelBn: "মোট",    labelEn: "Total",    count: links.length,                            color: "#c9a84c" },
                    { labelBn: "সক্রিয়", labelEn: "Active",   count: links.filter(l=>l.isActive).length,     color: "#34d399" },
                    { labelBn: "নিষ্ক্রিয়",labelEn: "Inactive",count: links.filter(l=>!l.isActive).length,   color: "#f87171" },
                  ].map(({ labelBn, labelEn, count, color }) => (
                    <div key={labelEn} className="flex-1 min-w-0 rounded-xl p-3"
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
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#475569" }}/>
                <input type="text"
                  placeholder={t("লিংক খুঁজুন...","Search link...")}
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="ls-search-input"/>
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 transition" style={{ color: "#475569" }}>
                    <X size={13}/>
                  </button>
                )}
              </div>

              <div className="relative sm:w-52" ref={dropdownRef}>
                <button className="ls-sort-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <span style={{ color: "#cbd5e1" }}>
                    {sortOptions.find(o => o.value === sort)?.label}
                  </span>
                  <ChevronDown size={13}/>
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                      className="ls-sort-dropdown absolute right-0 mt-2 w-full z-50">
                      {sortOptions.map(option => (
                        <div key={option.value}
                          className={`ls-sort-item ${sort === option.value ? "active" : ""}`}
                          onClick={() => { setSort(option.value); setDropdownOpen(false); }}>
                          {option.label}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ══ TABLE ══ */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "#0d1426", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>

              <div className="ls-col-header">
                {["#", t("নাম","Name"), t("স্ট্যাটাস","Status"), ""].map((h, i) => (
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
                ) : links.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <Link2 size={24} style={{ color: "#1e293b" }}/>
                    </div>
                    <p className="text-sm font-medium" style={{ color: "#475569" }}>
                      {t("কোনো প্যারেন্ট লিংক পাওয়া যায়নি।","No parent links found.")}
                    </p>
                  </div>
                ) : (
                  links.map((link, index) => (
                    <motion.div key={link._id} className="ls-row"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}>

                      <div className="text-xs font-medium" style={{ color: "#2d3f55" }}>{index + 1}</div>

                      <div className="truncate text-sm font-medium" style={{ color: "#e2e8f0" }}>
                        {link.name}
                      </div>

                      <div>
                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold"
                          style={{
                            background: link.isActive ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
                            color:      link.isActive ? "#34d399" : "#f87171",
                            border:     `1px solid ${link.isActive ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}`,
                          }}>
                          {link.isActive ? t("সক্রিয়","Active") : t("নিষ্ক্রিয়","Inactive")}
                        </span>
                      </div>

                      <div className="flex justify-end items-center gap-1.5">
                        <button className="ls-icon-btn"
                          style={{ background: "rgba(129,140,248,0.08)", color: "#818cf8" }}
                          onClick={() => handleEdit(link)}>
                          <Pencil size={13}/>
                        </button>
                        <button className="ls-icon-btn"
                          style={{ background: "rgba(248,113,113,0.08)", color: "#f87171" }}
                          onClick={() => handleDelete(link)}>
                          <Trash2 size={13}/>
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
    </>
  );
};

export default LinkShow;