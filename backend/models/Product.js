const mongoose = require("mongoose");


//slug create
function generateSlug(name) {
  const english = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  if (english.length > 2) return english;
  return name.trim().replace(/\s+/g, "-").replace(/[^\w\u0980-\u09FF-]/g, "").toLowerCase();
}


//product schema
const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    price:       { type: Number, required: true },

    discountType:  { type: String, enum: ["none", "percent", "flat"], default: "none" },
    discountValue: { type: Number, default: 0 },

    features: [
      {
        key:   { type: String, trim: true },
        value: { type: String, trim: true },
      },
    ],

    isFeatured: { type: Boolean, default: false },

    images: [
      {
        url:       { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],

    stock: { type: Number, default: 0 },

    //link is mandatory for adding product
    link: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Link",
      required: true,
    },

    //sublink which is optional
    sublink: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sublink",
      required: false,
      default: null,
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.virtual("salePrice").get(function () {
  if (this.discountType === "percent" && this.discountValue > 0)
    return Math.round(this.price - (this.price * this.discountValue) / 100);
  if (this.discountType === "flat" && this.discountValue > 0)
    return Math.max(0, this.price - this.discountValue);
  return this.price;
});

productSchema.set("toJSON",   { virtuals: true });
productSchema.set("toObject", { virtuals: true });

productSchema.pre("save", async function () {
  if (!this.isModified("name") && this.slug) return;
  let baseSlug = generateSlug(this.name);
  let slug = baseSlug;
  let count = 1;
  while (await mongoose.models.Product.findOne({ slug, _id: { $ne: this._id } })) {
    slug = `${baseSlug}-${count++}`;
  }
  this.slug = slug;
});

module.exports = mongoose.model("Product", productSchema);