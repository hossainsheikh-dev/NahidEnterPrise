const express  = require("express");
const router   = express.Router();
const jwt      = require("jsonwebtoken");
const { upload } = require("../config/cloudinaryConfig");
const { protect } = require("../middleware/authMiddleware");

const {
  createProduct, getProducts, getPublicProducts,
  getSingleProduct, getProductBySlug, updateProduct,
  deleteProduct, getProductsBySublink,
  getProductLogs, deleteProductLog, clearAllProductLogs,
} = require("../controllers/productController");

//upload helper
const uploadMiddleware = (req, res, next) => {
  upload.array("images", 5)(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
};

//admin or subadmin
const protectAny = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer"))
      token = req.headers.authorization.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Not authorized, no token." });

    let decoded;
    try { decoded = jwt.verify(token, process.env.JWT_SECRET); }
    catch { return res.status(401).json({ message: "Token failed." }); }

    const User     = require("../models/User");
    const SubAdmin = require("../models/SubAdmin");

    const user = await User.findById(decoded.id).select("-password");
    if (user) { req.user = user; return next(); }

    const subAdmin = await SubAdmin.findById(decoded.id).select("-password -inviteToken");
    if (subAdmin && subAdmin.status === "approved") { req.user = subAdmin; return next(); }

    return res.status(401).json({ message: "Not authorized." });
  } catch (err) {
    return res.status(401).json({ message: "Not authorized." });
  }
};


//most ordered product
router.get("/most-ordered", async (req, res) => {
  try {
    const Order = require("../models/Order");
    const limit = parseInt(req.query.limit) || 8;

    const result = await Order.aggregate([
      { $unwind: "$items" },
      { $group: {
        _id: "$items.productId",
        orderCount: { $sum: "$items.quantity" },
        name: { $first: "$items.name" },
        slug: { $first: "$items.slug" },
        image: { $first: "$items.image" },
        price: { $first: "$items.price" },
        salePrice: { $first: "$items.salePrice" },
      }},
      { $sort: { orderCount: -1 } },
      { $limit: limit },
    ]);

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

//most wishlist product
router.get("/most-wishlisted", async (req, res) => {
  try {
    const Customer = require("../models/Customer");
    const limit = parseInt(req.query.limit) || 8;

    const result = await Customer.aggregate([
      { $unwind: "$wishlist" },
      { $group: {
        _id: "$wishlist",
        wishlistCount: { $sum: 1 },
      }},
      { $sort: { wishlistCount: -1 } },
      { $limit: limit },
      { $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      }},
      { $unwind: "$product" },
      { $match: { "product.isActive": true } },
      { $replaceRoot: {
        newRoot: {
          $mergeObjects: ["$product", { wishlistCount: "$wishlistCount" }]
        }
      }},
    ]);

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


router.get("/public",             getPublicProducts);
router.get("/slug/:slug",         getProductBySlug);
router.get("/sublink/:sublinkId", getProductsBySublink);

router.get("/logs",       protect, getProductLogs);
router.delete("/logs",    protect, clearAllProductLogs);
router.delete("/logs/:id",protect, deleteProductLog);

router.post("/",      protectAny, uploadMiddleware, createProduct);
router.get("/",       protectAny, getProducts);
router.get("/:id",    getSingleProduct);
router.put("/:id",    protectAny, uploadMiddleware, updateProduct);
router.delete("/:id", protectAny, deleteProduct);

module.exports = router;