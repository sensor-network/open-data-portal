import Card from "src/components/Card";
import React from 'react'
import HealthDashboard from './HealthDashboard'

const healthData = [
  {
    name: 'Sensors',
    status: 1.0,
    lastCheckTime: 0,
    datapoints: [],
    elements: []
  },
  {
    name: 'Server',
    status: 1.0,
    lastCheckTime: 0,
    datapoints: [

    ],
    elements: [
      {
        name: 'Server',
        status: 1.0,
        lastCheckTime: 0,
        datapoints: []
      }
    ]
  },
  {
    name: 'Database',
    status: 1.0,
    lastCheckTime: 0,
    datapoints: [],
    elements: [
      {
        name: 'Database',
        status: 1.0,
        lastCheckTime: 0,
        datapoints: []
      }
    ]
  },
  {
    name: 'Stations',
    status: 1.0,
    lastCheckTime: 0,
    datapoints: [],
    elements: [
    ]
  }
]



const emptylist = []

// Fetches the data from health/sensors and puts the data in healthData
async function fetchSensorData() {
  const response = await fetch('/api/v3/health/sensors');
  // waits until the request completes...
  const sensorData = await response.json();

  for (var i = 0; i < sensorData.length; i++) {

    if (sensorData[i].status == "ok") {
      emptylist.push({"name":sensorData[i].name, "status": 1.0, lastCheckTime: sensorData[i].lastActive, datapoints: []})
      healthData[0].lastCheckTime = sensorData[i].lastActive
    }

    else {
      emptylist.push({"name":sensorData[i].name, "status": 0.0, lastCheckTime: sensorData[i].lastActive, datapoints: []})
      healthData[0].lastCheckTime = sensorData[i].lastActive
    }
  }

  for (var i = 0; i < emptylist.length; i++) {
    healthData[0].elements?.push(emptylist[i])}

  for (let i = 0; i < healthData[0].elements.length; i++) {
    if (healthData[0].elements[i].status === 0)
    {
      healthData[0].status = 0.5
    }
  }
}



const emptylist_station = []

// Fetches the data from health/stations and puts the data in healthData
async function fetchStationData() {
  const response = await fetch('/api/v3/health/stations');
  // waits until the request completes...
  const stationData = await response.json();

  for (var i = 0; i < stationData.length; i++) {

    if (stationData[i].status == "OK") {
      emptylist_station.push({"name":stationData[i].location, "status": 1.0, lastCheckTime: stationData[i].lastActive, datapoints: []})
      healthData[3].lastCheckTime = stationData[i].lastActive
    }
    else if (stationData[i].status == "PARTIALLY FAULTY") {
      emptylist_station.push({"name":stationData[i].location, "status": 0.5, lastCheckTime: stationData[i].lastActive, datapoints: []})
      healthData[3].lastCheckTime = stationData[i].lastActive
    }
    else {
      emptylist_station.push({"name":stationData[i].location, "status": 0.0, lastCheckTime: stationData[i].lastActive, datapoints: []})
      healthData[3].lastCheckTime = stationData[i].lastActive
    }
  }

  for (var i = 0; i < emptylist_station.length; i++) {
    healthData[3].elements?.push(emptylist_station[i])}

  for (let i = 0; i < healthData[3].elements.length; i++) {
    if (healthData[3].elements[i].status === 0.0)
    {
      healthData[3].status = 0.0
    }
  }
}


// Fetches the data from health/status and puts the data in healthData
async function fetchStatusData() {
  const response = await fetch('/api/v3/health/status');

  // waits until the request completes...
  const StatusData = await response.json();
  var today = new Date();

  // Adds the current datetime for database and server.
  healthData[1].lastCheckTime = today
  healthData[2].lastCheckTime = today
  healthData[1].elements[0].lastCheckTime = today
  healthData[2].elements[0].lastCheckTime = today

  // Checks if server is online and if so, show it
  if (StatusData.status.server == "OK") {
    healthData[1].status = 1.0
    healthData[1].elements[0].status = 1.0
    
  }
  else {
    healthData[1].status = 0.0
    healthData[1].elements[0].status = 0.0
  }
  // Checks if database is online and if so, show it
  if (StatusData.status.database == "OK") {
    healthData[2].status = 1.0
    healthData[2].elements[0].status = 1.0
  }
  else {
    healthData[2].status = 0.0
    healthData[2].elements[0].status = 0.0
    healthData[0].status = null
    healthData[0].elements = [{"name":"No sensor data avaliable, database is down.", datapoints: []}]
    healthData[3].status = null
    healthData[3].elements = [{"name":"No station data avaliable, database is down.", datapoints: []}]
  }
}

fetchSensorData()
fetchStatusData()
fetchStationData()

const AdminView = () => {

  return (
    <Card title="Admin view" margin="40px 0 0 0">
      <HealthDashboard data={healthData} />
    </Card>
  );
};

export default AdminView;