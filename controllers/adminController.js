import Caregiver from "../models/caregiver.js";
import User from "../models/user.js";
import Booking from "../models/booking.js";
import Client from "../models/client.js";
import createNotification from "../utils/createNotification.js";
import sendEmail from "../utils/sendEmail.js";

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

    // Send email to caregiver — registration approved
    if (caregiver.user?.email) {
      await sendEmail({
        to: caregiver.user.email,
        subject: "Registration Approved — Nivaran",
        html: `
        <div style="font-family:sans-serif;max-width:520px;
                    margin:auto;padding:24px;
                    border:1px solid #e5e7eb;
                    border-radius:12px;">
          <h2 style="color:#2E4E3F;">
            Registration Approved ✓
          </h2>
          <p>Hi <strong>
            ${caregiver.user.fullName}
          </strong>,</p>
          <p>Congratulations! Your caregiver registration
             on <strong>Nivaran</strong> has been
             <strong>approved</strong> by our admin team.
          </p>
          <p style="color:#6b7280;font-size:13px;">
            You can now log in and start receiving
            booking requests from clients.
          </p>
          <p style="color:#2E4E3F;font-weight:600;
                    margin-top:24px;">
            — Nivaran Team
          </p>
        </div>
      `,
      });
    }

    // Send email to admin — notify about approval action
    const adminUser = await User.findById(req.user._id)
      .select("email fullName");
    if (adminUser?.email) {
      await sendEmail({
        to: adminUser.email,
        subject: "Caregiver Approved — Nivaran Admin",
        html: `
        <div style="font-family:sans-serif;max-width:520px;
                    margin:auto;padding:24px;
                    border:1px solid #e5e7eb;
                    border-radius:12px;">
          <h2 style="color:#2E4E3F;">
            Caregiver Approved
          </h2>
          <p>Hi <strong>${adminUser.fullName}</strong>,
          </p>
          <p>You have successfully approved the following
             caregiver registration:</p>
          <table style="width:100%;border-collapse:collapse;
                        margin:16px 0;">
            <tr>
              <td style="padding:8px 0;color:#6b7280;">
                Caregiver
              </td>
              <td style="padding:8px 0;font-weight:600;">
                ${caregiver.user.fullName}
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;">
                Email
              </td>
              <td style="padding:8px 0;font-weight:600;">
                ${caregiver.user.email}
              </td>
            </tr>
          </table>
          <p style="color:#2E4E3F;font-weight:600;
                    margin-top:24px;">
            — Nivaran System
          </p>
        </div>
      `,
      });
    }

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

    // Send email to caregiver — registration rejected
    if (caregiver.user?.email) {
      await sendEmail({
        to: caregiver.user.email,
        subject: "Registration Rejected — Nivaran",
        html: `
        <div style="font-family:sans-serif;max-width:520px;
                    margin:auto;padding:24px;
                    border:1px solid #e5e7eb;
                    border-radius:12px;">
          <h2 style="color:#e74c3c;">
            Registration Rejected
          </h2>
          <p>Hi <strong>
            ${caregiver.user.fullName}
          </strong>,</p>
          <p>We regret to inform you that your caregiver
             registration on <strong>Nivaran</strong>
             has been <strong>rejected</strong> by our
             admin team.
          </p>
          <p style="color:#6b7280;font-size:13px;">
            If you believe this is an error, please
            contact our support team.
          </p>
          <p style="color:#2E4E3F;font-weight:600;
                    margin-top:24px;">
            — Nivaran Team
          </p>
        </div>
      `,
      });
    }

    res.json({ message: "Caregiver rejected" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: ["client", "caregiver"] },
    })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    const enriched = await Promise.all(
      users.map(async (user) => {
        if (user.role === "client") {
          const client = await Client.findOne({
            user: user._id,
          }).lean();
          return {
            ...user,
            phone: client?.phone || "",
            profilePhoto: client?.profilePhoto || null,
          };
        } else {
          const caregiver = await Caregiver.findOne({
            user: user._id,
          }).lean();
          return {
            ...user,
            phone: caregiver?.phone || "",
            profilePhoto: caregiver?.profilePhoto || null,
            approvalStatus: caregiver?.approvalStatus || "",
          };
        }
      })
    );

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllCaregivers = async (req, res) => {
  try {
    const caregivers = await Caregiver.find()
      .populate("user", "fullName email isActive")
      .sort({ createdAt: -1 })
      .lean();

    res.json(caregivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate({
        path: "caregiver",
        populate: {
          path: "user",
          select: "fullName email",
        },
      })
      .populate("client", "fullName email")
      .populate("familyProfile", "fullName")
      .sort({ createdAt: -1 })
      .lean();

    const formatted = bookings.map((b) => ({
      _id: b._id,
      date: b.date,
      startTime: b.startTime,
      endTime: b.endTime,
      status: b.status,
      totalAmount: b.totalAmount,
      hours: b.hours,
      paymentStatus: b.paymentStatus || "unpaid",
      clientName: b.client?.fullName || "Unknown",
      clientEmail: b.client?.email || "",
      caregiverName: b.caregiver?.user?.fullName || "Unknown",
      caregiverEmail: b.caregiver?.user?.email || "",
      familyMemberName: b.familyProfile?.fullName || "Unknown",
      createdAt: b.createdAt,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${
        user.isActive ? "activated" : "deactivated"
      } successfully`,
      isActive: user.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
