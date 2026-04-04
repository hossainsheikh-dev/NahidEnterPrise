import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useT } from "../../context/LanguageContext";
import {
  Shield, Truck, HeadphonesIcon, Star,
  Target, Heart, Users, Award,
  ArrowRight, CheckCircle, Package,
  Droplets, Wind, Umbrella, ThumbsUp,
} from "lucide-react";

const TEAM = [
  { nameBn: "নাহিদ হোসেন", nameEn: "Nahid Hossain", roleBn: "প্রতিষ্ঠাতা ও সিইও", roleEn: "Founder & CEO", emoji: "👨‍💼", color: "#dc2626", bg: "#fee2e2" },
  { nameBn: "সাপোর্ট টিম", nameEn: "Support Team", roleBn: "গ্রাহক সেবা", roleEn: "Customer Service", emoji: "🎧", color: "#1565c0", bg: "#e3f2fd" },
  { nameBn: "ডেলিভারি টিম", nameEn: "Delivery Team", roleBn: "লজিস্টিক্স", roleEn: "Logistics", emoji: "🚚", color: "#e65100", bg: "#fff3e0" },
];

const STATS = [
  { valueBn: "৫০০+", valueEn: "500+", labelBn: "সন্তুষ্ট গ্রাহক", labelEn: "Happy Customers", icon: Users, color: "#dc2626" },
  { valueBn: "১০০০+", valueEn: "1000+", labelBn: "রেইনকোট বিক্রি", labelEn: "Raincoats Sold", icon: Umbrella, color: "#1565c0" },
  { valueBn: "৬৪", valueEn: "64", labelBn: "জেলায় ডেলিভারি", labelEn: "Districts Covered", icon: Truck, color: "#e65100" },
  { valueBn: "৫ বছর", valueEn: "5 Years", labelBn: "অভিজ্ঞতা", labelEn: "Experience", icon: Star, color: "#f59e0b" },
];

const VALUES = [
  { icon: Droplets, titleBn: "১০০% ওয়াটারপ্রুফ", titleEn: "100% Waterproof", bodyBn: "আমাদের প্রতিটি রেইনকোট আন্তর্জাতিক মানের ওয়াটারপ্রুফ ফেব্রিক দিয়ে তৈরি।", bodyEn: "Every raincoat we sell is made with internationally standard waterproof fabric.", color: "#1565c0", bg: "#e3f2fd" },
  { icon: Heart, titleBn: "গ্রাহক সন্তুষ্টি", titleEn: "Customer First", bodyBn: "গ্রাহকের সন্তুষ্টিই আমাদের সাফল্য। প্রতিটি অভিযোগ আমরা গুরুত্বের সাথে নিই।", bodyEn: "Customer satisfaction is our success. We take every complaint seriously.", color: "#e53935", bg: "#ffebee" },
  { icon: Wind, titleBn: "উইন্ডপ্রুফ গ্যারান্টি", titleEn: "Windproof Guaranteed", bodyBn: "শুধু বৃষ্টি নয়, ঝড়ো হাওয়াতেও আমাদের রেইনকোট আপনাকে সুরক্ষিত রাখবে।", bodyEn: "Not just rain, our raincoats will keep you protected even in stormy winds.", color: "#7c3aed", bg: "#f5f3ff" },
  { icon: Award, titleBn: "দ্রুত ডেলিভারি", titleEn: "Fast Delivery", bodyBn: "সর্বোচ্চ দ্রুততায় অর্ডার প্রক্রিয়া করা এবং ডেলিভারি নিশ্চিত করা আমাদের লক্ষ্য।", bodyEn: "Our goal is to process orders and ensure delivery at maximum speed.", color: "#f59e0b", bg: "#fffbeb" },
];

