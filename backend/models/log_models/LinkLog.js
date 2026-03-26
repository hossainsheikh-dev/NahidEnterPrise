const mongoose = require("mongoose");

const linkLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["created", "updated", "deleted"],
      required: true,
    },
    link:     { type: mongoose.Schema.Types.ObjectId, ref: "Link", default: null },
    linkName: { type: String, required: true },
    linkSlug: { type: String, default: "" },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "performedByModel",
      required: true,
    },
    performedByModel: {
      type: String,
      enum: ["User", "SubAdmin"],
      required: true,
    },
    performedByName:  { type: String, required: true },
    performedByEmail: { type: String, required: true },
    performedByRole:  { type: String, required: true },
    changes: { type: Object, default: null },
    note:    { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LinkLog", linkLogSchema);