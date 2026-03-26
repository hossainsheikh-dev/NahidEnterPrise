import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, ArrowLeft, Package, Sparkles } from "lucide-react";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { useT } from "../../context/LanguageContext";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function WishlistPage() {
  const t = useT();
  const navigate = useNavigate();
  const { wishlistProducts, toggleWishlist, wishlistCount, wishlistIds } = useWishlist();
  const { addToCart } = useCart();
  const [suggested, setSuggested] = useState([]);
  const [addedMap, setAddedMap] = useState({});

  useEffect(() => {
    fetch(`${API}/api/products/public`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const filtered = d.data.filter(p => !wishlistIds.includes(p._id));
          setSuggested(filtered.slice(0, 8));
        }
      })
      .catch(() => {});
  }, [wishlistIds]);

  const handleCart = (product) => {
    if (!product.stock) return;
    if (addedMap[product._id]) { navigate("/cart"); return; }
    addToCart(product);
    setAddedMap(prev => ({ ...prev, [product._id]: true }));
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-7">
          <Link to="/" className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
              <Heart size={20} className="text-red-500" fill="currentColor" />
              {t("উইশলিস্ট", "Wishlist")}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {wishlistCount > 0
                ? t(`${wishlistCount}টি পণ্য সেভ করা আছে`, `${wishlistCount} product${wishlistCount !== 1 ? "s" : ""} saved`)
                : t("কোনো পণ্য নেই", "No products saved")
              }
            </p>
          </div>
        </div>

        {/* Empty state */}
        {wishlistCount === 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center mb-10">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-20 h-20 rounded-3xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-5">
              <Heart size={36} className="text-red-300" strokeWidth={1.5} />
            </motion.div>
            <p className="text-lg font-black text-gray-800 mb-1">{t("উইশলিস্ট খালি", "Wishlist is empty")}</p>
            <p className="text-sm text-gray-400 mb-6">{t("পছন্দের পণ্য Heart আইকনে ক্লিক করে যোগ করুন", "Click the heart icon on products to add them")}</p>
            <Link to="/"
              className="inline-flex items-center gap-2 bg-[#1a2e1a] hover:bg-[#2e7d32] text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors">
              <ArrowLeft size={15} /> {t("কেনাকাটা করুন", "Go Shopping")}
            </Link>
          </motion.div>
        )}

        {/* Wishlist Grid */}
        {wishlistCount > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-12">
            <AnimatePresence>
              {wishlistProducts.map((product, i) => {
                const hasDiscount = product.discountType !== "none" && product.discountValue > 0;
                const salePrice = product.salePrice ?? product.price;
                const inStock = product.stock > 0;

                return (
                  <motion.div key={product._id}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.88 }} transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col">

                    {/* Image */}
                    <div className="relative bg-[#f8f8f5] overflow-hidden cursor-pointer"
                      style={{ aspectRatio: "1/1" }}
                      onClick={() => navigate(`/product/${product.slug}`)}>
                      {product.images?.[0]
                        ? <img src={product.images[0].url} alt={product.name}
                            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500" />
                        : <div className="w-full h-full flex items-center justify-center">
                            <Package size={28} className="text-gray-200" />
                          </div>
                      }
                      {hasDiscount && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          {product.discountType === "percent" ? `-${product.discountValue}%` : `-৳${product.discountValue}`}
                        </span>
                      )}
                      {!inStock && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">{t("স্টক শেষ", "Sold Out")}</span>
                        </div>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); toggleWishlist(product._id); }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={12} className="text-red-400" />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-3 flex flex-col gap-2 flex-1">
                      <p className="text-[12px] sm:text-[13px] font-semibold text-gray-800 line-clamp-2 leading-snug flex-1 cursor-pointer hover:text-[#2e7d32] transition-colors"
                        onClick={() => navigate(`/product/${product.slug}`)}>
                        {product.name}
                      </p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[14px] font-black text-gray-900">৳{Number(salePrice).toLocaleString()}</span>
                        {hasDiscount && <span className="text-[11px] text-gray-400 line-through">৳{Number(product.price).toLocaleString()}</span>}
                      </div>
                      <div className="flex gap-2">
                        <motion.button whileTap={{ scale: 0.95 }}
                          onClick={() => handleCart(product)}
                          disabled={!inStock}
                          className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                            !inStock
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : addedMap[product._id]
                              ? "bg-[#2e7d32] text-white"
                              : "bg-[#1a2e1a] hover:bg-[#2e7d32] text-white"
                          }`}>
                          <ShoppingCart size={11} />
                          {!inStock
                            ? t("স্টক নেই", "Out of Stock")
                            : addedMap[product._id]
                            ? t("🛒 কার্টে যান", "🛒 Go to Cart")
                            : t("কার্টে যোগ", "Add to Cart")
                          }
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.95 }}
                          onClick={() => toggleWishlist(product._id)}
                          className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center hover:bg-red-100 transition-colors flex-shrink-0">
                          <Heart size={13} className="text-red-500" fill="currentColor" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Suggested Products */}
        {suggested.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-[#e8f5e9] flex items-center justify-center">
                <Sparkles size={16} className="text-[#2e7d32]" />
              </div>
              <div>
                <h2 className="text-[15px] font-black text-gray-900">{t("আপনার পছন্দ হতে পারে", "You Might Like")}</h2>
                <p className="text-[11px] text-gray-400">{t("এই পণ্যগুলোও দেখুন", "Check these out too")}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {suggested.map((product, i) => {
                const hasDiscount = product.discountType !== "none" && product.discountValue > 0;
                const salePrice = product.salePrice ?? product.price;
                const inStock = product.stock > 0;
                const isAdded = !!addedMap[product._id];

                return (
                  <motion.div key={product._id}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col cursor-pointer"
                    onClick={() => navigate(`/product/${product.slug}`)}>
                    <div className="relative bg-[#f8f8f5] overflow-hidden" style={{ aspectRatio: "1/1" }}>
                      {product.images?.[0]
                        ? <img src={product.images[0].url} alt={product.name}
                            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500" />
                        : <div className="w-full h-full flex items-center justify-center">
                            <Package size={28} className="text-gray-200" />
                          </div>
                      }
                      {hasDiscount && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          {product.discountType === "percent" ? `-${product.discountValue}%` : `-৳${product.discountValue}`}
                        </span>
                      )}
                      {!inStock && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">{t("স্টক শেষ", "Sold Out")}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex flex-col gap-2 flex-1">
                      <p className="text-[12px] sm:text-[13px] font-semibold text-gray-800 line-clamp-2 leading-snug flex-1">
                        {product.name}
                      </p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[14px] font-black text-gray-900">৳{Number(salePrice).toLocaleString()}</span>
                        {hasDiscount && <span className="text-[11px] text-gray-400 line-through">৳{Number(product.price).toLocaleString()}</span>}
                      </div>
                      <motion.button whileTap={{ scale: 0.95 }}
                        onClick={(e) => { e.stopPropagation(); handleCart(product); }}
                        disabled={!inStock}
                        className={`w-full py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                          !inStock
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : isAdded
                            ? "bg-[#2e7d32] text-white"
                            : "bg-[#1a2e1a] hover:bg-[#2e7d32] text-white"
                        }`}>
                        <ShoppingCart size={11} />
                        {!inStock
                          ? t("স্টক নেই", "Out of Stock")
                          : isAdded
                          ? t("🛒 কার্টে যান", "🛒 Go to Cart")
                          : t("কার্টে যোগ", "Add to Cart")
                        }
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

      </div>
    </div>
  );
}