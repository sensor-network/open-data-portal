import Card from "src/components/Card";
import Left from "src/components/DashboardLeft";
import { useLocations } from "src/lib/hooks/useLocations";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

/* load map without ssr due to lack of support with Leaflet */
const MapWithNoSSR = dynamic(() => import("../components/DashboardMap"), {
  ssr: false,
});

const paneStyle = {
  width: "50%",
  minHeight: "80vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const mapCenter = [56.178516, 15.60261];

const Dashboard: React.FC = () => {
  const locations = useLocations("/api/v3/locations");
  const TIMEOUT_MS = 5000;

  const [selectedLocationIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    /* initialize an interval when locations arrive */
    if (locations) {
      setInterval(() => {
        /* on every iteration, increment the selected location with wrap-around */
        setSelectedIndex((prev) => {
          if (prev === locations.length - 1) return 0;
          return prev + 1;
        });
      }, TIMEOUT_MS);
    }
  }, [locations]);

  return (
    <Card title="Dashboard" margin={20}>
      <div style={{ display: "flex" }}>
        {locations ? (
          <>
            <div style={paneStyle}>
              <Left
                locations={locations}
                selectedLocation={selectedLocationIndex}
              />
            </div>
            <div style={paneStyle}>
              <MapWithNoSSR
                locations={locations}
                selectedLocation={selectedLocationIndex}
                mapCenter={mapCenter}
              />
            </div>
          </>
        ) : (
          <div>Loading</div>
        )}
      </div>
    </Card>
  );
};

export default Dashboard;
