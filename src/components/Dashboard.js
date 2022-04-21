import Card from "src/components/Card";
import { useLocations } from "src/lib/hooks/useLocations";

export default function Dashboard(){

    const locations = useLocations("/api/v2/locations"); // Change to v3 later
    console.log(locations);
    return(
        <Card title = "Current Temperature">
            <>
                {locations?.map(location => (
                   <div key={location.id}>{location.name}</div> 
                ))}
            </>
        </Card>
    )
}