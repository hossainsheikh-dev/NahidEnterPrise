import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { authDesign } from "../../design/authDesign";
import { useNavigate } from "react-router-dom";
import { showLoginToast } from "../../utils/toast/loginToast";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ If already logged in, go to dashboard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      return setError("Please fill all fields");
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      // ✅ Ensure response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server error. Please try again.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // ✅ Check admin role
      if (data.role !== "admin") {
        throw new Error("You are not authorized as Admin");
      }

      if (!data.token) {
        throw new Error("Token not received from server");
      }

      // ✅ Save token & admin info
      localStorage.setItem("token", data.token);
      localStorage.setItem("adminInfo", JSON.stringify(data));

      // ✅ Show login success toast
      showLoginToast(data.name);

      // ✅ Redirect to dashboard
      navigate("/admin/dashboard", { replace: true });

    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      {...authDesign.animation.container}
      className={`${authDesign.colors.background} ${authDesign.layout.container}`}
    >
      <motion.div
        {...authDesign.animation.card}
        className={`${authDesign.colors.card} ${authDesign.layout.card}`}
      >
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold ${authDesign.colors.title}`}>
            Admin Login
          </h2>
          <p className={`text-sm mt-2 ${authDesign.colors.subtitle}`}>
            Enter your credentials
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            name="email"
            placeholder="Admin Email"
            value={form.email}
            onChange={handleChange}
            required
            className={`${authDesign.layout.input} ${authDesign.colors.inputBg} ${authDesign.colors.inputBorder} ${authDesign.colors.inputText}`}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className={`${authDesign.layout.input} ${authDesign.colors.inputBg} ${authDesign.colors.inputBorder} ${authDesign.colors.inputText}`}
          />

          <button
            type="submit"
            disabled={loading}
            className={`${authDesign.layout.button} ${authDesign.colors.button} ${authDesign.colors.buttonHover} text-white`}
          >
            {loading ? "Logging in..." : "Sign In"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AdminLogin;