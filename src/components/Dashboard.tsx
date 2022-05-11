import { useState, useContext, useMemo } from "react";
import type { PointTuple } from "leaflet";
import type { Location } from "~/lib/database/location";
import { PreferenceContext } from "~/lib/utils/preferences";
import { useInterval } from "~/lib/hooks";
import LocationRow from "./LocationRow";
import Card from "./Card";
import styles from "src/styles/Dashboard.module.css";

const MAP_CENTER: PointTuple = [56.178516, 15.60261];
const INITIAL_DELAY = 5000;

/* load map without ssr due to lack of support with Leaflet */
import dynamic from "next/dynamic";
const MapWithNoSSR = dynamic(() => import("./DashboardMap"), {
  ssr: false,
}) as React.FC<{
  locations: Location[];
  selectedLocation: number;
  mapCenter: PointTuple;
}>;

const Dashboard: React.FC = () => {
  const { locations } = useContext(PreferenceContext);

  const [intervalDelay, setIntervalDelay] = useState(INITIAL_DELAY);
  const [selectedLocationIndex, setSelectedIndex] = useState(0);

  const [unselectableIndices, setUnselectableIndices] = useState<number[]>([]);
  const dontSelectThis = (index: number) => {
    // only add if not already in
    if (unselectableIndices.includes(index)) return;
    setUnselectableIndices((prev) => [...prev, index]);
  };
  const canSelectThis = (index: number) => {
    // remove index from unselectable
    setUnselectableIndices((prev) => prev.filter((i) => i !== index));
  };

  const selectNextLocation = () => {
    if (!locations) return;
    const getNextId: (arg0: number) => number = (currentId: number) => {
      // get next idx with wrap around, dont select unselectable locations
      const nextId = currentId === locations.length - 1 ? 0 : currentId + 1;
      // recursively call until we get a valid idx
      if (!unselectableIndices.includes(nextId)) {
        return nextId;
      }
      return getNextId(nextId);
    };

    setSelectedIndex((prev) => getNextId(prev));
  };

  useInterval(selectNextLocation, intervalDelay);

  return (
    <Card title="Dashboard" styles={{ margin: "40px 0 0 0" }}>
      <div className={styles.container}>
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
                      dontSelectThisOne={() => dontSelectThis(index)}
                      canSelectThisOne={() => canSelectThis(index)}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.right}>
              <MapWithNoSSR
                locations={locations}
                selectedLocation={selectedLocationIndex}
                mapCenter={MAP_CENTER}
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
