import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/images/marker-icon.png";
import { Icon } from "leaflet";

const blueIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const redIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DashboardMap = ({ locations, selectedLocation, mapCenter }) => {
  const formatted = locations.map((l, idx) => ({
    ...l,
    position: [l.position.lat, l.position?.long],
    selected: idx === selectedLocation,
  }));

  return (
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
      {formatted?.map((l) => (
        <Marker
          key={l.id}
          position={l.position}
          icon={l.selected ? redIcon : blueIcon}
        />
      ))}
    </MapContainer>
  );
};

export default DashboardMap;

//Its possible to use this inside the popup to visually get the radius for the location. But currently there is no way to remove the circle.
//<Circle center={l.position} radius={l.radius_meters} />
