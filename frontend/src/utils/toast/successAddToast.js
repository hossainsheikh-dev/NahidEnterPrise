import toast from "react-hot-toast";
import { CheckCircle } from "lucide-react";

export const showAddSuccessToast = (linkName = "Link") => {
  toast.custom(
    (t) => (
      <div
        className={`
          flex items-start sm:items-center gap-3
          w-[260px] sm:min-w-[320px]
          px-4 py-3 sm:py-4
          rounded-xl
          bg-indigo-700
          backdrop-blur-xl
          border border-emerald-500/20
          shadow-[0_10px_35px_rgba(16,185,129,0.18)]
          text-white
          transition-all duration-300
          ${t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
        `}
      >
        {/* Icon */}
        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 shrink-0">
          <CheckCircle className="text-emerald-400" size={18} />
        </div>

        {/* Text */}
        <div className="flex flex-col leading-tight">
          <span className="text-xs sm:text-sm font-semibold">
            Link Created Successfully
          </span>
          <span className="text-[11px] sm:text-xs opacity-90 truncate">
            "{linkName}" added
          </span>
        </div>
      </div>
    ),
    {
      duration: 2200,
      position: "top-right",
    }
  );
};