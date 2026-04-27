const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id).select("-passwordHash -refreshToken -otp -otpExpiry");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Token invalid.",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Email not verified. Please verify your account.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please refresh.",
        code: "TOKEN_EXPIRED",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

module.exports = { protect };
