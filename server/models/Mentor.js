// models/Mentor.js
import mongoose from "mongoose";

const MentorSchema = new mongoose.Schema(
  {
    // Link to user document
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    bio: { type: String, default: "" },
    expertise: { type: String, default: "" }, // or "specialty"
    availability: [
      {
        type: Date, // store as ISO date
      },
    ],
    // Any other mentor-specific fields
  },
  { timestamps: true }
);

export default mongoose.model("Mentor", MentorSchema);
