const express = require("express");
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const {
  register,
  verifyOTP,
  resendOTP,
  login,
  googleAuth,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// ─── Rate Limiters ────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { success: false, message: "Too many OTP requests. Please wait a minute." },
});

const googleLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many Google login attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for forgot-password — prevents email flooding / enumeration abuse
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                    // 5 requests per IP per window
  message: { success: false, message: "Too many reset attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Validators ───────────────────────────────────────────────────────────────
const registerValidators = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2, max: 50 }).withMessage("Name must be 2–50 characters"),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/).withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*]/).withMessage("Password must contain at least one special character"),
];

const loginValidators = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

const otpValidators = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits").isNumeric().withMessage("OTP must be numeric"),
];

// Password strength — same rules as registration
const passwordValidators = [
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/).withMessage("Must contain at least one uppercase letter")
    .matches(/[0-9]/).withMessage("Must contain at least one number")
    .matches(/[!@#$%^&*]/).withMessage("Must contain at least one special character"),
];

// ─── Routes ───────────────────────────────────────────────────────────────────
router.post("/register",      authLimiter,          registerValidators, register);
router.post("/verify-otp",    otpLimiter,           otpValidators,      verifyOTP);
router.post("/resend-otp",    otpLimiter,           [body("email").isEmail().normalizeEmail()], resendOTP);
router.post("/login",         authLimiter,          loginValidators,    login);
router.post("/google",        googleLimiter,        [body("credential").notEmpty().withMessage("Google credential is required")], googleAuth);

// ── Password Reset flow ────────────────────────────────────────────────────────
router.post("/forgot-password", forgotPasswordLimiter, [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
], forgotPassword);

router.post("/reset-password", authLimiter, [
  body("token").notEmpty().withMessage("Reset token is required"),
  ...passwordValidators,
], resetPassword);

router.post("/refresh-token", refreshToken);
router.post("/logout",        logout);
router.get("/me",             protect, getMe);

// ── DEV-ONLY: Brevo connectivity test ─────────────────────────────────────────
// Hit GET http://localhost:5000/api/auth/test-email in browser or Postman
// to instantly verify whether the Brevo API key + sender email are working.
// This route is DISABLED automatically in production.
if (process.env.NODE_ENV !== "production") {
  const sendResetEmail = require("../utils/sendResetEmail");

  router.get("/test-email", async (req, res) => {
    const testRecipient = req.query.to || process.env.SENDER_EMAIL;

    console.log("\n🧪 [TEST] Brevo connectivity test started...");
    console.log(`   → Sending test email to: ${testRecipient}`);
    console.log(`   → BREVO_API_KEY set?  : ${!!process.env.BREVO_API_KEY}`);
    console.log(`   → SENDER_EMAIL set?   : ${process.env.SENDER_EMAIL}`);

    try {
      await sendResetEmail(
        testRecipient,
        "Test User",
        "http://localhost:5173/reset-password/TEST_TOKEN_123"
      );

      return res.status(200).json({
        success: true,
        message: `✅ Test email sent successfully to ${testRecipient}. Check inbox (and spam).`,
        sender: process.env.SENDER_EMAIL,
        apiKeyOk: true,
      });
    } catch (err) {
      console.error("🧪 [TEST] Brevo test FAILED:", err.message);

      return res.status(500).json({
        success: false,
        message: "❌ Brevo test email FAILED — see backend terminal for full error.",
        error: err.message,
        sender: process.env.SENDER_EMAIL,
        apiKeySet: !!process.env.BREVO_API_KEY,
        fix: [
          "1. Make sure BREVO_API_KEY in .env is correct (copy fresh from brevo.com → Settings → SMTP & API)",
          "2. Make sure sender email is verified in brevo.com → Settings → Senders, domains, IPs",
          "3. Restart the backend after editing .env",
        ],
      });
    }
  });
}

module.exports = router;

