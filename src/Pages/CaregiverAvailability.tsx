import { useEffect, useState } from "react";
import { Clock, Copy, Check, Trash2, CalendarDays, Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getMyAvailability,
  addAvailabilityRange,
  removeAvailabilityRange,
} from "../api/authApi";

const QUICK_PRESETS = [
  { label: "MORNING", startTime: "08:00", endTime: "12:00" },
  { label: "AFTERNOON", startTime: "13:00", endTime: "17:00" },
  { label: "EVENING", startTime: "18:00", endTime: "22:00" },
  { label: "FULL DAY", startTime: "09:00", endTime: "17:00" },
];

const to12hr = (time: string): string => {
  if (!time) return "";
  const [hourStr, minute] = time.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  if (hour === 0) hour = 12;
  else if (hour > 12) hour = hour - 12;
  return `${hour}:${minute} ${ampm}`;
};

// Days of the week
const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Type for a time range
type TimeRange = {
  startTime: string;
  endTime: string;
};

// State for storing all availability data
type AvailabilityDay = {
  _id: string;
  day: string;
  timeRanges: TimeRange[];
};

const CaregiverAvailabilityPage = () => {
  const navigate = useNavigate();
  const [availability, setAvailability] = useState<AvailabilityDay[]>([]);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );

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

  const handleAddRange = async (
    overrideStart?: string,
    overrideEnd?: string
  ) => {
    setSaveStatus("saving");

    const finalStart = overrideStart ?? startTime;
    const finalEnd = overrideEnd ?? endTime;

    if (!finalStart || !finalEnd) {
      setSaveStatus("idle");
      return;
    }

    try {
      await addAvailabilityRange({
        day: selectedDay,
        startTime: finalStart,
        endTime: finalEnd,
      });

      setStartTime("");
      setEndTime("");
      fetchAvailability();
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1500);
    } catch (error: any) {
      setSaveStatus("idle");
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

  const handleAddPreset = (preset: TimeRange) => {
    setStartTime(preset.startTime);
    setEndTime(preset.endTime);
    handleAddRange(preset.startTime, preset.endTime);
  };

  const handleSaveAll = () => {
    setSaveStatus("saving");
    setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1500);
    }, 300);
  };

  const handleCopyToAll = async () => {
    const dayData = getDayData(selectedDay);
    if (!dayData || dayData.timeRanges.length === 0) return;

    const selectedRanges = dayData.timeRanges;
    const targets = DAYS.filter((d) => d !== selectedDay);

    try {
      await Promise.all(
        targets.flatMap((day) => {
          const existing = getDayData(day)?.timeRanges || [];
          return selectedRanges
            .filter(
              (range) =>
                !existing.some(
                  (e) =>
                    e.startTime === range.startTime &&
                    e.endTime === range.endTime
                )
            )
            .map((range) =>
              addAvailabilityRange({
                day,
                startTime: range.startTime,
                endTime: range.endTime,
              })
            );
        })
      );
      fetchAvailability();
    } catch (error) {
      console.error("Failed to copy availability");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const activeDay = selectedDay;
  const dayData = getDayData(selectedDay);
  const timeRanges = dayData?.timeRanges
    ? [...dayData.timeRanges].sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      )
    : [];
  const invalidRange =
    startTime && endTime && startTime >= endTime;

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/caregiver")}
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-600 shadow-sm hover:shadow-md hover:text-gray-900 hover:border-gray-400 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Weekly Availability
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Set your standard working hours for each day of the week.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCopyToAll}
              className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700"
            >
              <span className="inline-flex items-center gap-2">
                <Copy className="w-4 h-4" />
                COPY {activeDay.toUpperCase()} TO ALL
              </span>
            </button>
            <button
              onClick={handleSaveAll}
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-white"
              style={{ backgroundColor: "#2d3b2d" }}
            >
              {saveStatus === "saving"
                ? "Saving..."
                : saveStatus === "saved"
                ? (
                  <span className="inline-flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Saved!
                  </span>
                )
                : (
                  <span className="inline-flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    SAVE ALL
                  </span>
                )}
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                selectedDay === day
                  ? "text-white border-transparent"
                  : "bg-white border border-gray-200 text-gray-600"
              }`}
              style={
                selectedDay === day
                  ? { backgroundColor: "#2d3b2d" }
                  : undefined
              }
            >
              {day}
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="w-full lg:w-2/5 lg:shrink-0">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <button
                  onClick={() => handleAddRange()}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-xl font-light text-white"
                  style={{ backgroundColor: "#2d3b2d" }}
                >
                  <Plus className="w-5 h-5" />
                </button>
                <div>
                  <p className="font-semibold text-gray-800">
                    Add Time Range
                  </p>
                  <p className="text-xs text-gray-400">
                    FOR {activeDay.toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-widest text-gray-400">
                    START
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5">
                    <Clock className="w-4 h-4 text-gray-300" />
                    <input
                      type="time"
                      step="60"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="flex-1 border-none bg-transparent text-sm font-medium text-gray-800 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs uppercase tracking-widest text-gray-400">
                    END
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5">
                    <Clock className="w-4 h-4 text-gray-300" />
                    <input
                      type="time"
                      step="60"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="flex-1 border-none bg-transparent text-sm font-medium text-gray-800 outline-none"
                    />
                  </div>
                </div>
              </div>

              {invalidRange && (
                <p className="mb-3 text-xs text-red-400">
                  End time must be after start time
                </p>
              )}

              <button
                onClick={() => handleAddRange()}
                className="w-full rounded-xl py-3 text-sm font-medium uppercase tracking-wide text-white"
                style={{ backgroundColor: "#2d3b2d" }}
              >
                ADD TO SCHEDULE
              </button>
            </div>

            <div className="mt-4">
              <p className="mb-3 text-xs uppercase tracking-widest text-gray-400">
                QUICK PRESETS
              </p>
              <div className="grid grid-cols-2 gap-3">
                {QUICK_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handleAddPreset(preset)}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-white p-4 text-left transition-colors hover:border-gray-400"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {preset.label}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {to12hr(preset.startTime)} - {to12hr(preset.endTime)}
                      </p>
                    </div>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 text-sm text-gray-400">
                      <Plus className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="min-h-80 rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-semibold text-gray-800">
                Daily Schedule
              </h2>

              {!dayData || timeRanges.length === 0 ? (
                <div className="py-16 text-center">
                  <CalendarDays className="w-14 h-14 mx-auto mb-4 text-gray-200" />
                  <p className="font-medium text-gray-500">
                    No shifts defined
                  </p>
                  <p className="mx-auto mt-1 max-w-xs text-sm text-gray-400">
                    Add your availability ranges on the left to build your
                    schedule for {selectedDay}.
                  </p>
                </div>
              ) : (
                <div>
                  {timeRanges.map((range, index) => (
                    <div
                      key={`${range.startTime}-${range.endTime}-${index}`}
                      className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-gray-300" />
                        <span className="font-medium text-gray-800">
                          {to12hr(range.startTime)} - {to12hr(range.endTime)}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          handleRemoveRange(dayData._id, index)
                        }
                        className="cursor-pointer text-gray-300 transition-colors hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <p className="mt-4 text-xs text-gray-400">
                    {timeRanges.length} shift
                    {timeRanges.length !== 1 ? "s" : ""} defined for{" "}
                    {selectedDay}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaregiverAvailabilityPage;
