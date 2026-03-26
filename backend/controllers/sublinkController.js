const Sublink  = require("../models/Sublink");
const Link     = require("../models/Link");
const slugify  = require("slugify");
const mongoose = require("mongoose");

// sublinkLog schema
const sublinkLogSchema = new mongoose.Schema(
  {
    action:           { type: String, enum: ["created","updated","deleted"], required: true },
    sublink:          { type: mongoose.Schema.Types.ObjectId, ref: "Sublink", default: null },
    sublinkName:      { type: String, required: true },
    sublinkSlug:      { type: String, default: "" },
    parentName:       { type: String, default: "" },
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
const SublinkLog = mongoose.models.SublinkLog || mongoose.model("SublinkLog", sublinkLogSchema);

//helpers
const generateSlug = (name) => {
  const slug = slugify(name, { lower: true, strict: true });
  return slug || `sublink-${Date.now()}`;
};

const getActorInfo = (user) => ({
  performedBy:       user._id,
  performedByModel:  user.role === "subadmin" ? "SubAdmin" : "User",
  performedByName:   user.name  || "Unknown",
  performedByEmail:  user.email || "Unknown",
  performedByRole:   user.role  || "admin",
});



//create sublink
exports.createSublink = async (req, res) => {
  try {
    const { name, parent, isActive } = req.body;
    if (!name || !parent)
      return res.status(400).json({ success: false, message: "Name and Parent are required" });

    const parentExists = await Link.findById(parent);
    if (!parentExists)
      return res.status(400).json({ success: false, message: "Parent link not found" });

    const slug       = generateSlug(name);
    const newSublink = await Sublink.create({ name, slug, parent, isActive });

    if (req.user) {
      try {
        await SublinkLog.create({
          action:      "created",
          sublink:     newSublink._id,
          sublinkName: newSublink.name,
          sublinkSlug: newSublink.slug || "",
          parentName:  parentExists.name || "",
          ...getActorInfo(req.user),
        });
      } catch (logErr) { console.log("Log error:", logErr.message); }
    }

    res.status(201).json({ success: true, message: "Sublink created successfully", data: newSublink });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



//get all
exports.getSublinks = async (req, res) => {
  try {
    const sublinks = await Sublink.find().populate("parent").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: sublinks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



//get singlle
exports.getSingleSublink = async (req, res) => {
  try {
    const sublink = await Sublink.findById(req.params.id).populate("parent");
    if (!sublink)
      return res.status(404).json({ success: false, message: "Sublink not found" });
    res.status(200).json({ success: true, data: sublink });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



//update
exports.updateSublink = async (req, res) => {
  try {
    const { name, parent, isActive } = req.body;
    if (!name || !parent)
      return res.status(400).json({ success: false, message: "Name and Parent are required" });

    const old = await Sublink.findById(req.params.id).populate("parent");
    if (!old) return res.status(404).json({ success: false, message: "Sublink not found" });

    /* track changes */
    const changes = {};
    if (name   && name     !== old.name)     changes.name     = { from: old.name,            to: name };
    if (parent && parent   !== String(old.parent?._id || old.parent)) changes.parent = { from: old.parent?.name || "", to: parent };
    if (isActive !== undefined && isActive !== old.isActive) changes.isActive = { from: old.isActive, to: isActive };

    const slug    = generateSlug(name);
    const updated = await Sublink.findByIdAndUpdate(
      req.params.id,
      { name, slug, parent, isActive },
      { returnDocument: "after" }
    ).populate("parent");

    if (req.user) {
      try {
        await SublinkLog.create({
          action:      "updated",
          sublink:     updated._id,
          sublinkName: updated.name,
          sublinkSlug: updated.slug || "",
          parentName:  updated.parent?.name || "",
          changes:     Object.keys(changes).length ? changes : null,
          ...getActorInfo(req.user),
        });
      } catch (logErr) { console.log("Log error:", logErr.message); }
    }

    res.status(200).json({ success: true, message: "Sublink updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



//delete sublink
exports.deleteSublink = async (req, res) => {
  try {
    const sub = await Sublink.findById(req.params.id).populate("parent");
    if (!sub) return res.status(404).json({ success: false, message: "Sublink not found" });

    if (req.user) {
      try {
        await SublinkLog.create({
          action:      "deleted",
          sublink:     null,
          sublinkName: sub.name,
          sublinkSlug: sub.slug || "",
          parentName:  sub.parent?.name || "",
          ...getActorInfo(req.user),
        });
      } catch (logErr) { console.log("Log error:", logErr.message); }
    }

    await Sublink.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Sublink deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



//get logs
exports.getSublinkLogs = async (req, res) => {
  try {
    const { action, role, search, page = 1, limit = 15 } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (role)   filter.performedByRole = role;
    if (search) filter.$or = [
      { sublinkName:    { $regex: search, $options: "i" } },
      { parentName:     { $regex: search, $options: "i" } },
      { performedByName:  { $regex: search, $options: "i" } },
      { performedByEmail: { $regex: search, $options: "i" } },
    ];

    const total = await SublinkLog.countDocuments(filter);
    const logs  = await SublinkLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: logs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("GET SUBLINK LOGS ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};



//delete single logs
exports.deleteSublinkLog = async (req, res) => {
  try {
    const log = await SublinkLog.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ success: false, message: "Log not found." });
    res.json({ success: true, message: "Log deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



//create all logs
exports.clearAllSublinkLogs = async (req, res) => {
  try {
    await SublinkLog.deleteMany({});
    res.json({ success: true, message: "All sublink logs cleared." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};