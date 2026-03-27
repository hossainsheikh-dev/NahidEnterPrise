const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const otpStore = new Map();

const sendMail = async (to, subject, otp) => {

  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_USER,
      pass: process.env.BREVO_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Nahid Enterprise" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:420px;margin:auto;padding:32px;background:linear-gradient(135deg,#0f0c29,#302b63,#24243e);border-radius:16px;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:12px 24px;border-radius:10px;">
            <span style="color:#fff;font-size:18px;font-weight:800;letter-spacing:2px;">NAHID ENTERPRISE</span>
          </div>
        </div>
        <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:24px;text-align:center;">
          <p style="color:#a5b4fc;font-size:14px;margin:0 0 0 8px;">Your verification code</p>
          <div style="font-size:42px;font-weight:900;letter-spacing:12px;color:#fff;margin:16px 0;text-shadow:0 0 20px rgba(99,102,241,0.8);">${otp}</div>
          <p style="color:#6b7280;font-size:12px;margin:0;">Expires in 2 minutes. Do not share.</p>
        </div>
      </div>
    `,
  });
};

//login otp
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = crypto.randomInt(100000, 999999).toString();
    otpStore.set(`login_${email}`, { otp, expiresAt: Date.now() + 2 * 60 * 1000 });
    await sendMail(email, "Admin Login OTP — Nahid Enterprise", otp);
    res.json({ message: "OTP sent" });
  } catch (err) {
    console.log("sendOtp error:", err.message);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore.get(`login_${email}`);
  if (!record || record.otp !== otp || Date.now() > record.expiresAt)
    return res.status(400).json({ message: "Invalid or expired OTP" });
  otpStore.delete(`login_${email}`);
  res.json({ message: "OTP verified" });
};

//forgot password otp
exports.sendForgotOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No admin found with this email" });

    const otp = crypto.randomInt(100000, 999999).toString();
    otpStore.set(`forgot_${email}`, { otp, expiresAt: Date.now() + 2 * 60 * 1000 });
    await sendMail(email, "Password Reset OTP — Nahid Enterprise", otp);
    res.json({ message: "OTP sent" });
  } catch (err) {
    console.log("sendForgotOtp error:", err.message);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

exports.verifyForgotOtp = async (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore.get(`forgot_${email}`);
  if (!record || record.otp !== otp || Date.now() > record.expiresAt)
    return res.status(400).json({ message: "Invalid or expired OTP" });
  otpStore.delete(`forgot_${email}`);
  otpStore.set(`reset_${email}`, { verified: true, expiresAt: Date.now() + 10 * 60 * 1000 });
  res.json({ message: "OTP verified" });
};

exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  const record = otpStore.get(`reset_${email}`);
  if (!record || !record.verified || Date.now() > record.expiresAt)
    return res.status(400).json({ message: "Session expired. Please try again." });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (newPassword.length < 6)
    return res.status(400).json({ message: "Password must be at least 6 characters" });

  user.password = newPassword;
  await user.save();
  otpStore.delete(`reset_${email}`);
  res.json({ message: "Password reset successful" });
};