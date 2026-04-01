import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import SubAdminBell from "../../components/SubAdminBell";
import AdminFloatingChat from "../../components/AdminFloatingChat";
import { useAdminLang } from "../../context/AdminLangContext";

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Link as LinkIcon,
  Layers,
  ShieldCheck,
  Activity,
  Truck,
  Search,
  ChevronRight,
} from "lucide-react";

import { adminDashboardDesign as design } from "../../design/adminDashboardDesign";
import { showLogoutToast } from "../../utils/toast/logoutToast";

const getMenuItems = (t) => [
  { name: t("ড্যাশবোর্ড",    "Dashboard"),    icon: LayoutDashboard, path: "/manage-x9k2/dashboard",     group: "main"    },
  { name: t("পণ্য",           "Products"),     icon: Package,         path: "/manage-x9k2/products",      group: "main"    },
  { name: t("অর্ডার",         "Orders"),       icon: ShoppingCart,    path: "/manage-x9k2/orders",        group: "main"    },
  { name: t("ডেলিভারি",       "Delivery"),     icon: Truck,           path: "/manage-x9k2/delivery",      group: "main"    },
  { name: t("ব্যবহারকারী",    "Users"),        icon: Users,           path: "/manage-x9k2/users",         group: "main"    },
  { name: t("বিশ্লেষন",  "Analytics"),    icon: BarChart3,       path: "/manage-x9k2/analytics",     group: "main"    },
  { name: t("লিংক",           "Link"),         icon: LinkIcon,        path: "/manage-x9k2/links",         group: "nav"     },
  { name: t("সাবলিংক",        "SubLink"),      icon: Layers,          path: "/manage-x9k2/sublinks",      group: "nav"     },
  { name: t("সাব-এডমিন",      "SubAdmins"),    icon: ShieldCheck,     path: "/manage-x9k2/subadmins",     group: "nav"     },
  { name: t("পণ্য লগ",        "Product Logs"), icon: Activity,        path: "/manage-x9k2/product-logs",  group: "logs"    },
  { name: t("অর্ডার লগ",      "Order Logs"),   icon: Activity,        path: "/manage-x9k2/order-logs",    group: "logs"    },
  { name: t("লিংক লগ",        "Link Logs"),    icon: Activity,        path: "/manage-x9k2/link-logs",     group: "logs"    },
  { name: t("সাবলিংক লগ",     "Sublink Logs"), icon: Activity,        path: "/manage-x9k2/sublink-logs",  group: "logs"    },
  { name: t("সাবএডমিন লগ",    "Subadmin Logs"),icon: Activity,        path: "/manage-x9k2/subadmin-logs", group: "logs"    },
  { name: t("সেটিংস",         "Settings"),     icon: Settings,        path: "/manage-x9k2/settings",      group: "system"  },
];

const GROUP_LABELS = {
  main:   { bn: "প্রধান",    en: "Main"       },
  nav:    { bn: "নেভিগেশন", en: "Navigation"  },
  logs:   { bn: "লগ",       en: "Logs"        },
  system: { bn: "সিস্টেম",  en: "System"      },
};

