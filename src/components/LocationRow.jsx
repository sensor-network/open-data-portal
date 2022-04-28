import { urlWithParams } from "../lib/utilityFunctions";
import { useMeasurements } from "../lib/hooks/swr-extensions";
import { PreferenceContext } from "../pages/_app";
import { useMemo, useContext } from "react";
import { useSensorTypes } from "src/lib/hooks/useSensorTypes";
import { capitalize } from "src/lib/utilityFunctions";
import {CustomProgressBar} from "./CustomProgressBar"
import styles from "src/styles/LocationRow.module.css"




export default function LocationRow({ locName, selected }) {

  const ENDPOINT = "/api/v3/measurements?";
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
      }), [preferences]
  );

  const { measurements, pagination, isLoading, isLagging, error } =
    useMeasurements(url, { refreshInterval: 5000 });


  const borderColor = selected ? "red" : "#185693";

  if (isLoading || !sensorTypes) return <CustomProgressBar/>;

  const sensors = measurements[0].sensors;

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
