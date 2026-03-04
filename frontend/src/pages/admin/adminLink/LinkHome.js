import React, { useEffect, useState, useRef } from "react";
import { linkHomeDesign as design } from "../../../design/linkDesign";
import LinkShow from "./LinkShow";
import LinkAdd from "./LinkAdd";
import ConfirmModal from "../../../utils/modal/confirmModal";

import { showAddSuccessToast } from "../../../utils/toast/successAddToast";
import { showUpdateSuccessToast } from "../../../utils/toast/successUpdateToast";
import { showDeleteSuccessToast } from "../../../utils/toast/successDeleteToast";

const API = "http://localhost:5000/api/links";

const sortOptions = [
  { label: "Sort by Position", value: "order" },
  { label: "Sort by Name", value: "name" },
  { label: "Sort by Status", value: "status" },
];

const statusOptions = [
  { label: "Active", value: true },
  { label: "Inactive", value: false },
];

const LinkHome = () => {
  const [links, setLinks] = useState([]);
  const [view, setView] = useState("home");
  const [sort, setSort] = useState("order");
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [statusDropdown, setStatusDropdown] = useState(false);
  const [nameError, setNameError] = useState("");
  const [editId, setEditId] = useState(null);

  // 🔥 Delete modal state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");

  const dropdownRef = useRef(null);
  const statusRef = useRef(null);

  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);



  const fetchLinks = async () => {
  try {
    const res = await fetch(API);
    const result = await res.json();

    // 🔥 correct access
    if (result.success && Array.isArray(result.data)) {
      setLinks(result.data);
    } else {
      console.error("Invalid response:", result);
      setLinks([]);
    }

  } catch (error) {
    console.error("Fetch error:", error);
    setLinks([]);
  }
};
  

  useEffect(() => {
    fetchLinks();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target))
        setDropdownOpen(false);

      if (!statusRef.current?.contains(e.target))
        setStatusDropdown(false);
    };

    document.addEventListener("mousedown", handler);
    return () =>
      document.removeEventListener("mousedown", handler);
  }, []);

  const processedLinks = [...links]
    .filter((l) =>
      l.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "status") return b.isActive - a.isActive;
      return 0;
    });

  // ================= SUBMIT =================
  // ================= SUBMIT =================
const handleSubmit = async (e) => {
  e.preventDefault();
  setNameError("");

  const exist = links.find(
    (l) =>
      l.name.toLowerCase() === name.toLowerCase() &&
      l._id !== editId
  );

  if (exist) {
    setNameError("Link name already exists");
    return;
  }

  try {
    let res;

    // ✅ UPDATE
    if (editId) {
      res = await fetch(`${API}/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, isActive }),
      });
    }

    // ✅ ADD
    else {
      res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, isActive, parent: null }),
      });
    }

    if (!res.ok) {
      console.log("Request failed");
      return;
    }

    // 🔥 Toast AFTER success
    if (editId) {
      showUpdateSuccessToast(name);
    } else {
      showAddSuccessToast(name);
    }

    // 🔄 Reset state AFTER toast
    setName("");
    setIsActive(true);
    setEditId(null);
    setView("home");
    fetchLinks();

  } catch (error) {
    console.log("Error:", error);
  }
};

      

  // ================= DELETE (OPEN MODAL) =================
  const handleDelete = (link) => {
    setDeleteId(link._id);
    setDeleteName(link.name);
    setDeleteOpen(true);
  };

  // ================= CONFIRM DELETE =================
  const confirmDelete = async () => {
    if (!deleteId) return;

    const res = await fetch(`${API}/${deleteId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      showDeleteSuccessToast(deleteName);
      fetchLinks();
    }

    setDeleteOpen(false);
    setDeleteId(null);
    setDeleteName("");
  };

  const handleEdit = (link) => {
    setName(link.name);
    setIsActive(link.isActive);
    setEditId(link._id);
    setView("add");
  };

  return (
    <div className={`${design.pageWrapper} px-4 sm:px-6 md:px-8`}>
      <div className={`${design.container} w-full`}>

        {/* ================= HEADER ================= */}
        <div className="space-y-4 sm:space-y-5">

          {/* Title Center */}
          <div className="text-center">
            <h1 className={`${design.title} text-xl sm:text-2xl md:text-3xl`}>
              Parent Navigation Links
            </h1>

            <p className={`${design.subtitle} text-xs sm:text-sm md:text-base`}>
              Manage only main menu navigation.
            </p>
          </div>

          {/* Path Left */}
          <div className="flex justify-start">
            <div className={`${design.pathWrapper} text-xs sm:text-sm flex flex-wrap items-center gap-1`}>
              {view === "home" && (
                <span className={design.pathActive}>
                  linkhome
                </span>
              )}

              {view === "add" && (
                <>
                  <span
                    onClick={() => setView("home")}
                    className={design.path}
                  >
                    linkhome
                  </span>

                  <span className={design.pathDivider}>
                    /
                  </span>

                  <span className={design.pathActive}>
                    {editId ? "update-link" : "add-link"}
                  </span>
                </>
              )}
            </div>
          </div>

        </div>
        {/* ================= END HEADER ================= */}

        {view === "home" && (
          <LinkShow
            links={processedLinks}
            search={search}
            setSearch={setSearch}
            sort={sort}
            setSort={setSort}
            sortOptions={sortOptions}
            dropdownOpen={dropdownOpen}
            setDropdownOpen={setDropdownOpen}
            dropdownRef={dropdownRef}
            setView={setView}
            handleDelete={handleDelete}
            handleEdit={handleEdit}
          />
        )}

        {view === "add" && (
          <LinkAdd
            name={name}
            setName={setName}
            isActive={isActive}
            setIsActive={setIsActive}
            statusOptions={statusOptions}
            statusDropdown={statusDropdown}
            setStatusDropdown={setStatusDropdown}
            statusRef={statusRef}
            handleSubmit={handleSubmit}
            setView={setView}
            nameError={nameError}
            editId={editId}
          />
        )}

        {/* ================= DELETE MODAL ================= */}
        <ConfirmModal
          isOpen={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Link?"
          message={`Are you sure you want to delete "${deleteName}"?`}
          confirmText="Delete"
          cancelText="Cancel"
          danger
        />

      </div>
    </div>
  );
};

export default LinkHome;