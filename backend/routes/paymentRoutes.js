import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import {
  initiatePayment,
  verifyPayment,
  handlePaymentFailure,
} from "../controllers/paymentController.js";

const router = express.Router();

// Calls Khalti API and returns payment_url
router.post(
  "/initiate",
  authMiddleware,
  roleMiddleware("client"),
  initiatePayment
);

// Verify payment 
// No auth needed Khalti redirects here
router.get("/verify", verifyPayment);

// Handle failure
router.get("/failure", handlePaymentFailure);

export default router;
