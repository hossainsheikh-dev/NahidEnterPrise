const express = require("express");
const router = express.Router();

const {
  createLink,
  getLinks,
  updateLink,
  deleteLink,
} = require("../controllers/linkController");

router.get("/", getLinks);
router.post("/", createLink);
router.put("/:id", updateLink);
router.delete("/:id", deleteLink);

module.exports = router;