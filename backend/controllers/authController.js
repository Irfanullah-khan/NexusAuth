const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const generateOTP = require("../utils/generateOTP");
const sendOTPEmail = require("../utils/sendOTPEmail");
const sendResetEmail = require("../utils/sendResetEmail");
const {
  generateTokens,
  setTokenCookies,
  clearTokenCookies,
} = require("../utils/generateTokens");

// ─── Google OAuth client (server-side verification only) ──────────────────────
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Helper: validation error shorthand ───────────────────────────────────────
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return true;
  }
  return false;
};

// ─── Helper: build safe user object for responses ─────────────────────────────
const buildUserPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isVerified: user.isVerified,
  provider: user.provider,
  avatar: user.avatar || null,
});

// ─── Helper: sha256 hash a raw token ──────────────────────────────────────────
const hashToken = (rawToken) =>
  crypto.createHash("sha256").update(rawToken).digest("hex");

// ─── @route  POST /api/auth/register ──────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (!existingUser.isVerified) {
        const { otp, otpExpiry } = generateOTP();
        existingUser.otp = otp;
        existingUser.otpExpiry = otpExpiry;
        await existingUser.save();
        await sendOTPEmail(email, existingUser.name, otp);
        return res.status(200).json({
          success: true,
          message: "Account exists but unverified. A new OTP has been sent.",
        });
      }
      return res.status(400).json({
        success: false,
        message: "Email is already registered.",
      });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    const { otp, otpExpiry } = generateOTP();

    const user = await User.create({ name, email, passwordHash, otp, otpExpiry });
    await sendOTPEmail(email, name, otp);

    res.status(201).json({
      success: true,
      message: "Registration successful. Please check your email for the OTP.",
      data: { userId: user._id, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @route  POST /api/auth/verify-otp ────────────────────────────────────────
const verifyOTP = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { email, otp } = req.body;
    const user = await User.findOne({ email }).select("+otp +otpExpiry");

    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    if (user.isVerified) return res.status(400).json({ success: false, message: "Account already verified." });
    if (!user.otp || !user.otpExpiry) return res.status(400).json({ success: false, message: "No OTP found. Please request a new one." });
    if (new Date() > user.otpExpiry) return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    if (user.otp !== otp.trim()) return res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Email verified successfully! You can now log in." });
  } catch (error) {
    next(error);
  }
};

// ─── @route  POST /api/auth/resend-otp ────────────────────────────────────────
const resendOTP = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { email } = req.body;
    const user = await User.findOne({ email }).select("+otp +otpExpiry");

    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    if (user.isVerified) return res.status(400).json({ success: false, message: "Account is already verified." });

    const { otp, otpExpiry } = generateOTP();
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();
    await sendOTPEmail(email, user.name, otp);

    res.status(200).json({ success: true, message: "A new OTP has been sent to your email." });
  } catch (error) {
    next(error);
  }
};

// ─── @route  POST /api/auth/login ─────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+passwordHash +refreshToken");

    if (!user) return res.status(401).json({ success: false, message: "Invalid email or password." });

    // Guard: Google-only account has no password
    if (!user.passwordHash) {
      return res.status(400).json({
        success: false,
        message: "This account was created with Google. Please use 'Continue with Google' to sign in.",
        code: "GOOGLE_ACCOUNT",
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid email or password." });

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
        code: "UNVERIFIED",
      });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    setTokenCookies(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: { user: buildUserPayload(user) },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @route  POST /api/auth/google ────────────────────────────────────────────
const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, message: "Google credential token is required." });
    }

    // Step A: Verify Google ID token server-side
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired Google token. Please try again.",
      });
    }

    // Step B: Extract verified data from payload
    const { sub: googleId, email, name, picture, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({ success: false, message: "Google account email is not verified by Google." });
    }

    // Step C: Find or create user
    let user = await User.findOne({ email }).select("+refreshToken");

    if (user) {
      let modified = false;
      if (!user.googleId) { user.googleId = googleId; modified = true; }
      if (!user.avatar && picture) { user.avatar = picture; modified = true; }
      if (!user.isVerified) { user.isVerified = true; modified = true; }
      if (modified) await user.save();
    } else {
      user = new User({ name, email, provider: "google", googleId, avatar: picture || null, isVerified: true, role: "user" });
      await user.save();
      user = await User.findById(user._id).select("+refreshToken");
    }

    // Step D: Issue JWT tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    setTokenCookies(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      message: "Google authentication successful.",
      data: { user: buildUserPayload(user) },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @route  POST /api/auth/forgot-password ───────────────────────────────────
