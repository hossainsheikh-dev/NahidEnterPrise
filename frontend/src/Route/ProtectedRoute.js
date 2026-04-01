import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/manage-x9k2/auth" replace />;  // ✅ নতুন
  }

  try {
    const decoded = jwtDecode(token);

    if (decoded.role !== "admin") {
      return <Navigate to="/manage-x9k2/auth" replace />;  // ✅ নতুন
    }

    return children;
  } catch (error) {
    return <Navigate to="/manage-x9k2/auth" replace />;  // ✅ নতুন
  }
}

export default ProtectedRoute;