export const adminDashboardDesign = {
  colors: {
    overlay:
      "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden",
  },

  layout: {
    wrapper: "flex flex-col h-screen bg-slate-50",

    navbar:
      "h-16 flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200 shadow-sm z-30",

    body: "flex flex-1 overflow-hidden",

    sidebar:
      "fixed inset-y-0 left-0 z-50 h-screen w-[85vw] max-w-[360px] " +
      "bg-slate-900 text-slate-100 flex flex-col " +
      "transform transition-transform duration-300 ease-in-out -translate-x-full " +
      "shadow-2xl shadow-black/40 overflow-y-auto " +
      "lg:static lg:h-auto lg:w-64 xl:w-72 lg:translate-x-0 lg:shadow-none lg:border-r lg:border-slate-800",

    content:
      "flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10",
  },

  navbar: {
    menuButton:
      "lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-md transition",

    title:
      "hidden lg:block text-xl font-semibold text-slate-800",

    search:
      "flex-1 max-w-md px-4 py-2 rounded-lg border border-slate-300 bg-slate-50 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition",

    avatarButton:
      "flex items-center gap-3 p-1.5 rounded-lg hover:bg-slate-100 transition",
  },

  dropdown: {
    wrapper:
      "absolute right-0 top-14 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50",

    header:
      "px-4 py-3 border-b border-slate-100 flex flex-col gap-1",

    item:
      "flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition",

    danger:
      "flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition",
  },

  sidebar: {
    brandSection:
      "flex items-center justify-between px-6 py-6 border-b border-slate-800",

    logo:
      "text-2xl font-bold tracking-tight text-white",

    subtitle:
      "text-xs text-indigo-300 mt-1 tracking-wide uppercase",

    closeBtn:
      "lg:hidden text-slate-400 hover:text-white p-2 rounded-md hover:bg-slate-800 transition",

    nav:
      "flex flex-col gap-2 mt-8 px-4",

    navItem:
      "flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 cursor-pointer " +
      "hover:bg-slate-800/70",

    navItemActive:
      "bg-slate-800/80 shadow-inner shadow-black/40",
  },

  typography: {
    h1:
      "text-2xl sm:text-3xl font-bold text-slate-900",

    subtitle:
      "text-slate-600 mt-2",
  },
};