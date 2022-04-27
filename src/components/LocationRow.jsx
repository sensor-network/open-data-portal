import { urlWithParams } from "../lib/utilityFunctions";
import { useMeasurements } from "../lib/hooks/swr-extensions";
import { PreferenceContext } from "../pages/_app";
import { useMemo, useContext } from "react";
import { useSensorTypes } from "src/lib/hooks/useSensorTypes";
import styles from "src/styles/LocationRow.module.css";
import { capitalize } from "src/lib/utilityFunctions";

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
    [preferences]
  );

  const { measurements, pagination, isLoading, isLagging, error } =
    useMeasurements(url, { refreshInterval: 5000 });

  if (error) {
    return <div>No data</div>;
  }

  if (isLoading || !sensorTypes) return <div>Loading again...</div>;

  const sensors = measurements[0].sensors;

  const borderColor = selected ? "red" : "";

  return (
    <div
      style={{ border: `3px solid ${borderColor}` }}
      className={styles.entireSection}
    >
      <div className={styles.loc}>{locName}</div>

      <div className={styles.sensors}>
        {sensorTypes.map((sensor, idx) => (
          <div key={idx} className={styles.sensor}>
            <b>{sensor === "ph" ? "pH" : capitalize(sensor)}</b>{" "}
            <p>{sensors[sensor]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
