const jwt      = require("jsonwebtoken");
const Customer = require("../models/Customer");

const protectCustomer = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) return next(new Error("No token"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customer = await Customer.findById(decoded.id).select("-password");
    if (!customer) return next(new Error("Customer not found"));
    if (customer.isBlocked) return next(new Error("Account blocked"));

    req.customer = customer;
    next();
  } catch (err) {
    return next(err);
  }
};

module.exports = { protectCustomer };