import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  BarChart3, Settings, User, LogOut, Menu, X,
  ShieldCheck, Truck, Link as LinkIcon, Layers,
  Search, ChevronRight,
} from "lucide-react";
import { showLogoutToast } from "../../utils/toast/logoutToast";
import { SubAdminLangProvider, useSubLang } from "../../context/SubAdminLangContext";
import SubAdminOrderBell from "../../components/SubAdminOrderBell";
import FloatingChat from "../../components/FloatingChat";

const API = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;

const MENU_ITEMS = [
  { key: "dashboard", icon: LayoutDashboard, path: "/subadmin/dashboard", color: "#6366f1", grad: "linear-gradient(135deg,#6366f1,#4f46e5)", bn: "ড্যাশবোর্ড",  en: "Dashboard" },
  { key: "products",  icon: Package,         path: "/subadmin/products",  color: "#8b5cf6", grad: "linear-gradient(135deg,#8b5cf6,#7c3aed)", bn: "পণ্য",         en: "Products"  },
  { key: "orders",    icon: ShoppingCart,    path: "/subadmin/orders",    color: "#0891b2", grad: "linear-gradient(135deg,#06b6d4,#0891b2)", bn: "অর্ডার",        en: "Orders"    },
  { key: "delivery",  icon: Truck,           path: "/subadmin/delivery",  color: "#059669", grad: "linear-gradient(135deg,#10b981,#059669)", bn: "ডেলিভারি",      en: "Delivery"  },
  { key: "users",     icon: Users,           path: "/subadmin/users",     color: "#d97706", grad: "linear-gradient(135deg,#f59e0b,#d97706)", bn: "ব্যবহারকারী",   en: "Users"     },
  { key: "analytics", icon: BarChart3,       path: "/subadmin/analytics", color: "#dc2626", grad: "linear-gradient(135deg,#ef4444,#dc2626)", bn: "বিশ্লেষণ",      en: "Analytics" },
  { key: "links",     icon: LinkIcon,        path: "/subadmin/links",     color: "#db2777", grad: "linear-gradient(135deg,#ec4899,#db2777)", bn: "লিংক",          en: "Links"     },
  { key: "sublinks",  icon: Layers,          path: "/subadmin/sublinks",  color: "#0d9488", grad: "linear-gradient(135deg,#14b8a6,#0d9488)", bn: "সাবলিংক",       en: "SubLinks"  },
  { key: "settings",  icon: Settings,        path: "/subadmin/settings",  color: "#475569", grad: "linear-gradient(135deg,#64748b,#475569)", bn: "সেটিংস",        en: "Settings"  },
];

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.04 } } },
  item: {
    hidden: { opacity:0, x:-14 },
    show:   { opacity:1, x:0, transition:{ type:"spring", stiffness:300, damping:26 } },
  },
};

function DashboardInner() {
  const navigate      = useNavigate();
  const location      = useLocation();
  const { t }         = useSubLang();

  const [sidebarOpen,   setSidebarOpen]  = useState(false);
  const [search,        setSearch]       = useState("");
  const [dropdownOpen,  setDropdownOpen] = useState(false);
  const [searchOpen,    setSearchOpen]   = useState(false);
  const [approvedNotif, setApprovedNotif] = useState(false);
  const [adminInfo,     setAdminInfo]    = useState(null);

  const subAdminInfo = JSON.parse(localStorage.getItem("subAdminInfo") || "{}");

  useEffect(() => {
    const token = localStorage.getItem("subAdminToken");
    const info  = localStorage.getItem("subAdminInfo");
    if (!token || !info) navigate("/subadmin/signup-login-page", { replace: true });
  }, [navigate]);

  // Admin info fetch
  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const token = localStorage.getItem("subAdminToken");
        if (!token) return;

        const res  = await fetch(`${API}/api/auth/admin-info`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data?._id) {
          setAdminInfo({ id: data._id, name: data.name, role: "admin", model: "User" });
        }
      } catch (e) {
        console.error("Admin info fetch error:", e);
      }
    };

    if (subAdminInfo?._id) fetchAdminInfo();
  }, [subAdminInfo._id]);

  // Approval notification

  const subAdminId     = subAdminInfo?._id;
const subAdminStatus = subAdminInfo?.status;

