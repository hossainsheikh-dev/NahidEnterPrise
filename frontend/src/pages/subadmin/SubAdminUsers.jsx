import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, Mail, Phone, ShoppingBag, Heart,
  ChevronDown, ChevronUp, X, ShieldOff,
  Calendar, Package, TrendingUp, RefreshCw,
  MapPin, CreditCard, CheckCircle, XCircle,
  UserCheck, UserX, ShoppingCart, Star,
} from "lucide-react";
import { useSubLang } from "../../context/SubAdminLangContext";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

// light design tokens 
const L = {
  bg:       "#f8f9ff",
  card:     "#ffffff",
  cardHov:  "#f5f7ff",
  border:   "rgba(99,102,241,0.1)",
  borderMd: "rgba(99,102,241,0.18)",
  text1:    "#0f172a",
  text2:    "#374151",
  text3:    "#9ca3af",
  accent:   "#6366f1",
  accentBg: "rgba(99,102,241,0.07)",
  accentBd: "rgba(99,102,241,0.18)",
};



//state acrd
function StatCard({ icon, label, value, color, loading }) {
  return (
    <div className="rounded-2xl p-5 flex items-center gap-4"
      style={{ background: L.card, border: `1px solid ${L.border}`, boxShadow: "0 1px 8px rgba(99,102,241,0.06)" }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: L.text3 }}>{label}</p>
        {loading
          ? <div className="h-6 w-16 rounded-lg animate-pulse mt-1" style={{ background: "rgba(99,102,241,0.07)" }} />
          : <p className="text-[22px] font-black" style={{ color: L.text1 }}>{value}</p>
        }
      </div>
    </div>
  );
}



