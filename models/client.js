import mongoose from "mongoose";

// Define schema for Client collection
const clientSchema = new mongoose.Schema(
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

    profilePhoto: {
      type: String, // Stores filename or URL
      required: false,
    },

    occupation: {
      type: String,
      required: true,
    },

    dob: {
      type: Date,
      required: true,
    },

    // Gender with restricted values
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    // Current living location
    currentLocation: {
      type: String,
      required: true,
    },

    // Permanent address
    permanentAddress: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Client", clientSchema);
