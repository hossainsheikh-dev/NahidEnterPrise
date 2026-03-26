import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Heart, Package, ShoppingCart } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { Link, useNavigate } from "react-router-dom";
import { useT } from "../../context/LanguageContext";

const API = process.env.REACT_APP_API_URL;

export default function Cart() {
  const navigate = useNavigate();
  const t = useT();
  const {
    cartItems, cartCount, cartSubtotal, cartSavings,
    deliveryCharge, cartTotal, removeFromCart,
    updateQuantity, clearCart, addToCart,
    deliverySettings,
  } = useCart();
  const { toggleWishlist, isWished } = useWishlist();

  const [products, setProducts] = useState([]);
  const [addedMap, setAddedMap] = useState({});

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    fetch(`${API}/api/products/public`)
      .then(r => r.json())
      .then(d => { if (d.success) setProducts(d.data.slice(0, 12)); })
      .catch(() => {});
  }, []);

  const handleAdd = (e, product) => {
    e.stopPropagation();
    if (product.stock === 0) return;
    if (addedMap[product._id]) { navigate("/cart"); return; }
    addToCart(product);
    setAddedMap(prev => ({ ...prev, [product._id]: true }));
  };

  const cartIds     = new Set(cartItems.map(i => i._id));
  const suggestions = products.filter(p => !cartIds.has(p._id));

  const remaining  = deliverySettings.freeDeliveryMinimum - cartSubtotal;
  const progress   = Math.min((cartSubtotal / deliverySettings.freeDeliveryMinimum) * 100, 100);
  const showFreeBar = deliverySettings.freeDeliveryEnabled && deliveryCharge > 0 && remaining > 0;

  /* ── Empty Cart ── */
  if (cartCount === 0) {
    return (
      <div className="min-h-screen bg-[#f8f8f6]">
        <div className="flex flex-col items-center justify-center gap-5 px-4 py-20">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-24 h-24 rounded-3xl bg-gray-100 flex items-center justify-center">
            <ShoppingBag size={40} strokeWidth={1.2} className="text-gray-300" />
          </motion.div>
          <div className="text-center">
            <p className="text-lg font-black text-gray-800">{t("আপনার কার্ট খালি", "Your cart is empty")}</p>
            <p className="text-sm text-gray-400 mt-1">{t("শুরু করতে পণ্য যোগ করুন", "Add some products to get started")}</p>
          </div>
          <Link to="/"
            className="flex items-center gap-2 bg-[#1a2e1a] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#2e7d32] transition-colors"
            style={{ boxShadow: "0 4px 16px rgba(26,46,26,0.25)" }}>
            <ArrowLeft size={15} /> {t("কেনাকাটা চালিয়ে যান", "Continue Shopping")}
          </Link>
        </div>

        {suggestions.length > 0 && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">
              {t("কেনাকাটা শুরু করুন", "Start Shopping")}
            </p>
            <h2 className="text-[18px] font-black text-gray-800 mb-5">{t("জনপ্রিয় পণ্য", "Popular Products")}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {suggestions.map((p, i) => (
                <SuggestionCard key={p._id} product={p} index={i}
                  addedMap={addedMap} onAdd={handleAdd} onNavigate={navigate} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                {t("কার্ট", "Cart")}
                <span className="ml-2 text-[14px] font-bold text-gray-400">({cartCount})</span>
              </h1>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {t(`${cartCount}টি পণ্য নির্বাচিত`, `${cartCount} item${cartCount !== 1 ? "s" : ""} selected`)}
              </p>
            </div>
          </div>
          <button onClick={clearCart}
            className="flex items-center gap-1.5 text-[12px] font-bold text-red-400 hover:text-red-500 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-all">
            <Trash2 size={13} /> {t("সব মুছুন", "Clear all")}
          </button>
        </div>

        {/* Cart + Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence>
              {cartItems.map(item => {
                const hasDiscount = item.discountType !== "none" && item.discountValue > 0;
                const itemTotal   = item.salePrice * item.quantity;
                const itemSaving  = (item.price - item.salePrice) * item.quantity;
                const wished      = isWished(item._id);

                return (
                  <motion.div key={item._id} layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 flex gap-3 sm:gap-4 hover:border-gray-200 hover:shadow-sm transition-all"
                  >
                    {/* Image */}
                    <div onClick={() => item.slug && navigate(`/product/${item.slug}`)}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#f8f8f5] border border-gray-100 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                      {item.image
                        ? <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1.5" loading="lazy" />
                        : <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={20} className="text-gray-300" /></div>
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p onClick={() => item.slug && navigate(`/product/${item.slug}`)}
                          className="text-[13px] sm:text-[14px] font-semibold text-gray-800 line-clamp-2 leading-snug cursor-pointer hover:text-[#2e7d32] transition-colors flex-1">
                          {item.name}
                        </p>
                        <button onClick={() => toggleWishlist(item._id)}
                          className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                            wished ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-400 hover:text-red-400"
                          }`}>
                          <Heart size={13} fill={wished ? "currentColor" : "none"} strokeWidth={1.8} />
                        </button>
                      </div>

                      {hasDiscount ? (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[11px] font-semibold text-gray-800">৳{Number(item.salePrice).toLocaleString()}</span>
                          <span className="text-[10px] text-gray-400 line-through">৳{Number(item.price).toLocaleString()}</span>
                          <span className="text-[9px] font-bold bg-red-500 text-white px-1 py-0.5 rounded">
                            {item.discountType === "percent" ? `-${item.discountValue}%` : `-৳${item.discountValue}`}
                          </span>
                        </div>
                      ) : (
                        <p className="text-[11px] text-gray-400 mt-1">৳{Number(item.price).toLocaleString()} {t("প্রতিটি", "each")}</p>
                      )}

                      <div className="flex items-center gap-2 mt-1.5">
                        <p className="text-[14px] sm:text-[15px] font-black text-gray-900">৳{itemTotal.toLocaleString()}</p>
                        {hasDiscount && itemSaving > 0 && (
                          <span className="text-[10px] text-[#2e7d32] font-semibold bg-[#e8f5e9] px-1.5 py-0.5 rounded-lg">
                            -{t(`৳${itemSaving.toLocaleString()}`, `৳${itemSaving.toLocaleString()}`)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-2.5">
                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                          <button onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors">
                            <Minus size={12} />
                          </button>
                          <span className="w-9 text-center text-[13px] font-black text-gray-800">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors">
                            <Plus size={12} />
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(item._id)}
                          className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 hover:text-red-500 transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden sticky top-24"
              style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>

              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-50"
                style={{ background: "linear-gradient(135deg,#1a2e1a,#2e5230)" }}>
                <h2 className="text-[14px] font-black text-white flex items-center gap-2">
                  <Package size={15} />
                  {t("অর্ডার সারসংক্ষেপ", "Order Summary")}
                </h2>
              </div>

              <div className="p-5 space-y-3">
                {/* Items list */}
                <div className="space-y-1.5 border-b border-gray-100 pb-3 max-h-36 overflow-y-auto">
                  {cartItems.map(item => (
                    <div key={item._id} className="flex justify-between text-[12px] text-gray-500">
                      <span className="truncate pr-2">{item.name} × {item.quantity}</span>
                      <span className="flex-shrink-0 font-semibold text-gray-700">
                        ৳{(item.salePrice * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 text-[13px]">
                  <div className="flex justify-between text-gray-600">
                    <span>{t("সাবটোটাল", "Subtotal")}</span>
                    <span>৳{cartSubtotal.toLocaleString()}</span>
                  </div>
                  {cartSavings > 0 && (
                    <div className="flex justify-between text-[#2e7d32] font-semibold">
                      <span>{t("আপনার সাশ্রয়", "You Save")}</span>
                      <span>-৳{cartSavings.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>{t("ডেলিভারি", "Delivery")}</span>
                    <span className={deliveryCharge === 0 ? "text-[#2e7d32] font-semibold" : ""}>
                      {deliveryCharge === 0 ? t("ফ্রি 🎉", "Free 🎉") : `৳${deliveryCharge}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-black text-gray-900 text-[16px] border-t border-gray-100 pt-2.5">
                    <span>{t("মোট", "Total")}</span>
                    <span>৳{cartTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Savings badge */}
                {cartSavings > 0 && (
                  <div className="bg-[#e8f5e9] rounded-xl py-2.5 px-3 text-center border border-[#c8e6c9]">
                    <p className="text-[11px] text-[#2e7d32] font-bold">
                      🎉 {t(`৳${cartSavings.toLocaleString()} সাশ্রয় হচ্ছে!`, `Saving ৳${cartSavings.toLocaleString()}!`)}
                    </p>
                  </div>
                )}

                {/* Free delivery progress */}
                {showFreeBar && (
                  <div className="bg-[#f0f7f0] rounded-xl py-2.5 px-3 border border-[#c8e6c9]">
                    <p className="text-[11px] text-[#2e7d32] text-center font-semibold">
                      {t(
                        `ফ্রি ডেলিভারির জন্য আরো ৳${remaining.toLocaleString()} যোগ করুন`,
                        `Add ৳${remaining.toLocaleString()} more for free delivery`
                      )}
                    </p>
                    <div className="mt-2 h-1.5 bg-white rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-[#2e7d32]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 text-center mt-1">
                      {Math.round(progress)}% {t("সম্পন্ন", "complete")}
                    </p>
                  </div>
                )}

                <Link to="/checkout"
                  className="w-full bg-[#1a2e1a] hover:bg-[#2e7d32] text-white py-3.5 rounded-xl text-[13px] font-black transition-colors flex items-center justify-center gap-2"
                  style={{ boxShadow: "0 4px 16px rgba(26,46,26,0.25)" }}>
                  <ShoppingCart size={15} />
                  {t("অর্ডার করতে এগিয়ে যান →", "Proceed to Checkout →")}
                </Link>

                <Link to="/"
                  className="w-full border-2 border-gray-200 text-gray-500 py-2.5 rounded-xl text-[13px] font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5">
                  <ArrowLeft size={13} /> {t("কেনাকাটা চালিয়ে যান", "Continue Shopping")}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Suggested Products */}
        {suggestions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">
              {t("আপনার পছন্দ হতে পারে", "You might like")}
            </p>
            <h2 className="text-[18px] font-black text-gray-800 mb-5">
              {t("কার্টে আরো যোগ করুন", "Add More to Your Cart")}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {suggestions.map((p, i) => (
                <SuggestionCard key={p._id} product={p} index={i}
                  addedMap={addedMap} onAdd={handleAdd} onNavigate={navigate} />
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}

/* ════════════════════════════════
   SUGGESTION CARD
════════════════════════════════ */
function SuggestionCard({ product, index, addedMap, onAdd, onNavigate }) {
  const t                            = useT();
  const { toggleWishlist, isWished } = useWishlist();
  const hasDiscount = product.discountType !== "none" && product.discountValue > 0;
  const salePrice   = product.salePrice ?? product.price;
  const isAdded     = !!addedMap[product._id];
  const wished      = isWished(product._id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onNavigate(`/product/${product.slug}`)}
      className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer flex flex-col overflow-hidden"
    >
      <div className="relative bg-[#f8f8f5] overflow-hidden" style={{ aspectRatio: "1/1" }}>
        {product.images?.[0]
          ? <img src={product.images[0].url} alt={product.name} loading="lazy"
              className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center">
              <Package size={24} className="text-gray-200" />
            </div>
        }
        <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(248,248,245,0.8), transparent)" }} />
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500/90 backdrop-blur-sm text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg">
            {product.discountType === "percent" ? `-${product.discountValue}%` : `-৳${product.discountValue}`}
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase">{t("স্টক শেষ", "Sold Out")}</span>
          </div>
        )}
        <button onClick={(e) => { e.stopPropagation(); toggleWishlist(product._id); }}
          className={`absolute top-2 right-2 w-7 h-7 rounded-xl flex items-center justify-center shadow-sm backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 ${
            wished ? "bg-red-50/95 text-red-500 opacity-100" : "bg-white/90 text-gray-400 hover:text-red-400"
          }`}>
          <Heart size={12} fill={wished ? "currentColor" : "none"} strokeWidth={1.8} />
        </button>
      </div>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="text-[12px] sm:text-[13px] font-semibold text-gray-800 line-clamp-2 leading-snug flex-1 group-hover:text-[#1a2e1a] transition-colors">
          {product.name}
        </p>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-[13px] sm:text-[15px] font-black text-gray-900">
            ৳{Number(hasDiscount ? salePrice : product.price).toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-[11px] text-gray-400 line-through">৳{Number(product.price).toLocaleString()}</span>
          )}
        </div>
        {salePrice >= 2500 && (
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32]" />
            <p className="text-[10px] text-[#2e7d32] font-semibold">{t("ফ্রি ডেলিভারি", "Free Delivery")}</p>
          </div>
        )}
        <motion.button whileTap={{ scale: 0.97 }}
          onClick={(e) => onAdd(e, product)}
          disabled={product.stock === 0}
          className={`w-full py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all duration-200 ${
            product.stock === 0    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : isAdded              ? "bg-[#2e7d32] text-white shadow-[0_4px_12px_rgba(46,125,50,0.3)]"
                                   : "bg-[#1a2e1a] hover:bg-[#2e7d32] text-white"
          }`}>
          <ShoppingCart size={11} strokeWidth={2} />
          {product.stock === 0 ? t("স্টক নেই", "Out of Stock")
            : isAdded             ? t("🛒 কার্টে যান", "🛒 Go to Cart")
                                  : t("+ কার্টে যোগ করুন", "+ Add to Cart")
          }
        </motion.button>
      </div>
    </motion.div>
  );
}