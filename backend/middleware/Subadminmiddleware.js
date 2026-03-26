const jwt = require("jsonwebtoken");
const SubAdmin = require("../models/SubAdmin");

const protectSubAdmin = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) return next(new Error("No token"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const subAdmin = await SubAdmin.findById(decoded.id).select("-password -inviteToken");

    if (!subAdmin) return next(new Error("SubAdmin not found"));
    if (subAdmin.status !== "approved") return next(new Error("Not approved"));

    req.subAdmin = subAdmin;
    req.user     = subAdmin;
    next();
  } catch (err) {
    return next(err);
  }
};

module.exports = { protectSubAdmin };