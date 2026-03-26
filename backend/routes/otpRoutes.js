const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { sendOtp, verifyOtp } = require("../controllers/adminOtpController");

router.post("/send-otp",   protect, sendOtp);
router.post("/verify-otp", protect, verifyOtp);

module.exports = router;