/**
 * Security principles:
 *  - Always returns the SAME generic 200 response — prevents email enumeration.
 *  - Email send errors cause a 500 so the frontend can distinguish real failure.
 *  - RAW token in email URL; only sha256 HASH stored in DB.
 *  - Token expires in 15 minutes; single-use.
 *  - Google-only accounts silently skipped.
 */
const forgotPassword = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { email } = req.body;
    const isDev = process.env.NODE_ENV !== "production";

    // Generic success response — identical whether user exists or not
    const genericResponse = {
      success: true,
      message: "If an account with that email exists, a password reset link has been sent.",
    };

    // ⚠️ Must explicitly select passwordHash — it has select:false in the schema.
    // Without this, user.passwordHash is always undefined → every user is
    // incorrectly treated as Google-only and silently skipped.
    const user = await User.findOne({ email }).select("+passwordHash");

    // Silently skip: user not found OR Google-only account (no password to reset)
    if (!user || !user.passwordHash) {
      if (isDev) {
        console.log(`[ForgotPwd] Email "${email}" — user ${!user ? "NOT FOUND" : "is Google-only (no password)"} — skipping silently.`);
      }
      return res.status(200).json(genericResponse);
    }

    // Generate cryptographically secure raw token (32 bytes → 64 hex chars)
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Persist only the sha256 hash in DB — raw token goes into the email URL
    user.resetPasswordToken = hashToken(rawToken);
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await user.save();

    // Build reset URL pointing to the frontend route
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl  = `${clientUrl}/reset-password/${rawToken}`;

    if (isDev) {
      console.log(`[ForgotPwd] Token generated for "${email}".`);
      console.log(`[ForgotPwd] Reset URL: ${resetUrl}`);
    }

    // Send email — on failure: clean up stored token and return a real 500
    // so the frontend can show a proper "email failed" error instead of
    // always showing the "check your email" success screen.
    try {
      await sendResetEmail(email, user.name, resetUrl);
      if (isDev) console.log(`[ForgotPwd] ✅ Reset email sent successfully to "${email}".`);
    } catch (emailError) {
      // Rollback the token so the user can request again
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      console.error(`[ForgotPwd] ❌ Email send failed for "${email}": ${emailError.message}`);

      // Return a real 500 — frontend can now distinguish success vs email failure
      return res.status(500).json({
        success: false,
        message: isDev
          ? `Email delivery failed: ${emailError.message}`
          : "Failed to send reset email. Please try again later.",
      });
    }

    res.status(200).json(genericResponse);
  } catch (error) {
    next(error);
  }
};


// ─── @route  POST /api/auth/reset-password ────────────────────────────────────
/**
 * Flow:
 *  1. Hash the incoming raw token from the URL.
 *  2. Find user whose stored hash matches AND whose expiry is still in the future.
 *  3. Hash new password with bcrypt.
 *  4. Clear reset fields + refreshToken (forces re-login on all devices).
 *  5. Return success — frontend redirects to /login.
 */
const resetPassword = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { token, password } = req.body;

    // Hash the raw token from the request body to match what's stored in DB
    const hashedToken = hashToken(token);

    // Find user with matching token that hasn't expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpire +refreshToken");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Password reset link is invalid or has expired. Please request a new one.",
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(password, salt);

    // Clear the reset fields (token is now used — single-use enforced)
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // Invalidate all existing sessions by clearing refresh token
    user.refreshToken = undefined;

    await user.save();

    // Clear any existing auth cookies so stale sessions don't persist
    clearTokenCookies(res);

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully. Please log in with your new password.",
    });
  } catch (error) {
    next(error);
  }
};

// ─── @route  POST /api/auth/refresh-token ─────────────────────────────────────
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) return res.status(401).json({ success: false, message: "No refresh token." });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select("+refreshToken");

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: "Invalid refresh token." });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
    user.refreshToken = newRefreshToken;
    await user.save();

    setTokenCookies(res, accessToken, newRefreshToken);
    res.status(200).json({ success: true, message: "Tokens refreshed." });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Refresh token expired. Please log in again." });
    }
    next(error);
  }
};

// ─── @route  POST /api/auth/logout ────────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      const user = await User.findOne({ refreshToken: token }).select("+refreshToken");
      if (user) { user.refreshToken = undefined; await user.save(); }
    }

    clearTokenCookies(res);
    res.status(200).json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    next(error);
  }
};

// ─── @route  GET /api/auth/me ─────────────────────────────────────────────────
const getMe = async (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user } });
};

module.exports = {
  register, verifyOTP, resendOTP,
  login, googleAuth,
  forgotPassword, resetPassword,
  refreshToken, logout, getMe,
};
