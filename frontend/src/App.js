import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

/* ================= PUBLIC ================= */
import Home from "./pages/Home";

/* ================= ADMIN PAGES ================= */
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DashboardHome from "./pages/admin/DashboardHome";
import AdminProfile from "./pages/admin/AdminProfile";
import LinkHome from "./pages/admin/adminLink/LinkHome";
import SublinkHome from "./pages/admin/adminSublink/SublinkHome";
import AdminNotFound from "./pages/admin/AdminNotFound";

/* ================= ROUTE GUARDS ================= */
import ProtectedRoute from "./Route/ProtectedRoute";
import PublicRoute from "./Route/PublicRoute";

function App() {
  return (
    <Router>
      <Toaster position="top-right" />

      <Routes>
        {/* ================= PUBLIC HOME ================= */}
        <Route path="/" element={<Home />} />

        {/* ================= ADMIN LOGIN ================= */}
        <Route
          path="/admin/login"
          element={
            <PublicRoute>
              <AdminLogin />
            </PublicRoute>
          }
        />

        {/* ================= ADMIN PANEL ================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          {/* Default Redirect */}
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* Dashboard */}
          <Route path="dashboard" element={<DashboardHome />} />

          {/* Profile */}
          <Route path="profile" element={<AdminProfile />} />

          {/* Parent Links */}
          <Route path="links" element={<LinkHome />} />

          {/* Sublinks */}
          <Route path="sublinks" element={<SublinkHome />} />

          {/* Admin 404 */}
          <Route path="*" element={<AdminNotFound />} />
        </Route>

        {/* Global 404 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;