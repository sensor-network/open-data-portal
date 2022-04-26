import { urlWithParams } from "../lib/utilityFunctions";
import { useMeasurements } from "../lib/hooks/swr-extensions";
import { PreferenceContext } from "../pages/_app";
import {useMemo, useContext} from "react";
import styles from "src/styles/LocationRow.module.css"

export default function LocationRow({locName, selected}){
    
    const ENDPOINT = "/api/v3/measurements?";

    const { preferences } = useContext(PreferenceContext);

    const url = useMemo(() => urlWithParams(ENDPOINT, {
        pageSize: 1,
        sortOrder: "desc",
        locationName: locName,
        temperatureUnit: preferences.temperatureUnit.symbol,
        conductivityUnit: preferences.conductivityUnit.symbol,
    }), [preferences]);
    
    const { measurements, pagination, isLoading, isLagging, error } = useMeasurements(url);
    
    if (error) {
        return <div>No data</div>;
    }
    
    if(isLoading)
    return <div>Loading again...</div>;

    const sensors = measurements[0].sensors;
    console.log(url);
    console.log(sensors);

    const borderColor = selected ? "red" : "";
   
    return (
        <div style={{border: `1px solid ${borderColor}`}} className={styles.entireSection}>
            <div style={{ marginRight: 15 }}>{locName}</div>
            <div className={styles.sensors}>
                {Object.entries(sensors).map(([sensor, value], idx) => (
                <div
                    key={idx}
                    style={{
                    display: "flex",
                    flexDirection: "column",
                    minWidth: "max-content",
                    padding: 10,
                    }}
                >
                    <b>{sensor}</b> <p>{value}</p>
                </div>
                ))}
            </div>
        </div>
    );
}

