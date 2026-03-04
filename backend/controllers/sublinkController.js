const Sublink = require("../models/Sublink");
const Link = require("../models/Link");
const slugify = require("slugify");

/* ===============================
   CREATE SUBLINK
================================= */
exports.createSublink = async (req, res) => {
  try {
    const { name, parent, isActive } = req.body;

    if (!name || !parent) {
      return res.status(400).json({
        success: false,
        message: "Name and Parent are required",
      });
    }

    // Check parent exists
    const parentExists = await Link.findById(parent);
    if (!parentExists) {
      return res.status(400).json({
        success: false,
        message: "Parent link not found",
      });
    }

    const slug = slugify(name, { lower: true });

    const newSublink = await Sublink.create({
      name,
      slug,
      parent,
      isActive,
    });

    res.status(201).json({
      success: true,
      message: "Sublink created successfully",
      data: newSublink,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ===============================
   GET ALL SUBLINKS (ADMIN)
================================= */
exports.getSublinks = async (req, res) => {
  try {
    const sublinks = await Sublink.find()
      .populate("parent")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: sublinks,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ===============================
   GET SINGLE SUBLINK
================================= */
exports.getSingleSublink = async (req, res) => {
  try {
    const sublink = await Sublink.findById(req.params.id)
      .populate("parent");

    if (!sublink) {
      return res.status(404).json({
        success: false,
        message: "Sublink not found",
      });
    }

    res.status(200).json({
      success: true,
      data: sublink,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ===============================
   UPDATE SUBLINK
================================= */
exports.updateSublink = async (req, res) => {
  try {
    const { name, parent, isActive } = req.body;

    if (!name || !parent) {
      return res.status(400).json({
        success: false,
        message: "Name and Parent are required",
      });
    }

    const slug = slugify(name, { lower: true });

    const updated = await Sublink.findByIdAndUpdate(
      req.params.id,
      { name, slug, parent, isActive },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Sublink not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Sublink updated successfully",
      data: updated,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ===============================
   DELETE SUBLINK
================================= */
exports.deleteSublink = async (req, res) => {
  try {
    const deleted = await Sublink.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Sublink not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Sublink deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};