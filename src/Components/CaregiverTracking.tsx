import { useEffect, useRef, useState } from "react";
import { socket } from "../socket/socket";
import TrackingMap from "./TrackingMap";

type Props = {
  bookingId: string;
  isActive: boolean; // controlled by dashboard button
  parentLocation: {
    lat: number;
    lng: number;
  } | null;
};

const CaregiverTracking = ({ bookingId, isActive, parentLocation }: Props) => {
  const watchIdRef = useRef<number | null>(null);

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  // Join socket room
  useEffect(() => {
    if (bookingId) {
      socket.emit("join-booking", bookingId);
    }
  }, [bookingId]);

  // START / STOP TRACKING BASED ON BUTTON
  useEffect(() => {
    // STOP tracking
    if (!isActive) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      setCoords(null);
      setIsTracking(false);
      return;
    }

    // START tracking
    if (!navigator.geolocation) {
      setError("Geolocation not supported.");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        if (!lat || !lng) return;

        setCoords({ lat, lng });
        setIsTracking(true);
        setLastUpdated(new Date().toLocaleTimeString());
        setError("");

        socket.emit("send-location", {
          bookingId,
          lat,
          lng,
        });
      },
      (err) => {
        setError(err.message);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    // cleanup
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isActive, bookingId]);

  // don't render if tracking not started
  if (!isActive) return null;

  return (
    <div className="mt-6 rounded-3xl border border-emerald-200 bg-white shadow-sm">

      {/* HEADER */}
      <div className="flex justify-between items-center px-6 py-4 bg-emerald-50 border-b">
        <div>
          <h3 className="font-semibold text-emerald-900">
            Live Navigation
          </h3>
          <p className="text-sm text-emerald-700">
            Navigate to parent house location
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow text-sm">
          <span className={`w-2 h-2 rounded-full ${isTracking ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
          {isTracking ? "Tracking Active" : "Paused"}
        </div>
      </div>

      <div className="grid lg:grid-cols-[300px,1fr] gap-6 p-6">

        {/* INFO PANEL */}
        <div className="space-y-4">

          <div className="p-4 bg-gray-50 rounded-xl border">
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-semibold">
              {isTracking ? "Tracking..." : "Waiting for GPS"}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border">
            <p className="text-sm text-gray-500">Your Location</p>
            <p className="text-sm font-medium">
              {coords
                ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
                : "Detecting..."}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border">
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="font-semibold">{lastUpdated || "-"}</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl border text-sm">
              {error}
            </div>
          )}
        </div>

        {/* MAP */}
        <div className="rounded-xl overflow-hidden border">
          {!parentLocation ? (
            <div className="h-[420px] flex items-center justify-center text-gray-400">
              Waiting for parent location...
            </div>
          ) : (
            <TrackingMap
              caregiverLocation={coords}
              parentLocation={parentLocation}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CaregiverTracking;