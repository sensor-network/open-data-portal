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
    lastCheckTime: 1611990000000,
    datapoints: [

    ],
    elements: [

    ]
  }
]



const emptylist = []

async function fetchSensordata() {
  const response = await fetch('/api/v3/sensors/status');
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
    console.log(healthData[0].elements[i].status)
    if (healthData[0].elements[i].status === 0)
    {
      healthData[0].status = 0.5
    }
  }
  //for (var i = 0; i < emptylist.length; i++) {
  //  healthData[0].datapoints?.push(emptylist[i])}
  console.log("logging")
  console.log(healthData)

}


fetchSensordata()



const AdminView = () => {

  return (
    <Card title="Admin view" margin="40px 0 0 0">
      <HealthDashboard data={healthData} />
    </Card>
  );
};

export default AdminView;