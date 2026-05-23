import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import {
  createBooking,
  createMultiDayBooking,
  getBookingTrackingById,
} from "../controllers/bookingController.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware("client"));

router.post("/", createBooking);
router.post("/multi-day", createMultiDayBooking);
router.get("/:id/tracking", getBookingTrackingById);

export default router;