useEffect(() => {
  const key = `sa_approved_notif_${subAdminId}`;
  if (subAdminStatus === "approved" && !localStorage.getItem(key)) {
    setApprovedNotif(true);
    localStorage.setItem(key, "1");
    setTimeout(() => setApprovedNotif(false), 6000);
  }
}, [subAdminId, subAdminStatus]);

  const getInitials = (name = "") => {
    const w = name.trim().split(/\s+/);
    return ((w[0]?.[0] || "") + (w[1]?.[0] || "")).toUpperCase() || "SA";
  };

  const filteredMenu = useMemo(() =>
    MENU_ITEMS.filter(i =>
      i.bn.includes(search) || i.en.toLowerCase().includes(search.toLowerCase())
    ), [search]
  );

  const handleLogout = () => {
    showLogoutToast(subAdminInfo?.name);
    localStorage.removeItem("subAdminToken");
    localStorage.removeItem("subAdminInfo");
    setTimeout(() => navigate("/subadmin/signup-login-page", { replace: true }), 1200);
  };

  const activeItem = MENU_ITEMS.find(i => i.path === location.pathname);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        .sa-wrap, .sa-wrap * { box-sizing: border-box; }
        .sa-wrap { font-family: 'DM Sans', sans-serif; }
        .sa-serif { font-family: 'Syne', sans-serif; }
        .sa-nav::-webkit-scrollbar { width: 2px; }
        .sa-nav::-webkit-scrollbar-track { background: transparent; }
        .sa-nav::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 99px; }
        .sa-main::-webkit-scrollbar { width: 4px; }
        .sa-main::-webkit-scrollbar-track { background: transparent; }
        .sa-main::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.12); border-radius: 99px; }
        .sa-nav-item { transition: transform 0.18s cubic-bezier(.4,0,.2,1), background 0.18s ease, box-shadow 0.18s ease; }
        .sa-nav-item:hover { transform: translateX(4px); }
        .sa-search { font-family: 'DM Sans', sans-serif; }
        .sa-search::placeholder { color: #a8b4c8; }
        .sa-search:focus { outline: none; }
        .sa-top-search { font-family: 'DM Sans', sans-serif; }
        .sa-top-search::placeholder { color: #9ca8b8; }
        .sa-top-search:focus { outline: none; }
        @keyframes sa-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .sa-shimmer {
          background: linear-gradient(90deg, #4f46e5 0%, #818cf8 35%, #6366f1 50%, #818cf8 65%, #4f46e5 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: sa-shimmer 5s linear infinite;
        }
        @keyframes sa-pill-in {
          from { transform: scaleY(0); opacity: 0; }
          to   { transform: scaleY(1); opacity: 1; }
        }
        .sa-active-pill { animation: sa-pill-in 0.22s cubic-bezier(.4,0,.2,1); }
        @keyframes sa-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.5; transform: scale(0.85); }
        }
        .sa-pulse { animation: sa-pulse 2.2s ease-in-out infinite; }
        .sa-backdrop { backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
        @keyframes sa-pop {
          0%   { transform: scale(0); }
          70%  { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .sa-pop { animation: sa-pop 0.35s cubic-bezier(.4,0,.2,1) 0.5s both; }
        @media (max-width: 640px) {
          .sa-topbar-search-wrap { display: none !important; }
          .sa-breadcrumb-full    { display: none !important; }
        }
        @media (max-width: 480px) {
          .sa-username-chip { display: none !important; }
        }
        .sa-dd-item { transition: background 0.13s ease, color 0.13s ease, transform 0.13s ease; }
        .sa-dd-item:hover { background: #f5f3ff !important; color: #4f46e5 !important; }
        .sa-topbar-btn { transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.12s ease; }
        .sa-topbar-btn:hover { background: #f0eeff !important; border-color: rgba(99,102,241,0.25) !important; color: #6366f1 !important; }
      `}</style>

      <div className="sa-wrap flex h-screen overflow-hidden" style={{ background: "#f0f2f8" }}>

        {/* Mobile overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              className="sa-backdrop fixed inset-0 z-40 lg:hidden"
              style={{ background: "rgba(30,27,75,0.35)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* SIDEBAR */}
        <aside
          className={`
            fixed top-0 left-0 h-full z-50 flex flex-col
            w-[264px] flex-shrink-0
            lg:relative lg:z-auto lg:translate-x-0
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          style={{
            background: "linear-gradient(180deg, #ffffff 0%, #fafbff 60%, #f5f3ff 100%)",
            borderRight: "1px solid rgba(99,102,241,0.10)",
            boxShadow: "4px 0 32px rgba(99,102,241,0.07), 1px 0 0 rgba(99,102,241,0.06)",
          }}
        >
          <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: `radial-gradient(ellipse 200px 160px at 0% 0%, rgba(99,102,241,0.06) 0%, transparent 70%), radial-gradient(ellipse 180px 200px at 100% 100%, rgba(139,92,246,0.05) 0%, transparent 70%)` }} />
          <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(99,102,241,0.07) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
          <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)" }} />

          {/* Brand */}
          <div className="relative flex items-center justify-between px-5 pt-[22px] pb-5 flex-shrink-0" style={{ borderBottom: "1px solid rgba(99,102,241,0.09)" }}>
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 7, scale: 1.07 }}
                transition={{ type: "spring", stiffness: 380, damping: 20 }}
                className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", boxShadow: "0 6px 20px rgba(99,102,241,0.35), 0 1px 0 rgba(255,255,255,0.2) inset" }}
              >
                <ShieldCheck size={18} color="#fff" strokeWidth={2} />
              </motion.div>
              <div>
                <p className="sa-shimmer sa-serif text-[14px] font-black tracking-[-0.02em] leading-none">SubAdmin</p>
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.22em] mt-1" style={{ color: "#a5b4c8" }}>Nahid Enterprise</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.14)", color: "#6366f1" }}>
              <X size={13} />
            </button>
          </div>

          {/* Search */}
          <div className="relative px-4 pt-4 pb-2 flex-shrink-0">
            <Search size={13} className="absolute pointer-events-none" style={{ color: "#a8b4c8", left: 26, top: "50%", transform: "translateY(-22%)" }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t("মেনু খুঁজুন...", "Search menu...")}
              className="sa-search w-full pl-8 pr-3 py-[9px] text-[12.5px] font-medium rounded-xl transition-all duration-150"
              style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.12)", color: "#374151" }}
              onFocus={e => { e.target.style.background = "#fff"; e.target.style.borderColor = "rgba(99,102,241,0.4)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.10)"; }}
              onBlur={e => { e.target.style.background = "rgba(99,102,241,0.05)"; e.target.style.borderColor = "rgba(99,102,241,0.12)"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Nav */}
          <nav className="sa-nav relative flex-1 overflow-y-auto px-3 pb-4">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] px-3 pt-3 pb-2.5" style={{ color: "#c4cdd8" }}>{t("নেভিগেশন", "Navigation")}</p>
            <motion.div variants={stagger.container} initial="hidden" animate="show" className="flex flex-col gap-[2px]">
              {filteredMenu.map(item => {
                const Icon     = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <motion.div key={item.key} variants={stagger.item}>
                    <div
                      className="sa-nav-item relative flex items-center gap-3 px-3 py-[9px] rounded-2xl cursor-pointer overflow-hidden select-none"
                      onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                      style={{ background: isActive ? `${item.color}0f` : "transparent", border: `1px solid ${isActive ? item.color + "1a" : "transparent"}`, boxShadow: isActive ? `0 2px 12px ${item.color}0d` : "none" }}
                    >
                      {isActive && <div className="sa-active-pill absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-full" style={{ background: item.color }} />}
                      <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0 transition-all duration-200" style={{ background: isActive ? item.grad : `${item.color}0d`, boxShadow: isActive ? `0 4px 12px ${item.color}30` : "none" }}>
                        <Icon size={14} color={isActive ? "#fff" : item.color} strokeWidth={isActive ? 2.2 : 1.8} />
                      </div>
                      <span className="text-[13px] font-semibold flex-1 truncate transition-colors duration-150" style={{ color: isActive ? item.color : "#6b7a8d" }}>{t(item.bn, item.en)}</span>
                      {isActive && <motion.div layoutId="subadmin-dot" className="w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ background: item.color }} />}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </nav>

          {/* User footer */}
          <div className="relative px-4 pb-5 pt-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(99,102,241,0.09)" }}>
            <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.11)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0 sa-serif" style={{ background: "linear-gradient(135deg, #818cf8, #6366f1)", boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}>
                {getInitials(subAdminInfo?.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-bold truncate" style={{ color: "#1e293b" }}>{subAdminInfo?.name || t("সাবএডমিন", "SubAdmin")}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="sa-pulse w-[6px] h-[6px] rounded-full inline-block" style={{ background: "#22c55e" }} />
                  <p className="text-[10px] font-semibold" style={{ color: "#94a3b8" }}>{t("সক্রিয়", "Active")}</p>
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={handleLogout} className="w-7 h-7 rounded-xl flex items-center justify-center transition-all" style={{ background: "rgba(239,68,68,0.07)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.13)" }}>
                <LogOut size={12} />
              </motion.button>
            </div>
          </div>
        </aside>

        {/* RIGHT SIDE */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

          {/* TOPBAR */}
          <header className="flex-shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6" style={{ height: 64, background: "#ffffff", borderBottom: "1px solid rgba(99,102,241,0.09)", boxShadow: "0 1px 0 rgba(99,102,241,0.06), 0 4px 20px rgba(99,102,241,0.04)" }}>
            <div className="flex items-center gap-3 min-w-0">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSidebarOpen(true)} className="sa-topbar-btn w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 lg:hidden" style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.14)", color: "#6366f1" }}>
                <Menu size={17} />
              </motion.button>
              <div className="sa-breadcrumb-full hidden sm:flex items-center gap-2 min-w-0">
                {activeItem ? (
                  <motion.div key={activeItem.key} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 300, damping: 28 }} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-[9px] flex items-center justify-center flex-shrink-0" style={{ background: `${activeItem.color}12` }}>
                      <activeItem.icon size={13} style={{ color: activeItem.color }} strokeWidth={2} />
                    </div>
                    <span className="sa-serif text-[14px] font-black truncate tracking-[-0.02em]" style={{ color: "#1e293b" }}>{t(activeItem.bn, activeItem.en)}</span>
                  </motion.div>
                ) : (
                  <span className="sa-serif text-[14px] font-black" style={{ color: "#1e293b" }}>{t("সাবএডমিন", "SubAdmin")}</span>
                )}
                <ChevronRight size={12} style={{ color: "#cbd5e1", flexShrink: 0 }} />
                <span className="text-[12px] font-medium truncate" style={{ color: "#94a3b8" }}>Nahid Enterprise</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="sa-topbar-search-wrap flex items-center">
                <AnimatePresence>
                  {searchOpen && (
                    <motion.input
                      autoFocus
                      type="text"
                      placeholder={t("খুঁজুন...", "Search...")}
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 170, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      onBlur={() => setSearchOpen(false)}
                      className="sa-top-search text-[12.5px] font-medium rounded-xl mr-2"
                      style={{ padding: "8px 14px", background: "#f8f9ff", border: "1px solid rgba(99,102,241,0.2)", color: "#374151", boxShadow: "0 0 0 3px rgba(99,102,241,0.08)" }}
                    />
                  )}
                </AnimatePresence>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSearchOpen(o => !o)} className="sa-topbar-btn w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: searchOpen ? "#f0eeff" : "rgba(99,102,241,0.06)", border: `1px solid ${searchOpen ? "rgba(99,102,241,0.28)" : "rgba(99,102,241,0.12)"}`, color: searchOpen ? "#6366f1" : "#94a3b8" }}>
                  <Search size={15} />
                </motion.button>
              </div>

              <SubAdminOrderBell />

              <div className="relative">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setDropdownOpen(o => !o)} className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-2xl transition-all duration-150" style={{ background: dropdownOpen ? "#f0eeff" : "rgba(99,102,241,0.06)", border: `1px solid ${dropdownOpen ? "rgba(99,102,241,0.28)" : "rgba(99,102,241,0.12)"}`, boxShadow: dropdownOpen ? "0 0 0 3px rgba(99,102,241,0.09)" : "none" }}>
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center text-white font-black text-xs sa-serif flex-shrink-0" style={{ background: "linear-gradient(135deg, #818cf8, #6366f1)", boxShadow: "0 2px 8px rgba(99,102,241,0.3)" }}>
                    {getInitials(subAdminInfo?.name)}
                  </div>
                  <span className="sa-username-chip hidden sm:block text-[12px] font-bold max-w-[72px] truncate" style={{ color: "#374151" }}>
                    {subAdminInfo?.name?.split(" ")[0] || t("সাবএডমিন", "SubAdmin")}
                  </span>
                </motion.button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                      <motion.div initial={{ opacity: 0, y: 10, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.94 }} transition={{ type: "spring", stiffness: 340, damping: 30 }} className="absolute right-0 top-12 w-64 rounded-2xl z-[9999] overflow-hidden" style={{ background: "#ffffff", border: "1px solid rgba(99,102,241,0.12)", boxShadow: "0 20px 60px rgba(99,102,241,0.14), 0 4px 16px rgba(0,0,0,0.05)" }}>
                        <div className="h-[2px] w-full" style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)" }} />
                        <div className="p-4" style={{ borderBottom: "1px solid rgba(99,102,241,0.08)" }}>
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-sm sa-serif flex-shrink-0" style={{ background: "linear-gradient(135deg, #818cf8, #6366f1)", boxShadow: "0 4px 16px rgba(99,102,241,0.35)" }}>
                              {getInitials(subAdminInfo?.name)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[13px] font-black truncate" style={{ color: "#0f172a" }}>{subAdminInfo?.name}</p>
                              <p className="text-[11px] truncate mt-0.5" style={{ color: "#94a3b8" }}>{subAdminInfo?.email}</p>
                            </div>
                          </div>
                          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-[5px] rounded-lg" style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.13)" }}>
                            <ShieldCheck size={10} style={{ color: "#6366f1" }} />
                            <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: "#6366f1" }}>{t("সাবএডমিন", "SubAdmin")}</span>
                            <div className="w-1 h-1 rounded-full" style={{ background: "rgba(99,102,241,0.3)" }} />
                            <span className="sa-pulse w-[6px] h-[6px] rounded-full inline-block" style={{ background: "#22c55e" }} />
                            <span className="text-[10px] font-semibold" style={{ color: "#22c55e" }}>{t("সক্রিয়", "Active")}</span>
                          </div>
                        </div>
                        <div className="p-2">
                          {[
                            { icon: User,     bn: "আমার প্রোফাইল", en: "My Profile", path: "/subadmin/profile",  color: "#6366f1" },
                            { icon: Settings, bn: "সেটিংস",        en: "Settings",   path: "/subadmin/settings", color: "#64748b" },
                          ].map(({ icon: Icon, bn, en, path, color }) => (
                            <motion.div key={path} whileHover={{ x: 2 }} onClick={() => { navigate(path); setDropdownOpen(false); }} className="sa-dd-item flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-[13px] font-semibold" style={{ color: "#475569" }}>
                              <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}0e`, border: `1px solid ${color}1a` }}>
                                <Icon size={13} style={{ color }} />
                              </div>
                              {t(bn, en)}
                            </motion.div>
                          ))}
                        </div>
                        <div className="p-2 pt-0" style={{ borderTop: "1px solid rgba(99,102,241,0.08)" }}>
                          <motion.div whileHover={{ x: 2 }} onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-[13px] font-semibold transition-all duration-150" style={{ color: "#ef4444" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.05)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.13)" }}>
                              <LogOut size={13} style={{ color: "#ef4444" }} />
                            </div>
                            {t("সাইন আউট", "Sign Out")}
                          </motion.div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          {/* Approval notification */}
          <AnimatePresence>
            {approvedNotif && (
              <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ type: "spring", stiffness: 300, damping: 26 }} className="mx-4 sm:mx-6 mt-4 flex items-start gap-3 rounded-2xl px-4 py-3.5" style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.12),rgba(16,185,129,0.06))", border: "1px solid rgba(16,185,129,0.25)", boxShadow: "0 4px 20px rgba(16,185,129,0.12)" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.25)" }}>
                  <ShieldCheck size={15} style={{ color: "#10b981" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: "#059669" }}>🎉 আপনার অ্যাকাউন্ট অনুমোদিত হয়েছে!</p>
                  <p className="text-xs mt-0.5" style={{ color: "#34d399" }}>অ্যাডমিন আপনার SubAdmin অ্যাকাউন্ট অনুমোদন করেছেন। স্বাগতম!</p>
                </div>
                <button onClick={() => setApprovedNotif(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6ee7b7", flexShrink: 0 }}>
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* MAIN CONTENT */}
          <main className="sa-main flex-1 overflow-y-auto p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>

      {/* FLOATING CHAT */}
      {subAdminInfo?._id && (
        <FloatingChat
          me={{ id: subAdminInfo._id, name: subAdminInfo.name, role: "subadmin" }}
          other={adminInfo}
        />
      )}
    </>
  );
}

export default function SubAdminDashboard() {
  return (
    <SubAdminLangProvider>
      <DashboardInner />
    </SubAdminLangProvider>
  );
}