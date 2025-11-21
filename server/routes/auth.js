import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import Mentor from "../models/Mentor.js";
import Student from "../models/Student.js"; 
import jwt from "jsonwebtoken";

const router = express.Router();

// -----------------------
// Helper to send email
// -----------------------
const sendEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER, // your Gmail address
        pass: process.env.EMAIL_PASS, // app password, not regular Gmail password
      },
    });

    await transporter.sendMail({
      from: `"MentorConnect" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });
  } catch (err) {
    console.error("Failed to send email:", err);
    throw new Error("Email sending failed");
  }
};

// -----------------------
// REGISTER
// -----------------------
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: false,
      verificationToken,
    });

    // If the user is a mentor, create a mentor document
if (role === "mentor") {
  await Mentor.create({
    user: user._id,
    expertise: "", // default empty string
  });

  } else if (role === "student") {
  await Student.create({
    user: user._id,
    // any extra fields
  });
}


    // Create a clickable verification link
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

    const htmlMessage = `
      <h2>Welcome to MentorConnect, ${name}!</h2>
      <p>Please click the link below to verify your email:</p>
      <a href="${verificationUrl}" target="_blank">Verify Email</a>
    `;

    await sendEmail(email, "Verify your MentorConnect Email", htmlMessage);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      message: "Verification email sent. Please check your inbox.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------
// VERIFY EMAIL
// -----------------------
router.get("/verify-email/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).json({ success: false, message: "Invalid verification token" });

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.json({ success: true, message: "Email verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// -----------------------
// LOGIN
// -----------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  if (!user.isVerified) return res.status(403).json({ message: "Please verify your email first" });

  // Generate token
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token,
  });
});

// -----------------------
// FORGOT PASSWORD
// -----------------------
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    
    const htmlMessage = `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
    `;

    await sendEmail(email, "Reset your MentorConnect Password", htmlMessage);

    res.json({ message: "Password reset email sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------
// RESET PASSWORD
// -----------------------
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
