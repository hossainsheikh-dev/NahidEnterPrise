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
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/account?error=google`,
  }),
  (req, res) => {
    if (!req.user) {
      return res.redirect(`${process.env.FRONTEND_URL}/account?error=no_account`);
    }
    const token = generateToken(req.user._id, "customer");
    const info  = encodeURIComponent(JSON.stringify({
      _id:     req.user._id,
      name:    req.user.name,
      email:   req.user.email,
      avatar:  req.user.avatar,
      phone:   req.user.phone,
      address: req.user.address,
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


// phone update করার আগে duplicate check
router.put("/update-phone", protect, async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) return res.status(400).json({ message: "ফোন নম্বর দিন" });

    // ✅ অন্য কেউ এই phone ব্যবহার করছে কিনা চেক করো
    const existing = await Customer.findOne({
      phone,
      _id: { $ne: req.customer._id } // নিজেকে বাদ দাও
    });

    if (existing) {
      return res.status(400).json({
        message: "এই ফোন নম্বরটি ইতিমধ্যে অন্য অ্যাকাউন্টে ব্যবহৃত হচ্ছে"
      });
    }

    const customer = await Customer.findByIdAndUpdate(
      req.customer._id,
      { phone },
      { new: true }
    ).select("-password");

    res.json({ success: true, customer });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: "এই ফোন নম্বরটি ইতিমধ্যে ব্যবহৃত হচ্ছে"
      });
    }
    res.status(500).json({ message: "সার্ভার সমস্যা" });
  }
});


router.put("/address", protect, async (req, res) => {
  try {
    const { street, thana, district, phone } = req.body;

    // ✅ phone থাকলে duplicate check করো
    if (phone) {
      const existing = await Customer.findOne({
        phone,
        _id: { $ne: req.customer._id }
      });
      if (existing) {
        return res.status(400).json({
          message: "এই ফোন নম্বরটি অন্য অ্যাকাউন্টে ব্যবহৃত হচ্ছে"
        });
      }
    }

    const updateFields = { "address.street": street, "address.thana": thana, "address.district": district };
    if (phone) {
      updateFields.phone = phone; // ✅ top-level phone আপডেট করো
      updateFields["address.phone"] = phone;
    }

    const customer = await Customer.findByIdAndUpdate(
      req.customer._id,
      { $set: updateFields },
      { new: true }
    ).select("-password");

    res.json({ success: true, address: customer.address, customer });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "এই ফোন নম্বরটি ইতিমধ্যে ব্যবহৃত হচ্ছে" });
    }
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;