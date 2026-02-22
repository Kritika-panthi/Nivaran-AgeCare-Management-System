import Availability from "../models/availability.js";
import Booking from "../models/booking.js";
import Caregiver from "../models/caregiver.js";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];


const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const isValidTime = (t) =>
  /^\d{2}:\d{2}$/.test(t) &&
  toMinutes(t) >= 0 &&
  toMinutes(t) <= 24 * 60;

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

// CAREGIVER: Get Weekly Availability
export const getMyWeeklyAvailability = async (req, res) => {
  try {
    const caregiver = await Caregiver.findOne({ user: req.user._id });
    if (!caregiver)
      return res.status(404).json({ message: "Caregiver not found" });

    const weekly = await Availability.find({
      caregiver: caregiver._id,
    }).sort({ day: 1 });

    res.json(weekly);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// CAREGIVER: Add Time Range to Day
export const upsertWeeklyAvailability = async (req, res) => {
  try {
    const caregiver = await Caregiver.findOne({ user: req.user._id });
    if (!caregiver)
      return res.status(404).json({ message: "Caregiver not found" });

    const { day, startTime, endTime } = req.body;

    if (!DAYS.includes(day))
      return res.status(400).json({ message: "Invalid day" });

    if (!isValidTime(startTime) || !isValidTime(endTime))
      return res
        .status(400)
        .json({ message: "Invalid time format (HH:MM)" });

    if (toMinutes(startTime) >= toMinutes(endTime))
      return res
        .status(400)
        .json({ message: "startTime must be before endTime" });

    // Find existing day
    let doc = await Availability.findOne({
      caregiver: caregiver._id,
      day,
    });

    if (!doc) {
      doc = await Availability.create({
        caregiver: caregiver._id,
        day,
        timeRanges: [{ startTime, endTime }],
      });
      return res.status(201).json(doc);
    }

    // Prevent overlapping ranges inside same day
    for (const range of doc.timeRanges) {
      if (overlaps(startTime, endTime, range.startTime, range.endTime)) {
        return res.status(400).json({
          message: "Time overlaps with existing range",
        });
      }
    }

    doc.timeRanges.push({ startTime, endTime });
    await doc.save();

    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CAREGIVER: Remove Specific Time Range

export const removeTimeRange = async (req, res) => {
  try {
    const caregiver = await Caregiver.findOne({ user: req.user._id });
    if (!caregiver)
      return res.status(404).json({ message: "Caregiver not found" });

    const { availabilityId, rangeIndex } = req.body;

    const doc = await Availability.findOne({
      _id: availabilityId,
      caregiver: caregiver._id,
    });

    if (!doc)
      return res.status(404).json({ message: "Availability not found" });

    doc.timeRanges.splice(rangeIndex, 1);

    // If no ranges left delete entire day
    if (doc.timeRanges.length === 0) {
      await doc.deleteOne();
      return res.json({ message: "Day removed" });
    }

    await doc.save();
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// CLIENT: Get Available Hourly Slots

export const getAvailableSlotsForCaregiver = async (req, res) => {
  try {
    const { caregiverId, date } = req.query;

    if (!caregiverId) {
      return res.status(400).json({ message: "caregiverId required" });
    }

    const d = parseDateOnlyUTC(date);
    if (!d) return res.status(400).json({ message: "Invalid date" });

    const caregiver = await Caregiver.findById(caregiverId);
    if (!caregiver)
      return res.status(404).json({ message: "Caregiver not found" });

    const dayName = DAYS[d.getUTCDay()];

    const weekly = await Availability.findOne({
      caregiver: caregiver._id,
      day: dayName,
    });

    if (!weekly) {
      return res.json({
        hourlyRate: caregiver.hourlyRate,
        ranges: [],
      });
    }

        // Existing bookings
    const bookings = await Booking.find({
      caregiver: caregiver._id,
      date: d,
      status: { $in: ["pending", "confirmed"] },
    });

    const availableRanges = [];

    for (const range of weekly.timeRanges) {
      let isBlocked = false;

      for (const booking of bookings) {
        if (
          overlaps(
            range.startTime,
            range.endTime,
            booking.startTime,
            booking.endTime
          )
        ) {
          isBlocked = true;
          break;
        }
      }

      if (!isBlocked) {
        availableRanges.push(range);
      }
    }

    res.json({
      hourlyRate: caregiver.hourlyRate,
      ranges: availableRanges,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};