import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";

type SelectedLocation = {
  address: string;
  lat: number;
  lng: number;
};

type Props = {
  isOpen: boolean;
  initialPosition?: { lat: number; lng: number } | null;
  onClose: () => void;
  onConfirm: (location: SelectedLocation) => void;
};

const ClickMarker = ({
  position,
  setPosition,
}: {
  position: { lat: number; lng: number } | null;
  setPosition: React.Dispatch<
    React.SetStateAction<{ lat: number; lng: number } | null>
  >;
}) => {
  useMapEvents({
    click(e) {
      setPosition({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

  if (!position) return null;

  return <Marker position={[position.lat, position.lng]} />;
};

const MapPickerModal = ({
  isOpen,
  initialPosition = null,
  onClose,
  onConfirm,
}: Props) => {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    initialPosition
  );
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!position) {
      alert("Please click on the map to select the parent's house location.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${position.lat}&lon=${position.lng}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch address for selected location.");
      }

      const data = await res.json();

      const address =
        data.display_name ||
        `Lat: ${position.lat.toFixed(6)}, Lng: ${position.lng.toFixed(6)}`;

      onConfirm({
        address,
        lat: position.lat,
        lng: position.lng,
      });
      onClose();
    } catch (error: any) {
      alert(error.message || "Failed to fetch address.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold">Select Parent House Location</h2>
          <p className="text-sm text-gray-500 mt-1">
            Click on the map to pin the exact house location.
          </p>
        </div>

        <div className="p-6">
          <MapContainer
            center={
              position
                ? [position.lat, position.lng]
                : [27.7172, 85.324]
            }
            zoom={15}
            style={{ height: "420px", width: "100%", borderRadius: "16px" }}
          >
            <TileLayer
              attribution="© OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickMarker position={position} setPosition={setPosition} />
          </MapContainer>

          {position && (
            <div className="mt-4 rounded-xl bg-gray-50 border p-4 text-sm text-gray-700">
              Selected coordinates: {position.lat.toFixed(6)},{" "}
              {position.lng.toFixed(6)}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl border"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="px-5 py-3 rounded-xl bg-[#4b5a3f] text-white disabled:opacity-60"
            >
              {loading ? "Saving location..." : "Use This Location"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPickerModal;