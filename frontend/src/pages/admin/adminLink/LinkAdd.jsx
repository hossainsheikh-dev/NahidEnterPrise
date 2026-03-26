import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Link2, Loader2 } from "lucide-react";

const LinkAdd = ({
  name, setName,
  isActive, setIsActive,
  statusOptions,
  statusDropdown, setStatusDropdown, statusRef,
  handleSubmit,
  setView, resetForm,
  nameError, editId,
  submitting,
  t,
}) => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        .la-wrap * { box-sizing: border-box; }
        .la-wrap { font-family: 'DM Sans', sans-serif; }

        .la-input {
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
          padding: 12px 16px; font-size: 13px; color: #e2e8f0;
          outline: none; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
        }
        .la-input::placeholder { color: #475569; }
        .la-input:focus { border-color: rgba(201,168,76,0.35); background: rgba(201,168,76,0.03); }

        .la-select-btn {
          display: flex; align-items: center; justify-content: space-between; gap: 8px;
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
          padding: 12px 16px; font-size: 13px; color: #94a3b8;
          cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif;
        }
        .la-select-btn:hover { border-color: rgba(255,255,255,0.15); color: #cbd5e1; }

        .la-dropdown {
          background: #1a2235; border: 1px solid rgba(255,255,255,0.09);
          border-radius: 14px; overflow: hidden; box-shadow: 0 16px 48px rgba(0,0,0,0.5);
        }
        .la-dropdown-item {
          padding: 11px 16px; font-size: 13px; color: #94a3b8;
          cursor: pointer; transition: all 0.12s;
        }
        .la-dropdown-item:hover { background: rgba(255,255,255,0.05); color: #e2e8f0; }
        .la-dropdown-item.active { background: rgba(201,168,76,0.08); color: #c9a84c; font-weight: 600; }

        .la-btn-submit {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 13px 20px; border-radius: 12px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          transition: all 0.15s; border: 1px solid rgba(201,168,76,0.3);
          background: linear-gradient(135deg,rgba(201,168,76,0.2),rgba(201,168,76,0.1));
          color: #e8c876; font-family: 'DM Sans', sans-serif;
          box-shadow: 0 4px 16px rgba(201,168,76,0.12);
        }
        .la-btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(201,168,76,0.2); }
        .la-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .la-btn-cancel {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 13px 20px; border-radius: 12px;
          font-size: 13px; font-weight: 500; cursor: pointer;
          transition: all 0.15s; border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04); color: #64748b;
          font-family: 'DM Sans', sans-serif;
        }
        .la-btn-cancel:hover { background: rgba(255,255,255,0.07); color: #94a3b8; }
      `}</style>

      <div className="la-wrap flex justify-center mt-6 px-0">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.form key="add"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="relative rounded-2xl overflow-hidden p-6 sm:p-8 space-y-5"
              style={{ background: "#0d1426", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>

              {/* top line */}
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg,transparent,rgba(201,168,76,0.4) 40%,rgba(139,92,246,0.4) 70%,transparent)" }}/>

              {/* title */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.15)" }}>
                  <Link2 size={16} style={{ color: "#c9a84c" }}/>
                </div>
                <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "18px", color: "#f1f5f9", letterSpacing: "-0.01em" }}>
                  {editId ? t("লিংক আপডেট করুন","Update Link") : t("লিংক যোগ করুন","Add Link")}
                </h2>
              </div>

              {/* name input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#475569" }}>
                  {t("লিংকের নাম","Link Name")} <span style={{ color: "#f87171" }}>*</span>
                </label>
                <input type="text"
                  placeholder={t("লিংকের নাম লিখুন...","Enter link name...")}
                  value={name} onChange={e => setName(e.target.value)}
                  className="la-input" required/>
                {nameError && (
                  <p className="text-xs font-medium" style={{ color: "#f87171" }}>{nameError}</p>
                )}
              </div>

              {/* status */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#475569" }}>
                  {t("স্ট্যাটাস","Status")}
                </label>
                <div className="relative w-full" ref={statusRef}>
                  <button type="button" className="la-select-btn"
                    onClick={() => setStatusDropdown(!statusDropdown)}>
                    <span style={{ color: "#cbd5e1" }}>
                      {statusOptions.find(o => o.value === isActive)?.label}
                    </span>
                    <ChevronDown size={14}/>
                  </button>
                  <AnimatePresence>
                    {statusDropdown && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                        className="la-dropdown absolute left-0 mt-2 w-full z-50">
                        {statusOptions.map(option => (
                          <div key={String(option.value)}
                            className={`la-dropdown-item ${isActive === option.value ? "active" : ""}`}
                            onClick={() => { setIsActive(option.value); setStatusDropdown(false); }}>
                            {option.label}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button type="submit" className="la-btn-submit" disabled={submitting}>
                  {submitting
                    ? <><Loader2 size={14} className="animate-spin"/> {t("অপেক্ষা করুন…","Please wait…")}</>
                    : editId ? t("আপডেট করুন","Update") : t("তৈরি করুন","Create")
                  }
                </button>
                <button type="button" className="la-btn-cancel"
                  onClick={() => { setView("home"); resetForm?.(); }}>
                  {t("বাতিল","Cancel")}
                </button>
              </div>
            </motion.form>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default LinkAdd;