import { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  PackageSearch, ArrowRight, Home, ChevronRight,
  Star, ShoppingBag, Bell, Zap, Flame, Trophy
} from "lucide-react";
import PublicProductShow from "./PublicProductShow";
import { useCart } from "../../context/CartContext";
import { useT } from "../../context/LanguageContext";
import NotFoundPage from "./NotFoundPage";
import { SortFilterDropdown, applySortFilter } from "../../components/SortFilter";

const API = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;

function getImage(p) {
  if (p.image?.url) return p.image.url;
  if (typeof p.image === "string" && p.image) return p.image;
  if (Array.isArray(p.images) && p.images[0]) return p.images[0]?.url || p.images[0] || "";
  return "";
}

/* ══════════════════════════
   FEATURED PRODUCT CARD
══════════════════════════ */
function FeaturedCard({ product, index }) {
  const { addToCart } = useCart();
  const t = useT();
  const [added, setAdded] = useState(false);
  const image     = getImage(product);
  const salePrice = product.salePrice ?? product.price;
  const hasDisc   = salePrice < product.price;
  const discPct   = hasDisc ? Math.round((1 - salePrice / product.price) * 100) : 0;
  const inStock   = product.stock > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] transition-all duration-300"
    >
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative h-44 bg-[#f8f8f5] overflow-hidden">
          {image
            ? <img src={image} alt={product.name} className="w-full h-full object-contain p-3 group-hover:scale-[1.05] transition-transform duration-500"/>
            : <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={32} className="text-gray-200"/></div>
          }
          {hasDisc && (
            <div className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded-lg">
              -{discPct}%
            </div>
          )}
          {product.isFeatured && (
            <div className="absolute top-2.5 right-2.5 bg-amber-400 text-white text-[9px] font-black px-2 py-1 rounded-lg flex items-center gap-0.5">
              <Star size={8} fill="white" strokeWidth={0}/> TOP
            </div>
          )}
        </div>
        <div className="p-3.5">
          <p className="text-[12px] font-semibold text-gray-800 line-clamp-2 leading-snug mb-2 min-h-[32px]">{product.name}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[15px] font-black text-gray-900">৳{salePrice.toLocaleString()}</span>
            {hasDisc && <span className="text-[11px] text-gray-400 line-through">৳{product.price.toLocaleString()}</span>}
          </div>
          {salePrice >= 2500 && <p className="text-[10px] text-[#2e7d32] font-semibold mt-0.5">✓ {t("ফ্রি ডেলিভারি", "Free Delivery")}</p>}
        </div>
      </Link>
      <div className="px-3.5 pb-3.5">
        <button
          onClick={() => { if (!inStock || added) return; addToCart({ ...product, salePrice }); setAdded(true); }}
          className={`w-full py-2 rounded-xl text-[11px] font-bold transition-all active:scale-[0.97] ${
            !inStock ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : added  ? "bg-[#2e7d32] text-white"
                     : "bg-[#1a2e1a] hover:bg-[#2e7d32] text-white"
          }`}>
          {!inStock ? t("স্টক নেই", "Out of Stock") : added ? t("✓ যোগ হয়েছে", "✓ Added") : t("কার্টে যোগ করুন", "Add to Cart")}
        </button>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════
   SUGGESTION ROW CARD
══════════════════════════ */
function SuggestionRow({ product, index }) {
  const image     = getImage(product);
  const salePrice = product.salePrice ?? product.price;
  const hasDisc   = salePrice < product.price;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.35 + index * 0.06, duration: 0.4, ease: [0.22,1,0.36,1] }}
    >
      <Link to={`/product/${product.slug}`}
        className="group flex items-center gap-3.5 bg-[#f8faf8] hover:bg-white border border-transparent hover:border-[#c8e6c9] rounded-2xl p-3 transition-all duration-200 hover:shadow-sm">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-gray-100 flex-shrink-0">
          {image
            ? <img src={image} alt={product.name} className="w-full h-full object-contain p-1"/>
            : <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={16} className="text-gray-200"/></div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-gray-700 line-clamp-1">{product.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[12px] font-black text-gray-900">৳{salePrice.toLocaleString()}</span>
            {hasDisc && <span className="text-[10px] text-gray-400 line-through">৳{product.price.toLocaleString()}</span>}
          </div>
        </div>
        <ArrowRight size={13} className="text-gray-300 group-hover:text-[#2e7d32] group-hover:translate-x-0.5 transition-all flex-shrink-0"/>
      </Link>
    </motion.div>
  );
}

