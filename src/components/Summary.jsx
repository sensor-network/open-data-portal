import { useState } from "react";

import { Grid } from "@mui/material";
import Card from "src/components/Card";
import CustomRadialBar from "src/components/CustomRadialBar";
import DateRangeSelector from "src/components/DateRangeSelector";

const styles = {
  gridItem: {
    height: 400,
    overflow: "hidden",
  },
  textCenter: {
    textAlign: "center",
  },
};

/* FIXME: fetch from history table*/
const data = [
  { sensor: "Temperature", min: 15, max: 22, avg: 21.3 },
  { sensor: "Conductivity", min: 4, max: 5.6, avg: 5 },
  { sensor: "PH", min: 6.8, max: 7.5, avg: 7.1 },
];

const Summary = ({}) => {
  const [startDate, setStartDate] = useState(new Date(1));
  const [endDate, setEndDate] = useState(new Date());

  return (
    <Card title="Summary">
      <Grid container spacing={1}>
        {data.map((item, idx) => (
          <Grid item xs={12} md={6} lg={4} style={styles.gridItem} key={idx}>
            <h3 style={styles.textCenter}>{item.sensor}</h3>
            <CustomRadialBar
              min={item.min}
              max={item.max}
              avg={item.avg}
            />
          </Grid>
        ))}
      </Grid>
      <div>
        <DateRangeSelector
          startDate={startDate} setStartDate={setStartDate}
          endDate={endDate} setEndDate={setEndDate}
        />
      </div>
    </Card>
  );
};
export default Summary;