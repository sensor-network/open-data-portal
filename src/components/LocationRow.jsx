import { urlWithParams } from "../lib/utilityFunctions";
import { useMeasurements } from "../lib/hooks/swr-extensions";

export default function LocationRow({locName}){
    
    const ENDPOINT = "/api/v3/measurements?";

    const url = urlWithParams(ENDPOINT,{
        pageSize: 1,
        sortOrder: "desc",
        locationName: locName
    });
    
    const { measurements, pagination, isLoading, isLagging, error } = useMeasurements(url);
    if(isLoading)
        return <div>Loading again...</div>;
    console.log(measurements);
    return <div>{url}</div>
}

