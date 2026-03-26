const express = require("express");
const router  = express.Router();
const jwt     = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware");
const {
  createLink, getLinks, updateLink, deleteLink,
  getLinkLogs, deleteLinkLog, clearAllLinkLogs,
} = require("../controllers/linkController");

/* ── Admin OR SubAdmin ── */
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

//admin logs
router.get("/logs",        protect, getLinkLogs);
router.delete("/logs",     protect, clearAllLinkLogs);
router.delete("/logs/:id", protect, deleteLinkLog);

//public
router.get("/", getLinks);

// admin and subadmin write
router.post("/",    protectAny, createLink);
router.put("/:id",  protectAny, updateLink);
router.delete("/:id", protectAny, deleteLink);

module.exports = router;