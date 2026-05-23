import Booking from "../models/booking.js";
import Caregiver from "../models/caregiver.js";
import Availability from "../models/availability.js";
import Client from "../models/client.js";
import User from "../models/user.js";
import createNotification from "../utils/createNotification.js";
import sendEmail from "../utils/sendEmail.js";

// Helper function to format booking data for dashboard cards
const formatBookingCard = async (booking) => {
  const clientProfile = await Client.findOne({ user: booking.client?._id }).lean();

  return {
    _id: booking._id,
    status: booking.status,
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
    hours: booking.hours,
    totalAmount: booking.totalAmount,

    client: {
      id: booking.client?._id || "",
      fullName: booking.client?.fullName || "Unknown Client",
      email: booking.client?.email || "",
      phone: clientProfile?.phone || "",
      currentLocation: clientProfile?.currentLocation || "",
    },

    familyProfile: {
      id: booking.familyProfile?._id || "",
      fullName: booking.familyProfile?.fullName || "",
      age: booking.familyProfile?.age || "",
      gender: booking.familyProfile?.gender || "",
      phone: booking.familyProfile?.phone || "",
      emergencyContact: booking.familyProfile?.emergencyContact || "",
      livingAddress: booking.familyProfile?.livingAddress || "",
      bloodGroup: booking.familyProfile?.bloodGroup || "",
      allergies: booking.familyProfile?.allergies || "",
      mobilityLevel: booking.familyProfile?.mobilityLevel || "",
      chronicConditions: booking.familyProfile?.chronicConditions || [],
      currentMedicines: booking.familyProfile?.currentMedicines || [],
      notes: booking.familyProfile?.notes || "",
      photo: booking.familyProfile?.photo || "",
    },

    tracking: {
    parentLocation: booking.tracking?.parentLocation || null,
    caregiverLocation: booking.tracking?.caregiverLocation || null,
    status: booking.tracking?.status || "PENDING",
    distance: booking.tracking?.distance || 0,
  },
  };
};

