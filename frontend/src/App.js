import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// public pages
import Home           from "./pages/Home";
import Cart           from "./pages/public/Cart";
import ProductDetail  from "./pages/public/ProductDetail";
import Checkout       from "./pages/public/Checkout";
import SearchPage     from "./pages/public/SearchPage";
import CategoryPage   from "./pages/public/CategoryPage";
import OrderPage      from "./pages/public/OrderPage";
import PaymentSuccess from "./pages/public/PaymentSuccess";
import PaymentFail    from "./pages/public/PaymentFail";
import Navbar         from "./components/Navbar";
import Footer         from "./components/Footer";
import PolicyPage     from "./pages/public/PolicyPage";
import AccountPage    from "./pages/public/AccountPage";
import AboutPage      from "./pages/public/AboutPage";
import AboutPreview   from "./components/AboutPreview";
import WishlistPage   from "./pages/public/WishlistPage";
import NotFoundPage   from "./pages/public/NotFoundPage";
import FloatingContact from "./components/FloatingContact";

// admin pages
import AdminLogin        from "./pages/admin/AdminLogin";
import AdminDashboard    from "./pages/admin/AdminDashboard";
import DashboardHome     from "./pages/admin/DashboardHome";
import AdminProfile      from "./pages/admin/AdminProfile";
import LinkHome          from "./pages/admin/adminLink/LinkHome";
import SublinkHome       from "./pages/admin/adminSublink/SublinkHome";
import AdminNotFound     from "./pages/admin/AdminNotFound";
import ProductHome       from "./pages/admin/adminProduct/ProductHome";
import AdminOrder        from "./pages/admin/adminOrder/AdminOrder";
import DeliveryConfirm   from "./pages/admin/adminOrder/DeliveryConfirm";
import AdminSubAdmins    from "./pages/admin/AdminSubAdmins";
import AdminProductLogs  from "./pages/admin/log/AdminProductLog";
import AdminLinkLogs     from "./pages/admin/log/AdminLinkLogs";
import AdminSublinkLogs  from "./pages/admin/log/AdminSublinkLogs";
import AdminSettings     from "./pages/admin/AdminSettings";
import AdminAnalytics    from "./pages/admin/AdminAnalytics";
import AdminOrderLogs    from "./pages/admin/log/AdminOrderLogs";
import AdminSubAdminLogs from "./pages/admin/log/AdminSubAdminLogs";
import { AdminLangProvider } from "./context/AdminLangContext";
import AdminUsers        from "./pages/admin/AdminUsers";

// route guards
import ProtectedRoute from "./Route/ProtectedRoute";
import PublicRoute    from "./Route/PublicRoute";

// subadmin pages
import SubAdminAuth      from "./pages/subadmin/SubAdminAuth";
import SubAdminDashboard from "./pages/subadmin/SubAdminDashboard";
import SubAdminProducts  from "./pages/subadmin/subadminProduct/SubAdminProducts";
import SubAdminSettings  from "./pages/subadmin/SubAdminSetting";
import SubAdminLinks     from "./pages/subadmin/subadminLinks/SubAdminLinks";
import SubAdminSublinks  from "./pages/subadmin/subadminSublinks/SubAdminSublinks";
import SubAdminOrders    from "./pages/subadmin/subadminOrder/SubAdminOrders";
import SubAdminDelivery  from "./pages/subadmin/subadminDelivery/SubAdminDelivery";
import SubAdmin404       from "./pages/subadmin/SubAdmin404";
import SubAdminProfile   from "./pages/subadmin/SubAdminProfile";
import SubAdminUsers     from "./pages/subadmin/SubAdminUsers";
import SubAdminHome from "./pages/subadmin/SubAdminHome";
import SubAdminAnalytics from "./pages/subadmin/SubAdminAnalytics";



function FloatingContactWrapper() {
  const location       = useLocation();
  const isAdminPage    = location.pathname.startsWith("/manage-x9k2");
  const isSubAdminPage = location.pathname.startsWith("/portal-v7m4");
  if (isAdminPage || isSubAdminPage) return null;
  return <FloatingContact />;
}



