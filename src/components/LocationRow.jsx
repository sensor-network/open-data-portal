import { urlWithParams } from "../lib/utilityFunctions";
import { useMeasurements } from "../lib/hooks/swr-extensions";

export default function LocationRow(locName = "Hästö"){
    
    const ENDPOINT = "/api/v3/measurements?";

    const url = urlWithParams(ENDPOINT,{
        pageSize: 1,
        sortOrder: "desc",
        locationName: locName
    });

    const measurement = useMeasurements(url);
    if(!measurement)
        return <div>Loading again...</div>
    return <div>{locName}</div>
}

