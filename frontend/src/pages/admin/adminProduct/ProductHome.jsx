import React, { useEffect, useState, useRef } from "react";
import ProductShow from "./ProductShow";
import ProductAdd from "./ProductAdd";
import ConfirmModal from "../../../utils/modal/confirmModal";
import { useAdminLang } from "../../../context/AdminLangContext";
import { showAddSuccessToast } from "../../../utils/toast/successAddToast";
import { showUpdateSuccessToast } from "../../../utils/toast/successUpdateToast";
import { showDeleteSuccessToast } from "../../../utils/toast/successDeleteToast";

const API         = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;
const PRODUCT_API = `${API}/api/products`;
const SUBLINK_API = `${API}/api/sublinks`;
const LINK_API    = `${API}/api/links`;

const emptyFeatures = () => Array.from({ length: 10 }, () => ({ key: "", value: "" }));

const ProductHome = () => {
  const { t } = useAdminLang();

  const sortOptions = [
    { label: t("নামে সাজান","Sort by Name"),       value: "name"      },
    { label: t("তারিখে সাজান","Sort by Date"),      value: "date"      },
    { label: t("নতুন আগে","Newest First"),           value: "newest"    },
    { label: t("স্ট্যাটাসে","Sort by Status"),      value: "status"    },
    { label: t("ফিচার্ড আগে","Featured First"),     value: "featured"  },
    { label: t("স্টক: কম→বেশি","Stock: Low→High"), value: "stockAsc"  },
    { label: t("স্টক: বেশি→কম","Stock: High→Low"), value: "stockDesc" },
  ];

  const statusOptions = [
    { label: t("সক্রিয়","Active"),      value: true  },
    { label: t("নিষ্ক্রিয়","Inactive"), value: false },
  ];

  const [products,     setProducts    ] = useState([]);
  const [allSublinks,  setAllSublinks ] = useState([]);
  const [parentLinks,  setParentLinks ] = useState([]);
  const [view,         setView        ] = useState("home");
  const [sort,         setSort        ] = useState("newest");
  const [search,       setSearch      ] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editId,       setEditId      ] = useState(null);
  const [loading,      setLoading     ] = useState(false);

  const [nameError,    setNameError   ] = useState("");
  const [sublinkError, setSublinkError] = useState("");
  const [deleteOpen,   setDeleteOpen  ] = useState(false);
  const [deleteId,     setDeleteId    ] = useState(null);
  const [deleteName,   setDeleteName  ] = useState("");

  const dropdownRef = useRef(null);

  const [name,           setName          ] = useState("");
  const [description,    setDescription   ] = useState("");
  const [price,          setPrice         ] = useState("");
  const [stock,          setStock         ] = useState("");
  const [link,           setLink          ] = useState("");
  const [sublink,        setSublink       ] = useState("");
  const [selectedParent, setSelectedParent] = useState("");
  const [isActive,       setIsActive      ] = useState(true);
  const [discountType,   setDiscountType  ] = useState("none");
  const [discountValue,  setDiscountValue ] = useState(0);
  const [isFeatured,     setIsFeatured    ] = useState(false);
  const [features,       setFeatures      ] = useState(emptyFeatures());
  const [images,         setImages        ] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const fetchParentLinks = async () => {
    try { const res = await fetch(LINK_API); const d = await res.json(); setParentLinks(d.data || []); }
    catch (err) { console.log(err); }
  };
  const fetchSublinks = async () => {
    try { const res = await fetch(SUBLINK_API); const d = await res.json(); setAllSublinks(d.data || []); }
    catch (err) { console.log(err); }
  };
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res   = await fetch(PRODUCT_API, { headers: { Authorization: `Bearer ${token}` } });
      const d     = await res.json();
      setProducts(d.data || []);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchParentLinks(); fetchSublinks(); fetchProducts(); }, []);

  useEffect(() => {
    const handler = (e) => { if (!dropdownRef.current?.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const processedProducts = [...products]
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "name")      return a.name.localeCompare(b.name);
      if (sort === "date")      return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === "newest")    return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "status")    return b.isActive - a.isActive;
      if (sort === "featured")  return b.isFeatured - a.isFeatured;
      if (sort === "stockAsc")  return (a.stock ?? 0) - (b.stock ?? 0);
      if (sort === "stockDesc") return (b.stock ?? 0) - (a.stock ?? 0);
      return 0;
    });

  const resetForm = () => {
    setName(""); setDescription(""); setPrice(""); setStock("");
    setLink(""); setSublink(""); setSelectedParent(""); setIsActive(true);
    setDiscountType("none"); setDiscountValue(0); setIsFeatured(false);
    setFeatures(emptyFeatures()); setImages([]); setExistingImages([]);
    setEditId(null); setNameError(""); setSublinkError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNameError(""); setSublinkError("");
    if (!name.trim()) { setNameError(t("পণ্যের নাম আবশ্যক","Product name is required")); return; }
    if (!link)        { alert(t("অনুগ্রহ করে একটি লিংক বেছে নিন (আবশ্যক)","Please select a Link (required)")); return; }
    try {
      const token    = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("name", name); formData.append("description", description);
      formData.append("price", price); formData.append("stock", stock);
      formData.append("link", link); formData.append("sublink", sublink || "");
      formData.append("isActive", isActive ? "true" : "false");
      formData.append("discountType", discountType); formData.append("discountValue", discountValue);
      formData.append("isFeatured", isFeatured ? "true" : "false");
      const validFeatures = features.filter(f => f.key.trim() && f.value.trim());
      formData.append("features", JSON.stringify(validFeatures));
      images.forEach(img => formData.append("images", img));
      const res = await fetch(editId ? `${PRODUCT_API}/${editId}` : PRODUCT_API, {
        method: editId ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) { const err = await res.json(); alert(err.message || t("পণ্য সংরক্ষণে সমস্যা","Error saving product")); return; }
      editId ? showUpdateSuccessToast(name) : showAddSuccessToast(name);
      resetForm(); setView("home"); fetchProducts();
    } catch (err) { console.log(err); }
  };

  const handleDelete = (product) => { setDeleteId(product._id); setDeleteName(product.name); setDeleteOpen(true); };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`${PRODUCT_API}/${deleteId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) { showDeleteSuccessToast(deleteName); fetchProducts(); }
    setDeleteOpen(false);
  };

  const handleEdit = (product) => {
    const sublinkObj = allSublinks.find(s => s._id === (product.sublink?._id || product.sublink));
    const parentId   = product.link?._id || product.link || sublinkObj?.parent?._id || sublinkObj?.parent || "";
    setName(product.name); setDescription(product.description);
    setPrice(product.price); setStock(product.stock);
    setSelectedParent(parentId); setLink(parentId);
    setSublink(product.sublink?._id || product.sublink || "");
    setIsActive(product.isActive);
    setDiscountType(product.discountType || "none"); setDiscountValue(product.discountValue || 0);
    setIsFeatured(product.isFeatured || false);
    const existing = (product.features || []).map(f => ({ key: f.key || "", value: f.value || "" }));
    const padded   = [...existing, ...Array.from({ length: Math.max(0, 10 - existing.length) }, () => ({ key: "", value: "" }))];
    setFeatures(padded);
    setExistingImages(product.images || []); setImages([]);
    setEditId(product._id); setView("add");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        .ph-wrap * { box-sizing: border-box; }
        .ph-wrap { font-family: 'DM Sans', sans-serif; }
        .ph-crumb { display:flex; align-items:center; gap:6px; font-size:11px; margin-bottom:20px; }
        .ph-crumb-link { color:#475569; cursor:pointer; transition:color 0.15s; }
        .ph-crumb-link:hover { color:#94a3b8; }
        .ph-crumb-sep { color:#1e293b; }
        .ph-crumb-cur { color:#c9a84c; font-weight:500; }
      `}</style>

      <div className="ph-wrap max-w-5xl mx-auto pb-10">
        <div className="ph-crumb">
          {view === "home" && <span className="ph-crumb-cur">{t("পণ্য","products")}</span>}
          {view === "add" && (
            <>
              <span className="ph-crumb-link" onClick={() => { setView("home"); resetForm(); }}>{t("পণ্য","products")}</span>
              <span className="ph-crumb-sep">/</span>
              <span className="ph-crumb-cur">{editId ? t("আপডেট","update-product") : t("যোগ করুন","add-product")}</span>
            </>
          )}
        </div>

        {view === "home" && (
          <ProductShow
            products={processedProducts} loading={loading}
            search={search} setSearch={setSearch}
            sort={sort} setSort={setSort} sortOptions={sortOptions}
            dropdownOpen={dropdownOpen} setDropdownOpen={setDropdownOpen} dropdownRef={dropdownRef}
            setView={setView}
            handleDelete={handleDelete} handleEdit={handleEdit}
            parentLinks={parentLinks} allSublinks={allSublinks}
            onRefresh={fetchProducts} t={t}
          />
        )}

        {view === "add" && (
          <ProductAdd
            name={name} setName={setName} description={description} setDescription={setDescription}
            price={price} setPrice={setPrice} stock={stock} setStock={setStock}
            link={link} setLink={setLink} sublink={sublink} setSublink={setSublink}
            selectedParent={selectedParent} setSelectedParent={setSelectedParent}
            parentLinks={parentLinks} allSublinks={allSublinks}
            isActive={isActive} setIsActive={setIsActive} statusOptions={statusOptions}
            discountType={discountType} setDiscountType={setDiscountType}
            discountValue={discountValue} setDiscountValue={setDiscountValue}
            isFeatured={isFeatured} setIsFeatured={setIsFeatured}
            features={features} setFeatures={setFeatures}
            images={images} setImages={setImages} existingImages={existingImages}
            handleSubmit={handleSubmit} setView={setView} resetForm={resetForm}
            nameError={nameError} sublinkError={sublinkError} editId={editId} t={t}
          />
        )}

        <ConfirmModal
          isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={confirmDelete}
          title={t("পণ্য ডিলিট করবেন?","Delete Product?")}
          message={`${t("আপনি কি নিশ্চিতভাবে মুছতে চান","Are you sure you want to delete")} "${deleteName}"?`}
          confirmText={t("ডিলিট","Delete")} cancelText={t("বাতিল","Cancel")} danger
        />
      </div>
    </>
  );
};

export default ProductHome;