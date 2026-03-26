const SubAdmin    = require("../models/SubAdmin");
const SubAdminLog = require("../models/log_models/SubAdminLog");
const bcrypt      = require("bcryptjs");
const crypto      = require("crypto");
const nodemailer  = require("nodemailer");
const generateToken = require("../utils/generateToken");


//nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const otpStore = new Map();
const INVITE_TOKEN = process.env.SUBADMIN_INVITE_TOKEN || "nahid-enterprise-secret-2024";



//email templates
const otpEmailTemplate = (otp, title, subtitle) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#0d1117;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1117;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;">

        <!-- Brand -->
        <tr><td align="center" style="padding-bottom:24px;">
          <table cellpadding="0" cellspacing="0">
            <tr><td style="background:linear-gradient(135deg,#6366f1,#7c3aed);border-radius:14px;padding:12px 22px;">
              <table cellpadding="0" cellspacing="0"><tr>
                <td style="padding-right:10px;">
                  <div style="width:34px;height:34px;background:rgba(255,255,255,0.15);border-radius:10px;text-align:center;line-height:34px;font-size:18px;">🛡️</div>
                </td>
                <td>
                  <p style="color:#fff;font-size:15px;font-weight:800;margin:0;letter-spacing:-0.02em;">Nahid Enterprise</p>
                  <p style="color:rgba(255,255,255,0.55);font-size:9px;font-weight:700;margin:0;letter-spacing:0.18em;text-transform:uppercase;">SubAdmin Portal</p>
                </td>
              </tr></table>
            </td></tr>
          </table>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#161b27;border-radius:20px;border:1px solid #1f2937;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,0.5);">
          <!-- Top bar -->
          <tr><td style="background:linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4);height:3px;display:block;font-size:0;line-height:0;">&nbsp;</td></tr>

          <tr><td style="padding:32px 28px;">
            <!-- Icon -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr><td align="center">
                <div style="width:54px;height:54px;background:rgba(99,102,241,0.12);border:1px solid rgba(99,102,241,0.25);border-radius:16px;text-align:center;line-height:54px;font-size:24px;display:inline-block;">✉️</div>
              </td></tr>
            </table>

            <!-- Title -->
            <h1 style="color:#f3f4f6;font-size:20px;font-weight:900;text-align:center;margin:0 0 8px;letter-spacing:-0.03em;">${title}</h1>
            <p style="color:#4b5563;font-size:13px;text-align:center;margin:0 0 28px;line-height:1.6;">${subtitle}</p>

            <!-- OTP Box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr><td align="center">
                <div style="background:#0d1117;border:1.5px solid rgba(99,102,241,0.3);border-radius:16px;padding:22px 24px;display:inline-block;">
                  <p style="color:#6b7280;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;margin:0 0 14px;text-align:center;">Verification Code</p>
                  <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                    <tr>
                      ${otp.split("").map(d => `
                        <td style="padding:0 4px;">
                          <div style="width:42px;height:50px;background:rgba(99,102,241,0.1);border:1.5px solid rgba(99,102,241,0.3);border-radius:11px;font-size:26px;font-weight:900;color:#a5b4fc;text-align:center;line-height:50px;font-family:'Courier New',monospace;">${d}</div>
                        </td>
                      `).join("")}
                    </tr>
                  </table>
                  <p style="color:#374151;font-size:11px;text-align:center;margin:14px 0 0;">⏱️ Expires in <strong style="color:#6ee7b7;">2 minutes</strong></p>
                </div>
              </td></tr>
            </table>

            <!-- Warning -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:22px;">
              <tr><td style="background:rgba(245,158,11,0.07);border:1px solid rgba(245,158,11,0.15);border-radius:11px;padding:13px 15px;">
                <p style="color:#fbbf24;font-size:12px;margin:0;line-height:1.6;">🔒 <strong>Security Notice:</strong> Never share this code. Nahid Enterprise will never ask for your OTP via phone or chat.</p>
              </td></tr>
            </table>

            <!-- Divider -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
              <tr><td style="border-top:1px solid #1f2937;height:1px;font-size:0;line-height:0;">&nbsp;</td></tr>
            </table>

            <p style="color:#374151;font-size:12px;text-align:center;margin:0;line-height:1.7;">If you didn't request this code, you can safely ignore this email.</p>
          </td></tr>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding-top:22px;text-align:center;">
          <p style="color:#1f2937;font-size:11px;margin:0;font-weight:600;">© ${new Date().getFullYear()} Nahid Enterprise · All rights reserved</p>
          <p style="color:#161b27;font-size:10px;margin:5px 0 0;">This is an automated email. Please do not reply.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

