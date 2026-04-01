import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  BarChart3, Settings, User, LogOut,
  ShieldCheck, Truck, Link as LinkIcon, Layers,
  Search, ChevronRight, X, Menu,
} from "lucide-react";
import { showLogoutToast } from "../../utils/toast/logoutToast";
import { SubAdminLangProvider, useSubLang } from "../../context/SubAdminLangContext";
import SubAdminOrderBell from "../../components/SubAdminOrderBell";
import FloatingChat from "../../components/FloatingChat";

/* ── Ant Design ── */
import { ConfigProvider, Tooltip, theme as antTheme } from "antd";

/* ── MUI ── */
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";

const API = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;

const D = {
  sb:        "#16191f",
  sbSurface: "#1c2030",
  sbBorder:  "rgba(255,255,255,0.055)",
  sbText:    "#bfc4d4",
  sbMuted:   "#525869",
  tb:        "#1a1d26",
  tbBorder:  "rgba(255,255,255,0.065)",
  tbText:    "#cdd1df",
  tbMuted:   "#626880",
  bg:        "#eef0f6",
  accent:    "#6c6ff5",
  green:     "#22c55e",
  red:       "#ef4444",
};

const FULL = 256;
const SLIM = 68;

const MENU = [
  { key:"dashboard", icon:LayoutDashboard, path:"/portal-v7m4/dashboard", color:"#818cf8", grad:"linear-gradient(135deg,#818cf8,#6366f1)", bn:"ড্যাশবোর্ড", en:"Dashboard" },
  { key:"products",  icon:Package,         path:"/portal-v7m4/products",  color:"#a78bfa", grad:"linear-gradient(135deg,#a78bfa,#7c3aed)", bn:"পণ্য",        en:"Products"  },
  { key:"orders",    icon:ShoppingCart,    path:"/portal-v7m4/orders",    color:"#38bdf8", grad:"linear-gradient(135deg,#38bdf8,#0284c7)", bn:"অর্ডার",      en:"Orders"    },
  { key:"delivery",  icon:Truck,           path:"/portal-v7m4/delivery",  color:"#34d399", grad:"linear-gradient(135deg,#34d399,#059669)", bn:"ডেলিভারি",    en:"Delivery"  },
  { key:"users",     icon:Users,           path:"/portal-v7m4/users",     color:"#fbbf24", grad:"linear-gradient(135deg,#fbbf24,#d97706)", bn:"ব্যবহারকারী", en:"Users"     },
  { key:"analytics", icon:BarChart3,       path:"/portal-v7m4/analytics", color:"#f87171", grad:"linear-gradient(135deg,#f87171,#dc2626)", bn:"বিশ্লেষণ",    en:"Analytics" },
  { key:"links",     icon:LinkIcon,        path:"/portal-v7m4/links",     color:"#f472b6", grad:"linear-gradient(135deg,#f472b6,#db2777)", bn:"লিংক",        en:"Links"     },
  { key:"sublinks",  icon:Layers,          path:"/portal-v7m4/sublinks",  color:"#2dd4bf", grad:"linear-gradient(135deg,#2dd4bf,#0d9488)", bn:"সাবলিংক",     en:"SubLinks"  },
  { key:"settings",  icon:Settings,        path:"/portal-v7m4/settings",  color:"#94a3b8", grad:"linear-gradient(135deg,#94a3b8,#64748b)", bn:"সেটিংস",      en:"Settings"  },
];

/* ══════════════════════════════
   NAV ITEM
══════════════════════════════ */
function NavItem({ item, isActive, onClick, t, slim }) {
  const Icon = item.icon;
  return (
    <Tooltip title={slim ? t(item.bn, item.en) : ""} placement="right">
      <div
        onClick={onClick}
        className={`sa-nav-item ${isActive ? "active" : ""}`}
        style={{
          "--item-color": item.color,
          "--item-grad":  item.grad,
          justifyContent: slim ? "center" : "flex-start",
          padding:        slim ? "10px 0" : "9px 12px",
        }}
      >
        {/* Left active pill */}
        {isActive && <div className="sa-active-pill" style={{ background: item.color }} />}

        {/* Icon */}
        <div
          className="sa-nav-icon"
          style={{
            background: isActive ? item.grad : `${item.color}14`,
            boxShadow:  isActive ? `0 4px 14px ${item.color}35` : "none",
          }}
        >
          <Icon size={14} color={isActive ? "#fff" : item.color} strokeWidth={isActive ? 2.2 : 1.9} />
        </div>

        {/* Label */}
        {!slim && (
          <span className="sa-nav-label" style={{ color: isActive ? "#fff" : D.sbText }}>
            {t(item.bn, item.en)}
          </span>
        )}

        {/* Active dot */}
        {isActive && !slim && (
          <div className="sa-nav-dot" style={{ background: item.color }} />
        )}
      </div>
    </Tooltip>
  );
}

