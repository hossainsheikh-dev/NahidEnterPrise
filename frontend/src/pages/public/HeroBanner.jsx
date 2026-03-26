import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Zap,  } from "lucide-react";

import heroImage1 from "../../assets/hero-image1.jpg";
import heroImage2 from "../../assets/hero-image2.jpg";
import heroImage3 from "../../assets/hero-image3.jpg";
import heroImage4 from "../../assets/hero-image4.jpg";
import { useT } from "../../context/LanguageContext";



/* ── Slides এবং Features function হিসেবে — t() এর জন্য ── */
const getSlides = (t) => [
  {
    img:      heroImage4,
    badge:    t("নতুন কালেকশন", "NEW ARRIVAL"),
    eyebrow:  t("বর্ষা মৌসুমের", "Rainy season"),
    title:    t("ঝড়-সহনীয়\nবৃষ্টি-বাতাস প্রতিরোধি", "Storm-Ready\nWindbreaker"),
    subtitle: t(
      "মাল্টি-প্যানেল ডিজাইন এবং ওয়াটারপ্রুফ পারফরম্যান্স।\nযেকোনো অ্যাডভেঞ্চার উপভোগের জন্য তৈরি।",
      "Multi-panel design meets waterproof performance.\nBuilt for every adventure."
    ),
    align:  "left",
    accent: "#f59e0b",
    tags:   [t("ওয়াটারপ্রুফ", "Waterproof"), t("উইন্ডপ্রুফ", "Windproof"), t("হালকা", "Lightweight")],
  },
  {
    img:      heroImage2,
    badge:    t("সবচেয়ে জনপ্রিয়", "BEST SELLER"),
    eyebrow:  t("প্রিমিয়াম রেইনওয়্যার", "Premium Rainwear"),
    title:    t("১০০% ওয়াটারপ্রুফ\nটেক ফ্যাব্রিক", "100% Waterproof\nTech Fabric"),
    subtitle: t(
      "পানি সাথে সাথেই গড়িয়ে পড়ে। উন্নত DWR কোটিং দিয়ে\nযেকোনো বৃষ্টিতে শুকনো থাকুন।",
      "Water beads off instantly. Stay dry in any\ndownpour with advanced DWR coating." 
    ),
    align:  "right",
    accent: "#22c55e",
    tags:   [t("DWR কোটেড", "DWR Coated"), t("সিম-সিলড", "Seam-Sealed"), t("সব মৌসুম", "All-Season")],
  },
  {
    img:      heroImage3,
    badge:    t("এই মুহূর্তের জনপ্রিয় পণ্য", "TRENDING"),
    eyebrow:  t("শহুরে প্রয়োজনীয় পণ্য", "Urban Essentials"),
    title:    t("সহজে বহনযোগ্য পণ্য\nদরকারী", "Easily Carry\nEssentials"),
    subtitle: t(
      "প্রতিদিন যাতায়াতকারীদের জন্য তৈরি বিভিন্ন এক্সেসরিজ ও পন্য\nদীর্ঘস্থায়ী মজবুত মানের।",
      "Accessories and products designed for\n regular commuters. Built with strong and long-lasting quality."
    ),
    align:  "left",
    accent: "#ef4444",
    tags:   [t("পুরোপুরি ফিট", "Proper Fit"), t("ওয়াটারপ্রুফ বেস", "Waterproof Base"), t("User ফ্রেন্ডলি", "User Friendly")],
  },
  {
    img:      heroImage1,
    badge:    t("শিক্ষার্থী ও বাচ্চাদের স্পেশাল", "Student and Baby SPECIAL"),
    eyebrow:  t("শিশুদের গিয়ার কালেকশন", "Child Gear Collection"),
    title:    t("সব আবহাওয়া\nশিক্ষার্থীদের জ্যাকেট", "All-Weather\nStudent Jacket"),
    subtitle: t(
      "বহনের জন্য আরামযুক্ত ডিজাইন.\nআপনার সঙ্গীকে সুসজ্জিত এর মাঝে সুরক্ষিত রাখুন।",
      "Professional harness-integrated design.\nKeep your companion protected in style. "
    ),
    align:  "right",
    accent: "#8b5cf6",
    tags:   [t("বিল্ট-ইন হার্নেস", "Built-in Harness"), t("রিফ্লেক্টিভ", "Reflective"), t("ওয়াটারপ্রুফ", "Waterproof")],
  },
];

const getFeatures = (t) => [
  { icon: "🛡️", label: t("আসল পণ্য",       "Genuine Products"), sub: t("১০০% অরিজিনাল",         "100% authentic items")   },
  { icon: "💳", label: t("নিরাপদ পেমেন্ট",  "Secure Payment"),   sub: t("সহজেই লেনদেন",       "Easily money transfer") },
  { icon: "🎧", label: t("২৪/৭ সাপোর্ট",   "24/7 Support"),     sub: t("সবসময় আপনার পাশে",     "Always here to help")    },
  { icon: "⚡", label: t("দ্রুত ডেলিভারি", "Fast Delivery"),    sub: t("একই দিনে পাঠানো হয়", "Same day dispatch")      },
];



