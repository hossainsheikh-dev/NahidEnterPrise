import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ChevronDown, Plus, Pencil, Trash2,
  Loader2, X, Star, Package, RefreshCw,
} from "lucide-react";

const ProductShow = ({
  products, loading,
  search, setSearch,
  sort, setSort, sortOptions,
  dropdownOpen, setDropdownOpen, dropdownRef,
  setView, handleDelete, handleEdit,
  parentLinks, allSublinks,
  onRefresh, t,
}) => {
  const [filterParent,    setFilterParent   ] = useState("");
  const [filterSublink,   setFilterSublink  ] = useState("");
  const [parentDropdown,  setParentDropdown ] = useState(false);
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

  const filteredSublinks    = allSublinks.filter(s => s.parent?._id === filterParent || s.parent === filterParent);
  const selectedParentName  = parentLinks.find(p => p._id === filterParent)?.name;
  const selectedSublinkName = allSublinks.find(s => s._id === filterSublink)?.name;

  const displayedProducts = products.filter(p => {
    const sublinkId = p.sublink?._id || p.sublink;
    const linkId    = p.link?._id    || p.link;
    if (filterSublink) return sublinkId === filterSublink;
    if (filterParent)  return linkId === filterParent;
    return true;
  });

  const clearFilters = () => { setFilterParent(""); setFilterSublink(""); };

  const stockBadge = (stock) => {
    if (stock === 0) return { label: t("শেষ","Out"), color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.2)" };
    if (stock <= 5)  return { label: `${stock} ${t("বাকি","left")}`, color: "#fb923c", bg: "rgba(251,146,60,0.1)", border: "rgba(251,146,60,0.2)" };
    return { label: String(stock), color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.2)" };
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        .ps-wrap * { box-sizing: border-box; }
        .ps-wrap { font-family: 'DM Sans', sans-serif; }

        .ps-search-input {
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
          padding: 11px 16px 11px 40px; font-size: 13px; color: #e2e8f0;
          outline: none; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
        }
        .ps-search-input::placeholder { color: #475569; }
        .ps-search-input:focus { border-color: rgba(201,168,76,0.35); background: rgba(201,168,76,0.03); }

        .ps-dd-btn {
          display: flex; align-items: center; justify-content: space-between; gap: 8px;
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 11px;
          padding: 10px 13px; font-size: 12px; color: #94a3b8;
          cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif;
        }
        .ps-dd-btn:hover { border-color: rgba(255,255,255,0.15); color: #cbd5e1; }
        .ps-dd-btn.active { color: #c9a84c; border-color: rgba(201,168,76,0.25); font-weight: 600; }

        .ps-dropdown {
          background: #1a2235; border: 1px solid rgba(255,255,255,0.09);
          border-radius: 14px; overflow: hidden; box-shadow: 0 16px 48px rgba(0,0,0,0.5);
        }
        .ps-dd-item { padding: 10px 16px; font-size: 12px; color: #94a3b8; cursor: pointer; transition: all 0.12s; }
        .ps-dd-item:hover { background: rgba(255,255,255,0.05); color: #e2e8f0; }
        .ps-dd-item.active { background: rgba(201,168,76,0.08); color: #c9a84c; font-weight: 600; }

        .ps-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 16px; border-radius: 10px;
          font-size: 12px; font-weight: 600; cursor: pointer;
          transition: all 0.15s; border: 1px solid transparent;
          font-family: 'DM Sans', sans-serif;
        }
        .ps-btn:hover { transform: translateY(-1px); }

        .ps-col-header {
          display: grid; align-items: center; padding: 11px 20px;
          grid-template-columns: 28px 44px 1fr 72px 80px 56px;
          gap: 8px; background: #0f1929;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          position: sticky; top: 0; z-index: 10;
        }

        .ps-row {
          display: grid; align-items: center; padding: 12px 20px;
          grid-template-columns: 28px 44px 1fr 72px 80px 56px;
          gap: 8px;
          border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.15s;
        }
        .ps-row:last-child { border-bottom: none; }
        .ps-row:hover { background: rgba(255,255,255,0.025); }

        .ps-icon-btn {
          width: 28px; height: 28px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.15s; border: none;
          font-family: 'DM Sans', sans-serif;
        }
        .ps-icon-btn:hover { transform: translateY(-1px); }
      `}</style>

      <div className="ps-wrap">
        <AnimatePresence mode="wait">
          <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-4">

            {/* ══ HEADER CARD ══ */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative rounded-2xl overflow-hidden"
              style={{ background: "linear-gradient(135deg,#0d1426 0%,#111827 50%,#0f172a 100%)", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>

              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg,transparent,rgba(201,168,76,0.6) 30%,rgba(139,92,246,0.6) 70%,transparent)" }}/>
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
                backgroundSize: "32px 32px",
              }}/>
              <div className="absolute pointer-events-none" style={{ top: "-60px", right: "-40px", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle,rgba(201,168,76,0.07) 0%,transparent 70%)" }}/>

              <div className="relative p-6 sm:p-7">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(135deg,rgba(201,168,76,0.15),rgba(201,168,76,0.05))", border: "1px solid rgba(201,168,76,0.2)" }}>
                      <Package size={20} style={{ color: "#c9a84c" }}/>
                    </div>
                    <div>
                      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "20px", color: "#f1f5f9", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                        {t("পণ্য তালিকা","Products")}
                      </h1>
                      <p className="text-xs mt-1" style={{ color: "#475569" }}>
                        {t("আপনার পণ্য পরিচালনা করুন।","Manage your products.")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button onClick={onRefresh} disabled={loading} className="ps-btn"
                      style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.08)", color: "#94a3b8" }}>
                      <RefreshCw size={13} className={loading ? "animate-spin" : ""}/>
                      <span className="hidden sm:inline">{t("রিফ্রেশ","Refresh")}</span>
                    </button>
                    <button onClick={() => setView("add")} className="ps-btn"
                      style={{ background: "linear-gradient(135deg,rgba(201,168,76,0.2),rgba(201,168,76,0.1))", borderColor: "rgba(201,168,76,0.3)", color: "#e8c876", boxShadow: "0 4px 16px rgba(201,168,76,0.15)" }}>
                      <Plus size={14}/> {t("পণ্য যোগ করুন","Add Product")}
                    </button>
                  </div>
                </div>

                {/* stat cards */}
                <div className="flex gap-3 flex-wrap sm:flex-nowrap">
                  {[
                    { labelBn: "মোট",     labelEn: "Total",    count: products.length,                          color: "#c9a84c" },
                    { labelBn: "সক্রিয়",  labelEn: "Active",   count: products.filter(p=>p.isActive).length,   color: "#34d399" },
                    { labelBn: "ফিচার্ড", labelEn: "Featured", count: products.filter(p=>p.isFeatured).length, color: "#fbbf24" },
                    { labelBn: "স্টক শেষ",labelEn: "Out",      count: products.filter(p=>(p.stock??0)===0).length, color: "#f87171" },
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
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
              {/* search */}
              <div className="relative flex-1 min-w-0">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#475569" }}/>
                <input type="text" placeholder={t("পণ্য খুঁজুন...","Search product...")}
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="ps-search-input"/>
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 transition" style={{ color: "#475569" }}>
                    <X size={13}/>
                  </button>
                )}
              </div>

              {/* parent filter */}
              <div className="relative sm:w-44" ref={parentRef}>
                <button className={`ps-dd-btn ${filterParent ? "active" : ""}`} onClick={() => setParentDropdown(!parentDropdown)}>
                  <span style={{ color: filterParent ? "#c9a84c" : "#64748b" }}>
                    {selectedParentName || t("লিংক ফিল্টার","Filter by Link")}
                  </span>
                  <ChevronDown size={13}/>
                </button>
                <AnimatePresence>
                  {parentDropdown && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                      className="ps-dropdown absolute right-0 mt-2 w-full z-50 max-h-52 overflow-y-auto">
                      <div className={`ps-dd-item ${!filterParent ? "active" : ""}`}
                        style={{ fontStyle: "italic" }}
                        onClick={() => { setFilterParent(""); setFilterSublink(""); setParentDropdown(false); }}>
                        — {t("সব","All")} —
                      </div>
                      {parentLinks.map(p => (
                        <div key={p._id}
                          className={`ps-dd-item ${filterParent === p._id ? "active" : ""}`}
                          onClick={() => { setFilterParent(p._id); setFilterSublink(""); setParentDropdown(false); }}>
                          {p.name}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* sublink filter */}
              {filterParent && (
                <div className="relative sm:w-44" ref={sublinkRef}>
                  <button className={`ps-dd-btn ${filterSublink ? "active" : ""}`} onClick={() => setSublinkDropdown(!sublinkDropdown)}>
                    <span style={{ color: filterSublink ? "#c9a84c" : "#64748b" }}>
                      {selectedSublinkName || t("সাবলিংক ফিল্টার","Filter by Sublink")}
                    </span>
                    <ChevronDown size={13}/>
                  </button>
                  <AnimatePresence>
                    {sublinkDropdown && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                        className="ps-dropdown absolute right-0 mt-2 w-full z-50 max-h-52 overflow-y-auto">
                        {filteredSublinks.length > 0 ? filteredSublinks.map(s => (
                          <div key={s._id}
                            className={`ps-dd-item ${filterSublink === s._id ? "active" : ""}`}
                            onClick={() => { setFilterSublink(s._id); setSublinkDropdown(false); }}>
                            {s.name}
                          </div>
                        )) : (
                          <div className="ps-dd-item" style={{ fontStyle: "italic" }}>
                            {t("কোনো সাবলিংক পাওয়া যায়নি।","No sublinks found.")}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* sort */}
              <div className="relative sm:w-44" ref={dropdownRef}>
                <button className="ps-dd-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <span style={{ color: "#cbd5e1" }}>{sortOptions.find(o => o.value === sort)?.label}</span>
                  <ChevronDown size={13}/>
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                      className="ps-dropdown absolute right-0 mt-2 w-full z-50">
                      {sortOptions.map(option => (
                        <div key={option.value}
                          className={`ps-dd-item ${sort === option.value ? "active" : ""}`}
                          onClick={() => { setSort(option.value); setDropdownOpen(false); }}>
                          {option.label}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {(filterParent || filterSublink) && (
                <button onClick={clearFilters} className="ps-btn"
                  style={{ background: "rgba(248,113,113,0.08)", borderColor: "rgba(248,113,113,0.15)", color: "#f87171" }}>
                  <X size={12}/> {t("ক্লিয়ার","Clear")}
                </button>
              )}
            </div>

            {/* ══ TABLE ══ */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "#0d1426", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>

              <div className="ps-col-header">
                {["#", t("ছবি","Img"), t("নাম","Name"), t("স্টক","Stock"), t("স্ট্যাটাস","Status"), ""].map((h, i) => (
                  <div key={i} className={`text-[10px] font-semibold uppercase tracking-wider ${i === 2 ? "" : ""}`} style={{ color: "#2d3f55" }}>{h}</div>
                ))}
              </div>

              <div className="overflow-y-auto" style={{ maxHeight: "60vh" }}>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)" }}>
                      <Loader2 size={20} className="animate-spin" style={{ color: "#c9a84c" }}/>
                    </div>
                    <p className="text-xs font-medium" style={{ color: "#475569" }}>{t("পণ্য লোড হচ্ছে…","Loading products…")}</p>
                  </div>
                ) : displayedProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <Package size={24} style={{ color: "#1e293b" }}/>
                    </div>
                    <p className="text-sm font-medium" style={{ color: "#475569" }}>
                      {t("কোনো পণ্য পাওয়া যায়নি।","No products found.")}
                    </p>
                  </div>
                ) : (
                  displayedProducts.map((product, index) => {
                    const sb = stockBadge(product.stock ?? 0);
                    return (
                      <motion.div key={product._id} className="ps-row"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}>

                        <div className="flex items-center gap-1" style={{ color: "#2d3f55", fontSize: "12px", fontWeight: 500 }}>
                          {index + 1}
                          {product.isFeatured && <Star size={9} style={{ color: "#fbbf24", fill: "#fbbf24" }}/>}
                        </div>

                        <div>
                          {product.images?.[0] ? (
                            <img src={product.images[0].url} alt={product.name}
                              className="w-9 h-9 object-contain rounded-lg p-0.5"
                              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}/>
                          ) : (
                            <div className="w-9 h-9 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}/>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium" style={{ color: "#e2e8f0" }}>{product.name}</div>
                          {product.discountType && product.discountType !== "none" && (
                            <div className="text-[10px] mt-0.5" style={{ color: "#34d399" }}>
                              {product.discountType === "percent" ? `${product.discountValue}% off` : `৳${product.discountValue} off`}
                            </div>
                          )}
                        </div>

                        <div>
                          <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold"
                            style={{ background: sb.bg, color: sb.color, border: `1px solid ${sb.border}` }}>
                            {sb.label}
                          </span>
                        </div>

                        <div>
                          <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold"
                            style={{
                              background: product.isActive ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
                              color:      product.isActive ? "#34d399" : "#f87171",
                              border:     `1px solid ${product.isActive ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}`,
                            }}>
                            {product.isActive ? t("সক্রিয়","Active") : t("নিষ্ক্রিয়","Inactive")}
                          </span>
                        </div>

                        <div className="flex justify-end items-center gap-1.5">
                          <button className="ps-icon-btn"
                            style={{ background: "rgba(129,140,248,0.08)", color: "#818cf8" }}
                            onClick={() => handleEdit(product)}>
                            <Pencil size={13}/>
                          </button>
                          <button className="ps-icon-btn"
                            style={{ background: "rgba(248,113,113,0.08)", color: "#f87171" }}
                            onClick={() => handleDelete(product)}>
                            <Trash2 size={13}/>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
};

export default ProductShow;