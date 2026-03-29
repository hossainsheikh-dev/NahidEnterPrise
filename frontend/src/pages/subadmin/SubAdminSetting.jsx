import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Languages, CheckCircle } from "lucide-react";
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
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        .settings-wrap, .settings-wrap * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      <div className="settings-wrap" style={{ padding: "0 8px 32px" }}>
        <div>

          {/* ── Page Title ── */}
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <h1 style={{
              fontSize: "clamp(20px,4vw,28px)",
              fontWeight: 900,
              color: "#1e293b",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: "-0.03em",
            }}>
              {t("সেটিংস", "Settings")}
            </h1>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
              {t("আপনার পছন্দ অনুযায়ী কাস্টমাইজ করুন।", "Customize your dashboard preferences.")}
            </p>
          </div>

          {/* ── Language Card ── */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
            <div style={{ width: "100%", maxWidth: 520 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  background: "linear-gradient(160deg, #ffffff, #fafbff)",
                  borderRadius: 18,
                  border: "1px solid rgba(99,102,241,0.10)",
                  boxShadow: "0 4px 24px rgba(99,102,241,0.06)",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {/* Ambient blob */}
                <div style={{
                  position: "absolute", top: -40, right: -40,
                  width: 180, height: 180, borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)",
                  pointerEvents: "none",
                }} />

                {/* Card header */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 20px",
                  borderBottom: "1px solid rgba(99,102,241,0.08)",
                  background: "rgba(99,102,241,0.025)",
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(99,102,241,0.08)",
                    border: "1px solid rgba(99,102,241,0.13)",
                    flexShrink: 0,
                  }}>
                    <Languages size={16} style={{ color: "#6366f1" }} />
                  </div>
                  <div>
                    <p style={{
                      fontSize: 14, fontWeight: 900, color: "#1e293b",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      letterSpacing: "-0.02em",
                    }}>
                      {t("ভাষা", "Language")}
                    </p>
                    <p style={{ fontSize: 11.5, marginTop: 2, color: "#94a3b8" }}>
                      {t("ড্যাশবোর্ডের ভাষা পরিবর্তন করুন", "Change the dashboard language")}
                    </p>
                  </div>
                </div>

                {/* Card body */}
                <div style={{ padding: "20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      { key: "bn", label: "বাংলা", flag: "🇧🇩" },
                      { key: "en", label: "English", flag: "🇬🇧" },
                    ].map(({ key, label, flag }) => {
                      const isActive = lang === key;
                      return (
                        <motion.button
                          key={key}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleSwitch(key)}
                          style={{
                            display: "flex", alignItems: "center",
                            justifyContent: "center", gap: 8,
                            padding: "12px 14px", borderRadius: 13,
                            cursor: "pointer",
                            fontSize: 13.5, fontWeight: isActive ? 700 : 500,
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            background: isActive
                              ? "linear-gradient(135deg, #6366f1, #4f46e5)"
                              : "#f8f9ff",
                            color: isActive ? "#fff" : "#64748b",
                            border: `1.5px solid ${isActive ? "transparent" : "rgba(99,102,241,0.10)"}`,
                            boxShadow: isActive
                              ? "0 6px 20px rgba(99,102,241,0.32)"
                              : "none",
                            transition: "all .18s ease",
                          }}
                        >
                          <span style={{ fontSize: 18 }}>{flag}</span>
                          {label}
                          {isActive && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 400, damping: 20 }}
                              style={{
                                width: 18, height: 18, borderRadius: "50%",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                background: "rgba(255,255,255,0.25)",
                              }}
                            >
                              <CheckCircle size={11} color="#fff" strokeWidth={2.5} />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Save confirmation */}
                  <AnimatePresence>
                    {saved && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          marginTop: 14,
                          display: "flex", alignItems: "center", gap: 6,
                          fontSize: 12, fontWeight: 600, color: "#10b981",
                        }}
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

        </div>
      </div>
    </>
  );
}