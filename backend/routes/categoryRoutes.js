const express = require("express");
const router  = express.Router();
const Product = require("../models/Product");
const Sublink = require("../models/Sublink");
const Link    = require("../models/Link");

function formatProduct(p) {
  let salePrice = p.price;
  if (p.discountType === "percentage" && p.discountValue > 0)
    salePrice = Math.round(p.price * (1 - p.discountValue / 100));
  else if (p.discountType === "fixed" && p.discountValue > 0)
    salePrice = Math.max(0, p.price - p.discountValue);

  let image = "";
  if (p.image?.url)                                image = p.image.url;
  else if (typeof p.image === "string" && p.image)  image = p.image;
  else if (Array.isArray(p.images) && p.images[0])
    image = p.images[0]?.url || p.images[0] || "";

  return { ...p, salePrice, image };
}

//get catagory
router.get("/:linkSlug", async (req, res) => {
  try {
    const { linkSlug } = req.params;

    const link = await Link.findOne({ slug: linkSlug }).lean();
    if (!link) return res.json({ success: false, message: "Category not found" }); // ← এখানে

    const sublinks = await Sublink.find({ parent: link._id }).lean();
    const sublinkIds = sublinks.map(s => s._id);

    const products = await Product.find({
      $or: [
        { sublink: { $in: sublinkIds } },
        { link: link._id },
      ],
    })
      .select("name slug image images price discountType discountValue stock createdAt sublink")
      .lean();

    const data = products.map(formatProduct);
    res.json({ success: true, title: link.name, count: data.length, data });
  } catch (err) {
    console.error("LINK CATEGORY ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

//get sublink
router.get("/:linkSlug/:sublinkSlug", async (req, res) => {
  try {
    const { linkSlug, sublinkSlug } = req.params;

    const link = await Link.findOne({ slug: linkSlug }).lean();
    if (!link) return res.json({ success: false, message: "Category not found" }); // ← এখানে

    const sublink = await Sublink.findOne({ slug: sublinkSlug, parent: link._id }).lean();
    if (!sublink) return res.json({ success: false, message: "Subcategory not found" }); // ← এখানে

    const products = await Product.find({ sublink: sublink._id })
      .select("name slug image images price discountType discountValue stock createdAt sublink")
      .lean();

    const data = products.map(formatProduct);
    res.json({ success: true, title: sublink.name, count: data.length, data });
  } catch (err) {
    console.error("SUBLINK CATEGORY ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;