import { useContext, useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Circle,
  useMap,
} from "react-leaflet";
import { Icon, LatLngExpression, PointTuple } from "leaflet";
import { useMeasurements } from "~/lib/hooks";
import {
  PreferenceContext,
  getPreferredUnitSymbol,
} from "~/lib/utils/preferences";
import { urlWithParams } from "~/lib/utils/fetch";
import capitalize from "~/lib/utils/capitalize";
import type { Location } from "src/lib/database/location";

import "leaflet/dist/leaflet.css";
import "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/images/marker-icon.png";

/* available markers from here: https://github.com/pointhi/leaflet-color-markers */
export const getIcon = (color: string) =>
  new Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

const LocationMarker: React.FC<{ location: Location }> = ({ location }) => {
  const [selected, setSelected] = useState(false);
  const position: PointTuple = [location.position.lat, location.position.long];
  const map = useMap();
  return (
    <Marker
      key={location.id}
      position={position}
      icon={getIcon("blue")}
      eventHandlers={{
        click: (e) => {
          map.setView(e.latlng, map.getZoom(), { animate: true });
        },
      }}
    >
      <Popup
        eventHandlers={{
          add: () => {
            setSelected(true);
          },
          remove: () => {
            setSelected(false);
          },
        }}
      >
        {selected && (
          <Circle center={position} radius={location.radiusMeters} />
        )}
        <div style={{ minWidth: 200 }}>
          <h2 style={{ margin: 0 }}>{capitalize(location.name)}</h2>
          <h3 style={{ margin: 0 }}>Latest data:</h3>
          <LocationMarkerPopupContent locationName={location.name} />
        </div>
      </Popup>
    </Marker>
  );
};

const LocationMarkerPopupContent: React.FC<{ locationName: string }> = ({
  locationName,
}) => {
  const { preferences } = useContext(PreferenceContext);
  const url = useMemo(
    () =>
      urlWithParams("/api/v3/measurements?", {
        pageSize: 1,
        sortOrder: "desc",
        locationName,
        temperatureUnit: preferences.temperatureUnit.symbol,
        conductivityUnit: preferences.conductivityUnit.symbol,
      }),
    [locationName, preferences]
  );

  const { measurements, isLoading, error } = useMeasurements(url);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!isLoading && error) {
    return <div>No data found</div>;
  }
  return (
    <div>
      {!isLoading &&
        measurements &&
        Object.entries(measurements[0].sensors).map(
          ([sensor, sensorData], idx) => {
            const unitKey = sensor.toLowerCase() + "Unit";
            const unitSymbol = getPreferredUnitSymbol(unitKey, preferences);
            return (
              <p key={idx} style={{ margin: "0.25em 0" }}>
                <span style={{ fontWeight: 500 }}>{capitalize(sensor)}: </span>
                {sensorData} {capitalize(unitSymbol)}
              </p>
            );
          }
        )}
    </div>
  );
};

const YouAreHereMarker = () => {
  /* displays a marker at the users current location, if the user has allowed to share their location */
  const [position, setPosition] = useState<LatLngExpression | null>(null);
  const map = useMap();
  useEffect(() => {
    map.locate().on("locationfound", (e) => {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    });
  }, [map]);
  return position === null ? null : (
    <Marker position={position} icon={getIcon("red")} />
  );
};

const Map: React.FC<{}> = () => {
  const { locations } = useContext(PreferenceContext);
  const mapCenter = [56.178516, 15.60261] as PointTuple;

  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      tap={false}
      style={{ height: "95vh", width: "100vw", zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <YouAreHereMarker />
      {locations?.map((l) => (
        <LocationMarker key={l.id} location={l} />
      ))}
    </MapContainer>
  );
};

export default Map;
