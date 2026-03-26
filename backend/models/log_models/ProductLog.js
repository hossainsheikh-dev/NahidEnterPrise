const mongoose = require("mongoose");

const productLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["created", "updated", "deleted"],
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    productName: { type: String, required: true },
    productSlug: { type: String, default: "" },

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

const ProductLog = mongoose.models.ProductLog || mongoose.model("ProductLog", productLogSchema);