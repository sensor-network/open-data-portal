import { MapContainer, Marker, Popup, TileLayer, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/images/marker-icon.png';
import { Icon } from "leaflet";



var greenIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const api_url = 
      "http://localhost:3000/api/v2/locations";
  
// Defining async function that gets the locations from the database
// However it currently doesn't work
async function getapi(url: RequestInfo) {
    
    // Storing response
    const response = await fetch(url);
    
    const json_reformat = []

    // Storing data in form of JSON
    var data = await response.json();

    // Reformatting the JSON
    for (let i = 0; i < data.length; i++) {
      json_reformat.push({name: data[i].name, position: [data[i].latitude, data[i].longitude], radius: [data[i].radius]})
      }

    return json_reformat
}
// Calling that async function
const locations2 = getapi(api_url);


const locations = [
  { name: 'Hästö', position: [ 56.179594, 15.620265 ], radius: 1060 },
  { name: 'Saltö', position: [ 56.165078, 15.565359000000004 ], radius: 630 },
  { name: 'Gräsvik', position: [ 56.182976, 15.589907 ], radius: 335 },
  { name: 'Karlskrona', position: [ 56.1721, 15.593260000000004 ], radius: 3500 }
]


const Map = () => {
  return (
    <MapContainer center={[56.178516, 15.602610]} zoom={13} style={{ height: '100vh', width: '100wh' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((location) => (
              <Marker position={location.position} icon={greenIcon}>
                <Popup>
                  {location.name} <br />
                  Average temperature: <br />
                  <br />
                  More details <b />
                </Popup>

              </Marker>
    
            ))}
    </MapContainer>
    
  );
}

export default Map;