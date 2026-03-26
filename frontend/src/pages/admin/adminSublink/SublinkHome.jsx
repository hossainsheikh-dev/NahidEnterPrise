import React, { useEffect, useState, useRef } from "react";
import SublinkShow from "./SublinkShow";
import SublinkAdd from "./SublinkAdd";
import ConfirmModal from "../../../utils/modal/confirmModal";
import { useAdminLang } from "../../../context/AdminLangContext";

import { showAddSuccessToast } from "../../../utils/toast/successAddToast";
import { showUpdateSuccessToast } from "../../../utils/toast/successUpdateToast";
import { showDeleteSuccessToast } from "../../../utils/toast/successDeleteToast";

const API         = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;
const SUBLINK_API = `${API}/api/sublinks`;
const LINK_API    = `${API}/api/links`;
const getToken    = () => localStorage.getItem("token") || "";

const SublinkHome = () => {
  const { t } = useAdminLang();

  const sortOptions = [
    { label: t("নামে সাজান","Sort by Name"),   value: "name"   },
    { label: t("তারিখে সাজান","Sort by Date"), value: "date"   },
    { label: t("নতুন আগে","Newest First"),      value: "newest" },
    { label: t("স্ট্যাটাসে","Sort by Status"), value: "status" },
  ];

  const statusOptions = [
    { label: t("সক্রিয়","Active"),      value: true  },
    { label: t("নিষ্ক্রিয়","Inactive"), value: false },
  ];

  const [sublinks,       setSublinks]       = useState([]);
  const [parents,        setParents]        = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [view,           setView]           = useState("home");
  const [sort,           setSort]           = useState("newest");
  const [search,         setSearch]         = useState("");
  const [dropdownOpen,   setDropdownOpen]   = useState(false);
  const [statusDropdown, setStatusDropdown] = useState(false);
  const [parentDropdown, setParentDropdown] = useState(false);

  const [nameError,   setNameError]   = useState("");
  const [parentError, setParentError] = useState("");
  const [editId,      setEditId]      = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId,   setDeleteId]   = useState(null);
  const [deleteName, setDeleteName] = useState("");

  const dropdownRef = useRef(null);
  const statusRef   = useRef(null);
  const parentRef   = useRef(null);

  const [name,     setName]     = useState("");
  const [isActive, setIsActive] = useState(true);
  const [parent,   setParent]   = useState("");

  const fetchParents = async () => {
    try {
      const res    = await fetch(LINK_API);
      const result = await res.json();
      setParents(result.success && Array.isArray(result.data) ? result.data : []);
    } catch { setParents([]); }
  };

  const fetchSublinks = async () => {
    try {
      setLoading(true);
      const res  = await fetch(SUBLINK_API);
      const data = await res.json();
      setSublinks(data.data || []);
    } catch { setSublinks([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchParents(); fetchSublinks(); }, []);

  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target)) setDropdownOpen(false);
      if (!statusRef.current?.contains(e.target))   setStatusDropdown(false);
      if (!parentRef.current?.contains(e.target))   setParentDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const processedSublinks = [...sublinks]
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "name")   return a.name.localeCompare(b.name);
      if (sort === "date")   return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "status") return b.isActive - a.isActive;
      return 0;
    });

  const resetForm = () => {
    setName(""); setIsActive(true); setParent("");
    setNameError(""); setParentError(""); setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNameError(""); setParentError("");
    if (!parent) { setParentError(t("প্যারেন্ট লিংক আবশ্যক","Parent link is required")); return; }
    const exist = sublinks.find(s => s.name.toLowerCase() === name.toLowerCase() && s._id !== editId);
    if (exist) { setNameError(t("সাবলিংকের নাম ইতিমধ্যে বিদ্যমান","Sublink name already exists")); return; }
    try {
      const res = await fetch(editId ? `${SUBLINK_API}/${editId}` : SUBLINK_API, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ name, isActive, parent }),
      });
      if (!res.ok) { alert(t("সাবলিংক তৈরিতে সমস্যা","Error creating sublink")); return; }
      editId ? showUpdateSuccessToast(name) : showAddSuccessToast(name);
      resetForm(); setView("home"); fetchSublinks();
    } catch (err) { console.log(err); }
  };

  const handleDelete = (sublink) => {
    setDeleteId(sublink._id); setDeleteName(sublink.name); setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`${SUBLINK_API}/${deleteId}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (res.ok) { showDeleteSuccessToast(deleteName); fetchSublinks(); }
    setDeleteOpen(false); setDeleteId(null); setDeleteName("");
  };

  const handleEdit = (sublink) => {
    setName(sublink.name); setIsActive(sublink.isActive);
    setParent(sublink.parent?._id || sublink.parent);
    setEditId(sublink._id); setView("add");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        .slh-wrap * { box-sizing: border-box; }
        .slh-wrap { font-family: 'DM Sans', sans-serif; }
        .slh-crumb { display:flex; align-items:center; gap:6px; font-size:11px; margin-bottom:20px; }
        .slh-crumb-link { color:#475569; cursor:pointer; transition:color 0.15s; }
        .slh-crumb-link:hover { color:#94a3b8; }
        .slh-crumb-sep { color:#1e293b; }
        .slh-crumb-cur { color:#c9a84c; font-weight:500; }
      `}</style>

      <div className="slh-wrap max-w-5xl mx-auto pb-10">

        <div className="slh-crumb">
          {view === "home" && (
            <span className="slh-crumb-cur">{t("সাবলিংক","sublinks")}</span>
          )}
          {view === "add" && (
            <>
              <span className="slh-crumb-link" onClick={() => { setView("home"); resetForm(); }}>
                {t("সাবলিংক","sublinks")}
              </span>
              <span className="slh-crumb-sep">/</span>
              <span className="slh-crumb-cur">
                {editId ? t("আপডেট","update-sublink") : t("যোগ করুন","add-sublink")}
              </span>
            </>
          )}
        </div>

        {view === "home" && (
          <SublinkShow
            sublinks={processedSublinks} loading={loading}
            search={search} setSearch={setSearch}
            sort={sort} setSort={setSort} sortOptions={sortOptions}
            dropdownOpen={dropdownOpen} setDropdownOpen={setDropdownOpen} dropdownRef={dropdownRef}
            setView={setView}
            handleDelete={handleDelete} handleEdit={handleEdit}
            parents={parents} onRefresh={fetchSublinks} t={t}
          />
        )}

        {view === "add" && (
          <SublinkAdd
            name={name} setName={setName}
            isActive={isActive} setIsActive={setIsActive}
            parent={parent} setParent={setParent} parents={parents}
            parentDropdown={parentDropdown} setParentDropdown={setParentDropdown} parentRef={parentRef}
            statusOptions={statusOptions}
            statusDropdown={statusDropdown} setStatusDropdown={setStatusDropdown} statusRef={statusRef}
            handleSubmit={handleSubmit}
            setView={setView} resetForm={resetForm}
            nameError={nameError} parentError={parentError} editId={editId} t={t}
          />
        )}

        <ConfirmModal
          isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={confirmDelete}
          title={t("সাবলিংক ডিলিট করবেন?","Delete Sublink?")}
          message={`${t("আপনি কি নিশ্চিতভাবে মুছতে চান","Are you sure you want to delete")} "${deleteName}"?`}
          confirmText={t("ডিলিট","Delete")} cancelText={t("বাতিল","Cancel")} danger
        />
      </div>
    </>
  );
};

export default SublinkHome;