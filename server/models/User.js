import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "mentor"], default: "student" },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },

     // ⭐ Mentor-specific fields
    specialty: { type: String }, // e.g., "Web Development"
    availability: [{ type: Date }], // array of available dates
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
