import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/images/marker-icon.png";
import type { Location } from "src/lib/database/location";
import type { PointTuple } from "leaflet";
import { getIcon } from "./Map";

const DashboardMap: React.FC<{
  locations: Location[];
  selectedLocation: number;
  mapCenter: PointTuple;
}> = ({ locations, selectedLocation, mapCenter }) => {
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer
        center={mapCenter}
        zoom={13}
        tap={false}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((l, idx) => (
          <Marker
            key={l.id}
            position={[l.position.lat, l.position.long]}
            icon={idx === selectedLocation ? getIcon("red") : getIcon("blue")}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default DashboardMap;
