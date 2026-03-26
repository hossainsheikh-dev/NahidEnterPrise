import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, Mail, Phone, ShoppingBag, Heart,
  ChevronDown, ChevronUp, X, Shield, ShieldOff,
  Calendar, Package, TrendingUp, RefreshCw,
  MapPin, CreditCard, CheckCircle, Clock, XCircle,
  UserCheck, UserX, ShoppingCart, Banknote, Star,
} from "lucide-react";
import { useAdminLang } from "../../context/AdminLangContext";

const API = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;

/* ══════════════════════════════
   STAT CARD
══════════════════════════════ */
function StatCard({ icon, label, value, color, loading }) {
  return (
    <div className="rounded-2xl p-5 flex items-center gap-4"
      style={{ background: "#0d1426", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#475569" }}>{label}</p>
        {loading
          ? <div className="h-6 w-16 rounded-lg animate-pulse mt-1" style={{ background: "rgba(255,255,255,0.06)" }} />
          : <p className="text-[22px] font-black" style={{ color: "#f1f5f9" }}>{value}</p>
        }
      </div>
    </div>
  );
}

/* ══════════════════════════════
   ORDER ROW
══════════════════════════════ */
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
  const color    = STATUS_COLOR[order.status]              || "#64748b";
  const payColor = PAY_STATUS_COLOR[order.paymentStatus]   || "#64748b";

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-black text-[11px]" style={{ color: "#c9a84c" }}>{order.orderId}</span>
          <span className="text-[11px]" style={{ color: "#475569" }}>
            {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
          </span>
          <span className="text-[11px] hidden sm:block capitalize px-2 py-0.5 rounded-lg"
            style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
            {order.status}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[11px] capitalize px-2 py-0.5 rounded-lg"
            style={{ background: `${payColor}18`, color: payColor, border: `1px solid ${payColor}30` }}>
            {order.paymentMethod?.toUpperCase()}
          </span>
          <span className="font-black text-[13px]" style={{ color: "#f1f5f9" }}>
            ৳{order.total?.toLocaleString()}
          </span>
        </div>
      </div>
      {/* Items preview */}
      {order.items?.length > 0 && (
        <div className="px-3 pb-2.5 flex gap-2 overflow-x-auto">
          {order.items.slice(0, 4).map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 flex-shrink-0 rounded-lg px-2 py-1"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
              {item.image
                ? <img src={item.image} alt={item.name} className="w-5 h-5 rounded object-contain bg-white"/>
                : <Package size={12} style={{ color: "#334155" }}/>
              }
              <span className="text-[10px] max-w-[80px] truncate" style={{ color: "#64748b" }}>
                {item.name}
              </span>
              <span className="text-[10px] font-bold" style={{ color: "#c9a84c" }}>×{item.quantity}</span>
            </div>
          ))}
          {order.items.length > 4 && (
            <span className="text-[10px] self-center flex-shrink-0" style={{ color: "#475569" }}>
              +{order.items.length - 4} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════
   USER CARD
══════════════════════════════ */
function UserCard({ user, index }) {
  const { t } = useAdminLang();
  const [expanded,    setExpanded   ] = useState(false);
  const [orders,      setOrders     ] = useState([]);
  const [loadingOrds, setLoadingOrds] = useState(false);
  const [blocking,    setBlocking   ] = useState(false);
  const [isBlocked,   setIsBlocked  ] = useState(user.isBlocked);
  const [fetched,     setFetched    ] = useState(false);

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

  const handleBlock = async () => {
    if (user.isGuest) return;
    setBlocking(true);
    try {
      const res  = await fetch(`${API}/api/auth/users/${user._id}/block`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setIsBlocked(data.isBlocked);
    } catch {}
    finally { setBlocking(false); }
  };

  const totalSpent   = orders.reduce((s, o) => s + (o.total || 0), 0);
  const deliveredCnt = orders.filter(o => o.status === "delivered").length;
  const cancelledCnt = orders.filter(o => o.status === "cancelled").length;
  const initials     = user.name?.trim().split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2) || "??";

  const providerColor = { local: "#c9a84c", google: "#ef4444", facebook: "#3b82f6", guest: "#64748b" };
  const providerLabel = { local: "Local", google: "Google", facebook: "Facebook", guest: "Guest" };
  const joined        = user.createdAt ? new Date(user.createdAt).toLocaleDateString("bn-BD") : "—";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.35 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: "#0d1426", border: `1px solid ${expanded ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.06)"}`, transition: "border-color 0.2s" }}>

      {/* ── Header ── */}
      <div className="flex items-center gap-4 px-5 py-4">

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {user.avatar
            ? <img src={user.avatar} alt={user.name}
                className="w-12 h-12 rounded-xl object-cover border-2"
                style={{ borderColor: "rgba(201,168,76,0.25)" }} />
            : <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[13px] font-black"
                style={{
                  background: user.isGuest
                    ? "linear-gradient(135deg,#1e293b,#334155)"
                    : "linear-gradient(135deg,#1e3a5f,#1e40af)",
                  color: "#c9a84c",
                  border: "2px solid rgba(201,168,76,0.2)",
                }}>
                {initials}
              </div>
          }
          {/* Online indicator */}
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2"
            style={{ borderColor: "#0d1426", background: isBlocked ? "#ef4444" : user.isGuest ? "#64748b" : "#22c55e" }} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[14px] font-bold" style={{ color: "#f1f5f9" }}>{user.name}</p>

            {/* Provider badge */}
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
              style={{
                background: `${providerColor[user.provider] || "#64748b"}18`,
                color:       providerColor[user.provider] || "#64748b",
                border:      `1px solid ${providerColor[user.provider] || "#64748b"}30`,
              }}>
              {providerLabel[user.provider] || user.provider}
            </span>

            {/* Verified badge */}
            {user.isVerified && !user.isGuest && (
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5"
                style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>
                <CheckCircle size={8}/> {t("ভেরিফাইড", "Verified")}
              </span>
            )}

            {/* Blocked badge */}
            {isBlocked && (
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                {t("ব্লকড", "Blocked")}
              </span>
            )}
          </div>

          {/* Contact info */}
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {user.email && (
              <span className="flex items-center gap-1 text-[11px]" style={{ color: "#64748b" }}>
                <Mail size={10}/> {user.email}
              </span>
            )}
            {user.phone && (
              <span className="flex items-center gap-1 text-[11px]" style={{ color: "#64748b" }}>
                <Phone size={10}/> {user.phone}
              </span>
            )}
            <span className="flex items-center gap-1 text-[11px]" style={{ color: "#475569" }}>
              <Calendar size={10}/> {joined}
            </span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="hidden md:flex items-center gap-4 flex-shrink-0">
          <div className="text-center">
            <p className="text-[16px] font-black" style={{ color: "#c9a84c" }}>{fetched ? orders.length : "—"}</p>
            <p className="text-[9px] uppercase tracking-widest" style={{ color: "#334155" }}>
              {t("অর্ডার", "Orders")}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[16px] font-black" style={{ color: "#22c55e" }}>
              {fetched ? `৳${totalSpent.toLocaleString()}` : "—"}
            </p>
            <p className="text-[9px] uppercase tracking-widest" style={{ color: "#334155" }}>
              {t("মোট খরচ", "Spent")}
            </p>
          </div>
          {!user.isGuest && (
            <div className="text-center">
              <p className="text-[16px] font-black" style={{ color: "#f43f5e" }}>
                {user.wishlist?.length || 0}
              </p>
              <p className="text-[9px] uppercase tracking-widest" style={{ color: "#334155" }}>
                {t("উইশলিস্ট", "Wishlist")}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {!user.isGuest && (
            <button onClick={handleBlock} disabled={blocking}
              title={isBlocked ? t("আনব্লক করুন", "Unblock") : t("ব্লক করুন", "Block")}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: isBlocked ? "rgba(34,197,94,0.1)"  : "rgba(239,68,68,0.08)",
                border:     isBlocked ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(239,68,68,0.15)",
                color:      isBlocked ? "#22c55e" : "#f87171",
              }}>
              {blocking
                ? <RefreshCw size={13} className="animate-spin"/>
                : isBlocked ? <Shield size={13}/> : <ShieldOff size={13}/>
              }
            </button>
          )}

          <button onClick={handleExpand}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: expanded ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.04)",
              border:     expanded ? "1px solid rgba(201,168,76,0.25)" : "1px solid rgba(255,255,255,0.08)",
              color:      expanded ? "#c9a84c" : "#64748b",
            }}>
            {expanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
          </button>
        </div>
      </div>

      {/* ── Expanded Detail ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden">
            <div className="px-5 pb-5 space-y-5"
              style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>

              {/* ── Summary cards ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                {[
                  { label: t("মোট অর্ডার",   "Total Orders"),    value: orders.length,                    color: "#c9a84c", icon: <ShoppingBag size={14}/> },
                  { label: t("মোট খরচ",      "Total Spent"),     value: `৳${totalSpent.toLocaleString()}`, color: "#22c55e", icon: <TrendingUp size={14}/> },
                  { label: t("ডেলিভার্ড",    "Delivered"),       value: deliveredCnt,                     color: "#06b6d4", icon: <CheckCircle size={14}/> },
                  { label: t("বাতিল",         "Cancelled"),       value: cancelledCnt,                     color: "#ef4444", icon: <XCircle size={14}/> },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-3.5 text-center"
                    style={{ background: `${s.color}08`, border: `1px solid ${s.color}18` }}>
                    <div className="flex items-center justify-center mb-1.5" style={{ color: s.color }}>{s.icon}</div>
                    <p className="text-[17px] font-black" style={{ color: "#f1f5f9" }}>{s.value}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "#475569" }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* ── Registered customer extra info ── */}
              {!user.isGuest && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  {/* Account info */}
                  <div className="rounded-xl p-4 space-y-2.5"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#334155" }}>
                      {t("অ্যাকাউন্ট তথ্য", "Account Info")}
                    </p>
                    {[
                      { icon: <Mail size={12}/>,       label: t("ইমেইল",    "Email"),    value: user.email    || "—" },
                      { icon: <Phone size={12}/>,      label: t("ফোন",      "Phone"),    value: user.phone    || "—" },
                      { icon: <Calendar size={12}/>,   label: t("যোগ দিয়েছেন","Joined"),  value: joined                },
                      { icon: <CreditCard size={12}/>, label: t("প্রোভাইডার","Provider"), value: providerLabel[user.provider] || user.provider },
                      { icon: <CheckCircle size={12}/>,label: t("ভেরিফাইড", "Verified"), value: user.isVerified ? t("হ্যাঁ","Yes") : t("না","No") },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between text-[12px]">
                        <span className="flex items-center gap-2" style={{ color: "#475569" }}>
                          <span style={{ color: "#334155" }}>{row.icon}</span>
                          {row.label}
                        </span>
                        <span className="font-semibold" style={{ color: "#94a3b8" }}>{row.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Wishlist + Address */}
                  <div className="rounded-xl p-4 space-y-2.5"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#334155" }}>
                      {t("অতিরিক্ত তথ্য", "Extra Info")}
                    </p>
                    {[
                      { icon: <Heart size={12}/>,   label: t("উইশলিস্ট",  "Wishlist"),  value: `${user.wishlist?.length || 0} টি পণ্য` },
                      { icon: <MapPin size={12}/>,  label: t("জেলা",      "District"),  value: user.address?.district || "—" },
                      { icon: <MapPin size={12}/>,  label: t("থানা",      "Thana"),     value: user.address?.thana    || "—" },
                      { icon: <Star size={12}/>,    label: t("ঠিকানা লেবেল","Addr Label"), value: user.address?.label  || "—" },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between text-[12px]">
                        <span className="flex items-center gap-2" style={{ color: "#475569" }}>
                          <span style={{ color: "#334155" }}>{row.icon}</span>
                          {row.label}
                        </span>
                        <span className="font-semibold" style={{ color: "#94a3b8" }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Guest info ── */}
              {user.isGuest && (
                <div className="rounded-xl p-4"
                  style={{ background: "rgba(100,116,139,0.06)", border: "1px solid rgba(100,116,139,0.15)" }}>
                  <p className="text-[11px] font-bold" style={{ color: "#64748b" }}>
                    ℹ️ {t("এই কাস্টমার রেজিস্ট্রেশন করেননি — অর্ডার তথ্য থেকে নেওয়া হয়েছে।",
                         "This customer is not registered — info taken from order data.")}
                  </p>
                </div>
              )}

              {/* ── Orders ── */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#334155" }}>
                  {t("অর্ডার ইতিহাস", "Order History")}
                </p>

                {loadingOrds ? (
                  <div className="space-y-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-12 rounded-xl animate-pulse"
                        style={{ background: "rgba(255,255,255,0.04)" }} />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="flex flex-col items-center py-6 gap-2">
                    <ShoppingCart size={28} style={{ color: "#1e293b" }} strokeWidth={1.2}/>
                    <p className="text-[12px]" style={{ color: "#334155" }}>
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

/* ══════════════════════════════
   MAIN PAGE
══════════════════════════════ */
export default function AdminUsers() {
  const { t } = useAdminLang();
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
    { key: "all",        labelBn: "সব",            labelEn: "All"        },
    { key: "registered", labelBn: "রেজিস্টার্ড",  labelEn: "Registered" },
    { key: "guest",      labelBn: "গেস্ট",         labelEn: "Guest"      },
    { key: "local",      labelBn: "লোকাল",         labelEn: "Local"      },
    { key: "google",     labelBn: "গুগল",          labelEn: "Google"     },
    { key: "blocked",    labelBn: "ব্লকড",         labelEn: "Blocked"    },
  ];

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg,#0d1426,#111827)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}>
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg,transparent,rgba(201,168,76,0.5) 40%,rgba(59,130,246,0.5) 70%,transparent)" }}/>
        <div className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }}>
            <Users size={22} style={{ color: "#c9a84c" }}/>
          </div>
          <div className="flex-1">
            <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "22px", color: "#f1f5f9" }}>
              {t("ব্যবহারকারী", "Users")}
            </h1>
            <p className="text-[12px] mt-0.5" style={{ color: "#475569" }}>
              {t("রেজিস্টার্ড + গেস্ট সকল কাস্টমার", "Registered + Guest all customers")}
            </p>
          </div>
          <button onClick={fetchUsers}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b" }}>
            <RefreshCw size={15} className={loading ? "animate-spin" : ""}/>
          </button>
        </div>
      </motion.div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: <Users size={18}/>,     label: t("মোট",           "Total"),       value: stats.total,      color: "#c9a84c" },
          { icon: <UserCheck size={18}/>, label: t("রেজিস্টার্ড",   "Registered"),  value: stats.registered, color: "#22c55e" },
          { icon: <UserX size={18}/>,     label: t("গেস্ট",         "Guest"),        value: stats.guest,      color: "#64748b" },
          { icon: <ShieldOff size={18}/>, label: t("ব্লকড",         "Blocked"),      value: stats.blocked,    color: "#ef4444" },
        ].map((s, i) => (
          <StatCard key={i} icon={s.icon} label={s.label} value={s.value} color={s.color} loading={loading}/>
        ))}
      </div>

      {/* ── Search + Filter ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#475569" }}/>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t("নাম, ইমেইল বা ফোন...", "Search by name, email or phone...")}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[13px] outline-none"
            style={{ background: "#0d1426", border: "1px solid rgba(255,255,255,0.08)", color: "#e2e8f0", fontFamily: "'DM Sans',sans-serif" }}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }}>
              <X size={13}/>
            </button>
          )}
        </div>
        <div className="flex gap-1.5 p-1 rounded-xl flex-wrap"
          style={{ background: "#0d1426", border: "1px solid rgba(255,255,255,0.06)" }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
              style={filter === f.key
                ? { background: "rgba(201,168,76,0.15)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.25)" }
                : { color: "#475569", border: "1px solid transparent" }
              }>
              {t(f.labelBn, f.labelEn)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Count ── */}
      {!loading && (
        <p className="text-[11px]" style={{ color: "#334155" }}>
          {t(`${filtered.length}জন কাস্টমার`, `${filtered.length} customer${filtered.length !== 1 ? "s" : ""}`)}
        </p>
      )}

      {/* ── List ── */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="rounded-2xl p-5 animate-pulse"
              style={{ background: "#0d1426", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl" style={{ background: "rgba(255,255,255,0.06)" }}/>
                <div className="flex-1 space-y-2">
                  <div className="h-3 rounded-lg w-1/3" style={{ background: "rgba(255,255,255,0.06)" }}/>
                  <div className="h-2.5 rounded-lg w-1/2" style={{ background: "rgba(255,255,255,0.04)" }}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <Users size={28} style={{ color: "#1e293b" }} strokeWidth={1.2}/>
          </div>
          <p className="text-[14px] font-bold" style={{ color: "#334155" }}>
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