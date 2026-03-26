const Customer      = require("../models/Customer");
const crypto        = require("crypto");
const nodemailer    = require("nodemailer");
const generateToken = require("../utils/generateToken");
const emailTemplate = require("../utils/emailTemplate");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
});

const otpStore = new Map();



//verify email
async function checkEmailExists(email) {
  
  const domain = email.split("@")[1];
  if (!domain) return false;

  return new Promise((resolve) => {
    const net  = require("net");
    const dns  = require("dns");

    dns.resolveMx(domain, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        return resolve(false);
      }

      //sort by priority
      const mx = addresses.sort((a, b) => a.priority - b.priority)[0].exchange;

      const socket = net.createConnection(25, mx);
      let buffer   = "";
      let step     = 0;
      let result   = false;

      const timeout = setTimeout(() => {
        socket.destroy();
        resolve(true);
      }, 6000);

      socket.on("data", (data) => {
        buffer += data.toString();
        const lines = buffer.split("\r\n");
        buffer = lines.pop();

        lines.forEach((line) => {
          const code = parseInt(line.substring(0, 3));

          if (step === 0 && code === 220) {
            socket.write(`HELO ${process.env.SMTP_HELO_DOMAIN || "nahidenterprise.com"}\r\n`);
            step = 1;
          } else if (step === 1 && code === 250) {
            socket.write(`MAIL FROM:<${process.env.GMAIL_USER}>\r\n`);
            step = 2;
          } else if (step === 2 && code === 250) {
            socket.write(`RCPT TO:<${email}>\r\n`);
            step = 3;
          } else if (step === 3) {
            if (code === 250 || code === 251) {
              result = true; //email exists
            } else {
              result = false; // doesn't exist
            }
            socket.write("QUIT\r\n");
            clearTimeout(timeout);
            socket.destroy();
            resolve(result);
          }
        });
      });

      socket.on("error", () => {
        clearTimeout(timeout);
        //connection error
        resolve(true);
      });

      socket.on("close", () => {
        clearTimeout(timeout);
        resolve(result);
      });
    });
  });
}



/* route: verify email existence
   post  /api/customer/verify-email */

exports.verifyEmailExists = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    //basic emailformat check first
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ exists: false, message: "Invalid email format" });
    }

    const exists = await checkEmailExists(email);
    res.json({ exists });
  } catch (err) {
    console.log("verifyEmailExists error:", err.message);
    // On any error, allow registration to continue
    res.json({ exists: true });
  }
};



