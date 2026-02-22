import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    caregiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Caregiver",
      required: true,
    },

    day: {
      type: String,
      required: true,
    },

    timeRanges: [
      {
        startTime: {
          type: String, // "09:00"
          required: true,
        },
        endTime: {
          type: String, // "11:00"
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Availability", availabilitySchema);