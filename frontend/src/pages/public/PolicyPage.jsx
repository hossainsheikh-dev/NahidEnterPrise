import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useT } from "../../context/LanguageContext";
import {
  Shield, FileText, RefreshCw, HelpCircle,
  ArrowLeft, Clock,
  CheckCircle, AlertTriangle, Info,
  Star, ChevronDown,
  MapPin, Package, CreditCard,
  Truck, Lock, Eye, UserCheck,
  MessageCircle, RotateCcw, Ban,
  HelpingHand, Zap, Heart,
} from "lucide-react";

/* ════════════════════════════════════════════════
   OTHER POLICIES NAV
════════════════════════════════════════════════ */
const ALL_POLICIES = [
  { to:"/privacy", bn:"প্রাইভেসি পলিসি",  en:"Privacy Policy",     icon:Shield     },
  { to:"/terms",   bn:"শর্তাবলী",           en:"Terms & Conditions", icon:FileText   },
  { to:"/refund",  bn:"রিটার্ন পলিসি",      en:"Return Policy",      icon:RefreshCw  },
  { to:"/faq",     bn:"সাধারণ জিজ্ঞাসা",    en:"FAQ",                 icon:HelpCircle },
];

/* ════════════════════════════════════════════════
   POLICY DATA — 700-800 words per page
════════════════════════════════════════════════ */
const POLICIES = {

  /* ──────────── PRIVACY ──────────── */
  "/privacy": {
    icon: Shield,
    accent: { light:"#2563eb", dark:"#60a5fa" },
    heroBg: { light:"bg-gradient-to-r from-cyan-800 to-cyan-600" },
    titleBn:"প্রাইভেসি পলিসি", titleEn:"Privacy Policy",
    subBn:"আপনার ব্যক্তিগত তথ্যের সুরক্ষায় আমরা প্রতিশ্রুতিবদ্ধ",
    subEn:"We are committed to protecting your personal information",
    updated:"জানুয়ারি ২০২৫ | January 2025",
    sections: [
      {
        icon: Info, tag:"01",
        titleBn:"ভূমিকা", titleEn:"Introduction",
        bodyBn:`নাহিদ এন্টারপ্রাইজ-এ আপনাকে স্বাগতম। আমরা আমাদের গ্রাহকদের গোপনীয়তাকে সর্বোচ্চ অগ্রাধিকার দিই। এই প্রাইভেসি পলিসিতে বিস্তারিত বর্ণনা করা হয়েছে যে আমরা কীভাবে আপনার ব্যক্তিগত তথ্য সংগ্রহ, ব্যবহার, সংরক্ষণ এবং সুরক্ষা করি। আমাদের ওয়েবসাইট ব্যবহার করে বা আমাদের কাছে অর্ডার দিয়ে আপনি এই পলিসির শর্তাবলীতে সম্মতি প্রদান করছেন। আমাদের সেবা ব্যবহারের আগে এই পলিসিটি সম্পূর্ণ পড়ার জন্য অনুরোধ করা হচ্ছে। আপনার বিশ্বাস আমাদের সবচেয়ে মূল্যবান সম্পদ এবং আমরা সেই বিশ্বাস রক্ষায় সর্বদা সচেষ্ট।`,
        bodyEn:`Welcome to Nahid Enterprise. We place the highest priority on the privacy of our customers. This Privacy Policy describes in detail how we collect, use, store, and protect your personal information. By using our website or placing an order with us, you are consenting to the terms of this policy. We request that you read this policy completely before using our services. Your trust is our most valuable asset and we are always committed to protecting that trust. We believe in transparency, and this document reflects our ongoing commitment to being honest about how we handle your data.`,
      },
      {
        icon: Eye, tag:"02",
        titleBn:"আমরা কী তথ্য সংগ্রহ করি?", titleEn:"What Information Do We Collect?",
        bodyBn:`অর্ডার প্রক্রিয়াকরণের জন্য আমরা নিম্নলিখিত তথ্য সংগ্রহ করি: আপনার পূর্ণ নাম, মোবাইল ফোন নম্বর, সম্পূর্ণ ডেলিভারি ঠিকানা (থানা ও জেলাসহ), ইমেইল ঠিকানা (ঐচ্ছিক), পেমেন্ট সংক্রান্ত তথ্য যেমন ট্র্যান্সাকশন আইডি ও পেমেন্ট স্ক্রিনশট, এবং অর্ডার সংক্রান্ত যেকোনো বিশেষ নোট। এছাড়াও আমরা স্বয়ংক্রিয়ভাবে কিছু প্রযুক্তিগত তথ্য সংগ্রহ করতে পারি, যেমন আপনার ডিভাইসের ধরন, ব্রাউজারের তথ্য এবং আইপি ঠিকানা। এই তথ্যগুলো কেবলমাত্র আমাদের সেবার মান উন্নয়নের জন্য ব্যবহৃত হয়। আমরা কোনো সংবেদনশীল আর্থিক তথ্য যেমন ব্যাংক অ্যাকাউন্ট নম্বর বা কার্ড নম্বর সংগ্রহ করি না।`,
        bodyEn:`For order processing, we collect the following information: your full name, mobile phone number, complete delivery address (including thana and district), email address (optional), payment information such as transaction ID and payment screenshot, and any special notes related to the order. We may also automatically collect some technical information, such as your device type, browser information and IP address. This information is used solely to improve the quality of our service. We do not collect any sensitive financial information such as bank account numbers or card numbers. All collected data is handled with the utmost care and responsibility.`,
      },
      {
        icon: UserCheck, tag:"03",
        titleBn:"তথ্য ব্যবহারের উদ্দেশ্য", titleEn:"Purpose of Data Usage",
        bodyBn:`আপনার প্রদত্ত তথ্য কেবলমাত্র নিম্নলিখিত উদ্দেশ্যে ব্যবহার করা হয়: অর্ডার প্রক্রিয়াকরণ ও ডেলিভারি নিশ্চিত করা, পেমেন্ট যাচাইকরণ ও জালিয়াতি প্রতিরোধ, গ্রাহক সেবা প্রদান ও সমস্যা সমাধান, অর্ডারের সর্বশেষ অবস্থা সম্পর্কে আপনাকে অবহিত করা, এবং আমাদের সেবার মান পর্যালোচনা ও উন্নয়ন। আমরা আপনার তথ্য কোনো তৃতীয় পক্ষের কাছে বিক্রি, ভাড়া বা শেয়ার করি না। শুধুমাত্র ডেলিভারি প্রক্রিয়ার সাথে সম্পর্কিত প্রয়োজনীয় তথ্য কুরিয়ার পার্টনারের সাথে শেয়ার করা হতে পারে এবং সেটিও শুধুমাত্র ডেলিভারি সম্পন্ন করার জন্য।`,
        bodyEn:`Your provided information is used only for the following purposes: processing orders and ensuring delivery, payment verification and fraud prevention, providing customer service and resolving issues, informing you about the latest status of your order, and reviewing and improving the quality of our services. We do not sell, rent, or share your information with any third party. Only necessary information related to the delivery process may be shared with our courier partner, and that too solely for completing the delivery. We are transparent about every use of your data and you can inquire at any time.`,
      },
      {
        icon: Lock, tag:"04",
        titleBn:"তথ্যের নিরাপত্তা ও সংরক্ষণ", titleEn:"Data Security & Storage",
        bodyBn:`আমরা আপনার তথ্যের সর্বোচ্চ নিরাপত্তা নিশ্চিত করতে আধুনিক প্রযুক্তি ব্যবহার করি। সমস্ত তথ্য এনক্রিপ্টেড পদ্ধতিতে সুরক্ষিত সার্ভারে সংরক্ষিত হয়। শুধুমাত্র অনুমোদিত কর্মীরা আপনার তথ্য অ্যাক্সেস করতে পারেন এবং তারা গোপনীয়তা চুক্তিতে আবদ্ধ। আমরা নিয়মিত আমাদের নিরাপত্তা ব্যবস্থা পর্যালোচনা ও আপডেট করি। কোনো ডেটা লঙ্ঘনের ঘটনা ঘটলে আমরা অবিলম্বে প্রভাবিত গ্রাহকদের জানাবো এবং প্রয়োজনীয় পদক্ষেপ গ্রহণ করবো। আপনার তথ্য আমাদের ব্যবসায়িক সম্পর্কের মেয়াদ শেষ হওয়ার পরেও প্রয়োজনীয় আইনি বাধ্যবাধকতা পূরণের জন্য একটি নির্দিষ্ট সময়ের জন্য সংরক্ষিত থাকতে পারে।`,
        bodyEn:`We use modern technology to ensure the highest security of your information. All data is stored on secured servers using encrypted methods. Only authorized personnel can access your information and they are bound by confidentiality agreements. We regularly review and update our security measures. If any data breach occurs, we will immediately notify affected customers and take necessary steps. Your information may be retained for a specific period after the end of our business relationship to fulfill necessary legal obligations. We take every measure to prevent unauthorized access to your data.`,
      },
      {
        icon: CheckCircle, tag:"05",
        titleBn:"আপনার অধিকার", titleEn:"Your Rights",
        bodyBn:`আপনার ব্যক্তিগত তথ্যের উপর আপনার সম্পূর্ণ অধিকার রয়েছে। আপনি যেকোনো সময় আমাদের কাছে সংরক্ষিত আপনার তথ্য দেখার অনুরোধ করতে পারেন, ভুল তথ্য সংশোধনের আবেদন করতে পারেন, এবং নির্দিষ্ট পরিস্থিতিতে আপনার তথ্য মুছে ফেলার অনুরোধ করতে পারেন। এই সকল অনুরোধের জন্য আমাদের সাথে সরাসরি যোগাযোগ করুন। আমরা ৭ কার্যদিবসের মধ্যে আপনার অনুরোধের জবাব দেওয়ার চেষ্টা করবো। আপনার গোপনীয়তার অধিকার আমাদের কাছে অত্যন্ত গুরুত্বপূর্ণ এবং আমরা সবসময় আপনার সাথে সহযোগিতামূলক মনোভাবে কাজ করতে প্রতিশ্রুতিবদ্ধ।`,
        bodyEn:`You have full rights over your personal information. You can request to view your information stored with us at any time, apply for correction of incorrect information, and request deletion of your information under specific circumstances. For all such requests, please contact us directly. We will try to respond to your request within 7 business days. Your privacy rights are extremely important to us and we are always committed to working with you in a cooperative manner. We respect your autonomy over your own data and will never obstruct legitimate requests.`,
      },
    ],
  },

  /* ──────────── TERMS ──────────── */
  "/terms": {
    icon: FileText,
    accent: { light:"#7c3aed", dark:"#a78bfa" },
    heroBg: { light:"bg-gradient-to-r from-green-600 via-green-700 to-green-800"},
    titleBn:"শর্তাবলী", titleEn:"Terms & Conditions",
    subBn:"আমাদের সেবা ব্যবহারের আগে এই শর্তগুলো মনোযোগ দিয়ে পড়ুন",
    subEn:"Please read these terms carefully before using our services",
    updated:"জানুয়ারি ২০২৫ | January 2025",
    sections: [
      {
        icon: Info, tag:"01",
        titleBn:"সাধারণ শর্তাবলী", titleEn:"General Terms",
        bodyBn:`এই শর্তাবলী নাহিদ এন্টারপ্রাইজ এবং আমাদের গ্রাহকদের মধ্যে একটি আইনি চুক্তি গঠন করে। আমাদের ওয়েবসাইট ব্যবহার করে বা যেকোনো সেবা গ্রহণ করে আপনি এই শর্তাবলীতে সম্মত হচ্ছেন। আমরা যেকোনো সময় পূর্ব বিজ্ঞপ্তি ছাড়াই এই শর্তাবলী পরিবর্তন করার অধিকার সংরক্ষণ করি। পরিবর্তিত শর্তাবলী ওয়েবসাইটে প্রকাশের সাথে সাথে কার্যকর হবে। আমাদের সেবা কেবলমাত্র বাংলাদেশে বসবাসকারী ব্যক্তিদের জন্য প্রযোজ্য। ১৮ বছরের কম বয়সী ব্যক্তিরা অভিভাবকের সম্মতিতে আমাদের সেবা ব্যবহার করতে পারবেন। যেকোনো বিরোধের ক্ষেত্রে বাংলাদেশের প্রচলিত আইন প্রযোজ্য হবে।`,
        bodyEn:`These terms and conditions constitute a legal agreement between Nahid Enterprise and our customers. By using our website or receiving any service, you are agreeing to these terms. We reserve the right to change these terms at any time without prior notice. Changed terms will be effective immediately upon publication on the website. Our services are applicable only to individuals residing in Bangladesh. Individuals under 18 years of age may use our services with guardian consent. In case of any dispute, the laws of Bangladesh will apply. It is your responsibility to stay updated with any changes to these terms.`,
      },
      {
        icon: Package, tag:"02",
        titleBn:"অর্ডার ও পণ্য সংক্রান্ত শর্ত", titleEn:"Order & Product Terms",
        bodyBn:`অর্ডার দেওয়ার সময় আপনাকে সঠিক এবং সম্পূর্ণ তথ্য প্রদান করতে হবে। ভুল ঠিকানা বা ফোন নম্বর দেওয়ার কারণে ডেলিভারি ব্যর্থ হলে সেই দায়িত্ব সম্পূর্ণ গ্রাহকের। একটি ফোন নম্বর দিয়ে একাধিক অর্ডার করা যাবে তবে অস্বাভাবিক পরিমাণে অর্ডার করলে আমরা যাচাই করার অধিকার রাখি। পণ্যের স্টক শেষ হয়ে গেলে আমরা আপনাকে জানাবো এবং বিকল্প ব্যবস্থা করবো। ওয়েবসাইটে প্রদর্শিত পণ্যের ছবি এবং বাস্তব পণ্যের মধ্যে সামান্য রঙ বা আকারের পার্থক্য থাকতে পারে যা আলোক সজ্জার কারণে হয়। পণ্যের মূল্য পরিবর্তনের অধিকার আমরা সংরক্ষণ করি তবে অর্ডার নিশ্চিত হওয়ার পরে মূল্য পরিবর্তন হবে না।`,
        bodyEn:`When placing an order, you must provide accurate and complete information. If delivery fails due to incorrect address or phone number, the responsibility lies entirely with the customer. Multiple orders can be placed with one phone number, but we reserve the right to verify in case of abnormally large quantities. If a product is out of stock, we will inform you and arrange alternatives. There may be slight color or size differences between product images displayed on the website and the actual product due to lighting conditions. We reserve the right to change product prices, but prices will not change after an order is confirmed. We strive to maintain accurate product descriptions at all times.`,
      },
      {
        icon: CreditCard, tag:"03",
        titleBn:"পেমেন্ট শর্তাবলী", titleEn:"Payment Terms",
        bodyBn:`আমরা বর্তমানে তিনটি পেমেন্ট পদ্ধতি গ্রহণ করি: bKash, Nagad এবং ক্যাশ অন ডেলিভারি (COD)। ডিজিটাল পেমেন্টের ক্ষেত্রে (bKash বা Nagad) সঠিক ট্র্যান্সাকশন আইডি এবং পেমেন্টের স্ক্রিনশট প্রদান করা বাধ্যতামূলক। একটি ট্র্যান্সাকশন আইডি শুধুমাত্র একবার ব্যবহার করা যাবে। ডুপ্লিকেট TrxID ব্যবহার করা সম্পূর্ণ নিষিদ্ধ এবং এটি জালিয়াতি হিসেবে গণ্য হবে। COD অর্ডারের ক্ষেত্রে পণ্য বুঝে পাওয়ার পরে সম্পূর্ণ মূল্য পরিশোধ করতে হবে। পেমেন্ট সংক্রান্ত যেকোনো সমস্যা বা বিরোধে আমাদের তদন্তের সিদ্ধান্তই চূড়ান্ত বলে গণ্য হবে। আমরা কোনো অবস্থাতেই আংশিক পেমেন্ট গ্রহণ করি না।`,
        bodyEn:`We currently accept three payment methods: bKash, Nagad and Cash on Delivery (COD). For digital payments (bKash or Nagad), it is mandatory to provide the correct transaction ID and payment screenshot. A transaction ID can only be used once. Using duplicate TrxID is strictly prohibited and will be considered fraud. For COD orders, the full price must be paid after receiving the product. In any payment-related dispute, our investigation decision will be considered final. We do not accept partial payments under any circumstances. All payment transactions must be made in Bangladeshi Taka only.`,
      },
      {
        icon: Truck, tag:"04",
        titleBn:"ডেলিভারি শর্তাবলী", titleEn:"Delivery Terms",
        bodyBn:`আমরা বাংলাদেশের সকল জেলায় ডেলিভারি প্রদান করি। ঢাকার মধ্যে সাধারণত ১-২ কার্যদিবস এবং ঢাকার বাইরে ২-৪ কার্যদিবসের মধ্যে ডেলিভারি দেওয়ার চেষ্টা করা হয়। তবে প্রাকৃতিক দুর্যোগ, হরতাল, কুরিয়ার পার্টনারের সমস্যা বা অন্যান্য অনিবার্য পরিস্থিতিতে ডেলিভারিতে বিলম্ব হতে পারে যার জন্য আমরা দায়বদ্ধ নই। ডেলিভারির সময় কাস্টমারকে ফোনে পাওয়া না গেলে ২ বার চেষ্টার পর অর্ডারটি ফেরত পাঠানো হতে পারে। ডেলিভারি চার্জ: ২৫০০ টাকার উপরে অর্ডারে বিনামূল্যে, অন্যথায় ৬০ টাকা প্রযোজ্য। ডেলিভারি ঠিকানা অর্ডার দেওয়ার পরে পরিবর্তন করতে চাইলে অবিলম্বে আমাদের সাথে যোগাযোগ করুন।`,
        bodyEn:`We deliver to all districts of Bangladesh. We try to deliver within Dhaka within 1-2 business days and outside Dhaka within 2-4 business days. However, we are not liable for delays due to natural disasters, strikes, courier partner issues or other unavoidable circumstances. If the customer cannot be reached by phone during delivery, the order may be returned after 2 attempts. Delivery charge: Free for orders above ৳2500, otherwise ৳60 applies. If you want to change the delivery address after placing an order, please contact us immediately. We will do our best to accommodate your request before the order is dispatched.`,
      },
      {
        icon: Ban, tag:"05",
        titleBn:"নিষিদ্ধ কার্যক্রম", titleEn:"Prohibited Activities",
        bodyBn:`আমাদের সেবা ব্যবহারের সময় নিম্নলিখিত কার্যক্রম সম্পূর্ণ নিষিদ্ধ: মিথ্যা বা বিভ্রান্তিমূলক তথ্য দিয়ে অর্ডার করা, পেমেন্ট জালিয়াতি বা ডুপ্লিকেট ট্র্যান্সাকশন করা, বারবার অর্ডার দিয়ে ইচ্ছাকৃতভাবে বাতিল করা, কুরিয়ার বা ডেলিভারি কর্মীদের সাথে অসদাচরণ করা, এবং আমাদের ব্যবসার সুনাম ক্ষতিগ্রস্ত করার উদ্দেশ্যে মিথ্যা রিভিউ বা অভিযোগ করা। এই ধরনের কার্যক্রমে জড়িত থাকলে আমরা আইনি পদক্ষেপ নেওয়ার অধিকার সংরক্ষণ করি এবং সংশ্লিষ্ট অ্যাকাউন্ট ও ফোন নম্বর ব্লক করা হতে পারে।`,
        bodyEn:`The following activities are strictly prohibited while using our services: placing orders with false or misleading information, payment fraud or duplicate transactions, repeatedly placing and intentionally cancelling orders, misconduct with courier or delivery staff, and making false reviews or complaints with the intent to damage our business reputation. We reserve the right to take legal action for such activities and the associated account and phone number may be blocked. We take all reports of fraudulent activity seriously and investigate thoroughly before taking action.`,
      },
    ],
  },

  /* ──────────── REFUND ──────────── */
  "/refund": {
    icon: RefreshCw,
    accent: { light:"#059669", dark:"#4ade80" },
    heroBg: { light:"bg-gradient-to-r from-teal-800 via-teal-900 to-gray-800" },
    titleBn:"রিটার্ন ও রিফান্ড পলিসি", titleEn:"Return & Refund Policy",
    subBn:"সহজ ও ঝামেলামুক্ত রিটার্ন — আপনার সন্তুষ্টিই আমাদের লক্ষ্য",
    subEn:"Easy and hassle-free returns — your satisfaction is our goal",
    updated:"জানুয়ারি ২০২৫ | January 2025",
    sections: [
      {
        icon: Info, tag:"01",
        titleBn:"রিটার্ন পলিসির সার সংক্ষেপ", titleEn:"Return Policy Overview",
        bodyBn:`নাহিদ এন্টারপ্রাইজ আপনার সন্তুষ্টিকে সর্বোচ্চ অগ্রাধিকার দেয়। আমরা বিশ্বাস করি প্রতিটি গ্রাহক সেরা মানের পণ্য ও সেবা পাওয়ার যোগ্য। যদি কোনো কারণে আপনি আমাদের পণ্যে সন্তুষ্ট না হন, তাহলে আমাদের রিটার্ন পলিসির আওতায় আপনি পণ্য ফেরত দিতে পারবেন। আমাদের রিটার্ন প্রক্রিয়া সম্পূর্ণ ঝামেলামুক্ত এবং গ্রাহকবান্ধব। আমরা প্রতিটি রিটার্ন অনুরোধ গুরুত্বের সাথে বিবেচনা করি এবং দ্রুততম সময়ে সমাধান দেওয়ার চেষ্টা করি। আমাদের লক্ষ্য হলো প্রতিটি গ্রাহকের সাথে দীর্ঘমেয়াদী বিশ্বাসযোগ্য সম্পর্ক গড়ে তোলা।`,
        bodyEn:`Nahid Enterprise places the highest priority on your satisfaction. We believe every customer deserves the best quality products and services. If for any reason you are not satisfied with our products, you can return them under our return policy. Our return process is completely hassle-free and customer-friendly. We take every return request seriously and try to provide a resolution in the shortest possible time. Our goal is to build a long-term trustworthy relationship with every customer. We stand behind every product we sell and will do our best to make things right.`,
      },
      {
        icon: CheckCircle, tag:"02",
        titleBn:"রিটার্নের যোগ্যতা ও শর্ত", titleEn:"Return Eligibility & Conditions",
        bodyBn:`পণ্য রিটার্ন করার জন্য নিম্নলিখিত শর্তগুলো পূরণ করতে হবে: পণ্য পাওয়ার ৭ দিনের মধ্যে রিটার্নের অনুরোধ করতে হবে। পণ্যটি অবশ্যই মূল প্যাকেজিংসহ অপরিবর্তিত অবস্থায় থাকতে হবে। পণ্যের ট্যাগ, লেবেল এবং আনুষাঙ্গিক সামগ্রী সম্পূর্ণ অক্ষত থাকতে হবে। গ্রাহকের কারণে ক্ষতিগ্রস্ত বা ব্যবহৃত পণ্য রিটার্ন গ্রহণযোগ্য নয়। তবে নিম্নলিখিত ক্ষেত্রে ৭ দিনের পরেও রিটার্ন বিবেচনা করা হবে: ডেলিভারির সময় পণ্য ক্ষতিগ্রস্ত হলে, ভুল পণ্য পাঠানো হলে, পণ্যে উৎপাদন ত্রুটি থাকলে। এসব ক্ষেত্রে পণ্য প্রাপ্তির ২৪ ঘণ্টার মধ্যে ছবিসহ আমাদের জানাতে হবে।`,
        bodyEn:`The following conditions must be met to return a product: The return request must be made within 7 days of receiving the product. The product must be in its original packaging and unaltered condition. Product tags, labels and accessories must be completely intact. Products damaged or used by the customer are not eligible for return. However, returns will be considered beyond 7 days in the following cases: if the product is damaged during delivery, if the wrong product is sent, if there is a manufacturing defect. In these cases, you must inform us with photos within 24 hours of receiving the product. We will review each case individually and fairly.`,
      },
      {
        icon: RotateCcw, tag:"03",
        titleBn:"রিটার্নের ধাপসমূহ", titleEn:"Return Process Steps",
        bodyBn:`রিটার্ন করার জন্য নিম্নলিখিত ধাপগুলো অনুসরণ করুন: প্রথমে আমাদের হেল্পলাইন নম্বরে (01839666733 বা 01938360666) যোগাযোগ করুন। আপনার অর্ডার আইডি এবং রিটার্নের কারণ বিস্তারিত জানান। প্রয়োজনে পণ্যের ছবি বা ভিডিও পাঠান। আমাদের টিম ২৪ ঘণ্টার মধ্যে আপনার অনুরোধ পর্যালোচনা করে সাড়া দেবে। অনুরোধ অনুমোদিত হলে পণ্য পাঠানোর নির্দেশনা দেওয়া হবে। পণ্য আমাদের কাছে পৌঁছানোর পরে ২-৩ কার্যদিবসের মধ্যে পরিদর্শন সম্পন্ন করা হবে। পরিদর্শনে পণ্য সঠিক পাওয়া গেলে রিফান্ড বা পণ্য প্রতিস্থাপন করা হবে।`,
        bodyEn:`Follow these steps to return a product: First, contact our helpline number (01839666733 or 01938360666). Provide your order ID and details of the reason for return. Send product photos or videos if necessary. Our team will review your request and respond within 24 hours. If the request is approved, instructions for sending the product will be provided. After the product reaches us, inspection will be completed within 2-3 business days. If the product passes inspection, a refund or product replacement will be processed. We make the entire process as smooth and transparent as possible.`,
      },
      {
        icon: CreditCard, tag:"04",
        titleBn:"রিফান্ড পদ্ধতি ও সময়সীমা", titleEn:"Refund Method & Timeline",
        bodyBn:`রিফান্ড প্রক্রিয়া নিম্নরূপ: bKash বা Nagad পেমেন্টের ক্ষেত্রে মূল পেমেন্ট নম্বরে সরাসরি রিফান্ড করা হবে। COD অর্ডারের ক্ষেত্রে পণ্য ফেরত পাওয়া এবং পরিদর্শনের পরে বিকাশ বা নগদে রিফান্ড দেওয়া হবে। রিফান্ড প্রক্রিয়া সম্পন্ন হতে সাধারণত ৩-৫ কার্যদিবস লাগে। ডেলিভারি চার্জ রিফান্ডযোগ্য নয়, তবে আমাদের ভুলের কারণে রিটার্ন হলে সম্পূর্ণ রিফান্ড (ডেলিভারি চার্জসহ) প্রদান করা হবে। রিটার্ন শিপিং খরচ: আমাদের ভুলের ক্ষেত্রে আমরা বহন করবো, অন্য ক্ষেত্রে গ্রাহক বহন করবেন। রিফান্ড সম্পূর্ণ হলে আপনাকে এসএমএসে জানানো হবে।`,
        bodyEn:`The refund process is as follows: For bKash or Nagad payments, the refund will be made directly to the original payment number. For COD orders, a refund will be provided via bKash or Nagad after receiving and inspecting the product. The refund process usually takes 3-5 business days to complete. Delivery charges are non-refundable, but if the return is due to our error, a full refund (including delivery charges) will be provided. Return shipping cost: We will bear it in case of our error, otherwise the customer will bear it. You will be notified by SMS when the refund is complete.`,
      },
      {
        icon: AlertTriangle, tag:"05",
        titleBn:"রিটার্ন অযোগ্য পণ্য", titleEn:"Non-Returnable Items",
        bodyBn:`নিম্নলিখিত পণ্যগুলো সাধারণত রিটার্ন বা রিফান্ডযোগ্য নয়: ব্যক্তিগত স্বাস্থ্যবিধি সংক্রান্ত পণ্য (একবার ব্যবহারের পরে), ডিজিটাল পণ্য বা সফটওয়্যার লাইসেন্স, কাস্টমাইজড বা বিশেষ অর্ডারের পণ্য, পচনশীল পণ্য, এবং বিক্রয় বা ডিসকাউন্টকৃত পণ্য (বিশেষ অফারের ক্ষেত্রে প্রযোজ্য নয়)। তবে উপরোক্ত পণ্যগুলোতেও যদি উৎপাদন ত্রুটি বা আমাদের ভুল থাকে তাহলে আমরা অবশ্যই সমাধান করবো। কোনো সন্দেহের ক্ষেত্রে সরাসরি আমাদের সাথে যোগাযোগ করুন এবং আমরা সর্বোত্তম সমাধান খুঁজে বের করার চেষ্টা করবো।`,
        bodyEn:`The following products are generally not eligible for return or refund: personal hygiene products (after single use), digital products or software licenses, customized or special order products, perishable items, and sale or discounted products (not applicable for special offers). However, even for the above products, if there is a manufacturing defect or our mistake, we will definitely provide a resolution. In case of any doubt, contact us directly and we will try to find the best solution. Customer satisfaction remains our priority even in complicated return situations.`,
      },
    ],
  },

  /* ──────────── FAQ ──────────── */
  "/faq": {
    icon: HelpCircle,
    accent: { light:"#d97706", dark:"#fbbf24" },
    heroBg: { light:"bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800" },
    titleBn:"সাধারণ জিজ্ঞাসা", titleEn:"Frequently Asked Questions",
    subBn:"আপনার মনের সব প্রশ্নের উত্তর এখানে পাবেন",
    subEn:"Find answers to all your questions here",
    updated:"জানুয়ারি ২০২৫ | January 2025",
    sections: [
      {
        icon: Package, tag:"০১",
        titleBn:"অর্ডার সংক্রান্ত প্রশ্ন", titleEn:"Order Related Questions",
        isFaq: true,
        faqs: [
          {
            qBn:"কীভাবে অর্ডার করবো?", qEn:"How do I place an order?",
            aBn:"পছন্দের পণ্য কার্টে যোগ করুন, তারপর চেকআউট পেজে গিয়ে আপনার নাম, ফোন নম্বর ও ঠিকানা দিন। পেমেন্ট পদ্ধতি বেছে নিন এবং অর্ডার কনফার্ম করুন। অর্ডার সফল হলে আপনি একটি অর্ডার আইডি পাবেন।",
            aEn:"Add your preferred product to the cart, then go to checkout and enter your name, phone number and address. Choose a payment method and confirm the order. Upon successful order, you will receive an order ID.",
          },
          {
            qBn:"অর্ডার কীভাবে ট্র্যাক করবো?", qEn:"How do I track my order?",
            aBn:"অর্ডার ট্র্যাক পেজে (ওয়েবসাইটের /order) যান এবং অর্ডার করার সময় যে ফোন নম্বর দিয়েছিলেন সেটি দিন। আপনার সব অর্ডারের সর্বশেষ অবস্থা দেখতে পাবেন।",
            aEn:"Go to the Order Track page (/order on the website) and enter the phone number you used when placing the order. You will see the latest status of all your orders.",
          },
          {
            qBn:"অর্ডার বাতিল করা যাবে?", qEn:"Can I cancel my order?",
            aBn:"হ্যাঁ, অর্ডার Pending বা Processing অবস্থায় থাকলে বাতিল করা সম্ভব। এর জন্য আমাদের হেল্পলাইনে যোগাযোগ করুন এবং অর্ডার আইডি জানান। Shipped অবস্থায় পৌঁছে গেলে বাতিল করা সম্ভব নাও হতে পারে।",
            aEn:"Yes, it is possible to cancel if the order is in Pending or Processing status. For this, contact our helpline and provide the order ID. It may not be possible to cancel once the order has reached Shipped status.",
          },
          {
            qBn:"একসাথে কতটি পণ্য অর্ডার করা যাবে?", qEn:"How many products can I order at once?",
            aBn:"একটি অর্ডারে যত খুশি পণ্য যোগ করতে পারবেন। বড় অর্ডারে ডেলিভারি বিনামূল্যে হওয়ার সুবিধাও পাবেন (২৫০০ টাকার উপরে)। তবে অস্বাভাবিক বড় অর্ডারের ক্ষেত্রে আমরা যাচাই করার অধিকার রাখি।",
            aEn:"You can add as many products as you like to a single order. For large orders you also get the benefit of free delivery (above ৳2500). However, we reserve the right to verify unusually large orders.",
          },
        ],
      },
      {
        icon: CreditCard, tag:"০২",
        titleBn:"পেমেন্ট সংক্রান্ত প্রশ্ন", titleEn:"Payment Related Questions",
        isFaq: true,
        faqs: [
          {
            qBn:"কোন পেমেন্ট পদ্ধতি ব্যবহার করা যাবে?", qEn:"Which payment methods are available?",
            aBn:"আমরা বর্তমানে তিনটি পেমেন্ট পদ্ধতি গ্রহণ করি: bKash (মার্চেন্ট পেমেন্ট), Nagad (মার্চেন্ট পেমেন্ট), এবং ক্যাশ অন ডেলিভারি (COD)। বিকাশ ও নগদের জন্য মার্চেন্ট নম্বর: 01938360666।",
            aEn:"We currently accept three payment methods: bKash (Merchant Payment), Nagad (Merchant Payment), and Cash on Delivery (COD). Merchant number for bKash and Nagad: 01938360666.",
          },
          {
            qBn:"ট্র্যান্সাকশন আইডি (TrxID) কোথায় পাবো?", qEn:"Where do I find the Transaction ID (TrxID)?",
            aBn:"bKash পেমেন্টের পরে আপনার ফোনে একটি কনফার্মেশন SMS আসবে যেখানে TrxID থাকবে। Nagad এর ক্ষেত্রেও একইভাবে SMS আসবে। TrxID সাধারণত ৮-১০ অক্ষরের একটি কোড।",
            aEn:"After bKash payment, you will receive a confirmation SMS on your phone containing the TrxID. Similarly for Nagad. TrxID is usually an 8-10 character code. You can also find it in your bKash or Nagad app transaction history.",
          },
          {
            qBn:"পেমেন্ট করলাম কিন্তু অর্ডার কনফার্ম হয়নি — কী করবো?", qEn:"I paid but order wasn't confirmed — what to do?",
            aBn:"প্রথমে TrxID ও স্ক্রিনশট সহ আমাদের হেল্পলাইনে যোগাযোগ করুন। আমরা যাচাই করে ২ ঘণ্টার মধ্যে সমাধান করবো। দ্বিতীয়বার পেমেন্ট করবেন না যতক্ষণ না আমরা নিশ্চিত করছি।",
            aEn:"First contact our helpline with the TrxID and screenshot. We will verify and resolve within 2 hours. Do not make a second payment until we confirm. We take all payment disputes seriously and investigate thoroughly.",
          },
          {
            qBn:"COD অর্ডারে কি অতিরিক্ত চার্জ আছে?", qEn:"Are there extra charges for COD orders?",
            aBn:"না, COD অর্ডারে কোনো অতিরিক্ত চার্জ নেই। শুধু সাধারণ ডেলিভারি চার্জ প্রযোজ্য (২৫০০ টাকার উপরে অর্ডারে বিনামূল্যে, অন্যথায় ৬০ টাকা)।",
            aEn:"No, there are no extra charges for COD orders. Only the regular delivery charge applies (free for orders above ৳2500, otherwise ৳60). We believe in transparent pricing with no hidden fees.",
          },
        ],
      },
      {
        icon: Truck, tag:"০৩",
        titleBn:"ডেলিভারি সংক্রান্ত প্রশ্ন", titleEn:"Delivery Related Questions",
        isFaq: true,
        faqs: [
          {
            qBn:"ডেলিভারি কতদিন লাগে?", qEn:"How long does delivery take?",
            aBn:"ঢাকার মধ্যে সাধারণত ১-২ কার্যদিবস এবং ঢাকার বাইরে ২-৪ কার্যদিবস। তবে সরকারি ছুটি, হরতাল বা অন্যান্য কারণে বিলম্ব হতে পারে। আমরা সবসময় দ্রুততম সময়ে ডেলিভারি দেওয়ার চেষ্টা করি।",
            aEn:"Within Dhaka usually 1-2 business days and outside Dhaka 2-4 business days. However, there may be delays due to public holidays, strikes or other reasons. We always try to deliver as quickly as possible.",
          },
          {
            qBn:"ডেলিভারি চার্জ কত?", qEn:"What is the delivery charge?",
            aBn:"২৫০০ টাকা বা তার বেশি মূল্যের অর্ডারে ডেলিভারি সম্পূর্ণ বিনামূল্যে। ২৫০০ টাকার কম মূল্যের অর্ডারে মাত্র ৬০ টাকা ডেলিভারি চার্জ প্রযোজ্য।",
            aEn:"For orders worth ৳2500 or more, delivery is completely free. For orders below ৳2500, a delivery charge of only ৳60 applies. This is one of the most competitive delivery rates in Bangladesh.",
          },
          {
            qBn:"ডেলিভারিম্যান আসলে বাসায় না থাকলে কী হবে?", qEn:"What if I'm not home when the delivery arrives?",
            aBn:"ডেলিভারিম্যান আপনাকে ফোনে যোগাযোগ করবেন। ফোনে পাওয়া না গেলে ২ বার চেষ্টার পরে অর্ডারটি ফেরত আসতে পারে। তাই অর্ডার ট্র্যাক করে নিজেকে প্রস্তুত রাখুন।",
            aEn:"The delivery person will contact you by phone. If not reachable, the order may be returned after 2 attempts. So track your order and keep yourself prepared. You can also leave a delivery note with specific instructions when placing your order.",
          },
          {
            qBn:"কি পুরো বাংলাদেশে ডেলিভারি দেওয়া হয়?", qEn:"Do you deliver all over Bangladesh?",
            aBn:"হ্যাঁ, আমরা বাংলাদেশের সকল ৬৪টি জেলায় ডেলিভারি প্রদান করি। দুর্গম এলাকায় কিছুটা বেশি সময় লাগতে পারে। যেকোনো এলাকায় ডেলিভারি সম্পর্কে জানতে আমাদের সাথে যোগাযোগ করুন।",
            aEn:"Yes, we deliver to all 64 districts of Bangladesh. Remote areas may take a bit more time. Contact us to know about delivery to any specific area. We partner with reliable courier services to ensure your package reaches safely.",
          },
        ],
      },
      {
        icon: Star, tag:"০৪",
        titleBn:"পণ্য সংক্রান্ত প্রশ্ন", titleEn:"Product Related Questions",
        isFaq: true,
        faqs: [
          {
            qBn:"পণ্যের মান কীভাবে নিশ্চিত করা হয়?", qEn:"How is product quality ensured?",
            aBn:"আমরা প্রতিটি পণ্য বিক্রির আগে মান যাচাই করি। বিশ্বস্ত সরবরাহকারীদের কাছ থেকে পণ্য সংগ্রহ করা হয়। কোনো পণ্যে সমস্যা পাওয়া গেলে আমরা বিনা প্রশ্নে পরিবর্তন করি।",
            aEn:"We verify the quality of every product before selling. Products are sourced from trusted suppliers. If any problem is found with a product, we replace it without question. Quality assurance is a core part of our business process.",
          },
          {
            qBn:"ছবির সাথে পণ্যের মিল না থাকলে কী করবো?", qEn:"What if the product doesn't match the image?",
            aBn:"পণ্য পাওয়ার ২৪ ঘণ্টার মধ্যে ছবিসহ আমাদের জানান। আমরা পর্যালোচনা করে সঠিক পণ্য পাঠানো বা রিফান্ড দেওয়ার ব্যবস্থা করবো। ছোটখাটো রঙের পার্থক্য (আলোর কারণে) সাধারণত রিটার্নযোগ্য নয়।",
            aEn:"Inform us with photos within 24 hours of receiving the product. We will review and arrange to send the correct product or provide a refund. Minor color differences (due to lighting) are generally not returnable. We take significant product discrepancies very seriously.",
          },
          {
            qBn:"পণ্যটি স্টকে না থাকলে কী হবে?", qEn:"What if the product is out of stock?",
            aBn:"অর্ডার দেওয়ার পরে যদি পণ্যটি স্টকে না থাকে তাহলে আমরা আপনাকে অবিলম্বে ফোনে জানাবো। আপনি চাইলে অপেক্ষা করতে পারেন বা বিকল্প পণ্য নিতে পারেন অথবা সম্পূর্ণ রিফান্ড পাবেন।",
            aEn:"If the product is not in stock after placing an order, we will immediately inform you by phone. You can choose to wait, take an alternative product, or receive a full refund. We try to keep our inventory updated to minimize such occurrences.",
          },
        ],
      },
    ],
  },
};

