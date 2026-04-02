const Order   = require("../models/Order");
const Product = require("../models/Product");
const jwt     = require("jsonwebtoken");
const mongoose = require("mongoose");


//order log schema
const orderLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["created","status_changed","deleted","delivery_confirmed","delivery_failed","hidden"],
      required: true,
    },
    order:         { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    orderId:       { type: String, required: true },
    fromStatus:    { type: String, default: "" },
    toStatus:      { type: String, default: "" },
    customerName:  { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    orderTotal:    { type: Number, default: 0  },
    paymentMethod: { type: String, default: "" },
    performedBy:      { type: mongoose.Schema.Types.ObjectId, refPath: "performedByModel", required: true },
    performedByModel: { type: String, enum: ["User","SubAdmin"], required: true },
    performedByName:  { type: String, required: true },
    performedByEmail: { type: String, required: true },
    performedByRole:  { type: String, required: true },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);
const OrderLog = mongoose.models.OrderLog || mongoose.model("OrderLog", orderLogSchema);


//helpers
const getActorInfo = (user) => ({
  performedBy:       user._id,
  performedByModel:  user.role === "subadmin" ? "SubAdmin" : "User",
  performedByName:   user.name  || "Unknown",
  performedByEmail:  user.email || "Unknown",
  performedByRole:   user.role  || "admin",
});

const orderSnap = (order) => ({
  customerName:  order.customer?.name  || "",
  customerPhone: order.customer?.phone || "",
  orderTotal:    order.total           || 0,
  paymentMethod: order.paymentMethod   || "",
});

const tryLog = async (data) => {
  try { await OrderLog.create(data); } catch (e) { console.log("OrderLog error:", e.message); }
};



//create orders
exports.createOrder = async (req, res) => {
  try {
    const {
      customer, paymentMethod, paymentNumber,
      transactionId, screenshotUrl,
      items, subtotal, savings, deliveryCharge, total,
    } = req.body;

    if (!customer?.name || !customer?.phone || !customer?.address || !customer?.district || !customer?.thana)
      return res.status(400).json({ success: false, message: "Customer name, phone, address, district and thana are required" });

    //phone normalization
    if (customer.phone) {
      customer.phone = customer.phone.trim()
        .replace(/^\+880/, "0")
        .replace(/^880/, "0");
    }
    if (!items || items.length === 0)
      return res.status(400).json({ success: false, message: "Order must have at least one item" });
    if (!["cod","bkash","nagad"].includes(paymentMethod))
      return res.status(400).json({ success: false, message: "Invalid payment method" });

    if (transactionId && transactionId.trim()) {
      const existing = await Order.findOne({ transactionId: transactionId.trim() });
      if (existing)
        return res.status(400).json({ success: false, message: "duplicate_txn", messagebn: "এই Transaction ID দিয়ে আগেই একটি অর্ডার করা হয়েছে।" });
    }

    const order = await Order.create({
      customer, paymentMethod,
      paymentNumber:  paymentNumber  || "",
      transactionId:  transactionId  || undefined,
      screenshotUrl:  screenshotUrl  || undefined,
      items, subtotal,
      savings:        savings        || 0,
      deliveryCharge: deliveryCharge || 60,
      total,
      paymentStatus: paymentMethod === "cod" ? "pending" : "awaiting_confirmation",
      status: "pending",
    });

    await tryLog({
      action:   "created",
      order:    order._id,
      orderId:  order.orderId,
      toStatus: "pending",
      ...orderSnap(order),
      performedBy:       order._id,
      performedByModel:  "User",
      performedByName:   customer.name  || "Customer",
      performedByEmail:  customer.email || customer.phone || "",
      performedByRole:   "customer",
    });

    res.status(201).json({ success: true, message: "Order placed successfully", data: order });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error.message);
    if (error.code === 11000 && error.keyPattern?.transactionId)
      return res.status(400).json({ success: false, message: "duplicate_txn", messagebn: "এই Transaction ID দিয়ে আগেই একটি অর্ডার করা হয়েছে।" });
    if (error.code === 11000 && error.keyPattern?.orderId)
      return res.status(500).json({ success: false, message: "Order ID conflict. Please try placing your order again." });
    res.status(500).json({ success: false, message: error.message });
  }
};



//track orders
exports.trackOrders = async (req, res) => {
  try {
    const { phone, email } = req.query;

    if (!phone && !email)
      return res.status(400).json({ success: false, message: "Phone or email required" });

    let filter = {};

    if (phone && phone.trim().length >= 10) {
      const normalized = phone.trim().replace(/^\+880/, "0").replace(/^880/, "0");
      filter["customer.phone"] = normalized;
    } else if (email && email.trim().includes("@")) {
      filter["customer.email"] = { $regex: new RegExp(`^${email.trim()}$`, "i") };
    } else {
      return res.status(400).json({ success: false, message: "Valid phone or email required" });
    }

    let customerId = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token   = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === "customer") {
          customerId = new mongoose.Types.ObjectId(decoded.id);
        }
      } catch {}
    }

    // if hasnnot token find by email or phone
    if (!customerId) {
      const Customer = require("../models/Customer");
      let customerDoc = null;
      if (phone && phone.trim().length >= 10) {
        const normalized = phone.trim().replace(/^\+880/, "0").replace(/^880/, "0");
        customerDoc = await Customer.findOne({ phone: normalized }).select("_id").lean();
      } else if (email && email.trim().includes("@")) {
        customerDoc = await Customer.findOne({
          email: { $regex: new RegExp(`^${email.trim()}$`, "i") }
        }).select("_id").lean();
      }
      if (customerDoc) customerId = customerDoc._id;
    }

    //if find customer remove hidden order
    if (customerId) {
      filter.hiddenBy = { $nin: [customerId] };
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



//get all orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: { $nin: ["confirmed","delivered","cancelled"] } }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



//get delivery order
exports.getDeliveryOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: { $in: ["confirmed","delivered","cancelled"] } }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



