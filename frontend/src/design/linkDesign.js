export const linkHomeDesign = {
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

  pathWrapper:
    "flex items-center gap-2 text-sm bg-white px-3 py-1.5 rounded-full w-fit shadow-sm border border-slate-200",

  path:
    "text-blue-600 cursor-pointer hover:text-blue-700 transition font-medium",

  pathActive:
    "text-slate-700 font-semibold",

  pathDivider:
    "text-slate-400",

  navbar:
    "flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-md",

  searchWrapper:
    "flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-xl w-full lg:w-72 focus-within:ring-2 focus-within:ring-slate-400 transition",

  searchInput:
    "bg-transparent outline-none text-sm w-full text-slate-700 placeholder:text-slate-400",

  rightControls:
    "flex items-center gap-4",

  /* ================= DROPDOWN ================= */

  dropdownWrapper:
    "relative w-full col-span-1 sm:col-span-1 lg:col-span-5",

  dropdownButton:
    "flex items-center justify-between gap-2 bg-white border border-slate-300 px-4 py-2 rounded-xl text-sm shadow-sm hover:shadow-md transition w-full",

  dropdownMenu:
    "absolute left-0 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50",

  dropdownItem:
    "px-4 py-2 text-sm hover:bg-slate-100 cursor-pointer transition",

  dropdownActive:
    "bg-slate-100 font-semibold text-slate-800",

  addButton:
    "inline-flex items-center gap-2 bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900 text-white px-5 py-2 rounded-xl text-sm font-medium shadow-md hover:shadow-xl transition-all",

  table:
    "bg-white rounded-2xl border border-slate-200 shadow-md divide-y divide-slate-100 overflow-hidden",

  row:
    "grid grid-cols-4 items-center px-6 py-4 text-sm hover:bg-slate-50 transition",

  emptyState:
    "bg-white rounded-2xl border border-slate-200 shadow-md p-10 text-center text-slate-500",

  /* ================= FORM RESPONSIVE ================= */

  form:
    "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-20 gap-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-lg",

  /* Phone: full
     Tablet: 50%
     Large: 35% */
  input:
    "border border-slate-200 rounded-xl px-4 h-10 text-sm outline-none focus:ring-2 focus:ring-slate-400 transition w-full col-span-1 sm:col-span-1 lg:col-span-7",

  /* Phone: full
     Tablet: 50%
     Large: 25% */
  select:
    "border border-slate-200 rounded-xl px-4 h-10 text-sm focus:ring-2 focus:ring-slate-600 outline-none transition appearance-none bg-white w-full col-span-1 sm:col-span-1 lg:col-span-5",

  /* Phone: new row
     Tablet: new row (full width)
     Large: 40% */
  buttonGroup:
    "flex gap-4 w-full col-span-1 sm:col-span-2 lg:col-span-8",

  /* Always 50% inside group */
  submitButton:
    "w-1/2 bg-gradient-to-r from-slate-600 to-slate-800 text-white px-5 py-2 rounded-xl text-sm font-medium shadow-md hover:shadow-xl transition-all",

  cancelButton:
    "w-1/2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-5 py-2 rounded-xl text-sm transition",
};