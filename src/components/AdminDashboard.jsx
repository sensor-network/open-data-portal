import Card from "src/components/Card";
import { useMemo } from "react";
import HealthDashboard from "./HealthDashboard";
import useSWR from "swr";
import { fetcher } from "~/lib/utils/fetch";
import { getAverage } from "~/lib/utils/math";

// Reformats the given sensor-health-data to a format accepted by HealthDashboard
function formatSensorStatus(sensorData) {
  let formatted = {
    name: "Sensors",
    status: 1.0 /** assume all sensors are up */,
    lastCheckTime: 0,
    datapoints: [],
    elements: [],
  };
  for (const sensor of sensorData) {
    const { id, name, firmware, status, lastActive } = sensor;
    formatted.elements.push({
      name: `Id: ${id}, Name: ${name}, Firmware: ${firmware}`,
      status: status === "OK" ? 1.0 : 0.0,
      lastCheckTime: lastActive,
      datapoints: [],
    });
    if (lastActive > formatted.lastCheckTime) {
      formatted.lastCheckTime = sensorData[i].lastActive;
    }
  }

  formatted.status = getAverage(formatted.elements.map((elem) => elem.status));

  return formatted;
}

// Reformats the given station-health-data to a format accepted by HealthDashboard
function formatStationStatus(stationData) {
  let formatted = {
    name: "Stations",
    status: 1.0 /** assume all stations are up */,
    lastCheckTime: 0,
    datapoints: [],
    elements: [],
  };
  for (const station of stationData) {
    const { id, location, status, lastActive } = station;
    formatted.elements.push({
      name: `Id: ${id}, Location: ${location}`,
      status: status === "OK" ? 1.0 : status === "FAULTY" ? 0.0 : 0.5,
      lastCheckTime: lastActive,
      datapoints: [],
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
    elements: [],
  };

  const database = {
    name: "Database",
    status: status.database === "UP" ? 1.0 : 0.0,
    lastCheckTime: new Date(),
    datapoints: [],
    elements: [],
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
  const { data: sensorHealth } = useSWR("/api/v3/health/sensors", {
    fetcher: fetcher,
    refreshInterval: 10e3,
  });

  const healthData = useMemo(() => {
    if (!sensorHealth || !servicesHealth || !stationHealth) {
      return null;
    }
    return [
      formatServerStatus(servicesHealth),
      formatStationStatus(stationHealth),
      formatSensorStatus(sensorHealth),
    ];
  }, [servicesHealth, stationHealth, sensorHealth]);

  return (
    <Card title="Admin view" styles={{ margin: "40px 0 0 0" }}>
      {healthData && <HealthDashboard data={healthData} />}
    </Card>
  );
};

export default AdminView;
