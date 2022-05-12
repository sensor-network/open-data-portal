import Card from "src/components/Card";
import { useMemo } from "react";
import HealthDashboard from "./HealthDashboard";
import useSWR from "swr";
import { fetcher } from "~/lib/utils/fetch";
import { getAverage } from "~/lib/utils/math";

const REFRESH_INTERVAL = 10e3;

// Reformats the given sensor-health-data to a format accepted by HealthDashboard
function formatSensorStatus(sensors) {
  const formatted = [];
  for (const sensor of sensors) {
    const { id, type, status, lastActive } = sensor;
    formatted.push({
      name: `(Id: ${id}) ${type[0].toUpperCase() + type.slice(1)}`,
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
      name: `Station: ${id}, Location: ${location.name}`,
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
      {healthData && <HealthDashboard data={healthData} />}
    </Card>
  );
};

export default AdminView;
