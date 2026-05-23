import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    caregiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Caregiver",
      required: true,
      index: true,
    },

    familyProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FamilyProfile",
      required: true,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    startTime: {
      type: String, 
      required: true,
    },

    endTime: {
      type: String, 
      required: true,
    },

    hours: {
      type: Number,
      required: true,
      min: 1,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed", "refunded"],
      default: "unpaid",
      index: true,
    },

    transactionId: {
      type: String,
      default: null,
    },

    transactionCode: {
      type: String,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    tracking: {
      parentLocation: {
        lat: {
          type: Number,
        },
        lng: {
          type: Number,
        },
      },

      caregiverLocation: {
        lat: {
          type: Number,
        },
        lng: {
          type: Number,
        },
        updatedAt: {
          type: Date,
        },
      },

      distance: {
        type: Number,
      },

      status: {
        type: String,
        enum: ["PENDING", "IN", "OUT"],
        default: "PENDING",
      },

      enteredAt: {
        type: Date,
      },

      leftAt: {
        type: Date,
      },
    }, 
  },
  { timestamps: true }
);

// Composite index for conflict checks
bookingSchema.index({ caregiver: 1, date: 1, status: 1 });

export default mongoose.model("Booking", bookingSchema);
