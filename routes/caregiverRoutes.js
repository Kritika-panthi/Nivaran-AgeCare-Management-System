import express from "express";
import Caregiver from "../models/caregiver.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import {
  getCaregiverDashboard,
  acceptBooking,
  declineBooking,
  completeBooking,
  getCaregiverProfile,
  updateCaregiverProfile,
} from "../controllers/caregiverController.js";

const router = express.Router();

// Public route
router.get("/approved", async (req, res) => {
  try {
    const caregivers = await Caregiver.find({
      approvalStatus: "approved",
    })
      .populate("user", "fullName")
      .lean();

    const validCaregivers = caregivers.filter(
      (caregiver) => caregiver.user !== null
    );

    res.json(validCaregivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Protected caregiver routes
router.get(
  "/profile",
  authMiddleware,
  roleMiddleware("caregiver"),
  getCaregiverProfile
);

router.put(
  "/profile",
  authMiddleware,
  roleMiddleware("caregiver"),
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "idProof", maxCount: 1 },
  ]),
  updateCaregiverProfile
);

router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("caregiver"),
  getCaregiverDashboard
);

router.put(
  "/bookings/:id/accept",
  authMiddleware,
  roleMiddleware("caregiver"),
  acceptBooking
);

router.put(
  "/bookings/:id/decline",
  authMiddleware,
  roleMiddleware("caregiver"),
  declineBooking
);

router.put(
  "/bookings/:id/complete",
  authMiddleware,
  roleMiddleware("caregiver"),
  completeBooking
);


export default router;