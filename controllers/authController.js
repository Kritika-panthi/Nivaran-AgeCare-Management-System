import User from "../models/user.js";
import Client from "../models/client.js";
import Caregiver from "../models/caregiver.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import createNotification from "../utils/createNotification.js";

export const registerClient = async (req, res) => {
  try {
    const {
        fullName,
        email,
        password,
        phone,
        occupation,
        dob,
        gender,
        currentLocation,
        permanentAddress,
      } = req.body;

    // Validate required fields FIRST
    if (
      !fullName ||
      !email ||
      !password ||
      !phone ||
      !occupation ||
      !dob ||
      !gender ||
      !currentLocation ||
      !permanentAddress
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // CheckExistingUser
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // HashPassword
    const hashedPassword = await bcrypt.hash(password, 10);

    // CreateUser
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: "client",
    });

    // CreateClientProfile
    await Client.create({
      user: user._id,
      phone,
      occupation,
      dob,
      gender,
      currentLocation,
      permanentAddress,
      profilePhoto: req.file ? req.file.path : null,
    });

    res.status(201).json({ message: "Client registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const registerCaregiver = async (req, res) => {
  try {
    const { fullName, email, password, ...caregiverData } = req.body;

    const profilePhoto = req.files?.profilePhoto?.[0]?.filename;
    const idProof = req.files?.idProof?.[0]?.filename;

    if (!profilePhoto || !idProof) {
      return res.status(400).json({
        message: "Profile photo and ID proof are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: "caregiver",
    });

    const caregiver = await Caregiver.create({
      user: user._id,
      ...caregiverData,
      profilePhoto: profilePhoto,
      idProof: idProof,
      approvalStatus: "pending",
    });

    // Notify all admins
    const admins = await User.find({ role: "admin", isActive: true }).select("_id");

    for (const admin of admins) {
      await createNotification({
        recipient: admin._id,
        sender: user._id,
        type: "caregiver_registration_submitted",
        title: "New Caregiver Registration",
        message: `${fullName} has submitted a caregiver registration for approval.`,
        meta: {
          caregiverId: caregiver._id,
          userId: user._id,
        },
      });
    }

    res.status(201).json({
      message: "Caregiver registered. Waiting for admin approval",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // FindUser
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ComparePassword
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // CheckCaregiverApproval
    if (user.role === "caregiver") {
    const caregiver = await Caregiver.findOne({ user: user._id });

    if (!caregiver) {
      return res.status(403).json({ message: "Caregiver profile not found" });
    }

    if (caregiver.approvalStatus === "pending") {
      return res.status(403).json({ message: "Awaiting admin approval" });
    }

    if (caregiver.approvalStatus === "rejected") {
      return res.status(403).json({ message: "Your application was rejected" });
    }
  }

    res.json({
      token: generateToken(user),
      role: user.role,
      fullName: user.fullName,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
