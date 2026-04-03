import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useT } from "../context/LanguageContext";
import { ArrowRight, Umbrella, Users, Truck, Star, CheckCircle } from "lucide-react";

const STATS = [
  { valueBn: "৫০০+", valueEn: "500+", labelBn: "সন্তুষ্ট গ্রাহক", labelEn: "Happy Customers", icon: Users, color: "#dc2626" },
  { valueBn: "১০০০+", valueEn: "1000+", labelBn: "রেইনকোট বিক্রি", labelEn: "Raincoats Sold", icon: Umbrella, color: "#1565c0" },
  { valueBn: "৬৪", valueEn: "64", labelBn: "জেলায় ডেলিভারি", labelEn: "Districts", icon: Truck, color: "#e65100" },
  { valueBn: "৫ বছর", valueEn: "5 Years", labelBn: "অভিজ্ঞতা", labelEn: "Experience", icon: Star, color: "#f59e0b" },
];

export default function AboutPreview() {
  const t = useT();

  return (
    <section className="bg-[#f8f7f4] py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="text-center mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#dc2626] mb-2">
            {t("আমাদের সম্পর্কে", "About Us")}
          </p>
          <h2 className="text-[22px] sm:text-[28px] font-black text-gray-900 leading-tight mb-3">
            {t(
              <><span className="text-[#dc2626]">নাহিদ এন্টারপ্রাইজ</span> — বাংলাদেশের বিশ্বস্ত রেইনকোট শপ</>,
              <><span className="text-[#dc2626]">Nahid Enterprise</span> — Bangladesh's Trusted Raincoat Shop</>
            )}
          </h2>
          <p className="text-[13px] text-gray-500 max-w-2xl mx-auto leading-relaxed">
            {t(
              "২০১৯ সাল থেকে আমরা বাংলাদেশের প্রতিটি কোণে উন্নত মানের রেইনকোট পৌঁছে দিচ্ছি। বৃষ্টি থেকে সুরক্ষা আমাদের ব্যবসা, আপনার বিশ্বাস আমাদের পুঁজি।",
              "Since 2019, we have been delivering high-quality raincoats to every corner of Bangladesh. Protection from rain is our business, your trust is our capital."
            )}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
                  style={{ background: `${s.color}12` }}>
                  <Icon size={16} style={{ color: s.color }} />
                </div>
                <p className="text-xl sm:text-2xl font-black" style={{ color: s.color }}>
                  {t(s.valueBn, s.valueEn)}
                </p>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">{t(s.labelBn, s.labelEn)}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Main card */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-3xl overflow-hidden"
          style={{ background: "linear-gradient(135deg,#2e1a1a 0%,#521a1a 60%,#3d1a1a 100%)" }}>
          <div className="px-6 sm:px-10 py-8 sm:py-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">

              {/* Left */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400 mb-3">
                  🌧️ {t("কেন আমাদের বেছে নেবেন?", "Why choose us?")}
                </p>
                <div className="space-y-2.5">
                  {[
                    { bn: "১০০% ওয়াটারপ্রুফ ও উইন্ডপ্রুফ রেইনকোট", en: "100% waterproof & windproof raincoats" },
                    { bn: "সারাদেশে দ্রুত ডেলিভারি — ৬৪ জেলায়", en: "Fast delivery — all 64 districts" },
                    { bn: "সহজ রিটার্ন পলিসি — ৭ দিনের মধ্যে", en: "Easy return policy — within 7 days" },
                    { bn: "৫ বছরের অভিজ্ঞতা ও বিশ্বস্ত সেবা", en: "5 years experience & trusted service" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <CheckCircle size={13} className="text-red-400 flex-shrink-0" />
                      <p className="text-[12px] sm:text-[13px] text-white/75">{t(item.bn, item.en)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right */}
              <div className="text-center sm:text-right">
                <div className="text-5xl mb-3">☂️</div>
                <p className="text-white font-black text-[16px] sm:text-[18px] mb-1 leading-tight">
                  {t("বৃষ্টি আসুক, আপনি নিরাপদ থাকুন", "Let it rain, you stay safe")}
                </p>
                <p className="text-white/50 text-[12px] mb-4">
                  {t("২০১৯ থেকে আপনার পাশে", "By your side since 2019")}
                </p>
                <Link to="/about"
                  className="inline-flex items-center gap-2 bg-white text-[#2e1a1a] hover:bg-red-50 px-5 py-2.5 rounded-xl text-[13px] font-black transition-all hover:scale-[1.02]"
                  style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
                  {t("আরো জানুন", "Show More")} <ArrowRight size={13} />
                </Link>
              </div>

            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}