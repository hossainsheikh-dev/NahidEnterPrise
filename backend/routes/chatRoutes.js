const express = require("express");
const router  = express.Router();
const { protectSoft }     = require("../middleware/authMiddleware");
const { protectSubAdmin } = require("../middleware/subAdminMiddleware");
const { getChatHistory, markSeen, getUnreadCount } = require("../controllers/chatController");

const protectAny = (req, res, next) => {
  protectSoft(req, res, (adminErr) => {
    if (!adminErr && req.user) {
      req.userType = 'admin';
      return next();
    }
    protectSubAdmin(req, res, (subErr) => {
      if (!subErr && req.subAdmin) {
        req.userType = 'subadmin';
        return next();
      }
      return res.status(401).json({ message: "Not authorized" });
    });
  });
};

router.get("/unread",        protectAny, getUnreadCount);
router.get("/:otherId",      protectAny, getChatHistory);
router.put("/:otherId/seen", protectAny, markSeen);

module.exports = router;