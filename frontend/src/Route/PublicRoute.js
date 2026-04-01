import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function PublicRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return children;
  }

  try {
    const decoded = jwtDecode(token);

    if (decoded.role === "admin") {
      return <Navigate to="/manage-x9k2/dashboard" replace />;  // ✅ নতুন
    }

    return children;
  } catch (error) {
    return children;
  }
}

export default PublicRoute;