//app
function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <FloatingContactWrapper />
      <Routes>

        {/* public routes  */}
        <Route path="/"              element={<><Navbar /><Home /><AboutPreview /><Footer /></>} />
        <Route path="/cart"          element={<><Navbar /><Cart /><Footer /></>} />
        <Route path="/checkout"      element={<><Navbar /><Checkout /><Footer /></>} />
        <Route path="/search"        element={<><Navbar /><SearchPage /><Footer /></>} />
        <Route path="/order"         element={<><Navbar /><OrderPage /><Footer /></>} />
        <Route path="/product/:slug" element={<><Navbar /><ProductDetail /><Footer /></>} />
        <Route path="/privacy"       element={<><Navbar /><PolicyPage /><Footer /></>} />
        <Route path="/terms"         element={<><Navbar /><PolicyPage /><Footer /></>} />
        <Route path="/refund"        element={<><Navbar /><PolicyPage /><Footer /></>} />
        <Route path="/faq"           element={<><Navbar /><PolicyPage /><Footer /></>} />
        <Route path="/about"         element={<><Navbar /><AboutPage /><Footer /></>} />
        <Route path="/wishlist"      element={<><Navbar /><WishlistPage /><Footer /></>} />

        {/* account routes */}
        <Route path="/account"          element={<><Navbar /><AccountPage /><Footer /></>} />
        <Route path="/account/edit"     element={<><Navbar /><AccountPage /><Footer /></>} />
        <Route path="/account/password" element={<><Navbar /><AccountPage /><Footer /></>} />

        {/* payment routes */}
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/fail"    element={<PaymentFail />} />

        {/* admin login */}
        <Route path="/manage-x9k2/auth" element={<PublicRoute><AdminLogin /></PublicRoute>} />

        {/* admin dashboard */}
        <Route path="/manage-x9k2" element={
          <ProtectedRoute>
            <AdminLangProvider>
              <AdminDashboard />
            </AdminLangProvider>
          </ProtectedRoute>
        }>
          <Route index                element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"     element={<DashboardHome />} />
          <Route path="profile"       element={<AdminProfile />} />
          <Route path="links"         element={<LinkHome />} />
          <Route path="sublinks"      element={<SublinkHome />} />
          <Route path="products"      element={<ProductHome />} />
          <Route path="orders"        element={<AdminOrder />} />
          <Route path="delivery"      element={<DeliveryConfirm />} />
          <Route path="subadmins"     element={<AdminSubAdmins />} />
          <Route path="product-logs"  element={<AdminProductLogs />} />
          <Route path="order-logs"    element={<AdminOrderLogs />} />
          <Route path="link-logs"     element={<AdminLinkLogs />} />
          <Route path="sublink-logs"  element={<AdminSublinkLogs />} />
          <Route path="subadmin-logs" element={<AdminSubAdminLogs />} />
          <Route path="settings"      element={<AdminSettings />} />
          <Route path="analytics"     element={<AdminAnalytics />} />
          <Route path="users"         element={<AdminUsers />} />
          <Route path="*"             element={<AdminNotFound />} />
        </Route>

        {/* subAdmin routes */}
        <Route path="/portal-v7m4/access" element={<SubAdminAuth />} />
        <Route path="/portal-v7m4" element={<SubAdminDashboard />}>
          <Route index            element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SubAdminHome />} />
          <Route path="products"  element={<SubAdminProducts />} />
          <Route path="settings"  element={<SubAdminSettings />} />
          <Route path="links"     element={<SubAdminLinks />} />
          <Route path="sublinks"  element={<SubAdminSublinks />} />
          <Route path="analytics" element={<SubAdminAnalytics />} />
          <Route path="profile"   element={<SubAdminProfile />} />
          <Route path="orders"    element={<SubAdminOrders />} />
          <Route path="delivery"  element={<SubAdminDelivery />} />
          <Route path="users"     element={<SubAdminUsers />} />
          <Route path="*"         element={<SubAdmin404 />} />
        </Route>

        {/* admin/subadmin fallback - category route থেকে রক্ষা করতে */}
        <Route path="/manage-x9k2/*" element={<Navigate to="/manage-x9k2" replace />} />
        <Route path="/portal-v7m4/*" element={<Navigate to="/portal-v7m4" replace />} />


        {/* category routes */}
        <Route path="/:linkSlug"             element={<><Navbar /><CategoryPage /><Footer /></>} />
        <Route path="/:linkSlug/:sublinkSlug" element={<><Navbar /><CategoryPage /><Footer /></>} />

        {/* 404 */}
        <Route path="*" element={<><Navbar /><NotFoundPage /><Footer /></>} />

      </Routes>
    </Router>
  );
}

export default App;