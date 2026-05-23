import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getApprovedCaregivers,
  getAvailableRanges,
  createBooking,
  createMultiDayBooking,
  getFamilyProfiles,
} from "../api/authApi";

type Caregiver = {
  _id: string;
  user: { fullName: string };
  profilePhoto: string;
  hourlyRate: number;
};

type Range = {
  startTime: string;
  endTime: string;
};

type FamilyProfile = {
  _id: string;
  fullName: string;
  livingAddress?: string;
  parentLocation?: {
    lat: number;
    lng: number;
  };
};

const formatTime = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;

  return `${formattedHour}:${minute.toString().padStart(2, "0")} ${suffix}`;
};

const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const BookingPage = () => {
  const { caregiverId } = useParams();

  const [caregiver, setCaregiver] = useState<Caregiver | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [ranges, setRanges] = useState<Range[]>([]);
  const [selectedRange, setSelectedRange] = useState<Range | null>(null);
  const [familyProfiles, setFamilyProfiles] = useState<FamilyProfile[]>([]);
  const [selectedFamily, setSelectedFamily] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [endDate, setEndDate] = useState("");
  const [bookingMode, setBookingMode] = useState<"single" | "multiday">("single");
  const [skippedDates, setSkippedDates] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");

  const getTodayString = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const getDatesBetween = (
    start: string,
    end: string
  ): string[] => {
    const dates: string[] = [];
    const cursor = new Date(start + "T00:00:00.000Z");
    const endD = new Date(end + "T00:00:00.000Z");
    while (cursor <= endD) {
      dates.push(cursor.toISOString().split("T")[0]);
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return dates;
  };

  const fetchCaregiver = async () => {
    const res = await getApprovedCaregivers();
    const found = res.data.find((c: Caregiver) => c._id === caregiverId);
    setCaregiver(found || null);
  };

  const fetchFamilies = async () => {
    const res = await getFamilyProfiles();
    setFamilyProfiles(res.data);
  };

  useEffect(() => {
    fetchCaregiver();
    fetchFamilies();
  }, []);

  const fetchRanges = async (date: string) => {
    const res = await getAvailableRanges(caregiverId!, date);
    let fetchedRanges: Range[] = res.data.ranges;

    // If selected date is today, filter out slots that
    // have already passed
    const todayStr = getTodayString();
    if (date === todayStr) {
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();

      fetchedRanges = fetchedRanges.filter((range) => {
        const [h, m] = range.startTime.split(":").map(Number);
        const slotMinutes = h * 60 + m;
        return slotMinutes > nowMinutes;
      });
    }

    setRanges(fetchedRanges);
  };

  const fetchRangesForDateRange = async (
    start: string,
    end: string
  ) => {
    if (!start || !end || !caregiverId) return;
    const dates = getDatesBetween(start, end);
    if (dates.length === 0) return;

    // Fetch slots for each date, keep only slots
    // available on ALL days
    const allResults = await Promise.all(
      dates.map((d) => getAvailableRanges(caregiverId!, d))
    );

    // Start with first day's ranges
    let common: Range[] = allResults[0].data.ranges;

    // Intersect with each subsequent day
    for (let i = 1; i < allResults.length; i++) {
      const dayRanges: Range[] = allResults[i].data.ranges;
      common = common.filter((r) =>
        dayRanges.some(
          (dr) =>
            dr.startTime === r.startTime &&
            dr.endTime === r.endTime
        )
      );
    }

    // Filter past slots if start date is today
    const todayStr = getTodayString();
    if (start === todayStr) {
      const now = new Date();
      const nowMinutes =
        now.getHours() * 60 + now.getMinutes();
      common = common.filter((range) => {
        const [h, m] = range.startTime
          .split(":")
          .map(Number);
        return h * 60 + m > nowMinutes;
      });
    }

    setRanges(common);
    setSelectedRange(null);
  };

  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedRange(null);
    setEndDate("");
    if (bookingMode === "single") {
      fetchRanges(date);
    }
  };

  const handleEndDateChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const date = e.target.value;
    setEndDate(date);
    setSelectedRange(null);
    if (selectedDate && date) {
      fetchRangesForDateRange(selectedDate, date);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedDate) {
      alert("Please select a start date");
      return;
    }
    if (bookingMode === "multiday" && !endDate) {
      alert("Please select an end date");
      return;
    }
    if (!selectedRange) {
      alert("Please select a time slot");
      return;
    }
    if (!selectedFamily) {
      alert("Please select a family profile");
      return;
    }
    if (!caregiverId) {
      alert("Caregiver not found");
      return;
    }

    const selectedFamilyObj = familyProfiles.find(
      (f) => f._id === selectedFamily
    );
    if (!selectedFamilyObj) {
      alert("Selected family profile not found");
      return;
    }
    if (
      !selectedFamilyObj.parentLocation ||
      typeof selectedFamilyObj.parentLocation.lat !== "number" ||
      typeof selectedFamilyObj.parentLocation.lng !== "number"
    ) {
      alert(
        "Parent house location is missing. Please update the family profile."
      );
      return;
    }

    try {
      setBookingLoading(true);
      setSkippedDates([]);
      setSuccessMessage("");

      if (bookingMode === "single") {
        await createBooking({
          caregiverId,
          familyProfileId: selectedFamily,
          date: selectedDate,
          startTime: selectedRange.startTime,
          endTime: selectedRange.endTime,
          parentLocation: selectedFamilyObj.parentLocation,
        });
        setSuccessMessage("Booking created successfully!");
      } else {
        const res = await createMultiDayBooking({
          caregiverId,
          familyProfileId: selectedFamily,
          startDate: selectedDate,
          endDate: endDate,
          startTime: selectedRange.startTime,
          endTime: selectedRange.endTime,
        });
        const data = res.data;
        setSuccessMessage(
          `${data.bookingsCreated} day(s) booked successfully!`
        );
        if (data.skippedDates && data.skippedDates.length > 0) {
          setSkippedDates(data.skippedDates);
        }
      }

      setSelectedDate("");
      setEndDate("");
      setSelectedRange(null);
      setSelectedFamily("");
      setRanges([]);
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Booking failed"
      );
    } finally {
      setBookingLoading(false);
    }
  };

  if (!caregiver) return <div>Loading...</div>;

  const serviceFee = 150;

  let hours = 0;
  if (selectedRange) {
    hours =
      (toMinutes(selectedRange.endTime) -
        toMinutes(selectedRange.startTime)) /
      60;
  }

  const numberOfDays =
    bookingMode === "multiday" && selectedDate && endDate
      ? getDatesBetween(selectedDate, endDate).length
      : 1;

  const totalPerDay = caregiver.hourlyRate * hours + serviceFee;
  const total = totalPerDay * numberOfDays;

  const selectedFamilyObj = familyProfiles.find((f) => f._id === selectedFamily);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-2/5 p-10 flex flex-col border-b md:border-b-0 md:border-r border-gray-100">
          <div className="flex items-center gap-4 mb-8">
            <img
              src={`http://localhost:3000/uploads/${caregiver.profilePhoto}`}
              className="w-20 h-20 rounded-2xl object-cover shadow-sm"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {caregiver.user.fullName}
              </h2>
              <span className="text-xs font-medium tracking-widest text-gray-400 uppercase">
                Care Provider
              </span>
            </div>
          </div>

          <hr className="border-gray-100 mb-8" />

          <div className="space-y-4 flex-1">
            <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-2">
              Pricing Summary
            </p>

            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Hourly Rate</span>
              <span className="font-semibold text-gray-800">
                Rs. {caregiver.hourlyRate} / hr
              </span>
            </div>

            {selectedRange && (
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Duration</span>
                <span className="font-semibold text-gray-800">
                  {hours} hr{hours !== 1 ? "s" : ""}
                </span>
              </div>
            )}

            {bookingMode === "multiday" &&
              selectedDate &&
              endDate && (
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Days</span>
                  <span className="font-semibold text-gray-800">
                    {numberOfDays} day{numberOfDays !== 1 ? "s" : ""}
                  </span>
                </div>
              )}

            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>
                Service Fee
                {bookingMode === "multiday" && numberOfDays > 1
                  ? ` × ${numberOfDays}`
                  : ""}
              </span>
              <span className="font-semibold text-gray-800">
                Rs. {serviceFee * numberOfDays}
              </span>
            </div>

            <div
              className="mt-4 p-4 rounded-2xl"
              style={{ backgroundColor: "#f0f4f0" }}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">
                  Total
                </span>
                <span
                  className="text-2xl font-bold"
                  style={{ color: "#2E4E3F" }}
                >
                  Rs. {selectedRange ? total : 0}
                </span>
              </div>
              {bookingMode === "multiday" && numberOfDays > 1 && (
                <p className="text-xs text-gray-400 mt-1">
                  Rs. {totalPerDay} × {numberOfDays} days
                </p>
              )}
              {!selectedRange && (
                <p className="text-xs text-gray-400 mt-1">
                  Select a time slot to see total
                </p>
              )}
            </div>
          </div>

          {selectedRange && (
            <div className="mt-6 p-4 rounded-2xl border border-green-100 bg-green-50">
              <p className="text-xs text-gray-500 mb-1">
                Selected slot
              </p>
              <p
                className="font-semibold text-sm"
                style={{ color: "#2E4E3F" }}
              >
                {formatTime(selectedRange.startTime)} -{" "}
                {formatTime(selectedRange.endTime)}
              </p>
              {selectedDate && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {bookingMode === "multiday" && endDate
                    ? `${new Date(selectedDate + "T00:00:00")
                        .toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })} → ${new Date(endDate + "T00:00:00")
                        .toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })} (${numberOfDays} days)`
                    : new Date(
                        selectedDate + "T00:00:00"
                      ).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="md:w-3/5 p-10 overflow-y-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Book Appointment
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            Choose a date and available time slot below.
          </p>

          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl w-fit">
            <button
              onClick={() => {
                setBookingMode("single");
                setEndDate("");
                setSelectedRange(null);
                setRanges([]);
                if (selectedDate) fetchRanges(selectedDate);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                bookingMode === "single"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Single Day
            </button>
            <button
              onClick={() => {
                setBookingMode("multiday");
                setEndDate("");
                setSelectedRange(null);
                setRanges([]);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                bookingMode === "multiday"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Multi-Day Range
            </button>
          </div>

          <div className={`mb-6 grid gap-4 ${
            bookingMode === "multiday"
              ? "grid-cols-2"
              : "grid-cols-1"
          }`}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {bookingMode === "multiday"
                  ? "Start Date"
                  : "Select Date"}
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                min={getTodayString()}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-800 bg-white"
              />
            </div>

            {bookingMode === "multiday" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  min={selectedDate || getTodayString()}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-800 bg-white"
                />
              </div>
            )}
          </div>

          {bookingMode === "multiday" &&
            selectedDate &&
            endDate && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-xs text-blue-600 font-medium">
                  {numberOfDays} day{numberOfDays !== 1 ? "s" : ""}
                  {" "}selected •{" "}
                  Only time slots available on ALL days are shown
                </p>
              </div>
            )}

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Available Time Slots
            </label>

            {!selectedDate && (
              <div className="py-8 text-center rounded-2xl border border-dashed border-gray-200">
                <p className="text-sm text-gray-400">
                  Please select a date first
                </p>
              </div>
            )}

            {bookingMode === "multiday" &&
              selectedDate &&
              !endDate && (
                <div className="py-8 text-center rounded-2xl border border-dashed border-gray-200">
                  <p className="text-sm text-gray-400">
                    Please select an end date to see
                    available slots
                  </p>
                </div>
              )}

            {selectedDate &&
              (bookingMode === "single" || endDate) &&
              ranges.length === 0 && (
              <div className="py-8 text-center rounded-2xl border border-dashed border-gray-200">
                <p className="text-sm font-medium text-gray-500">
                  No available time slots
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {bookingMode === "multiday"
                    ? "No slots are free on all selected days."
                    : "The caregiver has no availability on this date, or all slots are already booked."}
                </p>
              </div>
            )}

            {selectedDate &&
              (bookingMode === "single" || endDate) &&
              ranges.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {ranges.map((range, i) => {
                  const isSelected =
                    selectedRange?.startTime === range.startTime;

                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedRange(range)}
                      className={`px-4 py-3 rounded-xl border text-left transition-all duration-150 ${
                        isSelected
                          ? "border-transparent text-white shadow-md"
                          : "border-gray-200 bg-white text-gray-700 hover:border-green-800 hover:bg-green-50"
                      }`}
                      style={
                        isSelected
                          ? { backgroundColor: "#2E4E3F" }
                          : {}
                      }
                    >
                      <p className={`text-sm font-semibold ${
                        isSelected ? "text-white" : "text-gray-800"
                      }`}>
                        {formatTime(range.startTime)} -{" "}
                        {formatTime(range.endTime)}
                      </p>
                      <p className={`text-xs mt-0.5 ${
                        isSelected
                          ? "text-green-200"
                          : "text-gray-400"
                      }`}>
                        {(
                          (toMinutes(range.endTime) -
                            toMinutes(range.startTime)) /
                          60
                        ).toFixed(1)}{" "}
                        hrs
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Family Profile
            </label>
            <select
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-800 bg-white"
          >
              <option value="">Select a family profile</option>
              {familyProfiles.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.fullName}
                </option>
              ))}
            </select>
          </div>

          {selectedFamilyObj && (
            <div className="mb-6 p-4 rounded-2xl border border-gray-100 bg-stone-50">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                Service Location
              </p>
              <p className="text-sm text-gray-700 font-medium">
                {selectedFamilyObj.livingAddress ||
                 "No address saved"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Caregiver will travel to this location.
              </p>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200">
              <p className="text-sm text-green-700 font-medium">
                {successMessage}
              </p>
              {skippedDates.length > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  Skipped (already booked):{" "}
                  {skippedDates.join(", ")}
                </p>
              )}
            </div>
          )}

          <button
            onClick={handleConfirmBooking}
            disabled={
              bookingLoading ||
              !selectedDate ||
              (bookingMode === "multiday" && !endDate) ||
              !selectedRange ||
              !selectedFamily
            }
            className="w-full py-4 rounded-2xl text-white text-sm font-semibold tracking-wide transition-opacity duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#2E4E3F" }}
          >
            {bookingLoading
              ? "Creating Booking..."
              : bookingMode === "multiday"
              ? `Book ${numberOfDays} Day${numberOfDays !== 1 ? "s" : ""}`
              : "Confirm Booking"}
          </button>

          {(!selectedDate ||
            (bookingMode === "multiday" && !endDate) ||
            !selectedRange ||
            !selectedFamily) && (
            <p className="text-xs text-center text-gray-400 mt-3">
              {!selectedDate
                ? "Select a start date to continue"
                : bookingMode === "multiday" && !endDate
                ? "Select an end date to continue"
                : !selectedRange
                ? "Select a time slot to continue"
                : "Select a family profile to continue"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
