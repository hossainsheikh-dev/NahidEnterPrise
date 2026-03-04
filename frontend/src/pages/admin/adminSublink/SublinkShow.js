import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Plus, Pencil, Trash2 } from "lucide-react";

const SublinkShow = ({
  sublinks,
  search,
  setSearch,
  sort,
  setSort,
  sortOptions,
  dropdownOpen,
  setDropdownOpen,
  dropdownRef,
  setView,
  handleDelete,
  handleEdit,
}) => {
  return (
    <div className="mt-6 sm:mt-8 space-y-6">
      <AnimatePresence mode="wait">
        <motion.div
          key="home"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* ================= TOP BAR ================= */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
            
            {/* Search */}
            <div className="flex items-center gap-3 bg-slate-100 px-4 py-2.5 rounded-xl w-full lg:w-80 focus-within:ring-2 focus-within:ring-slate-400 transition">
              <Search size={16} className="text-slate-500" />
              <input
                type="text"
                placeholder="Search sublink..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none text-xs sm:text-sm md:text-base w-full text-slate-700 placeholder:text-slate-400"
              />
            </div>

            {/* Add Button */}
            <button
              onClick={() => setView("add")}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm md:text-base font-medium shadow-md hover:shadow-lg transition-all w-full lg:w-auto"
            >
              <Plus size={16} />
              Add Sublink
            </button>
          </div>

          {/* ================= TABLE ================= */}
          {sublinks.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">

              {/* ===== Table Header Top ===== */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6 py-4 border-b border-slate-200 bg-slate-50">
                
                <h2 className="w-full text-center sm:text-left text-sm sm:text-base md:text-lg font-semibold text-slate-800">
                  Sublinks List
                </h2>

                {/* Sorting Dropdown */}
                <div className="relative w-full sm:w-60 md:w-64" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center justify-between gap-3 w-full text-xs sm:text-sm md:text-base bg-white border border-slate-300 px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md hover:border-slate-400 transition-all duration-200"
                  >
                    <span className="text-slate-700">
                      {sortOptions.find((o) => o.value === sort)?.label}
                    </span>
                    <ChevronDown size={16} className="text-slate-500" />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-50"
                      >
                        {sortOptions.map((option) => (
                          <div
                            key={option.value}
                            onClick={() => {
                              setSort(option.value);
                              setDropdownOpen(false);
                            }}
                            className={`px-4 py-3 text-xs sm:text-sm md:text-base cursor-pointer transition ${
                              sort === option.value
                                ? "bg-slate-100 text-slate-900"
                                : "hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            {option.label}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* ===== Table ===== */}
              <div>

                {/* Table Header */}
                <div className="grid grid-cols-5 items-center px-4 sm:px-6 py-3 text-xs sm:text-sm md:text-base font-semibold text-slate-600 border-b border-slate-200">
                  <div>#</div>
                  <div>Name</div>
                  <div>Parent</div>
                  <div>Status</div>
                  <div className="text-right">Actions</div>
                </div>

                {/* Table Body */}
                {sublinks.map((sublink, index) => (
                  <div
                    key={sublink._id}
                    className="grid grid-cols-5 items-center px-4 sm:px-6 py-3 text-xs sm:text-sm md:text-base text-slate-700 border-b border-slate-100 hover:bg-slate-50 transition"
                  >
                    <div>{index + 1}</div>

                    <div className="truncate">
                      {sublink.name}
                    </div>

                    {/* Parent Name */}
                    <div className="truncate text-slate-600">
                      {sublink.parent?.name || "—"}
                    </div>

                    <div
                      className={`${
                        sublink.isActive
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {sublink.isActive ? "Active" : "Inactive"}
                    </div>

                    <div className="flex justify-end gap-3 sm:gap-4">
                      <Pencil
                        size={16}
                        className="cursor-pointer hover:text-slate-900 transition"
                        onClick={() => handleEdit(sublink)}
                      />
                      <Trash2
                        size={16}
                        className="text-red-500 cursor-pointer hover:text-red-600 transition"
                        onClick={() => handleDelete(sublink)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm sm:text-base">
              No sublinks found.
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
export default SublinkShow;