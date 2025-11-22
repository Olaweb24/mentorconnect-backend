import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import mentorRoutes from "./routes/mentors.js";

dotenv.config();
const app = express();

// =====================
// CORS
// =====================
app.use(cors({
  origin: [
    process.env.CLIENT_URL || "https://mentorconnect-frontend-eight.vercel.app",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Preflight (Express 5)
app.options(/.*/, cors());

// =====================
// Middleware
// =====================
app.use(express.json());

// =====================
// Routes
// =====================
app.use("/api/auth", authRoutes);
app.use("/api/mentors", mentorRoutes);

// =====================
// MongoDB connection
// =====================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// =====================
// Error handler
// =====================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// =====================
// Server
// =====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
