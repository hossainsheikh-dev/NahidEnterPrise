const Product  = require("../models/Product");
const Link     = require("../models/Link");
const Sublink  = require("../models/Sublink");

const calcSalePrice = (p) => {
  if (p.discountType === "percent" && p.discountValue > 0)
    return Math.round(p.price - (p.price * p.discountValue) / 100);
  if (p.discountType === "flat" && p.discountValue > 0)
    return Math.max(0, p.price - p.discountValue);
  return p.price;
};



// get /api/category/:linkSlug
exports.getByLink = async (req, res) => {
  try {
    const link = await Link.findOne({ slug: req.params.linkSlug });
    if (!link)
      return res.status(404).json({ success: false, message: "Category not found" });

    const products = await Product.find({ link: link._id, isActive: true })
      .populate("link",    "name slug")
      .populate("sublink", "name slug")
      .sort({ isFeatured: -1, createdAt: -1 })
      .lean();

    const data = products.map((p) => ({ ...p, salePrice: calcSalePrice(p) }));

    res.json({ success: true, title: link.name, data });
  } catch (err) {
    console.error("CATEGORY BY LINK ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};



//get /api/category/:linkSlug/:sublinkSlug
exports.getBySublink = async (req, res) => {
  try {
    const link = await Link.findOne({ slug: req.params.linkSlug });
    if (!link)
      return res.status(404).json({ success: false, message: "Category not found" });

    const sublink = await Sublink.findOne({
      slug:   req.params.sublinkSlug,
      parent: link._id,
    });
    if (!sublink)
      return res.status(404).json({ success: false, message: "Subcategory not found" });

    const products = await Product.find({ sublink: sublink._id, isActive: true })
      .populate("link",    "name slug")
      .populate("sublink", "name slug")
      .sort({ isFeatured: -1, createdAt: -1 })
      .lean();

    const data = products.map((p) => ({ ...p, salePrice: calcSalePrice(p) }));

    res.json({ success: true, title: sublink.name, data });
  } catch (err) {
    console.error("CATEGORY BY SUBLINK ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};