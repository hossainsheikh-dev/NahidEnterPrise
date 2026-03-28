import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  BarChart3, Settings, User, LogOut, Menu, X,
  ShieldCheck, Truck, Link as LinkIcon, Layers,
  Search, ChevronRight, Bell,
} from "lucide-react";
import { showLogoutToast } from "../../utils/toast/logoutToast";
import { SubAdminLangProvider, useSubLang } from "../../context/SubAdminLangContext";
import SubAdminOrderBell from "../../components/SubAdminOrderBell";
import FloatingChat from "../../components/FloatingChat";

/* ─── Ant Design ─── */
import {
  ConfigProvider, Tooltip, Badge, theme as antTheme,
} from "antd";

/* ─── MUI ─── */
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";

const API = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;

/* ══════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════ */
const D = {
  /* Sidebar — deep charcoal */
  sb:         "#181c24",
  sbSurface:  "#1f2330",
  sbBorder:   "rgba(255,255,255,0.06)",
  sbText:     "#c9cdd8",
  sbMuted:    "#5c6275",
  sbActive:   "#ffffff",

  /* Topbar — dark gray */
  tb:         "#1a1e28",
  tbBorder:   "rgba(255,255,255,0.07)",
  tbText:     "#d4d8e4",
  tbMuted:    "#6b7080",

  /* Content */
  bg:         "#f1f3f8",

  /* Accent */
  accent:     "#6c6ff5",
  accentGlow: "rgba(108,111,245,0.22)",
  accentSoft: "rgba(108,111,245,0.12)",
  accentBd:   "rgba(108,111,245,0.3)",

  /* Status */
  green:  "#22c55e",
  red:    "#ef4444",
  amber:  "#f59e0b",
};

const MENU_ITEMS = [
  { key:"dashboard", icon:LayoutDashboard, path:"/subadmin/dashboard", color:"#818cf8", grad:"linear-gradient(135deg,#818cf8,#6366f1)", bn:"ড্যাশবোর্ড",  en:"Dashboard" },
  { key:"products",  icon:Package,         path:"/subadmin/products",  color:"#a78bfa", grad:"linear-gradient(135deg,#a78bfa,#7c3aed)", bn:"পণ্য",         en:"Products"  },
  { key:"orders",    icon:ShoppingCart,    path:"/subadmin/orders",    color:"#38bdf8", grad:"linear-gradient(135deg,#38bdf8,#0284c7)", bn:"অর্ডার",       en:"Orders"    },
  { key:"delivery",  icon:Truck,           path:"/subadmin/delivery",  color:"#34d399", grad:"linear-gradient(135deg,#34d399,#059669)", bn:"ডেলিভারি",     en:"Delivery"  },
  { key:"users",     icon:Users,           path:"/subadmin/users",     color:"#fbbf24", grad:"linear-gradient(135deg,#fbbf24,#d97706)", bn:"ব্যবহারকারী",  en:"Users"     },
  { key:"analytics", icon:BarChart3,       path:"/subadmin/analytics", color:"#f87171", grad:"linear-gradient(135deg,#f87171,#dc2626)", bn:"বিশ্লেষণ",     en:"Analytics" },
  { key:"links",     icon:LinkIcon,        path:"/subadmin/links",     color:"#f472b6", grad:"linear-gradient(135deg,#f472b6,#db2777)", bn:"লিংক",         en:"Links"     },
  { key:"sublinks",  icon:Layers,          path:"/subadmin/sublinks",  color:"#2dd4bf", grad:"linear-gradient(135deg,#2dd4bf,#0d9488)", bn:"সাবলিংক",      en:"SubLinks"  },
  { key:"settings",  icon:Settings,        path:"/subadmin/settings",  color:"#94a3b8", grad:"linear-gradient(135deg,#94a3b8,#64748b)", bn:"সেটিংস",       en:"Settings"  },
];

