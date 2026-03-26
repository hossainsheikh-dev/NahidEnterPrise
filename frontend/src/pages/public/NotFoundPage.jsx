import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useT } from "../../context/LanguageContext";
import { Home, ArrowLeft, Search, ShoppingBag } from "lucide-react";

export default function NotFoundPage() {
  const t = useNavigate();
  const navigate = useNavigate();
  const tt = useT();

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-md w-full">

        {/* 404 number */}
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="mb-6">
          <div className="relative inline-block">
            <p className="text-[120px] sm:text-[160px] font-black leading-none"
              style={{ color: "#e8f5e9", WebkitTextStroke: "3px #2e7d32" }}>
              404
            </p>
            <motion.div
              animate={{ rotate: [0, 10, -10, 10, 0], y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center text-6xl pointer-events-none">
              🌧️
            </motion.div>
          </div>
        </motion.div>

        {/* Message */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}>
          <h1 className="text-[22px] sm:text-[28px] font-black text-gray-900 mb-3 leading-tight">
            {tt("পেজটি খুঁজে পাওয়া যায়নি!", "Page Not Found!")}
          </h1>
          <p className="text-[13px] sm:text-[14px] text-gray-500 leading-relaxed mb-8">
            {tt(
              "আপনি যে পেজটি খুঁজছেন সেটি সরানো হয়েছে, নাম পরিবর্তন হয়েছে অথবা আর নেই।",
              "The page you're looking for has been moved, renamed, or doesn't exist."
            )}
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/"
            className="flex items-center justify-center gap-2 bg-[#1a2e1a] hover:bg-[#2e7d32] text-white px-6 py-3 rounded-xl text-[13px] font-black transition-colors"
            style={{ boxShadow: "0 8px 24px rgba(26,46,26,0.25)" }}>
            <Home size={15} /> {tt("হোমে যান", "Go to Home")}
          </Link>
          <button onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-gray-300 hover:bg-white text-gray-600 px-6 py-3 rounded-xl text-[13px] font-bold transition-all">
            <ArrowLeft size={15} /> {tt("আগের পেজে যান", "Go Back")}
          </button>
        </motion.div>

        {/* Quick links */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 pt-8 border-t border-gray-200">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">
            {tt("দরকারী লিংক", "Helpful Links")}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { to: "/", icon: <Home size={13}/>, bn: "হোম", en: "Home" },
              { to: "/search", icon: <Search size={13}/>, bn: "সার্চ", en: "Search" },
              { to: "/cart", icon: <ShoppingBag size={13}/>, bn: "কার্ট", en: "Cart" },
              { to: "/order", icon: <ShoppingBag size={13}/>, bn: "অর্ডার ট্র্যাক", en: "Track Order" },
            ].map(({ to, icon, bn, en }) => (
              <Link key={to} to={to}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-100 rounded-xl text-[12px] font-semibold text-gray-600 hover:text-[#2e7d32] hover:border-[#2e7d32] transition-all shadow-sm">
                {icon} {tt(bn, en)}
              </Link>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}