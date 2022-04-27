import { useContext, useMemo, useState } from "react";
import Card from "src/components/Card";
import React from 'react'
import { HealthDashboard } from 'react-health-dashboard'
import { ConstructionOutlined } from "@mui/icons-material";
//import { healthData } from './adminHealthData'

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

// Fetches the data from health/status and puts the data in healthData
async function fetchStatusData() {
  const response = await fetch('/api/v3/health/status');
  // waits until the request completes...
  const StatusData = await response.json();
  var today = new Date();
  healthData[1].lastCheckTime = today
  healthData[2].lastCheckTime = today
  healthData[1].elements[0].lastCheckTime = today
  healthData[2].elements[0].lastCheckTime = today

  if (StatusData.status.server == "OK") {
    healthData[1].status = 1.0
    healthData[1].elements[0].status = 1.0
    
  }
  else {
    healthData[1].status = 0.0
    healthData[1].elements[0].status = 0.0
  }
  if (StatusData.status.database == "OK") {
    healthData[2].status = 1.0
    healthData[2].elements[0].status = 1.0
  }
  else {
    healthData[2].status = 0.0
    healthData[2].elements[0].status = 0.0
    healthData[0].status = null
    healthData[0].elements = [{"name":"No sensor data avaliable, database is down.", datapoints: []}]

  }
}

fetchSensorData()
fetchStatusData()


const AdminView = () => {

  return (
    <Card title="Admin view" margin="40px 0 0 0">
      <HealthDashboard data={healthData} />
    </Card>
  );
};

export default AdminView;