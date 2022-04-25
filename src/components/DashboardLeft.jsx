import { useLocations } from "src/lib/hooks/useLocations";
import LocationRow from "src/components/LocationRow";

const Left = () => {

    const locations = useLocations("/api/v3/locations");

    if(!locations)
      return <div>Loading..</div>

    return (
      <div>
        <h1>Left</h1>
        {locations?.map(location =>(
          <div key= {location.id}><LocationRow locName = {location?.name}/></div>
        ))}
      </div>
    );
  };

  export default Left;