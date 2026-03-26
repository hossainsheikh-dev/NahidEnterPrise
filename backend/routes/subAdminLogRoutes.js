const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getSubAdminLogs,
  deleteSubAdminLog,
  clearSubAdminLogs,
} = require("../controllers/subAdminLogController");

router.get  ("/",    protect, getSubAdminLogs);
router.delete("/all", protect, clearSubAdminLogs);
router.delete("/:id", protect, deleteSubAdminLog);

module.exports = router;

