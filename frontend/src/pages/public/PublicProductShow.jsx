import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Package, Zap, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useT } from "../../context/LanguageContext";
import { useWishlist } from "../../context/WishlistContext";

const ITEMS_PER_PAGE = 12;

const cardVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

/* ════════════════════════════════
   PRODUCT CARD
════════════════════════════════ */
function ProductCard({ product }) {
  const { addToCart }                = useCart();
  const { toggleWishlist, isWished } = useWishlist();
  const navigate                     = useNavigate();
  const t                            = useT();
  const [added, setAdded]            = useState(false);

  // ✅ FIX: Number() দিয়ে string/undefined/null সব handle হবে
  const inStock     = Number(product.stock) > 0;
  const isLowStock  = inStock && Number(product.stock) <= 5;
  const hasDiscount = product.discountType !== "none" && product.discountValue > 0;
  const salePrice   = product.salePrice ?? product.price;
  const wished      = isWished(product._id);

  const isNew = (() => {
    const d = new Date(product.createdAt);
    return (Date.now() - d) / 86400000 <= 14;
  })();

  const handleCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    if (added) { navigate("/cart"); return; }
    addToCart(product);
    setAdded(true);
  };

  const handleWish = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product._id);
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)]"
    >
      <Link to={`/product/${product.slug}`} className="flex flex-col flex-1 min-h-0">

        {/* Image */}
        <div className="relative overflow-hidden bg-[#f8f8f5] flex-shrink-0"
          style={{ height: "clamp(160px, 22vw, 260px)" }}>
          {product.images?.[0] ? (
            <img src={product.images[0].url} alt={product.name}
              loading="lazy"
              className="w-full h-full object-contain p-3 group-hover:scale-[1.05] transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={36} className="text-gray-200" />
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
            style={{ background: "linear-gradient(to top, rgba(248,248,245,0.8), transparent)" }} />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
            {!inStock && (
              <span className="text-[9px] font-black bg-gray-800/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg uppercase tracking-wide">
                {t("স্টক শেষ", "Sold Out")}
              </span>
            )}
            {isLowStock && (
              <span className="text-[9px] font-black bg-orange-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg flex items-center gap-0.5">
                <Zap size={7} fill="white" strokeWidth={0} />
                {t(`মাত্র ${product.stock}টি`, `${product.stock} left`)}
              </span>
            )}
            {isNew && inStock && !isLowStock && (
              <span className="text-[9px] font-black bg-[#2e7d32]/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg uppercase">
                {t("নতুন", "New")}
              </span>
            )}
            {hasDiscount && inStock && (
              <span className="text-[9px] font-black bg-red-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg">
                {product.discountType === "percent" ? `-${product.discountValue}%` : `-৳${product.discountValue}`}
              </span>
            )}
          </div>

          {/* Wishlist */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleWish}
            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-xl flex items-center justify-center shadow-sm backdrop-blur-sm transition-all duration-200 opacity-0 group-hover:opacity-100 ${
              wished
                ? "bg-red-50/95 text-red-500 opacity-100"
                : "bg-white/90 text-gray-400 hover:text-red-400"
            }`}>
            <Heart size={14} fill={wished ? "currentColor" : "none"} strokeWidth={1.8} />
          </motion.button>
        </div>

        {/* Info */}
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
              <p className="text-[10px] text-[#2e7d32] font-semibold">
                {t("ফ্রি ডেলিভারি", "Free Delivery")}
              </p>
            </div>
          )}
        </div>
      </Link>

      {/* Cart Button */}
      <div className="px-3 pb-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleCart}
          disabled={!inStock}
          className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] sm:text-[12px] font-bold transition-all duration-200 ${
            !inStock
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : added
              ? "bg-[#2e7d32] text-white shadow-[0_4px_12px_rgba(46,125,50,0.3)]"
              : "bg-[#1a2e1a] text-white hover:bg-[#2e7d32] hover:shadow-[0_4px_12px_rgba(46,125,50,0.25)]"
          }`}>
          <ShoppingCart size={13} strokeWidth={2} />
          {!inStock
            ? t("স্টক নেই", "Out of Stock")
            : added
            ? t("🛒 কার্টে যান", "🛒 Go to Cart")
            : t("কার্টে যোগ করুন", "Add to Cart")
          }
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════
   MAIN EXPORT — with lazy loading
════════════════════════════════ */
function PublicProductShow({ products, loading }) {
  const t = useT();
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [loadingMore,  setLoadingMore ] = useState(false);
  const loaderRef = useRef(null);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [products]);

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
      root: null, rootMargin: "100px", threshold: 0.1,
    });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  // ✅ Skeleton সরিয়ে centered spinner
  if (loading) {
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

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-3">
        <Package size={48} strokeWidth={1} className="text-gray-200" />
        <p className="text-[13px] text-gray-400 font-medium">
          {t("কোনো পণ্য পাওয়া যায়নি।", "No products available.")}
        </p>
      </div>
    );
  }

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore         = visibleCount < products.length;

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4">
        {visibleProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      <div ref={loaderRef} className="mt-8 flex flex-col items-center gap-3">
        {loadingMore && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 py-4">
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-gray-100" />
              <motion.div
                className="absolute inset-0 w-10 h-10 rounded-full border-2 border-transparent border-t-[#2e7d32]"
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
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-3 py-4">
            <div className="flex-1 h-px bg-gray-100" />
            <p className="text-[11px] text-gray-400 font-medium px-3">
              {t(`সব ${products.length}টি পণ্য দেখানো হয়েছে`, `All ${products.length} products shown`)}
            </p>
            <div className="flex-1 h-px bg-gray-100" />
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default PublicProductShow;