const stagger = {
  container: { hidden:{}, show:{ transition:{ staggerChildren:0.045, delayChildren:0.1 } } },
  item: {
    hidden:{ opacity:0, x:-16, filter:"blur(4px)" },
    show:{ opacity:1, x:0, filter:"blur(0px)", transition:{ type:"spring", stiffness:260, damping:24 } },
  },
};

/* ══════════════════════════════════════
   SIDEBAR NAV ITEM
══════════════════════════════════════ */
function NavItem({ item, isActive, onClick, t, collapsed }) {
  const Icon = item.icon;
  return (
    <Tooltip title={collapsed ? t(item.bn, item.en) : ""} placement="right" key={item.key}>
      <motion.div
        onClick={onClick}
        whileTap={{ scale: 0.97 }}
        className="relative flex items-center gap-3 cursor-pointer select-none rounded-xl overflow-hidden"
        style={{
          padding: collapsed ? "11px 0" : "10px 14px",
          justifyContent: collapsed ? "center" : "flex-start",
          background: isActive ? "rgba(108,111,245,0.14)" : "transparent",
          border: `1px solid ${isActive ? D.accentBd : "transparent"}`,
          marginBottom: 2,
          transition: "all 0.18s cubic-bezier(.4,0,.2,1)",
        }}
        onMouseEnter={e => {
          if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.05)";
        }}
        onMouseLeave={e => {
          if (!isActive) e.currentTarget.style.background = "transparent";
        }}
      >
        {/* Active left pill */}
        {isActive && (
          <motion.div
            layoutId="nav-pill"
            className="absolute left-0 top-[18%] bottom-[18%] w-[3px] rounded-r-full"
            style={{ background: item.color }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}

        {/* Icon box */}
        <div
          className="flex items-center justify-center flex-shrink-0 rounded-[10px]"
          style={{
            width: 34, height: 34,
            background: isActive ? item.grad : `${item.color}16`,
            boxShadow: isActive ? `0 4px 14px ${item.color}38` : "none",
            transition: "all 0.2s",
          }}
        >
          <Icon size={14} color={isActive ? "#fff" : item.color} strokeWidth={isActive ? 2.2 : 1.8} />
        </div>

        {!collapsed && (
          <>
            <span className="flex-1 text-[13px] font-semibold truncate transition-colors duration-150"
              style={{ color: isActive ? D.sbActive : D.sbText }}>
              {t(item.bn, item.en)}
            </span>
            {isActive && (
              <motion.div
                layoutId="nav-dot"
                className="w-[5px] h-[5px] rounded-full"
                style={{ background: item.color }}
              />
            )}
          </>
        )}
      </motion.div>
    </Tooltip>
  );
}

/* ══════════════════════════════════════
   INNER DASHBOARD
══════════════════════════════════════ */
function DashboardInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t }    = useSubLang();

  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [collapsed,     setCollapsed]     = useState(false);
  const [search,        setSearch]        = useState("");
  const [dropdownOpen,  setDropdownOpen]  = useState(false);
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [approvedNotif, setApprovedNotif] = useState(false);
  const [adminInfo,     setAdminInfo]     = useState(null);

  const subAdminInfo = JSON.parse(localStorage.getItem("subAdminInfo") || "{}");

  useEffect(() => {
    const token = localStorage.getItem("subAdminToken");
    const info  = localStorage.getItem("subAdminInfo");
    if (!token || !info) navigate("/subadmin/signup-login-page", { replace: true });
  }, [navigate]);

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const token = localStorage.getItem("subAdminToken");
        if (!token) return;
        const res  = await fetch(`${API}/api/auth/admin-info`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data?._id) setAdminInfo({ id: data._id, name: data.name, role: "admin", model: "User" });
      } catch (e) { console.error(e); }
    };
    if (subAdminInfo?._id) fetchAdminInfo();
  }, [subAdminInfo._id]);

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
    MENU_ITEMS.filter(i => i.bn.includes(search) || i.en.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const handleLogout = () => {
    showLogoutToast(subAdminInfo?.name);
    localStorage.removeItem("subAdminToken");
    localStorage.removeItem("subAdminInfo");
    setTimeout(() => navigate("/subadmin/signup-login-page", { replace: true }), 1200);
  };

  const activeItem = MENU_ITEMS.find(i => i.path === location.pathname);
  const sidebarW   = collapsed ? 72 : 264;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .sa-root {
          font-family: 'Outfit', sans-serif;
          background: ${D.bg};
          min-height: 100vh;
          height: 100vh;
          display: flex;
          overflow: hidden;
        }

        /* Scrollbar */
        .sa-nav-scroll::-webkit-scrollbar { width: 3px; }
        .sa-nav-scroll::-webkit-scrollbar-track { background: transparent; }
        .sa-nav-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }
        .sa-main-scroll::-webkit-scrollbar { width: 5px; }
        .sa-main-scroll::-webkit-scrollbar-track { background: transparent; }
        .sa-main-scroll::-webkit-scrollbar-thumb { background: rgba(108,111,245,0.15); border-radius: 99px; }

        /* Sidebar */
        .sa-sidebar {
          background: ${D.sb};
          border-right: 1px solid ${D.sbBorder};
          box-shadow: 4px 0 32px rgba(0,0,0,0.25);
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: fixed;
          top: 0; left: 0;
          z-index: 50;
          transition: width 0.28s cubic-bezier(.4,0,.2,1), transform 0.28s cubic-bezier(.4,0,.2,1);
          overflow: hidden;
        }
        .sa-sidebar::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #6c6ff5 0%, #a78bfa 45%, #38bdf8 100%);
        }
        .sa-sidebar-noise {
          position: absolute; inset: 0; pointer-events: none; opacity: 0.018;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        /* Topbar */
        .sa-topbar {
          height: 60px;
          background: ${D.tb};
          border-bottom: 1px solid ${D.tbBorder};
          box-shadow: 0 2px 20px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          flex-shrink: 0;
          position: relative;
        }
        .sa-topbar::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(108,111,245,0.4) 50%, transparent 100%);
        }

        /* Topbar buttons */
        .sa-tb-btn {
          width: 36px; height: 36px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: ${D.tbMuted};
          transition: all 0.15s ease;
        }
        .sa-tb-btn:hover {
          background: rgba(108,111,245,0.12);
          border-color: rgba(108,111,245,0.28);
          color: ${D.accent};
        }

        /* Search input */
        .sa-search-input {
          background: rgba(255,255,255,0.05) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          color: ${D.tbText} !important;
          border-radius: 10px;
          padding: 7px 14px 7px 36px;
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          font-weight: 500;
          outline: none;
          transition: all 0.2s ease;
        }
        .sa-search-input::placeholder { color: ${D.tbMuted}; }
        .sa-search-input:focus {
          background: rgba(108,111,245,0.1) !important;
          border-color: ${D.accentBd} !important;
          box-shadow: 0 0 0 3px ${D.accentGlow};
        }

        /* Overlay */
        .sa-overlay {
          position: fixed; inset: 0; z-index: 40;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
        }

        /* Sidebar search */
        .sa-sb-search {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: ${D.sbText};
          border-radius: 10px;
          padding: 8px 10px 8px 34px;
          font-family: 'Outfit', sans-serif;
          font-size: 12.5px;
          font-weight: 500;
          outline: none;
          width: 100%;
          transition: all 0.2s;
        }
        .sa-sb-search::placeholder { color: ${D.sbMuted}; }
        .sa-sb-search:focus {
          background: rgba(108,111,245,0.08);
          border-color: ${D.accentBd};
          box-shadow: 0 0 0 3px ${D.accentGlow};
        }

        /* Dropdown */
        .sa-dropdown {
          position: absolute; right: 0; top: calc(100% + 10px);
          width: 270px;
          background: #1e2231;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3);
          overflow: hidden;
          z-index: 9999;
        }
        .sa-dd-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 16px;
          cursor: pointer;
          font-size: 13px; font-weight: 600;
          color: #9aa3b8;
          border-radius: 10px;
          margin: 2px 8px;
          transition: all 0.13s ease;
        }
        .sa-dd-item:hover { background: rgba(108,111,245,0.12); color: #c9cdd8; }

        /* Approval banner */
        .sa-approval-banner {
          background: linear-gradient(135deg, rgba(34,197,94,0.12), rgba(16,185,129,0.06));
          border: 1px solid rgba(34,197,94,0.25);
          border-radius: 12px;
          padding: 12px 16px;
          margin: 12px 16px 0;
          display: flex; align-items: flex-start; gap: 12px;
          box-shadow: 0 4px 20px rgba(34,197,94,0.1);
        }

        /* Section label */
        .sa-section-label {
          font-size: 9.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          color: ${D.sbMuted};
          padding: 14px 14px 6px;
        }

        /* Shimmer brand text */
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .sa-brand-text {
          background: linear-gradient(90deg, #818cf8 0%, #c4b5fd 30%, #6c6ff5 50%, #c4b5fd 70%, #818cf8 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 6s linear infinite;
          font-family: 'Outfit', sans-serif;
          font-weight: 900;
          font-size: 15px;
          letter-spacing: -0.02em;
        }

        /* Pulse dot */
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.75); }
        }
        .pulse-dot { animation: pulse-dot 2.2s ease-in-out infinite; }

        /* Responsive */
        @media (max-width: 1024px) {
          .sa-sidebar { transform: translateX(-100%); width: 264px !important; }
          .sa-sidebar.open { transform: translateX(0); }
          .sa-content { margin-left: 0 !important; }
        }
        @media (max-width: 640px) {
          .sa-topbar { padding: 0 14px; }
          .sa-search-expand { display: none; }
        }
        @media (max-width: 480px) {
          .sa-user-name { display: none; }
        }
      `}</style>

      <ConfigProvider theme={{ algorithm: antTheme.darkAlgorithm, token: { colorPrimary: "#6c6ff5", fontFamily: "'Outfit', sans-serif" } }}>
        <div className="sa-root">

          {/* ── Mobile Overlay ── */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                className="sa-overlay lg:hidden"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </AnimatePresence>

          {/* ════════════════════════
              SIDEBAR
          ════════════════════════ */}
          <aside
            className={`sa-sidebar ${sidebarOpen ? "open" : ""}`}
            style={{ width: sidebarW }}
          >
            <div className="sa-sidebar-noise" />

            {/* Brand */}
            <div style={{
              padding: collapsed ? "20px 0" : "20px 18px",
              borderBottom: `1px solid ${D.sbBorder}`,
              display: "flex", alignItems: "center",
              justifyContent: collapsed ? "center" : "space-between",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, overflow: "hidden" }}>
                <motion.div
                  whileHover={{ rotate: 8, scale: 1.08 }}
                  transition={{ type: "spring", stiffness: 380, damping: 18 }}
                  style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: "linear-gradient(135deg, #6c6ff5, #4f46e5)",
                    boxShadow: "0 6px 22px rgba(108,111,245,0.45)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <ShieldCheck size={18} color="#fff" strokeWidth={2} />
                </motion.div>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                  >
                    <div className="sa-brand-text">SubAdmin</div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: D.sbMuted, marginTop: 2 }}>
                      Nahid Enterprise
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Collapse toggle — desktop only */}
              {!collapsed && (
                <button
                  onClick={() => setCollapsed(true)}
                  className="hidden lg:flex sa-tb-btn"
                  style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0 }}
                >
                  <X size={12} />
                </button>
              )}

              {/* Close mobile */}
              {!collapsed && (
                <button onClick={() => setSidebarOpen(false)} className="sa-tb-btn lg:hidden" style={{ width: 28, height: 28, borderRadius: 8 }}>
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Expand button when collapsed */}
            {collapsed && (
              <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px" }}>
                <Tooltip title="Expand sidebar" placement="right">
                  <button onClick={() => setCollapsed(false)} className="sa-tb-btn" style={{ width: 32, height: 32, borderRadius: 10 }}>
                    <Menu size={14} />
                  </button>
                </Tooltip>
              </div>
            )}

            {/* Search */}
            {!collapsed && (
              <div style={{ padding: "10px 14px 6px", flexShrink: 0, position: "relative" }}>
                <Search size={13} color={D.sbMuted} style={{ position: "absolute", left: 26, top: "50%", transform: "translateY(-28%)", pointerEvents: "none" }} />
                <input
                  type="text"
                  className="sa-sb-search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={t("মেনু খুঁজুন...", "Search menu...")}
                />
              </div>
            )}

            {/* Nav */}
            <nav className="sa-nav-scroll" style={{ flex: 1, overflowY: "auto", padding: collapsed ? "8px 10px" : "4px 12px 12px" }}>
              {!collapsed && <div className="sa-section-label">{t("নেভিগেশন", "Navigation")}</div>}
              <motion.div variants={stagger.container} initial="hidden" animate="show">
                {filteredMenu.map(item => (
                  <motion.div key={item.key} variants={stagger.item}>
                    <NavItem
                      item={item}
                      isActive={location.pathname === item.path}
                      onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                      t={t}
                      collapsed={collapsed}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </nav>

            {/* Divider */}
            <Divider style={{ borderColor: D.sbBorder, margin: "0 0 0" }} />

            {/* User Footer */}
            <div style={{
              padding: collapsed ? "14px 10px" : "14px 14px",
              flexShrink: 0,
            }}>
              {collapsed ? (
                <Tooltip title={subAdminInfo?.name || "SubAdmin"} placement="right">
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <Avatar
                      sx={{ width: 36, height: 36, fontSize: 13, fontWeight: 800, fontFamily: "Outfit",
                        background: "linear-gradient(135deg, #818cf8, #6366f1)",
                        boxShadow: "0 4px 14px rgba(108,111,245,0.4)",
                        cursor: "pointer" }}
                    >
                      {getInitials(subAdminInfo?.name)}
                    </Avatar>
                  </div>
                </Tooltip>
              ) : (
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 12,
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${D.sbBorder}`,
                }}>
                  <Avatar
                    sx={{ width: 36, height: 36, fontSize: 13, fontWeight: 800, fontFamily: "Outfit",
                      background: "linear-gradient(135deg, #818cf8, #6366f1)",
                      boxShadow: "0 4px 12px rgba(108,111,245,0.35)", flexShrink: 0 }}
                  >
                    {getInitials(subAdminInfo?.name)}
                  </Avatar>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: D.sbText, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {subAdminInfo?.name || "SubAdmin"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                      <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: D.green, display: "inline-block" }} />
                      <span style={{ fontSize: 10, fontWeight: 600, color: D.sbMuted }}>{t("সক্রিয়", "Active")}</span>
                    </div>
                  </div>
                  <Tooltip title={t("সাইন আউট", "Sign Out")} placement="top">
                    <button
                      onClick={handleLogout}
                      style={{
                        width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                        background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.16)",
                        color: D.red, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.18)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
                    >
                      <LogOut size={12} />
                    </button>
                  </Tooltip>
                </div>
              )}
            </div>
          </aside>

          {/* ════════════════════════
              RIGHT CONTENT
          ════════════════════════ */}
          <div
            className="sa-content"
            style={{
              marginLeft: sidebarW,
              flex: 1, display: "flex", flexDirection: "column",
              minWidth: 0, overflow: "hidden",
              transition: "margin-left 0.28s cubic-bezier(.4,0,.2,1)",
            }}
          >

            {/* ── TOPBAR ── */}
            <header className="sa-topbar">
              {/* Left */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                {/* Mobile hamburger */}
                <button onClick={() => setSidebarOpen(true)} className="sa-tb-btn lg:hidden">
                  <Menu size={17} />
                </button>

                {/* Desktop expand (when collapsed) */}
                {collapsed && (
                  <button onClick={() => setCollapsed(false)} className="sa-tb-btn hidden lg:flex">
                    <Menu size={17} />
                  </button>
                )}

                {/* Breadcrumb */}
                <div className="hidden sm:flex items-center gap-2 min-w-0">
                  {activeItem ? (
                    <motion.div
                      key={activeItem.key}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                        background: `${activeItem.color}18`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <activeItem.icon size={13} color={activeItem.color} strokeWidth={2} />
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 800, color: D.tbText, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
                        {t(activeItem.bn, activeItem.en)}
                      </span>
                    </motion.div>
                  ) : (
                    <span style={{ fontSize: 14, fontWeight: 800, color: D.tbText }}>SubAdmin</span>
                  )}
                  <ChevronRight size={12} color={D.tbMuted} />
                  <span style={{ fontSize: 11, fontWeight: 500, color: D.tbMuted, whiteSpace: "nowrap" }}>Nahid Enterprise</span>
                </div>
              </div>

              {/* Right */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>

                {/* Search */}
                <div className="sa-search-expand" style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <AnimatePresence>
                    {searchOpen && (
                      <motion.div
                        initial={{ width: 0, opacity: 0 }} animate={{ width: 180, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.22 }}
                        style={{ overflow: "hidden", position: "relative", marginRight: 6 }}
                      >
                        <Search size={13} color={D.tbMuted} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                        <input
                          autoFocus
                          type="text"
                          placeholder={t("খুঁজুন...", "Search...")}
                          className="sa-search-input"
                          onBlur={() => setSearchOpen(false)}
                          style={{ width: "100%" }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <Tooltip title={t("খুঁজুন", "Search")}>
                    <button onClick={() => setSearchOpen(o => !o)} className="sa-tb-btn" style={{ color: searchOpen ? D.accent : undefined }}>
                      <Search size={15} />
                    </button>
                  </Tooltip>
                </div>

                {/* Bell */}
                <SubAdminOrderBell />

                {/* Profile */}
                <div style={{ position: "relative" }}>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setDropdownOpen(o => !o)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "5px 10px 5px 5px", borderRadius: 12, cursor: "pointer",
                      background: dropdownOpen ? "rgba(108,111,245,0.14)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${dropdownOpen ? D.accentBd : "rgba(255,255,255,0.08)"}`,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Avatar
                      sx={{ width: 28, height: 28, fontSize: 11, fontWeight: 800, fontFamily: "Outfit",
                        background: "linear-gradient(135deg, #818cf8, #6366f1)",
                        boxShadow: "0 2px 10px rgba(108,111,245,0.38)" }}
                    >
                      {getInitials(subAdminInfo?.name)}
                    </Avatar>
                    <span className="sa-user-name" style={{ fontSize: 12.5, fontWeight: 700, color: D.tbText, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {subAdminInfo?.name?.split(" ")[0] || "SubAdmin"}
                    </span>
                  </motion.button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <>
                        <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setDropdownOpen(false)} />
                        <motion.div
                          className="sa-dropdown"
                          initial={{ opacity: 0, y: 10, scale: 0.94 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.94 }}
                          transition={{ type: "spring", stiffness: 340, damping: 28 }}
                        >
                          {/* Accent top line */}
                          <div style={{ height: 2, background: "linear-gradient(90deg, #6c6ff5, #a78bfa, #38bdf8)" }} />

                          {/* User info */}
                          <div style={{ padding: "16px", borderBottom: `1px solid ${D.sbBorder}` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <Avatar
                                sx={{ width: 44, height: 44, fontSize: 15, fontWeight: 800, fontFamily: "Outfit",
                                  background: "linear-gradient(135deg, #818cf8, #6366f1)",
                                  boxShadow: "0 4px 18px rgba(108,111,245,0.4)" }}
                              >
                                {getInitials(subAdminInfo?.name)}
                              </Avatar>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 800, color: "#e2e6f3", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {subAdminInfo?.name}
                                </div>
                                <div style={{ fontSize: 11, color: D.sbMuted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {subAdminInfo?.email}
                                </div>
                              </div>
                            </div>
                            <div style={{ marginTop: 10 }}>
                              <Chip
                                label={
                                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                    <ShieldCheck size={10} />
                                    {t("সাবএডমিন", "SubAdmin")}
                                    <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: D.green, display: "inline-block" }} />
                                  </span>
                                }
                                size="small"
                                sx={{
                                  background: "rgba(108,111,245,0.12)",
                                  border: "1px solid rgba(108,111,245,0.25)",
                                  color: "#818cf8",
                                  height: 24,
                                  fontFamily: "Outfit",
                                  "& .MuiChip-label": { padding: "0 8px" },
                                }}
                              />
                            </div>
                          </div>

                          {/* Menu items */}
                          <div style={{ padding: "8px" }}>
                            {[
                              { icon: User,     bn: "আমার প্রোফাইল", en: "My Profile", path: "/subadmin/profile",  color: D.accent  },
                              { icon: Settings, bn: "সেটিংস",        en: "Settings",   path: "/subadmin/settings", color: "#94a3b8" },
                            ].map(({ icon: Icon, bn, en, path, color }) => (
                              <div key={path} className="sa-dd-item"
                                onClick={() => { navigate(path); setDropdownOpen(false); }}
                              >
                                <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: `${color}14`, border: `1px solid ${color}20`, flexShrink: 0 }}>
                                  <Icon size={13} color={color} />
                                </div>
                                {t(bn, en)}
                              </div>
                            ))}
                          </div>

                          <Divider style={{ borderColor: D.sbBorder, margin: 0 }} />

                          <div style={{ padding: "8px" }}>
                            <div className="sa-dd-item" onClick={handleLogout}
                              style={{ color: "#f87171" }}
                              onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                              <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", flexShrink: 0 }}>
                                <LogOut size={13} color="#f87171" />
                              </div>
                              {t("সাইন আউট", "Sign Out")}
                            </div>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </header>

            {/* ── Approval notification ── */}
            <AnimatePresence>
              {approvedNotif && (
                <motion.div
                  initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                  className="sa-approval-banner"
                >
                  <div style={{ width: 32, height: 32, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.25)", flexShrink: 0 }}>
                    <ShieldCheck size={14} color={D.green} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#4ade80" }}>🎉 আপনার অ্যাকাউন্ট অনুমোদিত হয়েছে!</div>
                    <div style={{ fontSize: 11, color: "#86efac", marginTop: 2 }}>অ্যাডমিন আপনার SubAdmin অ্যাকাউন্ট অনুমোদন করেছেন। স্বাগতম!</div>
                  </div>
                  <button onClick={() => setApprovedNotif(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#86efac", flexShrink: 0, padding: 0 }}>
                    <X size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── MAIN CONTENT ── */}
            <main className="sa-main-scroll" style={{ flex: 1, overflowY: "auto", padding: "20px 16px 24px", background: D.bg }}>
              <Outlet />
            </main>
          </div>
        </div>
      </ConfigProvider>

      {/* Floating Chat */}
      {subAdminInfo?._id && (
        <FloatingChat
          me={{ id: subAdminInfo._id, name: subAdminInfo.name, role: "subadmin" }}
          other={adminInfo}
        />
      )}
    </>
  );
}

/* ══════════════════════════════════════
   EXPORT
══════════════════════════════════════ */
export default function SubAdminDashboard() {
  return (
    <SubAdminLangProvider>
      <DashboardInner />
    </SubAdminLangProvider>
  );
}