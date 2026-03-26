const mongoose = require("mongoose");


//auto generate customer id
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});
const Counter = mongoose.models.Counter || mongoose.model("Counter", counterSchema);

const orderItemSchema = new mongoose.Schema({
  productId:     { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name:          String,
  slug:          String,
  image:         String,
  price:         Number,
  salePrice:     Number,
  discountType:  String,
  discountValue: Number,
  quantity:      { type: Number, default: 1 },
  stock:         Number,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },

  customer: {
    name:     { type: String, required: true },
    phone:    { type: String, required: true },
    email:    String,
    address:  { type: String, required: true },
    district: { type: String, required: true },
    thana:    { type: String, required: true },
    note:     String,
  },

  paymentMethod:      { type: String, enum: ["cod", "bkash", "nagad"], required: true },
  paymentNumber:      String,
  transactionId:      String,
  screenshotUrl:      String,
  deliveryNote:       String,
  cancellationReason: String,

  paymentStatus: {
    type:    String,
    enum:    ["pending", "awaiting_confirmation", "paid", "failed"],
    default: "pending",
  },

  items:         [orderItemSchema],
  subtotal:      { type: Number, default: 0 },
  savings:       { type: Number, default: 0 },
  deliveryCharge:{ type: Number, default: 60 },
  total:         { type: Number, default: 0 },

  status: {
    type:    String,
    enum:    ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
    default: "pending",
  },

  hiddenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "Customer" }],

}, { timestamps: true });

orderSchema.pre("save", async function () {
  if (!this.orderId) {
    const now  = new Date();
    const yymm = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const counter = await Counter.findOneAndUpdate(
      { _id: `order_${yymm}` },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: "after" }
    );
    this.orderId = `NE-${yymm}-${String(counter.seq).padStart(5, "0")}`;
  }
});

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);