import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import {
  getPendingCaregivers,
  approveCaregiver,
  rejectCaregiver,
  getCaregiverById,
  getAdminStats,
  getAllUsers,
  getAllCaregivers,
  getAllBookings,
  deactivateUser,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware("admin"));

router.get("/stats", getAdminStats);
router.get("/caregivers/pending", getPendingCaregivers);  
router.get("/caregivers/:id", getCaregiverById);          
router.put("/caregivers/approve/:id", approveCaregiver);
router.delete("/caregivers/reject/:id", rejectCaregiver);
router.get("/users", getAllUsers);
router.patch("/users/:id/toggle", deactivateUser);
router.get("/caregivers", getAllCaregivers);
router.get("/bookings", getAllBookings);
export default router;