// Get caregiver dashboard info: availability, bookings, earnings
export const getCaregiverDashboard = async (req, res) => {
  try {
    const caregiver = await Caregiver.findOne({ user: req.user._id });

    if (!caregiver) {
      return res.status(404).json({ message: "Caregiver not found" });
    }

    // Fetch weekly availability for the caregive
    const weeklyAvailability = await Availability.find({
      caregiver: caregiver._id,
    }).lean();

    // Fetch all bookings related to caregiver
    const isAvailable = weeklyAvailability.some(
      (day) => Array.isArray(day.timeRanges) && day.timeRanges.length > 0
    );

    const bookings = await Booking.find({ caregiver: caregiver._id })
      .populate("client", "fullName email")
      .populate(
        "familyProfile",
        "fullName age gender phone emergencyContact livingAddress bloodGroup allergies mobilityLevel chronicConditions currentMedicines notes photo"
      )
      .sort({ createdAt: -1 })
      .lean();

    // Categorize bookings by status
    const pending = bookings.filter((b) => b.status === "pending");
    const upcoming = bookings.filter((b) => b.status === "confirmed");
    const completed = bookings.filter((b) => b.status === "completed");

    const totalEarnings = completed.reduce(
      (sum, b) => sum + (b.totalAmount || 0),
      0
    );

    // Format bookings for frontend cards
    const pendingBookings = await Promise.all(
      pending.map((booking) => formatBookingCard(booking))
    );

    const upcomingBookings = await Promise.all(
      upcoming.map((booking) => formatBookingCard(booking))
    );

    res.json({
      totalEarnings,
      jobsCompleted: completed.length,
      isAvailable,
      pendingBookings,
      upcomingBookings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept a pending booking
export const acceptBooking = async (req, res) => {
  try {
    const caregiver = await Caregiver.findOne({ user: req.user._id }).populate("user", "fullName");

    if (!caregiver) {
      return res.status(404).json({ message: "Caregiver not found" });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      caregiver: caregiver._id,
      status: "pending",
    });

    if (!booking) {
      return res.status(404).json({ message: "Pending booking not found" });
    }

    // Update booking status
    booking.status = "confirmed";
    await booking.save();

    // Notify client about booking acceptance
    await createNotification({
      recipient: booking.client,
      sender: req.user._id,
      type: "booking_accepted",
      title: "Booking Accepted",
      message: `${caregiver.user.fullName} accepted your booking request.`,
      meta: {
        bookingId: booking._id,
        caregiverId: caregiver._id,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
      },
    });

    // Send email to client — booking accepted
    const clientUser = await User.findById(booking.client)
      .select("email fullName");

    const bookingDate = new Date(booking.date)
      .toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

    if (clientUser?.email) {
      await sendEmail({
        to: clientUser.email,
        subject: "Booking Accepted — Nivaran",
        html: `
        <div style="font-family:sans-serif;max-width:520px;
                    margin:auto;padding:24px;
                    border:1px solid #e5e7eb;
                    border-radius:12px;">
          <h2 style="color:#2E4E3F;">
            Booking Accepted ✓
          </h2>
          <p>Hi <strong>${clientUser.fullName}</strong>,</p>
          <p>Great news! Your booking has been
             <strong>accepted</strong> by your caregiver.
          </p>
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
                Date
              </td>
              <td style="padding:8px 0;font-weight:600;">
                ${bookingDate}
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;">
                Time
              </td>
              <td style="padding:8px 0;font-weight:600;">
                ${booking.startTime} – ${booking.endTime}
              </td>
            </tr>
          </table>
          <p style="color:#6b7280;font-size:13px;">
            You can track your caregiver on Nivaran
            on the day of the booking.
          </p>
          <p style="color:#2E4E3F;font-weight:600;
                    margin-top:24px;">
            — Nivaran Team
          </p>
        </div>
      `,
      });
    }

    res.json({ message: "Booking accepted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Decline a pending booking
export const declineBooking = async (req, res) => {
  try {
    const caregiver = await Caregiver.findOne({ user: req.user._id }).populate("user", "fullName");

    if (!caregiver) {
      return res.status(404).json({ message: "Caregiver not found" });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      caregiver: caregiver._id,
      status: "pending",
    });

    if (!booking) {
      return res.status(404).json({ message: "Pending booking not found" });
    }

    booking.status = "cancelled";
    await booking.save();

    await createNotification({
      recipient: booking.client,
      sender: req.user._id,
      type: "booking_declined",
      title: "Booking Declined",
      message: `${caregiver.user.fullName} declined your booking request.`,
      meta: {
        bookingId: booking._id,
        caregiverId: caregiver._id,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
      },
    });

    // Send email to client — booking declined
    const clientUser = await User.findById(booking.client)
      .select("email fullName");

    const bookingDate = new Date(booking.date)
      .toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

    if (clientUser?.email) {
      await sendEmail({
        to: clientUser.email,
        subject: "Booking Declined — Nivaran",
        html: `
        <div style="font-family:sans-serif;max-width:520px;
                    margin:auto;padding:24px;
                    border:1px solid #e5e7eb;
                    border-radius:12px;">
          <h2 style="color:#e74c3c;">
            Booking Declined
          </h2>
          <p>Hi <strong>${clientUser.fullName}</strong>,</p>
          <p>Unfortunately your booking request has been
             <strong>declined</strong> by the caregiver.
          </p>
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
                Date
              </td>
              <td style="padding:8px 0;font-weight:600;">
                ${bookingDate}
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;">
                Time
              </td>
              <td style="padding:8px 0;font-weight:600;">
                ${booking.startTime} – ${booking.endTime}
              </td>
            </tr>
          </table>
          <p style="color:#6b7280;font-size:13px;">
            You can search for another available caregiver
            on Nivaran.
          </p>
          <p style="color:#2E4E3F;font-weight:600;
                    margin-top:24px;">
            — Nivaran Team
          </p>
        </div>
      `,
      });
    }

    res.json({ message: "Booking declined successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const completeBooking = async (req, res) => {
  try {
    const caregiver = await Caregiver.findOne({ user: req.user._id });

    if (!caregiver) {
      return res.status(404).json({ message: "Caregiver not found" });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      caregiver: caregiver._id,
      status: "confirmed",
    });

    if (!booking) {
      return res.status(404).json({ message: "Confirmed booking not found" });
    }

    booking.status = "completed";
    await booking.save();

    res.json({ message: "Booking marked as completed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCaregiverProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("-password");
    const caregiver = await Caregiver.findOne({ user: userId });

    if (!caregiver) {
      return res.status(404).json({ message: "Caregiver profile not found" });
    }

    res.json({
      fullName: user.fullName,
      age: caregiver.age || "",
      gender: caregiver.gender || "",
      phone: caregiver.phone || "",
      email: user.email,
      experience: caregiver.experience || "",
      hourlyRate: caregiver.hourlyRate || "",
      bankAccount: caregiver.bankAccount || "",
      languages: caregiver.languages || [],
      skills: caregiver.skills || [],
      currentAddress: caregiver.currentAddress || "",
      permanentAddress: caregiver.permanentAddress || "",
      bio: caregiver.bio || "",
      profilePhoto: caregiver.profilePhoto || null,
      idProof: caregiver.idProof || null,
      approvalStatus: caregiver.approvalStatus || "pending",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCaregiverProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      fullName,
      age,
      gender,
      phone,
      email,
      experience,
      hourlyRate,
      bankAccount,
      currentAddress,
      permanentAddress,
      bio,
      languages,
      skills,
    } = req.body;

    await User.findByIdAndUpdate(userId, {
      fullName,
      email,
    });

    const caregiver = await Caregiver.findOne({ user: userId });

    if (!caregiver) {
      return res.status(404).json({ message: "Caregiver profile not found" });
    }

    // Update fields
    caregiver.age = age;
    caregiver.gender = gender;
    caregiver.phone = phone;
    caregiver.experience = experience;
    caregiver.hourlyRate = hourlyRate;
    caregiver.bankAccount = bankAccount;
    caregiver.currentAddress = currentAddress;
    caregiver.permanentAddress = permanentAddress;
    caregiver.bio = bio;

    if (languages) {
      caregiver.languages = Array.isArray(languages) ? languages : [languages];
    }

    if (skills) {
      caregiver.skills = Array.isArray(skills) ? skills : [skills];
    }

    if (req.files?.profilePhoto?.[0]?.filename) {
      caregiver.profilePhoto = req.files.profilePhoto[0].filename;
    }

    if (req.files?.idProof?.[0]?.filename) {
      caregiver.idProof = req.files.idProof[0].filename;
    }

    await caregiver.save();

    res.json({
      message: "Caregiver profile updated successfully",
      profilePhoto: caregiver.profilePhoto,
      idProof: caregiver.idProof,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
