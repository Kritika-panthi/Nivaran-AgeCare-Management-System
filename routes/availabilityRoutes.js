import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

import {
  getMyWeeklyAvailability,
  upsertWeeklyAvailability,
  removeTimeRange,
  getAvailableSlotsForCaregiver,
} from "../controllers/availabilityController.js";

const router = express.Router();

// Get my weekly availability
router.get(
  "/",
  authMiddleware,
  roleMiddleware("caregiver"),
  getMyWeeklyAvailability
);

// Add time range to a day
router.post(
  "/",
  authMiddleware,
  roleMiddleware("caregiver"),
  upsertWeeklyAvailability
);

// Remove specific time range
router.delete(
  "/",
  authMiddleware,
  roleMiddleware("caregiver"),
  removeTimeRange
);


router.get("/slots", getAvailableSlotsForCaregiver);

export default router;