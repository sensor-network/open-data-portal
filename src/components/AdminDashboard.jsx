import Card from "src/components/Card";
import { useMemo } from "react";
import HealthDashboard from "./HealthDashboard";
import useSWR from "swr";
import { fetcher } from "~/lib/utils/fetch";
import { getAverage } from "~/lib/utils/math";
import capitalize from "~/lib/utils/capitalize";

const REFRESH_INTERVAL = 10e3;

// Reformats the given sensor-health-data to a format accepted by HealthDashboard
function formatSensorStatus(sensors) {
  const formatted = [];
  for (const sensor of sensors) {
    const { id, type, status, lastActive } = sensor;
    formatted.push({
      name: `Sensor: ${id}: ${type === "ph" ? "pH" : capitalize(type)}`,
      status: status.toUpperCase() === "OK" ? 1.0 : 0.0,
      statusMessage: status,
      lastCheckTime: new Date(lastActive),
      elements: null,
    });
    if (lastActive > formatted.lastCheckTime) {
      formatted.lastCheckTime = sensorData[i].lastActive;
    }
  }

  // get the latest lastCheckTime of the sensors
  formatted.lastCheckTime = formatted.reduce(
    (acc, elem) => (elem.lastCheckTime > acc ? elem.lastCheckTime : acc),
    formatted.lastCheckTime
  );
  formatted.status = getAverage(formatted.map((elem) => elem.status));
  return formatted.sort((a, b) => a.name.localeCompare(b.name)); // sort by name (which will actually sort by the id)
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
      name: `Station: ${id}, Location: ${location.name}`,
      status: status === "OK" ? 1.0 : status === "FAULTY" ? 0.0 : 0.5,
      statusMessage: status,
      lastCheckTime: new Date(lastActive),
      elements: formatSensorStatus(station.sensors),
    });
  }

  // get the latest lastCheckTime of the stations
  formatted.lastCheckTime = formatted.elements.reduce(
    (acc, elem) => (elem.lastCheckTime > acc ? elem.lastCheckTime : acc),
    formatted.lastCheckTime
  );
  formatted.status = getAverage(formatted.elements.map((elem) => elem.status));
  return formatted;
}

// Fetches the data from health/status and puts the data in healthData
function formatServerStatus(servicesData) {
  let { status } = servicesData;

  const server = {
    name: "Server",
    status: status.server === "UP" ? 1.0 : 0.0,
    statusMessage: status.server,
    lastCheckTime: new Date(),
    elements: null,
  };

  const database = {
    name: "Database",
    status: status.database === "UP" ? 1.0 : 0.0,
    statusMessage: status.database,
    lastCheckTime: new Date(),
    elements: null,
  };

  const formatted = {
    name: "Services",
    status: status.database === "UP" ? 1.0 : 0.5, // server is always up, so the status is determined by the database
    lastCheckTime: new Date(),
    elements: [server, database],
  };

  return formatted;
}

const AdminView = () => {
  const { data: servicesHealth } = useSWR("/api/v3/health", {
    fetcher,
    refreshInterval: REFRESH_INTERVAL,
  });
  const { data: stationHealth } = useSWR(
    "/api/v3/health/stations?expandLocation=true",
    {
      fetcher: fetcher,
      refreshInterval: REFRESH_INTERVAL,
    }
  );

  const healthData = useMemo(() => {
    let healthData = [];
    if (servicesHealth) {
      const formatted = formatServerStatus(servicesHealth);
      healthData.push(formatted);
    }
    if (stationHealth) {
      const formatted = formatStationStatus(stationHealth);
      healthData.push(formatted);
    }

    if (!healthData.length) {
      return null;
    }
    return healthData;
  }, [servicesHealth, stationHealth]);

  return (
    <Card title="Admin view" styles={{ margin: "40px 0 0 0" }}>
      <p>Hover the icon to see a detailed status message</p>
      {healthData && <HealthDashboard data={healthData} />}
    </Card>
  );
};

export default AdminView;
