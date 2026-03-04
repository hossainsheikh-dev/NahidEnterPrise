import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Outlet, useLocation } from "react-router-dom";

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
} from "lucide-react";

import { adminDashboardDesign as design } from "../../design/adminDashboardDesign";
import { showLogoutToast } from "../../utils/toast/logoutToast";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { name: "Products", icon: Package, path: "/admin/products" },
  { name: "Orders", icon: ShoppingCart, path: "/admin/orders" },
  { name: "Users", icon: Users, path: "/admin/users" },
  { name: "Analytics", icon: BarChart3, path: "/admin/analytics" },

  // ✅ New Added Items
  { name: "Link", icon: LinkIcon, path: "/admin/links" },
  { name: "SubLink", icon: Layers, path: "/admin/sublinks" },

  { name: "Settings", icon: Settings, path: "/admin/settings" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || "{}");

  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const dropdownRef = useRef(null);

  /* Close dropdown outside click */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* Avatar initials */
  const getInitials = (name = "") => {
    const words = name.trim().split(/\s+/);
    return (
      (words[0]?.[0] || "").toUpperCase() +
      (words[1]?.[0] || "").toUpperCase()
    );
  };

  /* Filter sidebar */
  const filteredMenu = useMemo(() => {
    return menuItems.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  /* Logout */
  const handleLogout = () => {
    showLogoutToast(adminInfo?.name);

    localStorage.removeItem("adminInfo");
    localStorage.removeItem("token");

    setTimeout(() => {
      navigate("/admin/login");
    }, 1200);
  };

  return (
    <div className={design.layout.wrapper}>
      {/* NAVBAR */}
      <header className={design.layout.navbar}>
        <button
          onClick={() => setSidebarOpen(true)}
          className={design.navbar.menuButton}
        >
          <Menu size={24} />
        </button>

        <div className={design.navbar.title}>Admin Panel</div>

        <input
          type="text"
          placeholder="Search menu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={design.navbar.search}
        />

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={design.navbar.avatarButton}
          >
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-semibold flex items-center justify-center text-sm shadow-md">
              {getInitials(adminInfo?.name)}
            </div>
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className={design.dropdown.wrapper}
              >
                <div className={design.dropdown.header}>
                  <span className="font-medium">{adminInfo?.name}</span>
                  <span className="text-xs text-slate-500">
                    {adminInfo?.email}
                  </span>
                </div>

                <div
                  onClick={() => {
                    navigate("/admin/profile");
                    setDropdownOpen(false);
                  }}
                  className={design.dropdown.item}
                >
                  <User size={16} /> Profile
                </div>

                <div
                  onClick={handleLogout}
                  className={design.dropdown.danger}
                >
                  <LogOut size={16} /> Logout
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* BODY */}
      <div className={design.layout.body}>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className={design.colors.overlay}
            />
          )}
        </AnimatePresence>

        {/* SIDEBAR */}
        <motion.aside
          className={`${design.layout.sidebar} ${
            sidebarOpen ? "translate-x-0" : ""
          }`}
        >
          <div className={design.sidebar.brandSection}>
            <div>
              <h1 className={design.sidebar.logo}>Admin Panel</h1>
              <span className={design.sidebar.subtitle}>
                Nahid Enterprise
              </span>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className={design.sidebar.closeBtn}
            >
              <X size={24} />
            </button>
          </div>

          <nav className={design.sidebar.nav}>
            {filteredMenu.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <div
                  key={item.name}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`${design.sidebar.navItem} ${
                    isActive ? design.sidebar.navItemActive : ""
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </div>
              );
            })}
          </nav>
        </motion.aside>

        {/* MAIN CONTENT */}
        <main className={design.layout.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}