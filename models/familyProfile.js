import mongoose from "mongoose";

const familyProfileSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    photo: {
      type: String,
    },

    fullName: {
      type: String,
      required: true,
    },

    age: {
      type: Number,
      required: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    phone: {
      type: String,
    },

    emergencyContact: {
      type: String,
    },

    livingAddress: {
      type: String,
    },

    parentLocation: {
      lat: {
        type: Number,
      },
      lng: {
        type: Number,
      },
    },


    bloodGroup: {
      type: String,
      enum: ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"],
    },

    allergies: {
      type: String,
    },

    mobilityLevel: {
      type: String,
      enum: ["WALKS ALONE", "USES STICK", "WHEELCHAIR", "BEDRIDDEN", "NONE"],
    },

    chronicConditions: {
      type: [String],
      default: [],
    },

    currentMedicines: {
      type: [String],
      default: [],
    },

    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("FamilyProfile", familyProfileSchema);