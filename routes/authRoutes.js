import express from "express";
import {
  registerClient,
  registerCaregiver,
  loginUser,
  googleLogin,
  forgotPassword,
  resetPassword,
  sendContactMessage,
} from "../controllers/authController.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/register/client",
  upload.single("profilePhoto"),
  registerClient
);


router.post(
  "/register/caregiver",
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "idProof", maxCount: 1 },
  ]),
  registerCaregiver
);

router.post("/login", loginUser);
router.post("/google", googleLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/contact", sendContactMessage);

export default router;
