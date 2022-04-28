import { urlWithParams, capitalize } from "../lib/utilityFunctions";
import { useMeasurements } from "../lib/hooks/swr-extensions";
import { PreferenceContext } from "../pages/_app";
import { useMemo, useContext } from "react";
import { formatRelative, addDays } from "date-fns";
import { useSensorTypes } from "src/lib/hooks/useSensorTypes";
import { CustomProgressBar } from "./CustomProgressBar";
import styles from "src/styles/LocationRow.module.css";
import { getPreferredUnitSymbol } from "src/lib/utils/load-preferences";

const ENDPOINT = "/api/v3/measurements?";

export default function LocationRow({ locName, selected }) {
  const { preferences } = useContext(PreferenceContext);
  const sensorTypes = useSensorTypes("/api/v3/sensors/types");

  const url = useMemo(
    () =>
      urlWithParams(ENDPOINT, {
        pageSize: 1,
        sortOrder: "desc",
        locationName: locName,
        temperatureUnit: preferences.temperatureUnit.symbol,
        conductivityUnit: preferences.conductivityUnit.symbol,
      }),
    [preferences, locName]
  );

  const { measurements, isLoading, error } = useMeasurements(url, {
    refreshInterval: 5000,
  });

  if (error) return <div>No data found for {locName}</div>;
  if (isLoading || !sensorTypes) return <CustomProgressBar />;

  const sensors = measurements[0].sensors;
  const date = new Date(measurements[0].time);
  const borderColor = selected ? "red" : "#185693";

  return (
    <div
      style={{ border: `3px solid ${borderColor}` }}
      className={styles.entireSection}
    >
      <div className={styles.loc}>
        <b>Location</b>
        <p>{locName}</p>
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
                {sensors[sensor]} {capitalize(unit)}
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
}
