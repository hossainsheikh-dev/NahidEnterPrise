const Link = require("../models/Link");
const Sublink = require("../models/Sublink");

/* ===============================
   SLUG GENERATOR
================================= */
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
};


/* ===============================
   CREATE LINK
================================= */
exports.createLink = async (req, res) => {
  try {
    const { name, isActive } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const slug = generateSlug(name);

    const exists = await Link.findOne({ slug });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Link already exists",
      });
    }

    const link = await Link.create({
      name,
      slug,
      isActive,
    });

    res.status(201).json({
      success: true,
      message: "Link created successfully",
      data: link,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ===============================
   GET ALL LINKS
================================= */
exports.getLinks = async (req, res) => {
  try {
    const links = await Link.find().sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: links,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ===============================
   UPDATE LINK
================================= */
exports.updateLink = async (req, res) => {
  try {
    const { name, isActive } = req.body;

    const link = await Link.findById(req.params.id);

    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Link not found",
      });
    }

    link.name = name;
    link.slug = generateSlug(name);
    link.isActive = isActive;

    await link.save();

    res.status(200).json({
      success: true,
      message: "Link updated successfully",
      data: link,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ===============================
   DELETE LINK (DEBUG VERSION)
================================= */
exports.deleteLink = async (req, res) => {
  try {
    const linkId = req.params.id;

    await Sublink.deleteMany({ parent: linkId });

    await Link.findByIdAndDelete(linkId);

    res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
  