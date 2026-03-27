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
router.post("/verify-email",      verifyEmailExists);

//protected
router.get ("/profile",         protectCustomer, getProfile);
router.put ("/profile",         protectCustomer, updateProfile);
router.put ("/address",         protectCustomer, updateAddress);
router.put ("/change-password", protectCustomer, changePassword);
router.post("/wishlist/toggle", protectCustomer, toggleWishlist);
router.get ("/wishlist",        protectCustomer, getWishlist);

//google oauth
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

//facebook oauth
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

module.exports = router;