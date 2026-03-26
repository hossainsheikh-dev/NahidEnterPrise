import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, ShoppingBag, Clock, Package } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useT } from "../../context/LanguageContext";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const t        = useT();
  const orderId  = params.get("orderId") || "";
  const total    = params.get("total")   || "";

  useEffect(() => {
    const timer = setTimeout(() => navigate("/"), 8000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 24 }}
        animate={{ opacity: 1, scale: 1,   y: 0  }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-3xl p-8 sm:p-12 max-w-md w-full text-center"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.1)" }}
      >
        {/* Checkmark */}
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 18 }}
          className="w-24 h-24 bg-[#e8f5e9] rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle size={48} className="text-[#2e7d32]" strokeWidth={1.5} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h1 className="text-2xl font-black text-gray-900 mb-1">
            {t("পেমেন্ট সফল হয়েছে! 🎉", "Payment Successful! 🎉")}
          </h1>
          <p className="text-gray-400 text-sm mb-8">
            {t("আপনার পেমেন্ট সফলভাবে সম্পন্ন হয়েছে।", "Your payment has been completed successfully.")}
          </p>

          {/* Details */}
          <div className="bg-[#f8f8f5] rounded-2xl p-5 mb-6 text-left space-y-3">
            {orderId && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">{t("অর্ডার আইডি", "Order ID")}</span>
                <span className="text-sm font-black text-[#1a2e1a]">{orderId}</span>
              </div>
            )}
            {total && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">{t("পরিশোধিত পরিমাণ", "Amount Paid")}</span>
                <span className="text-sm font-black text-[#1a2e1a]">৳{Number(total).toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">{t("পেমেন্ট স্ট্যাটাস", "Payment Status")}</span>
              <span className="text-sm font-bold text-[#2e7d32] flex items-center gap-1">
                <CheckCircle size={12} strokeWidth={2.5}/> {t("নিশ্চিত", "Confirmed")}
              </span>
            </div>
          </div>

          {/* Notices */}
          <div className="flex flex-col gap-2.5 mb-8">
            <div className="flex items-center gap-2.5 bg-[#e8f5e9] rounded-xl px-4 py-3 text-left">
              <Package size={14} className="text-[#2e7d32] flex-shrink-0"/>
              <p className="text-[12px] text-[#2e7d32] font-semibold">
                {t("অর্ডার প্রসেসিং শুরু হয়েছে", "Order processing has started")}
              </p>
            </div>
            <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-4 py-3 text-left">
              <Clock size={14} className="text-gray-400 flex-shrink-0"/>
              <p className="text-[12px] text-gray-500 font-medium">
                {t("আমাদের টিম ১-২ ঘণ্টার মধ্যে যোগাযোগ করবে", "Our team will contact you within 1-2 hours")}
              </p>
            </div>
          </div>

          <button onClick={() => navigate("/")}
            className="w-full bg-[#1a2e1a] hover:bg-[#2e7d32] text-white py-4 rounded-2xl text-sm font-black tracking-wide transition-colors flex items-center justify-center gap-2"
            style={{ boxShadow: "0 8px 32px rgba(26,46,26,0.25)" }}>
            <ShoppingBag size={16}/> {t("কেনাকাটা চালিয়ে যান", "Continue Shopping")}
          </button>
          <p className="text-[10px] text-gray-300 mt-3">
            {t("৮ সেকেন্ড পর automatically redirect হবে", "You will be redirected in 8 seconds")}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}