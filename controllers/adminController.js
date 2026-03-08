import Caregiver from "../models/caregiver.js";
import User from "../models/user.js";
import createNotification from "../utils/createNotification.js";

// Get Admin dashboard stats
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({
      isActive: true,
    });
    
    const verifiedCaregivers = await Caregiver.countDocuments({
      approvalStatus: "approved",
    });

    const pendingApprovals = await Caregiver.countDocuments({
      approvalStatus: "pending",
    });

    const activeSessions = 0;

    res.json({
      totalUsers,
      verifiedCaregivers,
      pendingApprovals,
      activeSessions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get caregiver by caregiverId
export const getCaregiverById = async (req, res) => {
  try {
    const caregiver = await Caregiver.findById(req.params.id)
      .populate("user", "fullName email");

    if (!caregiver) {
      return res.status(404).json({ message: "Caregiver not found" });
    }

    res.json(caregiver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get pending caregivers
export const getPendingCaregivers = async (req, res) => {
  try {
    const caregivers = await Caregiver.find({
      approvalStatus: "pending",
    }).populate("user", "fullName email phone");

    res.json(caregivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve caregiver
export const approveCaregiver = async (req, res) => {
  try {
    const caregiver = await Caregiver.findById(req.params.id).populate("user", "fullName email");

    if (!caregiver) {
      return res.status(404).json({ message: "Caregiver not found" });
    }

    caregiver.approvalStatus = "approved";
    await caregiver.save();

    await createNotification({
      recipient: caregiver.user._id,
      sender: req.user._id,
      type: "caregiver_approved",
      title: "Registration Approved",
      message: "Your caregiver registration has been approved by admin.",
      meta: {
        caregiverId: caregiver._id,
      },
    });

    res.json({ message: "Caregiver approved" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Reject Caregiver
export const rejectCaregiver = async (req, res) => {
  try {
    const caregiver = await Caregiver.findById(req.params.id).populate("user", "fullName email");

    if (!caregiver) {
      return res.status(404).json({ message: "Caregiver not found" });
    }

    caregiver.approvalStatus = "rejected";
    await caregiver.save();

    await User.findByIdAndUpdate(caregiver.user._id, {
      isActive: false,
    });

    await createNotification({
      recipient: caregiver.user._id,
      sender: req.user._id,
      type: "caregiver_rejected",
      title: "Registration Rejected",
      message: "Your caregiver registration has been rejected by admin.",
      meta: {
        caregiverId: caregiver._id,
      },
    });

    res.json({ message: "Caregiver rejected" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
