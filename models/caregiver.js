import mongoose from "mongoose";

// Define schema for Caregiver collection
const caregiverSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    // Profile photo filename or URL
    profilePhoto: {
      type: String,
      required: true,
    },

    age: {
      type: Number,
      required: true,
    },

    // Gender with limited options
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    experience: {
      type: Number, 
      required: true,
    },

    hourlyRate: {
      type: Number,
      required: true,
    },

    bankAccount: {
      type: String,
      required: true,
    },

    languages: {
      type: [String], // Array of strings
      default: [], // Default empty array
      required: true,
    },

    skills: {
      type: [String],
      default: [],
      required: true,
    },

    currentAddress: {
      type: String,
      required: true,
    },

    permanentAddress: {
      type: String,
      required: true,
    },

    bio: {
      type: String,
    },

    // ID proof document (file name or path)
    idProof: {
      type: String,
      required: true,
    },

    // Admin approval status
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    isAvailable: {
      type: Boolean,
      default: false,
    },
  },
  // Automatically adds createdAt and updatedAt fields
  { timestamps: true }
);

export default mongoose.model("Caregiver", caregiverSchema);
