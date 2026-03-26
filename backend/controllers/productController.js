const mongoose   = require("mongoose");
const Product    = require("../models/Product");
const { cloudinary } = require("../config/cloudinaryConfig");



//product schema
const productLogSchema = new mongoose.Schema(
  {
    action:           { type: String, enum: ["created", "updated", "deleted"], required: true },
    product:          { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
    productName:      { type: String, required: true },
    productSlug:      { type: String, default: "" },
    performedBy:      { type: mongoose.Schema.Types.ObjectId, refPath: "performedByModel", required: true },
    performedByModel: { type: String, enum: ["User", "SubAdmin"], required: true },
    performedByName:  { type: String, required: true },
    performedByEmail: { type: String, required: true },
    performedByRole:  { type: String, required: true },
    changes:          { type: Object, default: null },
    note:             { type: String, default: "" },
  },
  { timestamps: true }
);

const ProductLog = mongoose.models.ProductLog
  || mongoose.model("ProductLog", productLogSchema);


//helper
const calcSalePrice = (p) => {
  if (p.discountType === "percent" && p.discountValue > 0)
    return Math.round(p.price - (p.price * p.discountValue) / 100);
  if (p.discountType === "flat" && p.discountValue > 0)
    return Math.max(0, p.price - p.discountValue);
  return p.price;
};

const parseFeatures = (features) => {
  if (!features) return [];
  try {
    const parsed = typeof features === "string" ? JSON.parse(features) : features;
    return Array.isArray(parsed)
      ? parsed.filter((f) => f.key?.trim() && f.value?.trim())
      : [];
  } catch { return []; }
};

const getActorInfo = (user) => {
  const isSubAdmin = user.role === "subadmin";
  return {
    performedBy:       user._id,
    performedByModel:  isSubAdmin ? "SubAdmin" : "User",
    performedByName:   user.name  || "Unknown",
    performedByEmail:  user.email || "Unknown",
    performedByRole:   user.role  || "admin",
  };
};



//create collections
exports.createProduct = async (req, res) => {
  try {
    const {
      name, description, price, stock, link, sublink,
      isActive, discountType, discountValue, isFeatured, features,
    } = req.body;

    if (!name || !description || !price)
      return res.status(400).json({ success: false, message: "Name, description and price are required" });
    if (!link)
      return res.status(400).json({ success: false, message: "Link is required" });

    const images = req.files?.map((f) => ({ url: f.path, public_id: f.filename })) || [];
    if (images.length === 0)
      return res.status(400).json({ success: false, message: "At least one image is required" });

    const product = await Product.create({
      name, description, price,
      stock:         stock || 0,
      link,
      sublink:       sublink || null,
      isActive:      isActive === "true" || isActive === true,
      discountType:  discountType || "none",
      discountValue: parseFloat(discountValue) || 0,
      isFeatured:    isFeatured === "true" || isFeatured === true,
      features:      parseFeatures(features),
      images,
    });

    try {
      await ProductLog.create({
        action:      "created",
        product:     product._id,
        productName: product.name,
        productSlug: product.slug || "",
        ...getActorInfo(req.user),
      });
    } catch (logErr) { console.log("Log error:", logErr.message); }

    res.status(201).json({ success: true, message: "Product created successfully", data: product });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};



//get all product by admin and subadmin
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("sublink")
      .populate("link")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



//get public all
exports.getPublicProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate("sublink", "name slug")
      .populate("link", "name slug")
      .sort({ isFeatured: -1, createdAt: -1 })
      .lean();
    const data = products.map((p) => ({ ...p, salePrice: calcSalePrice(p) }));
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



//get by slug by publiv
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate("sublink", "name slug")
      .populate("link", "name slug")
      .lean();
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, data: { ...product, salePrice: calcSalePrice(product) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



//get single
exports.getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("sublink")
      .populate("link");
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



//update product
exports.updateProduct = async (req, res) => {
  try {
    const {
      name, description, price, stock, link, sublink,
      isActive, discountType, discountValue, isFeatured, features,
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });
    if (!link)
      return res.status(400).json({ success: false, message: "Link is required" });

    const changes = {};
    if (name && name !== product.name)
      changes.name = { from: product.name, to: name };
    if (price && price != product.price)
      changes.price = { from: product.price, to: price };
    if (stock != null && stock != product.stock)
      changes.stock = { from: product.stock, to: stock };
    if (discountType && discountType !== product.discountType)
      changes.discountType = { from: product.discountType, to: discountType };
    if (discountValue != null && discountValue != product.discountValue)
      changes.discountValue = { from: product.discountValue, to: discountValue };
    if (isActive != null && (isActive === "true") !== product.isActive)
      changes.isActive = { from: product.isActive, to: isActive };
    if (req.files && req.files.length > 0)
      changes.images = "Images replaced";

    let images = product.images;
    if (req.files && req.files.length > 0) {
      for (const img of product.images) await cloudinary.uploader.destroy(img.public_id);
      images = req.files.map((f) => ({ url: f.path, public_id: f.filename }));
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name, description, price,
          stock:         stock || 0,
          link,
          sublink:       sublink || null,
          isActive:      isActive === "true" || isActive === true,
          discountType:  discountType || "none",
          discountValue: parseFloat(discountValue) || 0,
          isFeatured:    isFeatured === "true" || isFeatured === true,
          features:      parseFeatures(features),
          images,
        },
      },
      { returnDocument: "after", runValidators: false }
    );

    try {
      await ProductLog.create({
        action:      "updated",
        product:     updated._id,
        productName: updated.name,
        productSlug: updated.slug || "",
        changes:     Object.keys(changes).length ? changes : null,
        ...getActorInfo(req.user),
      });
    } catch (logErr) { console.log("Log error:", logErr.message); }

    res.status(200).json({ success: true, message: "Product updated successfully", data: updated });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};



//delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    try {
      await ProductLog.create({
        action:      "deleted",
        product:     null,
        productName: product.name,
        productSlug: product.slug || "",
        ...getActorInfo(req.user),
      });
    } catch (logErr) { console.log("Log error:", logErr.message); }

    for (const img of product.images) await cloudinary.uploader.destroy(img.public_id);
    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



//get sublink by public
exports.getProductsBySublink = async (req, res) => {
  try {
    const products = await Product.find({ sublink: req.params.sublinkId, isActive: true })
      .populate("sublink")
      .populate("link")
      .lean();
    const data = products.map((p) => ({ ...p, salePrice: calcSalePrice(p) }));
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



//get product logs by only admin
exports.getProductLogs = async (req, res) => {
  try {
    const { action, role, search, page = 1, limit = 15 } = req.query;

    const filter = {};
    if (action) filter.action = action;
    if (role)   filter.performedByRole = role;
    if (search) filter.$or = [
      { productName:      { $regex: search, $options: "i" } },
      { performedByName:  { $regex: search, $options: "i" } },
      { performedByEmail: { $regex: search, $options: "i" } },
    ];

    const total = await ProductLog.countDocuments(filter);
    const logs  = await ProductLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data:    logs,
      total,
      page:    Number(page),
      pages:   Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET LOGS ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};



//delete single logs
exports.deleteProductLog = async (req, res) => {
  try {
    const log = await ProductLog.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ success: false, message: "Log not found." });
    res.json({ success: true, message: "Log deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



//delete all logs
exports.clearAllProductLogs = async (req, res) => {
  try {
    await ProductLog.deleteMany({});
    res.json({ success: true, message: "All logs cleared." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};