//get single order
exports.getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



//update ordr statsus
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;
    const validStatuses = ["pending","confirmed","processing","shipped","delivered","cancelled"];
    if (!validStatuses.includes(status))
      return res.status(400).json({ success: false, message: "Invalid status" });
    if (status === "cancelled" && !cancellationReason?.trim())
      return res.status(400).json({ success: false, message: "Cancellation reason is required" });

    const existing = await Order.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Order not found" });

    const fromStatus = existing.status;
    const updateFields = { status };
    if (status === "cancelled" && cancellationReason?.trim()) {
      updateFields.cancellationReason = cancellationReason.trim();
      updateFields.paymentStatus = "failed";
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { $set: updateFields }, { returnDocument: "after" });

    if (req.user) {
      await tryLog({
        action:     "status_changed",
        order:      order._id,
        orderId:    order.orderId,
        fromStatus,
        toStatus:   status,
        note:       cancellationReason?.trim() || "",
        ...orderSnap(order),
        ...getActorInfo(req.user),
      });
    }

    res.status(200).json({ success: true, message: "Status updated", data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



//confirm delivery
exports.confirmDelivery = async (req, res) => {
  try {
    const { success, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (!["confirmed","shipped","processing","pending"].includes(order.status))
      return res.status(400).json({ success: false, message: `Cannot confirm delivery for status: ${order.status}` });

    const fromStatus = order.status;

    if (success) {
      order.status        = "delivered";
      order.paymentStatus = "paid";
      if (note) order.deliveryNote = note;

      const stockErrors = [];
      for (const item of order.items) {
        try {
          let product = null;
          if (item.productId) {
            product = await Product.findById(item.productId);
          }
          if (!product && item.slug) {
            product = await Product.findOne({ slug: item.slug });
          }
          if (!product) {
            stockErrors.push(`Product not found: ${item.name}`);
            continue;
          }
          const newStock = Math.max(0, (product.stock || 0) - (item.quantity || 1));
          await Product.findByIdAndUpdate(product._id, { $set: { stock: newStock } });
        } catch (err) {
          stockErrors.push(`Stock update failed for: ${item.name}`);
        }
      }

      await order.save();

      if (req.user) {
        await tryLog({
          action:     "delivery_confirmed",
          order:      order._id,
          orderId:    order.orderId,
          fromStatus,
          toStatus:   "delivered",
          note:       note || "",
          ...orderSnap(order),
          ...getActorInfo(req.user),
        });
      }

      return res.json({
        success: true,
        message: "Delivery confirmed. Stock updated.",
        stockErrors: stockErrors.length > 0 ? stockErrors : undefined,
        data: order,
      });
    } else {
      order.status        = "cancelled";
      order.paymentStatus = "failed";
      if (note) order.deliveryNote = note;
      await order.save();

      if (req.user) {
        await tryLog({
          action:     "delivery_failed",
          order:      order._id,
          orderId:    order.orderId,
          fromStatus,
          toStatus:   "cancelled",
          note:       note || "",
          ...orderSnap(order),
          ...getActorInfo(req.user),
        });
      }

      return res.json({ success: true, message: "Order cancelled.", data: order });
    }
  } catch (error) {
    console.error("CONFIRM DELIVERY ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};



//delete order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (req.user) {
      await tryLog({
        action:  "deleted",
        order:   null,
        orderId: order.orderId,
        ...orderSnap(order),
        ...getActorInfo(req.user),
      });
    }

    res.status(200).json({ success: true, message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



//customer delete or hide order
exports.customerHideOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    //only hide delivery or cancelled ordre
    if (!["delivered", "cancelled"].includes(order.status))
      return res.status(400).json({ success: false, message: "শুধু পৌঁছানো বা বাতিল অর্ডার লুকাতে পারবেন" });

    //dont push duplicate
    await Order.findByIdAndUpdate(req.params.id, {
      $addToSet: { hiddenBy: req.customer._id },
    });

    res.json({ success: true, message: "Order hidden successfully" });
  } catch (err) {
    console.error("customerHideOrder:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};



//order logs
exports.getOrderLogs = async (req, res) => {
  try {
    const { action, role, search, page = 1, limit = 15 } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (role)   filter.performedByRole = role;
    if (search) filter.$or = [
      { orderId:         { $regex: search, $options: "i" } },
      { customerName:    { $regex: search, $options: "i" } },
      { customerPhone:   { $regex: search, $options: "i" } },
      { performedByName: { $regex: search, $options: "i" } },
    ];

    const total = await OrderLog.countDocuments(filter);
    const logs  = await OrderLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: logs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("GET ORDER LOGS ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteOrderLog = async (req, res) => {
  try {
    const log = await OrderLog.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ success: false, message: "Log not found." });
    res.json({ success: true, message: "Log deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.clearAllOrderLogs = async (req, res) => {
  try {
    await OrderLog.deleteMany({});
    res.json({ success: true, message: "All order logs cleared." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};