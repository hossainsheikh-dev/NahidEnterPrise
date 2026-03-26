import { createContext, useContext, useState } from "react";

const SubAdminLangContext = createContext(null);

const LANG_KEY = "subAdminLang";

export function SubAdminLangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem(LANG_KEY) || "bn"; } catch { return "bn"; }
  });

  const switchLang = (l) => {
    setLang(l);
    try { localStorage.setItem(LANG_KEY, l); } catch {}
  };

  const t = (bn, en) => lang === "bn" ? bn : en;

  return (
    <SubAdminLangContext.Provider value={{ lang, switchLang, t }}>
      {children}
    </SubAdminLangContext.Provider>
  );
}

export const useSubLang = () => {
  const ctx = useContext(SubAdminLangContext);
  if (!ctx) return {
    lang: "bn",
    switchLang: () => {},
    t: (bn) => bn,
  };
  return ctx;
};