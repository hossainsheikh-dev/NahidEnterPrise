import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Languages, CheckCircle, Settings, Truck, Save, Loader2 } from "lucide-react";
import { useAdminLang } from "../../context/AdminLangContext";
import toast from "react-hot-toast";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function AdminSettings() {
  const { lang, switchLang, t } = useAdminLang();
  const [activeTab, setActiveTab] = useState("delivery");
  const [saved,     setSaved    ] = useState(false);

  const [deliveryInDhaka,      setDeliveryInDhaka     ] = useState(60);
  const [deliveryOutsideDhaka, setDeliveryOutsideDhaka] = useState(120);
  const [freeDeliveryMinimum,  setFreeDeliveryMinimum ] = useState(2500);
  const [freeDeliveryEnabled,  setFreeDeliveryEnabled ] = useState(true);
  const [loadingDelivery,      setLoadingDelivery     ] = useState(true);
  const [savingDelivery,       setSavingDelivery      ] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/settings`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setDeliveryInDhaka(d.data.deliveryInDhaka           ?? 60);
          setDeliveryOutsideDhaka(d.data.deliveryOutsideDhaka ?? 120);
          setFreeDeliveryMinimum(d.data.freeDeliveryMinimum   ?? 2500);
          setFreeDeliveryEnabled(d.data.freeDeliveryEnabled   ?? true);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingDelivery(false));
  }, []);

  const handleSwitchLang = (l) => {
    switchLang(l);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveDelivery = async () => {
    try {
      setSavingDelivery(true);
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const res = await fetch(`${API}/api/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          deliveryInDhaka:      Number(deliveryInDhaka),
          deliveryOutsideDhaka: Number(deliveryOutsideDhaka),
          freeDeliveryMinimum:  Number(freeDeliveryMinimum),
          freeDeliveryEnabled,
        }),
      });
      const data = await res.json();
      if (data.success) toast.success(t("ডেলিভারি চার্জ সেভ হয়েছে!", "Delivery charges saved!"));
      else toast.error(data.message || "Failed");
    } catch {
      toast.error("Server error");
    } finally {
      setSavingDelivery(false);
    }
  };

  const TABS = [
    { key: "delivery", labelBn: "ডেলিভারি চার্জ", labelEn: "Delivery Charge", icon: Truck,     color: "#22c55e" },
    { key: "language", labelBn: "ভাষা",             labelEn: "Language",        icon: Languages, color: "#a78bfa" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        .as-wrap * { box-sizing: border-box; }
        .as-wrap { font-family: 'DM Sans', sans-serif; }
        .as-lang-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 16px 20px; border-radius: 14px; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.2s; border: 1px solid transparent;
          font-family: 'DM Sans', sans-serif; position: relative; overflow: hidden;
        }
        .as-lang-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%);
          pointer-events: none;
        }
        .as-lang-btn:hover { transform: translateY(-1px); }
        .as-lang-btn:active { transform: scale(0.98); }
        .as-input {
          width: 100%; padding: 10px 14px; border-radius: 10px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          color: #e2e8f0; font-size: 14px; font-weight: 600; outline: none;
          font-family: 'DM Sans', sans-serif; transition: all 0.2s;
        }
        .as-input:focus { border-color: rgba(201,168,76,0.4); background: rgba(255,255,255,0.08); }
        .as-input::-webkit-inner-spin-button { opacity: 0; }
      `}</style>

      <div className="as-wrap max-w-xl mx-auto pb-10">

        {/* ══ HEADER ══ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-2xl overflow-hidden mb-6"
          style={{
            background: "linear-gradient(135deg,#0d1426 0%,#111827 50%,#0f172a 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          }}>
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg,transparent,rgba(201,168,76,0.6) 30%,rgba(139,92,246,0.6) 70%,transparent)" }}/>
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
            backgroundSize: "32px 32px",
          }}/>
          <div className="absolute pointer-events-none" style={{
            top: "-60px", right: "-40px", width: "200px", height: "200px", borderRadius: "50%",
            background: "radial-gradient(circle,rgba(201,168,76,0.07) 0%,transparent 70%)",
          }}/>
          <div className="relative p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg,rgba(201,168,76,0.15),rgba(201,168,76,0.05))",
                  border: "1px solid rgba(201,168,76,0.2)",
                }}>
                <Settings size={22} style={{ color: "#c9a84c" }}/>
              </div>
              <div>
                <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "22px", color: "#f1f5f9", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                  {t("সেটিংস", "Settings")}
                </h1>
                <p className="text-xs mt-1" style={{ color: "#475569" }}>
                  {t("আপনার পছন্দ অনুযায়ী কাস্টমাইজ করুন।", "Customize your dashboard preferences.")}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ══ TAB BUTTONS ══ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="flex gap-2 mb-5 p-1 rounded-2xl"
          style={{ background: "#0d1426", border: "1px solid rgba(255,255,255,0.07)" }}>
          {TABS.map(tab => {
            const Icon     = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <motion.button key={tab.key} whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab(tab.key)}
                className="flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-[13px] font-bold transition-all duration-200"
                style={{
                  background: isActive ? `linear-gradient(135deg,${tab.color}22,${tab.color}10)` : "transparent",
                  color:      isActive ? tab.color : "#475569",
                  border:     isActive ? `1px solid ${tab.color}33` : "1px solid transparent",
                  boxShadow:  isActive ? `0 4px 16px ${tab.color}18` : "none",
                }}>
                <Icon size={15} />
                <span>{t(tab.labelBn, tab.labelEn)}</span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* ══ TAB CONTENT ══ */}
        <AnimatePresence mode="wait">

          {/* ── Delivery Tab ── */}
          {activeTab === "delivery" && (
            <motion.div key="delivery"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}
              className="rounded-2xl overflow-hidden"
              style={{
                background: "#0d1426",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}>

              <div className="flex items-center gap-3 px-5 py-4"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.15)" }}>
                  <Truck size={17} style={{ color: "#22c55e" }}/>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>
                    {t("ডেলিভারি চার্জ", "Delivery Charge")}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
                    {t("ঢাকার ভেতরে ও বাইরে আলাদা চার্জ সেট করুন", "Set separate charges for inside and outside Dhaka")}
                  </p>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {loadingDelivery ? (
                  <div className="flex items-center justify-center py-8 gap-3">
                    <div className="w-5 h-5 border-2 border-gray-600 border-t-green-400 rounded-full animate-spin" />
                    <p className="text-sm text-gray-500">{t("লোড হচ্ছে...", "Loading...")}</p>
                  </div>
                ) : (
                  <>
                    {/* Inside Dhaka */}
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-widest mb-2 flex items-center gap-2"
                        style={{ color: "#64748b" }}>
                        <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"/>
                        {t("ঢাকার ভেতরে", "Inside Dhaka")}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold"
                          style={{ color: "#64748b" }}>৳</span>
                        <input type="number" min="0"
                          value={deliveryInDhaka}
                          onChange={e => setDeliveryInDhaka(e.target.value)}
                          className="as-input" style={{ paddingLeft: "28px" }} placeholder="60" />
                      </div>
                      <p className="text-[10px] mt-1.5" style={{ color: "#374151" }}>
                        {t("ঢাকা জেলার মধ্যে সকল অর্ডারে প্রযোজ্য", "Applied to all orders within Dhaka district")}
                      </p>
                    </div>

                    {/* Outside Dhaka */}
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-widest mb-2 flex items-center gap-2"
                        style={{ color: "#64748b" }}>
                        <span className="w-2 h-2 rounded-full bg-orange-400 inline-block"/>
                        {t("ঢাকার বাইরে", "Outside Dhaka")}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold"
                          style={{ color: "#64748b" }}>৳</span>
                        <input type="number" min="0"
                          value={deliveryOutsideDhaka}
                          onChange={e => setDeliveryOutsideDhaka(e.target.value)}
                          className="as-input" style={{ paddingLeft: "28px" }} placeholder="120" />
                      </div>
                      <p className="text-[10px] mt-1.5" style={{ color: "#374151" }}>
                        {t("ঢাকার বাইরে সকল জেলায় প্রযোজ্য", "Applied to all districts outside Dhaka")}
                      </p>
                    </div>

                    {/* Free Delivery Toggle */}
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-widest mb-2 flex items-center gap-2"
                        style={{ color: "#64748b" }}>
                        <span className="w-2 h-2 rounded-full bg-purple-400 inline-block"/>
                        {t("ফ্রি ডেলিভারি সিস্টেম", "Free Delivery System")}
                      </label>
                      <button onClick={() => setFreeDeliveryEnabled(p => !p)}
                        className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all"
                        style={{
                          background: freeDeliveryEnabled ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${freeDeliveryEnabled ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"}`,
                        }}>
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{freeDeliveryEnabled ? "🚚" : "🚫"}</span>
                          <div className="text-left">
                            <p className="text-[13px] font-bold"
                              style={{ color: freeDeliveryEnabled ? "#4ade80" : "#64748b" }}>
                              {freeDeliveryEnabled
                                ? t("ফ্রি ডেলিভারি চালু", "Free Delivery ON")
                                : t("ফ্রি ডেলিভারি বন্ধ", "Free Delivery OFF")
                              }
                            </p>
                            <p className="text-[10px]" style={{ color: "#475569" }}>
                              {freeDeliveryEnabled
                                ? t(`৳${Number(freeDeliveryMinimum).toLocaleString()}+ অর্ডারে ফ্রি`, `Free on orders ৳${Number(freeDeliveryMinimum).toLocaleString()}+`)
                                : t("সব অর্ডারে ডেলিভারি চার্জ যোগ হবে", "Delivery charge on all orders")
                              }
                            </p>
                          </div>
                        </div>
                        {/* Toggle switch */}
                        <div className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${
                          freeDeliveryEnabled ? "bg-green-500" : "bg-gray-600"
                        }`}>
                          <motion.div
                            animate={{ x: freeDeliveryEnabled ? 20 : 2 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                          />
                        </div>
                      </button>
                    </div>

                    {/* Free Delivery Minimum — only if enabled */}
                    <AnimatePresence>
                      {freeDeliveryEnabled && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden">
                          <label className="text-[11px] font-black uppercase tracking-widest mb-2 flex items-center gap-2"
                            style={{ color: "#64748b" }}>
                            <span className="w-2 h-2 rounded-full bg-green-400 inline-block"/>
                            {t("ফ্রি ডেলিভারির ন্যূনতম অর্ডার", "Free Delivery Minimum")}
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold"
                              style={{ color: "#64748b" }}>৳</span>
                            <input type="number" min="0"
                              value={freeDeliveryMinimum}
                              onChange={e => setFreeDeliveryMinimum(e.target.value)}
                              className="as-input" style={{ paddingLeft: "28px" }} placeholder="2500" />
                          </div>
                          <p className="text-[10px] mt-1.5" style={{ color: "#374151" }}>
                            {t("এই পরিমাণের বেশি অর্ডারে ডেলিভারি ফ্রি হবে", "Orders above this amount get free delivery")}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Preview */}
                    <div className="rounded-xl p-4 space-y-2.5"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#475569" }}>
                        {t("প্রিভিউ", "Preview")}
                      </p>
                      <div className="flex items-center justify-between text-[12px]">
                        <span style={{ color: "#64748b" }}>{t("ঢাকার ভেতরে", "Inside Dhaka")}</span>
                        <span className="font-black" style={{ color: "#60a5fa" }}>৳{Number(deliveryInDhaka).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-[12px]">
                        <span style={{ color: "#64748b" }}>{t("ঢাকার বাইরে", "Outside Dhaka")}</span>
                        <span className="font-black" style={{ color: "#fb923c" }}>৳{Number(deliveryOutsideDhaka).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-[12px]">
                        <span style={{ color: "#64748b" }}>{t("ফ্রি ডেলিভারি", "Free Delivery")}</span>
                        <span className="font-black" style={{ color: freeDeliveryEnabled ? "#4ade80" : "#ef4444" }}>
                          {freeDeliveryEnabled
                            ? t(`৳${Number(freeDeliveryMinimum).toLocaleString()}+ এ ফ্রি 🎉`, `Free on ৳${Number(freeDeliveryMinimum).toLocaleString()}+ 🎉`)
                            : t("বন্ধ 🚫", "Disabled 🚫")
                          }
                        </span>
                      </div>
                    </div>

                    {/* Save */}
                    <motion.button whileTap={{ scale: 0.97 }}
                      onClick={handleSaveDelivery}
                      disabled={savingDelivery}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold transition-all"
                      style={{
                        background: savingDelivery ? "rgba(34,197,94,0.1)" : "linear-gradient(135deg,#14532d,#166534)",
                        color: savingDelivery ? "#4ade80" : "#fff",
                        border: "1px solid rgba(34,197,94,0.2)",
                        boxShadow: savingDelivery ? "none" : "0 4px 16px rgba(34,197,94,0.2)",
                      }}>
                      {savingDelivery
                        ? <><Loader2 size={15} className="animate-spin" /> {t("সেভ হচ্ছে...", "Saving...")}</>
                        : <><Save size={15} /> {t("সেভ করুন", "Save Changes")}</>
                      }
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Language Tab ── */}
          {activeTab === "language" && (
            <motion.div key="language"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}
              className="rounded-2xl overflow-hidden"
              style={{
                background: "#0d1426",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}>

              <div className="flex items-center gap-3 px-5 py-4"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.15)" }}>
                  <Languages size={17} style={{ color: "#a78bfa" }}/>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>
                    {t("ভাষা", "Language")}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
                    {t("ড্যাশবোর্ডের ভাষা পরিবর্তন করুন", "Change the dashboard language")}
                  </p>
                </div>
              </div>

              <div className="p-5">
                <div className="flex gap-3">
                  {[
                    { key: "bn", label: "বাংলা",  flag: "🇧🇩" },
                    { key: "en", label: "English", flag: "🇬🇧" },
                  ].map(({ key, label, flag }) => {
                    const isActive = lang === key;
                    return (
                      <motion.button key={key}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={() => handleSwitchLang(key)}
                        className="as-lang-btn"
                        style={{
                          background:  isActive ? "linear-gradient(135deg,rgba(201,168,76,0.18),rgba(201,168,76,0.08))" : "rgba(255,255,255,0.03)",
                          borderColor: isActive ? "rgba(201,168,76,0.35)" : "rgba(255,255,255,0.08)",
                          color:       isActive ? "#e8c876" : "#64748b",
                          boxShadow:   isActive ? "0 4px 16px rgba(201,168,76,0.15), inset 0 1px 0 rgba(201,168,76,0.1)" : "none",
                        }}>
                        <span style={{ fontSize: "22px", lineHeight: 1 }}>{flag}</span>
                        <span style={{ fontSize: "14px", fontWeight: 600 }}>{label}</span>
                        {isActive && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="flex items-center justify-center"
                            style={{
                              width: "18px", height: "18px", borderRadius: "50%",
                              background: "rgba(201,168,76,0.2)", border: "1px solid rgba(201,168,76,0.3)",
                            }}>
                            <CheckCircle size={11} style={{ color: "#c9a84c" }}/>
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {saved && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
                      className="mt-4 flex items-center gap-2 text-xs font-semibold px-1"
                      style={{ color: "#34d399" }}>
                      <CheckCircle size={13}/>
                      {t("ভাষা সংরক্ষিত হয়েছে!", "Language saved!")}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </>
  );
}