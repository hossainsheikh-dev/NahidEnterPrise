const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    type:     { type: String, enum: ["image", "clean"], default: "image" },

    image: {
      url:       { type: String, default: "" },
      public_id: { type: String, default: "" },
    },

    bgType:    { type: String, enum: ["solid", "gradient"], default: "solid" },
    bgColor:   { type: String, default: "#1a2e1a" },   // solid color
    bgGradient:{ type: String, default: "" },           // e.g. "135deg,#1a2e1a,#4caf50"

    title:    { type: String, trim: true, default: "" },
    subtitle: { type: String, trim: true, default: "" },
    badge:    { type: String, trim: true, default: "" },
    link:     { type: String, trim: true, default: "" },

    titleColor:    { type: String, default: "#ffffff" },
    subtitleColor: { type: String, default: "#ffffffb3" },
    badgeBg:       { type: String, default: "#ff6b35" },
    badgeText:     { type: String, default: "#ffffff" },
    ctaBg:         { type: String, default: "#ffffff" },
    ctaText:       { type: String, default: "#1a2e1a" },

    isActive: { type: Boolean, default: true },
    order:    { type: Number,  default: 0, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);