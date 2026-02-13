import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import { createFamilyProfile, getFamilyProfiles, deleteFamilyProfile, updateFamilyProfile, getFamilyProfileById } from "../controllers/familyController.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware("client"));

router.post("/", upload.single("photo"), createFamilyProfile);
router.get("/", getFamilyProfiles);
router.delete("/:id", deleteFamilyProfile);
router.get("/:id", getFamilyProfileById);
router.put("/:id", upload.single("photo"), updateFamilyProfile);

export default router;