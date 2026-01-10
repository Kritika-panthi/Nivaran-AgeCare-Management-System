import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    occupation: {
      type: String,
    },

    dob: {
      type: Date,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
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
