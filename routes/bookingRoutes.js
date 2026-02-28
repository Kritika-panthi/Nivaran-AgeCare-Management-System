import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import { createBooking } from "../controllers/bookingController.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware("client"));
router.post("/", createBooking);

export default router;