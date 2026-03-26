const User     = require("../models/User");
const Customer = require("../models/Customer");
const Order    = require("../models/Order");
const bcrypt   = require("bcryptjs");
const generateToken = require("../utils/generateToken");



//register admin
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Please fill all fields" });

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const user  = await User.create({ name, email, password, role: "admin" });
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, phone: user.phone, address: user.address,
      avatar: user.avatar, token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};



//login parent admin
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Please fill all fields" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = generateToken(user._id, user.role);

    res.json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, phone: user.phone, address: user.address,
      avatar: user.avatar, token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};



//get admin profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};



//update admin profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address, avatar, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: "Email already in use" });
    }

    if (newPassword) {
      if (!currentPassword)
        return res.status(400).json({ message: "Current password required" });
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match)
        return res.status(400).json({ message: "Current password is incorrect" });
      if (newPassword.length < 6)
        return res.status(400).json({ message: "New password must be at least 6 characters" });
      user.password = newPassword;
    }

    if (name)              user.name    = name;
    if (email)             user.email   = email;
    if (phone   !== undefined) user.phone   = phone;
    if (address !== undefined) user.address = address;
    if (avatar  !== undefined) user.avatar  = avatar;

    await user.save();
    const token = generateToken(user._id, user.role);

    res.json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, phone: user.phone, address: user.address,
      avatar: user.avatar, token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};



//get admin information
exports.getAdminInfo = async (req, res) => {
  try {
    const admin = await User.findOne({ role: "admin" })
      .select("_id name email role");
    if (!admin)
      return res.status(404).json({ message: "Admin not found" });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};



//get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    //registered customers ──
    const registeredCustomers = await Customer.find({})
      .select("-password")
      .lean();

    //order থেকে unique guest customers
    const orders = await Order.find({})
      .select("customer createdAt")
      .lean();

    const registeredEmails = new Set(
      registeredCustomers.map(c => c.email?.toLowerCase()).filter(Boolean)
    );
    const registeredPhones = new Set(
      registeredCustomers.map(c => c.phone).filter(Boolean)
    );

    const orderCustomerMap = new Map();

    orders.forEach(order => {
      const c     = order.customer;
      const email = c.email?.toLowerCase();
      const phone = c.phone;

      // registered customer check
      if (email && registeredEmails.has(email)) return;
      if (!email && phone && registeredPhones.has(phone)) return;

      const key = email || phone;
      if (!key) return;

      if (!orderCustomerMap.has(key)) {
        orderCustomerMap.set(key, {
          _id:       `guest_${key}`,
          name:      c.name      || "Unknown",
          email:     c.email     || "",
          phone:     c.phone     || "",
          avatar:    "",
          provider:  "guest",
          isBlocked: false,
          isVerified:false,
          wishlist:  [],
          isGuest:   true,
          createdAt: order.createdAt,
        });
      }
    });

    const guestCustomers = Array.from(orderCustomerMap.values());

    // merge
    const allUsers = [
      ...registeredCustomers.map(c => ({ ...c, isGuest: false })),
      ...guestCustomers,
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, users: allUsers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



//get customer order
exports.getCustomerOrders = async (req, res) => {
  try {
    const { identifier } = req.params;
    const { field = "email" } = req.query;

    const query = field === "email"
      ? { "customer.email": identifier }
      : { "customer.phone": identifier };

    const orders = await Order.find(query)
      .select("orderId status total items createdAt paymentMethod paymentStatus subtotal savings deliveryCharge")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



//block unblock user
exports.toggleBlockCustomer = async (req, res) => {
  try {
    if (req.params.id.startsWith("guest_"))
      return res.status(400).json({ success: false, message: "Guest customers cannot be blocked" });

    const customer = await Customer.findById(req.params.id);
    if (!customer)
      return res.status(404).json({ success: false, message: "Customer not found" });

    customer.isBlocked = !customer.isBlocked;
    await customer.save();
    res.json({ success: true, isBlocked: customer.isBlocked });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};