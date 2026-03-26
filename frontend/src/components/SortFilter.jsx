import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, ChevronDown, X, Check } from "lucide-react";

export function applySortFilter(products, sort, filters) {
  let list = [...products];
  if (filters.discount)     list = list.filter(p => p.discountType !== "none" && p.discountValue > 0);
  if (filters.inStock)      list = list.filter(p => p.stock > 0);
  if (filters.freeDelivery) list = list.filter(p => (p.salePrice ?? p.price) >= 2500);
  if (sort === "price_asc")  list.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
  if (sort === "price_desc") list.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
  if (sort === "newest")     list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return list;
}

export function SortFilterDropdown({ sort, setSort, filters, setFilters, total, t }) {
  const [sortOpen,   setSortOpen  ] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const SORT_OPTIONS = [
    { value: "default",    labelBn: "ডিফল্ট",          labelEn: "Default"           },
    { value: "price_asc",  labelBn: "দাম: কম → বেশি",  labelEn: "Price: Low → High" },
    { value: "price_desc", labelBn: "দাম: বেশি → কম",  labelEn: "Price: High → Low" },
    { value: "newest",     labelBn: "নতুন আগে",         labelEn: "Newest First"      },
  ];

  const FILTER_OPTIONS = [
    { key: "discount",     labelBn: "ডিসকাউন্ট আছে",  labelEn: "Has Discount",  icon: "🏷️" },
    { key: "inStock",      labelBn: "স্টকে আছে",       labelEn: "In Stock",      icon: "✅" },
    { key: "freeDelivery", labelBn: "ফ্রি ডেলিভারি",   labelEn: "Free Delivery", icon: "🚚" },
  ];

  const activeFilters = Object.values(filters).filter(Boolean).length;
  const currentSort   = SORT_OPTIONS.find(o => o.value === sort);
  const isSortActive  = sort !== "default";

  const clearFilters = () => setFilters({ discount: false, inStock: false, freeDelivery: false });
  const clearSort    = () => setSort("default");

  return (
    <div className="flex items-center justify-between mb-6 gap-3">

      {/* ── LEFT: Sort ── */}
      <div className="relative">
        <button
          onClick={() => { setSortOpen(p => !p); setFilterOpen(false); }}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[12px] font-bold border-2 transition-all duration-200 ${
            isSortActive
              ? "bg-[#1a2e1a] text-white border-[#1a2e1a] shadow-[0_4px_16px_rgba(26,46,26,0.3)]"
              : "bg-white text-gray-700 border-gray-200 hover:border-[#1a2e1a] hover:text-[#1a2e1a]"
          }`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M3 6h18M7 12h10M11 18h2"/>
          </svg>
          <span>{t(currentSort?.labelBn, currentSort?.labelEn)}</span>
          {isSortActive && (
            <span onClick={(e) => { e.stopPropagation(); clearSort(); }}
              className="w-4 h-4 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors">
              <X size={9} />
            </span>
          )}
          <ChevronDown size={13} className={`transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {sortOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setSortOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className="absolute left-0 top-full mt-2 w-56 bg-white rounded-2xl z-50 overflow-hidden"
                style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.06)" }}
              >
                <div className="px-4 py-3 border-b border-gray-50"
                  style={{ background: "linear-gradient(135deg,#1a2e1a,#2e5230)" }}>
                  <p className="text-[11px] font-black text-white/80 uppercase tracking-widest flex items-center gap-1.5">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M3 6h18M7 12h10M11 18h2"/>
                    </svg>
                    {t("সাজানো", "Sort By")}
                  </p>
                </div>
                <div className="p-2">
                  {SORT_OPTIONS.map((opt, i) => (
                    <button key={opt.value}
                      onClick={() => { setSort(opt.value); setSortOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[12px] font-medium transition-all ${
                        sort === opt.value
                          ? "bg-[#1a2e1a] text-white font-bold"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}>
                      <span>{t(opt.labelBn, opt.labelEn)}</span>
                      {sort === opt.value
                        ? <Check size={13} />
                        : <span className="text-[10px] text-gray-300 font-normal">{i + 1}</span>
                      }
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* ── CENTER: Count ── */}
      <span className="text-[11px] text-gray-400 font-medium hidden sm:block">
        {t(`${total}টি পণ্য`, `${total} products`)}
      </span>

      {/* ── RIGHT: Filter ── */}
      <div className="relative">
        <button
          onClick={() => { setFilterOpen(p => !p); setSortOpen(false); }}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[12px] font-bold border-2 transition-all duration-200 ${
            activeFilters > 0
              ? "bg-[#1a2e1a] text-white border-[#1a2e1a] shadow-[0_4px_16px_rgba(26,46,26,0.3)]"
              : "bg-white text-gray-700 border-gray-200 hover:border-[#1a2e1a] hover:text-[#1a2e1a]"
          }`}>
          <SlidersHorizontal size={14} />
          <span>{t("ফিল্টার", "Filter")}</span>
          {activeFilters > 0 && (
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black">
              {activeFilters}
            </span>
          )}
          <ChevronDown size={13} className={`transition-transform duration-200 ${filterOpen ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {filterOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setFilterOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl z-50 overflow-hidden"
                style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.06)" }}
              >
                <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between"
                  style={{ background: "linear-gradient(135deg,#1a2e1a,#2e5230)" }}>
                  <p className="text-[11px] font-black text-white/80 uppercase tracking-widest flex items-center gap-1.5">
                    <SlidersHorizontal size={11} color="white" />
                    {t("ফিল্টার", "Filter")}
                  </p>
                  {activeFilters > 0 && (
                    <button onClick={clearFilters}
                      className="text-[10px] font-bold text-white/60 hover:text-white transition-colors flex items-center gap-1">
                      <X size={10} /> {t("রিসেট", "Reset")}
                    </button>
                  )}
                </div>
                <div className="p-3 space-y-1.5">
                  {FILTER_OPTIONS.map(opt => (
                    <button key={opt.key}
                      onClick={() => setFilters(prev => ({ ...prev, [opt.key]: !prev[opt.key] }))}
                      className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-[12px] font-medium transition-all ${
                        filters[opt.key]
                          ? "bg-[#e8f5e9] border border-[#a5d6a7]"
                          : "bg-gray-50 border border-transparent hover:bg-gray-100"
                      }`}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{opt.icon}</span>
                        <span className={filters[opt.key] ? "text-[#1a2e1a] font-bold" : "text-gray-600"}>
                          {t(opt.labelBn, opt.labelEn)}
                        </span>
                      </div>
                      <div className={`relative w-9 h-5 rounded-full transition-all duration-300 flex-shrink-0 ${
                        filters[opt.key] ? "bg-[#2e7d32]" : "bg-gray-200"
                      }`}>
                        <motion.div
                          animate={{ x: filters[opt.key] ? 16 : 2 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
                        />
                      </div>
                    </button>
                  ))}
                </div>
                {activeFilters > 0 && (
                  <div className="px-4 pb-3">
                    <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#f0f7f0] border border-[#c8e6c9]">
                      <p className="text-[11px] font-bold text-[#2e7d32]">
                        {t(`${activeFilters}টি ফিল্টার চালু`, `${activeFilters} filter${activeFilters > 1 ? "s" : ""} active`)}
                      </p>
                      <p className="text-[11px] text-gray-500 font-medium">
                        {t(`${total}টি পণ্য`, `${total} products`)}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}