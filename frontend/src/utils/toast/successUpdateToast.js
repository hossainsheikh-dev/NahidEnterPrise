import toast from "react-hot-toast";
import { CheckCircle } from "lucide-react";

export const showUpdateSuccessToast = (linkName = "Link") => {
  toast.custom(
    (t) => (
      <div
        className={`
          flex items-start sm:items-center gap-3
          w-[260px] sm:min-w-[320px]
          px-4 py-3 sm:py-4
          rounded-xl
          bg-green-500
          backdrop-blur-xl
          border border-emerald-500/20
          shadow-[0_10px_35px_rgba(16,185,129,0.18)]
          text-white
          transition-all duration-300
          ${t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
        `}
      >
        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/40 shrink-0">
          <CheckCircle className="text-white" size={18} />
        </div>

        <div className="flex flex-col leading-tight">
          <span className="text-xs sm:text-sm font-semibold">
            Link Updated Successfully
          </span>
          <span className="text-[11px] sm:text-xs text-emerald-100 truncate">
            "{linkName}" updated
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