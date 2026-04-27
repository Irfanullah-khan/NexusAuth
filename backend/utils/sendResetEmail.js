const { getBrevoClient, SibApiV3Sdk } = require("../config/brevo");

/**
 * sendResetEmail
 * ──────────────
 * Sends a branded password-reset email via Brevo (sib-api-v3-sdk).
 * Raw token in the URL — only sha256 hash stored in DB.
 */
const sendResetEmail = async (toEmail, toName, resetUrl) => {
  const senderEmail = process.env.SENDER_EMAIL;
  const senderName  = process.env.SENDER_NAME || "NexusAuth";
  const isDev       = process.env.NODE_ENV !== "production";

  // ── Pre-flight log ─────────────────────────────────────────────────────────
  console.log("\n📧 [Brevo] Initiating reset email send...");
  console.log(`   → Recipient : ${toEmail}`);
  console.log(`   → Sender    : ${senderEmail} (${senderName})`);
  console.log(`   → Reset URL : ${resetUrl}`);

  const apiInstance   = getBrevoClient();
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.sender  = { name: senderName, email: senderEmail };
  sendSmtpEmail.to      = [{ email: toEmail, name: toName }];
  sendSmtpEmail.subject = "🔑 Reset Your NexusAuth Password";

  sendSmtpEmail.htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Password</title>
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
              <div style="width:72px;height:72px;background:rgba(245,158,11,0.15);border:2px solid rgba(245,158,11,0.4);border-radius:50%;margin:0 auto 28px;font-size:32px;line-height:72px;">🔑</div>
              <h2 style="color:#e2e8f0;font-size:22px;margin:0 0 12px;">Password Reset Request</h2>
              <p style="color:#94a3b8;font-size:15px;margin:0 0 8px;line-height:1.6;">
                Hi <strong style="color:#a5b4fc;">${toName}</strong>,
              </p>
              <p style="color:#94a3b8;font-size:15px;margin:0 0 36px;line-height:1.6;">
                We received a request to reset your NexusAuth password.<br/>
                This link expires in <strong style="color:#f59e0b;">15 minutes</strong> and is single-use.
              </p>
              <!-- CTA Button -->
              <a href="${resetUrl}" target="_blank"
                style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:12px;letter-spacing:0.5px;margin-bottom:32px;">
                Reset My Password →
              </a>
              <!-- Fallback URL -->
              <p style="color:#64748b;font-size:12px;margin:0 0 6px;">If the button doesn't work, paste this link in your browser:</p>
              <p style="margin:0 0 32px;word-break:break-all;">
                <a href="${resetUrl}" style="color:#818cf8;font-size:12px;">${resetUrl}</a>
              </p>
              <!-- Security notice -->
              <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:16px 24px;text-align:left;">
                <p style="color:#fca5a5;font-size:13px;margin:0 0 6px;font-weight:600;">⚠ Security Notice</p>
                <p style="color:#94a3b8;font-size:13px;margin:0;line-height:1.6;">
                  If you did not request a password reset, ignore this email — your password will remain unchanged.
                </p>
              </div>
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
    console.log(`✅ [Brevo] Reset email delivered!`);
    console.log(`   → messageId : ${response.messageId}`);
    return response;

  } catch (error) {
    const httpStatus = error.status || error.response?.status;
    const body       = error.response?.body || error.response?.text || error.message;

    console.error("\n❌ [Brevo] Reset email FAILED — full dump:");
    console.error(`   → HTTP status   : ${httpStatus}`);
    console.error(`   → error.message : ${error.message}`);
    console.error(`   → response body : ${JSON.stringify(body, null, 2)}`);

    if (isDev) {
      console.error("\n🔧 [Brevo] Checklist:");
      console.error("   1. Copy a fresh API key from brevo.com → Settings → SMTP & API → API Keys");
      console.error(`   2. Verify sender '${senderEmail}' at brevo.com → Senders, domains, IPs`);
      console.error("   3. Restart backend after editing .env");
    }

    let userMessage = "Failed to send reset email. Please try again later.";
    if (httpStatus === 401) userMessage = "Email service authentication failed. Check your BREVO_API_KEY in .env.";
    else if (httpStatus === 400) userMessage = `Brevo rejected the email (400). Check sender verification. Body: ${JSON.stringify(body)}`;
    else if (httpStatus === 429) userMessage = "Email rate limit exceeded. Please wait and try again.";

    throw new Error(userMessage);
  }
};

module.exports = sendResetEmail;
