const SubAdminLog = require("../models/log_models/SubAdminLog");

//get all logs
exports.getSubAdminLogs = async (req, res) => {
  try {
    const page   = parseInt(req.query.page)   || 1;
    const limit  = parseInt(req.query.limit)  || 15;
    const search = req.query.search || "";
    const action = req.query.action || "";

    const filter = {};
    if (action) filter.action = action;
    if (search) {
      filter.$or = [
        { subAdminName:  { $regex: search, $options: "i" } },
        { subAdminEmail: { $regex: search, $options: "i" } },
      ];
    }

    const total = await SubAdminLog.countDocuments(filter);
    const logs  = await SubAdminLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data:  logs,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.log("getSubAdminLogs error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};


//delete single logs
exports.deleteSubAdminLog = async (req, res) => {
  try {
    await SubAdminLog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Log deleted." });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};


//delete all logs
exports.clearSubAdminLogs = async (req, res) => {
  try {
    await SubAdminLog.deleteMany({});
    res.json({ success: true, message: "All logs cleared." });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};