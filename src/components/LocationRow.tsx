import { formatRelative } from "date-fns";
import { useMemo, useContext } from "react";
import { useMeasurements, useSensorTypes } from "~/lib/hooks";
import { urlWithParams } from "~/lib/utils/fetch";
import capitalize from "~/lib/utils/capitalize";
import {
  PreferenceContext,
  getPreferredUnitSymbol,
} from "~/lib/utils/preferences";
import { CustomProgressBar } from "./CustomProgressBar";

import { PRIMARY_BLUE_COLOR } from "~/lib/constants";
import styles from "~/styles/LocationRow.module.css";
import { add } from "date-fns";

const REFRESH_DATA_INTERVAL = 5000;
const RED_BORDER_COLOR = "#CB2B3E"; // <-- same color as marker-icon

const ENDPOINT = "/api/v3/measurements?";

const LocationRow: React.FC<{
  locationName: string;
  selected: boolean;
  dontSelectThisOne: () => void;
  canSelectThisOne: () => void;
}> = ({ locationName, selected, dontSelectThisOne, canSelectThisOne }) => {
  const { preferences } = useContext(PreferenceContext);
  const sensorTypes = useSensorTypes("/api/v3/sensors/types");

  const url = useMemo(
    () =>
      urlWithParams(ENDPOINT, {
        pageSize: 1,
        sortOrder: "desc",
        locationName,
        // FIXME: this is a hack to get the latest measurement. should not have to be set explicitely
        endTime: add(new Date(), { days: 1 }).toISOString(),
        temperatureUnit: preferences.temperatureUnit.symbol,
        conductivityUnit: preferences.conductivityUnit.symbol,
      }),
    [preferences, locationName]
  );

  const { measurements, isLoading, error } = useMeasurements(url, {
    refreshInterval: REFRESH_DATA_INTERVAL,
    onSuccess: () => canSelectThisOne(),
    onError: () => dontSelectThisOne(),
  });

  if (isLoading || !sensorTypes) return <CustomProgressBar />;
  if (error || !measurements) return null;

  const sensors = measurements[0].sensors;
  const date = new Date(measurements[0].time);
  const borderColor = selected ? RED_BORDER_COLOR : PRIMARY_BLUE_COLOR;

  return (
    <div
      style={{ border: `3px solid ${borderColor}` }}
      className={styles.entireSection}
    >
      <div className={styles.loc}>
        <b>Location</b>
        <p>{locationName}</p>
      </div>

      <div className={styles.sensors}>
        {sensorTypes.map((sensor, idx) => {
          const unitKey = sensor.toLowerCase() + "Unit";
          const unit = getPreferredUnitSymbol(unitKey, preferences);
          const sensorName = sensor === "ph" ? "pH" : capitalize(sensor);

          return (
            <div key={idx} className={styles.sensor}>
              <b>{sensorName}</b>
              <p>
                {sensors[sensor]} {sensors[sensor] && capitalize(unit)}
              </p>
            </div>
          );
        })}
      </div>

      <div className={styles.sensor}>
        <b>Updated</b>
        <p>{formatRelative(date, new Date()).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default LocationRow;
