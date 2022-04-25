import Card from "src/components/Card";
import Left from "src/components/DashboardLeft";
import Right from "src/components/DashboardRight";
import { useLocations } from "src/lib/hooks/useLocations";
import {useEffect, useState} from "react";

const paneStyle = {
  width: "50%",
  minHeight: 200,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const Dashboard: React.FC = () => {
  
  const locations = useLocations("/api/v3/locations");
  const TIMEOUT_MS = 5000;

  const [selectedIdx, setSelectedIdx] = useState(0);

    useEffect(() => {
      if (locations) {
        console.log("setting timeout")
        setInterval(() => {
          setSelectedIdx((prev) => {
            if (prev === locations.length -1) 
              return 0;
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
              <Left locations={locations} selectedLocation={selectedIdx}/>
            </div>
            <div style={paneStyle}>
              <Right locations={locations} selectedLocation={selectedIdx}/>
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