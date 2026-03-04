import toast from "react-hot-toast";
import { LogOut } from "lucide-react";

export const showLogoutToast = (adminName = "Admin") => {
  toast.custom(
    (t) => (
      <div
        className={`
          flex items-center gap-4
          px-5 py-4
          min-w-[340px]
          rounded-xl
          bg-white
          border border-gray-200
          shadow-lg
          text-gray-800
          transition-all duration-300
          ${t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
        `}
      >
        {/* Icon */}
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-50 border border-red-100">
          <LogOut className="text-red-500" size={20} />
        </div>

        {/* Text */}
        <div className="flex flex-col">
          <span className="text-sm font-semibold">
            Logged Out Successfully
          </span>
          <span className="text-xs text-gray-500">
            Goodbye, {adminName}
          </span>
        </div>
      </div>
    ),
    {
      duration: 2000,
      position: "top-right",
    }
  );
};