/* ══════════════════════════
   EMPTY STATE
══════════════════════════ */
function EmptyState({ title, featuredProducts, suggestions }) {
  const t = useT();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>

      <div className="relative overflow-hidden rounded-3xl mb-10"
        style={{ background: "linear-gradient(135deg, #1a2e1a 0%, #2e5230 50%, #1a3d1a 100%)" }}>
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white opacity-[0.04]"/>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white opacity-[0.03]"/>
        <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-[#4caf50] opacity-[0.08]"/>
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8 px-8 sm:px-12 py-10 sm:py-12">
          <div className="flex-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-5">
              <Zap size={12} className="text-amber-400" fill="#fbbf24"/>
              <span className="text-[11px] font-bold text-white/80 uppercase tracking-widest">
                {t("শীঘ্রই আসছে", "Coming Soon")}
              </span>
            </div>
            <h2 className="text-[26px] sm:text-[32px] font-black text-white leading-tight mb-3">
              {t("এই Category তে", "Products are")} <br/>
              <span className="text-[#81c784]">{t("Products আসছে!", "coming soon!")}</span>
            </h2>
            <p className="text-[13px] text-white/60 leading-relaxed max-w-xs mx-auto sm:mx-0">
              <span className="text-white/90 font-semibold">"{title}"</span> — {t("এ এখনো কোনো product নেই। শীঘ্রই নতুন collection আসছে।", "has no products yet. A new collection is coming soon.")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center sm:justify-start">
              <Link to="/"
                className="inline-flex items-center justify-center gap-2 bg-white text-[#1a2e1a] hover:bg-[#e8f5e9] px-5 py-2.5 rounded-xl text-[13px] font-black transition-colors">
                <Home size={14}/> {t("হোমে যান", "Go to Home")}
              </Link>
              <Link to="/search"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2.5 rounded-xl text-[13px] font-bold transition-colors backdrop-blur-sm">
                {t("পণ্য খুঁজুন", "Search Products")} <ArrowRight size={13}/>
              </Link>
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40">
              <div className="absolute inset-0 bg-white/10 rounded-3xl rotate-6"/>
              <div className="absolute inset-0 bg-white/10 rounded-3xl -rotate-3"/>
              <div className="absolute inset-0 bg-white/20 rounded-3xl flex items-center justify-center">
                <PackageSearch size={56} className="text-white/70" strokeWidth={1.2}/>
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
        className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 mb-10">
        <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
          <Bell size={15} className="text-amber-600"/>
        </div>
        <div>
          <p className="text-[12px] font-black text-amber-800">
            {t("নতুন product আসলে notify পাবেন", "Get notified when new products arrive")}
          </p>
          <p className="text-[11px] text-amber-600 mt-0.5">
            {t("নিয়মিত আমাদের সাইট visit করুন অথবা আমাদের সাথে যোগাযোগ করুন", "Visit our site regularly or contact us to stay updated")}
          </p>
        </div>
      </motion.div>

      {featuredProducts.length > 0 && (
        <motion.section initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }} className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                <Star size={16} className="text-amber-500" fill="#f59e0b"/>
              </div>
              <div>
                <h3 className="text-[15px] font-black text-gray-900">{t("ফিচার্ড পণ্য", "Featured Products")}</h3>
                <p className="text-[11px] text-gray-400">{t("আমাদের সেরা picks", "Our best picks")}</p>
              </div>
            </div>
            <Link to="/" className="text-[11px] font-bold text-[#2e7d32] hover:underline flex items-center gap-1">
              {t("সব দেখুন", "View All")} <ArrowRight size={11}/>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {featuredProducts.map((p, i) => <FeaturedCard key={p._id} product={p} index={i}/>)}
          </div>
        </motion.section>
      )}

      {suggestions.length > 0 && (
        <motion.section initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
          <div className="bg-white rounded-3xl border border-gray-100 p-6" style={{ boxShadow:"0 2px 20px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#e8f5e9] flex items-center justify-center">
                  <ShoppingBag size={16} className="text-[#2e7d32]"/>
                </div>
                <div>
                  <h3 className="text-[15px] font-black text-gray-900">{t("আপনার পছন্দ হতে পারে", "You Might Like")}</h3>
                  <p className="text-[11px] text-gray-400">{t("আমাদের স্টোরের সর্বশেষ পণ্য", "Latest products from our store")}</p>
                </div>
              </div>
              <Link to="/" className="text-[11px] font-bold text-[#2e7d32] hover:underline flex items-center gap-1">
                {t("সব দেখুন", "View All")} <ArrowRight size={11}/>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestions.map((p, i) => <SuggestionRow key={p._id} product={p} index={i}/>)}
            </div>
          </div>
        </motion.section>
      )}
    </motion.div>
  );
}