/* ══════════════════════════════
   DASHBOARD INNER
══════════════════════════════ */
function DashboardInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t }    = useSubLang();

  const [isDesktop,     setIsDesktop]     = useState(() => window.innerWidth >= 1024);
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [search,        setSearch]        = useState("");
  const [dropdownOpen,  setDropdownOpen]  = useState(false);
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [approvedNotif, setApprovedNotif] = useState(false);
  const [adminInfo,     setAdminInfo]     = useState(null);

  const subAdminInfo = JSON.parse(localStorage.getItem("subAdminInfo") || "{}");

  /* Responsive */
  useEffect(() => {
    const fn = () => {
      const desk = window.innerWidth >= 1024;
      setIsDesktop(desk);
      if (!desk) setSidebarOpen(false);
    };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  /* Auth guard */
  useEffect(() => {
    if (!localStorage.getItem("subAdminToken") || !localStorage.getItem("subAdminInfo"))
      navigate("/portal-v7m4/access", { replace: true });
  }, [navigate]);

  /* Admin info */
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("subAdminToken");
        if (!token) return;
        const res  = await fetch(`${API}/api/auth/admin-info`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data?._id) setAdminInfo({ id: data._id, name: data.name, role: "admin", model: "User" });
      } catch (e) { console.error(e); }
    })();
  }, [subAdminInfo._id]);

  /* Approval banner */
  useEffect(() => {
    const key = `sa_approved_notif_${subAdminInfo?._id}`;
    if (subAdminInfo?.status === "approved" && !localStorage.getItem(key)) {
      setApprovedNotif(true);
      localStorage.setItem(key, "1");
      setTimeout(() => setApprovedNotif(false), 6000);
    }
  }, [subAdminInfo?._id, subAdminInfo?.status]);

  const getInitials = (name = "") => {
    const w = name.trim().split(/\s+/);
    return ((w[0]?.[0] || "") + (w[1]?.[0] || "")).toUpperCase() || "SA";
  };

  const filteredMenu = useMemo(() =>
    MENU.filter(i => i.bn.includes(search) || i.en.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const handleLogout = () => {
    showLogoutToast(subAdminInfo?.name);
    localStorage.removeItem("subAdminToken");
    localStorage.removeItem("subAdminInfo");
    setTimeout(() => navigate("/portal-v7m4/access", { replace: true }), 1200);
  };

  const activeItem  = MENU.find(i => i.path === location.pathname);
  const slim        = isDesktop && !sidebarOpen;
  const showOverlay = !isDesktop && sidebarOpen;

  const toggleSidebar = () => setSidebarOpen(o => !o);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        .sa-shell {
          font-family: 'Outfit', sans-serif;
          height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: ${D.bg};
        }

        /* ── TOPBAR ── */
        .sa-topbar {
          height: 60px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 18px;
          background: ${D.tb};
          border-bottom: 1px solid ${D.tbBorder};
          box-shadow: 0 2px 24px rgba(0,0,0,0.22);
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 60;
        }
        .sa-topbar::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(108,111,245,0.32), transparent);
        }

        .tb-btn {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; outline: none;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.04);
          color: ${D.tbMuted};
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .tb-btn:hover {
          background: rgba(108,111,245,0.12);
          border-color: rgba(108,111,245,0.25);
          color: ${D.accent};
        }

        .tb-search {
          width: 100%; background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          color: ${D.tbText}; border-radius: 10px;
          padding: 7px 12px 7px 34px;
          font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 500;
          outline: none; transition: all 0.2s;
        }
        .tb-search::placeholder { color: ${D.tbMuted}; }
        .tb-search:focus {
          background: rgba(108,111,245,0.1);
          border-color: rgba(108,111,245,0.3);
          box-shadow: 0 0 0 3px rgba(108,111,245,0.1);
        }

        /* ── BODY ── */
        .sa-body {
          display: flex;
          padding-top: 60px;
          height: 100vh;
          overflow: hidden;
        }

        /* ── OVERLAY ── */
        .sa-overlay {
          position: fixed; inset: 0; z-index: 40;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(4px);
        }

        /* ── SIDEBAR ── */
        .sa-sidebar {
          position: fixed;
          top: 60px; left: 0; bottom: 0;
          width: ${FULL}px;
          background: ${D.sb};
          border-right: 1px solid ${D.sbBorder};
          box-shadow: 4px 0 40px rgba(0,0,0,0.3);
          display: flex;
          flex-direction: column;
          z-index: 50;
          overflow: hidden;

          /* CSS-based smooth transition like Admin */
          transform: translateX(-100%);
          transition: transform 0.28s cubic-bezier(0.4,0,0.2,1), width 0.28s cubic-bezier(0.4,0,0.2,1);
        }
        .sa-sidebar::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; z-index: 1;
          background: linear-gradient(90deg, #6c6ff5 0%, #a78bfa 50%, #2dd4bf 100%);
        }
        .sa-noise {
          position: absolute; inset: 0; pointer-events: none; opacity: 0.016; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        /* Mobile open */
        .sa-sidebar.open {
          transform: translateX(0);
        }

        /* Desktop: always visible, slim or full */
        @media (min-width: 1024px) {
          .sa-sidebar {
            transform: translateX(0) !important;
          }
          .sa-sidebar.slim {
            width: ${SLIM}px;
          }
          .sa-content {
            margin-left: ${FULL}px;
            transition: margin-left 0.28s cubic-bezier(0.4,0,0.2,1);
          }
          .sa-content.slim {
            margin-left: ${SLIM}px;
          }
        }
        @media (max-width: 1023px) {
          .sa-content { margin-left: 0 !important; }
        }

        /* ── NAV ── */
        .sa-nav-sc::-webkit-scrollbar { width: 3px; }
        .sa-nav-sc::-webkit-scrollbar-track { background: transparent; }
        .sa-nav-sc::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }

        .sa-nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 2px;
          cursor: pointer;
          user-select: none;
          border-radius: 11px;
          border: 1px solid transparent;
          transition: background 0.15s, border-color 0.15s;
          overflow: hidden;
        }
        .sa-nav-item:hover { background: rgba(255,255,255,0.04); }
        .sa-nav-item.active {
          background: rgba(var(--item-color-rgb, 129,140,248), 0.094);
          border-color: rgba(var(--item-color-rgb, 129,140,248), 0.16);
          background: color-mix(in srgb, var(--item-color) 9%, transparent);
          border-color: color-mix(in srgb, var(--item-color) 16%, transparent);
        }

        .sa-active-pill {
          position: absolute;
          left: 0; top: 18%; bottom: 18%;
          width: 3px;
          border-radius: 0 3px 3px 0;
        }

        .sa-nav-icon {
          width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s, box-shadow 0.2s;
        }

        .sa-nav-label {
          flex: 1; font-size: 13px; font-weight: 600;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          transition: opacity 0.15s;
        }

        .sa-nav-dot {
          width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0;
        }

        .sec-label {
          font-size: 9.5px; font-weight: 800; text-transform: uppercase;
          letter-spacing: 0.22em; color: ${D.sbMuted}; padding: 12px 13px 6px;
        }

        .sb-search {
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          color: ${D.sbText}; border-radius: 10px;
          padding: 8px 10px 8px 33px;
          font-family: 'Outfit', sans-serif; font-size: 12.5px; font-weight: 500;
          outline: none; transition: all 0.2s;
        }
        .sb-search::placeholder { color: ${D.sbMuted}; }
        .sb-search:focus {
          background: rgba(108,111,245,0.08);
          border-color: rgba(108,111,245,0.3);
          box-shadow: 0 0 0 3px rgba(108,111,245,0.1);
        }

        /* ── BRAND ── */
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        .brand-text {
          background: linear-gradient(90deg,#818cf8 0%,#c4b5fd 30%,#6c6ff5 50%,#c4b5fd 70%,#818cf8 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          animation: shimmer 6s linear infinite;
          font-weight: 900; font-size: 15px; letter-spacing: -0.02em;
        }

        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.72)} }
        .pulse-dot { animation: pulse-dot 2.4s ease-in-out infinite; }

        /* ── CONTENT ── */
        .sa-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow: hidden;
        }
        .sa-main-sc::-webkit-scrollbar { width: 5px; }
        .sa-main-sc::-webkit-scrollbar-track { background: transparent; }
        .sa-main-sc::-webkit-scrollbar-thumb { background: rgba(108,111,245,0.14); border-radius: 99px; }

        /* ── DROPDOWN ── */
        .sa-dd {
          position: absolute; right: 0; top: calc(100% + 10px); width: 270px;
          background: #1c2030; border: 1px solid rgba(255,255,255,0.09);
          border-radius: 16px; overflow: hidden; z-index: 9999;
          box-shadow: 0 24px 64px rgba(0,0,0,0.55);
        }
        .dd-item {
          display: flex; align-items: center; gap: 11px;
          padding: 9px 14px; cursor: pointer;
          font-size: 13px; font-weight: 600; color: #9199b0;
          border-radius: 9px; margin: 2px 8px;
          transition: background 0.13s, color 0.13s;
        }
        .dd-item:hover { background: rgba(108,111,245,0.1); color: #c4c8dc; }

        @media (max-width: 639px) {
          .sa-topbar { padding: 0 12px; }
          .search-wrap { display: none !important; }
          .breadcrumb { display: none !important; }
        }
        @media (max-width: 479px) { .user-name { display: none !important; } }
      `}</style>

      <ConfigProvider theme={{ algorithm: antTheme.darkAlgorithm, token: { colorPrimary: "#6c6ff5", fontFamily: "'Outfit',sans-serif" } }}>
        <div className="sa-shell">

          {/* ── TOPBAR ── */}
          <header className="sa-topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <button className="tb-btn" onClick={toggleSidebar} aria-label="Toggle sidebar">
                {(!isDesktop && sidebarOpen) ? <X size={16} /> : <Menu size={16} />}
              </button>

              <div className="breadcrumb" style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <AnimatePresence mode="wait">
                  {activeItem ? (
                    <motion.div
                      key={activeItem.key}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 28 }}
                      style={{ display: "flex", alignItems: "center", gap: 7 }}
                    >
                      <div style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, background: `${activeItem.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <activeItem.icon size={12} color={activeItem.color} strokeWidth={2} />
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 800, color: D.tbText, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
                        {t(activeItem.bn, activeItem.en)}
                      </span>
                    </motion.div>
                  ) : (
                    <motion.span key="default" style={{ fontSize: 14, fontWeight: 800, color: D.tbText }}>SubAdmin</motion.span>
                  )}
                </AnimatePresence>
                <ChevronRight size={11} color={D.tbMuted} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 500, color: D.tbMuted, whiteSpace: "nowrap" }}>Nahid Enterprise</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
              {/* Search */}
              <div className="search-wrap" style={{ display: "flex", alignItems: "center", position: "relative" }}>
                <AnimatePresence>
                  {searchOpen && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }} animate={{ width: 176, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      style={{ overflow: "hidden", position: "relative", marginRight: 6 }}
                    >
                      <Search size={12} color={D.tbMuted} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      <input autoFocus type="text" placeholder={t("খুঁজুন...", "Search...")} className="tb-search" onBlur={() => setSearchOpen(false)} />
                    </motion.div>
                  )}
                </AnimatePresence>
                <Tooltip title={t("খুঁজুন", "Search")} placement="bottom">
                  <button className="tb-btn" onClick={() => setSearchOpen(o => !o)} style={{ color: searchOpen ? D.accent : undefined }}>
                    <Search size={15} />
                  </button>
                </Tooltip>
              </div>

              <SubAdminOrderBell />

              {/* Profile dropdown */}
              <div style={{ position: "relative" }}>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDropdownOpen(o => !o)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "4px 10px 4px 4px", borderRadius: 11, cursor: "pointer", outline: "none",
                    background: dropdownOpen ? "rgba(108,111,245,0.12)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${dropdownOpen ? "rgba(108,111,245,0.3)" : "rgba(255,255,255,0.08)"}`,
                    transition: "background 0.15s, border-color 0.15s",
                  }}
                >
                  <Avatar sx={{ width: 28, height: 28, fontSize: 11, fontWeight: 800, fontFamily: "Outfit", background: "linear-gradient(135deg,#818cf8,#6366f1)", boxShadow: "0 2px 10px rgba(108,111,245,0.38)" }}>
                    {getInitials(subAdminInfo?.name)}
                  </Avatar>
                  <span className="user-name" style={{ fontSize: 12.5, fontWeight: 700, color: D.tbText, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {subAdminInfo?.name?.split(" ")[0] || "SubAdmin"}
                  </span>
                </motion.button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <>
                      <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setDropdownOpen(false)} />
                      <motion.div
                        className="sa-dd"
                        initial={{ opacity: 0, y: 12, scale: 0.93 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.93 }}
                        transition={{ type: "spring", stiffness: 360, damping: 30 }}
                      >
                        <div style={{ height: 2, background: "linear-gradient(90deg,#6c6ff5,#a78bfa,#2dd4bf)" }} />
                        <div style={{ padding: 16, borderBottom: `1px solid ${D.sbBorder}` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                            <Avatar sx={{ width: 42, height: 42, fontSize: 14, fontWeight: 800, fontFamily: "Outfit", background: "linear-gradient(135deg,#818cf8,#6366f1)", boxShadow: "0 4px 18px rgba(108,111,245,0.42)" }}>
                              {getInitials(subAdminInfo?.name)}
                            </Avatar>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ fontSize: 13.5, fontWeight: 800, color: "#dde0ef", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{subAdminInfo?.name}</div>
                              <div style={{ fontSize: 11, color: D.sbMuted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{subAdminInfo?.email}</div>
                            </div>
                          </div>
                          <div style={{ marginTop: 10 }}>
                            <Chip size="small"
                              label={
                                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                                  <ShieldCheck size={9} />{t("সাবএডমিন", "SubAdmin")}
                                  <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: D.green, display: "inline-block" }} />
                                </span>
                              }
                              sx={{ background: "rgba(108,111,245,0.1)", border: "1px solid rgba(108,111,245,0.22)", color: "#818cf8", height: 22, fontFamily: "Outfit", "& .MuiChip-label": { padding: "0 8px" } }}
                            />
                          </div>
                        </div>
                        <div style={{ padding: 8 }}>
                          {[
                            { icon: User,     bn: "আমার প্রোফাইল", en: "My Profile", path: "/portal-v7m4/profile",  color: "#818cf8" },
                            { icon: Settings, bn: "সেটিংস",        en: "Settings",   path: "/portal-v7m4/settings", color: "#94a3b8" },
                          ].map(({ icon: Icon, bn, en, path, color }) => (
                            <motion.div key={path} className="dd-item" whileHover={{ x: 3 }}
                              onClick={() => { navigate(path); setDropdownOpen(false); }}>
                              <div style={{ width: 27, height: 27, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: `${color}12`, border: `1px solid ${color}1e`, flexShrink: 0 }}>
                                <Icon size={13} color={color} />
                              </div>
                              {t(bn, en)}
                            </motion.div>
                          ))}
                        </div>
                        <Divider style={{ borderColor: D.sbBorder, margin: 0 }} />
                        <div style={{ padding: 8 }}>
                          <motion.div className="dd-item" whileHover={{ x: 3 }} onClick={handleLogout}
                            style={{ color: "#f87171" }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <div style={{ width: 27, height: 27, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(239,68,68,0.09)", border: "1px solid rgba(239,68,68,0.18)", flexShrink: 0 }}>
                              <LogOut size={13} color="#f87171" />
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

          {/* ── BODY ── */}
          <div className="sa-body">

            {/* Mobile overlay */}
            <AnimatePresence>
              {showOverlay && (
                <motion.div className="sa-overlay"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setSidebarOpen(false)}
                />
              )}
            </AnimatePresence>

            {/* ── SIDEBAR ── */}
            <aside className={`sa-sidebar ${sidebarOpen ? "open" : ""} ${slim ? "slim" : ""}`}>
              <div className="sa-noise" />

              {/* Brand */}
              <div style={{
                position: "relative", zIndex: 1, flexShrink: 0, minHeight: 70,
                padding: slim ? "18px 0" : "18px 16px",
                borderBottom: `1px solid ${D.sbBorder}`,
                display: "flex", alignItems: "center",
                justifyContent: slim ? "center" : "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11, overflow: "hidden" }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: "linear-gradient(135deg,#6c6ff5,#4f46e5)",
                    boxShadow: "0 6px 22px rgba(108,111,245,0.45)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <ShieldCheck size={18} color="#fff" strokeWidth={2} />
                  </div>
                  {!slim && (
                    <div>
                      <div className="brand-text">SubAdmin</div>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: D.sbMuted, marginTop: 2 }}>
                        Nahid Enterprise
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Search */}
              {!slim && (
                <div style={{ padding: "10px 13px 4px", flexShrink: 0, position: "relative", zIndex: 1 }}>
                  <Search size={13} color={D.sbMuted} style={{ position: "absolute", left: 25, top: "50%", transform: "translateY(-28%)", pointerEvents: "none" }} />
                  <input type="text" className="sb-search" value={search} onChange={e => setSearch(e.target.value)} placeholder={t("মেনু খুঁজুন...", "Search menu...")} />
                </div>
              )}

              {/* Nav */}
              <nav className="sa-nav-sc" style={{ flex: 1, overflowY: "auto", padding: slim ? "8px 9px" : "4px 11px 12px", position: "relative", zIndex: 1 }}>
                {filteredMenu.map(item => (
                  <NavItem
                    key={item.key}
                  item={item}
                    isActive={location.pathname === item.path}
                    onClick={() => { navigate(item.path); if (!isDesktop) setSidebarOpen(false); }}
                    t={t}
                    slim={slim}
                  />
                ))}  
              </nav>

              {/* User footer */}
              <div style={{ flexShrink: 0, position: "relative", zIndex: 1 }}>
                <Divider style={{ borderColor: D.sbBorder, margin: 0 }} />
                <div style={{ padding: slim ? "12px 9px" : "12px 13px" }}>
                  {slim ? (
                    <Tooltip title={subAdminInfo?.name || "SubAdmin"} placement="right">
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <Avatar sx={{ width: 34, height: 34, fontSize: 12, fontWeight: 800, fontFamily: "Outfit", cursor: "pointer", background: "linear-gradient(135deg,#818cf8,#6366f1)", boxShadow: "0 4px 14px rgba(108,111,245,0.4)" }}>
                          {getInitials(subAdminInfo?.name)}
                        </Avatar>
                      </div>
                    </Tooltip>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: 11, background: "rgba(255,255,255,0.035)", border: `1px solid ${D.sbBorder}` }}>
                      <Avatar sx={{ width: 34, height: 34, fontSize: 12, fontWeight: 800, fontFamily: "Outfit", flexShrink: 0, background: "linear-gradient(135deg,#818cf8,#6366f1)", boxShadow: "0 4px 12px rgba(108,111,245,0.38)" }}>
                        {getInitials(subAdminInfo?.name)}
                      </Avatar>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: D.sbText, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {subAdminInfo?.name || "SubAdmin"}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                          <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: D.green, display: "inline-block", flexShrink: 0 }} />
                          <span style={{ fontSize: 10, fontWeight: 600, color: D.sbMuted }}>{t("সক্রিয়", "Active")}</span>
                        </div>
                      </div>
                      <Tooltip title={t("সাইন আউট", "Sign Out")} placement="top">
                        <button onClick={handleLogout}
                          style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.16)", color: D.red, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", outline: "none" }}>
                          <LogOut size={12} />
                        </button>
                      </Tooltip>
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* ── CONTENT ── */}
            <div className={`sa-content ${slim ? "slim" : ""}`}>

              {/* Approval banner */}
              <AnimatePresence>
                {approvedNotif && (
                  <motion.div
                    initial={{ opacity: 0, y: -14, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ type: "spring", stiffness: 300, damping: 26 }}
                    style={{ margin: "12px 16px 0", display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", borderRadius: 12, background: "linear-gradient(135deg,rgba(34,197,94,0.1),rgba(16,185,129,0.06))", border: "1px solid rgba(34,197,94,0.22)", boxShadow: "0 4px 20px rgba(34,197,94,0.1)" }}
                  >
                    <div style={{ width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(34,197,94,0.14)", border: "1px solid rgba(34,197,94,0.24)", flexShrink: 0 }}>
                      <ShieldCheck size={14} color={D.green} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#4ade80" }}>🎉 আপনার অ্যাকাউন্ট অনুমোদিত হয়েছে!</div>
                      <div style={{ fontSize: 11, color: "#86efac", marginTop: 2 }}>অ্যাডমিন আপনার SubAdmin অ্যাকাউন্ট অনুমোদন করেছেন।</div>
                    </div>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setApprovedNotif(false)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#86efac", padding: 0, flexShrink: 0 }}>
                      <X size={14} />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main */}
              <main className="sa-main-sc" style={{ flex: 1, overflowY: "auto", padding: "18px 16px 24px", background: D.bg, height: "100%" }}>
                <Outlet />
              </main>
            </div>

          </div>
        </div>
      </ConfigProvider>

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