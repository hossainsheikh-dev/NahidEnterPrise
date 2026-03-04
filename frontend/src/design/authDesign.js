// authDesign.js

export const authDesign = {
  colors: {
    background: "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800",
    card: "bg-white/10 backdrop-blur-xl",
    title: "text-white",
    subtitle: "text-gray-400",
    inputBg: "bg-white/5",
    inputBorder: "border-white/20",
    inputText: "text-white",
    button: "bg-indigo-600",
    buttonHover: "hover:bg-indigo-700",
  },

  layout: {
    container: "min-h-screen flex items-center justify-center px-4",
    card: "w-full max-w-md rounded-2xl p-8 shadow-2xl border border-white/10",
    input: "w-full p-3 rounded-lg border outline-none transition duration-300",
    button: "w-full py-3 rounded-lg font-semibold transition duration-300",
  },

  animation: {
    container: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.6 },
    },
    card: {
      initial: { y: 40, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      transition: { duration: 0.6, delay: 0.2 },
    },
  },
};