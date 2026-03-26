const Link    = require("../models/Link");
const Sublink = require("../models/Sublink");
const mongoose = require("mongoose");



//link schema
const linkLogSchema = new mongoose.Schema(
  {
    action:           { type: String, enum: ["created","updated","deleted"], required: true },
    link:             { type: mongoose.Schema.Types.ObjectId, ref: "Link", default: null },
    linkName:         { type: String, required: true },
    linkSlug:         { type: String, default: "" },
    performedBy:      { type: mongoose.Schema.Types.ObjectId, refPath: "performedByModel", required: true },
    performedByModel: { type: String, enum: ["User","SubAdmin"], required: true },
    performedByName:  { type: String, required: true },
    performedByEmail: { type: String, required: true },
    performedByRole:  { type: String, required: true },
    changes:          { type: Object, default: null },
    note:             { type: String, default: "" },
  },
  { timestamps: true }
);
const LinkLog = mongoose.models.LinkLog || mongoose.model("LinkLog", linkLogSchema);



//slug helpers
const generateSlug = (name) => {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
  return slug || `link-${Date.now()}`;
};

const getActorInfo = (user) => ({
  performedBy:      user._id,
  performedByModel: user.role === "subadmin" ? "SubAdmin" : "User",
  performedByName:  user.name  || "Unknown",
  performedByEmail: user.email || "Unknown",
  performedByRole:  user.role  || "admin",
});



//create link
exports.createLink = async (req, res) => {
  try {
    const { name, isActive } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const slug = generateSlug(name);
    const link = await Link.create({ name, slug, isActive });

    if (req.user) {
      try {
        await LinkLog.create({
          action:   "created",
          link:     link._id,
          linkName: link.name,
          linkSlug: link.slug || "",
          ...getActorInfo(req.user),
        });
      } catch (logErr) { console.log("Log error:", logErr.message); }
    }

    res.status(201).json({ success: true, message: "Link created successfully", data: link });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



//get all links
exports.getLinks = async (req, res) => {
  try {
    const links = await Link.find().sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: links });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



//update links here
exports.updateLink = async (req, res) => {
  try {
    const { name, isActive } = req.body;

    const old = await Link.findById(req.params.id);
    if (!old) return res.status(404).json({ success: false, message: "Link not found" });

    //track changing
    const changes = {};
    if (name     !== undefined && name     !== old.name)     changes.name     = { from: old.name,     to: name     };
    if (isActive !== undefined && isActive !== old.isActive) changes.isActive = { from: old.isActive, to: isActive };

    old.name     = name;
    old.slug     = generateSlug(name);
    old.isActive = isActive;
    await old.save();

    if (req.user) {
      try {
        await LinkLog.create({
          action:   "updated",
          link:     old._id,
          linkName: old.name,
          linkSlug: old.slug || "",
          changes:  Object.keys(changes).length ? changes : null,
          ...getActorInfo(req.user),
        });
      } catch (logErr) { console.log("Log error:", logErr.message); }
    }

    res.status(200).json({ success: true, message: "Link updated successfully", data: old });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



//delete link
exports.deleteLink = async (req, res) => {
  try {
    const linkId = req.params.id;
    const link   = await Link.findById(linkId);
    if (!link) return res.status(404).json({ success: false, message: "Link not found" });

    if (req.user) {
      try {
        await LinkLog.create({
          action:   "deleted",
          link:     null,
          linkName: link.name,
          linkSlug: link.slug || "",
          ...getActorInfo(req.user),
        });
      } catch (logErr) { console.log("Log error:", logErr.message); }
    }

    await Sublink.deleteMany({ parent: linkId });
    await Link.findByIdAndDelete(linkId);

    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



//get links logs history only by admin
exports.getLinkLogs = async (req, res) => {
  try {
    const { action, role, search, page = 1, limit = 15 } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (role)   filter.performedByRole = role;
    if (search) filter.$or = [
      { linkName:       { $regex: search, $options: "i" } },
      { performedByName:  { $regex: search, $options: "i" } },
      { performedByEmail: { $regex: search, $options: "i" } },
    ];

    const total = await LinkLog.countDocuments(filter);
    const logs  = await LinkLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: logs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("GET LINK LOGS ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};



//delete single logs
exports.deleteLinkLog = async (req, res) => {
  try {
    const log = await LinkLog.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ success: false, message: "Log not found." });
    res.json({ success: true, message: "Log deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



//clear all logs history
exports.clearAllLinkLogs = async (req, res) => {
  try {
    await LinkLog.deleteMany({});
    res.json({ success: true, message: "All link logs cleared." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};