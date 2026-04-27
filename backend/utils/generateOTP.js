const crypto = require("crypto");

const generateOTP = () => {
  // Cryptographically secure 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return { otp, otpExpiry };
};

module.exports = generateOTP;
