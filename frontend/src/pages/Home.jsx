import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingCart, Heart, Package, ArrowRight,
  Flame, Trophy,
} from "lucide-react";
import HeroBanner from "./public/HeroBanner";
import { useT } from "../context/LanguageContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { SortFilterDropdown, applySortFilter } from "../components/SortFilter";

const API          = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;
const ITEMS_PER_PAGE = 12;

/* ════════════════════════════════
   HOME PRODUCT CARD
════════════════════════════════ */
function HomeProductCard({ product, index }) {
  const { addToCart }                = useCart();
  const { toggleWishlist, isWished } = useWishlist();
  const navigate                     = useNavigate();
  const t                            = useT();
  const [added, setAdded]            = useState(false);

  const hasDiscount = product.discountType !== "none" && product.discountValue > 0;
  const salePrice   = product.salePrice ?? product.price;
  const inStock     = Number(product.stock) > 0; // ✅ FIX
  const wished      = isWished(product._id);
  const image       = product.images?.[0]?.url || product.image || "";

  const handleCart = (e) => {
    e.stopPropagation();
    if (!inStock) return;
    if (added) { navigate("/cart"); return; }
    addToCart(product);
    setAdded(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (index % ITEMS_PER_PAGE) * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 overflow-hidden flex flex-col hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] transition-all duration-300 cursor-pointer"
      onClick={() => navigate(`/product/${product.slug}`)}
    >
      <div className="relative overflow-hidden bg-[#f8f8f5] flex-shrink-0"
        style={{ height: "clamp(160px, 22vw, 260px)" }}>
        {image
          ? <img src={image} alt={product.name} loading="lazy"
              className="w-full h-full object-contain p-3 group-hover:scale-[1.05] transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center"><Package size={36} className="text-gray-200" /></div>
        }

        <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(248,248,245,0.8), transparent)" }} />

        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {!inStock && (
            <span className="text-[9px] font-black bg-gray-800/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg uppercase">
              {t("স্টক শেষ", "Sold Out")}
            </span>
          )}
          {hasDiscount && inStock && (
            <span className="text-[9px] font-black bg-red-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg">
              {product.discountType === "percent" ? `-${product.discountValue}%` : `-৳${product.discountValue}`}
            </span>
          )}
        </div>

        <button onClick={(e) => { e.stopPropagation(); toggleWishlist(product._id); }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-xl flex items-center justify-center shadow-sm backdrop-blur-sm transition-all duration-200 opacity-0 group-hover:opacity-100 ${
            wished ? "bg-red-50/95 text-red-500 opacity-100" : "bg-white/90 text-gray-400 hover:text-red-400"
          }`}>
          <Heart size={14} fill={wished ? "currentColor" : "none"} strokeWidth={1.8} />
        </button>
      </div>

      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p className="text-[12px] sm:text-[13px] text-gray-800 font-semibold leading-snug line-clamp-2 flex-1 min-h-[32px] sm:min-h-[36px] group-hover:text-[#1a2e1a] transition-colors">
          {product.name}
        </p>
        <div className="flex items-end gap-2 flex-wrap">
          <span className="text-[15px] sm:text-[17px] font-black text-gray-900 leading-none">
            ৳{Number(salePrice).toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-[11px] text-gray-400 line-through leading-none mb-0.5">
              ৳{Number(product.price).toLocaleString()}
            </span>
          )}
        </div>
        {salePrice >= 2500 && (
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32]" />
            <p className="text-[10px] text-[#2e7d32] font-semibold">{t("ফ্রি ডেলিভারি", "Free Delivery")}</p>
          </div>
        )}
        <motion.button whileTap={{ scale: 0.97 }}
          onClick={handleCart} disabled={!inStock}
          className={`mt-1 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] sm:text-[12px] font-bold transition-all duration-200 ${
            !inStock  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : added   ? "bg-[#2e7d32] text-white shadow-[0_4px_12px_rgba(46,125,50,0.3)]"
                      : "bg-[#1a2e1a] text-white hover:bg-[#2e7d32] hover:shadow-[0_4px_12px_rgba(46,125,50,0.25)]"
          }`}>
          <ShoppingCart size={13} strokeWidth={2} />
          {!inStock ? t("স্টক নেই", "Out of Stock") : added ? t("🛒 কার্টে যান", "🛒 Go to Cart") : t("কার্টে যোগ করুন", "Add to Cart")}
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════
   SECTION HEADER
════════════════════════════════ */
function SectionHeader({ icon, titleBn, titleEn, subtitleBn, subtitleEn, showAllTo, t }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#1a2e1a10] flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div>
          <h2 className="text-[16px] sm:text-[20px] font-black text-gray-900">{t(titleBn, titleEn)}</h2>
          {subtitleBn && <p className="text-[11px] text-gray-400 mt-0.5">{t(subtitleBn, subtitleEn)}</p>}
        </div>
      </div>
      {showAllTo && (
        <Link to={showAllTo} className="flex items-center gap-1 text-[12px] font-bold text-[#2e7d32] hover:underline underline-offset-4">
          {t("সব দেখুন", "View All")} <ArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}

/* ════════════════════════════════
   SKELETON
════════════════════════════════ */
function Skeletons({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
          <div className="bg-gray-100 flex-shrink-0" style={{ height: "clamp(160px, 22vw, 260px)" }} />
          <div className="p-3 space-y-2.5">
            <div className="h-3 bg-gray-100 rounded-full w-4/5" />
            <div className="h-3 bg-gray-100 rounded-full w-3/5" />
            <div className="h-5 bg-gray-100 rounded-full w-2/5" />
            <div className="h-9 bg-gray-100 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════
   SPINNER
════════════════════════════════ */
function PageSpinner({ t }) {
  return (
    <div className="flex flex-col items-center justify-center py-28 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-gray-100" />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#2e7d32]"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <p className="text-[13px] text-gray-400 font-medium">
        {t("পণ্য লোড হচ্ছে...", "Loading products...")}
      </p>
    </div>
  );
}

/* ════════════════════════════════
   LAZY PRODUCT GRID
════════════════════════════════ */
function LazyProductGrid({ products, t }) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [loadingMore,  setLoadingMore ] = useState(false);
  const loaderRef = useRef(null);

  useEffect(() => { setVisibleCount(ITEMS_PER_PAGE); }, [products]);

  const handleObserver = useCallback((entries) => {
    const [entry] = entries;
    if (entry.isIntersecting && visibleCount < products.length && !loadingMore) {
      setLoadingMore(true);
      setTimeout(() => {
        setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, products.length));
        setLoadingMore(false);
      }, 600);
    }
  }, [visibleCount, products.length, loadingMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null, rootMargin: "120px", threshold: 0.1,
    });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore         = visibleCount < products.length;

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Package size={48} strokeWidth={1} className="text-gray-200" />
        <p className="text-[13px] text-gray-400">{t("কোনো পণ্য পাওয়া যায়নি।", "No products found.")}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4">
        {visibleProducts.map((p, i) => <HomeProductCard key={p._id} product={p} index={i} />)}
      </div>

      <div ref={loaderRef} className="mt-8 flex flex-col items-center gap-3">
        {loadingMore && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3 py-4">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-2 border-gray-100" />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#2e7d32]"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <p className="text-[12px] text-gray-400 font-medium">
              {t("আরো পণ্য লোড হচ্ছে...", "Loading more products...")}
            </p>
          </motion.div>
        )}

        {!hasMore && products.length > ITEMS_PER_PAGE && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-3 py-4 w-full">
            <div className="flex-1 h-px bg-gray-200" />
            <p className="text-[11px] text-gray-400 font-medium px-3">
              {t(`সব ${products.length}টি পণ্য দেখানো হয়েছে`, `All ${products.length} products shown`)}
            </p>
            <div className="flex-1 h-px bg-gray-200" />
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════
   LINK CATEGORY SECTION
════════════════════════════════ */
function LinkSection({ link, t }) {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading ] = useState(true);

  useEffect(() => {
    if (!link.slug) return;
    fetch(`${API}/api/category/${link.slug}`)
      .then(r => r.json())
      .then(d => { if (d.success) setProducts(d.data.slice(0, 8)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [link.slug]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="mb-14">
      <SectionHeader
        icon={<Package size={18} className="text-[#1a2e1a]" />}
        titleBn={link.name} titleEn={link.name}
        subtitleBn={`${link.name} ক্যাটাগরির পণ্য সমূহ`}
        subtitleEn={`Products from ${link.name} category`}
        showAllTo={`/${link.slug}`}
        t={t}
      />
      {loading
        ? <Skeletons count={4} />
        : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4">
            {products.map((p, i) => <HomeProductCard key={p._id} product={p} index={i} />)}
          </div>
      }
    </section>
  );
}

/* ════════════════════════════════
   MAIN HOME
════════════════════════════════ */
function Home() {
  const t = useT();

  const [allProducts,    setAllProducts   ] = useState([]);
  const [mostOrdered,    setMostOrdered   ] = useState([]);
  const [mostWishlisted, setMostWishlisted] = useState([]);
  const [navLinks,       setNavLinks      ] = useState([]);
  const [loadingAll,     setLoadingAll    ] = useState(true);
  const [loadingOrdered, setLoadingOrdered] = useState(true);
  const [loadingWish,    setLoadingWish   ] = useState(true);

  const [sort,    setSort   ] = useState("default");
  const [filters, setFilters] = useState({ discount: false, inStock: false, freeDelivery: false });

  useEffect(() => {
    fetch(`${API}/api/products/public`)
      .then(r => r.json())
      .then(d => setAllProducts(d.data || []))
      .catch(() => {})
      .finally(() => setLoadingAll(false));
  }, []);

  useEffect(() => {
    fetch(`${API}/api/products/most-ordered?limit=8`)
      .then(r => r.json())
      .then(d => { if (d.success) setMostOrdered(d.data); })
      .catch(() => {})
      .finally(() => setLoadingOrdered(false));
  }, []);

  useEffect(() => {
    fetch(`${API}/api/products/most-wishlisted?limit=8`)
      .then(r => r.json())
      .then(d => { if (d.success) setMostWishlisted(d.data); })
      .catch(() => {})
      .finally(() => setLoadingWish(false));
  }, []);

  useEffect(() => {
    fetch(`${API}/api/navbar-links`)
      .then(r => r.json())
      .then(d => { if (d.success) setNavLinks(d.data); })
      .catch(() => {});
  }, []);

  const filteredProducts = useMemo(() =>
    applySortFilter(allProducts, sort, filters),
    [allProducts, sort, filters]
  );

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
        <HeroBanner />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 mt-12 pb-10">

        {/* সব পণ্য */}
        <section className="mb-14">
          <SectionHeader
            icon={<Package size={18} className="text-[#1a2e1a]" />}
            titleBn="সব পণ্য" titleEn="All Products"
            subtitleBn="আমাদের সম্পূর্ণ কালেকশন"
            subtitleEn="Our complete collection"
            t={t}
          />
          <SortFilterDropdown
            sort={sort} setSort={setSort}
            filters={filters} setFilters={setFilters}
            total={filteredProducts.length} t={t}
          />
          {/* ✅ Spinner — skeleton এর বদলে */}
          {loadingAll
            ? <PageSpinner t={t} />
            : <LazyProductGrid products={filteredProducts} t={t} />
          }
        </section>

        {/* সবচেয়ে বেশি বিক্রিত */}
        {(loadingOrdered || mostOrdered.length > 0) && (
          <section className="mb-14">
            <SectionHeader
              icon={<Flame size={18} className="text-orange-500" />}
              titleBn="সবচেয়ে বেশি বিক্রিত" titleEn="Best Selling"
              subtitleBn="সবচেয়ে বেশি অর্ডার হওয়া পণ্য"
              subtitleEn="Most ordered products"
              t={t}
            />
            {loadingOrdered
              ? <Skeletons count={4} />
              : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4">
                  {mostOrdered.map((p, i) => <HomeProductCard key={p._id} product={p} index={i} />)}
                </div>
            }
          </section>
        )}

        {/* জনপ্রিয় পণ্য */}
        {(loadingWish || mostWishlisted.length > 0) && (
          <section className="mb-14">
            <SectionHeader
              icon={<Trophy size={18} className="text-amber-500" />}
              titleBn="জনপ্রিয় পণ্য" titleEn="Most Favorited"
              subtitleBn="সবচেয়ে বেশি উইশলিস্টে যোগ করা পণ্য"
              subtitleEn="Most wishlisted by customers"
              t={t}
            />
            {loadingWish
              ? <Skeletons count={4} />
              : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4">
                  {mostWishlisted.map((p, i) => <HomeProductCard key={p._id} product={p} index={i} />)}
                </div>
            }
          </section>
        )}

        {/* লিংক ক্যাটাগরি */}
        {navLinks.map(link => (
          <LinkSection key={link._id} link={link} t={t} />
        ))}

      </div>
    </div>
  );
}

export default Home;