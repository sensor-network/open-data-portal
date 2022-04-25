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
      { timestamp: '1611964800000', value: 0.5 },
      { timestamp: '1611968400000', value: 1.0 },
      { timestamp: '1611972000000', value: 1.0 },
      { timestamp: '1611975600000', value: 1.0 },
      { timestamp: '1611979200000', value: 0.9996438888888889 },
      { timestamp: '1611982800000', value: 1.0 },
      { timestamp: '1611986400000', value: 1.0 },
      { timestamp: '1611990000000', value: 1.0 }
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
      //healthData[0].elements?.push({timestamp: sensorData[i].lastActive, value: 1.0})
    }

    else {
      emptylist.push({"name":sensorData[i].name, "status": 0.0, lastCheckTime: sensorData[i].lastActive, datapoints: []})
    }

    
  }

  for (var i = 0; i < emptylist.length; i++) {
    healthData[0].elements?.push(emptylist[i])}
    console.log("emptylist is:")
    console.log(emptylist[i])
    console.log(emptylist)
  //for (var i = 0; i < emptylist.length; i++) {
  //  healthData[0].datapoints?.push(emptylist[i])}

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