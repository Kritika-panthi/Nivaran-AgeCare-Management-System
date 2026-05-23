import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

type Props = {
  caregiverLocation: { lat: number; lng: number } | null;
  parentLocation: { lat: number; lng: number };
};

const AutoCenter = ({ pos }: { pos: [number, number] }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(pos, 16, { animate: true });
  }, [pos]);

  return null;
};


// ADD THIS COMPONENT
const Routing = ({
  caregiverLocation,
  parentLocation,
}: Props) => {
  const map = useMap();

  useEffect(() => {
  if (!caregiverLocation || !parentLocation) return;

  const control = (L as any).Routing.control({
    waypoints: [
      L.latLng(caregiverLocation.lat, caregiverLocation.lng),
      L.latLng(parentLocation.lat, parentLocation.lng),
    ],
    lineOptions: {
      styles: [{ color: "#16a34a", weight: 5 }],
    },
    addWaypoints: false,
    draggableWaypoints: false,
    routeWhileDragging: false,
    show: false,
  }).addTo(map);

  return () => {
    map.removeControl(control);
  };
}, [caregiverLocation, parentLocation]);
  return null;
};


const TrackingMap = ({ caregiverLocation, parentLocation }: Props) => {
  const center: [number, number] = caregiverLocation
    ? [caregiverLocation.lat, caregiverLocation.lng]
    : [parentLocation.lat, parentLocation.lng];

  return (
    <MapContainer
      center={center}
      zoom={16}
      style={{
        height: "420px",
        width: "100%",
        borderRadius: "20px",
      }}
    >
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {caregiverLocation && (
        <AutoCenter pos={[caregiverLocation.lat, caregiverLocation.lng]} />
      )}

      {/* ADD ROUTE HERE */}
      {caregiverLocation && (
        <Routing
          caregiverLocation={caregiverLocation}
          parentLocation={parentLocation}
        />
      )}

      <Marker position={[parentLocation.lat, parentLocation.lng]}>
        <Popup>Parent location</Popup>
      </Marker>

      <Circle
        center={[parentLocation.lat, parentLocation.lng]}
        radius={50}
        pathOptions={{ color: "#16a34a", weight: 2, fillOpacity: 0.12 }}
      />

      {caregiverLocation && (
        <Marker position={[caregiverLocation.lat, caregiverLocation.lng]}>
          <Popup>Caregiver live location</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default TrackingMap;