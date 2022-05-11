import Card from "src/components/Card";
import { useMemo } from "react";
import HealthDashboard from "./HealthDashboard";
import useSWR from "swr";
import { fetcher } from "~/lib/utils/fetch";
import { getAverage } from "~/lib/utils/math";

// Reformats the given sensor-health-data to a format accepted by HealthDashboard
function formatSensorStatus(sensors) {
  const formatted = []; 
  for (const sensor of sensors) {
    
    const {id, type, status, lastActive } = sensor; 
      formatted.push({
      name: `(${id}) ${type[0].toUpperCase() + type.slice(1)}`, 
      status: status === "ok" ? 1.0 : 0.0,
      lastCheckTime: lastActive,
      elements: null, 
    }); 
    if (lastActive > formatted.lastCheckTime) {
      formatted.lastCheckTime = sensorData[i].lastActive;
    }
  }

  formatted.status = getAverage(formatted.map((elem) => elem.status)); 
  return formatted;
}




// Reformats the given station-health-data to a format accepted by HealthDashboard
function formatStationStatus(stationData) {
  let formatted = {
    name: "Stations",
    status: 1.0 /** assume all stations are up */,
    lastCheckTime: 0,
    elements: [],
  };
  for (const station of stationData) {
    const { id, location, status, lastActive } = station;
    formatted.elements.push({
      name: `Station: ${id}, Location: ${location}`,
      status: status === "OK" ? 1.0 : status === "FAULTY" ? 0.0 : 0.5,
      lastCheckTime: lastActive,
      elements: formatSensorStatus(station.sensors),
    });
  }

  formatted.status = getAverage(formatted.elements.map((elem) => elem.status));
  return formatted;
}


// Fetches the data from health/status and puts the data in healthData
function formatServerStatus(servicesData) {
  let { status } = servicesData;

  const server = {
    name: "Server",
    status: status.server === "UP" ? 1.0 : 0.0,
    lastCheckTime: new Date(),
    datapoints: [],
    elements: null,
  };

  const database = {
    name: "Database",
    status: status.database === "UP" ? 1.0 : 0.0,
    lastCheckTime: new Date(),
    datapoints: [],
    elements: null,
  };

  const formatted = {
    name: "Services",
    status: status.database === "UP" ? 1.0 : 0.5, // server is always up, so the status is determined by the database
    lastCheckTime: new Date(),
    datapoints: [],
    elements: [server, database],
  };

  return formatted;
}

const AdminView = () => {
  const { data: servicesHealth } = useSWR("/api/v3/health", {
    fetcher,
    refreshInterval: 10e3,
  });
  const { data: stationHealth } = useSWR("/api/v3/health/stations", {
    fetcher: fetcher,
    refreshInterval: 10e3,
  });

  const healthData = useMemo(() => {
    if (!servicesHealth || !stationHealth) {
      return null;
    }

    return [
      formatServerStatus(servicesHealth),
      formatStationStatus(stationHealth),
    ];
  }, [servicesHealth, stationHealth]);

  return (
    <Card title="Admin view" styles={{ margin: "40px 0 0 0" }}>
      {healthData && <HealthDashboard data={healthData} />}
    </Card>
  );
};

export default AdminView;