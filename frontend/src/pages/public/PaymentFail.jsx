import { motion } from "framer-motion";
import { XCircle, ArrowLeft, RefreshCw, ShoppingBag } from "lucide-react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useT } from "../../context/LanguageContext";

export default function PaymentFail() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const t        = useT();
  const orderId  = params.get("orderId") || "";

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 24 }}
        animate={{ opacity: 1, scale: 1,   y: 0  }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-3xl p-8 sm:p-12 max-w-md w-full text-center"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.1)" }}
      >
        {/* X icon */}
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 18 }}
          className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <XCircle size={48} className="text-red-400" strokeWidth={1.5} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h1 className="text-2xl font-black text-gray-900 mb-1">
            {t("পেমেন্ট ব্যর্থ হয়েছে 😔", "Payment Failed 😔")}
          </h1>
          <p className="text-gray-400 text-sm mb-6">
            {t("পেমেন্ট সফল হয়নি। আবার চেষ্টা করুন।", "Payment was not successful. Please try again.")}
          </p>

          {orderId && (
            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <p className="text-xs text-gray-400 mb-1">{t("অর্ডার রেফারেন্স", "Order Reference")}</p>
              <p className="text-sm font-black text-gray-700">{orderId}</p>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 text-left">
            <p className="text-[13px] font-bold text-amber-700 mb-1">
              {t("কী করবেন?", "What to do?")}
            </p>
            <ul className="text-[12px] text-amber-600 space-y-1 list-disc list-inside">
              <li>{t("আবার Checkout এ গিয়ে try করুন", "Go back to Checkout and try again")}</li>
              <li>{t("ভিন্ন payment method ব্যবহার করুন", "Use a different payment method")}</li>
              <li>{t("অথবা Cash on Delivery বেছে নিন", "Or choose Cash on Delivery")}</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={() => navigate("/checkout")}
              className="w-full bg-[#1a2e1a] hover:bg-[#2e7d32] text-white py-4 rounded-2xl text-sm font-black tracking-wide transition-colors flex items-center justify-center gap-2"
              style={{ boxShadow: "0 8px 32px rgba(26,46,26,0.25)" }}>
              <RefreshCw size={15}/> {t("আবার চেষ্টা করুন", "Try Again")}
            </button>
            <Link to="/"
              className="w-full border-2 border-gray-200 text-gray-500 hover:bg-gray-50 py-3 rounded-2xl text-[13px] font-semibold transition-colors flex items-center justify-center gap-1.5">
              <ShoppingBag size={13}/> {t("কেনাকাটা চালিয়ে যান", "Continue Shopping")}
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}