import mongoose from "mongoose";

// Define schema for User collection (main authentication table)
const userSchema = new mongoose.Schema(
  {
    // Full name of the user
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
      required: true,
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
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
