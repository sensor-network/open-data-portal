import { MapContainer, Marker, Popup, TileLayer, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/images/marker-icon.png";
import { Icon } from "leaflet";
import { useLocations } from "src/lib/hooks/useLocations";
import { useSummarizedData } from "src/lib/hooks/swr-extensions";
import { useContext, useMemo } from "react";
import { PreferenceContext } from "src/pages/_app";
import { urlWithParams, capitalize } from "src/lib/utilityFunctions";


var greenIcon = new Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});


const PopupContent = ({ locationName }) => {
  const { preferences } = useContext(PreferenceContext);
  const url = useMemo(() => urlWithParams("/api/v3/measurements/history?", {
    locationName,
    temperatureUnit: preferences.temperatureUnit.symbol,
  }), [locationName, preferences]);
  const { summarizedData: summary, isLoading, error } = useSummarizedData(url);

  if (!isLoading && error) {
    return <div style={{ minWidth: 150 }}><p>No data found</p></div>;
  }

  return (
    <div style={{ minWidth: 150 }}>
      {!isLoading && Object.entries(summary.sensors).map(([sensor, sensorData], idx) => (
        <p key={idx} style={{ margin: "0.25em 0" }}>
          <span style={{ fontWeight: 500 }}>{capitalize(sensor)}: </span>
          {sensorData.end} {capitalize(preferences[`${sensor}Unit`]?.symbol)}
        </p>
      ))}
    </div>
  );
};

const Map = () => {
  const locations = useLocations("/api/v3/locations");
  const mapCenter = [56.178516, 15.602610];

  const formatted = locations?.map(l => ({
    ...l,
    position: [l.position.lat, l.position?.long],
  }));

  return (
    <MapContainer center={mapCenter} zoom={13} tap={false}
                  style={{ height: "95vh", width: "100vw" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {formatted?.map(l => (
        <Marker key={l.id} position={l.position} icon={greenIcon}>
          <Popup>
            <h2 style={{ margin: 0 }}>{capitalize(l.name)}</h2>
            <h3 style={{ margin: 0 }}>Latest data:</h3>
            <PopupContent locationName={l.name}/>
          </Popup>
        </Marker>
      ))}

    </MapContainer>

  );
};

export default Map;


//Its possible to use this inside the popup to visually get the radius for the location. But currently there is no way to remove the circle.
//<Circle center={l.position} radius={l.radius_meters} />