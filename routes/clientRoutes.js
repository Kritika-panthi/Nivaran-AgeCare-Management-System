import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import {
  getClientStats,
  getClientProfile,
  updateClientProfile,
  getClientBookingHistory,
} from "../controllers/clientController.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware("client"));

router.get("/stats", getClientStats);
router.get("/profile", getClientProfile);
router.get("/bookings/history", getClientBookingHistory);
router.put("/profile", upload.single("profilePhoto"), updateClientProfile);


export default router;
