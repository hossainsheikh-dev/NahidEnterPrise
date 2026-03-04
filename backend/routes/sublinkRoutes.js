const express = require("express");
const router = express.Router();

const {
  createSublink,
  getSublinks,
  getSingleSublink,
  updateSublink,
  deleteSublink,
} = require("../controllers/sublinkController");

router.post("/", createSublink);
router.get("/", getSublinks);
router.get("/:id", getSingleSublink);
router.put("/:id", updateSublink);
router.delete("/:id", deleteSublink);

module.exports = router;