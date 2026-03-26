import toast from "react-hot-toast";
import { CheckCircle } from "lucide-react";

export const showDeleteSuccessToast = (linkName = "Link") => {
  toast.custom(
    (t) => (
      <div
        className={`
          flex items-start sm:items-center gap-3
          w-[260px] sm:min-w-[320px]
          px-4 py-3 sm:py-4
          rounded-xl
          bg-rose-500
          backdrop-blur-xl
          border border-red-400/30
          shadow-[0_10px_35px_rgba(239,68,68,0.25)]
          text-white
          transition-all duration-300
          ${t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
        `}
      >

        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-500/20 border border-red-300/40 shrink-0">
          <CheckCircle className="text-white" size={18} />
        </div>

        <div className="flex flex-col leading-tight">
          <span className="text-xs sm:text-sm font-semibold">
            Link Deleted Successfully
          </span>
          <span className="text-[11px] sm:text-xs text-red-100 truncate">
            "{linkName}" deleted
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