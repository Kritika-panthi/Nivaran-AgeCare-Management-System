import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.use(authMiddleware);

// Routes
router.get("/unread-count", getUnreadNotificationCount);
router.get("/", getMyNotifications);
router.put("/read-all", markAllNotificationsAsRead);
router.put("/:id/read", markNotificationAsRead);

export default router;