const notificationEmailTemplate = (title, bodyHtml) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#0d1117;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1117;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;">

        <!-- Brand -->
        <tr><td align="center" style="padding-bottom:24px;">
          <table cellpadding="0" cellspacing="0">
            <tr><td style="background:linear-gradient(135deg,#6366f1,#7c3aed);border-radius:14px;padding:12px 22px;">
              <table cellpadding="0" cellspacing="0"><tr>
                <td style="padding-right:10px;">
                  <div style="width:34px;height:34px;background:rgba(255,255,255,0.15);border-radius:10px;text-align:center;line-height:34px;font-size:18px;">🛡️</div>
                </td>
                <td>
                  <p style="color:#fff;font-size:15px;font-weight:800;margin:0;">Nahid Enterprise</p>
                  <p style="color:rgba(255,255,255,0.55);font-size:9px;font-weight:700;margin:0;letter-spacing:0.18em;text-transform:uppercase;">SubAdmin Portal</p>
                </td>
              </tr></table>
            </td></tr>
          </table>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#161b27;border-radius:20px;border:1px solid #1f2937;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,0.5);">
          <tr><td style="background:linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4);height:3px;display:block;font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr><td style="padding:32px 28px;">
            <h2 style="color:#f3f4f6;font-size:18px;font-weight:900;margin:0 0 20px;letter-spacing:-0.02em;">${title}</h2>
            ${bodyHtml}
          </td></tr>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding-top:22px;text-align:center;">
          <p style="color:#1f2937;font-size:11px;margin:0;font-weight:600;">© ${new Date().getFullYear()} Nahid Enterprise · All rights reserved</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;



