import mongoose from "mongoose";

// Define schema for User collection
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true, // Removes extra spaces from start/end
    },

    email: {
      type: String,
      required: true,
      unique: true, // No duplicate emails allowed
      lowercase: true, // Converts email to lowercase automatically
    },

    password: {
      type: String,
      required: false,
      default: null,
    },

    // Role of the user (determines access level)
    role: {
      type: String,
      enum: ["client", "caregiver", "admin"], // Only these roles allowed
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    googleId: {
      type: String,
      default: null,
    },

    isProfileComplete: {
      type: Boolean,
      default: false,
    },

    passwordResetToken: {
      type: String,
      default: null,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
