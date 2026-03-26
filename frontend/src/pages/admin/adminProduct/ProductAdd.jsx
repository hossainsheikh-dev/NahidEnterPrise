import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X, Upload, Package, Loader2 } from "lucide-react";

const MAX_IMAGE_SIZE_MB    = 3;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const MIN_DESCRIPTION_WORDS = 60;
const countWords = (text) => text.trim().split(/\s+/).filter(w => w.length > 0).length;

const FEATURE_ROWS = [
  { icon: "🎨", keyPlaceholder: "Color",      valuePlaceholder: "e.g. Black / Blue / Yellow / Green"        },
  { icon: "📐", keyPlaceholder: "Size",       valuePlaceholder: "e.g. Free Size / S / M / L / XL"           },
  { icon: "🧵", keyPlaceholder: "Material",   valuePlaceholder: "e.g. Polyester / PVC / Nylon"              },
  { icon: "🧥", keyPlaceholder: "Type",       valuePlaceholder: "e.g. Poncho / Jacket / Suit / Riding Coat" },
  { icon: "⚖️", keyPlaceholder: "Weight",     valuePlaceholder: "e.g. 300g / 450g / 600g"                   },
  { icon: "👤", keyPlaceholder: "Gender",     valuePlaceholder: "e.g. Men / Women / Unisex / Kids"          },
  { icon: "💧", keyPlaceholder: "Waterproof", valuePlaceholder: "e.g. 100% Waterproof / Water Resistant"    },
  { icon: "🛡️", keyPlaceholder: "Warranty",   valuePlaceholder: "e.g. No Warranty / 6 Months / 1 Year"      },
  { icon: "🌍", keyPlaceholder: "Country",    valuePlaceholder: "e.g. Bangladesh / China / India"           },
  { icon: "🪖", keyPlaceholder: "Hood",       valuePlaceholder: "e.g. Yes / No / Detachable"                },
];

