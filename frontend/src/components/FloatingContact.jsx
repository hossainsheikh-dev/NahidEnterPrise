import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle } from "lucide-react";
import { useT } from "../context/LanguageContext";

const WHATSAPP_NUMBER = "8801839666733";

export default function FloatingContact() {
  const [open,        setOpen       ] = useState(false);
  const [showBubble,  setShowBubble ] = useState(false);
  const [bubbleDone,  setBubbleDone ] = useState(false);
  const t = useT();

  /* ── Auto bubble after 5s ── */
  useEffect(() => {
    if (bubbleDone) return;
    const timer = setTimeout(() => {
      setShowBubble(true);
      setTimeout(() => {
        setShowBubble(false);
        setBubbleDone(true);
      }, 5000);
    }, 5000);
    return () => clearTimeout(timer);
  }, [bubbleDone]);

  /* ── Hide bubble when opened ── */
  const handleToggle = () => {
    setOpen(p => !p);
    setShowBubble(false);
    setBubbleDone(true);
  };

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        t("হ্যালো! আমি Nahid Enterprise থেকে একটি পণ্য সম্পর্কে জানতে চাই।",
          "Hello! I want to know about a product from Nahid Enterprise.")
      )}`,
      "_blank"
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">

      {/* ── Auto bubble ── */}
      <AnimatePresence>
        {showBubble && !open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="relative mr-2"
          >
            {/* Chat bubble */}
            <div className="bg-white rounded-2xl rounded-br-sm px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-gray-100 max-w-[220px]">
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#1a2e1a,#2e7d32)" }}>
                  <span className="text-white text-[12px]">🛒</span>
                </div>
                <div>
                  <p className="text-[11px] font-black text-gray-800">Nahid Enterprise</p>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
                    <p className="text-[9px] text-green-500 font-semibold">{t("অনলাইন", "Online")}</p>
                  </div>
                </div>
                <button onClick={() => { setShowBubble(false); setBubbleDone(true); }}
                  className="ml-auto w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0">
                  <X size={10} className="text-gray-500" />
                </button>
              </div>

              {/* Typing animation → then message */}
              <TypingMessage t={t} />
            </div>

            {/* Bubble tail */}
            <div className="absolute -bottom-2 right-3 w-4 h-4 bg-white border-r border-b border-gray-100"
              style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%)" }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Options panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.22 }}
            className="bg-white rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden w-[280px]"
          >
            {/* Header */}
            <div className="px-4 py-3.5 flex items-center gap-3"
              style={{ background: "linear-gradient(135deg,#1a2e1a,#2e7d32)" }}>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl flex-shrink-0">
                🛒
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-black text-white">Nahid Enterprise</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
                  <p className="text-[10px] text-white/70">{t("সাধারণত কয়েক মিনিটে রিপ্লাই করি", "Usually replies in minutes")}</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0">
                <X size={13} className="text-white" />
              </button>
            </div>

            {/* Chat preview */}
            <div className="px-4 py-4 bg-[#f0f7f0]">
              <div className="bg-white rounded-xl rounded-tl-sm px-3 py-2.5 shadow-sm inline-block max-w-[90%]">
                <p className="text-[12px] text-gray-700 leading-relaxed">
                  {t(
                    "👋 হ্যালো! আমাদের রেইনকোট কালেকশন সম্পর্কে কোনো প্রশ্ন আছে? আমরা সাহায্য করতে প্রস্তুত!",
                    "👋 Hello! Any questions about our raincoat collection? We're ready to help!"
                  )}
                </p>
                <p className="text-[9px] text-gray-400 mt-1 text-right">
                  {t("এইমাত্র", "Just now")}
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="p-3 space-y-2.5">

              {/* WhatsApp */}
              <button onClick={handleWhatsApp}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-green-100 hover:border-green-300 hover:bg-green-50 transition-all group">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                  style={{ background: "#25D366" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <p className="text-[13px] font-black text-gray-800">WhatsApp</p>
                  <p className="text-[10px] text-gray-400">{t("সরাসরি চ্যাট করুন", "Chat directly")}</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-[10px] font-black">→</span>
                </div>
              </button>

              {/* Messenger — disabled */}
              <button
  onClick={() => window.open("https://www.facebook.com/share/1Ah9rCLrwA/", "_blank")}
  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-purple-100 hover:border-purple-300 hover:bg-purple-50 transition-all group">
  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
    style={{ background: "linear-gradient(135deg,#0099FF,#A033FF,#FF0099)" }}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <path d="M12 0C5.374 0 0 4.975 0 11.111c0 3.497 1.745 6.616 4.472 8.652V24l4.086-2.242c1.09.301 2.246.464 3.442.464 6.626 0 12-4.974 12-11.111C24 4.975 18.626 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.26L19.752 8l-6.561 6.963z"/>
    </svg>
  </div>
  <div className="text-left flex-1">
    <p className="text-[13px] font-black text-gray-800">Facebook</p>
    <p className="text-[10px] text-gray-400">{t("Facebook এ যোগাযোগ করুন", "Contact on Facebook")}</p>
  </div>
  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
    <span className="text-purple-600 text-[10px] font-black">→</span>
  </div>
</button>

              {/* Phone */}
              <a href="tel:01839666733"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-blue-100 hover:border-blue-300 hover:bg-blue-50 transition-all group">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                  style={{ background: "#1565c0" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.03 1.22 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/>
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <p className="text-[13px] font-black text-gray-800">{t("ফোন করুন", "Call Us")}</p>
                  <p className="text-[10px] text-gray-400">01839666733</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-[10px] font-black">→</span>
                </div>
              </a>

            </div>

            {/* Footer */}
            <div className="px-4 pb-3 text-center">
              <p className="text-[10px] text-gray-300">
                {t("Nahid Enterprise · রেইনকোট বিশেষজ্ঞ", "Nahid Enterprise · Raincoat Specialists")}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB button ── */}
      <div className="relative">
        {/* Pulse ring */}
        {!open && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ border: "2px solid #2e7d32" }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleToggle}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-colors"
          style={{
            background: open
              ? "#ef4444"
              : "linear-gradient(135deg,#1a2e1a,#2e7d32)",
          }}>
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div key="x"
                initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <X size={22} color="white" />
              </motion.div>
            ) : (
              <motion.div key="msg"
                initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <MessageCircle size={22} color="white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

    </div>
  );
}

/* ── Typing then message animation ── */
function TypingMessage({ t }) {
  const [phase, setPhase] = useState("typing"); // "typing" | "message"

  useEffect(() => {
    const timer = setTimeout(() => setPhase("message"), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {phase === "typing" ? (
        <motion.div key="typing"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="flex items-center gap-1 py-1">
          {[0, 1, 2].map(i => (
            <motion.span key={i}
              className="w-2 h-2 rounded-full bg-gray-300"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </motion.div>
      ) : (
        <motion.p key="msg"
          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="text-[12px] text-gray-700 leading-relaxed">
          {t(
            "👋 সাহায্য দরকার? আমাদের সাথে যোগাযোগ করুন!",
            "👋 Need help? Contact us now!"
          )}
        </motion.p>
      )}
    </AnimatePresence>
  );
}