//order rorw
function OrderRow({ order }) {
  const STATUS_COLOR = {
    pending:    "#f59e0b",
    confirmed:  "#3b82f6",
    processing: "#8b5cf6",
    shipped:    "#06b6d4",
    delivered:  "#22c55e",
    cancelled:  "#ef4444",
  };
  const PAY_STATUS_COLOR = {
    pending:               "#f59e0b",
    awaiting_confirmation: "#8b5cf6",
    paid:                  "#22c55e",
    failed:                "#ef4444",
  };
  const color    = STATUS_COLOR[order.status]            || "#64748b";
  const payColor = PAY_STATUS_COLOR[order.paymentStatus] || "#64748b";

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ background: "#f8f9ff", border: "1px solid rgba(99,102,241,0.08)" }}>
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-black text-[11px]" style={{ color: L.accent }}>{order.orderId}</span>
          <span className="text-[11px]" style={{ color: L.text3 }}>
            {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
          </span>
          <span className="text-[11px] hidden sm:block capitalize px-2 py-0.5 rounded-lg"
            style={{ background: `${color}12`, color, border: `1px solid ${color}25` }}>
            {order.status}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[11px] capitalize px-2 py-0.5 rounded-lg"
            style={{ background: `${payColor}12`, color: payColor, border: `1px solid ${payColor}25` }}>
            {order.paymentMethod?.toUpperCase()}
          </span>
          <span className="font-black text-[13px]" style={{ color: L.text1 }}>
            ৳{order.total?.toLocaleString()}
          </span>
        </div>
      </div>
      {/* Items preview */}
      {order.items?.length > 0 && (
        <div className="px-3 pb-2.5 flex gap-2 overflow-x-auto">
          {order.items.slice(0, 4).map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 flex-shrink-0 rounded-lg px-2 py-1"
              style={{ background: "#fff", border: "1px solid rgba(99,102,241,0.08)" }}>
              {item.image
                ? <img src={item.image} alt={item.name} className="w-5 h-5 rounded object-contain bg-gray-50"/>
                : <Package size={12} style={{ color: L.text3 }}/>
              }
              <span className="text-[10px] max-w-[80px] truncate" style={{ color: L.text3 }}>
                {item.name}
              </span>
              <span className="text-[10px] font-bold" style={{ color: L.accent }}>×{item.quantity}</span>
            </div>
          ))}
          {order.items.length > 4 && (
            <span className="text-[10px] self-center flex-shrink-0" style={{ color: L.text3 }}>
              +{order.items.length - 4} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}


//user card
function UserCard({ user, index }) {
  const { t } = useSubLang();
  const [expanded,    setExpanded   ] = useState(false);
  const [orders,      setOrders     ] = useState([]);
  const [loadingOrds, setLoadingOrds] = useState(false);
  const [fetched,     setFetched    ] = useState(false);
  const isBlocked = user.isBlocked;

  const token = localStorage.getItem("adminToken") || localStorage.getItem("token");

  const loadOrders = async () => {
    if (fetched) return;
    setLoadingOrds(true);
    try {
      const identifier = user.email || user.phone;
      const field      = user.email ? "email" : "phone";
      const res  = await fetch(`${API}/api/auth/users/${encodeURIComponent(identifier)}/orders?field=${field}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) { setOrders(data.orders); setFetched(true); }
    } catch {}
    finally { setLoadingOrds(false); }
  };

  const handleExpand = () => {
    if (!expanded) loadOrders();
    setExpanded(p => !p);
  };



  const totalSpent   = orders.reduce((s, o) => s + (o.total || 0), 0);
  const deliveredCnt = orders.filter(o => o.status === "delivered").length;
  const cancelledCnt = orders.filter(o => o.status === "cancelled").length;
  const initials     = user.name?.trim().split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2) || "??";

  const providerColor = { local: "#6366f1", google: "#ef4444", facebook: "#3b82f6", guest: "#94a3b8" };
  const providerLabel = { local: "Local", google: "Google", facebook: "Facebook", guest: "Guest" };
  const joined        = user.createdAt ? new Date(user.createdAt).toLocaleDateString("bn-BD") : "—";

  //avatar gradient per provider 
  const avatarGrad = user.isGuest
    ? "linear-gradient(135deg,#e2e8f0,#cbd5e1)"
    : "linear-gradient(135deg,#eef2ff,#e0e7ff)";
  const avatarColor = user.isGuest ? "#94a3b8" : L.accent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        background: L.card,
        border: `1px solid ${expanded ? L.accentBd : L.border}`,
        boxShadow: expanded
          ? "0 4px 24px rgba(99,102,241,0.1)"
          : "0 1px 6px rgba(99,102,241,0.05)",
      }}>

      {/* header*/}
      <div className="flex items-center gap-4 px-5 py-4">

        {/* avatar */}
        <div className="relative flex-shrink-0">
          {user.avatar
            ? <img src={user.avatar} alt={user.name}
                className="w-12 h-12 rounded-xl object-cover border-2"
                style={{ borderColor: L.accentBd }} />
            : <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[13px] font-black"
                style={{ background: avatarGrad, color: avatarColor, border: `1.5px solid ${L.border}` }}>
                {initials}
              </div>
          }
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2"
            style={{ borderColor: L.card, background: isBlocked ? "#ef4444" : user.isGuest ? "#94a3b8" : "#22c55e" }} />
        </div>

        {/* info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[14px] font-bold" style={{ color: L.text1 }}>{user.name}</p>

            {/* provider badge */}
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
              style={{
                background: `${providerColor[user.provider] || "#94a3b8"}12`,
                color:       providerColor[user.provider] || "#94a3b8",
                border:      `1px solid ${providerColor[user.provider] || "#94a3b8"}25`,
              }}>
              {providerLabel[user.provider] || user.provider}
            </span>

            {/* verified */}
            {user.isVerified && !user.isGuest && (
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5"
                style={{ background: "rgba(34,197,94,0.08)", color: "#16a34a", border: "1px solid rgba(34,197,94,0.18)" }}>
                <CheckCircle size={8}/> {t("ভেরিফাইড", "Verified")}
              </span>
            )}

            {/* blocked */}
            {isBlocked && (
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.18)" }}>
                {t("ব্লকড", "Blocked")}
              </span>
            )}
          </div>

          {/* contact */}
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {user.email && (
              <span className="flex items-center gap-1 text-[11px]" style={{ color: L.text3 }}>
                <Mail size={10}/> {user.email}
              </span>
            )}
            {user.phone && (
              <span className="flex items-center gap-1 text-[11px]" style={{ color: L.text3 }}>
                <Phone size={10}/> {user.phone}
              </span>
            )}
            <span className="flex items-center gap-1 text-[11px]" style={{ color: L.text3 }}>
              <Calendar size={10}/> {joined}
            </span>
          </div>
        </div>

        {/* quick stats */}
        <div className="hidden md:flex items-center gap-4 flex-shrink-0">
          <div className="text-center">
            <p className="text-[16px] font-black" style={{ color: L.accent }}>{fetched ? orders.length : "—"}</p>
            <p className="text-[9px] uppercase tracking-widest" style={{ color: L.text3 }}>
              {t("অর্ডার", "Orders")}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[16px] font-black" style={{ color: "#16a34a" }}>
              {fetched ? `৳${totalSpent.toLocaleString()}` : "—"}
            </p>
            <p className="text-[9px] uppercase tracking-widest" style={{ color: L.text3 }}>
              {t("মোট খরচ", "Spent")}
            </p>
          </div>
          {!user.isGuest && (
            <div className="text-center">
              <p className="text-[16px] font-black" style={{ color: "#f43f5e" }}>
                {user.wishlist?.length || 0}
              </p>
              <p className="text-[9px] uppercase tracking-widest" style={{ color: L.text3 }}>
                {t("উইশলিস্ট", "Wishlist")}
              </p>
            </div>
          )}
        </div>

        {/* a */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={handleExpand}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: expanded ? L.accentBg : "#f1f5f9",
              border:     expanded ? `1px solid ${L.accentBd}` : "1px solid rgba(99,102,241,0.1)",
              color:      expanded ? L.accent : L.text3,
            }}>
            {expanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
          </button>
        </div>
      </div>

      {/*expanded detail ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden">
            <div className="px-5 pb-5 space-y-5"
              style={{ borderTop: `1px solid ${L.border}` }}>

              {/* summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                {[
                  { label: t("মোট অর্ডার",  "Total Orders"),  value: orders.length,                     color: "#6366f1", icon: <ShoppingBag size={14}/> },
                  { label: t("মোট খরচ",     "Total Spent"),   value: `৳${totalSpent.toLocaleString()}`,  color: "#16a34a", icon: <TrendingUp size={14}/> },
                  { label: t("ডেলিভার্ড",   "Delivered"),     value: deliveredCnt,                      color: "#06b6d4", icon: <CheckCircle size={14}/> },
                  { label: t("বাতিল",        "Cancelled"),     value: cancelledCnt,                      color: "#ef4444", icon: <XCircle size={14}/> },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-3.5 text-center"
                    style={{ background: `${s.color}08`, border: `1px solid ${s.color}18` }}>
                    <div className="flex items-center justify-center mb-1.5" style={{ color: s.color }}>{s.icon}</div>
                    <p className="text-[17px] font-black" style={{ color: L.text1 }}>{s.value}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: L.text3 }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* registered extra info */}
              {!user.isGuest && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  {/* account info */}
                  <div className="rounded-xl p-4 space-y-2.5"
                    style={{ background: "#f8f9ff", border: `1px solid ${L.border}` }}>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: L.text3 }}>
                      {t("অ্যাকাউন্ট তথ্য", "Account Info")}
                    </p>
                    {[
                      { icon: <Mail size={12}/>,        label: t("ইমেইল",     "Email"),    value: user.email    || "—" },
                      { icon: <Phone size={12}/>,       label: t("ফোন",       "Phone"),    value: user.phone    || "—" },
                      { icon: <Calendar size={12}/>,    label: t("যোগ দিয়েছেন","Joined"),  value: joined                },
                      { icon: <CreditCard size={12}/>,  label: t("প্রোভাইডার","Provider"), value: providerLabel[user.provider] || user.provider },
                      { icon: <CheckCircle size={12}/>, label: t("ভেরিফাইড",  "Verified"), value: user.isVerified ? t("হ্যাঁ","Yes") : t("না","No") },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between text-[12px]">
                        <span className="flex items-center gap-2" style={{ color: L.text3 }}>
                          <span style={{ color: L.text3 }}>{row.icon}</span>
                          {row.label}
                        </span>
                        <span className="font-semibold" style={{ color: L.text2 }}>{row.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* wishlist + address */}
                  <div className="rounded-xl p-4 space-y-2.5"
                    style={{ background: "#f8f9ff", border: `1px solid ${L.border}` }}>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: L.text3 }}>
                      {t("অতিরিক্ত তথ্য", "Extra Info")}
                    </p>
                    {[
                      { icon: <Heart size={12}/>,  label: t("উইশলিস্ট",    "Wishlist"),    value: `${user.wishlist?.length || 0} টি পণ্য` },
                      { icon: <MapPin size={12}/>, label: t("জেলা",        "District"),    value: user.address?.district || "—" },
                      { icon: <MapPin size={12}/>, label: t("থানা",        "Thana"),       value: user.address?.thana    || "—" },
                      { icon: <Star size={12}/>,   label: t("ঠিকানা লেবেল","Addr Label"),  value: user.address?.label    || "—" },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between text-[12px]">
                        <span className="flex items-center gap-2" style={{ color: L.text3 }}>
                          <span style={{ color: L.text3 }}>{row.icon}</span>
                          {row.label}
                        </span>
                        <span className="font-semibold" style={{ color: L.text2 }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* guest info */}
              {user.isGuest && (
                <div className="rounded-xl p-4"
                  style={{ background: "rgba(148,163,184,0.06)", border: "1px solid rgba(148,163,184,0.15)" }}>
                  <p className="text-[11px] font-medium" style={{ color: "#94a3b8" }}>
                    ℹ️ {t(
                      "এই কাস্টমার রেজিস্ট্রেশন করেননি — অর্ডার তথ্য থেকে নেওয়া হয়েছে।",
                      "This customer is not registered — info taken from order data."
                    )}
                  </p>
                </div>
              )}

              {/* orders */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: L.text3 }}>
                  {t("অর্ডার ইতিহাস", "Order History")}
                </p>
                {loadingOrds ? (
                  <div className="space-y-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-12 rounded-xl animate-pulse"
                        style={{ background: "rgba(99,102,241,0.05)" }} />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="flex flex-col items-center py-6 gap-2">
                    <ShoppingCart size={28} style={{ color: "#cbd5e1" }} strokeWidth={1.2}/>
                    <p className="text-[12px]" style={{ color: L.text3 }}>
                      {t("কোনো অর্ডার নেই", "No orders found")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {orders.map(order => <OrderRow key={order._id} order={order}/>)}
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}



//main page
export default function SubAdminUsers() {
  const { t } = useSubLang();
  const [users,   setUsers  ] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch ] = useState("");
  const [filter,  setFilter ] = useState("all");
  const [stats,   setStats  ] = useState({ total: 0, registered: 0, guest: 0, blocked: 0 });

  const token = localStorage.getItem("adminToken") || localStorage.getItem("token");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        setStats({
          total:      data.users.length,
          registered: data.users.filter(u => !u.isGuest).length,
          guest:      data.users.filter(u =>  u.isGuest).length,
          blocked:    data.users.filter(u =>  u.isBlocked).length,
        });
      }
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = useMemo(() => {
    let list = [...users];
    if (filter === "registered") list = list.filter(u => !u.isGuest);
    if (filter === "guest")      list = list.filter(u =>  u.isGuest);
    if (filter === "local")      list = list.filter(u => u.provider === "local");
    if (filter === "google")     list = list.filter(u => u.provider === "google");
    if (filter === "blocked")    list = list.filter(u =>  u.isBlocked);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(q)
      );
    }
    return list;
  }, [users, filter, search]);

  const FILTERS = [
    { key: "all",        labelBn: "সব",           labelEn: "All"        },
    { key: "registered", labelBn: "রেজিস্টার্ড", labelEn: "Registered" },
    { key: "guest",      labelBn: "গেস্ট",        labelEn: "Guest"      },
    { key: "local",      labelBn: "লোকাল",        labelEn: "Local"      },
    { key: "google",     labelBn: "গুগল",         labelEn: "Google"     },
    { key: "blocked",    labelBn: "ব্লকড",        labelEn: "Blocked"    },
  ];

  return (
    <div className="space-y-6">

      {/* header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg,#eef2ff,#f5f3ff)", border: `1px solid ${L.accentBd}`, boxShadow: "0 4px 24px rgba(99,102,241,0.08)" }}>
        {/* top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)" }}/>
        <div className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: L.accentBg, border: `1px solid ${L.accentBd}` }}>
            <Users size={22} style={{ color: L.accent }}/>
          </div>
          <div className="flex-1">
            <h1 className="text-[21px] font-black tracking-tight" style={{ color: L.text1, fontFamily: "'Syne',sans-serif" }}>
              {t("ব্যবহারকারী", "Users")}
            </h1>
            <p className="text-[12px] mt-0.5" style={{ color: "#6b7280" }}>
              {t("রেজিস্টার্ড + গেস্ট সকল কাস্টমার", "Registered + Guest all customers")}
            </p>
          </div>
          <button onClick={fetchUsers}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ background: "#fff", border: `1px solid ${L.border}`, color: L.text3, boxShadow: "0 1px 4px rgba(99,102,241,0.08)" }}>
            <RefreshCw size={15} className={loading ? "animate-spin" : ""}/>
          </button>
        </div>
      </motion.div>

      {/*stats*/}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: <Users size={18}/>,     label: t("মোট",          "Total"),      value: stats.total,      color: "#6366f1" },
          { icon: <UserCheck size={18}/>, label: t("রেজিস্টার্ড",  "Registered"), value: stats.registered, color: "#16a34a" },
          { icon: <UserX size={18}/>,     label: t("গেস্ট",        "Guest"),      value: stats.guest,      color: "#94a3b8" },
          { icon: <ShieldOff size={18}/>, label: t("ব্লকড",        "Blocked"),    value: stats.blocked,    color: "#ef4444" },
        ].map((s, i) => (
          <StatCard key={i} icon={s.icon} label={s.label} value={s.value} color={s.color} loading={loading}/>
        ))}
      </div>

      {/* search and fitler */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: L.text3 }}/>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t("নাম, ইমেইল বা ফোন...", "Search by name, email or phone...")}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[13px] outline-none transition-all"
            style={{ background: L.card, border: `1px solid ${L.border}`, color: L.text1, fontFamily: "'DM Sans',sans-serif", boxShadow: "0 1px 4px rgba(99,102,241,0.05)" }}
            onFocus={e => { e.target.style.borderColor = L.accentBd; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.08)"; }}
            onBlur={e  => { e.target.style.borderColor = L.border;   e.target.style.boxShadow = "0 1px 4px rgba(99,102,241,0.05)"; }}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: L.text3 }}>
              <X size={13}/>
            </button>
          )}
        </div>
        <div className="flex gap-1.5 p-1 rounded-xl flex-wrap"
          style={{ background: L.card, border: `1px solid ${L.border}`, boxShadow: "0 1px 4px rgba(99,102,241,0.05)" }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
              style={filter === f.key
                ? { background: L.accentBg, color: L.accent, border: `1px solid ${L.accentBd}` }
                : { color: L.text3, border: "1px solid transparent" }
              }>
              {t(f.labelBn, f.labelEn)}
            </button>
          ))}
        </div>
      </div>

      {/* count */}
      {!loading && (
        <p className="text-[11px]" style={{ color: L.text3 }}>
          {t(`${filtered.length}জন কাস্টমার`, `${filtered.length} customer${filtered.length !== 1 ? "s" : ""}`)}
        </p>
      )}

      {/*list*/}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="rounded-2xl p-5 animate-pulse"
              style={{ background: L.card, border: `1px solid ${L.border}` }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl" style={{ background: "rgba(99,102,241,0.07)" }}/>
                <div className="flex-1 space-y-2">
                  <div className="h-3 rounded-lg w-1/3" style={{ background: "rgba(99,102,241,0.07)" }}/>
                  <div className="h-2.5 rounded-lg w-1/2" style={{ background: "rgba(99,102,241,0.05)" }}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: L.accentBg, border: `1px solid ${L.border}` }}>
            <Users size={28} style={{ color: L.text3 }} strokeWidth={1.2}/>
          </div>
          <p className="text-[14px] font-bold" style={{ color: L.text3 }}>
            {t("কোনো কাস্টমার পাওয়া যায়নি", "No customers found")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((user, i) => (
            <UserCard key={user._id} user={user} index={i}/>
          ))}
        </div>
      )}

    </div>
  );
}