import LocationRow from "src/components/LocationRow";
import { Grid } from '@mui/material';


const Left = ({locations, selectedLocation}) => {
      
    return (
      <div>        
        {locations.map((location, index) =>(
          <div key={location.id} style={{margin: "5px 0"}}>
            <LocationRow key={locations.id} locName={location.name} selected={index === selectedLocation}/>
          </div>
        ))}
      </div>
    );
  };

  export default Left;