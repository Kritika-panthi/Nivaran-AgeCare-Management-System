import mongoose from "mongoose";

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
      type: String,
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

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    currentLocation: {
      type: String,
      required: true,
    },

    permanentAddress: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Client", clientSchema);
