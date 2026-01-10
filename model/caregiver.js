import mongoose from "mongoose";

const caregiverSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    age: {
      type: Number,
      required: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
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
      type: [String],
      default: [],
    },

    skills: {
      type: [String],
      default: [],
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

    idProof: {
      type: String,
      required: true,
    },

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
  { timestamps: true }
);

export default mongoose.model("Caregiver", caregiverSchema);
