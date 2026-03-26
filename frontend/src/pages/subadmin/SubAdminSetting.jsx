import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Languages, CheckCircle, Palette } from "lucide-react";
import { useSubLang } from "../../context/SubAdminLangContext";

export default function SubAdminSettings() {
  const { lang, switchLang, t } = useSubLang();
  const [saved, setSaved] = useState(false);

  const handleSwitch = (l) => {
    switchLang(l);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        .settings-wrap, .settings-wrap * { box-sizing: border-box; }
        .settings-wrap { font-family: 'DM Sans', sans-serif; }
        .settings-serif { font-family: 'Syne', sans-serif; }

        .settings-lang-btn { transition: transform 0.16s cubic-bezier(.4,0,.2,1), box-shadow 0.16s ease, background 0.16s ease; }
        .settings-lang-btn:hover { transform: translateY(-1px); }
      `}</style>

      <div className="settings-wrap px-0 sm:px-4 md:px-6 lg:px-8">

        {/* ── page title ── */}
        <div className="text-center mb-8 px-3 sm:px-0">
          <h1
            className="settings-serif text-2xl sm:text-3xl font-black tracking-[-0.03em]"
            style={{ color: "#1e293b" }}
          >
            {t("সেটিংস", "Settings")}
          </h1>
          <p className="text-[13px] sm:text-sm mt-1.5" style={{ color: "#94a3b8" }}>
            {t("আপনার পছন্দ অনুযায়ী কাস্টমাইজ করুন।", "Customize your dashboard preferences.")}
          </p>
        </div>

        <div className="max-w-xl mx-auto space-y-4 px-3 sm:px-0">

          {/* ── language Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            style={{
              background: "linear-gradient(160deg, #ffffff 0%, #fafbff 100%)",
              borderRadius: 20,
              border: "1px solid rgba(99,102,241,0.11)",
              boxShadow: "0 4px 24px rgba(99,102,241,0.07), 0 1px 0 rgba(99,102,241,0.05)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* subtle corner glow */}
            <div
              style={{
                position: "absolute", top: -40, right: -40,
                width: 160, height: 160, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />

            {/* card header */}
            <div
              className="flex items-center gap-3 px-5 py-4"
              style={{ borderBottom: "1px solid rgba(99,102,241,0.08)" }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.12)",
                }}
              >
                <Languages size={17} style={{ color: "#6366f1" }} />
              </div>
              <div>
                <p
                  className="settings-serif text-[13.5px] font-bold"
                  style={{ color: "#1e293b" }}
                >
                  {t("ভাষা", "Language")}
                </p>
                <p className="text-[11.5px] mt-0.5" style={{ color: "#94a3b8" }}>
                  {t("ড্যাশবোর্ডের ভাষা পরিবর্তন করুন", "Change the dashboard language")}
                </p>
              </div>
            </div>

            {/* card body */}
            <div className="p-5">
              <div className="flex gap-3">
                {[
                  { key: "bn", label: "বাংলা", flag: "🇧🇩" },
                  { key: "en", label: "English", flag: "🇬🇧" },
                ].map(({ key, label, flag }) => {
                  const isActive = lang === key;
                  return (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleSwitch(key)}
                      className="settings-lang-btn flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-[13.5px] font-bold"
                      style={{
                        background: isActive
                          ? "linear-gradient(135deg, #6366f1, #4f46e5)"
                          : "rgba(99,102,241,0.04)",
                        color: isActive ? "#fff" : "#64748b",
                        border: `1.5px solid ${isActive ? "transparent" : "rgba(99,102,241,0.12)"}`,
                        boxShadow: isActive
                          ? "0 6px 20px rgba(99,102,241,0.32), 0 1px 0 rgba(255,255,255,0.15) inset"
                          : "none",
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{flag}</span>
                      {label}
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                          className="w-[18px] h-[18px] rounded-full flex items-center justify-center"
                          style={{ background: "rgba(255,255,255,0.25)" }}
                        >
                          <CheckCircle size={11} color="#fff" strokeWidth={2.5} />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* save confirmation */}
              <AnimatePresence>
                {saved && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 flex items-center gap-2 text-[12px] font-semibold"
                    style={{ color: "#10b981" }}
                  >
                    <CheckCircle size={13} strokeWidth={2.5} />
                    {t("ভাষা সংরক্ষিত হয়েছে!", "Language saved!")}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

        </div>
      </div>
    </>
  );
}