//register
exports.registerSubAdmin = async (req, res) => {
  try {
    const { name, email, password, inviteToken } = req.body;

    if (inviteToken !== INVITE_TOKEN)
      return res.status(403).json({ message: "Invalid invite token. Access denied." });

    if (!name || !email || !password)
      return res.status(400).json({ message: "Please fill all fields." });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters." });

    const exists = await SubAdmin.findOne({ email });
    if (exists) {
      if (exists.status === "pending")
        return res.status(400).json({ message: "Registration already submitted. Awaiting admin approval." });
      if (exists.status === "approved")
        return res.status(400).json({ message: "Email already registered." });
      if (exists.status === "rejected")
        return res.status(400).json({ message: "Your previous request was rejected. Contact admin." });
    }

    const subAdmin = await SubAdmin.create({ name, email, password, inviteToken });

    await SubAdminLog.create({
      action: "registered", subAdmin: subAdmin._id,
      subAdminName: subAdmin.name, subAdminEmail: subAdmin.email,
      performedByModel: "SubAdmin", performedByName: subAdmin.name, performedByRole: "subadmin",
    }).catch(() => {});

    try {
      await transporter.sendMail({
        from: `"Nahid Enterprise" <${process.env.GMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: "🆕 New SubAdmin Registration — Nahid Enterprise",
        html: notificationEmailTemplate("New SubAdmin Registration Request", `
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.15);border-radius:12px;padding:18px 20px;margin-bottom:16px;">
              <p style="color:#94a3b8;font-size:12px;margin:0 0 6px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;">Submitted by</p>
              <p style="color:#f3f4f6;font-size:15px;font-weight:800;margin:0 0 4px;">${name}</p>
              <p style="color:#6b7280;font-size:13px;margin:0;">📧 ${email}</p>
              <p style="color:#6b7280;font-size:12px;margin:8px 0 0;">🕒 ${new Date().toLocaleString()}</p>
            </td></tr>
          </table>
          <p style="color:#4b5563;font-size:13px;margin:16px 0 0;line-height:1.6;">Please login to the admin panel to <strong style="color:#a5b4fc;">approve</strong> or <strong style="color:#f87171;">reject</strong> this request.</p>
        `),
      });
    } catch (_) {}

    res.status(201).json({
      message: "Registration submitted successfully. Awaiting admin approval.",
      _id: subAdmin._id, name: subAdmin.name, email: subAdmin.email, status: subAdmin.status,
    });
  } catch (error) {
    console.log("registerSubAdmin error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};


//get all subadmins
exports.getAllSubAdmins = async (req, res) => {
  try {
    const subAdmins = await SubAdmin.find().select("-password -inviteToken").sort({ createdAt: -1 });
    res.json(subAdmins);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};


//get pending counts
exports.getPendingCount = async (req, res) => {
  try {
    const count = await SubAdmin.countDocuments({ status: "pending" });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};


//approve
exports.approveSubAdmin = async (req, res) => {
  try {
    const subAdmin = await SubAdmin.findById(req.params.id);
    if (!subAdmin) return res.status(404).json({ message: "SubAdmin not found." });
    if (subAdmin.status === "approved") return res.status(400).json({ message: "Already approved." });

    subAdmin.status = "approved";
    subAdmin.approvedBy = req.user._id;
    subAdmin.approvedAt = new Date();
    await subAdmin.save();

    await SubAdminLog.create({
      action: "approved", subAdmin: subAdmin._id,
      subAdminName: subAdmin.name, subAdminEmail: subAdmin.email,
      performedBy: req.user._id, performedByModel: "User",
      performedByName: req.user.name || "Admin", performedByRole: "admin",
    }).catch(() => {});

    try {
      await transporter.sendMail({
        from: `"Nahid Enterprise" <${process.env.GMAIL_USER}>`,
        to: subAdmin.email,
        subject: "✅ Your SubAdmin Account is Approved! — Nahid Enterprise",
        html: notificationEmailTemplate("🎉 Account Approved!", `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
            <tr><td style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:12px;padding:18px 20px;">
              <p style="color:#6ee7b7;font-size:22px;margin:0 0 8px;">✅</p>
              <p style="color:#f3f4f6;font-size:15px;font-weight:800;margin:0 0 6px;">Congratulations, ${subAdmin.name}!</p>
              <p style="color:#4b5563;font-size:13px;margin:0;line-height:1.6;">Your SubAdmin account for <strong style="color:#a5b4fc;">Nahid Enterprise</strong> has been approved by the admin.</p>
            </td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${process.env.FRONTEND_URL}/subadmin/signup-login-page" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#7c3aed);color:#fff;font-size:13px;font-weight:800;padding:13px 28px;border-radius:11px;text-decoration:none;letter-spacing:0.01em;">Login to SubAdmin Panel →</a>
            </td></tr>
          </table>
        `),
      });
    } catch (_) {}

    res.json({ message: "SubAdmin approved successfully.", subAdmin: { ...subAdmin._doc, password: undefined } });
  } catch (error) {
    console.log("approveSubAdmin error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};


//rejected
exports.rejectSubAdmin = async (req, res) => {
  try {
    const subAdmin = await SubAdmin.findById(req.params.id);
    if (!subAdmin) return res.status(404).json({ message: "SubAdmin not found." });

    subAdmin.status = "rejected";
    await subAdmin.save();

    await SubAdminLog.create({
      action: "rejected", subAdmin: subAdmin._id,
      subAdminName: subAdmin.name, subAdminEmail: subAdmin.email,
      performedBy: req.user._id, performedByModel: "User",
      performedByName: req.user.name || "Admin", performedByRole: "admin",
    }).catch(() => {});

    try {
      await transporter.sendMail({
        from: `"Nahid Enterprise" <${process.env.GMAIL_USER}>`,
        to: subAdmin.email,
        subject: "❌ SubAdmin Registration Update — Nahid Enterprise",
        html: notificationEmailTemplate("Registration Update", `
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.15);border-radius:12px;padding:18px 20px;">
              <p style="color:#f87171;font-size:20px;margin:0 0 8px;">❌</p>
              <p style="color:#f3f4f6;font-size:14px;font-weight:700;margin:0 0 6px;">Hi ${subAdmin.name},</p>
              <p style="color:#4b5563;font-size:13px;margin:0;line-height:1.6;">Unfortunately, your SubAdmin registration request for <strong style="color:#a5b4fc;">Nahid Enterprise</strong> has been rejected.</p>
            </td></tr>
          </table>
          <p style="color:#374151;font-size:12px;margin:16px 0 0;line-height:1.7;">Please contact the admin for more information or to reapply.</p>
        `),
      });
    } catch (_) {}

    res.json({ message: "SubAdmin rejected." });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};


//delete subadmin
exports.deleteSubAdmin = async (req, res) => {
  try {
    const subAdmin = await SubAdmin.findByIdAndDelete(req.params.id);
    if (!subAdmin) return res.status(404).json({ message: "SubAdmin not found." });

    await SubAdminLog.create({
      action: "deleted", subAdmin: null,
      subAdminName: subAdmin.name, subAdminEmail: subAdmin.email,
      performedBy: req.user._id, performedByModel: "User",
      performedByName: req.user.name || "Admin", performedByRole: "admin",
    }).catch(() => {});

    res.json({ message: "SubAdmin deleted." });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};



//login subadmin
exports.loginSubAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Please fill all fields." });

    const subAdmin = await SubAdmin.findOne({ email });
    if (!subAdmin) return res.status(400).json({ message: "Invalid email or password." });
    if (subAdmin.status === "pending") return res.status(403).json({ message: "Your account is awaiting admin approval." });
    if (subAdmin.status === "rejected") return res.status(403).json({ message: "Your account has been rejected. Contact admin." });

    const isMatch = await subAdmin.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password." });

    const otp = crypto.randomInt(100000, 999999).toString();
    otpStore.set(email, { otp, expiresAt: Date.now() + 2 * 60 * 1000 });

    await transporter.sendMail({
      from: `"Nahid Enterprise" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "🔐 SubAdmin Login OTP — Nahid Enterprise",
      html: otpEmailTemplate(
        otp,
        "SubAdmin Login Verification",
        "Use the code below to complete your login. Valid for 2 minutes."
      ),
    });

    const tempToken = generateToken(subAdmin._id, subAdmin.role);
    res.json({ message: "OTP sent to your email.", tempToken, _id: subAdmin._id, name: subAdmin.name, email: subAdmin.email, role: subAdmin.role });
  } catch (error) {
    console.log("loginSubAdmin error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};


//login second step for otp verify
exports.verifySubAdminOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = otpStore.get(email);
    if (!record || record.otp !== otp || Date.now() > record.expiresAt)
      return res.status(400).json({ message: "Invalid or expired OTP." });

    otpStore.delete(email);
    const subAdmin = await SubAdmin.findOne({ email }).select("-password -inviteToken");
    if (!subAdmin) return res.status(404).json({ message: "SubAdmin not found." });

    const token = generateToken(subAdmin._id, subAdmin.role);
    res.json({ _id: subAdmin._id, name: subAdmin.name, email: subAdmin.email, phone: subAdmin.phone, role: subAdmin.role, status: subAdmin.status, token });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};


//get profile
exports.getSubAdminProfile = async (req, res) => {
  try {
    const subAdmin = await SubAdmin.findById(req.user._id).select("-password -inviteToken");
    if (!subAdmin) return res.status(404).json({ message: "SubAdmin not found." });
    res.json(subAdmin);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};



//update prodile
exports.updateSubAdminProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: "Name is required." });

    const subAdmin = await SubAdmin.findById(req.user._id);
    if (!subAdmin) return res.status(404).json({ message: "SubAdmin not found." });

    const oldName = subAdmin.name;
    const oldPhone = subAdmin.phone;
    subAdmin.name = name.trim();
    subAdmin.phone = phone ? phone.trim() : subAdmin.phone;
    await subAdmin.save();

    await SubAdminLog.create({
      action: "profile_updated", subAdmin: subAdmin._id,
      subAdminName: subAdmin.name, subAdminEmail: subAdmin.email,
      performedBy: subAdmin._id, performedByModel: "SubAdmin",
      performedByName: subAdmin.name, performedByRole: "subadmin",
      changes: {
        ...(oldName !== subAdmin.name ? { name: { from: oldName, to: subAdmin.name } } : {}),
        ...(oldPhone !== subAdmin.phone ? { phone: { from: oldPhone, to: subAdmin.phone } } : {}),
      },
    }).catch(() => {});

    const updated = await SubAdmin.findById(req.user._id).select("-password -inviteToken");
    res.json(updated);
  } catch (error) {
    console.log("updateSubAdminProfile error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};



//change password
exports.changeSubAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: "Both fields are required." });
    if (newPassword.length < 6) return res.status(400).json({ message: "New password must be at least 6 characters." });

    const subAdmin = await SubAdmin.findById(req.user._id);
    if (!subAdmin) return res.status(404).json({ message: "SubAdmin not found." });

    const isMatch = await subAdmin.matchPassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect." });

    subAdmin.password = newPassword;
    await subAdmin.save();

    await SubAdminLog.create({
      action: "password_changed", subAdmin: subAdmin._id,
      subAdminName: subAdmin.name, subAdminEmail: subAdmin.email,
      performedBy: subAdmin._id, performedByModel: "SubAdmin",
      performedByName: subAdmin.name, performedByRole: "subadmin",
    }).catch(() => {});

    res.json({ message: "Password changed successfully." });
  } catch (error) {
    console.log("changeSubAdminPassword error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};



// request profile changing
exports.requestProfileChange = async (req, res) => {
  try {
    const { newEmail, newPhone } = req.body;
    if (!newEmail && !newPhone) return res.status(400).json({ message: "Provide at least one field to change." });

    const subAdmin = await SubAdmin.findById(req.user._id);
    if (!subAdmin) return res.status(404).json({ message: "SubAdmin not found." });

    const added = [];
    const changes = {};

    if (newEmail && newEmail.trim() !== subAdmin.email) {
      subAdmin.changeRequests.push({ type: "email", newValue: newEmail.trim() });
      added.push(`<tr><td style="padding:6px 0;color:#94a3b8;font-size:13px;">📧 Email:</td><td style="padding:6px 0;color:#f3f4f6;font-size:13px;font-weight:600;">${subAdmin.email} → ${newEmail.trim()}</td></tr>`);
      changes.email = { from: subAdmin.email, to: newEmail.trim() };
    }
    if (newPhone && newPhone.trim() !== subAdmin.phone) {
      subAdmin.changeRequests.push({ type: "phone", newValue: newPhone.trim() });
      added.push(`<tr><td style="padding:6px 0;color:#94a3b8;font-size:13px;">📱 Phone:</td><td style="padding:6px 0;color:#f3f4f6;font-size:13px;font-weight:600;">${subAdmin.phone || "—"} → ${newPhone.trim()}</td></tr>`);
      changes.phone = { from: subAdmin.phone || "—", to: newPhone.trim() };
    }

    if (!added.length) return res.status(400).json({ message: "No changes detected." });

    await subAdmin.save();

    await SubAdminLog.create({
      action: "change_requested", subAdmin: subAdmin._id,
      subAdminName: subAdmin.name, subAdminEmail: subAdmin.email,
      performedBy: subAdmin._id, performedByModel: "SubAdmin",
      performedByName: subAdmin.name, performedByRole: "subadmin",
      changes,
    }).catch(() => {});

    try {
      await transporter.sendMail({
        from: `"Nahid Enterprise" <${process.env.GMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `📝 Profile Change Request — ${subAdmin.name}`,
        html: notificationEmailTemplate("Profile Change Request", `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
            <tr><td style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.15);border-radius:12px;padding:16px 18px;">
              <p style="color:#a5b4fc;font-size:13px;font-weight:800;margin:0 0 4px;">${subAdmin.name}</p>
              <p style="color:#4b5563;font-size:12px;margin:0;">📧 ${subAdmin.email}</p>
            </td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
            <tr><td style="background:#0d1117;border:1px solid #1f2937;border-radius:12px;padding:16px 18px;">
              <p style="color:#6b7280;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 10px;">Requested Changes</p>
              <table width="100%" cellpadding="0" cellspacing="0">${added.join("")}</table>
            </td></tr>
          </table>
          <p style="color:#4b5563;font-size:12px;margin:0;line-height:1.7;">Login to the admin panel to <strong style="color:#a5b4fc;">approve</strong> or <strong style="color:#f87171;">reject</strong> this request.</p>
          <p style="color:#374151;font-size:11px;margin:8px 0 0;">🕒 ${new Date().toLocaleString()}</p>
        `),
      });
    } catch (mailErr) {
      console.log("requestProfileChange mail error:", mailErr.message);
    }

    res.json({ message: "Change request sent to admin successfully." });
  } catch (error) {
    console.log("requestProfileChange error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};


//get change request counter
exports.getChangeRequestCount = async (req, res) => {
  try {
    const count = await SubAdmin.aggregate([
      { $unwind: "$changeRequests" },
      { $match: { "changeRequests.status": "pending" } },
      { $count: "total" },
    ]);
    res.json({ count: count[0]?.total || 0 });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};



//get pending change
exports.getPendingChangeRequests = async (req, res) => {
  try {
    const subAdmins = await SubAdmin.find(
      { "changeRequests.status": "pending" },
      { name: 1, email: 1, phone: 1, changeRequests: 1 }
    );

    const requests = [];
    for (const sa of subAdmins) {
      for (const cr of sa.changeRequests) {
        if (cr.status === "pending") {
          requests.push({
            requestId: cr._id, subAdminId: sa._id,
            subAdminName: sa.name, subAdminEmail: sa.email,
            currentPhone: sa.phone, type: cr.type,
            newValue: cr.newValue, createdAt: cr.createdAt,
          });
        }
      }
    }

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};



//resolve change request
exports.resolveChangeRequest = async (req, res) => {
  try {
    const { subAdminId, requestId, action } = req.body;
    if (!["approve", "reject"].includes(action)) return res.status(400).json({ message: "Invalid action." });

    const subAdmin = await SubAdmin.findById(subAdminId);
    if (!subAdmin) return res.status(404).json({ message: "SubAdmin not found." });

    const cr = subAdmin.changeRequests.id(requestId);
    if (!cr) return res.status(404).json({ message: "Request not found." });
    if (cr.status !== "pending") return res.status(400).json({ message: "Request already resolved." });

    cr.status = action === "approve" ? "approved" : "rejected";
    if (action === "approve") {
      if (cr.type === "email") subAdmin.email = cr.newValue;
      if (cr.type === "phone") subAdmin.phone = cr.newValue;
    }
    await subAdmin.save();

    await SubAdminLog.create({
      action: action === "approve" ? "change_approved" : "change_rejected",
      subAdmin: subAdmin._id, subAdminName: subAdmin.name, subAdminEmail: subAdmin.email,
      performedBy: req.user._id, performedByModel: "User",
      performedByName: req.user.name || "Admin", performedByRole: "admin",
      changes: { [cr.type]: cr.newValue },
    }).catch(() => {});

    try {
      const approved = action === "approve";
      await transporter.sendMail({
        from: `"Nahid Enterprise" <${process.env.GMAIL_USER}>`,
        to: subAdmin.email,
        subject: `${approved ? "✅" : "❌"} Profile Change ${approved ? "Approved" : "Rejected"} — Nahid Enterprise`,
        html: notificationEmailTemplate(
          `Profile Change ${approved ? "Approved ✅" : "Rejected ❌"}`,
          `
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="background:${approved ? "rgba(16,185,129,0.07)" : "rgba(239,68,68,0.07)"};border:1px solid ${approved ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.15)"};border-radius:12px;padding:18px 20px;">
              <p style="color:#f3f4f6;font-size:14px;font-weight:700;margin:0 0 8px;">Hi ${subAdmin.name},</p>
              <p style="color:#4b5563;font-size:13px;margin:0;line-height:1.7;">
                Your request to change your <strong style="color:#a5b4fc;">${cr.type}</strong> to 
                <strong style="color:#a5b4fc;">${cr.newValue}</strong> has been 
                <strong style="color:${approved ? "#6ee7b7" : "#f87171"};">${approved ? "approved ✅" : "rejected ❌"}</strong>.
              </p>
            </td></tr>
          </table>
          `
        ),
      });
    } catch (_) {}

    res.json({ success: true, message: `Request ${action}d.` });
  } catch (error) {
    console.log("resolveChangeRequest error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};



//forgot password
const forgotOtpStore = new Map();

exports.sendForgotOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const subAdmin = await SubAdmin.findOne({ email });
    if (!subAdmin) return res.status(404).json({ message: "No SubAdmin found with this email" });

    const otp = crypto.randomInt(100000, 999999).toString();
    forgotOtpStore.set(`forgot_${email}`, { otp, expiresAt: Date.now() + 2 * 60 * 1000 });

    await transporter.sendMail({
      from: `"Nahid Enterprise" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "🔑 Password Reset OTP — Nahid Enterprise",
      html: otpEmailTemplate(
        otp,
        "Password Reset Request",
        "You requested to reset your SubAdmin password. Use the code below to continue."
      ),
    });

    res.json({ message: "OTP sent" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

exports.verifyForgotOtp = async (req, res) => {
  const { email, otp } = req.body;
  const record = forgotOtpStore.get(`forgot_${email}`);
  if (!record || record.otp !== otp || Date.now() > record.expiresAt)
    return res.status(400).json({ message: "Invalid or expired OTP" });
  forgotOtpStore.delete(`forgot_${email}`);
  forgotOtpStore.set(`reset_${email}`, { verified: true, expiresAt: Date.now() + 10 * 60 * 1000 });
  res.json({ message: "OTP verified" });
};

exports.resetSubAdminPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  const record = forgotOtpStore.get(`reset_${email}`);
  if (!record || !record.verified || Date.now() > record.expiresAt)
    return res.status(400).json({ message: "Session expired. Please try again." });
  if (newPassword.length < 6) return res.status(400).json({ message: "Min. 6 characters" });
  const subAdmin = await SubAdmin.findOne({ email });
  if (!subAdmin) return res.status(404).json({ message: "SubAdmin not found" });
  subAdmin.password = newPassword;
  await subAdmin.save();
  forgotOtpStore.delete(`reset_${email}`);
  res.json({ message: "Password reset successful" });
};