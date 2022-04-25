import dynamic from "next/dynamic";
import { Location } from "src/lib/database/location";
/* disable ssr for map-component */
const MapWithNoSSR = dynamic(() => import("../components/DashboardMap"), {
  ssr: false,
});

const Right: React.FC<{locations: Location[], selectedLocation: number}> = ({locations, selectedLocation}) => {
  return (
    <div style={{ height: 500, width: "100%" }}>
      <MapWithNoSSR locations={locations} selectedLocation={selectedLocation}/>
    </div>
  );
};

export default Right;