/* ══════════════════════════
   EXTRA SECTION SKELETON
══════════════════════════ */
function ExtraSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4">
      {[1,2,3,4].map(i => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
          <div className="h-[180px] bg-gray-100" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-gray-100 rounded-full w-4/5" />
            <div className="h-5 bg-gray-100 rounded-full w-2/5" />
            <div className="h-9 bg-gray-100 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════
   MAIN PAGE
════════════════════════════════ */
export default function CategoryPage() {
  const { linkSlug, sublinkSlug } = useParams();
  const location = useLocation();
  const t = useT();

  const [products,         setProducts        ] = useState([]);
  const [title,            setTitle           ] = useState("");
  const [loading,          setLoading         ] = useState(true);
  const [notFound,         setNotFound        ] = useState(false);
  const [suggestions,      setSuggestions     ] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [mostOrdered,      setMostOrdered     ] = useState([]);
  const [mostWishlisted,   setMostWishlisted  ] = useState([]);
  const [loadingExtra,     setLoadingExtra    ] = useState(true);

  const [sort,    setSort   ] = useState("default");
  const [filters, setFilters] = useState({ discount: false, inStock: false, freeDelivery: false });

  /* ── Category products ── */
  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setSort("default");
    setFilters({ discount: false, inStock: false, freeDelivery: false });
    setProducts([]); setSuggestions([]); setFeaturedProducts([]);

    const url = sublinkSlug
      ? `${API}/api/category/${linkSlug}/${sublinkSlug}`
      : `${API}/api/category/${linkSlug}`;

    fetch(url)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setProducts(d.data);
          setTitle(d.title || linkSlug);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [linkSlug, sublinkSlug]);

  /* ── Empty state suggestions ── */
  useEffect(() => {
    if (loading || products.length > 0) return;
    fetch(`${API}/api/products/public`)
      .then(r => r.json())
      .then(d => {
        const all = d.data || [];
        setFeaturedProducts(all.filter(p => p.isFeatured).slice(0, 4));
        setSuggestions(all.filter(p => !p.isFeatured).slice(0, 8));
      })
      .catch(() => {});
  }, [loading, products]);

  /* ── Most ordered & wishlisted ── */
  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/products/most-ordered?limit=8`).then(r => r.json()),
      fetch(`${API}/api/products/most-wishlisted?limit=8`).then(r => r.json()),
    ])
      .then(([ordered, wished]) => {
        if (ordered.success) setMostOrdered(ordered.data);
        if (wished.success)  setMostWishlisted(wished.data);
      })
      .catch(() => {})
      .finally(() => setLoadingExtra(false));
  }, []);

  const displayProducts = useMemo(() =>
    applySortFilter(products, sort, filters),
    [products, sort, filters]
  );

  if (!loading && notFound) return <NotFoundPage />;

  const isEmpty = !loading && products.length === 0;

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb + Title */}
        <motion.div key={location.pathname} initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }}
          className="mb-7">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium mb-3 flex-wrap">
            <Link to="/" className="hover:text-[#2e7d32] transition-colors flex items-center gap-1">
              <Home size={11}/> {t("হোম", "Home")}
            </Link>
            <ChevronRight size={10}/>
            {sublinkSlug ? (
              <>
                <Link to={`/${linkSlug}`} className="hover:text-[#2e7d32] transition-colors capitalize">{linkSlug}</Link>
                <ChevronRight size={10}/>
                <span className="text-gray-600 capitalize">{title}</span>
              </>
            ) : (
              <span className="text-gray-600 capitalize">{title || linkSlug}</span>
            )}
          </div>

          <div className="flex items-end justify-between">
            <h1 className="text-[22px] sm:text-[26px] font-black text-gray-900 capitalize">
              {title || linkSlug}
            </h1>
            {!loading && products.length > 0 && (
              <span className="text-[12px] text-gray-400 font-medium mb-1">
                {t(`${products.length}টি পণ্য`, `${products.length} product${products.length !== 1 ? "s" : ""}`)}
              </span>
            )}
          </div>
          <div className="mt-3 h-[3px] w-16 bg-[#1a2e1a] rounded-full"/>
        </motion.div>

        {/* Sort & Filter */}
        {!loading && !isEmpty && (
          <SortFilterDropdown
            sort={sort} setSort={setSort}
            filters={filters} setFilters={setFilters}
            total={displayProducts.length} t={t}
          />
        )}

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.3 }}>
            {isEmpty ? (
              <EmptyState title={title || linkSlug} featuredProducts={featuredProducts} suggestions={suggestions}/>
            ) : (
              <PublicProductShow products={displayProducts} loading={loading}/>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── সবচেয়ে বেশি বিক্রিত ── */}
        {(loadingExtra || mostOrdered.length > 0) && (
          <motion.section
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Flame size={18} className="text-orange-500" />
              </div>
              <div>
                <h2 className="text-[16px] sm:text-[20px] font-black text-gray-900">
                  {t("সবচেয়ে বেশি বিক্রিত", "Best Selling")}
                </h2>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {t("সবচেয়ে বেশি অর্ডার হওয়া পণ্য", "Most ordered products")}
                </p>
              </div>
            </div>
            {loadingExtra
              ? <ExtraSkeleton />
              : <PublicProductShow products={mostOrdered} loading={false} />
            }
          </motion.section>
        )}

        {/* ── জনপ্রিয় পণ্য ── */}
        {(loadingExtra || mostWishlisted.length > 0) && (
          <motion.section
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-14 pb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Trophy size={18} className="text-amber-500" />
              </div>
              <div>
                <h2 className="text-[16px] sm:text-[20px] font-black text-gray-900">
                  {t("জনপ্রিয় পণ্য", "Most Favorited")}
                </h2>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {t("সবচেয়ে বেশি উইশলিস্টে যোগ করা পণ্য", "Most wishlisted by customers")}
                </p>
              </div>
            </div>
            {loadingExtra
              ? <ExtraSkeleton />
              : <PublicProductShow products={mostWishlisted} loading={false} />
            }
          </motion.section>
        )}

      </div>
    </div>
  );
}