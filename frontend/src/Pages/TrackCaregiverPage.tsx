import { useEffect, useState } from "react";
import {
  getClientBookingHistory,
  getBookingTrackingById,
} from "../api/authApi";
import { socket } from "../socket/socket";
import TrackingMap from "../Components/TrackingMap";

type BookingHistoryItem = {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  totalAmount: number;
  hours: number;
  caregiverName: string;
  familyMemberName: string;
};

type TrackingState = {
  status: string;
  distance: number | null;
  enteredAt: string | null;
  leftAt: string | null;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const statusStyles: Record<string, string> = {
  IN: "bg-emerald-50 text-emerald-700 border-emerald-200",
  OUT: "bg-red-50 text-red-700 border-red-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
};

const TrackCaregiverPage = () => {
  const [bookings, setBookings] = useState<BookingHistoryItem[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");

  const [tracking, setTracking] = useState<TrackingState>({
    status: "PENDING",
    distance: null,
    enteredAt: null,
    leftAt: null,
  });

  const [caregiverLocation, setCaregiverLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [parentLocation, setParentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await getClientBookingHistory(1, 20);
      const confirmedBookings = res.data.bookings.filter(
        (booking: BookingHistoryItem) => booking.status === "confirmed"
      );
      setBookings(confirmedBookings);
    } catch (error) {
      console.error("Failed to fetch bookings");
    }
  };

  const loadTrackingDetails = async (bookingId: string) => {
    try {
      const res = await getBookingTrackingById(bookingId);
      const trackingData = res.data.tracking;

      setTracking({
        status: trackingData.status || "PENDING",
        distance: trackingData.distance ?? null,
        enteredAt: trackingData.enteredAt || null,
        leftAt: trackingData.leftAt || null,
      });

      setParentLocation(trackingData.parentLocation || null);
      setCaregiverLocation(trackingData.caregiverLocation || null);
    } catch (error) {
      console.error("Failed to load tracking details");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (!selectedBookingId) return;

    loadTrackingDetails(selectedBookingId);
    socket.emit("join-booking", selectedBookingId);

    const handleTrackingUpdate = (data: any) => {
      setTracking({
        status: data.status || "PENDING",
        distance:
          typeof data.distance === "number"
            ? Math.round(data.distance)
            : data.distance ?? null,
        enteredAt: data.enteredAt || null,
        leftAt: data.leftAt || null,
      });

      if (data.caregiverLocation) {
        setCaregiverLocation({
          lat: data.caregiverLocation.lat,
          lng: data.caregiverLocation.lng,
        });
      }

      if (data.parentLocation) {
        setParentLocation({
          lat: data.parentLocation.lat,
          lng: data.parentLocation.lng,
        });
      }
    };

    socket.on("tracking-update", handleTrackingUpdate);

    return () => {
      socket.off("tracking-update", handleTrackingUpdate);
    };
  }, [selectedBookingId]);

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Track Caregiver
          </h1>
          <p className="mt-2 text-lg text-gray-500">
            Follow live caregiver movement, arrival status, and exit updates.
          </p>
        </div>

        <div className="mb-8 rounded-3xl border bg-white p-8 shadow-sm">
          <label className="mb-3 block text-base font-semibold text-gray-900">
            Select confirmed booking
          </label>

          <select
            value={selectedBookingId}
            onChange={(e) => {
              setSelectedBookingId(e.target.value);
              setCaregiverLocation(null);
              setParentLocation(null);
              setTracking({
                status: "PENDING",
                distance: null,
                enteredAt: null,
                leftAt: null,
              });
            }}
            className="w-full rounded-2xl border border-gray-300 px-5 py-4 text-base outline-none transition focus:border-[#2E4E3F]"
          >
            <option value="">Choose booking</option>

            {bookings.map((booking) => (
              <option key={booking._id} value={booking._id}>
                {booking.caregiverName} — {booking.familyMemberName} —{" "}
                {formatDate(booking.date)} — {booking.startTime} to{" "}
                {booking.endTime}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-3xl border bg-white p-8 shadow-sm">
        {!selectedBookingId ? (
          <div className="rounded-2xl border border-dashed border-gray-300 py-20 text-center text-gray-400">
            Select a confirmed booking to view live tracking.
          </div>
        ) : (
          <div className="space-y-8">

            {/* STATUS CARDS */}
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

              <div className="rounded-2xl border bg-gray-50 p-5">
                <p className="text-sm text-gray-500">Current status</p>
                <div
                  className={`mt-3 inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${
                    statusStyles[tracking.status] || statusStyles.PENDING
                  }`}
                >
                  {tracking.status}
                </div>
              </div>

              <div className="rounded-2xl border bg-gray-50 p-5">
                <p className="text-sm text-gray-500">Distance</p>
                <p className="mt-3 text-2xl font-bold text-gray-900">
                  {tracking.distance !== null ? `${tracking.distance} m` : "-"}
                </p>
              </div>

              <div className="rounded-2xl border bg-emerald-50 p-5">
                <p className="text-sm text-emerald-700">Entered At</p>
                <p className="mt-3 font-semibold">
                  {tracking.enteredAt
                    ? new Date(tracking.enteredAt).toLocaleTimeString()
                    : "-"}
                </p>
              </div>

              <div className="rounded-2xl border bg-red-50 p-5">
                <p className="text-sm text-red-700">Left At</p>
                <p className="mt-3 font-semibold">
                  {tracking.leftAt
                    ? new Date(tracking.leftAt).toLocaleTimeString()
                    : "-"}
                </p>
              </div>

            </div>

            {/* LIVE TRACKING HEADER */}
            <div className="flex items-center justify-between rounded-2xl border bg-emerald-50 px-5 py-3">
              <div>
                <p className="font-semibold text-emerald-900">
                  Live Caregiver Tracking
                </p>
                <p className="text-sm text-emerald-700">
                  Real-time movement updates
                </p>
              </div>

              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow text-sm">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    caregiverLocation ? "bg-green-500 animate-pulse" : "bg-gray-400"
                  }`}
                />
                {caregiverLocation ? "Live" : "Waiting"}
              </div>
            </div>

            {/* MAP */}
            <div className="rounded-3xl border bg-gray-50 p-4 shadow-inner">

              {parentLocation ? (
                <TrackingMap
                  caregiverLocation={caregiverLocation}
                  parentLocation={parentLocation}
                />
              ) : (
                <div className="flex h-[420px] items-center justify-center text-gray-400">
                  Waiting for parent location...
                </div>
              )}

            </div>

              {/* INFO */}
              <div className="rounded-2xl border border-dashed bg-white p-5 text-sm text-gray-600">
                Caregiver is marked <b>IN</b> within <b>50 meters</b> and <b>OUT</b> beyond the area.
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackCaregiverPage;