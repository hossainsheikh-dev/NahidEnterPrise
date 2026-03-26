import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useT } from "../context/LanguageContext";
import {
  MapPin, Phone, Mail, ExternalLink,
  Facebook, Youtube, Instagram,
  ShoppingBag, Package,
  ChevronRight,
} from "lucide-react";



//brand information 
const BRAND = {
  name:    "Nahid Enterprise",
  namebn:  "নাহিদ এন্টারপ্রাইজ",
  tagline: "আপনার বিশ্বস্ত অনলাইন শপ",
  taglineEn:"Your Trusted Online Shop",
  address: "৮৮/৮৯ শামসুল হক টাওয়ার, মোগলটুলি, চকবাজার, ঢাকা-১২১১",
  addressEn:"88/89 Shamsul Haq Tower, Mogultuli, Chawkbazar, Dhaka-1211",
  phones:  ["01839666733", "01938360666"],
  email:   "nahidenterprise.store@gmail.com",
};


//some links are here
const QUICK_LINKS = [
  { to:"/",         bn:"হোম",            en:"Home"        },
  { to:"/cart",     bn:"কার্ট",           en:"Cart"        },
  { to:"/checkout", bn:"চেকআউট",         en:"Checkout"    },
  { to:"/order",    bn:"অর্ডার ট্র্যাক",  en:"Track Order" },
];


//policy links
const POLICY_LINKS = [
  { to:"/privacy", bn:"প্রাইভেসি পলিসি", en:"Privacy Policy"    },
  { to:"/terms",   bn:"শর্তাবলী",         en:"Terms & Conditions"},
  { to:"/refund",  bn:"রিটার্ন পলিসি",    en:"Return Policy"     },
  { to:"/faq",     bn:"সাধারণ জিজ্ঞাসা",  en:"FAQ"               },
];


//social links
const SOCIAL = [
  { icon:Facebook,  href:"#", label:"Facebook"  },
  { icon:Youtube,   href:"#", label:"YouTube"   },
  { icon:Instagram, href:"#", label:"Instagram" },
];

function Divider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px" style={{background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.08))"}}/>
      <div className="w-1.5 h-1.5 rounded-full" style={{background:"rgba(255,255,255,0.15)"}}/>
      <div className="flex-1 h-px" style={{background:"linear-gradient(90deg,rgba(255,255,255,0.08),transparent)"}}/>
    </div>
  );
}

function SectionHead({ bn, en, t }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-black uppercase tracking-[0.2em]" style={{color:"#4ade80"}}>{t(bn,en)}</p>
      <div className="h-0.5 w-8 mt-1.5 rounded-full" style={{background:"linear-gradient(90deg,#4ade80,transparent)"}}/>
    </div>
  );
}



//footer function is here
export default function Footer() {
  const t    = useT();
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden"
      style={{background:"linear-gradient(160deg,#0a1a0a 0%,#111f11 40%,#0d1a0d 100%)"}}>

      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full opacity-[0.04]"
          style={{background:"radial-gradient(circle,#4ade80,transparent)"}}/>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-[0.03]"
          style={{background:"radial-gradient(circle,#86efac,transparent)",transform:"translate(30%,-30%)"}}/>
        <div className="absolute bottom-0 left-1/2 w-80 h-80 rounded-full opacity-[0.025]"
          style={{background:"radial-gradient(circle,#22c55e,transparent)",transform:"translateX(-50%) translateY(40%)"}}/>
        <div className="absolute inset-0 opacity-[0.015]"
          style={{backgroundImage:"linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)",backgroundSize:"48px 48px"}}/>
      </div>

      {/* Main body */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-12 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">

          {/* column-1 body */}
          <motion.div className="sm:col-span-2 lg:col-span-1"
            initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}}
            viewport={{once:true}} transition={{duration:0.5}}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{background:"linear-gradient(135deg,#16a34a,#15803d)",boxShadow:"0 4px 16px rgba(22,163,74,0.35)"}}>
                <ShoppingBag size={18} className="text-white"/>
              </div>
              <div>
                <p className="text-base font-black leading-tight text-white">{t(BRAND.namebn, BRAND.name)}</p>
                <p className="text-[10px] font-medium" style={{color:"rgba(255,255,255,0.35)"}}>
                  {t(BRAND.tagline, BRAND.taglineEn)}
                </p>
              </div>
            </div>
            <p className="text-xs leading-relaxed mb-5" style={{color:"rgba(255,255,255,0.4)"}}>
              {t(
                "সেরা মানের পণ্য সরাসরি আপনার দরজায়। দ্রুত ডেলিভারি, সহজ রিটার্ন ও বিশ্বস্ত সেবা নিশ্চিত করি আমরা।",
                "Quality products delivered straight to your door. We ensure fast delivery, easy returns and trusted service."
              )}
            </p>
            <div className="flex items-center gap-2">
              {SOCIAL.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                  style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)"}}>
                  <Icon size={14} style={{color:"rgba(255,255,255,0.45)"}}/>
                </a>
              ))}
            </div>
          </motion.div>

          {/* column 2 — links */}
          <motion.div initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}}
            viewport={{once:true}} transition={{duration:0.5,delay:0.1}}>
            <SectionHead bn="দ্রুত লিংক" en="Quick Links" t={t}/>
            <ul className="space-y-2">
              {QUICK_LINKS.map(({ to, bn: bnLink, en: enLink }) => (
                <li key={to}>
                  <Link to={to} className="flex items-center gap-2 text-xs font-medium group transition-all"
                    style={{color:"rgba(255,255,255,0.45)"}}>
                    <ChevronRight size={11} className="flex-shrink-0 transition-transform group-hover:translate-x-1" style={{color:"#4ade80"}}/>
                    <span className="group-hover:text-white transition-colors">{t(bnLink, enLink)}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Divider/>
            <SectionHead bn="পলিসি" en="Policies" t={t}/>
            <ul className="space-y-2">
              {POLICY_LINKS.map(({ to, bn: bnLink, en: enLink }) => (
                <li key={to}>
                  <Link to={to} className="flex items-center gap-2 text-xs font-medium group transition-all"
                    style={{color:"rgba(255,255,255,0.45)"}}>
                    <ChevronRight size={11} className="flex-shrink-0 transition-transform group-hover:translate-x-1" style={{color:"#4ade80"}}/>
                    <span className="group-hover:text-white transition-colors">{t(bnLink, enLink)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* column-3 track and policy */}
          <motion.div initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}}
            viewport={{once:true}} transition={{duration:0.5,delay:0.15}}>
            <SectionHead bn="অর্ডার ট্র্যাক" en="Track Order" t={t}/>
            <p className="text-xs leading-relaxed mb-4" style={{color:"rgba(255,255,255,0.4)"}}>
              {t("আপনার ফোন নম্বর দিয়ে যেকোনো সময় অর্ডারের সর্বশেষ অবস্থান জানুন।",
                 "Track your order anytime with your phone number.")}
            </p>
            <Link to="/order"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] group"
              style={{background:"linear-gradient(135deg,#16a34a22,#15803d22)",border:"1px solid rgba(74,222,128,0.2)",color:"#4ade80"}}>
              <Package size={13}/>
              {t("অর্ডার ট্র্যাক করুন","Track My Order")}
              <ExternalLink size={11} className="opacity-60 group-hover:opacity-100 transition-opacity"/>
            </Link>
            <Divider/>
            <SectionHead bn="পেমেন্ট পদ্ধতি" en="Payment Methods" t={t}/>
            <div className="flex flex-wrap gap-2">
              {[
                {label:"bKash", color:"#e2136e", bg:"rgba(226,19,110,0.12)", border:"rgba(226,19,110,0.2)"},
                {label:"Nagad", color:"#f7941d", bg:"rgba(247,148,29,0.12)", border:"rgba(247,148,29,0.2)"},
                {label:"COD",   color:"#4ade80", bg:"rgba(74,222,128,0.1)",  border:"rgba(74,222,128,0.15)"},
              ].map(({label,color,bg,border})=>(
                <span key={label} className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
                  style={{background:bg,border:`1px solid ${border}`,color}}>
                  {label}
                </span>
              ))}
            </div>
          </motion.div>

          {/* column-4 contact */}
          <motion.div initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}}
            viewport={{once:true}} transition={{duration:0.5,delay:0.2}}>
            <SectionHead bn="যোগাযোগ" en="Contact Us" t={t}/>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{background:"rgba(74,222,128,0.1)"}}>
                  <MapPin size={12} style={{color:"#4ade80"}}/>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{color:"rgba(255,255,255,0.25)"}}>
                    {t("ঠিকানা","Address")}
                  </p>
                  <p className="text-xs leading-relaxed" style={{color:"rgba(255,255,255,0.55)"}}>
                    {t(BRAND.address, BRAND.addressEn)}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 py-2 px-3 rounded-xl"
                style={{background:"rgba(74,222,128,0.05)",border:"1px solid rgba(74,222,128,0.08)"}}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{background:"rgba(74,222,128,0.1)"}}>
                  <Phone size={12} style={{color:"#4ade80"}}/>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{color:"rgba(255,255,255,0.25)"}}>
                  {t("ফোন","Phone")}
                </p>
                {BRAND.phones.map(p=>(
                  <a key={p} href={`tel:${p}`} className="text-xs font-semibold hover:text-white transition-colors text-center"
                    style={{color:"rgba(255,255,255,0.6)"}}>
                    {p}
                  </a>
                ))}
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{background:"rgba(74,222,128,0.1)"}}>
                  <Mail size={12} style={{color:"#4ade80"}}/>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{color:"rgba(255,255,255,0.25)"}}>
                    {t("ইমেইল","Email")}
                  </p>
                  <a href={`mailto:${BRAND.email}`} className="text-xs font-semibold hover:text-white transition-colors"
                    style={{color:"rgba(255,255,255,0.6)"}}>
                    {BRAND.email}
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/*bottom bar centered */}
        <div className="mt-10 pt-5" style={{borderTop:"1px solid rgba(255,255,255,0.06)"}}>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
              <p className="text-[11px]" style={{color:"rgba(255,255,255,0.3)"}}>
                {t("সার্ভিস চালু আছে","Service is live")}
              </p>
            </div>
            <p className="text-[11px]" style={{color:"rgba(255,255,255,0.2)"}}>
              © {year} {t(BRAND.namebn, BRAND.name)}. {t("সকল অধিকার সংরক্ষিত।","All rights reserved.")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}