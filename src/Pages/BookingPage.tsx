import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getApprovedCaregivers,
  getAvailableRanges,
  createBooking, 
  getFamilyProfiles
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

const formatTime = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);

  const suffix = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;

  return `${formattedHour}:${minute
    .toString()
    .padStart(2, "0")} ${suffix}`;
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
  const [familyProfiles, setFamilyProfiles] = useState<any[]>([]);
  const [selectedFamily, setSelectedFamily] = useState("");


  const fetchCaregiver = async () => {
    const res = await getApprovedCaregivers();
    const found = res.data.find((c: Caregiver) => c._id === caregiverId);
    setCaregiver(found);
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
    setRanges(res.data.ranges);
  };

  const handleDateChange = (e: any) => {
    const date = e.target.value;
    setSelectedDate(date);
    fetchRanges(date);
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

  const total = caregiver.hourlyRate * hours + serviceFee;

  const handleConfirmBooking = async () => {
  if (!selectedRange) {
    alert("Please select time range");
    return;
  }

  if (!selectedFamily) {
    alert("Please select family profile");
    return;
  }

  try {
    await createBooking({
      caregiverId: caregiverId!,
      familyProfileId: selectedFamily,
      date: selectedDate,
      startTime: selectedRange.startTime,
      endTime: selectedRange.endTime,
    });

    alert("Booking successful!");

  } catch (error: any) {
    alert(error.response?.data?.message || "Booking failed");
  }
};

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-10">
      <div className="bg-white w-[1000px] rounded-3xl shadow-xl grid grid-cols-2">

        {/* Left side */}
        <div className="p-10 border-r">

          <img
            src={`http://localhost:3000/uploads/${caregiver.profilePhoto}`}
            className="w-28 h-28 rounded-full mb-6"
          />

          <h2 className="text-2xl font-bold mb-2">
            {caregiver.user.fullName}
          </h2>

          <p className="text-gray-500 mb-8">CARE PROVIDER</p>

          <div className="flex justify-between mb-3">
            <span>Hourly Rate</span>
            <span>Rs. {caregiver.hourlyRate}</span>
          </div>

          <div className="flex justify-between mb-6">
            <span>Service Fee</span>
            <span>Rs. {serviceFee}</span>
          </div>

          <hr className="mb-6" />

          <div className="flex justify-between text-3xl font-bold text-[#2E4E3F]">
            <span>Total</span>
            <span>Rs. {selectedRange ? total : 0}</span>
          </div>

        </div>

        {/* Right side */}
        <div className="p-10">

          <h2 className="text-3xl font-bold mb-8">
            Booking Details
          </h2>

          <div className="mb-8">
            <label className="block font-semibold mb-2">
              Select Date
            </label>

            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="w-full px-5 py-4 rounded-xl border"
            />
          </div>

          <div className="mb-6">
            <label className="block font-semibold mb-4">
              Time Range
            </label>

            <div className="grid grid-cols-2 gap-4">

              {ranges.map((range, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedRange(range)}
                  className={`px-6 py-4 rounded-xl border ${
                    selectedRange?.startTime === range.startTime
                      ? "border-[#2E4E3F] bg-green-50"
                      : "bg-gray-50"
                  }`}
                >
                  {formatTime(range.startTime)} - {formatTime(range.endTime)}
                </button>
              ))}

            </div>
          </div>

           {/* Select family */}
          <div className="mb-8">
            <label className="block font-semibold mb-2">
              Select Family Profile
            </label>

            <select
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value)}
              className="w-full px-5 py-4 rounded-xl border"
            >
              <option value="">Select Profile</option>

              {familyProfiles.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.fullName}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleConfirmBooking}
            className="w-full bg-[#2E4E3F] text-white py-5 rounded-2xl text-lg font-semibold"
          >
            Confirm Booking
          </button>

        </div>
      </div>
    </div>
  );
};

export default BookingPage;