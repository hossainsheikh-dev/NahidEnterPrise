const express = require("express");
const router  = express.Router();
const { protect }         = require("../middleware/authMiddleware");
const { protectSubAdmin } = require("../middleware/subAdminMiddleware");

const {
  registerSubAdmin,
  getAllSubAdmins,
  getPendingCount,
  approveSubAdmin,
  rejectSubAdmin,
  deleteSubAdmin,
  loginSubAdmin,
  verifySubAdminOtp,
  getSubAdminProfile,
  updateSubAdminProfile,
  changeSubAdminPassword,
  requestProfileChange,
  getChangeRequestCount,
  getPendingChangeRequests,
  resolveChangeRequest,
  sendForgotOtp, 
  verifyForgotOtp, 
  resetSubAdminPassword,
} = require("../controllers/subAdminController");



router.post("/register",   registerSubAdmin);
router.post("/login",      loginSubAdmin);
router.post("/verify-otp", verifySubAdminOtp);


router.get ("/profile",         protectSubAdmin, getSubAdminProfile);
router.put ("/profile",         protectSubAdmin, updateSubAdminProfile);
router.put ("/change-password", protectSubAdmin, changeSubAdminPassword);
router.post("/request-change",  protectSubAdmin, requestProfileChange);
router.post("/forgot-otp",        sendForgotOtp);
router.post("/verify-forgot-otp", verifyForgotOtp);
router.post("/reset-password",    resetSubAdminPassword);
router.get ("/list",            protectSubAdmin, getAllSubAdmins);


router.get ("/",                        protect, getAllSubAdmins);
router.get ("/pending-count",           protect, getPendingCount);
router.get ("/change-requests/count",   protect, getChangeRequestCount);
router.get ("/change-requests",         protect, getPendingChangeRequests);
router.post("/change-requests/resolve", protect, resolveChangeRequest);
router.put ("/approve/:id",             protect, approveSubAdmin);
router.put ("/reject/:id",              protect, rejectSubAdmin);
router.delete("/:id",                   protect, deleteSubAdmin);

module.exports = router;