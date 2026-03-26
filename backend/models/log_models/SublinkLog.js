const mongoose = require("mongoose");

const sublinkLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["created", "updated", "deleted"],
      required: true,
    },
    sublink:     { type: mongoose.Schema.Types.ObjectId, ref: "Sublink", default: null },
    sublinkName: { type: String, required: true },
    sublinkSlug: { type: String, default: "" },
    parentName:  { type: String, default: "" },

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

module.exports = mongoose.model("SublinkLog", sublinkLogSchema);