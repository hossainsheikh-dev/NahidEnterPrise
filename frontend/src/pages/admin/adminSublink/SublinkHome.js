import React, { useEffect, useState, useRef } from "react";
import { linkHomeDesign as design } from "../../../design/linkDesign";
import SublinkShow from "./SublinkShow";
import SublinkAdd from "./SublinkAdd";
import ConfirmModal from "../../../utils/modal/confirmModal";

import { showAddSuccessToast } from "../../../utils/toast/successAddToast";
import { showUpdateSuccessToast } from "../../../utils/toast/successUpdateToast";
import { showDeleteSuccessToast } from "../../../utils/toast/successDeleteToast";


const API = process.env.REACT_APP_API_URL;

const SUBLINK_API = `${API}/api/sublinks`;
const LINK_API = `${API}/api/links`;



const sortOptions = [
  { label: "Sort by Name", value: "name" },
  { label: "Sort by Status", value: "status" },
];

const statusOptions = [
  { label: "Active", value: true },
  { label: "Inactive", value: false },
];

const SublinkHome = () => {
  const [sublinks, setSublinks] = useState([]);
  const [parents, setParents] = useState([]);
  const [view, setView] = useState("home");
  const [sort, setSort] = useState("name");
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [statusDropdown, setStatusDropdown] = useState(false);
  const [parentDropdown, setParentDropdown] = useState(false);

  const [nameError, setNameError] = useState("");
  const [parentError, setParentError] = useState("");
  const [editId, setEditId] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");

  const dropdownRef = useRef(null);
  const statusRef = useRef(null);
  const parentRef = useRef(null);

  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [parent, setParent] = useState("");

  // ================= FETCH PARENTS =================
  const fetchParents = async () => {
    try {
      const res = await fetch(LINK_API);
      const result = await res.json();

      if (result.success && Array.isArray(result.data)) {
        setParents(result.data);
      } else {
        setParents([]);
      }
    } catch (error) {
      console.log(error);
      setParents([]);
    }
  };

  // ================= FETCH SUBLINKS =================
  const fetchSublinks = async () => {
    try {
      const res = await fetch(SUBLINK_API);
      const data = await res.json();
      setSublinks(data.data || []);
    } catch (error) {
      console.log(error);
      setSublinks([]);
    }
  };

  useEffect(() => {
    fetchParents();
    fetchSublinks();
  }, []);

  // ================= CLOSE DROPDOWNS =================
  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target))
        setDropdownOpen(false);

      if (!statusRef.current?.contains(e.target))
        setStatusDropdown(false);

      if (!parentRef.current?.contains(e.target))
        setParentDropdown(false);
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ================= PROCESS DATA =================
  const processedSublinks = [...sublinks]
    .filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "status") return b.isActive - a.isActive;
      return 0;
    });

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setNameError("");
    setParentError("");

    if (!parent) {
      setParentError("Parent link is required");
      return;
    }

    const exist = sublinks.find(
      (s) =>
        s.name.toLowerCase() === name.toLowerCase() &&
        s._id !== editId
    );

    if (exist) {
      setNameError("Sublink name already exists");
      return;
    }

    try {
      let res;

      if (editId) {
        res = await fetch(`${SUBLINK_API}/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, isActive, parent }),
        });
      } else {
        res = await fetch(SUBLINK_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, isActive, parent }),
        });
      }

      if (!res.ok) {
        alert("Error creating sublink");
        return;
      }

      editId
        ? showUpdateSuccessToast(name)
        : showAddSuccessToast(name);

      setName("");
      setIsActive(true);
      setParent("");
      setEditId(null);
      setView("home");
      fetchSublinks();

    } catch (error) {
      console.log(error);
    }
  };

  // ================= DELETE =================
  const handleDelete = (sublink) => {
    setDeleteId(sublink._id);
    setDeleteName(sublink.name);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    const res = await fetch(`${SUBLINK_API}/${deleteId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      showDeleteSuccessToast(deleteName);
      fetchSublinks();
    }

    setDeleteOpen(false);
  };

  const handleEdit = (sublink) => {
    setName(sublink.name);
    setIsActive(sublink.isActive);
    setParent(sublink.parent?._id || sublink.parent);
    setEditId(sublink._id);
    setView("add");
  };

  return (
    <div className={`${design.pageWrapper} px-4 sm:px-6 md:px-8`}>
      <div className={`${design.container} w-full`}>

        {/* ================= HEADER ================= */}
        <div className="space-y-4 sm:space-y-5">

          {/* Title */}
          <div className="text-center">
            <h1 className={`${design.title} text-xl sm:text-2xl md:text-3xl`}>
              Sublinks
            </h1>

            <p className={`${design.subtitle} text-xs sm:text-sm md:text-base`}>
              Manage sub navigation links.
            </p>
          </div>

          {/* Breadcrumb Path */}
          <div className="flex justify-start">
            <div className={`${design.pathWrapper} text-xs sm:text-sm flex flex-wrap items-center gap-1`}>

              {view === "home" && (
                <span className={design.pathActive}>
                  sublinkhome
                </span>
              )}

              {view === "add" && (
                <>
                  <span
                    onClick={() => setView("home")}
                    className={design.path}
                  >
                    sublinkhome
                  </span>

                  <span className={design.pathDivider}>
                    /
                  </span>

                  <span className={design.pathActive}>
                    {editId ? "update-sublink" : "add-sublink"}
                  </span>
                </>
              )}

            </div>
          </div>

        </div>
        {/* ================= END HEADER ================= */}

        {view === "home" && (
          <SublinkShow
            sublinks={processedSublinks}
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
          <SublinkAdd
            name={name}
            setName={setName}
            isActive={isActive}
            setIsActive={setIsActive}
            parent={parent}
            setParent={setParent}
            parents={parents}
            parentDropdown={parentDropdown}
            setParentDropdown={setParentDropdown}
            parentRef={parentRef}
            statusOptions={statusOptions}
            statusDropdown={statusDropdown}
            setStatusDropdown={setStatusDropdown}
            statusRef={statusRef}
            handleSubmit={handleSubmit}
            setView={setView}
            nameError={nameError}
            editId={editId}
            parentError={parentError}
          />
        )}

        <ConfirmModal
          isOpen={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Sublink?"
          message={`Are you sure you want to delete "${deleteName}"?`}
          confirmText="Delete"
          cancelText="Cancel"
          danger
        />

      </div>
    </div>
  );
};

export default SublinkHome;