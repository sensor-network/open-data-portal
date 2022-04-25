import { useLocations } from "src/lib/hooks/useLocations";
import LocationRow from "src/components/LocationRow";
import { Grid } from '@mui/material';
import {useEffect, useState} from "react";

const Left = () => {

    const locations = useLocations("/api/v3/locations");

    const [selectedIdx, setSelectedIdx] = useState(null);

    useEffect(() => {
      if (locations) {
        setInterval(() => {
          setSelectedIdx((prev) => {
            if (prev === locations.length -1) 
              return 0;
            return prev + 1;
          });
        }, 1000);
      }
    }, [locations]);
    
    if(!locations)
      return <div>Loading..</div>
      
    return (
      <div>        
        {locations?.map((location, index) =>(
          <div style={{margin: "5px 0"}}>
            <LocationRow key={locations.id} locName={location?.name} selected={index === selectedIdx}/>
          </div>
        ))}
      </div>
    );
  };

  export default Left;