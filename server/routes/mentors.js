// routes/mentors.js
import express from "express";
import auth from "../middlewares/auth.js"; // your auth middleware
import Mentor from "../models/Mentor.js";
import User from "../models/User.js"; // if needed

const router = express.Router();

/**
 * GET /api/mentors
 * Returns list of mentors formatted for frontend:
 * [
 *  { _id, user: { name, email }, specialty/expertise, availability }
 * ]
 */
router.get("/", async (req, res) => {
  try {
    const mentors = await Mentor.find().populate("user", "name email").lean();

    // Ensure safe defaults and field names frontend expects
    const formatted = mentors.map((m) => ({
      _id: m._id,
      user: m.user || { name: m.name || "Unknown", email: m.email || "No email" },
      specialty: m.expertise || m.specialty || "Not specified",
      availability: m.availability || [],
      bio: m.bio || "",
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching mentors:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * GET /api/mentors/:id
 * Get mentor by mentor doc id
 */
router.get("/:id", async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id).populate("user", "name email");
    if (!mentor) return res.status(404).json({ msg: "Mentor not found" });
    res.json(mentor);
  } catch (err) {
    console.error("Error fetching mentor by ID:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * PUT /api/mentors/:id
 * Mentor updates their profile (must be authenticated)
 */
router.put("/:id", auth, async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) return res.status(404).json({ msg: "Mentor not found" });

    // Only the linked user (mentor owner) can update
    if (mentor.user.toString() !== req.user._id.toString())
      return res.status(403).json({ msg: "Not allowed" });

    const { bio, expertise, availability } = req.body;
    if (bio !== undefined) mentor.bio = bio;
    if (expertise !== undefined) mentor.expertise = expertise;
    if (availability !== undefined) mentor.availability = availability;

    await mentor.save();
    const populated = await mentor.populate("user", "name email");
    res.json(populated);
  } catch (err) {
    console.error("Error updating mentor:", err);
    res.status(500).json({ msg: "Server error" });
  }
});



export default router;
