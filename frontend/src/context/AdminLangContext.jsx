import { createContext, useContext, useState } from "react";

const AdminLangContext = createContext(null);

const LANG_KEY = "adminLang";

export function AdminLangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem(LANG_KEY) || "en"; } catch { return "en"; }
  });

  const switchLang = (l) => {
    setLang(l);
    try { localStorage.setItem(LANG_KEY, l); } catch {}
  };

  const t = (bn, en) => lang === "bn" ? bn : en;

  return (
    <AdminLangContext.Provider value={{ lang, switchLang, t }}>
      {children}
    </AdminLangContext.Provider>
  );
}

export const useAdminLang = () => {
  const ctx = useContext(AdminLangContext);
  if (!ctx) return {
    lang: "en",
    switchLang: () => {},
    t: (_bn, en) => en,
  };
  return ctx;
};