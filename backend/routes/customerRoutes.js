const express  = require("express");
const router   = express.Router();
const passport = require("passport");
const {
  register, login, getProfile, updateProfile,
  changePassword, sendForgotOtp, verifyForgotOtp,
  resetPassword, toggleWishlist, getWishlist,
  verifyEmailExists, updateAddress,
} = require("../controllers/customerController");
const { protectCustomer } = require("../middleware/customerMiddleware");
const generateToken = require("../utils/generateToken");

//public
router.post("/register",          register);
router.post("/login",             login);
router.post("/forgot-otp",        sendForgotOtp);
router.post("/verify-forgot-otp", verifyForgotOtp);
router.post("/reset-password",    resetPassword);
router.post("/verify-email",      verifyEmailExists); // ← NEW: nodemailer SMTP check

//protected
router.get ("/profile",         protectCustomer, getProfile);
router.put ("/profile",         protectCustomer, updateProfile);
router.put ("/address",         protectCustomer, updateAddress);  // ← NEW
router.put ("/change-password", protectCustomer, changePassword);
router.post("/wishlist/toggle", protectCustomer, toggleWishlist);
router.get ("/wishlist",        protectCustomer, getWishlist);

//google oath
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get("/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );
  router.get("/auth/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: `${process.env.FRONTEND_URL}/account?error=google` }),
    (req, res) => {
      const token = generateToken(req.user._id, "customer");
      const info  = encodeURIComponent(JSON.stringify({
        _id: req.user._id, name: req.user.name,
        email: req.user.email, avatar: req.user.avatar,
      }));
      res.redirect(`${process.env.FRONTEND_URL}/account?token=${token}&info=${info}`);
    }
  );
} else {
  router.get("/auth/google", (req, res) => res.status(503).json({ message: "Google login not configured" }));
}

//facebook oath
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  router.get("/auth/facebook",
    passport.authenticate("facebook", { scope: ["email"] })
  );
  router.get("/auth/facebook/callback",
    passport.authenticate("facebook", { session: false, failureRedirect: `${process.env.FRONTEND_URL}/account?error=facebook` }),
    (req, res) => {
      const token = generateToken(req.user._id, "customer");
      const info  = encodeURIComponent(JSON.stringify({
        _id: req.user._id, name: req.user.name,
        email: req.user.email, avatar: req.user.avatar,
      }));
      res.redirect(`${process.env.FRONTEND_URL}/account?token=${token}&info=${info}`);
    }
  );
} else {
  router.get("/auth/facebook", (req, res) => res.status(503).json({ message: "Facebook login not configured" }));
}

module.exports = router;