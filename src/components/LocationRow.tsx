import { endOfDay, formatRelative } from "date-fns";
import { useMemo, useContext } from "react";
import { useMeasurements, useSensorTypes } from "~/lib/hooks";
import { urlWithParams } from "~/lib/utils/fetch";
import capitalize from "~/lib/utils/capitalize";
import {
  PreferenceContext,
  getPreferredUnitSymbol,
} from "~/lib/utils/preferences";
import { CustomProgressBar } from "./CustomProgressBar";

import { PRIMARY_BLUE_COLOR } from "lib/constants";
import styles from "~/styles/LocationRow.module.css";

const ENDPOINT = "/api/v3/measurements?";

const LocationRow: React.FC<{
  locationName: string;
  selected: boolean;
}> = ({ locationName, selected }) => {
  const { preferences } = useContext(PreferenceContext);
  const sensorTypes = useSensorTypes("/api/v3/sensors/types");

  const url = useMemo(
    () =>
      urlWithParams(ENDPOINT, {
        pageSize: 1,
        sortOrder: "desc",
        locationName,
        endTime: endOfDay(new Date()).toISOString(),
        temperatureUnit: preferences.temperatureUnit.symbol,
        conductivityUnit: preferences.conductivityUnit.symbol,
      }),
    [preferences, locationName]
  );

  const { measurements, isLoading, error } = useMeasurements(url, {
    refreshInterval: 5000,
  });

  if (error || !measurements)
    return <div>No data found for {locationName}</div>;
  if (isLoading || !sensorTypes) return <CustomProgressBar />;

  const sensors = measurements[0].sensors;
  const date = new Date(measurements[0].time);
  const borderColor = selected ? "red" : PRIMARY_BLUE_COLOR;

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
