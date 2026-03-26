import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Package, ShoppingCart, Star, TrendingUp, Users, Zap } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useT } from "../../context/LanguageContext";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function getImage(p) {
  if (p.image?.url)                              return p.image.url;
  if (typeof p.image === "string" && p.image)    return p.image;
  if (Array.isArray(p.images) && p.images.length > 0)
    return p.images[0]?.url || p.images[0] || "";
  return "";
}
function getSalePrice(p) {
  if (p.salePrice && p.salePrice < p.price) return p.salePrice;
  let sp = p.price;
  if (p.discountType === "percentage" && p.discountValue > 0)
    sp = Math.round(p.price * (1 - p.discountValue / 100));
  else if (p.discountType === "fixed" && p.discountValue > 0)
    sp = Math.max(0, p.price - p.discountValue);
  return sp;
}

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden animate-pulse border border-gray-200 flex flex-col">
      <div className="h-[180px] sm:h-[220px] md:h-[260px] bg-gray-100"/>
      <div className="p-2.5 sm:p-3 space-y-2 flex-1">
        <div className="h-2 bg-gray-100 rounded w-1/3"/>
        <div className="h-3 bg-gray-100 rounded w-4/5"/>
        <div className="h-3 bg-gray-100 rounded w-3/5"/>
        <div className="h-5 bg-gray-100 rounded w-2/5 mt-2"/>
        <div className="h-9 bg-gray-100 rounded-lg w-full mt-2"/>
      </div>
    </div>
  );
}

function StarRating({ rating = 4, count = 24 }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1,2,3,4,5].map(s => (
          <Star key={s} size={9}
            className={s <= rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}/>
        ))}
      </div>
      <span className="text-[10px] text-gray-400">({count})</span>
    </div>
  );
}

