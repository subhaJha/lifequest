const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { signToken } = require("../utils/jwt");

const crypto = require("crypto");
const nodemailer = require("nodemailer");


// REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { username, email, password } =
      req.body;

    // CHECK IF USER EXISTS
    const userExists = await User.findOne({
      email,
    });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // HASH PASSWORD
    const salt = await bcrypt.genSalt(10);

    const hashedPassword =
      await bcrypt.hash(password, salt);

    // CREATE USER
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // GENERATE JWT TOKEN
    const token = signToken({ id: user._id });

    res.status(201).json({
      token,
      user,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

// LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Provide email and password' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = signToken({ id: user._id });

    res.json({ token, user: { id: user._id, username: user.username, email: user.email, xp: user.xp, level: user.level } });
  } catch (error) {
    res.status(500).json(error);
  }
};

const sendResetEmail = async ({ toEmail, resetUrl, token }) => {
  // Env vars required:
  // SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true", // optional
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  // Developer-friendly log:
  console.log("[Password Reset] token:", token);
  console.log("[Password Reset] resetUrl:", resetUrl);

  await transporter.sendMail({
    from,
    to: toEmail,
    subject: "LifeQuest - Reset your password",
    text: `You requested a password reset.\n\nReset your password using this link:\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
    html: `
      <p>You requested a password reset.</p>
      <p>Reset your password using this link:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  });
};

// FORGOT PASSWORD
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Provide email" });

    const user = await User.findOne({ email });
    // Prevent account enumeration: always return 200
    if (!user) {
      return res.status(200).json({ message: "If the account exists, we will send reset instructions" });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    // 30 minutes expiry
    const expires = new Date(Date.now() + 30 * 60 * 1000);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = expires;
    await user.save();

    const clientBase =
      process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientBase}/reset-password?token=${encodeURIComponent(rawToken)}`;

    await sendResetEmail({ toEmail: user.email, resetUrl, token: rawToken });

    res.status(200).json({ message: "Reset email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};

// RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res.status(400).json({ message: "Provide token and new password" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
};
