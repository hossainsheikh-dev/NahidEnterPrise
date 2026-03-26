import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, ArrowLeft, Star, Zap, Heart, Package,
  ChevronRight, Minus, Plus, ChevronLeft, Shield,
  RotateCcw, Truck, CreditCard, ChevronDown, ChevronUp
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useT } from "../../context/LanguageContext";
import { useWishlist } from "../../context/WishlistContext";

const API = process.env.REACT_APP_API_URL;

function StarRating({ rating = 4, count = 24, size = "md" }) {
  const s = size === "sm" ? 10 : 13;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">{[1,2,3,4,5].map((i) => (
        <Star key={i} size={s} className={i <= rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
      ))}</div>
      <span className={`text-gray-400 font-medium ${size === "sm" ? "text-[10px]" : "text-[12px]"}`}>({count})</span>
    </div>
  );
}

function ProductCard({ product, index, label }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const t = useT();
  const [added, setAdded] = useState(false);
  const hasDiscount = product.discountType !== "none" && product.discountValue > 0;
  const salePrice = product.salePrice ?? product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
      onClick={() => navigate(`/product/${product.slug}`)}
    >
      <div className="relative bg-[#f8f8f5] overflow-hidden" style={{ aspectRatio: "1/1" }}>
        {product.images?.[0] ? (
          <img src={product.images[0].url} alt={product.name}
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={30} className="text-gray-200" />
          </div>
        )}
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
            {product.discountType === "percent" ? `-${product.discountValue}%` : `-৳${product.discountValue}`}
          </span>
        )}
        {label && (
          <span className="absolute top-2 right-2 bg-[#1a2e1a] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
            {label}
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {t("স্টক শেষ", "Sold Out")}
            </span>
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="text-[12px] sm:text-[13px] font-semibold text-gray-800 line-clamp-2 leading-snug flex-1 min-h-[32px]">
          {product.name}
        </p>
        <StarRating size="sm" />
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-[14px] font-black text-gray-900">
            ৳{Number(hasDiscount ? salePrice : product.price).toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-[11px] text-gray-400 line-through">৳{Number(product.price).toLocaleString()}</span>
          )}
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={(e) => {
            e.stopPropagation();
            if (product.stock === 0) return;
            if (added) { navigate("/cart"); return; }
            addToCart(product);
            setAdded(true);
          }}
          disabled={product.stock === 0}
          className={`w-full py-2 rounded-lg text-[11px] font-bold tracking-wide transition-all duration-250 ${
            product.stock === 0    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : added                ? "bg-[#2e7d32] text-white"
                                   : "bg-[#1a2e1a] hover:bg-[#2e7d32] text-white"
          }`}
        >
          {product.stock === 0
            ? t("স্টক নেই",          "Out of Stock")
            : added
            ? t("🛒 কার্টে যান",     "🛒 Go to Cart")
            : t("+ কার্টে যোগ করুন", "+ Add to Cart")
          }
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const t = useT();
  const { toggleWishlist, isWished } = useWishlist();

  const [product,         setProduct        ] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [boughtTogether,  setBoughtTogether ] = useState([]);
  const [otherProducts,   setOtherProducts  ] = useState([]);
  const [loading,         setLoading        ] = useState(true);
  const [selectedImg,     setSelectedImg    ] = useState(0);
  const [imgDir,          setImgDir         ] = useState(1);
  const [quantity,        setQuantity       ] = useState(1);
  const [added,           setAdded          ] = useState(false);
  const [descExpanded,    setDescExpanded   ] = useState(false);

  useEffect(() => {
    setLoading(true);
    setSelectedImg(0); setQuantity(1); setAdded(false); setDescExpanded(false);
    setRelatedProducts([]); setBoughtTogether([]); setOtherProducts([]);
    window.scrollTo({ top: 0, behavior: "smooth" });

    fetch(`${API}/api/products/slug/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) return;
        setProduct(d.data);
        if (d.data.sublink?._id) {
          fetch(`${API}/api/products/sublink/${d.data.sublink._id}`)
            .then((r) => r.json())
            .then((rd) => {
              if (!rd.success) return;
              const others = rd.data.filter((p) => p._id !== d.data._id);
              if (others.length > 0) {
                setRelatedProducts(others.slice(0, 6));
                const shuffled = [...others].sort(() => 0.5 - Math.random());
                setBoughtTogether(shuffled.slice(0, 6));
              } else {
                fetch(`${API}/api/products/public`)
                  .then((r) => r.json())
                  .then((pd) => { if (pd.success) setOtherProducts(pd.data.filter(p => p._id !== d.data._id).slice(0, 12)); })
                  .catch(() => {});
              }
            }).catch(() => {});
        } else {
          fetch(`${API}/api/products/public`)
            .then((r) => r.json())
            .then((pd) => { if (pd.success) setOtherProducts(pd.data.filter(p => p._id !== d.data._id).slice(0, 12)); })
            .catch(() => {});
        }
      }).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  const goImg   = useCallback((idx) => { if (!product) return; setImgDir(idx > selectedImg ? 1 : -1); setSelectedImg(idx); }, [product, selectedImg]);
  const prevImg = useCallback(() => { if (!product) return; const n = selectedImg === 0 ? product.images.length - 1 : selectedImg - 1; setImgDir(-1); setSelectedImg(n); }, [product, selectedImg]);
  const nextImg = useCallback(() => { if (!product) return; const n = selectedImg === product.images.length - 1 ? 0 : selectedImg + 1; setImgDir(1); setSelectedImg(n); }, [product, selectedImg]);

  if (loading) return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10">
          <div className="space-y-3">
            <div className="aspect-square bg-gray-200 rounded-3xl animate-pulse" />
            <div className="flex gap-2">{[0,1,2,3].map(i=><div key={i} className="w-20 h-20 bg-gray-200 rounded-xl animate-pulse"/>)}</div>
          </div>
          <div className="space-y-4 pt-2">
            {[80,60,40,100,50].map((w,i)=>(
              <div key={i} className={`h-${i===3?12:4} bg-gray-200 rounded animate-pulse`} style={{width:`${w}%`}} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col items-center justify-center gap-4">
      <Package size={52} strokeWidth={1} className="text-gray-300" />
      <p className="text-gray-500 font-bold text-lg">{t("পণ্য পাওয়া যায়নি", "Product not found")}</p>
      <Link to="/" className="flex items-center gap-2 text-[#2e7d32] text-sm font-semibold hover:underline underline-offset-4">
        <ArrowLeft size={14}/> {t("হোমে ফিরুন", "Back to Home")}
      </Link>
    </div>
  );

  const inStock      = product.stock > 0;
  const isLowStock   = inStock && product.stock <= 5;
  const hasDiscount  = product.discountType !== "none" && product.discountValue > 0;
  const salePrice    = product.salePrice ?? product.price;
  const displayPrice = hasDiscount ? salePrice : product.price;
  const hasMultiImg  = (product.images?.length ?? 0) > 1;
  const descWords    = (product.description || "").split(" ");
  const isLongDesc   = descWords.length > 60;
  const shortDesc    = isLongDesc && !descExpanded ? descWords.slice(0, 60).join(" ") + "..." : product.description;
  const wished       = isWished(product._id);

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-[11px] text-gray-400 py-4 flex-wrap">
          <Link to="/" className="hover:text-[#2e7d32] transition-colors font-medium">{t("হোম", "Home")}</Link>
          <ChevronRight size={10} className="text-gray-300 flex-shrink-0"/>
          {product.sublink?.name && <>
            <span className="font-medium">{product.sublink.name}</span>
            <ChevronRight size={10} className="text-gray-300 flex-shrink-0"/>
          </>}
          <span className="text-gray-600 font-semibold truncate max-w-[160px] sm:max-w-xs">{product.name}</span>
        </nav>

        {/* PRODUCT HERO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 xl:gap-20 pb-10">

          {/* IMAGE PANEL */}
          <motion.div initial={{ opacity:0, x:-24 }} animate={{ opacity:1, x:0 }}
            transition={{ duration:0.55, ease:[0.22,1,0.36,1] }} className="flex flex-col gap-3">
            <div className="relative bg-white rounded-3xl overflow-hidden select-none"
              style={{ aspectRatio:"1/1", boxShadow:"0 4px 40px rgba(0,0,0,0.07)" }}>
              <AnimatePresence custom={imgDir} mode="wait">
                <motion.div key={selectedImg} custom={imgDir}
                  variants={{
                    enter:  (d) => ({ opacity:0, x: d*50, scale:0.96 }),
                    center: { opacity:1, x:0, scale:1 },
                    exit:   (d) => ({ opacity:0, x: d*-50, scale:0.96 }),
                  }}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration:0.32, ease:[0.22,1,0.36,1] }}
                  className="absolute inset-0 flex items-center justify-center p-8 sm:p-14">
                  {product.images?.[selectedImg]
                    ? <img src={product.images[selectedImg].url} alt={product.name} className="w-full h-full object-contain drop-shadow-lg"/>
                    : <Package size={80} className="text-gray-200"/>
                  }
                </motion.div>
              </AnimatePresence>

              {hasMultiImg && (<>
                <motion.button whileTap={{ scale:0.9 }} onClick={prevImg}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/95 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-[#1a2e1a] transition-all z-10">
                  <ChevronLeft size={17}/>
                </motion.button>
                <motion.button whileTap={{ scale:0.9 }} onClick={nextImg}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/95 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-[#1a2e1a] transition-all z-10">
                  <ChevronRight size={17}/>
                </motion.button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {product.images.map((_, i) => (
                    <motion.button key={i} onClick={() => goImg(i)}
                      animate={{ width: i===selectedImg ? 18 : 6, backgroundColor: i===selectedImg ? "#1a2e1a" : "#d1d5db" }}
                      transition={{ duration:0.25 }} className="h-1.5 rounded-full"/>
                  ))}
                </div>
              </>)}

              <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
                onClick={() => toggleWishlist(product._id)}
                className={`absolute top-3 right-3 w-10 h-10 rounded-2xl flex items-center justify-center shadow-md transition-colors z-10 ${
                  wished ? "bg-red-50 text-red-500" : "bg-white/90 text-gray-400 hover:text-red-400"
                }`}>
                <Heart size={16} fill={wished ? "currentColor" : "none"} strokeWidth={1.8}/>
              </motion.button>

              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                {hasDiscount && (
                  <motion.span initial={{ scale:0, rotate:-10 }} animate={{ scale:1, rotate:0 }}
                    className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-xl shadow-md">
                    {product.discountType === "percent" ? `-${product.discountValue}%` : `-৳${product.discountValue}`}
                  </motion.span>
                )}
                {!inStock && <span className="bg-gray-800 text-white text-[10px] font-black px-2.5 py-1 rounded-xl uppercase tracking-wider">{t("স্টক শেষ", "Sold Out")}</span>}
                {isLowStock && (
                  <span className="bg-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-xl flex items-center gap-1">
                    <Zap size={9} fill="white" strokeWidth={0}/>
                    {t(`মাত্র ${product.stock}টি বাকি`, `${product.stock} left`)}
                  </span>
                )}
              </div>
            </div>

            {hasMultiImg && (
              <div className="flex justify-center gap-2 flex-wrap">
                {product.images.map((img, i) => (
                  <motion.button key={i} whileHover={{ y:-2 }} whileTap={{ scale:0.94 }}
                    onClick={() => goImg(i)}
                    className={`flex-shrink-0 w-[64px] h-[64px] sm:w-[72px] sm:h-[72px] rounded-2xl border-2 bg-white overflow-hidden transition-all duration-200 ${
                      selectedImg===i ? "border-[#1a2e1a] shadow-md" : "border-transparent hover:border-gray-200"
                    }`}>
                    <img src={img.url} alt={`thumb-${i}`}
                      className={`w-full h-full object-contain p-1.5 transition-opacity ${selectedImg===i ? "opacity-100" : "opacity-55 hover:opacity-90"}`}/>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* INFO PANEL */}
          <motion.div initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }}
            transition={{ duration:0.55, ease:[0.22,1,0.36,1], delay:0.08 }}
            className="flex flex-col gap-4 lg:pt-1">

            <div className="flex items-center justify-between flex-wrap gap-2">
              {product.sublink?.name && (
                <span className="text-[10px] font-black text-[#2e7d32] bg-[#e8f5e9] px-3 py-1 rounded-full uppercase tracking-[0.15em]">
                  {product.sublink.name}
                </span>
              )}
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${inStock ? "bg-green-400" : "bg-gray-300"}`}/>
                <span className={`text-[11px] font-bold ${inStock ? "text-green-600" : "text-gray-400"}`}>
                  {!inStock
                    ? t("স্টক নেই",                        "Out of Stock")
                    : isLowStock
                    ? t(`মাত্র ${product.stock}টি বাকি!`,  `Only ${product.stock} left!`)
                    : t("স্টকে আছে",                       "In Stock")
                  }
                </span>
              </div>
            </div>

            <h1 className="text-[20px] sm:text-[24px] lg:text-[22px] xl:text-[26px] font-black text-gray-900 leading-tight tracking-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 flex-wrap">
              <StarRating/>
              <span className="text-[11px] text-gray-300">|</span>
              <span className="text-[11px] text-gray-500 font-medium">SKU: #{product._id?.slice(-6).toUpperCase()}</span>
            </div>

            {/* Price block */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100" style={{ boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}>
              {hasDiscount ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-[28px] sm:text-[32px] font-black text-[#1a2e1a] tracking-tight leading-none">
                      ৳{Number(salePrice).toLocaleString()}
                    </span>
                    <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg">
                      {product.discountType === "percent" ? `-${product.discountValue}%` : `-৳${product.discountValue}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 mt-0.5">
                    <span className="text-[14px] text-gray-400 font-semibold line-through">৳{Number(product.price).toLocaleString()}</span>
                    <span className="text-[11px] font-black text-[#2e7d32] bg-[#e8f5e9] px-2 py-0.5 rounded-lg">
                      {t(`সাশ্রয় ৳${(product.price - salePrice).toLocaleString()}`, `SAVE ৳${(product.price - salePrice).toLocaleString()}`)}
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-[28px] sm:text-[32px] font-black text-[#1a2e1a] tracking-tight leading-none">
                  ৳{Number(product.price).toLocaleString()}
                </span>
              )}
              {Number(displayPrice) >= 2500 && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Truck size={12} className="text-[#2e7d32]"/>
                  <span className="text-[11px] font-bold text-[#2e7d32]">{t("ফ্রি ডেলিভারি অন্তর্ভুক্ত", "Free delivery included")}</span>
                </div>
              )}
            </div>

            {/* Qty + CTA */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{t("পরিমাণ", "Qty")}</span>
                <div className="flex items-center bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <motion.button whileTap={{ scale:0.88 }}
                    onClick={() => setQuantity(q => Math.max(1, q-1))} disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#1a2e1a] disabled:opacity-30 transition-colors">
                    <Minus size={13}/>
                  </motion.button>
                  <span className="w-10 text-center text-[15px] font-black text-[#1a2e1a]">{quantity}</span>
                  <motion.button whileTap={{ scale:0.88 }}
                    onClick={() => setQuantity(q => Math.min(product.stock, q+1))}
                    disabled={!inStock || quantity >= product.stock}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#1a2e1a] disabled:opacity-30 transition-colors">
                    <Plus size={13}/>
                  </motion.button>
                </div>
                {quantity > 1 && (
                  <motion.span initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                    className="text-[12px] font-black text-[#1a2e1a]">
                    = ৳{(displayPrice * quantity).toLocaleString()}
                  </motion.span>
                )}
              </div>

              <motion.button
                whileHover={inStock ? { scale:1.01 } : {}} whileTap={inStock ? { scale:0.98 } : {}}
                onClick={() => {
                  if (!inStock) return;
                  if (added) { navigate("/cart"); return; }
                  for (let i = 0; i < quantity; i++) addToCart(product);
                  setAdded(true);
                }}
                disabled={!inStock}
                className={`relative w-full flex items-center justify-center gap-2.5 py-4 rounded-xl text-[14px] font-black tracking-wide transition-all duration-300 overflow-hidden ${
                  !inStock ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : added  ? "bg-[#2e7d32] text-white"
                           : "bg-[#1a2e1a] text-white hover:bg-[#2e7d32]"
                }`}
                style={{ boxShadow: inStock ? (added ? "0 8px 32px rgba(46,125,50,0.35)" : "0 8px 32px rgba(26,46,26,0.28)") : "none" }}
              >
                <AnimatePresence mode="wait">
                  {added ? (
                    <motion.span key="gotocart" initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                      className="flex items-center gap-2">
                      <ShoppingCart size={16} strokeWidth={2.5}/> {t("কার্টে যান →", "Go to Cart →")}
                    </motion.span>
                  ) : (
                    <motion.span key="add" initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                      className="flex items-center gap-2">
                      <ShoppingCart size={16} strokeWidth={2}/>
                      {!inStock ? t("স্টক নেই", "Out of Stock") : t("কার্টে যোগ করুন", "Add to Cart")}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <Link to="/"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold text-gray-500 border-2 border-gray-200 hover:border-gray-300 hover:bg-white transition-all">
                <ArrowLeft size={13}/> {t("কেনাকাটা চালিয়ে যান", "Continue Shopping")}
              </Link>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: <Truck size={13}/>,      label: t("ফ্রি ডেলিভারি",     "Free Delivery"),   sub: t("৳২৫০০ এর উপরে",        "Orders over ৳2500")    },
                { icon: <RotateCcw size={13}/>,  label: t("সহজ রিটার্ন",        "Easy Returns"),    sub: t("৭ দিনের রিটার্ন পলিসি", "7-day return policy")   },
                { icon: <Shield size={13}/>,     label: t("১০০% আসল পণ্য",      "100% Authentic"),  sub: t("অরিজিনাল পণ্য নিশ্চিত", "Genuine products")      },
                { icon: <CreditCard size={13}/>, label: t("ক্যাশ অন ডেলিভারি", "Cash on Delivery"),sub: t("পণ্য পেয়ে টাকা দিন",   "Pay when you receive")  },
              ].map((b) => (
                <div key={b.label} className="flex items-start gap-2.5 bg-white border border-gray-100 rounded-xl px-3 py-2.5 hover:border-gray-200 transition-colors">
                  <span className="text-[#2e7d32] mt-0.5 flex-shrink-0">{b.icon}</span>
                  <div>
                    <p className="text-[11px] font-black text-gray-800 leading-tight">{b.label}</p>
                    <p className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">{b.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* DESCRIPTION */}
        <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.5, delay:0.2 }}
          className="bg-white rounded-3xl overflow-hidden border border-gray-100 mb-5"
          style={{ boxShadow:"0 4px 24px rgba(0,0,0,0.05)" }}>
          <div className="px-5 sm:px-8 py-4 border-b border-gray-50">
            <h2 className="text-[13px] font-black text-gray-900 uppercase tracking-[0.15em]">
              {t("বিবরণ", "Description")}
            </h2>
          </div>
          <div className="p-5 sm:p-8">
            <p className="text-[13px] sm:text-[14px] text-gray-600 leading-[1.9] whitespace-pre-line">{shortDesc}</p>
            {isLongDesc && (
              <motion.button whileTap={{ scale:0.97 }} onClick={() => setDescExpanded(e => !e)}
                className="mt-4 flex items-center gap-1.5 text-[12px] font-black text-[#2e7d32] hover:underline underline-offset-4">
                {descExpanded
                  ? <><ChevronUp size={14}/> {t("কম দেখুন", "Show Less")}</>
                  : <><ChevronDown size={14}/> {t("আরো দেখুন", "Read More")}</>
                }
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* SPECIFICATIONS */}
        {product.features?.length > 0 && (
          <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.5, delay:0.25 }}
            className="bg-white rounded-3xl overflow-hidden border border-gray-100 mb-10"
            style={{ boxShadow:"0 4px 24px rgba(0,0,0,0.05)" }}>
            <div className="px-5 sm:px-8 py-4 border-b border-gray-50">
              <h2 className="text-[13px] font-black text-gray-900 uppercase tracking-[0.15em]">
                {t("স্পেসিফিকেশন", "Specifications")}
              </h2>
            </div>
            <div className="p-5 sm:p-8">
              <div className="overflow-hidden rounded-2xl border border-gray-100">
                {product.features.map((f, i) => (
                  <motion.div key={i} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
                    transition={{ delay:0.25 + i*0.04 }}
                    className={`grid grid-cols-2 sm:grid-cols-[200px_1fr] ${i%2===0 ? "bg-[#fafaf8]" : "bg-white"} border-b border-gray-50 last:border-0`}>
                    <div className="px-4 sm:px-6 py-3.5 text-[11px] sm:text-[12px] font-black text-gray-400 uppercase tracking-wide flex items-center">{f.key}</div>
                    <div className="px-4 sm:px-6 py-3.5 text-[12px] sm:text-[13px] font-semibold text-gray-800 flex items-center border-l border-gray-100">{f.value}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <motion.section initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.5, delay:0.25 }} className="mb-10">
            <div className="flex items-end justify-between mb-5">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 mb-1">{t("একই ক্যাটাগরি", "Same Category")}</p>
                <h2 className="text-[18px] sm:text-[22px] font-black text-gray-900 tracking-tight">{t("সম্পর্কিত পণ্য", "Related Products")}</h2>
              </div>
              <Link to="/" className="text-[11px] font-black text-[#2e7d32] hover:underline underline-offset-4 hidden sm:block">
                {t("সব দেখুন →", "View All →")}
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {relatedProducts.map((p, i) => <ProductCard key={p._id} product={p} index={i}/>)}
            </div>
          </motion.section>
        )}

        {/* CUSTOMERS ALSO BOUGHT */}
        {boughtTogether.length > 0 && (
          <motion.section initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.5, delay:0.35 }} className="mb-12">
            <div className="flex items-end justify-between mb-5">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 mb-1">{t("জনপ্রিয় পছন্দ", "Popular Picks")}</p>
                <h2 className="text-[18px] sm:text-[22px] font-black text-gray-900 tracking-tight">{t("অন্যরাও কিনেছেন", "Customers Also Bought")}</h2>
              </div>
              <Link to="/" className="text-[11px] font-black text-[#2e7d32] hover:underline underline-offset-4 hidden sm:block">
                {t("সব দেখুন →", "View All →")}
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {boughtTogether.map((p, i) => <ProductCard key={p._id} product={p} index={i} label={t("জনপ্রিয়", "Popular")}/>)}
            </div>
          </motion.section>
        )}

        {/* YOU MAY ALSO LIKE */}
        {otherProducts.length > 0 && relatedProducts.length === 0 && (
          <motion.section initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.5, delay:0.3 }} className="mb-12">
            <div className="flex items-end justify-between mb-5">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 mb-1">{t("আরো দেখুন", "Explore More")}</p>
                <h2 className="text-[18px] sm:text-[22px] font-black text-gray-900 tracking-tight">{t("আপনার পছন্দ হতে পারে", "You May Also Like")}</h2>
              </div>
              <Link to="/" className="text-[11px] font-black text-[#2e7d32] hover:underline underline-offset-4 hidden sm:block">
                {t("সব দেখুন →", "View All →")}
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {otherProducts.map((p, i) => <ProductCard key={p._id} product={p} index={i}/>)}
            </div>
          </motion.section>
        )}

      </div>
    </div>
  );
}