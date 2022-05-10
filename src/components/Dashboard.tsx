import { useEffect, useState, useContext, useCallback, useMemo } from "react";
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

const mapCenter: PointTuple = [56.178516, 15.60261];

const Dashboard: React.FC = () => {
  const { locations } = useContext(PreferenceContext);
  const TIMEOUT_MS = 5000;

  const [selectedLocationIndex, setSelectedIndex] = useState(0);
  const maxSelectableIndex = useMemo(() => {
    if (!locations) return 0;
    return locations.length - 1;
  }, [locations]);

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

  const getNextIdx: (currentIdx: number) => number = useCallback(
    (currentIdx) => {
      // get next idx with wrap around, dont select unselectable locations
      const nextIdx = currentIdx === maxSelectableIndex ? 0 : currentIdx + 1;
      // recursively call until we get a valid idx
      if (!unselectableIndices.includes(nextIdx)) {
        return nextIdx;
      }
      return getNextIdx(nextIdx);
    },
    [unselectableIndices, maxSelectableIndex]
  );

  const selectNextLocation = () => {
    setSelectedIndex((prev) => getNextIdx(prev));
    setTimeout(selectNextLocation, TIMEOUT_MS);
  };

  useEffect(() => {
    /* initialize a timeout when locations arrive */
    if (locations) {
      setTimeout(selectNextLocation, TIMEOUT_MS);
    }
  }, [locations]);

  useEffect(() => console.log(unselectableIndices));

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
