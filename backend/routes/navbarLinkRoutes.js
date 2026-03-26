


const express = require("express");
const router = express.Router();
const { getNavbarLinks } = require("../controllers/navbarLinkController");

// route for Navbar
router.get("/", getNavbarLinks);

module.exports = router;