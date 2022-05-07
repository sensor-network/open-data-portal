import { useEffect, useState, useContext } from "react";
import type { PointTuple } from "leaflet";
import type { Location } from "~/lib/database/location";
import { PreferenceContext } from "~/lib/utils/preferences";
import LocationRow from "./LocationRow";
import Card from "./Card";
import styles from "src/styles/Dashboard.module.css";

/* load map without ssr due to lack of support with Leaflet */
import dynamic from "next/dynamic";
const MapWithNoSSR = dynamic(() => import("./DashboardMap"), {
  ssr: false,
}) as React.FC<{
  locations: Location[];
  selectedLocation: number;
  mapCenter: PointTuple;
}>;

const paneStyle = {
  width: "50%",
  minHeight: "80vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const mapCenter: PointTuple = [56.178516, 15.60261];

const Dashboard: React.FC = () => {
  const { locations } = useContext(PreferenceContext);
  const TIMEOUT_MS = 5000;

  const [selectedLocationIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    /* initialize an interval when locations arrive */
    if (locations) {
      setInterval(() => {
        /* on every iteration, increment the selected location with wrap-around */
        setSelectedIndex((prev) => {
          if (prev === locations.length - 1) return 0;
          return prev + 1;
        });
      }, TIMEOUT_MS);
    }
  }, [locations]);

  return (
    <Card title="Dashboard" styles={{ margin: "40px 0 0 0" }}>
      <div style={{ display: "flex" }}>
        {locations ? (
          <>
            <div className={styles.left}>
              <div>
                {locations?.map((location, index) => (
                  <div key={location.id} style={{ margin: "5px 0" }}>
                    <LocationRow
                      key={location.id}
                      locationName={location.name}
                      selected={index === selectedLocationIndex}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.right}>
              <MapWithNoSSR
                locations={locations}
                selectedLocation={selectedLocationIndex}
                mapCenter={mapCenter}
              />
            </div>
          </>
        ) : (
          <div>Loading</div>
        )}
      </div>
    </Card>
  );
};

export default Dashboard;