/* ════════════════════════════════════════════════
   FAQ ACCORDION ITEM
════════════════════════════════════════════════ */
function FaqItem({ q, a, accent, accentBg, isDark }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl overflow-hidden border transition-all duration-200"
      style={{
        borderColor: open ? `${accent}44` : isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
        background:  open ? accentBg : isDark ? "rgba(255,255,255,0.02)" : "#fafafa",
      }}>
      <button onClick={()=>setOpen(o=>!o)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left gap-3"
        type="button">
        <p className="text-sm font-semibold leading-snug" style={{color:isDark?"rgba(255,255,255,0.85)":"#1e293b"}}>{q}</p>
        <motion.div animate={{rotate:open?180:0}} transition={{duration:0.2}} className="flex-shrink-0">
          <ChevronDown size={15} style={{color:accent}}/>
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open&&(
          <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}}
            exit={{height:0,opacity:0}} transition={{duration:0.25,ease:[0.4,0,0.2,1]}}>
            <p className="px-4 pb-4 text-sm leading-relaxed"
              style={{color:isDark?"rgba(255,255,255,0.55)":"#475569",borderTop:`1px solid ${isDark?"rgba(255,255,255,0.05)":"#f1f5f9"}`}}>
              <span className="block pt-3">{a}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════ */
export default function PolicyPage() {
  const location  = useLocation();
  const t         = useT();
  const [isDark, setIsDark] = useState(false);
  const policy    = POLICIES[location.pathname];

  useEffect(()=>{ window.scrollTo(0,0); },[location.pathname]);

  if (!policy) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:"#f8f7f4"}}>
      <div className="text-center">
        <p className="text-slate-400 mb-4">Page not found</p>
        <Link to="/" className="text-emerald-600 font-semibold hover:underline">Go Home</Link>
      </div>
    </div>
  );

  const { icon:PageIcon, accent, heroBg, titleBn, titleEn, subBn, subEn, updated, sections } = policy;
  const accentColor = isDark ? accent.dark : accent.light;
  const accentBg    = `${accentColor}14`;
  const others      = ALL_POLICIES.filter(p=>p.to!==location.pathname);

  return (
    <div className="min-h-screen transition-colors duration-300"
      style={{background: isDark ? "#0d1117" : "#f8f7f4"}}>

      {/* ── Hero ── */}
      <div className={`relative overflow-hidden ${isDark ? "" : heroBg.light}`}
        style={{background: isDark ? heroBg.dark : undefined}}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-[0.07]"
            style={{background:`radial-gradient(circle,${accentColor},transparent)`,transform:"translate(30%,-30%)"}}/>
          <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-[0.05]"
            style={{background:`radial-gradient(circle,${accentColor},transparent)`,transform:"translate(-30%,30%)"}}/>
          <div className="absolute inset-0 opacity-[0.025]"
            style={{backgroundImage:"linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)",backgroundSize:"40px 40px"}}/>
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-7 sm:pt-10 pb-14 sm:pb-16">
          {/* top row */}
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
              style={{color:"rgba(255,255,255,0.4)"}}>
              <ArrowLeft size={13}/>{t("হোমে ফিরুন","Back to Home")}
            </Link>
          </div>
          {/* Title */}
          <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.4}}
            className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.18)"}}>
              <PageIcon size={22} style={{color:accentColor}}/>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight">{t(titleBn,titleEn)}</h1>
              <p className="text-xs sm:text-sm mt-0.5" style={{color:"rgba(255,255,255,0.45)"}}>{t(subBn,subEn)}</p>
            </div>
          </motion.div>
          <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.2}}
            className="flex items-center gap-1.5 text-[11px]" style={{color:"rgba(255,255,255,0.3)"}}>
            <Clock size={10}/>{t("সর্বশেষ আপডেট:","Last updated:")} {updated}
          </motion.p>
        </div>
      </div>



      {/* ── Content ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-6 pb-16 space-y-4">

        {sections.map((sec, si)=>{
          const SIcon = sec.icon;
          return (
            <motion.div key={si}
              initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}}
              viewport={{once:true,margin:"-30px"}} transition={{duration:0.4,delay:si*0.06}}
              className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm transition-colors duration-300"
              style={{
                background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
                border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #f1f5f9",
              }}>
              {/* Section header */}
              <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b transition-colors"
                style={{background:accentBg, borderColor: isDark?"rgba(255,255,255,0.05)":"#f8fafc"}}>
                <span className="text-[10px] font-black uppercase tracking-widest flex-shrink-0"
                  style={{color:`${accentColor}88`}}>{sec.tag}</span>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{background:`${accentColor}20`,border:`1px solid ${accentColor}33`}}>
                  <SIcon size={14} style={{color:accentColor}}/>
                </div>
                <h2 className="text-sm font-bold" style={{color: isDark?"rgba(255,255,255,0.9)":"#1e293b"}}>
                  {t(sec.titleBn,sec.titleEn)}
                </h2>
              </div>

              {/* Body */}
              <div className="px-5 sm:px-6 py-5">
                {sec.isFaq ? (
                  <div className="space-y-2.5">
                    {sec.faqs.map((faq,fi)=>(
                      <FaqItem key={fi} q={t(faq.qBn,faq.qEn)} a={t(faq.aBn,faq.aEn)}
                        accent={accentColor} accentBg={accentBg} isDark={isDark}/>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-[1.9] transition-colors"
                    style={{color: isDark?"rgba(255,255,255,0.6)":"#475569"}}>
                    {t(sec.bodyBn,sec.bodyEn)}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}




        {/* ── Other policies ── */}
        <motion.div initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}}
          viewport={{once:true}} transition={{duration:0.4,delay:0.15}}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{color: isDark?"rgba(255,255,255,0.3)":"#94a3b8"}}>
            {t("অন্যান্য পলিসি","Other Policies")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {others.map(({to,bn:b,en:e,icon:Icon})=>(
              <Link key={to} to={to}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-sm transition-all hover:scale-[1.01] group"
                style={{
                  background: isDark ? "rgba(255,255,255,0.04)" : "#ffffff",
                  border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #f1f5f9",
                }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{background: isDark?"rgba(255,255,255,0.05)":"#f8fafc"}}>
                  <Icon size={15} style={{color: isDark?"rgba(255,255,255,0.3)":accentColor}}/>
                </div>
                <span className="text-xs font-semibold flex-1 transition-colors"
                  style={{color: isDark?"rgba(255,255,255,0.6)":"#475569"}}>
                  {t(b,e)}
                </span>
                <Zap size={10} style={{color: isDark?"rgba(255,255,255,0.2)":accentColor, opacity:0.6}}/>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}