export default function AboutPage() {
  const t = useT();

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f7f4]">

      {/* ── Hero — neon green bg + red font ── */}
      <div className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#2CFF05 0%,#00e63a 50%,#00cc33 100%)" }}>
        {/* subtle texture overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        {/* ambient blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle,#ffffff,transparent)", transform: "translate(30%,-30%)" }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle,#ffffff,transparent)", transform: "translate(-30%,30%)" }} />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6"
            style={{ background: "rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.15)" }}>
            <Umbrella size={12} style={{ color: "#dc2626" }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#dc2626" }}>
              {t("আমাদের সম্পর্কে", "About Us")}
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-4 tracking-tight"
            style={{ color: "#dc2626" }}>
            {t(
              "নাহিদ এন্টারপ্রাইজ — বাংলাদেশের বিশ্বস্ত রেইনকোট শপ",
              "Nahid Enterprise — Bangladesh's Trusted Raincoat Shop"
            )}
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-semibold"
            style={{ color: "#dc2626" }}>
            {t(
              "২০১৯ সাল থেকে আমরা বাংলাদেশের প্রতিটি কোণে উন্নত মানের রেইনকোট পৌঁছে দিচ্ছি। বৃষ্টি থেকে সুরক্ষা আমাদের ব্যবসা, আপনার বিশ্বাস আমাদের পুঁজি।",
              "Since 2019, we have been delivering high-quality raincoats to every corner of Bangladesh. Protection from rain is our business, your trust is our capital."
            )}
          </motion.p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-14">

        {/* ── Stats ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-5 text-center border border-gray-100 shadow-sm">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: `${s.color}15` }}>
                  <Icon size={18} style={{ color: s.color }} />
                </div>
                <p className="text-2xl font-black" style={{ color: s.color }}>{t(s.valueBn, s.valueEn)}</p>
                <p className="text-[11px] text-gray-500 font-medium mt-1">{t(s.labelBn, s.labelEn)}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Our Story ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50"
            style={{ background: "rgba(220,38,38,0.04)" }}>
            <div className="w-8 h-8 rounded-xl bg-[#fee2e2] flex items-center justify-center">
              <Heart size={15} className="text-[#dc2626]" />
            </div>
            <h2 className="text-[15px] font-black text-gray-900">{t("আমাদের গল্প", "Our Story")}</h2>
          </div>
          <div className="p-6 sm:p-8">
            <p className="text-sm sm:text-[15px] text-gray-600 leading-[1.9]">
              {t(
                "২০১৯ সালে নাহিদ এন্টারপ্রাইজ যাত্রা শুরু করেছিল একটি সহজ স্বপ্ন নিয়ে — বাংলাদেশের বর্ষা মৌসুমে মানুষকে উন্নত মানের রেইনকোট দেওয়া। বাংলাদেশে বছরে ৪-৫ মাস বৃষ্টি হয়, অথচ মানসম্পন্ন রেইনকোটের সহজলভ্যতা ছিল না। সেই সমস্যার সমাধান নিয়েই আমাদের যাত্রা শুরু। আজ ৫ বছরেরও বেশি সময় পরে আমরা বাংলাদেশের ৬৪টি জেলায় রেইনকোট পৌঁছে দিচ্ছি এবং হাজারো গ্রাহকের আস্থা অর্জন করেছি। আমাদের প্রতিটি রেইনকোট ওয়াটারপ্রুফ ও উইন্ডপ্রুফ — বৃষ্টি বা ঝড়, যেকোনো পরিস্থিতিতে আপনাকে সুরক্ষিত রাখতে আমরা প্রতিশ্রুতিবদ্ধ।",
                "Nahid Enterprise started its journey in 2019 with a simple dream — to provide high-quality raincoats to people during Bangladesh's rainy season. Bangladesh experiences rain for 4-5 months a year, yet quality raincoats were not easily accessible. Our journey began to solve that problem. After more than 5 years, we deliver raincoats to all 64 districts of Bangladesh and have earned the trust of thousands of customers. Every raincoat we make is waterproof and windproof — we are committed to keeping you protected in any situation, rain or storm."
              )}
            </p>
          </div>
        </motion.div>

        {/* ── Mission & Vision ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            {
              icon: Target,
              titleBn: "আমাদের মিশন", titleEn: "Our Mission",
              bodyBn: "বাংলাদেশের প্রতিটি মানুষের কাছে সাশ্রয়ী মূল্যে উন্নত মানের রেইনকোট পৌঁছে দেওয়া এবং বর্ষা মৌসুমে সবাইকে সুরক্ষিত রাখা।",
              bodyEn: "To deliver high-quality raincoats at affordable prices to every person in Bangladesh and keep everyone protected during the rainy season.",
              color: "#dc2626", bg: "#fee2e2",
            },
            {
              icon: Star,
              titleBn: "আমাদের ভিশন", titleEn: "Our Vision",
              bodyBn: "বাংলাদেশের সবচেয়ে বিশ্বস্ত রেইনওয়্যার ব্র্যান্ড হিসেবে নিজেদের প্রতিষ্ঠিত করা এবং দক্ষিণ এশিয়ায় আমাদের পণ্য ছড়িয়ে দেওয়া।",
              bodyEn: "To establish ourselves as Bangladesh's most trusted rainwear brand and expand our products across South Asia.",
              color: "#f59e0b", bg: "#fffbeb",
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50"
                  style={{ background: `${item.color}08` }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: item.bg }}>
                    <Icon size={15} style={{ color: item.color }} />
                  </div>
                  <h3 className="text-[14px] font-black text-gray-900">{t(item.titleBn, item.titleEn)}</h3>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-600 leading-[1.8]">{t(item.bodyBn, item.bodyEn)}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Values ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-7">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">
              {t("যা আমাদের আলাদা করে", "What sets us apart")}
            </p>
            <h2 className="text-[22px] font-black text-gray-900">{t("আমাদের মূল্যবোধ", "Our Core Values")}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4 items-start">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: v.bg }}>
                    <Icon size={18} style={{ color: v.color }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-black text-gray-900 mb-1">{t(v.titleBn, v.titleEn)}</p>
                    <p className="text-[12px] text-gray-500 leading-[1.7]">{t(v.bodyBn, v.bodyEn)}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Team ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-7">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">
              {t("আমাদের পরিবার", "Our Family")}
            </p>
            <h2 className="text-[22px] font-black text-gray-900">{t("টিম পরিচিতি", "Meet the Team")}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TEAM.map((member, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl"
                  style={{ background: member.bg }}>
                  {member.emoji}
                </div>
                <p className="text-[14px] font-black text-gray-900">{t(member.nameBn, member.nameEn)}</p>
                <p className="text-[11px] font-semibold mt-1" style={{ color: member.color }}>
                  {t(member.roleBn, member.roleEn)}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Why Choose Us — black bg + white font ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="rounded-3xl overflow-hidden"
          style={{ background: "linear-gradient(135deg,#000000 0%,#0a0a0a 60%,#000000 100%)" }}>
          <div className="px-6 sm:px-10 py-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400 mb-2">
              {t("কেন আমাদের বেছে নেবেন?", "Why choose us?")}
            </p>
            <h2 className="text-[20px] sm:text-[24px] font-black text-white mb-8">
              {t("আমাদের প্রতিশ্রুতি", "Our Commitments")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { bn: "১০০% ওয়াটারপ্রুফ ও উইন্ডপ্রুফ রেইনকোট", en: "100% waterproof & windproof raincoats" },
                { bn: "সারাদেশে দ্রুত ডেলিভারি — ৬৪ জেলায়", en: "Fast delivery nationwide — all 64 districts" },
                { bn: "সহজ রিটার্ন পলিসি — ৭ দিনের মধ্যে", en: "Easy return policy — within 7 days" },
                { bn: "২৪/৭ গ্রাহক সেবা — সবসময় আপনার পাশে", en: "24/7 customer support — always here for you" },
                { bn: "নিরাপদ পেমেন্ট — bKash, Nagad, COD", en: "Secure payment — bKash, Nagad, COD" },
                { bn: "৫ বছরের অভিজ্ঞতা ও হাজারো সন্তুষ্ট গ্রাহক", en: "5 years experience & thousands of happy customers" },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3">
                  <CheckCircle size={15} className="text-red-400 flex-shrink-0" />
                  <p className="text-[13px] text-white/80">{t(item.bn, item.en)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── CTA ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="text-4xl mb-4">🌧️</div>
          <h3 className="text-[18px] font-black text-gray-900 mb-2">
            {t("বৃষ্টি আসুক, আপনি নিরাপদ থাকুন", "Let it rain, you stay safe")}
          </h3>
          <p className="text-[13px] text-gray-500 mb-6">
            {t("আমাদের রেইনকোট কালেকশন দেখুন", "Browse our raincoat collection")}
          </p>
          <Link to="/"
            className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl text-[13px] font-black transition-colors hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#000000,#1a1a1a)", boxShadow: "0 8px 24px rgba(0,0,0,0.35)" }}>
            {t("কেনাকাটা করুন", "Shop Now")} <ArrowRight size={14} />
          </Link>
        </motion.div>

      </div>
    </div>
  );
}