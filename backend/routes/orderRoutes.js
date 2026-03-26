const express  = require("express");
const router   = express.Router();
const jwt      = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware");
const { protectCustomer } = require("../middleware/customerMiddleware");

const {
  createOrder, trackOrders,
  getOrders, getDeliveryOrders, getSingleOrder,
  updateOrderStatus, confirmDelivery,
  deleteOrder, customerHideOrder,
  getOrderLogs, deleteOrderLog, clearAllOrderLogs,
} = require("../controllers/orderController");



//admin or subadmin route
const protectAny = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer"))
      token = req.headers.authorization.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Not authorized, no token." });

    let decoded;
    try { decoded = jwt.verify(token, process.env.JWT_SECRET || "nahidenterpriseSecret123"); }
    catch { return res.status(401).json({ message: "Token failed." }); }

    const User     = require("../models/User");
    const SubAdmin = require("../models/SubAdmin");

    const user = await User.findById(decoded.id).select("-password");
    if (user) { req.user = user; return next(); }

    const sub = await SubAdmin.findById(decoded.id).select("-password -inviteToken");
    if (sub && sub.status === "approved") { req.user = sub; return next(); }

    return res.status(401).json({ message: "Not authorized." });
  } catch {
    return res.status(401).json({ message: "Not authorized." });
  }
};


//order create and track
router.post("/",     createOrder);
router.get("/track", trackOrders);


router.put("/:id/hide", protectCustomer, customerHideOrder);

router.get("/logs",        protect, getOrderLogs);
router.delete("/logs",     protect, clearAllOrderLogs);
router.delete("/logs/:id", protect, deleteOrderLog);

//admin  and subadmin
router.get("/",                      protectAny, getOrders);
router.get("/delivery",              protectAny, getDeliveryOrders);
router.get("/:id",                   protectAny, getSingleOrder);
router.put("/:id/status",            protectAny, updateOrderStatus);
router.post("/:id/confirm-delivery", protectAny, confirmDelivery);

router.delete("/:id", protect, deleteOrder);

module.exports = router;