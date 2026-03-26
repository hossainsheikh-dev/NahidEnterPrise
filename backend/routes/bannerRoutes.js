const express  = require("express");
const router   = express.Router();
const { upload } = require("../config/cloudinaryConfig");
const { protect } = require("../middleware/authMiddleware");
const {
  getPublicBanners, getAllBanners,
  createBanner, updateBanner, deleteBanner,
} = require("../controllers/bannerController");

const uploadOne = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
};

router.get("/public", getPublicBanners);
router.get("/",       protect, getAllBanners);
router.post("/",      protect, uploadOne, createBanner);
router.put("/:id",    protect, uploadOne, updateBanner);
router.delete("/:id", protect, deleteBanner);

module.exports = router;