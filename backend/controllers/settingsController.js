const Settings = require("../models/Settings");

const DEFAULTS = {
  deliveryInDhaka:      60,
  deliveryOutsideDhaka: 120,
  freeDeliveryMinimum:  2500,
  freeDeliveryEnabled:  true,
};


//get setting
exports.getSettings = async (req, res) => {
  try {
    const docs   = await Settings.find({});
    const result = { ...DEFAULTS };
    docs.forEach(d => { result[d.key] = d.value; });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


//update setting
exports.updateSettings = async (req, res) => {
  try {
    const updates  = req.body;
    const promises = Object.entries(updates).map(([key, value]) =>
      Settings.findOneAndUpdate({ key }, { key, value }, { upsert: true, new: true })
    );
    await Promise.all(promises);
    res.json({ success: true, message: "Settings updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};