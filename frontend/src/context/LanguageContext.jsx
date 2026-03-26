import { createContext, useContext, useState } from "react";

/* ── Default value — Provider ছাড়াও কাজ করবে ── */
const LanguageContext = createContext({
  lang:       "bn",
  toggleLang: () => {},
  isBn:       true,
});

const LANG_KEY = "ne_language";

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem(LANG_KEY) || "bn"; } catch { return "bn"; }
  });

  const toggleLang = (l) => {
    const next = l || (lang === "bn" ? "en" : "bn");
    setLang(next);
    try { localStorage.setItem(LANG_KEY, next); } catch {}
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, isBn: lang === "bn" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);

/* ── Translation helper ──
   Usage:  const t = useT();
           t("বাংলা টেক্সট", "English text")
*/
export function useT() {
  const ctx = useContext(LanguageContext);
  const isBn = ctx?.isBn ?? true;
  return (bn, en) => isBn ? bn : en;
}