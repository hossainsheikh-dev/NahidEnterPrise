module.exports = (otp, title, subtitle) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#0d1117;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1117;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;">
        <tr><td align="center" style="padding-bottom:24px;">
          <table cellpadding="0" cellspacing="0">
            <tr><td style="background:linear-gradient(135deg,#2e7d32,#1b5e20);border-radius:14px;padding:12px 22px;">
              <table cellpadding="0" cellspacing="0"><tr>
                <td style="padding-right:10px;">
                  <div style="width:34px;height:34px;background:rgba(255,255,255,0.15);border-radius:10px;text-align:center;line-height:34px;font-size:18px;">🛒</div>
                </td>
                <td>
                  <p style="color:#fff;font-size:15px;font-weight:800;margin:0;">Nahid Enterprise</p>
                  <p style="color:rgba(255,255,255,0.55);font-size:9px;font-weight:700;margin:0;letter-spacing:0.18em;text-transform:uppercase;">Customer Portal</p>
                </td>
              </tr></table>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#161b27;border-radius:20px;border:1px solid #1f2937;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,0.5);">
          <tr><td style="background:linear-gradient(90deg,#2e7d32,#66bb6a,#43a047);height:3px;display:block;font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr><td style="padding:32px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr><td align="center">
                <div style="width:54px;height:54px;background:rgba(46,125,50,0.12);border:1px solid rgba(46,125,50,0.25);border-radius:16px;text-align:center;line-height:54px;font-size:24px;display:inline-block;">✉️</div>
              </td></tr>
            </table>
            <h1 style="color:#f3f4f6;font-size:20px;font-weight:900;text-align:center;margin:0 0 8px;letter-spacing:-0.03em;">${title}</h1>
            <p style="color:#4b5563;font-size:13px;text-align:center;margin:0 0 28px;line-height:1.6;">${subtitle}</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr><td align="center">
                <div style="background:#0d1117;border:1.5px solid rgba(46,125,50,0.3);border-radius:16px;padding:22px 24px;display:inline-block;">
                  <p style="color:#6b7280;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;margin:0 0 14px;text-align:center;">Verification Code</p>
                  <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                    <tr>
                      ${otp.split("").map(d => `
                        <td style="padding:0 4px;">
                          <div style="width:42px;height:50px;background:rgba(46,125,50,0.1);border:1.5px solid rgba(46,125,50,0.3);border-radius:11px;font-size:26px;font-weight:900;color:#86efac;text-align:center;line-height:50px;font-family:'Courier New',monospace;">${d}</div>
                        </td>
                      `).join("")}
                    </tr>
                  </table>
                  <p style="color:#374151;font-size:11px;text-align:center;margin:14px 0 0;">⏱️ Expires in <strong style="color:#6ee7b7;">2 minutes</strong></p>
                </div>
              </td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:22px;">
              <tr><td style="background:rgba(245,158,11,0.07);border:1px solid rgba(245,158,11,0.15);border-radius:11px;padding:13px 15px;">
                <p style="color:#fbbf24;font-size:12px;margin:0;line-height:1.6;">🔒 <strong>Security Notice:</strong> Never share this code. Nahid Enterprise will never ask for your OTP.</p>
              </td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
              <tr><td style="border-top:1px solid #1f2937;height:1px;font-size:0;line-height:0;">&nbsp;</td></tr>
            </table>
            <p style="color:#374151;font-size:12px;text-align:center;margin:0;line-height:1.7;">If you didn't request this code, you can safely ignore this email.</p>
          </td></tr>
        </td></tr>
        <tr><td style="padding-top:22px;text-align:center;">
          <p style="color:#1f2937;font-size:11px;margin:0;font-weight:600;">© ${new Date().getFullYear()} Nahid Enterprise · All rights reserved</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;