const ProductAdd = ({
  name, setName, description, setDescription,
  price, setPrice, stock, setStock,
  link, setLink, sublink, setSublink,
  selectedParent, setSelectedParent,
  parentLinks, allSublinks,
  isActive, setIsActive, statusOptions,
  discountType, setDiscountType,
  discountValue, setDiscountValue,
  isFeatured, setIsFeatured,
  features, setFeatures,
  images, setImages, existingImages,
  handleSubmit, setView, resetForm,
  nameError, sublinkError, editId,
  submitting, t,
}) => {
  const discountTypeOptions = [
    { label: t("ডিসকাউন্ট নেই","No Discount"),     value: "none"    },
    { label: t("শতাংশ ছাড় (%)","Percent Off (%)"), value: "percent" },
    { label: t("নির্দিষ্ট ছাড় (৳)","Flat Off (৳)"), value: "flat"   },
  ];

  const [parentDropdown,   setParentDropdown  ] = useState(false);
  const [sublinkDropdown,  setSublinkDropdown ] = useState(false);
  const [statusDropdown,   setStatusDropdown  ] = useState(false);
  const [discountDropdown, setDiscountDropdown] = useState(false);

  const parentRef   = useRef(null);
  const sublinkRef  = useRef(null);
  const statusRef   = useRef(null);
  const discountRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!parentRef.current?.contains(e.target))   setParentDropdown(false);
      if (!sublinkRef.current?.contains(e.target))  setSublinkDropdown(false);
      if (!statusRef.current?.contains(e.target))   setStatusDropdown(false);
      if (!discountRef.current?.contains(e.target)) setDiscountDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredSublinks    = allSublinks.filter(s => s.parent?._id === selectedParent || s.parent === selectedParent);
  const selectedParentName  = parentLinks.find(p => p._id === selectedParent)?.name;
  const selectedSublinkName = allSublinks.find(s => s._id === sublink)?.name;

  const salePrice = (() => {
    const p = parseFloat(price); const v = parseFloat(discountValue);
    if (!p || !v || discountType === "none") return null;
    if (discountType === "percent") return Math.round(p - (p * v) / 100);
    if (discountType === "flat")    return Math.max(0, p - v);
    return null;
  })();

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const oversized = files.filter(f => f.size > MAX_IMAGE_SIZE_BYTES);
    if (oversized.length > 0) {
      alert(`${t("এই ছবিগুলো","These images")} ${MAX_IMAGE_SIZE_MB}MB ${t("এর বেশি:","exceed:")}\n${oversized.map(f => f.name).join("\n")}`);
      e.target.value = ""; return;
    }
    setImages(prev => [...prev, ...files].slice(0, 5));
    e.target.value = "";
  };

  const removeNewImage = (index) => setImages(prev => prev.filter((_, i) => i !== index));
  const wordCount   = countWords(description);
  const wordCountOk = wordCount >= MIN_DESCRIPTION_WORDS;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!selectedParent) { alert(t("অনুগ্রহ করে একটি লিংক বেছে নিন (আবশ্যক)","Please select a Link (required)")); return; }
    if (!editId && images.length === 0) { alert(t("কমপক্ষে একটি ছবি আবশ্যক!","At least one image is required!")); return; }
    if (!wordCountOk) { alert(`${t("বিবরণ কমপক্ষে","Description must be at least")} ${MIN_DESCRIPTION_WORDS} ${t("শব্দ হতে হবে।","words.")}`); return; }
    handleSubmit(e);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        .pa-wrap * { box-sizing: border-box; }
        .pa-wrap { font-family: 'DM Sans', sans-serif; }

        .pa-input {
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
          padding: 12px 16px; font-size: 13px; color: #e2e8f0;
          outline: none; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
        }
        .pa-input::placeholder { color: #475569; }
        .pa-input:focus { border-color: rgba(201,168,76,0.35); background: rgba(201,168,76,0.03); }
        .pa-input.error { border-color: rgba(248,113,113,0.4); }
        .pa-input.error:focus { border-color: rgba(248,113,113,0.6); background: rgba(248,113,113,0.03); }

        .pa-textarea {
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
          padding: 12px 16px; font-size: 13px; color: #e2e8f0;
          outline: none; transition: all 0.2s; resize: none; font-family: 'DM Sans', sans-serif;
        }
        .pa-textarea::placeholder { color: #475569; }
        .pa-textarea:focus { border-color: rgba(201,168,76,0.35); background: rgba(201,168,76,0.03); }

        .pa-select-btn {
          display: flex; align-items: center; justify-content: space-between; gap: 8px;
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
          padding: 12px 16px; font-size: 13px; color: #94a3b8;
          cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif;
        }
        .pa-select-btn:hover { border-color: rgba(255,255,255,0.15); color: #cbd5e1; }
        .pa-select-btn.has-value { color: #e8c876; border-color: rgba(201,168,76,0.25); }
        .pa-select-btn.required-empty { border-color: rgba(248,113,113,0.35); }

        .pa-dropdown {
          background: #1a2235; border: 1px solid rgba(255,255,255,0.09);
          border-radius: 14px; overflow: hidden; box-shadow: 0 16px 48px rgba(0,0,0,0.5);
        }
        .pa-dd-item { padding: 11px 16px; font-size: 13px; color: #94a3b8; cursor: pointer; transition: all 0.12s; }
        .pa-dd-item:hover { background: rgba(255,255,255,0.05); color: #e2e8f0; }
        .pa-dd-item.active { background: rgba(201,168,76,0.08); color: #c9a84c; font-weight: 600; }
        .pa-dd-item.none-item { font-style: italic; color: #475569; }

        .pa-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #475569; display: block; margin-bottom: 6px; }

        .pa-section {
          border-radius: 14px; padding: 16px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .pa-section-title { font-size: 12px; font-weight: 600; color: #94a3b8; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.06em; }

        .pa-btn-submit {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 13px 20px; border-radius: 12px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          transition: all 0.15s; border: 1px solid rgba(201,168,76,0.3);
          background: linear-gradient(135deg,rgba(201,168,76,0.2),rgba(201,168,76,0.1));
          color: #e8c876; font-family: 'DM Sans', sans-serif;
          box-shadow: 0 4px 16px rgba(201,168,76,0.12);
        }
        .pa-btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(201,168,76,0.2); }
        .pa-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .pa-btn-cancel {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 13px 20px; border-radius: 12px;
          font-size: 13px; font-weight: 500; cursor: pointer;
          transition: all 0.15s; border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04); color: #64748b;
          font-family: 'DM Sans', sans-serif;
        }
        .pa-btn-cancel:hover { background: rgba(255,255,255,0.07); color: #94a3b8; }

        .pa-feature-row {
          border-radius: 10px; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.06);
          transition: border-color 0.2s;
          display: flex;
        }
        .pa-feature-row.filled { border-color: rgba(52,211,153,0.25); }
        .pa-feature-key {
          display: flex; align-items: center; gap: 8px;
          padding: 11px 14px; min-width: 150px; flex-shrink: 0;
          background: rgba(255,255,255,0.03);
          border-right: 1px solid rgba(255,255,255,0.06);
          transition: background 0.2s;
        }
        .pa-feature-key.filled { background: rgba(52,211,153,0.05); border-right-color: rgba(52,211,153,0.15); }
        .pa-feature-val {
          flex: 1; padding: 11px 14px;
          background: transparent;
          border: none; outline: none;
          font-size: 13px; font-weight: 500; color: #e2e8f0;
          font-family: 'DM Sans', sans-serif;
        }
        .pa-feature-val::placeholder { color: #334155; font-weight: 400; }
        .pa-upload-zone {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          width: 100%; height: 100px; border-radius: 12px; cursor: pointer;
          border: 1.5px dashed rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.02);
          transition: all 0.2s;
        }
        .pa-upload-zone:hover { border-color: rgba(201,168,76,0.3); background: rgba(201,168,76,0.03); }
        .pa-upload-zone.required { border-color: rgba(248,113,113,0.3); }
        .pa-upload-zone.required:hover { border-color: rgba(248,113,113,0.5); background: rgba(248,113,113,0.03); }
      `}</style>

      <div className="pa-wrap flex justify-center mt-6 px-0">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.form key="add"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}
              onSubmit={handleFormSubmit}
              className="relative rounded-2xl overflow-hidden p-6 sm:p-8 space-y-5"
              style={{ background: "#0d1426", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>

              {/* top line */}
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg,transparent,rgba(201,168,76,0.4) 40%,rgba(139,92,246,0.4) 70%,transparent)" }}/>

              {/* title */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.15)" }}>
                  <Package size={16} style={{ color: "#c9a84c" }}/>
                </div>
                <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "18px", color: "#f1f5f9", letterSpacing: "-0.01em" }}>
                  {editId ? t("পণ্য আপডেট করুন","Update Product") : t("পণ্য যোগ করুন","Add Product")}
                </h2>
              </div>

              {/* name */}
              <div>
                <label className="pa-label">{t("পণ্যের নাম","Product Name")} <span style={{ color: "#f87171" }}>*</span></label>
                <input type="text" placeholder={t("পণ্যের নাম লিখুন...","Enter product name...")}
                  value={name} onChange={e => setName(e.target.value)}
                  className={`pa-input ${nameError ? "error" : ""}`} required/>
                {nameError && <p className="text-xs mt-1.5" style={{ color: "#f87171" }}>{nameError}</p>}
              </div>

              {/* description */}
              <div>
                <label className="pa-label">
                  {t("পণ্যের বিবরণ","Description")} <span style={{ color: "#f87171" }}>*</span>
                  <span style={{ color: "#334155", fontWeight: 400, marginLeft: "6px", textTransform: "none" }}>
                    (min {MIN_DESCRIPTION_WORDS} {t("শব্দ","words")})
                  </span>
                </label>
                <textarea
                  placeholder={t("পণ্যের বিবরণ লিখুন...","Write product description...")}
                  value={description} onChange={e => setDescription(e.target.value)} rows={4}
                  className={`pa-textarea ${description && !wordCountOk ? "error" : ""}`} required/>
                <div className="flex items-center justify-between px-1 mt-1.5">
                  <p className="text-xs" style={{ color: wordCountOk ? "#34d399" : "#475569" }}>
                    {wordCount} / {MIN_DESCRIPTION_WORDS} {t("শব্দ","words")} {wordCountOk && "✓"}
                  </p>
                  {description && !wordCountOk && (
                    <p className="text-xs" style={{ color: "#f87171" }}>{MIN_DESCRIPTION_WORDS - wordCount} {t("আরো শব্দ দরকার","more words needed")}</p>
                  )}
                </div>
              </div>

              {/* price & stock */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="pa-label">{t("মূল্য (৳)","Price (৳)")} <span style={{ color: "#f87171" }}>*</span></label>
                  <input type="number" placeholder="0" value={price} onChange={e => setPrice(e.target.value)}
                    className="pa-input" required min={0}/>
                </div>
                <div>
                  <label className="pa-label">{t("স্টক","Stock")}</label>
                  <input type="number" placeholder="0" value={stock} onChange={e => setStock(e.target.value)}
                    className="pa-input" min={0}/>
                </div>
              </div>

              {/* discount */}
              <div className="pa-section">
                <p className="pa-section-title">{t("ডিসকাউন্ট","Discount")}</p>
                <div className="relative w-full" ref={discountRef}>
                  <button type="button" className={`pa-select-btn ${discountType !== "none" ? "has-value" : ""}`}
                    onClick={() => setDiscountDropdown(!discountDropdown)}>
                    <span>{discountTypeOptions.find(o => o.value === discountType)?.label}</span>
                    <ChevronDown size={14}/>
                  </button>
                  <AnimatePresence>
                    {discountDropdown && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                        className="pa-dropdown absolute left-0 mt-2 w-full z-50">
                        {discountTypeOptions.map(o => (
                          <div key={o.value}
                            className={`pa-dd-item ${discountType === o.value ? "active" : ""}`}
                            onClick={() => { setDiscountType(o.value); if (o.value === "none") setDiscountValue(0); setDiscountDropdown(false); }}>
                            {o.label}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {discountType !== "none" && (
                  <div className="mt-3 space-y-2">
                    <input type="number"
                      placeholder={discountType === "percent" ? t("ডিসকাউন্ট % (যেমন ১০)","Discount % (e.g. 10)") : t("নির্দিষ্ট পরিমাণ (৳)","Flat amount (৳)")}
                      value={discountValue} onChange={e => setDiscountValue(e.target.value)}
                      className="pa-input" min={0} max={discountType === "percent" ? 100 : undefined}/>
                    {salePrice !== null && (
                      <p className="text-xs px-1" style={{ color: "#34d399" }}>
                        {t("বিক্রয় মূল্য:","Sale price:")} <span style={{ fontWeight: 700 }}>৳{salePrice.toLocaleString()}</span>
                        <span style={{ color: "#475569", textDecoration: "line-through", marginLeft: "8px" }}>৳{Number(price).toLocaleString()}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* parent link */}
              <div>
                <label className="pa-label">
                  {t("লিংক","Link")} <span style={{ color: "#f87171" }}>*</span>
                  <span style={{ color: "#334155", fontWeight: 400, marginLeft: "6px", textTransform: "none" }}>({t("আবশ্যক","required")})</span>
                </label>
                <div className="relative w-full" ref={parentRef}>
                  <button type="button"
                    className={`pa-select-btn ${selectedParent ? "has-value" : "required-empty"}`}
                    onClick={() => setParentDropdown(!parentDropdown)}>
                    <span>{selectedParentName || t("লিংক বেছে নিন","Select Link")}</span>
                    <ChevronDown size={14}/>
                  </button>
                  <AnimatePresence>
                    {parentDropdown && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                        className="pa-dropdown absolute left-0 mt-2 w-full z-50 max-h-48 overflow-y-auto">
                        {parentLinks.map(p => (
                          <div key={p._id}
                            className={`pa-dd-item ${selectedParent === p._id ? "active" : ""}`}
                            onClick={() => { setSelectedParent(p._id); setLink(p._id); setSublink(""); setParentDropdown(false); }}>
                            {p.name}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* sublink */}
              {selectedParent && (
                <div>
                  <label className="pa-label">
                    {t("সাবলিংক","Sublink")}
                    <span style={{ color: "#334155", fontWeight: 400, marginLeft: "6px", textTransform: "none" }}>({t("ঐচ্ছিক","optional")})</span>
                  </label>
                  <div className="relative w-full" ref={sublinkRef}>
                    <button type="button"
                      className={`pa-select-btn ${sublink ? "has-value" : ""}`}
                      onClick={() => setSublinkDropdown(!sublinkDropdown)}>
                      <span>{selectedSublinkName || t("সাবলিংক বেছে নিন (ঐচ্ছিক)","Select Sublink (optional)")}</span>
                      <ChevronDown size={14}/>
                    </button>
                    <AnimatePresence>
                      {sublinkDropdown && (
                        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                          className="pa-dropdown absolute left-0 mt-2 w-full z-50 max-h-48 overflow-y-auto">
                          <div className="pa-dd-item none-item"
                            onClick={() => { setSublink(""); setSublinkDropdown(false); }}>
                            — {t("কোনোটি নয়","None")} —
                          </div>
                          {filteredSublinks.length > 0 ? filteredSublinks.map(s => (
                            <div key={s._id}
                              className={`pa-dd-item ${sublink === s._id ? "active" : ""}`}
                              onClick={() => { setSublink(s._id); setSublinkDropdown(false); }}>
                              {s.name}
                            </div>
                          )) : (
                            <div className="pa-dd-item" style={{ fontStyle: "italic" }}>
                              {t("কোনো সাবলিংক পাওয়া যায়নি।","No sublinks found.")}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {sublinkError && <p className="text-xs mt-1.5" style={{ color: "#f87171" }}>{sublinkError}</p>}
                </div>
              )}

              {/* status */}
              <div>
                <label className="pa-label">{t("স্ট্যাটাস","Status")}</label>
                <div className="relative w-full" ref={statusRef}>
                  <button type="button" className="pa-select-btn has-value"
                    onClick={() => setStatusDropdown(!statusDropdown)}>
                    <span>{statusOptions.find(o => o.value === isActive)?.label}</span>
                    <ChevronDown size={14}/>
                  </button>
                  <AnimatePresence>
                    {statusDropdown && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                        className="pa-dropdown absolute left-0 mt-2 w-full z-50">
                        {statusOptions.map(option => (
                          <div key={String(option.value)}
                            className={`pa-dd-item ${isActive === option.value ? "active" : ""}`}
                            onClick={() => { setIsActive(option.value); setStatusDropdown(false); }}>
                            {option.label}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* images */}
              <div>
                <label className="pa-label">
                  {t("ছবি","Images")} {!editId && <span style={{ color: "#f87171" }}>*</span>}
                  <span style={{ color: "#334155", fontWeight: 400, marginLeft: "6px", textTransform: "none" }}>
                    (max 5, each under {MAX_IMAGE_SIZE_MB}MB)
                  </span>
                </label>
                <label className={`pa-upload-zone ${!editId && images.length === 0 ? "required" : ""}`}>
                  <Upload size={18} style={{ color: !editId && images.length === 0 ? "#f87171" : "#475569", marginBottom: "4px" }}/>
                  <span className="text-xs" style={{ color: !editId && images.length === 0 ? "#f87171" : "#475569" }}>
                    {t("ছবি আপলোড করুন","Upload images")}
                  </span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange}/>
                </label>
                {!editId && images.length === 0 && (
                  <p className="text-xs mt-1.5" style={{ color: "#f87171" }}>{t("কমপক্ষে একটি ছবি আবশ্যক।","At least one image is required.")}</p>
                )}

                {existingImages.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs mb-2" style={{ color: "#475569" }}>{t("বর্তমান ছবিসমূহ:","Current Images:")}</p>
                    <div className="flex flex-wrap gap-2">
                      {existingImages.map((img, i) => (
                        <img key={i} src={img.url} alt="product"
                          className="w-14 h-14 object-cover rounded-xl"
                          style={{ border: "1px solid rgba(255,255,255,0.08)" }}/>
                      ))}
                    </div>
                  </div>
                )}

                {images.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs mb-2" style={{ color: "#475569" }}>{t("নতুন ছবিসমূহ","New Images")} ({images.length}/5):</p>
                    <div className="flex flex-wrap gap-2">
                      {images.map((img, i) => (
                        <div key={i} className="relative">
                          <img src={URL.createObjectURL(img)} alt="preview"
                            className="w-14 h-14 object-cover rounded-xl"
                            style={{ border: "1px solid rgba(255,255,255,0.08)" }}/>
                          <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] text-white rounded-b-xl py-0.5"
                            style={{ background: "rgba(0,0,0,0.6)" }}>
                            {(img.size / (1024 * 1024)).toFixed(1)}MB
                          </span>
                          <button type="button" onClick={() => removeNewImage(i)}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center rounded-full"
                            style={{ background: "#f87171" }}>
                            <X size={10} color="#fff"/>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* features */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="pa-label" style={{ marginBottom: 0 }}>{t("পণ্যের বৈশিষ্ট্য","Product Specifications")}</label>
                    <p className="text-[11px] mt-0.5" style={{ color: "#334155" }}>
                      {t("ফাঁকা রাখলে বাদ দেওয়া হবে","Leave blank to skip")}
                    </p>
                  </div>
                  <AnimatePresence>
                    {features.some(f => f.value.trim()) && (
                      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }}>
                          ✓ {features.filter(f => f.value.trim()).length} {t("পূরণ","filled")}
                        </span>
                        <button type="button" onClick={() => setFeatures(features.map(f => ({ ...f, value: "" })))}
                          className="text-xs flex items-center gap-1 transition"
                          style={{ color: "#f87171" }}>
                          <X size={11}/> {t("মুছুন","Clear")}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-2">
                  {FEATURE_ROWS.map((row, i) => {
                    const val      = features[i]?.value || "";
                    const isFilled = val.trim() !== "";
                    return (
                      <div key={i} className={`pa-feature-row ${isFilled ? "filled" : ""}`}>
                        <div className={`pa-feature-key ${isFilled ? "filled" : ""}`}>
                          <span style={{ fontSize: "18px" }}>{row.icon}</span>
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wide"
                              style={{ color: isFilled ? "#34d399" : "#334155" }}>
                              {row.keyPlaceholder}
                            </p>
                          </div>
                        </div>
                        <input type="text" placeholder={row.valuePlaceholder} value={val}
                          onChange={e => {
                            const updated = [...features];
                            updated[i] = { key: row.keyPlaceholder, value: e.target.value };
                            setFeatures(updated);
                          }}
                          className="pa-feature-val"/>
                        <div className="flex items-center pr-3">
                          <div className="w-2.5 h-2.5 rounded-full transition-all"
                            style={{ background: isFilled ? "#34d399" : "rgba(255,255,255,0.08)" }}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button type="submit" className="pa-btn-submit" disabled={submitting}>
                  {submitting
                    ? <><Loader2 size={14} className="animate-spin"/> {t("অপেক্ষা করুন…","Please wait…")}</>
                    : editId ? t("আপডেট করুন","Update") : t("তৈরি করুন","Create")
                  }
                </button>
                <button type="button" className="pa-btn-cancel"
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

export default ProductAdd;