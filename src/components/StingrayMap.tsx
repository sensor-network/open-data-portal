import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/images/marker-icon.png";
import type { Location } from "~/lib/database/location";
import type { PointTuple } from "leaflet";
import { getIcon } from "./Map";
import styles from "src/styles/DashboardMap.module.css";

const DashboardMap: React.FC<{
  locations: Location[];
  selectedLocation: number;
  mapCenter: PointTuple;
  unselectableIndices: number[];
}> = ({ locations, selectedLocation, mapCenter, unselectableIndices }) => {
  return (
    <div className={styles.entireSection}>
      <MapContainer
        center={mapCenter}
        zoom={12}
        tap={false}
        style={{ height: "60%", width: "60%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map(
          (l, idx) =>
            unselectableIndices.includes(idx) === false && (
              <Marker
                key={l.id}
                position={[l.position.lat, l.position.long]}
                icon={
                  idx === selectedLocation ? getIcon("red") : getIcon("blue")
                }
              />
            )
        )}
      </MapContainer>
    </div>
  );
};

export default DashboardMap;
