import { MapContainer, Marker, Popup, TileLayer, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/images/marker-icon.png";
import { Icon } from "leaflet";
import { useLocations } from "src/lib/hooks/useLocations";


var greenIcon = new Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});


const Map = () => {
  const locations = useLocations("/api/v2/locations");

  const formatted = locations?.map(l => ({
    ...l,
    position: [l.position.lat, l.position?.long],
  }));
  console.log(formatted);

  return (
    <MapContainer center={[56.178516, 15.602610]} zoom={13} style={{ height: "100vh", width: "100wh" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* kan validera här också att datan kommit innan man loopar över den */}
      {formatted?.map(l => (
        <Marker key={l.id} position={l.position} icon={greenIcon}>
          <Popup>
            {l.name} <br/>
            Average temperature: <br/>
            <br/>
            More details <b/>
          </Popup>

        </Marker>

      ))}
    </MapContainer>

  );
};

export default Map;