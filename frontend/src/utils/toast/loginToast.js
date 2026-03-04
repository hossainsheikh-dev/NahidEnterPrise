import toast from "react-hot-toast";
import { CheckCircle } from "lucide-react";

export const showLoginToast = (adminName = "Admin") => {
  toast.custom((t) => (
    <div
      className={`
        flex items-center gap-4
        px-5 py-4
        min-w-[320px]
        rounded-xl
        bg-[#0b1220]/90
        backdrop-blur-xl
        border border-emerald-500/20
        shadow-[0_0_30px_rgba(16,185,129,0.15)]
        text-white
        transition-all duration-300
        ${t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
      `}
    >
      {/* Icon */}
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
        <CheckCircle className="text-emerald-400" size={20} />
      </div>

      {/* Text */}
      <div className="flex flex-col">
        <span className="text-sm font-semibold tracking-wide">
          Login Successful
        </span>
        <span className="text-xs text-slate-400">
          Welcome back, {adminName}
        </span>
      </div>
    </div>
  ), {
    duration: 2200,
    position: "top-right",
  });
};