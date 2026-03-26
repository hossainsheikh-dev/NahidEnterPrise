const mongoose = require("mongoose");

const orderLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["created", "status_changed", "deleted", "delivery_confirmed", "delivery_failed"],
      required: true,
    },

    order:      { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    orderId:    { type: String, required: true },

    fromStatus: { type: String, default: "" },
    toStatus:   { type: String, default: "" },

    customerName:  { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    orderTotal:    { type: Number, default: 0  },
    paymentMethod: { type: String, default: "" },


    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "performedByModel",
      required: true,
    },
    performedByModel: { type: String, enum: ["User","SubAdmin"], required: true },
    performedByName:  { type: String, required: true },
    performedByEmail: { type: String, required: true },
    performedByRole:  { type: String, required: true },

    note: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OrderLog", orderLogSchema);