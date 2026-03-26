const express = require("express");
const router  = express.Router();
const jwt     = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware");

const {
  createSublink, getSublinks, getSingleSublink,
  updateSublink, deleteSublink,
  getSublinkLogs, deleteSublinkLog, clearAllSublinkLogs,
} = require("../controllers/sublinkController");


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

    const sub = await SubAdmin.findById(decoded.id).select("-password -inviteToken");
    if (sub && sub.status === "approved") { req.user = sub; return next(); }

    return res.status(401).json({ message: "Not authorized." });
  } catch { return res.status(401).json({ message: "Not authorized." }); }
};


const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return next();
    const jwt2     = require("jsonwebtoken");
    const User     = require("../models/User");
    const SubAdmin = require("../models/SubAdmin");
    const decoded  = jwt2.verify(token, process.env.JWT_SECRET);
    const user     = await User.findById(decoded.id).select("-password");
    if (user) { req.user = user; return next(); }
    const sub = await SubAdmin.findById(decoded.id).select("-password -inviteToken");
    if (sub && sub.status === "approved") { req.user = sub; }
    return next();
  } catch { return next(); }
};


router.get("/logs",        protect, getSublinkLogs);
router.delete("/logs",     protect, clearAllSublinkLogs);
router.delete("/logs/:id", protect, deleteSublinkLog);


router.get("/",    getSublinks);
router.get("/:id", getSingleSublink);


router.post("/",      protectAny, createSublink);
router.put("/:id",    protectAny, updateSublink);
router.delete("/:id", protectAny, deleteSublink);

module.exports = router;