export default function HeroBanner() {
  const t = useT();

  const SLIDES   = getSlides(t);
  const FEATURES = getFeatures(t);

  const [current,  setCurrent ] = useState(0);
  const [dir,      setDir     ] = useState(1);
  const [paused,   setPaused  ] = useState(false);
  const [progress, setProgress] = useState(0);
  const progRef  = useRef(null);
  const startRef = useRef(null);
  const DURATION = 5800;

  const goTo = useCallback((idx, d = 1) => {
    setDir(d); setCurrent(idx); setProgress(0); startRef.current = null;
  }, []);

  const next  = useCallback(() => goTo((current + 1) % SLIDES.length,  1), [current, goTo, SLIDES.length]);
  const prev_ = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length, -1), [current, goTo, SLIDES.length]);

  useEffect(() => {
    if (paused) { cancelAnimationFrame(progRef.current); return; }
    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const p = Math.min((ts - startRef.current) / DURATION, 1);
      setProgress(p * 100);
      if (p < 1) progRef.current = requestAnimationFrame(animate);
      else next();
    };
    progRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(progRef.current);
  }, [current, paused, next]);

  const touchRef     = useRef(null);
  const onTouchStart = (e) => { touchRef.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (!touchRef.current) return;
    const d = touchRef.current - e.changedTouches[0].clientX;
    if (Math.abs(d) > 44) d > 0 ? next() : prev_();
    touchRef.current = null;
  };

  const slide  = SLIDES[current];
  const isLeft = slide.align === "left";

  const slideVariants = {
    enter:  (d) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0, scale: 1.04 }),
    center: { x: 0, opacity: 1, scale: 1, transition: { duration: 0.82, ease: [0.22, 1, 0.36, 1] } },
    exit:   (d) => ({ x: d > 0 ? "-6%" : "6%", opacity: 0, scale: 0.97, transition: { duration: 0.55, ease: [0.4, 0, 1, 1] } }),
  };

  const stagger = {
    hidden: { opacity: 0, y: 22, filter: "blur(4px)" },
    show:   (i) => ({
      opacity: 1, y: 0, filter: "blur(0px)",
      transition: { delay: i * 0.1 + 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  return (
    <div className="w-full space-y-2">

      {/* ════════ MAIN SLIDER ════════ */}
      <div
        className="relative w-full overflow-hidden"
        style={{ borderRadius: 10, boxShadow: "0 20px 64px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.12)" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative w-full" style={{ aspectRatio: "21/8", minHeight: 180 }}>

          <AnimatePresence initial={false} custom={dir}>
            <motion.div
              key={current} custom={dir}
              variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              className="absolute inset-0"
            >
              {/* Ken-Burns image */}
              <motion.img
                src={slide.img} alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ scale: 1.08 }} animate={{ scale: 1.0 }}
                transition={{ duration: 6.5, ease: "linear" }}
                style={{ filter: "brightness(0.80) saturate(1.12)" }}
              />

              {/* Cinematic gradients */}
              <div className="absolute inset-0" style={{
                background: isLeft
                  ? "linear-gradient(100deg, rgba(3,3,10,0.92) 0%, rgba(3,3,10,0.48) 40%, rgba(3,3,10,0.10) 68%, transparent 100%)"
                  : "linear-gradient(260deg, rgba(3,3,10,0.92) 0%, rgba(3,3,10,0.48) 40%, rgba(3,3,10,0.10) 68%, transparent 100%)",
              }}/>
              <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.20) 0%, transparent 25%)" }}/>
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.10) 30%, transparent 52%)" }}/>
              <div className="absolute inset-0 pointer-events-none" style={{
                background: isLeft
                  ? `radial-gradient(ellipse 60% 80% at 4% 58%, ${slide.accent}20 0%, transparent 58%)`
                  : `radial-gradient(ellipse 60% 80% at 96% 58%, ${slide.accent}20 0%, transparent 58%)`,
              }}/>

              {/* ── CONTENT ── */}
              <div className={`absolute inset-0 flex items-center ${
                isLeft ? "justify-start pl-8 sm:pl-14 md:pl-20" : "justify-end pr-8 sm:pr-14 md:pr-20"
              }`}>
                <div
                  className={`flex flex-col gap-2 sm:gap-2.5 ${isLeft ? "items-start" : "items-end text-right"}`}
                  style={{ maxWidth: "min(52%, 460px)" }}
                >
                  {/* Eyebrow */}
                  <motion.p custom={0} variants={stagger} initial="hidden" animate="show"
                    className="hidden sm:block font-semibold uppercase tracking-widest"
                    style={{ fontSize: "clamp(7px,0.72vw,9px)", color: `${slide.accent}cc`, letterSpacing: "0.22em" }}>
                    {slide.eyebrow}
                  </motion.p>

                  {/* Badge */}
                  <motion.div custom={1} variants={stagger} initial="hidden" animate="show">
                    <span className="inline-flex items-center gap-1.5 font-black uppercase rounded-md px-3 py-1"
                      style={{
                        background: slide.accent, color: "#fff",
                        fontSize: "clamp(6.5px, 0.78vw, 9px)", letterSpacing: "0.18em",
                        boxShadow: `0 4px 16px ${slide.accent}55`,
                      }}>
                      <Zap size={7} strokeWidth={3}/> {slide.badge}
                    </span>
                  </motion.div>

                  {/* Title */}
                  <motion.h2 custom={2} variants={stagger} initial="hidden" animate="show"
                    className="text-white font-black"
                    style={{
                      fontSize: "clamp(18px, 3.4vw, 52px)", lineHeight: 1.06,
                      textShadow: "0 4px 28px rgba(0,0,0,0.60)", letterSpacing: "-0.028em",
                      whiteSpace: "pre-line",
                    }}>
                    {slide.title}
                  </motion.h2>

                  {/* Subtitle */}
                  <motion.p custom={3} variants={stagger} initial="hidden" animate="show"
                    className="hidden sm:block"
                    style={{
                      fontSize: "clamp(9px, 1.05vw, 14px)", color: "rgba(255,255,255,0.62)",
                      lineHeight: 1.65, whiteSpace: "pre-line",
                    }}>
                    {slide.subtitle}
                  </motion.p>

                  {/* Tags */}
                  <motion.div custom={4} variants={stagger} initial="hidden" animate="show"
                    className={`flex flex-wrap gap-1.5 ${isLeft ? "" : "justify-end"}`}>
                    {slide.tags.map((tag) => (
                      <span key={tag} className="font-semibold"
                        style={{
                          fontSize: "clamp(6.5px, 0.76vw, 9px)", padding: "3px 10px",
                          borderRadius: 5, background: "rgba(255,255,255,0.09)",
                          color: "rgba(255,255,255,0.82)", backdropFilter: "blur(14px)",
                          border: "1px solid rgba(255,255,255,0.18)", letterSpacing: "0.04em",
                        }}>
                        ✓ {tag}
                      </span>
                    ))}
                  </motion.div>

                  {/* Stat pill */}
                </div>
              </div>

              {/* Slide counter */}
              <div className="absolute bottom-5 right-6 hidden sm:flex items-center gap-1" style={{ fontSize: 10 }}>
                <span style={{ fontWeight: 900, color: "rgba(255,255,255,0.75)" }}>{String(current + 1).padStart(2, "0")}</span>
                <span style={{ color: "rgba(255,255,255,0.2)", margin: "0 3px" }}>—</span>
                <span style={{ color: "rgba(255,255,255,0.32)" }}>{String(SLIDES.length).padStart(2, "0")}</span>
              </div>

            </motion.div>
          </AnimatePresence>

          {/* Arrows */}
          {[
            { fn: prev_, pos: "left-3 sm:left-5",   icon: <ChevronLeft  size={16} strokeWidth={2.5}/>, label: t("আগের", "Prev") },
            { fn: next,  pos: "right-3 sm:right-5", icon: <ChevronRight size={16} strokeWidth={2.5}/>, label: t("পরের", "Next") },
          ].map((btn) => (
            <button key={btn.label} onClick={btn.fn} aria-label={btn.label}
              className={`absolute top-1/2 -translate-y-1/2 ${btn.pos} z-20 flex items-center justify-center text-white transition-all duration-200 hover:scale-110 hover:bg-white/20 active:scale-95`}
              style={{
                width: "clamp(28px,2.8vw,40px)", height: "clamp(28px,2.8vw,40px)",
                borderRadius: 8, background: "rgba(255,255,255,0.11)",
                backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.22)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
              }}>
              {btn.icon}
            </button>
          ))}

          {/* Dots */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => goTo(i, i > current ? 1 : -1)}
                style={{
                  width: i === current ? 26 : 6, height: 6, borderRadius: 3,
                  background: i === current ? slide.accent : "rgba(255,255,255,0.32)",
                  boxShadow: i === current ? `0 0 14px ${slide.accent}95` : "none",
                  transition: "all 0.38s cubic-bezier(0.22,1,0.36,1)",
                  border: "none", cursor: "pointer", padding: 0,
                }}/>
            ))}
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 inset-x-0 h-[3px]" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="h-full transition-none"
              style={{ width: `${progress}%`, background: slide.accent, borderRadius: "0 2px 2px 0", boxShadow: `0 0 8px ${slide.accent}80` }}/>
          </div>
        </div>
      </div>

      {/* ════════ FEATURE STRIP ════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden"
        style={{ borderRadius: 10, background: "#dde3ea" }}>
        {FEATURES.map((f, i) => (
          <motion.div key={f.label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 + 0.15, duration: 0.45, ease: "easeOut" }}
            className="flex items-center gap-3 bg-white px-4 py-3 sm:py-4 hover:bg-slate-50 transition-colors duration-200 cursor-default">
            <span style={{ fontSize: "clamp(16px,1.8vw,20px)" }}>{f.icon}</span>
            <div>
              <p className="font-black text-slate-800" style={{ fontSize: "clamp(10px,0.95vw,12.5px)", letterSpacing: "-0.01em" }}>{f.label}</p>
              <p className="text-slate-400 mt-0.5"     style={{ fontSize: "clamp(8px,0.75vw,10.5px)" }}>{f.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
}