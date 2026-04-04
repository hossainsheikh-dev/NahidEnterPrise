import { useState, useEffect, useRef } from "react";
import {
  Menu, X, ShoppingCart, User, Heart, Search,
  ChevronDown, ChevronRight, Package, Clock, ArrowRight, Globe,
  LogOut, UserCircle, Lock, Eye, EyeOff, Phone, Mail,
  Info, MapPin, HelpCircle, Shield, ShoppingBag,
  AlertCircle, CheckCircle, Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useCart } from "../context/CartContext";
import { useLang, useT } from "../context/LanguageContext";
import { useWishlist } from "../context/WishlistContext";

const API = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_BACKEND_URL}`;
const RECENT_KEY = "ne_recent_searches";

const getRecent       = () => { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; } };
const saveRecent      = (t) => { try { const p = getRecent().filter(x => x.toLowerCase() !== t.toLowerCase()); localStorage.setItem(RECENT_KEY, JSON.stringify([t, ...p].slice(0, 5))); } catch {} };
const clearAllRecent  = ()  => { try { localStorage.removeItem(RECENT_KEY); } catch {} };
const removeOneRecent = (t) => { try { localStorage.setItem(RECENT_KEY, JSON.stringify(getRecent().filter(x => x !== t))); } catch {} };

const notify = () => window.dispatchEvent(new Event("customerAuthChanged"));
const manualLinks = [{ _id: "Show All", name: "Show All", slug: "", sublinks: [] }];

/* ══ STATUS CFG for orders ══ */
const STATUS_CFG = {
  pending:    { label:"অপেক্ষমাণ", color:"#d97706", bg:"#fffbeb", border:"#fde68a" },
  processing: { label:"প্যাকেজিং", color:"#7c3aed", bg:"#f5f3ff", border:"#ddd6fe" },
  shipped:    { label:"পথে আছে",   color:"#1d4ed8", bg:"#eff6ff", border:"#bfdbfe" },
  confirmed:  { label:"নিশ্চিত",   color:"#0284c7", bg:"#f0f9ff", border:"#bae6fd" },
  delivered:  { label:"পৌঁছেছে",  color:"#059669", bg:"#ecfdf5", border:"#a7f3d0" },
  cancelled:  { label:"বাতিল",     color:"#dc2626", bg:"#fff1f2", border:"#fecdd3" },
};
const STEPS_LIST = ["pending","processing","shipped","confirmed","delivered"];
const getStatusCfg = (s) => STATUS_CFG[s?.toLowerCase()] || { label:s||"—", color:"#64748b", bg:"#f8fafc", border:"#e2e8f0" };

/* ── Mini Timeline ── */
function MiniTimeline({ status }) {
  if (status === "cancelled") return null;
  const cfg     = getStatusCfg(status);
  const current = STEPS_LIST.indexOf(status);
  const pct     = current <= 0 ? 0 : (current / (STEPS_LIST.length - 1)) * 100;
  return (
    <div className="relative mt-3 mb-1 px-1">
      <div className="absolute top-[7px] left-1 right-1 h-[2px] rounded-full" style={{ background:"#f1f5f9" }}/>
      <motion.div className="absolute top-[7px] left-1 h-[2px] rounded-full" style={{ background:cfg.color }}
        initial={{ width:"0%" }} animate={{ width:pct>0?`${pct}%`:"0%" }} transition={{ duration:0.8, ease:"easeOut" }}/>
      <div className="relative flex justify-between">
        {STEPS_LIST.map((s,i) => {
          const done = i <= current; const active = i === current;
          return (
            <div key={s} className="flex flex-col items-center gap-1">
              <div className="w-[14px] h-[14px] rounded-full z-10 flex items-center justify-center"
                style={{ background:done?(active?cfg.color:"#10b981"):"#e2e8f0", border:`2px solid ${done?(active?cfg.color:"#10b981"):"#e2e8f0"}`, boxShadow:active?`0 0 0 3px ${cfg.color}33`:"none" }}>
                {done && <div className="w-[4px] h-[4px] rounded-full bg-white"/>}
              </div>
              <p className="text-[7px] font-bold leading-tight text-center" style={{ color:done?(active?cfg.color:"#10b981"):"#cbd5e1", maxWidth:"28px" }}>
                {STATUS_CFG[s]?.label||s}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══ FAQ Data ══ */
const FAQ_SECTIONS = [
  {
    tag:"০১", titleBn:"অর্ডার সংক্রান্ত", titleEn:"Order Questions",
    faqs:[
      { qBn:"কীভাবে অর্ডার করবো?", qEn:"How do I place an order?",
        aBn:"পণ্য কার্টে যোগ করুন, চেকআউটে নাম-ফোন-ঠিকানা দিন, পেমেন্ট পদ্ধতি বেছে নিন।",
        aEn:"Add product to cart, enter name, phone and address at checkout, then choose payment." },
      { qBn:"অর্ডার বাতিল করা যাবে?", qEn:"Can I cancel my order?",
        aBn:"Pending বা Processing অবস্থায় হেল্পলাইনে যোগাযোগ করলে বাতিল করা সম্ভব।",
        aEn:"Contact helpline while order is Pending or Processing to cancel it." },
    ],
  },
  {
    tag:"০২", titleBn:"পেমেন্ট সংক্রান্ত", titleEn:"Payment Questions",
    faqs:[
      { qBn:"কোন পেমেন্ট পদ্ধতি আছে?", qEn:"Which payment methods are available?",
        aBn:"bKash, Nagad এবং ক্যাশ অন ডেলিভারি (COD)। মার্চেন্ট: 01938360666।",
        aEn:"bKash, Nagad and Cash on Delivery (COD). Merchant: 01938360666." },
      { qBn:"COD তে কি অতিরিক্ত চার্জ?", qEn:"Extra charges for COD?",
        aBn:"না, COD তে কোনো অতিরিক্ত চার্জ নেই।",
        aEn:"No, there are no extra charges for COD." },
    ],
  },
  {
    tag:"০৩", titleBn:"ডেলিভারি সংক্রান্ত", titleEn:"Delivery Questions",
    faqs:[
      { qBn:"ডেলিভারি কতদিন লাগে?", qEn:"How long does delivery take?",
        aBn:"ঢাকায় ১-২ কার্যদিবস, ঢাকার বাইরে ২-৪ কার্যদিবস।",
        aEn:"Dhaka: 1-2 business days, outside Dhaka: 2-4 business days." },
      { qBn:"ডেলিভারি চার্জ কত?", qEn:"What is the delivery charge?",
        aBn:"২৫০০ টাকার উপরে বিনামূল্যে, অন্যথায় ৬০ টাকা।",
        aEn:"Free above ৳2500, otherwise ৳60." },
    ],
  },
  {
    tag:"০৪", titleBn:"রিটার্ন ও রিফান্ড", titleEn:"Return & Refund",
    faqs:[
      { qBn:"পণ্য ফেরত দেওয়া যাবে?", qEn:"Can I return a product?",
        aBn:"পাওয়ার ৭ দিনের মধ্যে মূল প্যাকেজিংসহ ফেরত দেওয়া যাবে।",
        aEn:"Products can be returned within 7 days of receipt with original packaging." },
      { qBn:"রিফান্ড পেতে কতদিন?", qEn:"How long for a refund?",
        aBn:"পরিদর্শনের পরে ৩-৫ কার্যদিবসের মধ্যে bKash/Nagad এ রিফান্ড।",
        aEn:"Refund processed within 3-5 business days via bKash/Nagad after inspection." },
    ],
  },
];

/* ══ InlineAlert ══ */
function InlineAlert({ type, msg }) {
  if (!msg) return null;
  const cfg = {
    error:   { bg:"rgba(220,38,38,0.07)", border:"rgba(220,38,38,0.2)", text:"#dc2626", Icon:AlertCircle },
    success: { bg:"rgba(22,163,74,0.07)", border:"rgba(22,163,74,0.2)", text:"#16a34a", Icon:CheckCircle },
  }[type] || { bg:"rgba(220,38,38,0.07)", border:"rgba(220,38,38,0.2)", text:"#dc2626", Icon:AlertCircle };
  const { Icon } = cfg;
  return (
    <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl text-[13px] font-medium mb-4"
      style={{ background:cfg.bg, border:`1px solid ${cfg.border}`, color:cfg.text }}>
      <Icon size={14} className="shrink-0 mt-0.5"/>{msg}
    </div>
  );
}

/* ══ EyeToggle ══ */
function EyeToggle({ show, onToggle }) {
  return (
    <button type="button" onClick={onToggle}
      className="flex items-center justify-center w-8 h-8 rounded-xl cursor-pointer border-none"
      style={{ background:"transparent", color: show?"#2e7d32":"#94a3b8" }}>
      {show ? <EyeOff size={15}/> : <Eye size={15}/>}
    </button>
  );
}

/* ══ InputField ══ */
function InputField({ icon:Icon, type="text", value, onChange, placeholder, rightEl, autoComplete }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      {Icon && <Icon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color:focused?"#2e7d32":"#94a3b8" }}/>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        className="w-full text-[14px] placeholder:text-slate-300 font-medium rounded-2xl outline-none"
        style={{
          color:"#1e293b", padding:Icon?"13px 14px 13px 42px":"13px 14px", paddingRight:rightEl?"44px":"14px",
          border:focused?"1.5px solid rgba(46,125,50,0.6)":"1.5px solid rgba(148,163,184,0.3)",
          background:focused?"rgba(46,125,50,0.03)":"rgba(248,250,252,0.8)",
          boxShadow:focused?"0 0 0 4px rgba(46,125,50,0.06)":"inset 0 1px 2px rgba(0,0,0,0.02)",
        }}/>
      {rightEl && <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightEl}</div>}
    </div>
  );
}

/* ══ FieldWrap ══ */
function FieldWrap({ label, children }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-[11.5px] font-bold text-slate-400 uppercase tracking-[0.08em]">{label}</label>}
      {children}
    </div>
  );
}

/* ══ SubmitBtn ══ */
function SubmitBtn({ loading, children, disabled }) {
  return (
    <motion.button type="submit" disabled={loading||disabled}
      whileHover={!loading&&!disabled?{scale:1.01}:{}} whileTap={!loading&&!disabled?{scale:0.98}:{}}
      className="w-full flex items-center justify-center gap-2.5 py-[13px] px-5 rounded-2xl text-[14px] font-bold"
      style={{
        background:loading||disabled?"rgba(148,163,184,0.15)":"linear-gradient(135deg,#1a3a1a,#2e7d32,#388e3c)",
        color:loading||disabled?"#94a3b8":"#fff",
        cursor:loading||disabled?"not-allowed":"pointer",
        boxShadow:loading||disabled?"none":"0 4px 20px rgba(46,125,50,0.35)",
        border:"none",
      }}>
      {children}
    </motion.button>
  );
}

/* ══ Bangladesh Districts & Upazilas ══ */
const BD_LOCATIONS = {
  "ঢাকা / Dhaka": ["ধামরাই / Dhamrai","দোহার / Dohar","কেরানীগঞ্জ / Keraniganj","নবাবগঞ্জ / Nawabganj","সাভার / Savar","ডেমরা / Demra","ধানমন্ডি / Dhanmondi","গুলশান / Gulshan","মিরপুর / Mirpur","মোহাম্মদপুর / Mohammadpur","মতিঝিল / Motijheel","উত্তরা / Uttara","বাড্ডা / Badda","কাফরুল / Kafrul","খিলগাঁও / Khilgaon","তুরাগ / Turag","সুত্রাপুর / Sutrapur","তেজগাঁও / Tejgaon","লালবাগ / Lalbagh","হাজারীবাগ / Hazaribagh"],
  "চট্টগ্রাম / Chittagong": ["আনোয়ারা / Anwara","বাঁশখালী / Banshkhali","বোয়ালখালী / Boalkhali","চন্দনাইশ / Chandanaish","ফটিকছড়ি / Fatikchhari","হাটহাজারী / Hathazari","লোহাগাড়া / Lohagara","মিরসরাই / Mirsharai","পটিয়া / Patiya","রাঙ্গুনিয়া / Rangunia","রাউজান / Raozan","সন্দ্বীপ / Sandwip","সাতকানিয়া / Satkania","সীতাকুণ্ড / Sitakunda","চট্টগ্রাম সদর / Chittagong Sadar","কর্ণফুলী / Karnaphuli"],
  "রাজশাহী / Rajshahi": ["বাঘা / Bagha","বাগমারা / Bagmara","চারঘাট / Charghat","দুর্গাপুর / Durgapur","গোদাগাড়ী / Godagari","মোহনপুর / Mohanpur","পবা / Paba","পুঠিয়া / Puthia","রাজশাহী সদর / Rajshahi Sadar","তানোর / Tanore"],
  "খুলনা / Khulna": ["বটিয়াঘাটা / Batiaghata","দাকোপ / Dacope","ডুমুরিয়া / Dumuria","দিঘলিয়া / Dighalia","কয়রা / Koyra","পাইকগাছা / Paikgachha","ফুলতলা / Phultala","রূপসা / Rupsa","তেরখাদা / Terokhada","খালিশপুর / Khalishpur","দৌলতপুর / Daulatpur","সোনাডাঙ্গা / Sonadanga"],
  "বরিশাল / Barisal": ["আগৈলঝাড়া / Agailjhara","বাবুগঞ্জ / Babuganj","বাকেরগঞ্জ / Bakerganj","বানারীপাড়া / Banaripara","গৌরনদী / Gaurnadi","হিজলা / Hizla","বরিশাল সদর / Barisal Sadar","মেহেন্দিগঞ্জ / Mehendiganj","মুলাদী / Muladi","উজিরপুর / Uzirpur"],
  "সিলেট / Sylhet": ["বালাগঞ্জ / Balaganj","বিয়ানীবাজার / Beanibazar","বিশ্বনাথ / Bishwanath","কোম্পানীগঞ্জ / Companiganj","ফেঞ্চুগঞ্জ / Fenchuganj","গোলাপগঞ্জ / Golapganj","গোয়াইনঘাট / Gowainghat","জৈন্তাপুর / Jaintiapur","কানাইঘাট / Kanaighat","সিলেট সদর / Sylhet Sadar","জকিগঞ্জ / Zakiganj","দক্ষিণসুরমা / Dakshinsurma"],
  "রংপুর / Rangpur": ["বদরগঞ্জ / Badarganj","গঙ্গাচড়া / Gangachara","কাউনিয়া / Kaunia","মিঠাপুকুর / Mithapukur","পীরগাছা / Pirgachha","পীরগঞ্জ / Pirganj","রংপুর সদর / Rangpur Sadar","তারাগঞ্জ / Taraganj"],
  "ময়মনসিংহ / Mymensingh": ["ভালুকা / Bhaluka","ধোবাউড়া / Dhobaura","ফুলবাড়িয়া / Fulbaria","গফরগাঁও / Gaffargaon","গৌরীপুর / Gauripur","হালুয়াঘাট / Haluaghat","ঈশ্বরগঞ্জ / Ishwarganj","ময়মনসিংহ সদর / Mymensingh Sadar","মুক্তাগাছা / Muktagachha","নান্দাইল / Nandail","ফুলপুর / Phulpur","ত্রিশাল / Trishal"],
  "গাজীপুর / Gazipur": ["গাজীপুর সদর / Gazipur Sadar","কালিয়াকৈর / Kaliakair","কালীগঞ্জ / Kaliganj","কাপাসিয়া / Kapasia","শ্রীপুর / Sreepur","টঙ্গী / Tongi"],
  "নারায়ণগঞ্জ / Narayanganj": ["আড়াইহাজার / Araihazar","বন্দর / Bandar","নারায়ণগঞ্জ সদর / Narayanganj Sadar","রূপগঞ্জ / Rupganj","সোনারগাঁও / Sonargaon"],
  "কুমিল্লা / Comilla": ["বরুড়া / Barura","ব্রাহ্মণপাড়া / Brahmanpara","বুড়িচং / Burichong","চান্দিনা / Chandina","চৌদ্দগ্রাম / Chauddagram","দাউদকান্দি / Daudkandi","দেবিদ্বার / Debidwar","হোমনা / Homna","কুমিল্লা সদর / Comilla Sadar","লাকসাম / Laksam","মেঘনা / Meghna","মুরাদনগর / Muradnagar","নাঙ্গলকোট / Nangalkot"],
  "ফরিদপুর / Faridpur": ["আলফাডাঙ্গা / Alfadanga","ভাঙ্গা / Bhanga","বোয়ালমারী / Boalmari","ফরিদপুর সদর / Faridpur Sadar","মধুখালী / Madhukali","নগরকান্দা / Nagarkanda","সদরপুর / Sadarpur","সালথা / Saltha"],
  "যশোর / Jessore": ["অভয়নগর / Abhaynagar","বাঘারপাড়া / Bagherpara","চৌগাছা / Chaugachha","যশোর সদর / Jessore Sadar","ঝিকরগাছা / Jhikargachha","কেশবপুর / Keshabpur","মণিরামপুর / Manirampur","শার্শা / Sharsha"],
  "কক্সবাজার / Cox's Bazar": ["চকরিয়া / Chakaria","কক্সবাজার সদর / Cox's Bazar Sadar","কুতুবদিয়া / Kutubdia","মহেশখালী / Maheshkhali","পেকুয়া / Pekua","রামু / Ramu","টেকনাফ / Teknaf","উখিয়া / Ukhia"],
  "বগুড়া / Bogra": ["আদমদীঘি / Adamdighi","বগুড়া সদর / Bogra Sadar","ধুনট / Dhunat","গাবতলী / Gabtali","কাহালু / Kahaloo","নন্দীগ্রাম / Nandigram","সারিয়াকান্দি / Sariakandi","শাজাহানপুর / Shajahanpur","শেরপুর / Sherpur","সিবগঞ্জ / Shibganj","সোনাতলা / Sonatala"],
  "ব্রাহ্মণবাড়িয়া / Brahmanbaria": ["আখাউড়া / Akhaura","আশুগঞ্জ / Ashuganj","বাঞ্ছারামপুর / Bancharampur","ব্রাহ্মণবাড়িয়া সদর / Brahmanbaria Sadar","কসবা / Kasba","নবীনগর / Nabinagar","নাসিরনগর / Nasirnagar","সরাইল / Sarail","বিজয়নগর / Bijoynagar"],
  "টাঙ্গাইল / Tangail": ["বাসাইল / Basail","ভূঞাপুর / Bhuapur","দেলদুয়ার / Delduar","ঘাটাইল / Ghatail","গোপালপুর / Gopalpur","কালিহাতী / Kalihati","মধুপুর / Madhupur","মির্জাপুর / Mirzapur","নাগরপুর / Nagarpur","সখিপুর / Sakhipur","টাঙ্গাইল সদর / Tangail Sadar"],
  "জামালপুর / Jamalpur": ["বকশীগঞ্জ / Bakshiganj","দেওয়ানগঞ্জ / Dewanganj","ইসলামপুর / Islampur","জামালপুর সদর / Jamalpur Sadar","মাদারগঞ্জ / Madarganj","মেলান্দহ / Melandaha","সরিষাবাড়ী / Sarishabari"],
  "নেত্রকোনা / Netrokona": ["আটপাড়া / Atpara","বারহাট্টা / Barhatta","দুর্গাপুর / Durgapur","কলমাকান্দা / Kalmakanda","কেন্দুয়া / Kendua","নেত্রকোনা সদর / Netrokona Sadar","পূর্বধলা / Purbadhala"],
  "কিশোরগঞ্জ / Kishoreganj": ["অষ্টগ্রাম / Austagram","বাজিতপুর / Bajitpur","ভৈরব / Bhairab","কিশোরগঞ্জ সদর / Kishoreganj Sadar","কুলিয়ারচর / Kuliarchar","করিমগঞ্জ / Karimganj","পাকুন্দিয়া / Pakundia","তাড়াইল / Tarail"],
  "মানিকগঞ্জ / Manikganj": ["দৌলতপুর / Daulatpur","ঘিওর / Ghior","হরিরামপুর / Harirampur","মানিকগঞ্জ সদর / Manikganj Sadar","শিবালয় / Shivalaya","সিংগাইর / Singair"],
  "মুন্সীগঞ্জ / Munshiganj": ["গজারিয়া / Gazaria","লোহাজং / Lohajang","মুন্সীগঞ্জ সদর / Munshiganj Sadar","সিরাজদিখান / Sirajdikhan","শ্রীনগর / Sreenagar","টঙ্গীবাড়ী / Tongibari"],
  "নরসিংদী / Narsingdi": ["বেলাবো / Belabo","মনোহরদী / Monohardi","নরসিংদী সদর / Narsingdi Sadar","পলাশ / Palash","রায়পুরা / Raipura","শিবপুর / Shibpur"],
  "রাজবাড়ী / Rajbari": ["বালিয়াকান্দি / Baliakandi","গোয়ালন্দ / Goalandaghat","কালুখালী / Kalukhali","পাংশা / Pangsha","রাজবাড়ী সদর / Rajbari Sadar"],
  "শরীয়তপুর / Shariatpur": ["ভেদরগঞ্জ / Bhedarganj","ডামুড্যা / Damudya","গোসাইরহাট / Gosairhat","নড়িয়া / Naria","শরীয়তপুর সদর / Shariatpur Sadar","জাজিরা / Zajira"],
  "গোপালগঞ্জ / Gopalganj": ["গোপালগঞ্জ সদর / Gopalganj Sadar","কাশিয়ানী / Kashiani","কোটালীপাড়া / Kotalipara","মুকসুদপুর / Muksudpur","টুঙ্গীপাড়া / Tungipara"],
  "মাদারীপুর / Madaripur": ["কালকিনি / Kalkini","মাদারীপুর সদর / Madaripur Sadar","রাজৈর / Rajoir","শিবচর / Shibchar"],
  "পটুয়াখালী / Patuakhali": ["বাউফল / Bauphal","দশমিনা / Dashmina","গলাচিপা / Galachipa","কলাপাড়া / Kalapara","মির্জাগঞ্জ / Mirzaganj","পটুয়াখালী সদর / Patuakhali Sadar","রাঙ্গাবালী / Rangabali"],
  "পিরোজপুর / Pirojpur": ["ভান্ডারিয়া / Bhandaria","কাউখালী / Kawkhali","মঠবাড়িয়া / Mathbaria","নাজিরপুর / Nazirpur","পিরোজপুর সদর / Pirojpur Sadar","নেছারাবাদ / Nesarabad"],
  "ঝালকাঠি / Jhalokati": ["ঝালকাঠি সদর / Jhalokati Sadar","কাঁঠালিয়া / Kanthalia","নলছিটি / Nalchity","রাজাপুর / Rajapur"],
  "ভোলা / Bhola": ["ভোলা সদর / Bhola Sadar","বোরহানউদ্দিন / Borhanuddin","চর ফ্যাশন / Char Fasson","দৌলতখান / Daulatkhan","লালমোহন / Lalmohan","তজুমুদ্দিন / Tazumuddin"],
  "বরগুনা / Barguna": ["আমতলী / Amtali","বামনা / Bamna","বরগুনা সদর / Barguna Sadar","বেতাগী / Betagi","পাথরঘাটা / Patharghata","তালতলী / Taltali"],
  "খাগড়াছড়ি / Khagrachhari": ["দীঘিনালা / Dighinala","খাগড়াছড়ি সদর / Khagrachhari Sadar","লক্ষ্মীছড়ি / Lakshmichhari","মহালছড়ি / Mahalchhari","মানিকছড়ি / Manikchhari","মাটিরাঙ্গা / Matiranga","পানছড়ি / Panchhari","রামগড় / Ramgarh"],
  "রাঙ্গামাটি / Rangamati": ["বাঘাইছড়ি / Bagaichhari","বরকল / Barkal","কাপ্তাই / Kaptai","রাঙ্গামাটি সদর / Rangamati Sadar","লংগদু / Langadu","নানিয়ারচর / Naniarchar","রাজস্থলী / Rajasthali"],
  "বান্দরবান / Bandarban": ["আলীকদম / Ali Kadam","বান্দরবান সদর / Bandarban Sadar","লামা / Lama","নাইক্ষ্যংছড়ি / Naikhongchhari","রোয়াংছড়ি / Rowangchhari","রুমা / Ruma","থানচি / Thanchi"],
  "ফেনী / Feni": ["ছাগলনাইয়া / Chhagalnaiya","দাগনভূঞা / Daganbhuiyan","ফেনী সদর / Feni Sadar","ফুলগাজী / Fulgazi","পরশুরাম / Parshuram","সোনাগাজী / Sonagazi"],
  "নোয়াখালী / Noakhali": ["বেগমগঞ্জ / Begumganj","চাটখিল / Chatkhil","কোম্পানীগঞ্জ / Companiganj","হাতিয়া / Hatiya","নোয়াখালী সদর / Noakhali Sadar","সেনবাগ / Senbagh","সোনাইমুড়ী / Sonaimuri","সুবর্ণচর / Subarnachar","কবিরহাট / Kabirhat"],
  "লক্ষ্মীপুর / Lakshmipur": ["কমলনগর / Kamalnagar","লক্ষ্মীপুর সদর / Lakshmipur Sadar","রামগঞ্জ / Ramganj","রামগতি / Ramgati","রায়পুর / Roypur"],
  "চাঁদপুর / Chandpur": ["চাঁদপুর সদর / Chandpur Sadar","ফরিদগঞ্জ / Faridganj","হাইমচর / Haimchar","হাজীগঞ্জ / Haziganj","কচুয়া / Kachua","মতলব দক্ষিণ / Matlab Dakshin","মতলব উত্তর / Matlab Uttar","শাহরাস্তি / Shahrasti"],
  "হবিগঞ্জ / Habiganj": ["আজমিরীগঞ্জ / Ajmiriganj","বাহুবল / Bahubal","বানিয়াচং / Baniachong","চুনারুঘাট / Chunarughat","হবিগঞ্জ সদর / Habiganj Sadar","লাখাই / Lakhai","মাধবপুর / Madhabpur","নবীগঞ্জ / Nabiganj"],
  "সুনামগঞ্জ / Sunamganj": ["বিশ্বম্ভরপুর / Bishwamvarpur","ছাতক / Chhatak","দেরাই / Derai","ধর্মপাশা / Dharamapasha","দোয়ারাবাজার / Dowarabazar","জগন্নাথপুর / Jagannathpur","জামালগঞ্জ / Jamalganj","শাল্লা / Shalla","সুনামগঞ্জ সদর / Sunamganj Sadar","তাহিরপুর / Tahirpur"],
  "মৌলভীবাজার / Moulvibazar": ["বড়লেখা / Barlekha","জুড়ী / Juri","কমলগঞ্জ / Kamalganj","কুলাউড়া / Kulaura","মৌলভীবাজার সদর / Moulvibazar Sadar","রাজনগর / Rajnagar","শ্রীমঙ্গল / Sreemangal"],
  "দিনাজপুর / Dinajpur": ["বিরামপুর / Birampur","বিরগঞ্জ / Birganj","বীরল / Biral","বোচাগঞ্জ / Bochaganj","চিরিরবন্দর / Chirirbandar","দিনাজপুর সদর / Dinajpur Sadar","ফুলবাড়ী / Fulbari","ঘোড়াঘাট / Ghoraghat","হাকিমপুর / Hakimpur","কাহারোল / Kaharole","খানসামা / Khansama","নবাবগঞ্জ / Nawabganj","পার্বতীপুর / Parbatipur"],
  "ঠাকুরগাঁও / Thakurgaon": ["বালিয়াডাঙ্গী / Baliadangi","হরিপুর / Haripur","পীরগঞ্জ / Pirganj","রাণীসংকৈল / Ranisankail","ঠাকুরগাঁও সদর / Thakurgaon Sadar"],
  "পঞ্চগড় / Panchagarh": ["আটোয়ারী / Atwari","বোদা / Boda","দেবীগঞ্জ / Debiganj","পঞ্চগড় সদর / Panchagarh Sadar","তেতুলিয়া / Tetulia"],
  "নীলফামারী / Nilphamari": ["ডিমলা / Dimla","ডোমার / Domar","জলঢাকা / Jaldhaka","কিশোরগঞ্জ / Kishoreganj","নীলফামারী সদর / Nilphamari Sadar","সৈয়দপুর / Saidpur"],
  "লালমনিরহাট / Lalmonirhat": ["আদিতমারী / Aditmari","হাতীবান্ধা / Hatibandha","কালীগঞ্জ / Kaliganj","লালমনিরহাট সদর / Lalmonirhat Sadar","পাটগ্রাম / Patgram"],
  "কুড়িগ্রাম / Kurigram": ["ভুরুঙ্গামারী / Bhurungamari","চর রাজিবপুর / Char Rajibpur","চিলমারী / Chilmari","কুড়িগ্রাম সদর / Kurigram Sadar","নাগেশ্বরী / Nageshwari","ফুলবাড়ী / Phulbari","রাজারহাট / Rajarhat","উলিপুর / Ulipur"],
  "গাইবান্ধা / Gaibandha": ["ফুলছড়ি / Fulchhari","গাইবান্ধা সদর / Gaibandha Sadar","গোবিন্দগঞ্জ / Gobindaganj","পলাশবাড়ী / Palashbari","সাদুল্লাপুর / Sadullapur","সাঘাটা / Saghata","সুন্দরগঞ্জ / Sundarganj"],
  "জয়পুরহাট / Joypurhat": ["আক্কেলপুর / Akkelpur","জয়পুরহাট সদর / Joypurhat Sadar","কালাই / Kalai","ক্ষেতলাল / Khetlal","পাঁচবিবি / Panchbibi"],
  "নওগাঁ / Naogaon": ["আত্রাই / Atrai","বদলগাছী / Badalgachhi","ধামইরহাট / Dhamoirhat","মান্দা / Manda","নওগাঁ সদর / Naogaon Sadar","নিয়ামতপুর / Niamatpur","পত্নীতলা / Patnitala","পোরশা / Porsha","রানীনগর / Raninagar","সাপাহার / Sapahar"],
  "নাটোর / Natore": ["বাগাতিপাড়া / Bagatipara","বড়াইগ্রাম / Baraigram","গুরুদাসপুর / Gurudaspur","লালপুর / Lalpur","নাটোর সদর / Natore Sadar","সিংড়া / Singra"],
  "সিরাজগঞ্জ / Sirajganj": ["বেলকুচি / Belkuchi","চৌহালি / Chauhali","কামারখন্দ / Kamarkhanda","কাজীপুর / Kazipur","রায়গঞ্জ / Raiganj","শাহজাদপুর / Shahjadpur","সিরাজগঞ্জ সদর / Sirajganj Sadar","তাড়াশ / Tarash","উল্লাপাড়া / Ullahpara"],
  "পাবনা / Pabna": ["আটঘরিয়া / Atgharia","বেড়া / Bera","ভাঙ্গুড়া / Bhangura","চাটমোহর / Chatmohar","ঈশ্বরদী / Ishwardi","পাবনা সদর / Pabna Sadar","সাঁথিয়া / Santhia","সুজানগর / Sujanagar"],
  "কুষ্টিয়া / Kushtia": ["ভেড়ামারা / Bheramara","দৌলতপুর / Daulatpur","খোকসা / Khoksa","কুমারখালী / Kumarkhali","কুষ্টিয়া সদর / Kushtia Sadar","মিরপুর / Mirpur"],
  "মেহেরপুর / Meherpur": ["গাংনী / Gangni","মেহেরপুর সদর / Meherpur Sadar","মুজিবনগর / Mujibnagar"],
  "চুয়াডাঙ্গা / Chuadanga": ["আলমডাঙ্গা / Alamdanga","চুয়াডাঙ্গা সদর / Chuadanga Sadar","দামুড়হুদা / Damurhuda","জীবননগর / Jibannagar"],
  "ঝিনাইদহ / Jhenaidah": ["হরিণাকুণ্ডু / Harinakunda","ঝিনাইদহ সদর / Jhenaidah Sadar","কালীগঞ্জ / Kaliganj","কোটচাঁদপুর / Kotchandpur","মহেশপুর / Maheshpur","শৈলকুপা / Shailkupa"],
  "মাগুরা / Magura": ["মাগুরা সদর / Magura Sadar","মোহাম্মদপুর / Mohammadpur","শালিখা / Shalikha","শ্রীপুর / Sreepur"],
  "নড়াইল / Narail": ["কালিয়া / Kalia","লোহাগড়া / Lohagara","নড়াইল সদর / Narail Sadar"],
  "সাতক্ষীরা / Satkhira": ["আশাশুনি / Assasuni","দেবহাটা / Debhata","কলারোয়া / Kalaroa","কালীগঞ্জ / Kaliganj","সাতক্ষীরা সদর / Satkhira Sadar","শ্যামনগর / Shyamnagar","তালা / Tala"],
  "বাগেরহাট / Bagerhat": ["বাগেরহাট সদর / Bagerhat Sadar","চিতলমারী / Chitalmari","ফকিরহাট / Fakirhat","কচুয়া / Kachua","মোল্লাহাট / Mollahat","মোংলা / Mongla","মোড়েলগঞ্জ / Morrelganj","রামপাল / Rampal","শরণখোলা / Sarankhola"],
  "শেরপুর / Sherpur": ["ঝিনাইগাতী / Jhenaigati","নকলা / Nakla","নালিতাবাড়ী / Nalitabari","শেরপুর সদর / Sherpur Sadar","শ্রীবরদী / Sreebardi"],
};

/* ══ Dropdown Select ══ */
function SelectField({ label, value, onChange, options, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-[11.5px] font-bold text-slate-400 uppercase tracking-[0.08em]">{label}</label>}
      <div className="relative">
        <select value={value} onChange={onChange}
          onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
          className="w-full text-[13.5px] font-medium rounded-2xl outline-none appearance-none cursor-pointer"
          style={{
            padding:"11px 36px 11px 14px",
            color: value ? "#1e293b" : "#94a3b8",
            border: focused ? "1.5px solid rgba(46,125,50,0.6)" : "1.5px solid rgba(148,163,184,0.3)",
            background: focused ? "rgba(46,125,50,0.03)" : "rgba(248,250,252,0.8)",
            boxShadow: focused ? "0 0 0 4px rgba(46,125,50,0.06)" : "inset 0 1px 2px rgba(0,0,0,0.02)",
          }}>
          <option value="">{placeholder}</option>
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"/>
      </div>
    </div>
  );
}

/* ══ INFO PANEL ══ */
function InfoPanel({ customer, t }) {
  const isOAuth     = customer?.provider === "google" || customer?.provider === "facebook";
  const hasNoPhone  = !customer?.phone;
  const [phone,     setPhone   ] = useState(customer?.phone || "");
  const [loading,   setLoading ] = useState(false);
  const [msg,       setMsg     ] = useState({ type:"", text:"" });
  const [editPhone, setEditPhone] = useState(false);

  const joinDate = customer?.createdAt
    ? new Date(customer.createdAt).toLocaleDateString("en-GB",{year:"numeric",month:"long",day:"numeric"})
    : null;

  const addr    = customer?.address || {};
  const hasAddr = addr.street || addr.thana || addr.district;

  const savePhone = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) { setMsg({type:"error",text:t("সঠিক ফোন নম্বর দিন","Enter a valid phone number")}); return; }
    try {
      setLoading(true); setMsg({type:"",text:""});
      const token = localStorage.getItem("customerToken");
      const res   = await fetch(`${API}/api/customer/profile`, {
        method:"PUT",
        headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      const info = JSON.parse(localStorage.getItem("customerInfo") || "{}");
      localStorage.setItem("customerInfo", JSON.stringify({ ...info, phone }));
      setMsg({type:"success",text:t("ফোন নম্বর সেভ হয়েছে!","Phone number saved!")});
      setEditPhone(false);
    } catch(err) { setMsg({type:"error",text:err.message}); }
    finally { setLoading(false); }
  };

  const infoRow = (label, value, Icon) => (
    <div key={label} className="flex items-start gap-3 p-3.5 rounded-xl"
      style={{background:"rgba(248,250,252,0.8)",border:"1px solid rgba(148,163,184,0.12)"}}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{background:"rgba(46,125,50,0.08)"}}>
        <Icon size={14} style={{color:"#2e7d32"}}/>
      </div>
      <div>
        <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-[14px] font-semibold text-slate-700 mt-0.5">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-[16px] font-black text-slate-800">{t("অ্যাকাউন্ট তথ্য","Account Information")}</h3>
      {isOAuth && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11.5px] font-semibold"
          style={{background:"rgba(66,133,244,0.07)",border:"1px solid rgba(66,133,244,0.2)",color:"#1565c0"}}>
          <svg width="13" height="13" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {t("Google দিয়ে লগইন করা আছেন","Signed in with Google")}
        </div>
      )}
      <div className="space-y-2.5">
        {infoRow(t("নাম","Name"), customer?.name, User)}
        {infoRow(t("ইমেইল","Email"), customer?.email, Mail)}
        {joinDate && infoRow(t("সদস্য হয়েছেন","Member since"), joinDate, Info)}
        <div className="p-3.5 rounded-xl" style={{background:"rgba(248,250,252,0.8)",border:"1px solid rgba(148,163,184,0.12)"}}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{background:"rgba(46,125,50,0.08)"}}>
              <Phone size={14} style={{color:"#2e7d32"}}/>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">{t("ফোন","Phone")}</p>
                {(isOAuth || hasNoPhone) && !editPhone && (
                  <button type="button" onClick={()=>setEditPhone(true)}
                    className="text-[11px] font-bold cursor-pointer bg-transparent border-none" style={{color:"#2e7d32"}}>
                    {customer?.phone ? t("পরিবর্তন","Edit") : t("+ যোগ করুন","+ Add")}
                  </button>
                )}
              </div>
              {!editPhone
                ? <p className="text-[14px] font-semibold text-slate-700 mt-0.5">
                    {customer?.phone || <span className="text-slate-300 font-normal">{t("যোগ করা হয়নি","Not added")}</span>}
                  </p>
                : (
                  <form onSubmit={savePhone} className="mt-2 space-y-2">
                    <AnimatePresence>{msg.text&&<InlineAlert type={msg.type} msg={msg.text}/>}</AnimatePresence>
                    <InputField icon={Phone} type="tel" value={phone}
                      onChange={e=>{setPhone(e.target.value);setMsg({type:"",text:""});}}
                      placeholder="01XXXXXXXXX" autoComplete="tel"/>
                    <div className="flex gap-2">
                      <SubmitBtn loading={loading}>
                        {loading?<><Loader2 size={13} className="animate-spin"/>{t("সেভ…","Saving…")}</>:t("সেভ","Save")}
                      </SubmitBtn>
                      <button type="button" onClick={()=>{setEditPhone(false);setMsg({type:"",text:""});}}
                        className="flex-1 py-[10px] rounded-2xl text-[13px] font-semibold cursor-pointer border-none"
                        style={{background:"#f1f5f9",color:"#64748b"}}>
                        {t("বাতিল","Cancel")}
                      </button>
                    </div>
                  </form>
                )
              }
            </div>
          </div>
        </div>
      </div>
      {hasAddr && (
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest mb-2.5" style={{color:"#2e7d32"}}>
            {t("সেভ করা ঠিকানা","Saved Address")}
          </p>
          <div className="p-3.5 rounded-xl space-y-2"
            style={{background:"rgba(248,250,252,0.8)",border:"1px solid rgba(148,163,184,0.12)"}}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{background:"rgba(46,125,50,0.08)"}}>
                <MapPin size={14} style={{color:"#2e7d32"}}/>
              </div>
              <div className="space-y-1">
                {addr.street && (
                  <div>
                    <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">{t("পুরো ঠিকানা","Full Address")}</p>
                    <p className="text-[13.5px] font-semibold text-slate-700">{addr.street}</p>
                  </div>
                )}
                <div className="flex gap-4 flex-wrap">
                  {addr.thana && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("উপজেলা","Upazila")}</p>
                      <p className="text-[13px] font-semibold text-slate-700">{addr.thana}</p>
                    </div>
                  )}
                  {addr.district && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("জেলা","District")}</p>
                      <p className="text-[13px] font-semibold text-slate-700">{addr.district}</p>
                    </div>
                  )}
                </div>
                {addr.phone && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("ডেলিভারি ফোন","Delivery Phone")}</p>
                    <p className="text-[13px] font-semibold text-slate-700">{addr.phone}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {!hasAddr && (
        <p className="text-[12px] text-slate-400 text-center py-2">
          {t("এখনো কোনো ঠিকানা সেভ করা হয়নি","No address saved yet")}
          {" · "}
          <span className="font-semibold" style={{color:"#2e7d32"}}>{t("ঠিকানা ট্যাবে যান","Go to Address tab")}</span>
        </p>
      )}
    </div>
  );
}

/* ══ ADDRESS PANEL ══ */
function AddressPanel({ customer, t, onSaved }) {
  const saved      = customer?.address || {};
  const hasPhone   = !!customer?.phone;

  const [street,   setStreet  ] = useState(saved.street   || "");
  const [district, setDistrict] = useState(saved.district || "");
  const [upazila,  setUpazila ] = useState(saved.thana    || "");
  const [phone,    setPhone   ] = useState(saved.phone    || "");
  const [loading,  setLoading ] = useState(false);
  const [msg,      setMsg     ] = useState({ type:"", text:"" });

  const districts = Object.keys(BD_LOCATIONS).filter(d => !d.includes("(alt)"));
  const upazilas  = district ? (BD_LOCATIONS[district] || []) : [];

  const handleDistrictChange = (e) => { setDistrict(e.target.value); setUpazila(""); };

  const hasAddress = saved.street || saved.thana || saved.district;

  const submit = async (e) => {
    e.preventDefault();
    if (!street)   { setMsg({ type:"error", text:t("পুরো ঠিকানা দিন","Enter full address") }); return; }
    if (!district) { setMsg({ type:"error", text:t("জেলা বেছে নিন","Select a district") }); return; }
    if (!upazila)  { setMsg({ type:"error", text:t("উপজেলা বেছে নিন","Select an upazila") }); return; }
    try {
      setLoading(true); setMsg({ type:"", text:"" });
      const token = localStorage.getItem("customerToken");
      const body  = { street, thana: upazila, district };
      if (!hasPhone) body.phone = phone;
      const res  = await fetch(`${API}/api/customer/address`, {
        method:"PUT", headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      try {
        const info = JSON.parse(localStorage.getItem("customerInfo") || "{}");
        localStorage.setItem("customerInfo", JSON.stringify({ ...info, address: data.address }));
      } catch {}
      onSaved?.(data.address);
      setMsg({ type:"success", text:t("ঠিকানা সেভ হয়েছে!","Address saved!") });
    } catch(err) { setMsg({ type:"error", text:err.message }); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-[16px] font-black text-slate-800">{t("ম্যানেজ এড্রেস","Manage Address")}</h3>
      {hasAddress && (
        <div className="p-4 rounded-2xl" style={{ background:"#f0f7f0", border:"1px solid #a5d6a7" }}>
          <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color:"#2e7d32" }}>
            {t("বর্তমান ঠিকানা","Current Address")}
          </p>
          <p className="text-[13px] font-semibold text-slate-700 leading-relaxed">
            {[saved.street, saved.thana, saved.district].filter(Boolean).join(", ")}
          </p>
          {saved.phone && <p className="text-[11.5px] text-slate-500 mt-1.5">📞 {saved.phone}</p>}
        </div>
      )}
      <AnimatePresence>{msg.text && <InlineAlert type={msg.type} msg={msg.text}/>}</AnimatePresence>
      <form onSubmit={submit} className="space-y-3.5">
        <FieldWrap label={t("পুরো ঠিকানা","Full Address")}>
          <InputField icon={MapPin} value={street} onChange={e=>setStreet(e.target.value)}
            placeholder={t("বাড়ি/রাস্তা নম্বর, এলাকার নাম","House/Road no., Area name")}/>
        </FieldWrap>
        <SelectField
          label={t("জেলা","District")}
          value={district}
          onChange={handleDistrictChange}
          options={districts}
          placeholder={t("জেলা বেছে নিন","Select district")}
        />
        <SelectField
          label={t("উপজেলা / থানা","Upazila / Thana")}
          value={upazila}
          onChange={e=>setUpazila(e.target.value)}
          options={upazilas}
          placeholder={district ? t("উপজেলা বেছে নিন","Select upazila") : t("আগে জেলা বেছে নিন","Select district first")}
        />
        {!hasPhone && (
          <FieldWrap label={t("ডেলিভারি ফোন","Delivery Phone")}>
            <InputField icon={Phone} type="tel" value={phone}
              onChange={e=>setPhone(e.target.value)} placeholder="01XXXXXXXXX"/>
          </FieldWrap>
        )}
        <SubmitBtn loading={loading}>
          {loading
            ? <><Loader2 size={14} className="animate-spin"/>{t("সেভ হচ্ছে…","Saving…")}</>
            : t("ঠিকানা সেভ করুন","Save Address")}
        </SubmitBtn>
      </form>
    </div>
  );
}

/* ══ PROFILE SIDEBAR ══ */
function ProfileSidebar({ customer, onClose, onLogout, onAddressSaved, t }) {
  const [activeTab, setActiveTab] = useState("info");
  const [loading,   setLoading  ] = useState(false);
  const [msg,       setMsg      ] = useState({ type:"", text:"" });
  const [curPass,   setCurPass  ] = useState("");
  const [newPass,   setNewPass  ] = useState("");
  const [confPass,  setConfPass ] = useState("");
  const [showCur,   setShowCur  ] = useState(false);
  const [showNew,   setShowNew  ] = useState(false);

  const { cartItems, cartCount, cartSubtotal, cartTotal, deliveryCharge,
          addToCart, removeFromCart, updateQuantity } = useCart();

  const [orders,        setOrders       ] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersFetched, setOrdersFetched] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [wishlist,       setWishlist      ] = useState([]);
  const [wishlistLoading,setWishlistLoading] = useState(false);
  const [wishlistFetched,setWishlistFetched] = useState(false);

  const [openFaq, setOpenFaq] = useState(null);

  const joinDate = customer?.createdAt
    ? new Date(customer.createdAt).toLocaleDateString("en-GB",{year:"numeric",month:"long",day:"numeric"})
    : null;

  useEffect(() => {
    if (activeTab !== "orders" || ordersFetched) return;
    setOrdersLoading(true);
    const token = localStorage.getItem("customerToken");
    const q = customer?.phone
      ? `phone=${encodeURIComponent(customer.phone)}`
      : `email=${encodeURIComponent(customer?.email||"")}`;
    fetch(`${API}/api/orders/track?${q}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r=>r.json())
      .then(json => { setOrders(json.success ? json.data : (Array.isArray(json)?json:(json.orders||[]))); })
      .catch(()=>setOrders([]))
      .finally(()=>{ setOrdersLoading(false); setOrdersFetched(true); });
  }, [activeTab, ordersFetched, customer]);

  useEffect(() => {
    if (activeTab !== "wishlist" || wishlistFetched) return;
    setWishlistLoading(true);
    const token = localStorage.getItem("customerToken");
    fetch(`${API}/api/customer/wishlist`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r=>r.json())
      .then(data=>setWishlist(data.wishlist||[]))
      .catch(()=>setWishlist([]))
      .finally(()=>{ setWishlistLoading(false); setWishlistFetched(true); });
  }, [activeTab, wishlistFetched]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!curPass||!newPass||!confPass) { setMsg({type:"error",text:t("সব ঘর পূরণ করুন","Fill all fields")}); return; }
    if (newPass.length<6)             { setMsg({type:"error",text:t("কমপক্ষে ৬ অক্ষর","Min. 6 characters")}); return; }
    if (newPass!==confPass)           { setMsg({type:"error",text:t("পাসওয়ার্ড মেলেনি","Passwords don't match")}); return; }
    try {
      setLoading(true); setMsg({type:"",text:""});
      const token = localStorage.getItem("customerToken");
      const res   = await fetch(`${API}/api/customer/change-password`,{
        method:"PUT", headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({currentPassword:curPass,newPassword:newPass}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMsg({type:"success",text:t("পাসওয়ার্ড পরিবর্তন হয়েছে!","Password updated!")});
      setCurPass(""); setNewPass(""); setConfPass("");
    } catch(err) { setMsg({type:"error",text:err.message}); }
    finally { setLoading(false); }
  };

  const tabs = [
    { id:"info",     icon:Info,         label:t("আমার তথ্য","My Info")      },
    { id:"orders",   icon:Package,      label:t("অর্ডারস","Orders")         },
    { id:"wishlist", icon:Heart,        label:t("উইশলিস্ট","Wishlist")      },
    { id:"cart",     icon:ShoppingCart, label:t("আমার কার্ট","My Cart")     },
    { id:"address",  icon:MapPin,       label:t("ঠিকানা","Address")         },
    { id:"password", icon:Shield,       label:t("পাসওয়ার্ড","Password")     },
    { id:"faq",      icon:HelpCircle,   label:t("FAQs","FAQs")              },
  ];

  const renderContent = () => {
    switch(activeTab) {
      case "info":
        return <InfoPanel customer={customer} t={t} />;

      case "orders":
        return (
          <div className="space-y-4">
            <h3 className="text-[16px] font-black text-slate-800">{t("আমার অর্ডারস","My Orders")}</h3>
            {ordersLoading && (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-2 border-slate-100 border-t-emerald-500 rounded-full animate-spin"/>
              </div>
            )}
            {!ordersLoading && orders.length === 0 && (
              <div className="text-center py-10 space-y-2">
                <div className="text-4xl">📦</div>
                <p className="text-[14px] font-bold text-slate-500">{t("কোনো অর্ডার নেই","No orders yet")}</p>
              </div>
            )}
            {!ordersLoading && orders.length > 0 && (
              <div className="space-y-3">
                {orders.map((order,i)=>{
                  const cfg = getStatusCfg(order.status);
                  const isOpen = expandedOrder === i;
                  const isCancelled = order.status === "cancelled";
                  const isDelivered = order.status === "delivered";
                  const canDelete   = isCancelled || isDelivered;
                  const date = order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})
                    : "—";
                  const qty = order.items?.reduce((s,x)=>s+(x.quantity||1),0)||0;
                  return (
                    <div key={order._id||i} className="rounded-2xl overflow-hidden"
                      style={{border:`1px solid ${cfg.border}`,background:isCancelled?"linear-gradient(135deg,#1a0a0a,#2d0f0f)":"#fff"}}>
                      <div className="h-[3px]" style={{background:`linear-gradient(90deg,${cfg.color},${cfg.color}88)`}}/>
                      <div className="flex items-start justify-between gap-2 px-4 py-3">
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={()=>setExpandedOrder(isOpen?null:i)}>
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className="text-[13px] font-bold truncate" style={{color:isCancelled?"#fff":"#1e293b"}}>
                              {order.orderId||`#${String(order._id).slice(-6).toUpperCase()}`}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                              style={{background:isCancelled?"rgba(239,68,68,0.2)":cfg.bg,color:cfg.color,border:`1px solid ${cfg.border}`}}>
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-[11px]" style={{color:isCancelled?"rgba(255,255,255,0.4)":"#94a3b8"}}>
                            {date} · {qty} {t("টি","items")}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <div className="text-right cursor-pointer" onClick={()=>setExpandedOrder(isOpen?null:i)}>
                            <p className="text-[15px] font-black" style={{color:isCancelled?"#fff":"#0f172a"}}>
                              ৳{(order.total||0).toLocaleString()}
                            </p>
                            <motion.div animate={{rotate:isOpen?180:0}} transition={{duration:0.22}}
                              className="w-5 h-5 rounded-lg flex items-center justify-center ml-auto mt-1"
                              style={{background:isCancelled?"rgba(255,255,255,0.1)":"#f1f5f9"}}>
                              <ChevronDown size={12} style={{color:isCancelled?"rgba(255,255,255,0.5)":"#94a3b8"}}/>
                            </motion.div>
                          </div>
                          {canDelete && (
                            <button
                              onClick={() => setConfirmDelete({ id: order._id, orderId: order.orderId||`#${String(order._id).slice(-6).toUpperCase()}`, isCancelled })}
                              className="w-7 h-7 rounded-xl flex items-center justify-center transition-all hover:scale-110 flex-shrink-0 border-none cursor-pointer"
                              style={{background:isCancelled?"rgba(239,68,68,0.2)":"rgba(220,38,38,0.08)",border:`1px solid ${isCancelled?"rgba(239,68,68,0.35)":"rgba(220,38,38,0.15)"}`}}
                              title={t("তালিকা থেকে সরান","Remove from list")}>
                              <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                                <path d="M2 3.5h10M5.5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M6 6.5v4M8 6.5v4M3 3.5l.7 7.2A1 1 0 004.7 12h4.6a1 1 0 001-.8L11 3.5"
                                  stroke={isCancelled?"#fca5a5":"#dc2626"} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                      {!isCancelled && <div className="px-4 pb-2"><MiniTimeline status={order.status}/></div>}
                      {order.status==="delivered" && (
                        <div className="mx-4 mb-3 px-3 py-2 rounded-xl flex items-center gap-2"
                          style={{background:"#ecfdf5",border:"1px solid #a7f3d0"}}>
                          <CheckCircle size={12} className="text-emerald-500 shrink-0"/>
                          <p className="text-[11px] font-semibold text-emerald-700">{t("🎉 অর্ডার পৌঁছে গেছে!","🎉 Order delivered!")}</p>
                        </div>
                      )}
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}}
                            exit={{height:0,opacity:0}} transition={{duration:0.25}} className="overflow-hidden">
                            <div className="px-4 pb-4 space-y-3"
                              style={{borderTop:`1px solid ${isCancelled?"rgba(255,255,255,0.06)":"#f1f5f9"}`}}>
                              {order.items?.length>0 && (
                                <div className="space-y-2 pt-3">
                                  {order.items.map((item,j)=>(
                                    <div key={j} className="flex items-center gap-2.5 p-2.5 rounded-xl"
                                      style={{background:isCancelled?"rgba(255,255,255,0.05)":"#f8fafc",border:`1px solid ${isCancelled?"rgba(255,255,255,0.08)":"#f1f5f9"}`}}>
                                      <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"
                                        style={{background:isCancelled?"rgba(255,255,255,0.1)":"#fff",border:`1px solid ${isCancelled?"rgba(255,255,255,0.1)":"#e2e8f0"}`}}>
                                        {item.image
                                          ? <img src={item.image} alt={item.name} className="w-full h-full object-contain p-0.5"/>
                                          : <div className="w-full h-full flex items-center justify-center"><Package size={12} style={{color:isCancelled?"rgba(255,255,255,0.2)":"#e2e8f0"}}/></div>}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[12px] font-semibold truncate" style={{color:isCancelled?"rgba(255,255,255,0.75)":"#334155"}}>{item.name}</p>
                                        <p className="text-[10.5px]" style={{color:isCancelled?"rgba(255,255,255,0.35)":"#94a3b8"}}>
                                          ৳{(item.salePrice||item.price||0).toLocaleString()} × {item.quantity}
                                        </p>
                                      </div>
                                      <p className="text-[12px] font-bold flex-shrink-0" style={{color:isCancelled?"rgba(255,255,255,0.6)":"#0f172a"}}>
                                        ৳{((item.salePrice||item.price||0)*(item.quantity||1)).toLocaleString()}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className="rounded-xl p-3 space-y-1.5"
                                style={{background:isCancelled?"rgba(255,255,255,0.04)":"#f8fafc",border:`1px solid ${isCancelled?"rgba(255,255,255,0.06)":"#f1f5f9"}`}}>
                                <div className="flex justify-between text-[11px]" style={{color:isCancelled?"rgba(255,255,255,0.4)":"#94a3b8"}}>
                                  <span>{t("সাবটোটাল","Subtotal")}</span><span>৳{(order.subtotal||0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-[11px]" style={{color:isCancelled?"rgba(255,255,255,0.4)":"#94a3b8"}}>
                                  <span>{t("ডেলিভারি","Delivery")}</span>
                                  <span style={{color:order.deliveryCharge===0?"#059669":undefined}}>
                                    {order.deliveryCharge===0?t("বিনামূল্যে","Free"):`৳${order.deliveryCharge}`}
                                  </span>
                                </div>
                                <div className="h-px" style={{background:isCancelled?"rgba(255,255,255,0.06)":"#e2e8f0"}}/>
                                <div className="flex justify-between text-[13px] font-bold" style={{color:isCancelled?"rgba(255,255,255,0.7)":"#0f172a"}}>
                                  <span>{t("সর্বমোট","Total")}</span><span>৳{(order.total||0).toLocaleString()}</span>
                                </div>
                              </div>
                              {order.customer && (
                                <div className="rounded-xl p-3 space-y-1"
                                  style={{background:isCancelled?"rgba(255,255,255,0.04)":"#f8fafc",border:`1px solid ${isCancelled?"rgba(255,255,255,0.06)":"#f1f5f9"}`}}>
                                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{color:isCancelled?"rgba(255,255,255,0.25)":"#cbd5e1"}}>{t("ডেলিভারি","Delivery")}</p>
                                  <p className="text-[12px] font-semibold" style={{color:isCancelled?"rgba(255,255,255,0.7)":"#334155"}}>{order.customer.name}</p>
                                  <p className="text-[11px]" style={{color:isCancelled?"rgba(255,255,255,0.4)":"#94a3b8"}}>{order.customer.phone}</p>
                                  <p className="text-[11px]" style={{color:isCancelled?"rgba(255,255,255,0.4)":"#94a3b8"}}>
                                    {[order.customer.address,order.customer.thana,order.customer.district].filter(Boolean).join(", ")}
                                  </p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case "wishlist":
        return (
          <div className="space-y-4">
            <h3 className="text-[16px] font-black text-slate-800">{t("উইশলিস্ট","Wishlist")}</h3>
            {wishlistLoading && (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-2 border-slate-100 border-t-red-400 rounded-full animate-spin"/>
              </div>
            )}
            {!wishlistLoading && wishlist.length === 0 && (
              <div className="text-center py-10 space-y-2">
                <div className="text-4xl">🤍</div>
                <p className="text-[14px] font-bold text-slate-500">{t("উইশলিস্ট খালি","Wishlist is empty")}</p>
              </div>
            )}
            {!wishlistLoading && wishlist.length > 0 && (
              <div className="space-y-2.5">
                {wishlist.map((item,i)=>(
                  <Link key={item._id||i} to={`/product/${item.slug||item._id}`} onClick={onClose}
                    className="no-underline block group">
                    <motion.div whileHover={{scale:1.01}} whileTap={{scale:0.98}}
                      className="flex items-center gap-3 p-3 rounded-2xl transition-all"
                      style={{background:"#f8fafc",border:"1.5px solid #e2e8f0"}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor="#a7f3d0";e.currentTarget.style.background="#f0fdf4";}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor="#e2e8f0";e.currentTarget.style.background="#f8fafc";}}>
                      <div className="w-[52px] h-[52px] rounded-xl overflow-hidden flex-shrink-0 bg-white" style={{border:"1.5px solid #e2e8f0"}}>
                        {item.image
                          ? <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1"/>
                          : <div className="w-full h-full flex items-center justify-center"><Package size={18} className="text-slate-200"/></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-slate-800 truncate group-hover:text-emerald-700 transition-colors">{item.name||t("পণ্য","Product")}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.price&&item.salePrice&&item.salePrice<item.price&&(
                            <span className="text-[11px] text-slate-400 line-through">৳{item.price.toLocaleString()}</span>
                          )}
                          <span className="text-[13px] font-black" style={{color:"#059669"}}>৳{(item.salePrice||item.price||0).toLocaleString()}</span>
                          {item.price&&item.salePrice&&item.salePrice<item.price&&(
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-50 text-red-500">
                              -{Math.round((1-item.salePrice/item.price)*100)}%
                            </span>
                          )}
                        </div>
                        {item.stock===0&&<span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full mt-1 inline-block">{t("স্টক নেই","Out of Stock")}</span>}
                      </div>
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:"#ecfdf5",border:"1px solid #a7f3d0"}}>
                        <ChevronRight size={13} style={{color:"#059669"}}/>
                      </div>
                    </motion.div>
                  </Link>
                ))}
                <p className="text-[11px] text-slate-400 text-center pt-1">{wishlist.length} {t("টি পণ্য","items saved")}</p>
              </div>
            )}
          </div>
        );

      case "cart":
        return (
          <div className="space-y-4">
            <h3 className="text-[16px] font-black text-slate-800">{t("আমার কার্ট","My Cart")}</h3>
            {cartItems.length === 0 && (
              <div className="text-center py-10 space-y-2">
                <div className="text-4xl">🛒</div>
                <p className="text-[14px] font-bold text-slate-500">{t("কার্ট খালি","Cart is empty")}</p>
                <p className="text-[12px] text-slate-400">{t("পণ্য যোগ করুন","Add products to cart")}</p>
              </div>
            )}
            {cartItems.length > 0 && (
              <>
                <div className="space-y-2.5">
                  {cartItems.map((item,i)=>(
                    <motion.div key={item._id||i} whileHover={{scale:1.005}}
                      className="flex items-center gap-3 p-3 rounded-2xl"
                      style={{background:"#f8fafc",border:"1.5px solid #e2e8f0"}}>
                      <Link to={`/product/${item.slug||item._id}`} onClick={onClose} className="no-underline flex-shrink-0">
                        <div className="w-[52px] h-[52px] rounded-xl overflow-hidden bg-white" style={{border:"1.5px solid #e2e8f0"}}>
                          {item.image
                            ? <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1"/>
                            : <div className="w-full h-full flex items-center justify-center"><Package size={18} className="text-slate-200"/></div>}
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.slug||item._id}`} onClick={onClose} className="no-underline">
                          <p className="text-[13px] font-bold text-slate-800 truncate hover:text-emerald-700 transition-colors">{item.name}</p>
                        </Link>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {item.price > item.salePrice && (
                            <span className="text-[11px] text-slate-400 line-through">৳{item.price.toLocaleString()}</span>
                          )}
                          <span className="text-[13px] font-black" style={{color:"#059669"}}>৳{item.salePrice.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex items-center rounded-xl overflow-hidden" style={{border:"1.5px solid #e2e8f0"}}>
                            <button onClick={()=> item.quantity === 1 ? removeFromCart(item._id) : updateQuantity(item._id, item.quantity-1)}
                              className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer border-none bg-white text-[16px] font-bold">
                              {item.quantity === 1 ? "×" : "−"}
                            </button>
                            <span className="px-2.5 text-[13px] font-bold text-slate-700 bg-white">{item.quantity}</span>
                            <button onClick={()=>updateQuantity(item._id, item.quantity+1)}
                              className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors cursor-pointer border-none bg-white text-[16px] font-bold">
                              +
                            </button>
                          </div>
                          <span className="text-[12px] font-bold text-slate-500">
                            = ৳{(item.salePrice * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="rounded-2xl p-4 space-y-2" style={{background:"#f0f7f0",border:"1px solid #a5d6a7"}}>
                  <div className="flex justify-between text-[12px] text-slate-500">
                    <span>{t("সাবটোটাল","Subtotal")} ({cartCount} {t("টি","items")})</span>
                    <span>৳{cartSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[12px] text-slate-500">
                    <span>{t("ডেলিভারি","Delivery")}</span>
                    <span style={{color: deliveryCharge===0?"#059669":undefined}}>
                      {deliveryCharge===0 ? t("বিনামূল্যে 🎉","Free 🎉") : `৳${deliveryCharge}`}
                    </span>
                  </div>
                  <div className="h-px" style={{background:"#a5d6a7"}}/>
                  <div className="flex justify-between text-[14px] font-black" style={{color:"#1a2e1a"}}>
                    <span>{t("সর্বমোট","Total")}</span>
                    <span>৳{cartTotal.toLocaleString()}</span>
                  </div>
                </div>
                <Link to="/checkout" onClick={onClose} className="no-underline block">
                  <motion.div whileHover={{scale:1.01}} whileTap={{scale:0.98}}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[14px] font-black text-white"
                    style={{background:"linear-gradient(135deg,#1a3a1a,#2e7d32)",boxShadow:"0 4px 20px rgba(46,125,50,0.3)"}}>
                    <ShoppingCart size={16}/>
                    {t("চেকআউট করুন","Proceed to Checkout")}
                  </motion.div>
                </Link>
              </>
            )}
          </div>
        );

      case "address":
        return <AddressPanel customer={customer} t={t} onSaved={onAddressSaved} />;

      case "password":
        return (
          <div className="space-y-4">
            <h3 className="text-[16px] font-black text-slate-800">{t("পাসওয়ার্ড পরিবর্তন","Change Password")}</h3>
            <AnimatePresence>{msg.text && <InlineAlert type={msg.type} msg={msg.text}/>}</AnimatePresence>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <FieldWrap label={t("বর্তমান পাসওয়ার্ড","Current Password")}>
                <InputField icon={Lock} type={showCur?"text":"password"} value={curPass}
                  onChange={e=>setCurPass(e.target.value)} placeholder="••••••••"
                  rightEl={<EyeToggle show={showCur} onToggle={()=>setShowCur(s=>!s)}/>}/>
              </FieldWrap>
              <FieldWrap label={t("নতুন পাসওয়ার্ড","New Password")}>
                <InputField icon={Lock} type={showNew?"text":"password"} value={newPass}
                  onChange={e=>setNewPass(e.target.value)} placeholder={t("কমপক্ষে ৬ অক্ষর","At least 6 characters")}
                  rightEl={<EyeToggle show={showNew} onToggle={()=>setShowNew(s=>!s)}/>}/>
              </FieldWrap>
              <FieldWrap label={t("পাসওয়ার্ড নিশ্চিত","Confirm Password")}>
                <InputField icon={Lock} type="password" value={confPass} onChange={e=>setConfPass(e.target.value)} placeholder="••••••••"/>
              </FieldWrap>
              <SubmitBtn loading={loading}>
                {loading?<><Loader2 size={14} className="animate-spin"/>{t("আপডেট হচ্ছে…","Updating…")}</>:t("পাসওয়ার্ড আপডেট করুন","Update Password")}
              </SubmitBtn>
            </form>
          </div>
        );

      case "faq":
        return (
          <div className="space-y-5">
            <h3 className="text-[16px] font-black text-slate-800">{t("সাধারণ জিজ্ঞাসা","FAQs")}</h3>
            {FAQ_SECTIONS.map((sec,si)=>(
              <div key={si} className="rounded-2xl overflow-hidden shadow-sm" style={{background:"#fff",border:"1px solid #f1f5f9"}}>
                <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-50" style={{background:"#d9770614"}}>
                  <span className="text-[10px] font-black uppercase tracking-widest flex-shrink-0" style={{color:"#d9770688"}}>{sec.tag}</span>
                  <h4 className="text-sm font-bold text-slate-800">{t(sec.titleBn,sec.titleEn)}</h4>
                </div>
                <div className="px-4 py-4 space-y-2.5">
                  {sec.faqs.map((faq,fi)=>{
                    const key = `${si}-${fi}`;
                    const isOpen = openFaq === key;
                    return (
                      <div key={fi} className="rounded-2xl overflow-hidden border transition-all duration-200"
                        style={{borderColor:isOpen?"#d9770644":"#f1f5f9",background:isOpen?"#d9770614":"#fafafa"}}>
                        <button onClick={()=>setOpenFaq(isOpen?null:key)}
                          className="w-full flex items-center justify-between px-4 py-3.5 text-left gap-3" type="button">
                          <p className="text-sm font-semibold leading-snug" style={{color:"#1e293b"}}>{t(faq.qBn,faq.qEn)}</p>
                          <motion.div animate={{rotate:isOpen?180:0}} transition={{duration:0.2}} className="flex-shrink-0">
                            <ChevronDown size={15} style={{color:"#d97706"}}/>
                          </motion.div>
                        </button>
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}}
                              exit={{height:0,opacity:0}} transition={{duration:0.25,ease:[0.4,0,0.2,1]}}>
                              <p className="px-4 pb-4 text-sm leading-relaxed" style={{color:"#475569",borderTop:"1px solid #f1f5f9"}}>
                                <span className="block pt-3">{t(faq.aBn,faq.aEn)}</span>
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );

      default: return null;
    }
  };

  return (
    <>
    <AnimatePresence>
      <motion.div key="backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        className="fixed inset-0 z-40" style={{background:"rgba(0,0,0,0.35)",backdropFilter:"blur(4px)"}}
        onClick={onClose}/>
      <motion.div key="panel"
        initial={{x:"100%",opacity:0}} animate={{x:0,opacity:1,transition:{duration:0.32,ease:[0.22,1,0.36,1]}}}
        exit={{x:"100%",opacity:0,transition:{duration:0.24,ease:[0.4,0,1,1]}}}
        className="fixed right-0 top-0 h-full z-50 flex" style={{width:"520px"}}>

        <div className="w-[180px] flex flex-col shrink-0 h-full"
          style={{background:"linear-gradient(180deg,#1a2e1a 0%,#1e3620 100%)"}}>
          <div className="px-4 py-5 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center" style={{background:"rgba(255,255,255,0.12)"}}>
                <ShoppingBag size={14} color="#a5d6a7"/>
              </div>
              <div><p className="text-white text-[12px] font-black">Nahid</p><p className="text-white/40 text-[10px]">Account</p></div>
            </div>
          </div>
          <div className="px-4 py-5 border-b border-white/10">
            <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center text-white text-[18px] font-black mb-2.5"
              style={{background:"rgba(255,255,255,0.12)",border:"2px solid rgba(255,255,255,0.15)"}}>
              {customer?.avatar?<img src={customer.avatar} alt="" className="w-full h-full object-cover"/>:(customer?.name?.[0]||"U").toUpperCase()}
            </div>
            <p className="text-white text-[12.5px] font-bold truncate leading-tight">{customer?.name}</p>
            <p className="text-white/40 text-[10.5px] truncate mt-0.5">{customer?.email}</p>
          </div>
          <div className="flex-1 py-3 overflow-y-auto">
            {tabs.map(({id,icon:Icon,label})=>(
              <button key={id} onClick={()=>setActiveTab(id)}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-left transition-all border-none cursor-pointer relative"
                style={{background:activeTab===id?"rgba(255,255,255,0.1)":"transparent",color:activeTab===id?"#a5d6a7":"rgba(255,255,255,0.45)"}}>
                {activeTab===id&&(
                  <motion.div layoutId="sidebar-tab" className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full" style={{background:"#4caf50"}}/>
                )}
                <Icon size={15}/><span className="text-[12px] font-semibold">{label}</span>
              </button>
            ))}
          </div>
          <div className="px-3 py-4 border-t border-white/10">
            <button onClick={onLogout}
              className="w-full flex items-center gap-2 py-2.5 px-3 rounded-xl text-[12px] font-bold cursor-pointer border-none transition-all"
              style={{background:"rgba(220,38,38,0.15)",color:"#f87171"}}>
              <LogOut size={14}/>{t("সাইন আউট","Sign Out")}
            </button>
          </div>
        </div>

        <div className="flex-1 h-full overflow-y-auto bg-white relative">
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer border-none z-10"
            style={{background:"rgba(148,163,184,0.1)",color:"#94a3b8"}}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <div className="p-7 pt-8">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab}
                initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
                exit={{opacity:0,y:-8}} transition={{duration:0.2}}>
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>

    <AnimatePresence>
      {confirmDelete && (
        <>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-[9998]" style={{background:"rgba(0,0,0,0.55)",backdropFilter:"blur(3px)"}}
            onClick={()=>!deleteLoading&&setConfirmDelete(null)}/>
          <motion.div
            initial={{opacity:0,scale:0.9,y:24}} animate={{opacity:1,scale:1,y:0}}
            exit={{opacity:0,scale:0.9,y:24}} transition={{type:"spring",stiffness:320,damping:28}}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[290px] bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="h-1 w-full" style={{background:"linear-gradient(90deg,#dc2626,#ef4444)"}}/>
            <div className="p-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{background:"#fff1f2",border:"1px solid #fecdd3"}}>
                <svg width="26" height="26" viewBox="0 0 14 14" fill="none">
                  <path d="M2 3.5h10M5.5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M6 6.5v4M8 6.5v4M3 3.5l.7 7.2A1 1 0 004.7 12h4.6a1 1 0 001-.8L11 3.5"
                    stroke="#dc2626" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-[16px] font-black text-slate-800 text-center mb-1">
                {t("তালিকা থেকে সরাবেন?","Remove from list?")}
              </h3>
              <p className="text-[12px] font-bold text-slate-400 text-center mb-1">{confirmDelete.orderId}</p>
              <p className="text-[11.5px] text-slate-400 text-center mb-5 leading-relaxed">
                {t("অর্ডারটি আপনার তালিকা থেকে লুকানো হবে।","This order will be hidden from your list.")}<br/>
                <span className="font-semibold" style={{color:"#059669"}}>
                  {t("ডেটাবেজ থেকে মুছবে না।","Won't be deleted from database.")}
                </span>
              </p>
              <div className="flex gap-2.5">
                <button onClick={()=>!deleteLoading&&setConfirmDelete(null)} disabled={deleteLoading}
                  className="flex-1 py-2.5 rounded-2xl text-[13.5px] font-semibold text-slate-600 cursor-pointer border-none transition-all disabled:opacity-40"
                  style={{background:"#f1f5f9"}}>
                  {t("থাকুক","Keep It")}
                </button>
                <button disabled={deleteLoading}
                  onClick={async () => {
                    setDeleteLoading(true);
                    try {
                      const token = localStorage.getItem("customerToken");
                      await fetch(`${API}/api/orders/${confirmDelete.id}/hide`, {
                        method:"PUT", headers:{ Authorization:`Bearer ${token}` },
                      });
                    } catch {}
                    setOrders(prev => prev.filter(o => o._id !== confirmDelete.id));
                    setOrdersFetched(false);
                    setDeleteLoading(false);
                    setConfirmDelete(null);
                  }}
                  className="flex-1 py-2.5 rounded-2xl text-[13.5px] font-semibold text-white cursor-pointer border-none flex items-center justify-center gap-2 transition-all"
                  style={{background:"#dc2626",opacity:deleteLoading?0.6:1}}>
                  {deleteLoading
                    ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>
                    : <>{t("লুকান","Hide")}</>
                  }
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}

/* ══ LANGUAGE SWITCHER ══ */
function LangSwitcher() {
  const { lang, toggleLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(()=>{
    const h=(e)=>{if(!ref.current?.contains(e.target))setOpen(false);};
    document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h);
  },[]);
  const options=[{code:"bn",label:"বাংলা"},{code:"en",label:"English"}];
  const current=options.find(o=>o.code===lang);
  return (
    <div className="relative" ref={ref}>
      <button onClick={()=>setOpen(p=>!p)} className="flex items-center gap-1.5 text-gray-600 hover:text-[#2e7d32] transition-colors text-[13px]">
        <Globe size={18} strokeWidth={1.7}/>
        <span className="hidden lg:inline font-medium">{current?.label}</span>
        <ChevronDown size={11} strokeWidth={2.5} className={`hidden lg:inline opacity-50 transition-transform ${open?"rotate-180":""}`}/>
      </button>
      <AnimatePresence>
        {open&&(
          <motion.div initial={{opacity:0,y:-6,scale:0.97}} animate={{opacity:1,y:0,scale:1}}
            exit={{opacity:0,y:-6,scale:0.97}} transition={{duration:0.14}}
            className="absolute right-0 top-full mt-2 w-36 bg-white border border-gray-100 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden z-[9999]">
            {options.map(opt=>(
              <button key={opt.code} onClick={()=>{toggleLang(opt.code);setOpen(false);}}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors ${lang===opt.code?"bg-[#f0f7f0] text-[#1a2e1a] font-semibold":"text-gray-600 hover:bg-[#f5f5f3]"}`}>
                {opt.label}{lang===opt.code&&<span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#2e7d32]"/>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══ SEARCH BOX ══ */
function SearchBox({ onClose }) {
  const navigate=useNavigate(); const t=useT();
  const [query,setQuery]=useState(""); const [results,setResults]=useState([]); const [status,setStatus]=useState("idle");
  const [open,setOpen]=useState(false); const [recent,setRecent]=useState(getRecent);
  const inputRef=useRef(null); const wrapRef=useRef(null); const timer=useRef(null);
  useEffect(()=>{const h=(e)=>{if(!wrapRef.current?.contains(e.target))setOpen(false);};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);
  const doSearch=async(q)=>{const term=q.trim();if(!term||term.length<2){setStatus("idle");setResults([]);return;}setStatus("loading");try{const res=await fetch(`${API}/api/search?q=${encodeURIComponent(term)}`);const json=await res.json();if(json.success&&json.data.length>0){setResults(json.data);setStatus("found");}else{setResults([]);setStatus("empty");}}catch{setResults([]);setStatus("empty");}};
  const handleChange=(e)=>{const val=e.target.value;setQuery(val);setOpen(true);clearTimeout(timer.current);if(!val.trim()){setStatus("idle");setResults([]);return;}setStatus("loading");timer.current=setTimeout(()=>doSearch(val),350);};
  const handleSelect=(product)=>{saveRecent(query||product.name);setRecent(getRecent());setOpen(false);setQuery("");setResults([]);setStatus("idle");onClose?.();navigate(`/product/${product.slug}`);};
  const handleSubmit=(term)=>{const q=(term||query).trim();if(!q)return;saveRecent(q);setRecent(getRecent());setOpen(false);setQuery("");setResults([]);setStatus("idle");onClose?.();navigate(`/search?q=${encodeURIComponent(q)}`);};
  const handleKey=(e)=>{if(e.key==="Enter")handleSubmit();if(e.key==="Escape"){setOpen(false);inputRef.current?.blur();}};
  const dropdownVisible=open&&(status!=="idle"||recent.length>0);
  return (
    <div ref={wrapRef} className="relative w-full">
      <div className="relative">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
        <input ref={inputRef} type="text" value={query} onChange={handleChange} onFocus={()=>setOpen(true)} onKeyDown={handleKey}
          placeholder={t("পণ্য খুঁজুন…","Search products…")} autoComplete="off"
          className={`w-full bg-[#f5f5f3] border text-[13px] rounded-full pl-10 pr-10 py-2.5 text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 ${open?"border-[#2e7d32] bg-white ring-2 ring-[#2e7d32]/10":"border-transparent hover:border-gray-200"}`}/>
        {query
          ? <button type="button" onClick={()=>{setQuery("");setResults([]);setStatus("idle");inputRef.current?.focus();}} className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600"><X size={14}/></button>
          : <button type="button" onClick={()=>handleSubmit()} className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-[#2e7d32]"><ArrowRight size={14}/></button>
        }
      </div>
      <AnimatePresence>
        {dropdownVisible&&(
          <motion.div initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{duration:0.15}}
            className="absolute left-0 top-[calc(100%+8px)] w-full min-w-[300px] bg-white border border-gray-100 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] z-[9999] overflow-hidden">
            {status==="loading"&&<div className="flex items-center gap-3 px-5 py-4"><div className="w-4 h-4 border-2 border-gray-200 border-t-[#2e7d32] rounded-full animate-spin"/><span className="text-[13px] text-gray-400">{t("খোঁজা হচ্ছে...","Searching...")}</span></div>}
            {status==="found"&&results.length>0&&(
              <div>
                <p className="px-5 pt-4 pb-2 text-[10px] font-black uppercase tracking-widest text-gray-400">{t("পণ্য","Products")} ({results.length})</p>
                <div className="max-h-[320px] overflow-y-auto">
                  {results.map(p=>(
                    <button key={p._id} type="button" onClick={()=>handleSelect(p)} className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-[#f5f5f0] transition-colors text-left group">
                      <div className="w-10 h-10 rounded-xl border border-gray-100 bg-gray-50 flex-shrink-0 overflow-hidden">
                        {p.image?<img src={p.image} alt={p.name} className="w-full h-full object-contain p-1"/>:<div className="w-full h-full flex items-center justify-center"><Package size={14} className="text-gray-200"/></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-gray-800 truncate group-hover:text-[#1a2e1a]">{p.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {p.salePrice<p.price&&<span className="text-[11px] text-gray-400 line-through">৳{p.price.toLocaleString()}</span>}
                          <span className="text-[12px] font-bold text-[#1a2e1a]">৳{p.salePrice.toLocaleString()}</span>
                          {p.stock===0&&<span className="text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">{t("স্টক নেই","Out of Stock")}</span>}
                        </div>
                      </div>
                      <ArrowRight size={13} className="text-gray-300 group-hover:text-[#2e7d32] flex-shrink-0 transition-colors"/>
                    </button>
                  ))}
                </div>
                <button type="button" onClick={()=>handleSubmit()} className="w-full flex items-center justify-center gap-2 py-3 border-t border-gray-50 text-[12px] font-bold text-[#2e7d32] hover:bg-[#f0f7f0] transition-colors">
                  {t(`"${query}" এর সব ফলাফল`,`See all results for "${query}"`)} <ArrowRight size={13}/>
                </button>
              </div>
            )}
            {status==="empty"&&<div className="py-8 text-center px-5"><div className="text-3xl mb-3">🔍</div><p className="text-[14px] font-bold text-gray-700">{t("কোনো ফলাফল নেই","No results found")}</p></div>}
            {status==="idle"&&recent.length>0&&(
              <div className="py-2">
                <div className="flex items-center justify-between px-5 pt-3 pb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5"><Clock size={10}/>{t("সাম্প্রতিক","Recent")}</span>
                  <button type="button" onClick={()=>{clearAllRecent();setRecent([]);}} className="text-[10px] text-gray-400 hover:text-red-400 font-medium transition-colors">{t("সব মুছুন","Clear all")}</button>
                </div>
                {recent.map(term=>(
                  <div key={term} className="group flex items-center px-5 py-2 hover:bg-[#f5f5f0] transition-colors">
                    <button type="button" onClick={()=>{setQuery(term);doSearch(term);setOpen(true);}} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                      <Clock size={13} className="text-gray-300 flex-shrink-0"/><span className="text-[13px] text-gray-700 truncate">{term}</span>
                    </button>
                    <button type="button" onClick={()=>{removeOneRecent(term);setRecent(getRecent());}} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-gray-500 transition-all ml-2"><X size={13}/></button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══ CUSTOMER DROPDOWN ══ */
function CustomerDropdown({ customer, t, onOpenProfile, onLogout, cartCount }) {
  const [open, setOpen] = useState(false);
  const leaveTimer = useRef(null);
  const enter=()=>{clearTimeout(leaveTimer.current);setOpen(true);};
  const leave=()=>{leaveTimer.current=setTimeout(()=>setOpen(false),160);};
  useEffect(()=>()=>clearTimeout(leaveTimer.current),[]);
  return (
    <div className="relative hidden lg:block" onMouseEnter={enter} onMouseLeave={leave}>
      <button className="flex items-center gap-2 cursor-pointer bg-transparent border-none transition-colors" style={{color:open?"#2e7d32":"#374151"}}>
        {customer?.avatar
          ? <img src={customer.avatar} alt="" className="w-7 h-7 rounded-full object-cover" style={{border:open?"2px solid #2e7d32":"2px solid transparent",transition:"border-color 0.15s"}}/>
          : <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-black" style={{background:"linear-gradient(135deg,#1a2e1a,#2e7d32)"}}>{(customer?.name?.[0]||"U").toUpperCase()}</div>
        }
        <span className="hidden lg:inline text-[13px] font-semibold">{customer.name.split(" ")[0]}</span>
        <ChevronDown size={12} strokeWidth={2.5} className={`opacity-50 transition-transform duration-200 ${open?"rotate-180":""}`}/>
      </button>
      <AnimatePresence>
        {open&&(
          <motion.div initial={{opacity:0,y:6,scale:0.97}} animate={{opacity:1,y:0,scale:1}}
            exit={{opacity:0,y:6,scale:0.97}} transition={{duration:0.18,ease:[0.22,1,0.36,1]}}
            className="absolute right-0 top-[calc(100%+10px)] w-[200px] bg-white rounded-2xl overflow-hidden z-[9999]"
            style={{boxShadow:"0 16px 48px rgba(0,0,0,0.13),0 2px 8px rgba(0,0,0,0.06)",border:"1.5px solid rgba(0,0,0,0.05)"}}>
            <div className="px-4 py-3.5 flex items-center gap-2.5" style={{background:"linear-gradient(135deg,#1a2e1a,#2e7d32)"}}>
              <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center text-white text-[12px] font-black shrink-0" style={{background:"rgba(255,255,255,0.15)"}}>
                {customer?.avatar?<img src={customer.avatar} alt="" className="w-full h-full object-cover"/>:(customer?.name?.[0]||"U").toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-white text-[12px] font-bold truncate">{customer?.name?.split(" ")[0]}</p>
                <p className="text-white/50 text-[10px] truncate">{customer?.email}</p>
              </div>
            </div>
            <div className="p-1.5 space-y-0.5">
              <button onClick={()=>{onOpenProfile();setOpen(false);}}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left cursor-pointer border-none transition-colors hover:bg-[#f0f7f0]"
                style={{background:"transparent"}}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{background:"rgba(46,125,50,0.1)"}}>
                  <UserCircle size={14} style={{color:"#2e7d32"}}/>
                </div>
                <span className="text-[13px] font-semibold text-slate-700">{t("মাই প্রোফাইল","My Profile")}</span>
              </button>
              <Link to="/cart" onClick={()=>setOpen(false)}
                className="no-underline w-full flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors hover:bg-[#f0f7f0]"
                style={{background:"transparent"}}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 relative" style={{background:"rgba(46,125,50,0.1)"}}>
                  <ShoppingCart size={14} style={{color:"#2e7d32"}}/>
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white" style={{background:"#c62828"}}>
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </div>
                <span className="text-[13px] font-semibold text-slate-700">{t("আমার কার্ট","My Cart")}</span>
                {cartCount > 0 && (
                  <span className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full" style={{background:"rgba(46,125,50,0.1)",color:"#2e7d32"}}>
                    {cartCount}
                  </span>
                )}
              </Link>
              <button onClick={()=>{onLogout();setOpen(false);}}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left cursor-pointer border-none transition-colors hover:bg-red-50"
                style={{background:"transparent"}}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{background:"rgba(220,38,38,0.08)"}}>
                  <LogOut size={13} style={{color:"#dc2626"}}/>
                </div>
                <span className="text-[13px] font-semibold text-red-500">{t("সাইন আউট","Sign Out")}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══ SIDEBAR LANG TOGGLE ══ */
function SidebarLangToggle() {
  const { lang, toggleLang } = useLang();
  return (
    <button
      onClick={() => toggleLang(lang === "bn" ? "en" : "bn")}
      className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer border-none"
      style={{ background:"#f8fafc", border:"1px solid #e2e8f0", color:"#374151" }}>
      <Globe size={15} strokeWidth={1.8} style={{ color:"#2e7d32" }}/>
      {lang === "bn" ? "বাংলা" : "English"}
    </button>
  );
}

/* ══ MAIN NAVBAR ══ */
export default function Navbar() {
  const navigate=useNavigate();
  const [sidebar,setSidebar]=useState(false);
  const [dropdownOpen,setDropdownOpen]=useState(null);
  const [mobileOpen,setMobileOpen]=useState(null);
  const [scrolled,setScrolled]=useState(false);
  const [hidden,setHidden]=useState(false);
  const [mobileSearchOpen,setMobileSearchOpen]=useState(false);
  const [links,setLinks]=useState([]);
  const [showProfile,setShowProfile]=useState(false);
  const {cartCount}=useCart(); const {wishlistCount}=useWishlist(); const t=useT();
  const lastScrollY=useRef(0);

  const [customer,setCustomer]=useState(()=>{
    try{const i=localStorage.getItem("customerInfo");return i?JSON.parse(i):null;}catch{return null;}
  });

  useEffect(()=>{
    const sync=()=>{try{const i=localStorage.getItem("customerInfo");setCustomer(i?JSON.parse(i):null);}catch{setCustomer(null);}};
    window.addEventListener("storage",sync); window.addEventListener("customerAuthChanged",sync);
    return()=>{window.removeEventListener("storage",sync);window.removeEventListener("customerAuthChanged",sync);};
  },[]);

  useEffect(()=>{
    fetch(`${API}/api/navbar-links`).then(r=>r.json()).then(d=>{if(d.success)setLinks(d.data);}).catch(()=>{});
  },[]);

  useEffect(()=>{
    const h=()=>{
      const current=window.scrollY;
      setScrolled(current>40);
      // ── Only hide navbar on desktop (md+), always show on mobile ──
      const isMobile = window.innerWidth < 768;
      if(!isMobile && current>lastScrollY.current && current>80){
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY.current=current;
    };
    window.addEventListener("scroll",h,{passive:true});
    return()=>window.removeEventListener("scroll",h);
  },[]);

  const handleLogout=()=>{
    localStorage.removeItem("customerToken"); localStorage.removeItem("customerInfo");
    setCustomer(null); setShowProfile(false);
    notify(); navigate("/");
  };

  const allLinks=[...manualLinks,...links];

  return (
    <>
      <div className="bg-[#3b0f0f] text-[#fca5a5] text-[10px] sm:text-[11px] font-medium tracking-[0.15em] uppercase py-2 overflow-hidden select-none">
        <div className="flex whitespace-nowrap animate-marquee">
          {[0,1].map(i=>(
            <span key={i} className="inline-flex items-center gap-10 px-10 flex-shrink-0">
              <span>{t("প্রোডাক্টের সাথে ওয়ারেন্টি","Get warranty")}</span><span className="opacity-30">•</span>
              <span>{t("অনলাইন পেমেন্ট সিস্টেম","Online payment")}</span><span className="opacity-30">•</span>
              <span>{t("১০০% অরিজিনাল","100% Authentic")}</span><span className="opacity-30">•</span>
              <span>{t("সহজেই অর্ডার করা","Easily order")}</span><span className="opacity-30">•</span>
              <span>{t("ক্যাশ অন ডেলিভারি","Cash on Delivery")}</span><span className="opacity-30">•</span>
            </span>
          ))}
        </div>
        <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}} .animate-marquee{animation:marquee 28s linear infinite} .animate-marquee:hover{animation-play-state:paused}`}</style>
      </div>

      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled?"bg-white/80 backdrop-blur-2xl border-b border-black/[0.06] shadow-[0_2px_24px_rgba(0,0,0,0.06)]":"bg-white border-b border-black/[0.07]"} ${hidden?"-translate-y-full":"translate-y-0"}`}>
        <div className="max-w-[1440px] mx-auto px-6 xl:px-12">
          <div className="flex items-center justify-between h-[72px]">
            <Link to="/" className="flex-shrink-0 group"><img src={logo} alt="Brand" className="h-10 md:h-12 object-contain group-hover:opacity-70 transition-opacity"/></Link>
            <div className="hidden md:flex flex-1 max-w-[520px] mx-10 xl:mx-16"><SearchBox/></div>
            <div className="flex items-center gap-4 md:gap-5">
              <LangSwitcher/>
              <Link to="/wishlist" className="hidden md:flex relative text-gray-600 hover:text-[#2e7d32] transition-colors">
                <Heart size={20} strokeWidth={1.7}/>
                {wishlistCount>0&&<span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-[16px] px-0.5 rounded-full flex items-center justify-center">{wishlistCount>9?"9+":wishlistCount}</span>}
              </Link>
              {customer
                ? <CustomerDropdown customer={customer} t={t} onOpenProfile={()=>setShowProfile(true)} onLogout={handleLogout} cartCount={cartCount}/>
                : <Link to="/account" className="hidden lg:flex items-center gap-2 text-gray-700 hover:text-[#2e7d32] transition-colors"><User size={20} strokeWidth={1.7}/><span className="text-[13px] font-medium">{t("অ্যাকাউন্ট","Account")}</span></Link>
              }
              {!customer&&<Link to="/account" className="hidden md:flex lg:hidden text-gray-700 hover:text-[#2e7d32] transition-colors"><User size={20} strokeWidth={1.7}/></Link>}
              {customer&&(
                <Link to="/account" className="flex lg:hidden text-gray-700 hover:text-[#2e7d32] transition-colors">
                  {customer?.avatar
                    ?<img src={customer.avatar} alt="" className="w-7 h-7 rounded-full object-cover"/>
                    :<div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-black" style={{background:"linear-gradient(135deg,#1a2e1a,#2e7d32)"}}>{(customer?.name?.[0]||"U").toUpperCase()}</div>
                  }
                </Link>
              )}
              <Link to="/order" className="hidden md:flex items-center gap-2 text-gray-700 hover:text-[#2e7d32] transition-colors"><Package size={20} strokeWidth={1.7}/><span className="hidden lg:inline text-[13px] font-medium">{t("অর্ডার","Orders")}</span></Link>
              <Link to="/order" className="md:hidden flex items-center text-gray-700 hover:text-[#2e7d32] transition-colors"><Package size={20} strokeWidth={1.7}/></Link>
              <button className="md:hidden text-gray-800 hover:text-[#2e7d32] transition-colors" onClick={()=>setMobileSearchOpen(p=>!p)}>
                {mobileSearchOpen?<X size={20} strokeWidth={1.7}/>:<Search size={20} strokeWidth={1.7}/>}
              </button>
              <Link to="/cart" className="relative text-gray-800 hover:text-[#2e7d32] transition-colors">
                <ShoppingCart size={22} strokeWidth={1.7}/>
                {cartCount>0&&<span className="absolute -top-2 -right-2 bg-[#c62828] text-white text-[9px] font-bold min-w-[16px] h-[16px] px-0.5 rounded-full flex items-center justify-center">{cartCount>9?"9+":cartCount}</span>}
              </Link>
              <button className="lg:hidden text-gray-800 hover:text-[#2e7d32] transition-colors" onClick={()=>setSidebar(true)}><Menu size={26} strokeWidth={1.7}/></button>
            </div>
          </div>
          <AnimatePresence>
            {mobileSearchOpen&&(
              <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.22}} className="md:hidden overflow-visible border-t border-black/[0.05] py-3">
                <SearchBox onClose={()=>setMobileSearchOpen(false)}/>
              </motion.div>
            )}
          </AnimatePresence>
          <nav className="hidden lg:flex items-center justify-center gap-1 h-11 border-t border-black/[0.05]">
            {allLinks.map(link=>(
              <div key={link._id} className="relative" onMouseEnter={()=>link.sublinks?.length>0&&setDropdownOpen(link._id)} onMouseLeave={()=>setDropdownOpen(null)}>
                <Link to={`/${link.slug}`} className={`group relative flex items-center gap-1 px-4 py-2.5 text-[13px] font-medium tracking-wide rounded-lg transition-colors ${link.slug==="sale"?"text-[#c62828]":"text-gray-700 hover:text-[#1a2e1a]"}`}>
                  <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#2e7d32] scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full"/>
                  {link.name}
                  {link.sublinks?.length>0&&<ChevronDown size={12} strokeWidth={2.5} className={`ml-0.5 opacity-50 transition-transform ${dropdownOpen===link._id?"rotate-180 opacity-100":""}`}/>}
                </Link>
                <AnimatePresence>
                  {dropdownOpen===link._id&&link.sublinks?.length>0&&(
                    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:5}} transition={{duration:0.15}}
                      className="absolute left-0 top-full mt-1.5 min-w-[200px] bg-white rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.1)] border border-black/[0.06] py-1.5 overflow-hidden">
                      {link.sublinks.map(sub=>(
                        <Link key={sub._id} to={`/${link.slug}/${sub.slug}`} className="block px-4 py-2.5 text-[13px] text-gray-700 hover:bg-[#f0f7f0] hover:text-[#1a2e1a] transition-colors" onClick={()=>setDropdownOpen(null)}>{sub.name}</Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>
        </div>
      </header>

      {showProfile && customer && (
        <ProfileSidebar
          customer={customer}
          onClose={()=>setShowProfile(false)}
          onLogout={()=>{handleLogout();setShowProfile(false);}}
          onAddressSaved={(newAddress) => {
            setCustomer(prev => prev ? { ...prev, address: newAddress } : prev);
          }}
          t={t}
        />
      )}

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebar&&(
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40" onClick={()=>setSidebar(false)}/>
            <motion.div initial={{x:"-100%"}} animate={{x:0}} exit={{x:"-100%"}} transition={{duration:0.35,ease:[0.32,0.72,0,1]}}
              className="fixed left-0 top-0 h-full w-[300px] md:w-[340px] bg-white z-50 flex flex-col shadow-2xl">
              <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
                <img src={logo} alt="Brand" className="h-9 object-contain"/>
                <button onClick={()=>setSidebar(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"><X size={16} strokeWidth={2}/></button>
              </div>
              <div className="px-5 pt-4 pb-3"><SearchBox onClose={()=>setSidebar(false)}/></div>
              <div className="flex-1 overflow-y-auto px-3 py-2">
                {allLinks.map(link=>(
                  <div key={link._id}>
                    <div className="flex items-center w-full">
                      <Link to={`/${link.slug}`} className="flex-1 px-3 py-3.5 rounded-xl text-left font-medium text-[13px] text-gray-800 hover:bg-[#f0f7f0] hover:text-[#1a2e1a] transition-all no-underline" onClick={()=>setSidebar(false)}>{link.name}</Link>
                      {link.sublinks?.length>0&&(
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#f0f7f0] transition-all flex-shrink-0" onClick={()=>setMobileOpen(mobileOpen===link._id?null:link._id)}>
                          <ChevronDown size={16} strokeWidth={2} className={`text-gray-400 transition-transform ${mobileOpen===link._id?"rotate-180":""}`}/>
                        </button>
                      )}
                    </div>
                    <AnimatePresence>
                      {mobileOpen===link._id&&link.sublinks?.length>0&&(
                        <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.2}} className="overflow-hidden">
                          <div className="ml-3 mb-2 space-y-0.5">
                            {link.sublinks.map(sub=>(
                              <Link key={sub._id} to={`/${link.slug}/${sub.slug}`} className="flex items-center px-3 py-2.5 rounded-lg text-[12px] text-gray-500 hover:text-[#1a2e1a] hover:bg-[#f0f7f0] transition-all no-underline" onClick={()=>setSidebar(false)}>{sub.name}</Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* ══ Mobile Sidebar Footer ══ */}
              <div className="border-t border-gray-100 px-5 py-5 space-y-3">
                {customer ? (
                  <Link to="/account"
                    className="flex items-center gap-3 no-underline group"
                    onClick={()=>setSidebar(false)}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[13px] font-black shrink-0"
                      style={{background:"linear-gradient(135deg,#1a2e1a,#2e7d32)"}}>
                      {customer?.avatar
                        ? <img src={customer.avatar} alt="" className="w-full h-full object-cover rounded-xl"/>
                        : (customer?.name?.[0]||"U").toUpperCase()
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-slate-800 truncate group-hover:text-[#2e7d32] transition-colors">
                        {customer.name.split(" ")[0]}
                      </p>
                      <p className="text-[10.5px] text-slate-400 truncate">{customer.email}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-[#2e7d32] transition-colors shrink-0"/>
                  </Link>
                ) : (
                  <Link to="/account"
                    className="flex items-center gap-3 text-[13.5px] font-medium text-gray-700 hover:text-[#2e7d32] transition-colors no-underline"
                    onClick={()=>setSidebar(false)}>
                    <User size={17} strokeWidth={1.7}/>{t("আমার অ্যাকাউন্ট","My Account")}
                  </Link>
                )}

                <div className="pt-2 border-t border-gray-100">
                  <div className="grid grid-cols-3 gap-2">
                    <SidebarLangToggle/>
                      <Link to="/wishlist"
                          className="relative flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl text-[11px] font-semibold no-underline transition-all text-gray-500 hover:text-[#2e7d32] hover:bg-[#f0f7f0]"
                          style={{background:"#f8fafc", border:"1px solid #e2e8f0"}}
                          onClick={()=>setSidebar(false)}>
                          <div className="relative">
                            <Heart size={15} strokeWidth={1.8}/>
                            {wishlistCount>0&&<span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-[16px] px-0.5 rounded-full flex items-center justify-center">{wishlistCount>9?"9+":wishlistCount}</span>}
                          </div>
                          {t("উইশলিস্ট","Wishlist")}
                      </Link>
                    <Link to="/order"
                      className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl text-[11px] font-semibold no-underline transition-all text-gray-500 hover:text-[#2e7d32] hover:bg-[#f0f7f0]"
                      style={{background:"#f8fafc", border:"1px solid #e2e8f0"}}
                      onClick={()=>setSidebar(false)}>
                      <Package size={15} strokeWidth={1.8}/>{t("অর্ডার","Orders")}
                    </Link>
                  </div>
                </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}