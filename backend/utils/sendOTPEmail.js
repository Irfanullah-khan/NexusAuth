const { getBrevoClient, SibApiV3Sdk } = require("../config/brevo");

/**
 * sendOTPEmail
 * ────────────
 * Sends a branded OTP verification email via Brevo (sib-api-v3-sdk).
 */
const sendOTPEmail = async (toEmail, toName, otp) => {
  const apiInstance   = getBrevoClient();
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.sender = {
    name:  process.env.SENDER_NAME || "NexusAuth",
    email: process.env.SENDER_EMAIL,
  };
  sendSmtpEmail.to      = [{ email: toEmail, name: toName }];
  sendSmtpEmail.subject = "🔐 NexusAuth – Your Verification Code";

  sendSmtpEmail.htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>OTP Verification</title>
</head>
<body style="margin:0;padding:0;background-color:#0f0f1a;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f1a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:16px;overflow:hidden;border:1px solid rgba(99,102,241,0.3);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:40px;text-align:center;">
              <h1 style="color:#fff;font-size:28px;margin:0;letter-spacing:2px;font-weight:800;">🔐 NEXUSAUTH</h1>
              <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;letter-spacing:1px;">ENTERPRISE AUTHENTICATION</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:48px 40px;text-align:center;">
              <h2 style="color:#e2e8f0;font-size:22px;margin:0 0 12px;">Verify Your Email Address</h2>
              <p style="color:#94a3b8;font-size:15px;margin:0 0 36px;line-height:1.6;">
                Hi <strong style="color:#a5b4fc;">${toName}</strong>, use the code below to verify your account.
                This code expires in <strong style="color:#f59e0b;">10 minutes</strong>.
              </p>
              <!-- OTP Box -->
              <div style="display:inline-block;background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.15));border:2px solid rgba(99,102,241,0.5);border-radius:16px;padding:28px 48px;margin:0 0 36px;">
                <div style="font-size:48px;font-weight:900;letter-spacing:12px;color:#fff;font-family:monospace;">${otp}</div>
              </div>
              <p style="color:#64748b;font-size:13px;margin:0 0 8px;">Never share this code with anyone.</p>
              <p style="color:#64748b;font-size:13px;margin:0;">If you didn't request this, please ignore this email.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:rgba(0,0,0,0.3);padding:24px 40px;text-align:center;border-top:1px solid rgba(99,102,241,0.2);">
              <p style="color:#475569;font-size:12px;margin:0;">© 2024 NexusAuth. Enterprise-Grade Authentication.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ [Brevo] OTP email sent to ${toEmail} | messageId: ${response.messageId}`);
    return response;
  } catch (error) {
    const httpStatus = error.status || error.response?.status;
    const body       = error.response?.body || error.message;
    console.error(`❌ [Brevo] OTP email FAILED | status: ${httpStatus} | body: ${JSON.stringify(body)}`);
    throw new Error("Failed to send verification email. Please try again.");
  }
};

module.exports = sendOTPEmail;
