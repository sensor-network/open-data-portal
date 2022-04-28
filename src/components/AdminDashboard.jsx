import Card from "src/components/Card";
import { useMemo } from "react";
import HealthDashboard from "./HealthDashboard";
import useSWR from "swr";
import { fetcher } from "src/lib/utilityFunctions";

// Reformats the given sensor-health-data to a format accepted by HealthDashboard
function formatSensorStatus(sensorData) {
  let formatted = {
    name: "Sensors",
    status: 1.0,
    lastCheckTime: 0,
    datapoints: [],
    elements: [],
  };
  for (const sensor of sensorData) {
    const { name, firmware, status, lastActive } = sensor;
    formatted.elements.push({
      name: `Name: ${name}, Firmware: ${firmware}`,
      status: status === "OK" ? 1.0 : 0.0,
      lastCheckTime: lastActive,
      datapoints: [],
    });
    if (lastActive > formatted.lastCheckTime) {
      formatted.lastCheckTime = sensorData[i].lastActive;
    }
  }

  if (sensorData.some((sensor) => sensor.status !== "OK")) {
    formatted.status = 0.5;
  }

  return formatted;
}

/*
// Reformats the given station-health-data to a format accepted by HealthDashboard
function formatStationStatus(stationData) {
  for (let i = 0; i < stationData.length; i++) {
    if (stationData[i].status == "OK") {
      emptylist_station.push({
        name: stationData[i].location,
        status: 1.0,
        lastCheckTime: stationData[i].lastActive,
        datapoints: [],
      });
      healthData[3].lastCheckTime = stationData[i].lastActive;
    } else if (stationData[i].status == "PARTIALLY FAULTY") {
      emptylist_station.push({
        name: stationData[i].location,
        status: 0.5,
        lastCheckTime: stationData[i].lastActive,
        datapoints: [],
      });
      healthData[3].lastCheckTime = stationData[i].lastActive;
    } else {
      emptylist_station.push({
        name: stationData[i].location,
        status: 0.0,
        lastCheckTime: stationData[i].lastActive,
        datapoints: [],
      });
      healthData[3].lastCheckTime = stationData[i].lastActive;
    }
  }

  for (let i = 0; i < emptylist_station.length; i++) {
    healthData[3].elements?.push(emptylist_station[i]);
  }

  for (let i = 0; i < healthData[3].elements.length; i++) {
    if (healthData[3].elements[i].status === 0.0) {
      healthData[3].status = 0.0;
    }
  }
}
*/

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
    status: 1.0,
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
  /*const { data: stationHealth } = useSWR("/api/v3/health/stations", {
    fetcher: fetcher,
    refreshInterval: 10e3,
  });*/
  const { data: sensorHealth } = useSWR("/api/v3/health/sensors", {
    fetcher: fetcher,
    refreshInterval: 10e3,
  });

  const healthData = useMemo(() => {
    console.log(sensorHealth);
    if (!sensorHealth || !servicesHealth) {
      return null;
    }
    const formatted = formatSensorStatus(sensorHealth);
    console.log(formatted);
    return [
      formatServerStatus(servicesHealth),
      formatted,
      //formatStationStatus(stationHealth),
    ];
  }, [servicesHealth, sensorHealth]);

  return (
    <Card title="Admin view" margin="40px 0 0 0">
      {healthData && <HealthDashboard data={healthData} />}
    </Card>
  );
};

export default AdminView;
