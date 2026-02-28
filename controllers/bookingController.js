import Booking from "../models/booking.js";
import Caregiver from "../models/caregiver.js";
import FamilyProfile from "../models/familyProfile.js";
import User from "../models/user.js";
import createNotification from "../utils/createNotification.js";

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const parseDateOnlyUTC = (dateStr) => {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

const overlaps = (aStart, aEnd, bStart, bEnd) => {
  const A1 = toMinutes(aStart);
  const A2 = toMinutes(aEnd);
  const B1 = toMinutes(bStart);
  const B2 = toMinutes(bEnd);

  return A1 < B2 && A2 > B1;
};

export const createBooking = async (req, res) => {
  try {
    const { caregiverId, familyProfileId, date, startTime, endTime } = req.body;

    if (!caregiverId || !familyProfileId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const bookingDate = parseDateOnlyUTC(date);
    if (!bookingDate) {
      return res.status(400).json({ message: "Invalid date" });
    }

    if (toMinutes(startTime) >= toMinutes(endTime)) {
      return res.status(400).json({ message: "Invalid time range" });
    }

    const caregiver = await Caregiver.findById(caregiverId).populate("user", "fullName");
    if (!caregiver) {
      return res.status(404).json({ message: "Caregiver not found" });
    }

    const family = await FamilyProfile.findOne({
      _id: familyProfileId,
      client: req.user._id,
    });

    if (!family) {
      return res.status(404).json({ message: "Family profile not found" });
    }

    const caregiverBookings = await Booking.find({
      caregiver: caregiver._id,
      date: bookingDate,
      status: { $in: ["pending", "confirmed"] },
    });

    for (const booking of caregiverBookings) {
      if (
        overlaps(
          startTime,
          endTime,
          booking.startTime,
          booking.endTime
        )
      ) {
        return res.status(409).json({
          message: "Caregiver already booked for this time range",
        });
      }
    }

    const familyBookings = await Booking.find({
      familyProfile: family._id,
      date: bookingDate,
      status: { $in: ["pending", "confirmed"] },
    });

    for (const booking of familyBookings) {
      if (
        overlaps(
          startTime,
          endTime,
          booking.startTime,
          booking.endTime
        )
      ) {
        return res.status(409).json({
          message: "This family member already has another booking at this time",
        });
      }
    }

    const minutes = toMinutes(endTime) - toMinutes(startTime);
    const hours = minutes / 60;

    if (!Number.isFinite(hours) || hours <= 0) {
      return res.status(400).json({ message: "Invalid hours calculation" });
    }

    const serviceFee = 150;
    const totalAmount = caregiver.hourlyRate * hours + serviceFee;

    const booking = await Booking.create({
      client: req.user._id,
      caregiver: caregiver._id,
      familyProfile: family._id,
      date: bookingDate,
      startTime,
      endTime,
      hours,
      totalAmount,
      status: "pending",
    });

    const clientUser = await User.findById(req.user._id).select("fullName");

    await createNotification({
      recipient: caregiver.user._id,
      sender: req.user._id,
      type: "booking_request",
      title: "New Booking Request",
      message: `${clientUser?.fullName || "A client"} booked you on ${date} from ${startTime} to ${endTime}.`,
      meta: {
        bookingId: booking._id,
        caregiverId: caregiver._id,
        familyProfileId: family._id,
        date,
        startTime,
        endTime,
      },
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};