import { urlWithParams } from "../lib/utilityFunctions";
import { useMeasurements } from "../lib/hooks/swr-extensions";
import { Grid } from '@mui/material';

export default function LocationRow({locName, selected}){
    
    const ENDPOINT = "/api/v3/measurements?";

    const url = urlWithParams(ENDPOINT,{
        pageSize: 1,
        sortOrder: "desc",
        locationName: locName
    });
    
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
                {locName}Hi
                {Object.keys(sensors).map(sensor =>(
                    <div>{sensors[sensor]}</div>
                ))}
            </div>
        );
}