function ProductCard({ product, delay = 0 }) {
  const { addToCart } = useCart();
  const navigate      = useNavigate();
  const t             = useT();
  const [added, setAdded] = useState(false);

  const image      = getImage(product);
  const salePrice  = getSalePrice(product);
  const inStock    = product.stock > 0;
  const isLowStock = inStock && product.stock <= 5;
  const isNew = (() => {
    const d = new Date(product.createdAt);
    return (Date.now() - d) / 86400000 <= 14;
  })();

  const handleCart = (e) => {
    e.preventDefault();
    if (!inStock) return;
    if (added) { navigate("/cart"); return; }
    addToCart({ ...product, salePrice });
    setAdded(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className="group bg-white rounded-lg border border-gray-200 hover:border-gray-300 overflow-hidden flex flex-col hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300"
    >
      <Link to={`/product/${product.slug}`} className="flex flex-col flex-1 min-h-0">
        <div className="relative h-[180px] sm:h-[220px] md:h-[260px] overflow-hidden bg-white flex-shrink-0">
          {image
            ? <img src={image} alt={product.name}
                className="w-full h-full object-contain p-2 group-hover:scale-[1.03] transition-transform duration-500"/>
            : <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <Package size={36} className="text-gray-300"/>
              </div>
          }
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {!inStock && (
              <span className="text-[9px] font-bold bg-gray-800 text-white px-2 py-0.5 rounded uppercase tracking-wide">
                {t("স্টক শেষ", "Sold Out")}
              </span>
            )}
            {isLowStock && (
              <span className="text-[9px] font-bold bg-red-500 text-white px-2 py-0.5 rounded uppercase tracking-wide flex items-center gap-0.5">
                <Zap size={7} fill="white" strokeWidth={0}/>
                {t(`মাত্র ${product.stock}টি বাকি`, `${product.stock} left`)}
              </span>
            )}
            {isNew && inStock && !isLowStock && (
              <span className="text-[9px] font-bold bg-[#2e7d32] text-white px-2 py-0.5 rounded uppercase tracking-wide">
                {t("নতুন", "New")}
              </span>
            )}
          </div>
        </div>

        <div className="p-2.5 sm:p-3 flex flex-col gap-1.5 flex-1">
          <StarRating/>
          <p className="text-[12px] sm:text-[13px] text-gray-800 font-medium leading-snug line-clamp-2 flex-1 min-h-[32px] sm:min-h-[36px]">
            {product.name}
          </p>
          <div className="flex flex-col gap-0.5 mt-0.5">
            {product.discountType !== "none" && product.discountValue > 0 ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded">
                    {product.discountType === "percent"
                      ? `-${product.discountValue}%`
                      : `-৳${product.discountValue}`}
                  </span>
                  <span className="text-[12px] sm:text-[13px] font-bold text-red-400 line-through">
                    ৳{Number(product.price).toLocaleString()}
                  </span>
                </div>
                <span className="text-[14px] sm:text-[16px] font-bold text-gray-900">
                  ৳{Number(salePrice).toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-[14px] sm:text-[16px] font-bold text-gray-900">
                ৳{Number(product.price).toLocaleString()}
              </span>
            )}
          </div>
          {salePrice >= 2500 && (
            <p className="text-[10px] text-[#2e7d32] font-medium -mt-0.5">
              {t("ফ্রি ডেলিভারি", "Free Delivery")}
            </p>
          )}
        </div>
      </Link>

      <div className="px-2.5 sm:px-3 pb-2.5 sm:pb-3">
        <button onClick={handleCart} disabled={!inStock}
          className={`mt-1.5 w-full flex items-center justify-center gap-1.5 py-2 sm:py-2.5 rounded-lg text-[11px] sm:text-[12px] font-semibold transition-all duration-250 active:scale-[0.97] ${
            !inStock  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : added   ? "bg-[#2e7d32] text-white"
                      : "bg-[#1a2e1a] text-white hover:bg-[#2e7d32]"
          }`}>
          <ShoppingCart size={13} strokeWidth={2}/>
          {!inStock
            ? t("স্টক নেই", "Out of Stock")
            : added
            ? t("🛒 কার্টে যান", "🛒 Go to Cart")
            : t("কার্টে যোগ করুন", "Add to Cart")
          }
        </button>
      </div>
    </motion.div>
  );
}

function SectionHeading({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-[#e8f5e9] flex items-center justify-center text-[#2e7d32] flex-shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="text-[15px] font-black text-gray-900">{title}</h2>
        {subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const t = useT();
  const q = searchParams.get("q") || "";

  const [results,     setResults    ] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [trending,    setTrending   ] = useState([]);
  const [loading,     setLoading    ] = useState(false);
  const [searched,    setSearched   ] = useState(false);

  useEffect(() => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true); setSearched(false);
    fetch(`${API}/api/search?q=${encodeURIComponent(q.trim())}&limit=40`)
      .then(r => r.json())
      .then(d => { setResults(d.success ? d.data : []); setSearched(true); })
      .catch(() => { setResults([]); setSearched(true); })
      .finally(() => setLoading(false));
  }, [q]);

  useEffect(() => {
    fetch(`${API}/api/products/public?limit=8`)
      .then(r => r.json())
      .then(d => {
        const all  = d.data || d.products || [];
        const ids  = new Set(results.map(p => String(p._id)));
        const rest = all.filter(p => !ids.has(String(p._id)));
        setSuggestions(rest.slice(0, 4));
        setTrending(rest.slice(4, 8));
      })
      .catch(() => {});
  }, [results]);

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        <AnimatePresence mode="wait">

          {/* Loading */}
          {loading && (
            <motion.div key="loading" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 mb-10">
                {Array.from({ length: 8 }).map((_,i) => <ProductSkeleton key={i}/>)}
              </div>
            </motion.div>
          )}

          {/* Results found */}
          {!loading && searched && results.length > 0 && (
            <motion.div key="found" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h1 className="text-[18px] font-black text-gray-900">
                    {t(
                      <>"<span className="text-[#1a2e1a]">{q}</span>" এর ফলাফল</>,
                      <>Results for "<span className="text-[#1a2e1a]">{q}</span>"</>
                    )}
                  </h1>
                  <p className="text-[12px] text-gray-400 mt-0.5">
                    {t(
                      `${results.length}টি পণ্য পাওয়া গেছে`,
                      `${results.length} product${results.length > 1 ? "s" : ""} found`
                    )}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 mb-12">
                {results.map((p, i) => <ProductCard key={p._id} product={p} delay={i * 0.04}/>)}
              </div>
            </motion.div>
          )}

          {/* Not found */}
          {!loading && searched && results.length === 0 && (
            <motion.div key="empty" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="text-center py-16 mb-10">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-[18px] font-black text-gray-800 mb-2">
                {t(
                  <>"<span className="text-[#1a2e1a]">{q}</span>" এর কোনো ফলাফল নেই</>,
                  <>No results for "<span className="text-[#1a2e1a]">{q}</span>"</>
                )}
              </h2>
              <p className="text-[13px] text-gray-400 mb-6">
                {t("পুরো শব্দ দিয়ে search করুন", "Try searching with a full word")}
              </p>
              <button onClick={() => setSearchParams({})}
                className="inline-flex items-center gap-2 bg-[#1a2e1a] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold hover:bg-[#2e7d32] transition-colors">
                <X size={13}/> {t("সার্চ মুছুন", "Clear Search")}
              </button>
            </motion.div>
          )}

          {/* Empty query */}
          {!loading && !q && (
            <motion.div key="idle" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="text-center py-16 mb-10">
              <Search size={52} strokeWidth={1} className="text-gray-200 mx-auto mb-4"/>
              <p className="text-[15px] font-bold text-gray-500">
                {t("যেকোনো কিছু খুঁজুন", "Search for anything")}
              </p>
              <p className="text-[12px] text-gray-400 mt-1">
                {t("পণ্যের নাম লিখুন এবং Enter চাপুন", "Type a product name and press Enter")}
              </p>
            </motion.div>
          )}

        </AnimatePresence>

        {/* People Also Buy */}
        {suggestions.length > 0 && (
          <motion.section initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }} className="mb-8">
            <div className="bg-white rounded-3xl p-6 border border-gray-100" style={{ boxShadow:"0 2px 20px rgba(0,0,0,0.04)" }}>
              <SectionHeading
                icon={<Users size={16}/>}
                title={t("অন্যরাও কিনছেন", "People Also Buy")}
                subtitle={t("অন্যরা এই পণ্যগুলো কিনছেন", "Others are buying these products")}
              />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4">
                {suggestions.map((p, i) => <ProductCard key={p._id} product={p} delay={i * 0.06}/>)}
              </div>
            </div>
          </motion.section>
        )}

        {/* Trending Now */}
        {trending.length > 0 && (
          <motion.section initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}>
            <div className="bg-white rounded-3xl p-6 border border-gray-100" style={{ boxShadow:"0 2px 20px rgba(0,0,0,0.04)" }}>
              <SectionHeading
                icon={<TrendingUp size={16}/>}
                title={t("এখন ট্রেন্ডিং", "Trending Now")}
                subtitle={t("এই মুহূর্তে সবচেয়ে জনপ্রিয়", "Most popular right now")}
              />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4">
                {trending.map((p, i) => <ProductCard key={p._id} product={p} delay={i * 0.06}/>)}
              </div>
            </div>
          </motion.section>
        )}

      </div>
    </div> 
  );
}