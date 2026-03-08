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
          type: String, 
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Availability", availabilitySchema);