import { useEffect, useState } from "react";
import {
  getMyAvailability,
  addAvailabilityRange,
  removeAvailabilityRange,
} from "../api/authApi";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

type TimeRange = {
  startTime: string;
  endTime: string;
};

type AvailabilityDay = {
  _id: string;
  day: string;
  timeRanges: TimeRange[];
};

const CaregiverAvailabilityPage = () => {
  const [availability, setAvailability] = useState<AvailabilityDay[]>([]);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const res = await getMyAvailability();
      setAvailability(res.data);
    } catch (error) {
      console.error("Failed to load availability");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRange = async () => {
    if (!startTime || !endTime) return;

    try {
      await addAvailabilityRange({
        day: selectedDay,
        startTime,
        endTime,
      });

      setStartTime("");
      setEndTime("");
      fetchAvailability();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error adding range");
    }
  };

  const handleRemoveRange = async (
    availabilityId: string,
    index: number
  ) => {
    await removeAvailabilityRange({
      availabilityId,
      rangeIndex: index,
    });

    fetchAvailability();
  };

  const getDayData = (day: string) =>
    availability.find((a) => a.day === day);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-20 py-16">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-12">
          Weekly Availability
        </h1>

        {/* ADD RANGE SECTION */}
        <div className="bg-white p-8 rounded-3xl shadow mb-16">

          <div className="flex flex-wrap gap-6 items-end">

            <div>
              <label className="block text-sm font-semibold mb-2">
                Day
              </label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="px-4 py-3 rounded-xl border"
              >
                {DAYS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="px-4 py-3 rounded-xl border"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="px-4 py-3 rounded-xl border"
              />
            </div>

            <button
              onClick={handleAddRange}
              className="bg-[#2E4E3F] text-white px-8 py-3 rounded-xl hover:opacity-90"
            >
              Add Time Range
            </button>

          </div>

        </div>

        <div className="grid md:grid-cols-2 gap-8">

          {DAYS.map((day) => {
            const dayData = getDayData(day);

            return (
              <div
                key={day}
                className="bg-white rounded-2xl shadow p-8"
              >
                <h2 className="font-bold text-lg mb-4">
                  {day}
                </h2>

                {!dayData || dayData.timeRanges.length === 0 ? (
                  <p className="text-gray-400">
                    Not available
                  </p>
                ) : (
                  <div className="space-y-3">
                    {dayData.timeRanges.map((range, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center bg-gray-100 px-4 py-3 rounded-xl"
                      >
                        <span>
                          {range.startTime} – {range.endTime}
                        </span>

                        <button
                          onClick={() =>
                            handleRemoveRange(dayData._id, index)
                          }
                          className="text-red-500 font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

        </div>

      </div>
    </div>
  );
};

export default CaregiverAvailabilityPage;