export default function AdminDashboard() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { t }     = useAdminLang();

  const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || "{}");

  const [search,       setSearch      ] = useState("");
  const [searchFocus,  setSearchFocus ] = useState(false);
  const [dropdownOpen, setDropdownOpen ] = useState(false);
  const [sidebarOpen,  setSidebarOpen  ] = useState(false);

  const dropdownRef = useRef(null);
  const searchRef   = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name = "") => {
    const words = name.trim().split(/\s+/);
    return (
      (words[0]?.[0] || "").toUpperCase() +
      (words[1]?.[0] || "").toUpperCase()
    );
  };

  const menuItems    = getMenuItems(t);
  const filteredMenu = useMemo(() =>
    menuItems.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    ), [search, t]);

  const grouped = useMemo(() => {
    const groups = {};
    filteredMenu.forEach(item => {
      if (!groups[item.group]) groups[item.group] = [];
      groups[item.group].push(item);
    });
    return groups;
  }, [filteredMenu]);

  const handleLogout = () => {
    showLogoutToast(adminInfo?.name);
    localStorage.removeItem("adminInfo");
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    setTimeout(() => navigate("/manage-x9k2/auth"), 1200);
  };

  const currentPage = menuItems.find(m => m.path === location.pathname);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        .admin-shell * { box-sizing: border-box; }

        .admin-shell {
          font-family: 'DM Sans', sans-serif;
          background: #0a0f1e;
          min-height: 100vh;
          color: #e2e8f0;
        }

        /* ── NAVBAR ── */
        .adm-navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 50;
          height: 60px;
          background: rgba(10,15,30,0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          padding: 0 20px;
          gap: 14px;
          overflow: hidden;
        }

        .adm-brand {
          font-family: 'Instrument Serif', serif;
          font-size: 18px;
          color: #f1f5f9;
          letter-spacing: 0.01em;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .adm-brand-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c9a84c, #e8c876);
          box-shadow: 0 0 8px rgba(201,168,76,0.6);
          flex-shrink: 0;
        }

        .adm-search-wrap {
          flex: 1;
          max-width: 340px;
          min-width: 0;
          position: relative;
        }
        .adm-search-wrap svg {
          position: absolute;
          left: 12px; top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          pointer-events: none;
          transition: color 0.2s;
        }
        .adm-search-wrap.focused svg { color: #c9a84c; }
        .adm-search-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 8px 12px 8px 36px;
          font-size: 13px;
          color: #e2e8f0;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .adm-search-input::placeholder { color: #475569; }
        .adm-search-input:focus {
          border-color: rgba(201,168,76,0.4);
          background: rgba(201,168,76,0.04);
        }

        .adm-menu-btn {
          width: 36px; height: 36px;
          border-radius: 9px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: #94a3b8;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .adm-menu-btn:hover {
          background: rgba(201,168,76,0.1);
          border-color: rgba(201,168,76,0.3);
          color: #c9a84c;
        }

        .adm-spacer { flex: 1; }

        .adm-avatar-btn {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1e3a5f, #1e40af);
          border: 2px solid rgba(201,168,76,0.3);
          color: #c9a84c;
          font-size: 12px;
          font-weight: 600;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.05em;
        }
        .adm-avatar-btn:hover {
          border-color: rgba(201,168,76,0.7);
          box-shadow: 0 0 12px rgba(201,168,76,0.2);
        }

        .adm-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 220px;
          background: #111827;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }
        .adm-dropdown-head {
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; flex-direction: column; gap: 2px;
        }
        .adm-dropdown-head span:first-child {
          font-size: 13px; font-weight: 600; color: #f1f5f9;
        }
        .adm-dropdown-head span:last-child {
          font-size: 11px; color: #64748b;
        }
        .adm-dropdown-item {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 16px;
          font-size: 13px; color: #94a3b8;
          cursor: pointer;
          transition: all 0.15s;
        }
        .adm-dropdown-item:hover { background: rgba(255,255,255,0.04); color: #e2e8f0; }
        .adm-dropdown-danger {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 16px;
          font-size: 13px; color: #f87171;
          cursor: pointer;
          transition: all 0.15s;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .adm-dropdown-danger:hover { background: rgba(239,68,68,0.08); }

        .adm-body {
          display: flex;
          padding-top: 60px;
          min-height: 100vh;
        }

        .adm-overlay {
          position: fixed; inset: 0; z-index: 39;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
        }

        .adm-sidebar {
          position: fixed;
          top: 60px; left: 0; bottom: 0;
          width: 252px;
          background: #0d1426;
          border-right: 1px solid rgba(255,255,255,0.05);
          display: flex; flex-direction: column;
          z-index: 40;
          overflow-y: auto;
          transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
          scrollbar-width: none;
        }
        .adm-sidebar::-webkit-scrollbar { display: none; }

        @media (min-width: 1024px) {
          .adm-sidebar { transform: translateX(0) !important; }
          .adm-content { margin-left: 252px; }
          .adm-menu-btn { display: none; }
        }

        .adm-sidebar.open { transform: translateX(0); }

        .adm-sidebar-top {
          padding: 20px 16px 12px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .adm-sidebar-brand {
          font-family: 'Instrument Serif', serif;
          font-size: 15px; color: #f1f5f9;
          display: flex; align-items: center; gap: 8px;
        }
        .adm-close-btn {
          width: 30px; height: 30px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.08);
          background: transparent;
          color: #64748b;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
          display: none;
        }
        @media (max-width: 1023px) { .adm-close-btn { display: flex; } }
        .adm-close-btn:hover { color: #e2e8f0; background: rgba(255,255,255,0.06); }

        .adm-nav { padding: 12px 10px 20px; flex: 1; }

        .adm-group-label {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #334155;
          padding: 14px 8px 6px;
        }

        .adm-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 10px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 400;
          color: #64748b;
          cursor: pointer;
          transition: all 0.15s;
          position: relative;
          margin-bottom: 1px;
        }
        .adm-nav-item svg { flex-shrink: 0; }
        .adm-nav-item:hover { background: rgba(255,255,255,0.04); color: #cbd5e1; }
        .adm-nav-item.active {
          background: linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.06));
          color: #c9a84c;
          font-weight: 500;
          border: 1px solid rgba(201,168,76,0.15);
        }
        .adm-nav-item.active::before {
          content: '';
          position: absolute;
          left: 0; top: 20%; bottom: 20%;
          width: 3px;
          background: linear-gradient(180deg, #c9a84c, #e8c876);
          border-radius: 0 2px 2px 0;
        }
        .adm-nav-chevron { margin-left: auto; opacity: 0; transition: opacity 0.15s; }
        .adm-nav-item:hover .adm-nav-chevron { opacity: 0.4; }
        .adm-nav-item.active .adm-nav-chevron { opacity: 0.7; }

        .adm-sidebar-footer {
          padding: 14px 16px;
          border-top: 1px solid rgba(255,255,255,0.05);
          display: flex; align-items: center; gap: 10px;
        }
        .adm-sidebar-avatar {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1e3a5f, #1e40af);
          border: 1.5px solid rgba(201,168,76,0.25);
          color: #c9a84c;
          font-size: 11px; font-weight: 600;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; letter-spacing: 0.05em;
        }
        .adm-sidebar-user { flex: 1; min-width: 0; }
        .adm-sidebar-user-name {
          font-size: 12px; font-weight: 500; color: #cbd5e1;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .adm-sidebar-user-role { font-size: 10px; color: #475569; }
        .adm-logout-btn {
          width: 28px; height: 28px;
          border-radius: 7px;
          border: 1px solid rgba(239,68,68,0.2);
          background: rgba(239,68,68,0.06);
          color: #f87171;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.15s; flex-shrink: 0;
        }
        .adm-logout-btn:hover { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.4); }

        .adm-content {
          flex: 1;
          min-height: calc(100vh - 60px);
          background: #0a0f1e;
          position: relative;
        }
        .adm-content::before {
          content: '';
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none; z-index: 0;
        }
        .adm-content-inner { position: relative; z-index: 1; padding: 28px 24px; }


        @media (max-width: 640px) {
          .adm-content-inner { padding: 16px 14px; }
        }

        .adm-breadcrumb {
          display: flex; align-items: center; gap: 6px;
          margin-bottom: 20px; font-size: 11px; color: #334155;
        }
        .adm-breadcrumb span { color: #475569; }
        .adm-breadcrumb strong { color: #c9a84c; font-weight: 500; }

        .adm-orb {
          position: fixed; width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%);
          top: -100px; right: -100px; pointer-events: none; z-index: 0;
        }
        .adm-orb2 {
          position: fixed; width: 300px; height: 300px; border-radius: 50%;
          background: radial-gradient(circle, rgba(30,64,175,0.06) 0%, transparent 70%);
          bottom: -50px; left: 200px; pointer-events: none; z-index: 0;
        }
      `}</style>

      <div className="admin-shell">
        <div className="adm-orb" />
        <div className="adm-orb2" />

        {/* ═══════════ NAVBAR ═══════════ */}
        <header className="adm-navbar">
          <button className="adm-menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={18} />
          </button>

          <div className="adm-brand">
            <div className="adm-brand-dot" />
            Nahid Enterprise
          </div>

          <div className={`adm-search-wrap ${searchFocus ? "focused" : ""}`} ref={searchRef}>
            <Search size={14} />
            <input
              type="text"
              placeholder={t("মেনু খুঁজুন...", "Search menu...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
              className="adm-search-input"
            />
          </div>

          <div className="adm-spacer" />

          <SubAdminBell />

          <div style={{ position: "relative" }} ref={dropdownRef}>
            <button className="adm-avatar-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
              {getInitials(adminInfo?.name)}
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="adm-dropdown"
                >
                  <div className="adm-dropdown-head">
                    <span>{adminInfo?.name}</span>
                    <span>{adminInfo?.email}</span>
                  </div>
                  <div className="adm-dropdown-item"
                    onClick={() => { navigate("/manage-x9k2/profile"); setDropdownOpen(false); }}>
                    <User size={14} /> {t("প্রোফাইল", "Profile")}
                  </div>
                  <div className="adm-dropdown-danger" onClick={handleLogout}>
                    <LogOut size={14} /> {t("লগআউট", "Logout")}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* ═══════════ BODY ═══════════ */}
        <div className="adm-body">

          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                className="adm-overlay"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </AnimatePresence>

          {/* ═══════════ SIDEBAR ═══════════ */}
          <aside className={`adm-sidebar ${sidebarOpen ? "open" : ""}`}>
            <div className="adm-sidebar-top">
              <div className="adm-sidebar-brand">
                <div className="adm-brand-dot" />
                {t("এডমিন প্যানেল", "Admin Panel")}
              </div>
              <button className="adm-close-btn" onClick={() => setSidebarOpen(false)}>
                <X size={15} />
              </button>
            </div>

            <nav className="adm-nav">
              {Object.entries(grouped).map(([group, items]) => (
                <div key={group}>
                  <div className="adm-group-label">
                    {t(GROUP_LABELS[group]?.bn, GROUP_LABELS[group]?.en)}
                  </div>
                  {items.map((item) => {
                    const Icon     = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <div
                        key={item.path}
                        className={`adm-nav-item ${isActive ? "active" : ""}`}
                        onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                      >
                        <Icon size={16} />
                        <span>{item.name}</span>
                        <ChevronRight size={12} className="adm-nav-chevron" />
                      </div>
                    );
                  })}
                </div>
              ))}
            </nav>

            <div className="adm-sidebar-footer">
              <div className="adm-sidebar-avatar">
                {getInitials(adminInfo?.name)}
              </div>
                      <AdminFloatingChat
                         me={{ id: adminInfo._id, name: adminInfo.name, role: "admin" }}
                      />
              <div className="adm-sidebar-user">
                <div className="adm-sidebar-user-name">{adminInfo?.name || "Admin"}</div>
                <div className="adm-sidebar-user-role">Administrator</div>
              </div>
              <button className="adm-logout-btn" onClick={handleLogout} title="Logout">
                <LogOut size={13} />
              </button>
            </div>
          </aside>

          {/* ═══════════ MAIN CONTENT ═══════════ */}
          <main className="adm-content">
            <div className="adm-content-inner">
              {currentPage && (
                <div className="adm-breadcrumb">
                  <span>Nahid Enterprise</span>
                  <ChevronRight size={10} />
                  <strong>{currentPage.name}</strong>
                </div>
              )}
              <Outlet />
            </div>
          </main>
        </div>


      </div>
    </>
  );
}