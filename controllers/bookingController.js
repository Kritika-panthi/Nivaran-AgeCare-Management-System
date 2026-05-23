import Booking from "../models/booking.js";
import Caregiver from "../models/caregiver.js";
import FamilyProfile from "../models/familyProfile.js";
import User from "../models/user.js";
import createNotification from "../utils/createNotification.js";
import sendEmail from "../utils/sendEmail.js";

// Convert "HH:MM" string to total minutes
const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

// Parse a date string into UTC midnight
const parseDateOnlyUTC = (dateStr) => {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

// Check if two time ranges overlap
const overlaps = (aStart, aEnd, bStart, bEnd) => {
  const A1 = toMinutes(aStart);
  const A2 = toMinutes(aEnd);
  const B1 = toMinutes(bStart);
  const B2 = toMinutes(bEnd);

  return A1 < B2 && A2 > B1;
};

// Create a new booking
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

    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0);

    if (bookingDate < todayUTC) {
      return res.status(400).json({
        message: "Cannot book on a past date"
      });
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

    if (!family.parentLocation?.lat || !family.parentLocation?.lng) {
      return res.status(400).json({
        message: "Family location not set. Please update family profile.",
      });
    }

    const isToday = bookingDate.getTime() === todayUTC.getTime();

    if (isToday) {
      const nowMinutes =
        new Date().getUTCHours() * 60 + new Date().getUTCMinutes();
      const startMinutes = toMinutes(startTime);

      if (startMinutes <= nowMinutes) {
        return res.status(400).json({
          message: "Cannot book a time slot that has already passed today"
        });
      }
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
      tracking: {
        parentLocation: {
          lat: family.parentLocation.lat,
          lng: family.parentLocation.lng,
        },
        status: "PENDING",
      },
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

    // Send email to caregiver
    const caregiverUser = await User.findById(caregiver.user._id)
      .select("email fullName");
    if (caregiverUser?.email) {
      await sendEmail({
        to: caregiverUser.email,
        subject: "New Booking Request — Nivaran",
        html: `
        <div style="font-family:sans-serif;max-width:520px;
                    margin:auto;padding:24px;
                    border:1px solid #e5e7eb;
                    border-radius:12px;">
          <h2 style="color:#2E4E3F;">
            New Booking Request
          </h2>
          <p>Hi <strong>${caregiverUser.fullName}</strong>,</p>
          <p>You have received a new booking request
             on <strong>Nivaran</strong>.</p>
          <table style="width:100%;border-collapse:collapse;
                        margin:16px 0;">
            <tr>
              <td style="padding:8px 0;color:#6b7280;">
                Client
              </td>
              <td style="padding:8px 0;font-weight:600;">
                ${clientUser?.fullName || "A client"}
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;">
                Date
              </td>
              <td style="padding:8px 0;font-weight:600;">
                ${date}
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;">
                Time
              </td>
              <td style="padding:8px 0;font-weight:600;">
                ${startTime} – ${endTime}
              </td>
            </tr>
          </table>
          <p style="color:#6b7280;font-size:13px;">
            Please log in to Nivaran to accept or
            decline this booking.
          </p>
          <p style="color:#2E4E3F;font-weight:600;
                    margin-top:24px;">
            — Nivaran Team
          </p>
        </div>
      `,
      });
    }

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookingTrackingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: "caregiver",
        populate: {
          path: "user",
          select: "fullName",
        },
      })
      .populate("familyProfile", "fullName livingAddress")
      .lean();

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // only allow owner client to access
    if (String(booking.client) !== String(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json({
      _id: booking._id,
      status: booking.status,
      startTime: booking.startTime,
      endTime: booking.endTime,
      date: booking.date,
      caregiverName: booking.caregiver?.user?.fullName || "Unknown Caregiver",
      familyMemberName: booking.familyProfile?.fullName || "Unknown Family Member",
      tracking: {
        parentLocation: booking.tracking?.parentLocation || null,
        caregiverLocation: booking.tracking?.caregiverLocation || null,
        distance: booking.tracking?.distance ?? null,
        status: booking.tracking?.status || "PENDING",
        enteredAt: booking.tracking?.enteredAt || null,
        leftAt: booking.tracking?.leftAt || null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createMultiDayBooking = async (req, res) => {
  try {
    const {
      caregiverId,
      familyProfileId,
      startDate,
      endDate,
      startTime,
      endTime,
    } = req.body;

    if (
      !caregiverId ||
      !familyProfileId ||
      !startDate ||
      !endDate ||
      !startTime ||
      !endTime
    ) {
      return res
        .status(400)
        .json({ message: "Missing required fields" });
    }

    if (toMinutes(startTime) >= toMinutes(endTime)) {
      return res
        .status(400)
        .json({ message: "Invalid time range" });
    }

    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0);

    const start = parseDateOnlyUTC(startDate);
    const end = parseDateOnlyUTC(endDate);

    if (!start || !end) {
      return res
        .status(400)
        .json({ message: "Invalid date range" });
    }

    if (start < todayUTC) {
      return res
        .status(400)
        .json({ message: "Start date cannot be in the past" });
    }

    if (end < start) {
      return res
        .status(400)
        .json({ message: "End date must be on or after start date" });
    }

    // Build array of all dates in range
    const dates = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      dates.push(new Date(cursor));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    if (dates.length > 30) {
      return res
        .status(400)
        .json({ message: "Date range cannot exceed 30 days" });
    }

    const caregiver = await Caregiver.findById(caregiverId)
      .populate("user", "fullName");
    if (!caregiver) {
      return res
        .status(404)
        .json({ message: "Caregiver not found" });
    }

    const family = await FamilyProfile.findOne({
      _id: familyProfileId,
      client: req.user._id,
    });
    if (!family) {
      return res
        .status(404)
        .json({ message: "Family profile not found" });
    }

    if (
      !family.parentLocation?.lat ||
      !family.parentLocation?.lng
    ) {
      return res.status(400).json({
        message:
          "Family location not set. Please update family profile.",
      });
    }

    const minutes = toMinutes(endTime) - toMinutes(startTime);
    const hours = minutes / 60;

    if (!Number.isFinite(hours) || hours <= 0) {
      return res
        .status(400)
        .json({ message: "Invalid hours calculation" });
    }

    const serviceFee = 150;
    const totalAmount = caregiver.hourlyRate * hours + serviceFee;

    const clientUser = await User.findById(req.user._id)
      .select("fullName");

    const createdBookings = [];
    const skippedDates = [];

    for (const bookingDate of dates) {
      // Check caregiver conflict for this date
      const caregiverBookings = await Booking.find({
        caregiver: caregiver._id,
        date: bookingDate,
        status: { $in: ["pending", "confirmed"] },
      });

      let conflict = false;
      for (const b of caregiverBookings) {
        if (overlaps(startTime, endTime, b.startTime, b.endTime)) {
          conflict = true;
          break;
        }
      }

      // Check client/family conflict for this date
      if (!conflict) {
        const familyBookings = await Booking.find({
          familyProfile: family._id,
          date: bookingDate,
          status: { $in: ["pending", "confirmed"] },
        });
        for (const b of familyBookings) {
          if (
            overlaps(startTime, endTime, b.startTime, b.endTime)
          ) {
            conflict = true;
            break;
          }
        }
      }

      if (conflict) {
        // Skip this date, record it as skipped
        const dateStr = bookingDate
          .toISOString()
          .split("T")[0];
        skippedDates.push(dateStr);
        continue;
      }

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
        tracking: {
          parentLocation: {
            lat: family.parentLocation.lat,
            lng: family.parentLocation.lng,
          },
          status: "PENDING",
        },
      });

      createdBookings.push(booking);

      // Send notification for each booked day
      const dateStr = bookingDate
        .toISOString()
        .split("T")[0];
      await createNotification({
        recipient: caregiver.user._id,
        sender: req.user._id,
        type: "booking_request",
        title: "New Booking Request",
        message: `${
          clientUser?.fullName || "A client"
        } booked you on ${dateStr} from ${startTime} to ${endTime}.`,
        meta: {
          bookingId: booking._id,
          caregiverId: caregiver._id,
          familyProfileId: family._id,
          date: dateStr,
          startTime,
          endTime,
        },
      });

      // Send email per day to caregiver
      const caregiverEmailUser = await User
        .findById(caregiver.user._id)
        .select("email fullName");
      if (caregiverEmailUser?.email) {
        await sendEmail({
          to: caregiverEmailUser.email,
          subject: `Booking Request for ${dateStr} — Nivaran`,
          html: `
        <div style="font-family:sans-serif;max-width:520px;
                    margin:auto;padding:24px;
                    border:1px solid #e5e7eb;
                    border-radius:12px;">
          <h2 style="color:#2E4E3F;">
            New Booking Request
          </h2>
          <p>Hi <strong>
            ${caregiverEmailUser.fullName}
          </strong>,</p>
          <p>You have received a booking request
             for <strong>${dateStr}</strong>.</p>
          <table style="width:100%;border-collapse:collapse;
                        margin:16px 0;">
            <tr>
              <td style="padding:8px 0;color:#6b7280;">
                Client
              </td>
              <td style="padding:8px 0;font-weight:600;">
                ${clientUser?.fullName || "A client"}
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;">
                Time
              </td>
              <td style="padding:8px 0;font-weight:600;">
                ${startTime} – ${endTime}
              </td>
            </tr>
          </table>
          <p style="color:#6b7280;font-size:13px;">
            Please log in to Nivaran to accept or
            decline this booking.
          </p>
          <p style="color:#2E4E3F;font-weight:600;
                    margin-top:24px;">
            — Nivaran Team
          </p>
        </div>
      `,
        });
      }
    }

    if (createdBookings.length === 0) {
      return res.status(409).json({
        message:
          "All dates in the selected range are already booked.",
        skippedDates,
      });
    }

    return res.status(201).json({
      message: `${createdBookings.length} booking(s) created successfully.`,
      bookingsCreated: createdBookings.length,
      skippedDates,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