//register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Please fill all fields" });
    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const exists = await Customer.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const normalizePhone = (p) => p ? p.trim().replace(/^\+880/, "0").replace(/^880/, "0") : "";
    const normalizedPhone = normalizePhone(phone);

    //phone duplicate check
    if (normalizedPhone) {
      const phoneExists = await Customer.findOne({ phone: normalizedPhone });
      if (phoneExists) return res.status(400).json({ message: "এই ফোন নম্বর দিয়ে আগেই একটি অ্যাকাউন্ট আছে" });
    }

    const customer = await Customer.create({
      name, email, password,
      phone: normalizedPhone,
      provider: "local",
    });
    const token = generateToken(customer._id, "customer");

    res.status(201).json({
      _id:       customer._id,
      name:      customer.name,
      email:     customer.email,
      phone:     customer.phone,
      avatar:    customer.avatar,
      provider:  customer.provider,
      address:   customer.address,
      createdAt: customer.createdAt,
      token,
    });
  } catch (err) {
    console.log("register error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};



//login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Please fill all fields" });

    const customer = await Customer.findOne({ email });
    if (!customer)
      return res.status(400).json({ message: "Invalid email or password" });
    if (customer.isBlocked)
      return res.status(403).json({ message: "Your account has been blocked" });
    if (customer.provider !== "local")
      return res.status(400).json({ message: `Please login with ${customer.provider}` });

    const isMatch = await customer.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = generateToken(customer._id, "customer");

    res.json({
      _id:       customer._id,
      name:      customer.name,
      email:     customer.email,
      phone:     customer.phone,
      avatar:    customer.avatar,
      provider:  customer.provider,
      address:   customer.address,
      createdAt: customer.createdAt,
      token,
    });
  } catch (err) {
    console.log("login error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};



//get propfile
exports.getProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer._id).select("-password");
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};



//update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const customer = await Customer.findById(req.customer._id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    if (name) customer.name = name;
    if (phone !== undefined) customer.phone = phone.trim().replace(/^\+880/, "0").replace(/^880/, "0");
    if (avatar !== undefined) customer.avatar = avatar;
    await customer.save();

    const token = generateToken(customer._id, "customer");
    res.json({
      _id: customer._id, name: customer.name, email: customer.email,
      phone: customer.phone, avatar: customer.avatar, token,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};



//update adreess
exports.updateAddress = async (req, res) => {
  try {
    const { label, street, thana, district, phone, note } = req.body;

    const updated = await Customer.findByIdAndUpdate(
      req.customer._id,
      {
        $set: {
          "address.label":    label    ?? "",
          "address.street":   street   ?? "",
          "address.thana":    thana    ?? "",
          "address.district": district ?? "",
          "address.phone":    phone    ?? "",
          "address.note":     note     ?? "",
        },
      },
      { new: true, runValidators: false }
    );

    if (!updated) return res.status(404).json({ message: "Customer not found" });

    res.json({ message: "Address updated", address: updated.address });
  } catch (err) {
    console.error("updateAddress error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};



//change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Both fields required" });
    if (newPassword.length < 6)
      return res.status(400).json({ message: "Min. 6 characters" });

    const customer = await Customer.findById(req.customer._id);
    if (!customer) return res.status(404).json({ message: "Not found" });

    const isMatch = await customer.matchPassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

    customer.password = newPassword;
    await customer.save();
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};



//forget password and send otp
exports.sendForgotOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const customer = await Customer.findOne({ email });
    if (!customer) return res.status(404).json({ message: "No account found with this email" });
    if (customer.provider !== "local")
      return res.status(400).json({ message: `This account uses ${customer.provider} login` });

    const otp = crypto.randomInt(100000, 999999).toString();
    otpStore.set(`forgot_${email}`, { otp, expiresAt: Date.now() + 2 * 60 * 1000 });

    await transporter.sendMail({
      from: `"Nahid Enterprise" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "🔑 Password Reset OTP — Nahid Enterprise",
      html: emailTemplate(otp, "Password Reset Request", "Use the code below to reset your password."),
    });

    res.json({ message: "OTP sent" });
  } catch (err) {
    console.log("sendForgotOtp error:", err.message);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};



//forget password and verify otp
exports.verifyForgotOtp = async (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore.get(`forgot_${email}`);
  if (!record || record.otp !== otp || Date.now() > record.expiresAt)
    return res.status(400).json({ message: "Invalid or expired OTP" });
  otpStore.delete(`forgot_${email}`);
  otpStore.set(`reset_${email}`, { verified: true, expiresAt: Date.now() + 10 * 60 * 1000 });
  res.json({ message: "OTP verified" });
};




//reset password
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const record = otpStore.get(`reset_${email}`);
    if (!record || !record.verified || Date.now() > record.expiresAt)
      return res.status(400).json({ message: "Session expired. Please try again." });
    if (newPassword.length < 6)
      return res.status(400).json({ message: "Min. 6 characters" });

    const customer = await Customer.findOne({ email });
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    customer.password = newPassword;
    await customer.save();
    otpStore.delete(`reset_${email}`);
    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};



//wishlist toggle
exports.toggleWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer._id);
    const { productId } = req.body;
    const idx = customer.wishlist.indexOf(productId);
    if (idx === -1) customer.wishlist.push(productId);
    else customer.wishlist.splice(idx, 1);
    await customer.save();
    res.json({ wishlist: customer.wishlist });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};


//get whishlist
exports.getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer._id).populate("wishlist");
    res.json({ wishlist: customer.wishlist });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};