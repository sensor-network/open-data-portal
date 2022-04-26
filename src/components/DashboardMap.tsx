import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/images/marker-icon.png";
import { Icon } from "leaflet";
import type { Location } from "src/lib/database/location";
import type { PointTuple } from "leaflet";

const iconConfig = {
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41] as PointTuple,
  iconAnchor: [12, 41] as PointTuple,
  popupAnchor: [1, -34] as PointTuple,
  shadowSize: [41, 41] as PointTuple,
};

const blueIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  ...iconConfig,
});

const redIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  ...iconConfig,
});

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
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((l, idx) => (
          <Marker
            key={l.id}
            position={[l.position.lat, l.position.long]}
            icon={idx === selectedLocation ? redIcon : blueIcon}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default DashboardMap;

//Its possible to use this inside the popup to visually get the radius for the location. But currently there is no way to remove the circle.
//<Circle center={l.position} radius={l.radius_meters} />
