const express  = require("express");
const router   = express.Router();
const { getSettings, updateSettings } = require("../controllers/settingsController");
const { protect } = require("../middleware/authMiddleware");

router.get("/",    getSettings);                  // public cart 
router.put("/",    protect, updateSettings);       // admin only

module.exports = router;