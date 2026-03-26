import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, ArrowLeft } from "lucide-react";

const SubAdmin404 = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">

      {/* 404 */}
      <motion.h1
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="text-[96px] font-black leading-none tracking-tight mb-2"
        style={{
          fontFamily: "'Syne', sans-serif",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        404
      </motion.h1>

      {/* Title */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, type: "spring", stiffness: 260, damping: 22 }}
        className="text-base font-semibold text-slate-500 mb-8 max-w-xs leading-relaxed"
      >
        The page you are looking for does not exist.
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
        className="flex gap-3 flex-wrap justify-center"
      >
        <motion.button
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/subadmin/dashboard")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{
            background: "linear-gradient(135deg,#6366f1,#4f46e5)",
            boxShadow: "0 4px 16px rgba(99,102,241,0.32)",
          }}
        >
          <LayoutDashboard size={15} />
          Dashboard
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-indigo-500"
          style={{
            background: "rgba(99,102,241,0.07)",
            border: "1.5px solid rgba(99,102,241,0.18)",
          }}
        >
          <ArrowLeft size={15} />
          Go Back
        </motion.button>
      </motion.div>
    </div>
  );
};

export default SubAdmin404;