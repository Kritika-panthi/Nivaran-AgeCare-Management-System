import Client from "../models/client.js";
import User from "../models/user.js";
import Booking from "../models/booking.js";
import Caregiver from "../models/caregiver.js";

export const getClientStats = async (req, res) => {
  try {
    const bookings = await Booking.find({ client: req.user._id }).lean();

    const activeSessions = bookings.filter(
      (b) => b.status === "confirmed"
    ).length;

    const upcomingSessions = bookings.filter(
      (b) => b.status === "pending"
    ).length;

    const toPay = bookings
      .filter((b) => b.status === "pending" || b.status === "confirmed")
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    res.json({
      activeSessions,
      upcomingSessions,
      toPay,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Get Client Profile
export const getClientProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("-password");
    const client = await Client.findOne({ user: userId });

    if (!client) {
      return res.status(404).json({ message: "Client profile not found" });
    }

    res.json({
      fullName: user.fullName,
      email: user.email,
      phone: client.phone,
      occupation: client.occupation,
      dob: client.dob ? client.dob.toISOString().split("T")[0] : "",
      gender: client.gender,
      currentLocation: client.currentLocation,
      permanentAddress: client.permanentAddress,
      profilePhoto: client.profilePhoto,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Update Client Profile
export const updateClientProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      fullName,
      phone,
      occupation,
      dob,
      gender,
      currentLocation,
      permanentAddress,
    } = req.body;

    await User.findByIdAndUpdate(userId, { fullName });

    // Find client profile
    const client = await Client.findOne({ user: userId });

    if (!client) {
      return res.status(404).json({ message: "Client profile not found" });
    }

    // Update fields
    client.phone = phone;
    client.occupation = occupation;
    client.dob = dob;
    client.gender = gender;
    client.currentLocation = currentLocation;
    client.permanentAddress = permanentAddress;

    if (req.file) {
      client.profilePhoto = req.file.filename;
    }

    await client.save();
    
      res.json({
      message: "Profile updated successfully",
      profilePhoto: client.profilePhoto,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getClientBookingHistory = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 3, 1);
    const skip = (page - 1) * limit;

    const totalBookings = await Booking.countDocuments({
      client: req.user._id,
    });

    const bookings = await Booking.find({ client: req.user._id })
      .populate({
        path: "caregiver",
        populate: {
          path: "user",
          select: "fullName",
        },
      })
      .populate("familyProfile", "fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const formatted = bookings.map((booking) => ({
      _id: booking._id,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      totalAmount: booking.totalAmount,
      hours: booking.hours,
      caregiverName: booking.caregiver?.user?.fullName || "Unknown Caregiver",
      familyMemberName:
        booking.familyProfile?.fullName || "Unknown Family Member",
    }));

    res.json({
      bookings: formatted,
      pagination: {
        total: totalBookings,
        page,
        limit,
        totalPages: Math.ceil(totalBookings / limit),
        hasNextPage: page < Math.ceil(totalBookings / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};