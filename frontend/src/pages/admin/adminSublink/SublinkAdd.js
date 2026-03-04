import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const SublinkAdd = ({
  name,
  setName,
  isActive,
  setIsActive,
  parent,
  setParent,
  parents,
  parentDropdown,
  setParentDropdown,
  parentRef,
  statusOptions,
  statusDropdown,
  setStatusDropdown,
  statusRef,
  handleSubmit,
  setView,
  nameError,
  editId,
  parentError,
}) => {
  return (
    <div className="flex justify-center mt-8 px-4 sm:px-6">
      <div className="w-full max-w-xl">

        <AnimatePresence mode="wait">
          <motion.form
            key="add"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="bg-white p-5 sm:p-6 md:p-8 rounded-2xl border border-slate-200 shadow-lg space-y-5"
          >

            {/* Title */}
            <div className="text-center">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-800">
                {editId ? "Update Sublink" : "Add Sublink"}
              </h2>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Sublink Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-slate-200 rounded-xl px-4 h-10 sm:h-11 text-xs sm:text-sm md:text-base outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition w-full"
                required
              />

              {nameError && (
                <p className="text-red-500 text-xs sm:text-sm">
                  {nameError}
                </p>
              )}
            </div>

            {/* Parent Dropdown */}
            <div className="relative w-full" ref={parentRef}>
              <button
                type="button"
                onClick={() => setParentDropdown(!parentDropdown)}
                className="flex items-center justify-between gap-3 bg-white border border-slate-300 px-4 h-10 sm:h-11 rounded-xl text-xs sm:text-sm md:text-base shadow-sm hover:shadow-md hover:border-slate-400 transition-all w-full"
              >
                <span className="text-slate-700">
                  {parent
                    ? parents.find((p) => p._id === parent)?.name
                    : "Select Parent Link"}
                </span>
                <ChevronDown size={16} className="text-slate-500" />
              </button>

              <AnimatePresence>
                {parentDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto"
                  >
                    {parents.length > 0 ? (
                      parents.map((p) => (
                        <div
                          key={p._id}
                          onClick={() => {
                            setParent(p._id);
                            setParentDropdown(false);
                          }}
                          className="px-4 py-3 text-xs sm:text-sm md:text-base hover:bg-slate-50 cursor-pointer transition"
                        >
                          {p.name}
                        </div>
                        
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-slate-400">
                        No parent links found
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {
              parentError && (
                <p className="text-red-500 text-sm  mx-2">
                  {parentError}
                </p>
              )
            }

            {/* Status Dropdown */}
            <div className="relative w-full" ref={statusRef}>
              <button
                type="button"
                onClick={() => setStatusDropdown(!statusDropdown)}
                className="flex items-center justify-between gap-3 bg-white border border-slate-300 px-4 h-10 sm:h-11 rounded-xl text-xs sm:text-sm md:text-base shadow-sm hover:shadow-md hover:border-slate-400 transition-all w-full"
              >
                <span className="text-slate-700">
                  {
                    statusOptions.find(
                      (o) => o.value === isActive
                    )?.label
                  }
                </span>
                <ChevronDown size={16} className="text-slate-500" />
              </button>

              <AnimatePresence>
                {statusDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-50"
                  >
                    {statusOptions.map((option) => (
                      <div
                        key={option.label}
                        onClick={() => {
                          setIsActive(option.value);
                          setStatusDropdown(false);
                        }}
                        className="px-4 py-3 text-xs sm:text-sm md:text-base hover:bg-slate-50 cursor-pointer transition"
                      >
                        {option.label}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="submit"
                className="w-full sm:w-1/2 bg-gradient-to-r from-slate-600 to-slate-800 text-white px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm md:text-base font-medium shadow-md hover:shadow-xl transition-all"
              >
                {editId ? "Update" : "Create"}
              </button>

              <button
                type="button"
                onClick={() => setView("home")}
                className="w-full sm:w-1/2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm md:text-base transition"
              >
                Cancel
              </button>
            </div>

          </motion.form>
        </AnimatePresence>

      </div>
    </div>
  );
};
export default SublinkAdd;