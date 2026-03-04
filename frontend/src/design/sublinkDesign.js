export const sublinkDesign = {
  /* ================= PAGE LAYOUT ================= */

  pageWrapper:
    "min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 sm:px-6 lg:px-10 py-8",

  container:
    "max-w-6xl mx-auto space-y-8",

  header:
    "space-y-2",

  title:
    "text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-slate-900",

  subtitle:
    "text-sm text-slate-500",

  /* ================= BREADCRUMB ================= */

  pathWrapper:
    "flex items-center gap-2 text-sm bg-white px-3 py-1.5 rounded-full w-fit shadow-sm border border-slate-200",

  path:
    "text-blue-600 cursor-pointer hover:text-blue-700 transition font-medium",

  pathActive:
    "text-slate-700 font-semibold",

  pathDivider:
    "text-slate-400",

  /* ================= NAVBAR ================= */

  navbar:
    "flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-md",

  searchWrapper:
    "flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-xl w-full lg:w-72 focus-within:ring-2 focus-within:ring-slate-400 transition",

  searchInput:
    "bg-transparent outline-none text-sm w-full text-slate-700 placeholder:text-slate-400",

  rightControls:
    "flex items-center gap-4",

  addButton:
    "inline-flex items-center gap-2 bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900 text-white px-5 py-2 rounded-xl text-sm font-medium shadow-md hover:shadow-xl transition-all",

  /* ================= TABLE ================= */

  table:
    "bg-white rounded-2xl border border-slate-200 shadow-md divide-y divide-slate-100 overflow-hidden",

  tableHeader:
    "grid grid-cols-5 px-6 py-4 text-xs font-semibold text-slate-500 uppercase bg-slate-50",

  row:
    "grid grid-cols-5 items-center px-6 py-4 text-sm hover:bg-slate-50 transition",

  column:
    "truncate",

  actionButtons:
    "flex items-center gap-3",

  editButton:
    "text-blue-600 hover:text-blue-800 text-sm font-medium transition",

  deleteButton:
    "text-red-600 hover:text-red-800 text-sm font-medium transition",

  emptyState:
    "bg-white rounded-2xl border border-slate-200 shadow-md p-10 text-center text-slate-500",

  /* ================= FORM ================= */

  form:
    "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-lg",

  input:
    "border border-slate-200 rounded-xl px-4 h-10 text-sm outline-none focus:ring-2 focus:ring-slate-400 transition w-full col-span-1 sm:col-span-1 lg:col-span-6",

  select:
    "border border-slate-200 rounded-xl px-4 h-10 text-sm focus:ring-2 focus:ring-slate-600 outline-none transition appearance-none bg-white w-full col-span-1 sm:col-span-1 lg:col-span-6",

  textarea:
    "border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-400 transition w-full col-span-1 sm:col-span-2 lg:col-span-12 resize-none",

  buttonGroup:
    "flex gap-4 w-full col-span-1 sm:col-span-2 lg:col-span-12",

  submitButton:
    "w-1/2 bg-gradient-to-r from-slate-600 to-slate-800 text-white px-5 py-2 rounded-xl text-sm font-medium shadow-md hover:shadow-xl transition-all",

  cancelButton:
    "w-1/2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-5 py-2 rounded-xl text-sm transition",
};