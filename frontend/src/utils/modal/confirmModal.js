import { motion, AnimatePresence } from "framer-motion";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-5"
          >
            {/* Title */}
            <h3 className="text-lg sm:text-xl font-semibold text-slate-800 text-center">
              {title}
            </h3>

            {/* Message */}
            <p className="text-sm sm:text-base text-slate-500 text-center">
              {message}
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="w-full sm:w-1/2 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2.5 rounded-xl text-sm transition"
              >
                {cancelText}
              </button>

              <button
                onClick={onConfirm}
                className={`w-full sm:w-1/2 py-2.5 rounded-xl text-sm font-medium shadow-md transition text-white ${
                  danger
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-slate-700 hover:bg-slate-800"
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;