const express = require("express");
const router  = express.Router();
const { protect }         = require("../middleware/authMiddleware");
const { protectSubAdmin } = require("../middleware/subAdminMiddleware");

const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  getAdminInfo,
} = require("../controllers/authController");

const {
  getAllCustomers,
  getCustomerOrders,
  toggleBlockCustomer,
} = require("../controllers/authController");

const {
  sendOtp, verifyOtp, sendForgotOtp, verifyForgotOtp, resetPassword,
} = require("../controllers/adminOtpController");

router.post("/register",          registerUser);
router.post("/login",             loginUser);
router.get( "/profile",           protect, getProfile);
router.put( "/profile",           protect, updateProfile);
router.get( "/admin-info",        protectSubAdmin, getAdminInfo);
router.post("/send-otp",          protect, sendOtp);
router.post("/verify-otp",        protect, verifyOtp);
router.post("/forgot-otp",        sendForgotOtp);
router.post("/verify-forgot-otp", verifyForgotOtp);
router.post("/reset-password",    resetPassword);

// ── Customer / User routes ──
router.get("/users",                    protect, getAllCustomers);
router.get("/users/:identifier/orders", protect, getCustomerOrders);
router.put("/users/:id/block",          protect, toggleBlockCustomer);

module.exports = router;


