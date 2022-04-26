import { urlWithParams } from "../lib/utilityFunctions";
import { useMeasurements } from "../lib/hooks/swr-extensions";
import { PreferenceContext } from "../pages/_app";
import {useMemo, useContext} from "react";

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
    console.log(measurements);
    console.log(sensors);

    const borderColor = selected ? "red" : "black";
   
    return (
        <div style={{display: "flex", padding: 10, border: `1px solid ${borderColor}`, borderRadius: "0.75em"}}>
            {locName}
            {Object.keys(sensors).map((sensor, idx) =>(
                <div key={idx}>{sensors[sensor]}</div>
            ))}
        </div>
    );
}

