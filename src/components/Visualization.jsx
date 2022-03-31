import { useEffect, useState } from "react";

import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import CircleIcon from "@mui/icons-material/Circle";

import Card from "src/components/Card";
import ComparisonGraph from "src/components/ComparisonGraph";
import DateRangeSelector from "src/components/DateRangeSelector";

import styles from "src/styles/Visualization.module.css";

import { format } from "date-fns";

const valueOptions = [
  { key: "temperature", name: "Temperature", color: "#1565c0" },
  { key: "ph", name: "PH", color: "#A83636" },
  { key: "conductivity", name: "Conductivity", color: "#A4C42F" },
];

/* decide a good format depending on the date-range */
const dateFormatter = (date, startDate, endDate) => {
  /* date can either be a date-parsable string or a Date */
  const parsed = new Date(date);
  /* if startDate and endDate are from different years, include year */
  if (startDate.getFullYear() !== endDate.getFullYear()) {
    return format(parsed, "d MMM yyyy");
  }
  /* if startDate and endDate are from the same months, include time */
  if (startDate.getMonth() === endDate.getMonth()) {
    return format(parsed, "d MMM HH:mm");
  }
  /* otherwise, just include date */
  return format(parsed, "d MMM");
};

const Visualization = ({ data }) => {
  /* mainValue is graphed as an Area */
  const [mainValue, setMainValue] = useState(valueOptions[0]);
  const selectMainValue = (event) => {
    const key = event.target.value;
    const value = valueOptions.find(v => v.key === key);
    setMainValue(value);
    dontCompareValue(key);
  };

  /* compareValues are graphed as Lines */
  const [compareValues, setCompareValues] = useState([
    valueOptions[1], valueOptions[2],
  ]);
  const addCompareValue = (key) => {
    const value = valueOptions.find(v => v.key === key);
    const alreadyIn = compareValues.findIndex(v => v.key === key) !== -1;
    if (!alreadyIn) {
      setCompareValues([...compareValues, value]);
    }
  };
  const dontCompareValue = (key) => {
    const valuesWithout = compareValues.filter(v => v.key !== key);
    setCompareValues(valuesWithout);
  };

  const [startDate, setStartDate] = useState(new Date(1));
  const [endDate, setEndDate] = useState(new Date());

  const renderSelectValue = (valueKey) => {
    const value = valueOptions.find(v => v.key === valueKey);
    return (
      <div className={styles.selectValue}>
        <CircleIcon sx={{ fontSize: 16 }} style={{ color: value.color }}/>
        <p>{value.name}</p>
      </div>
    );
  };

  useEffect(() => {
    console.log("start", startDate instanceof Date, startDate);
    console.log("end", endDate instanceof Date, endDate);
  }, [startDate, endDate]);

  return (
    <Card title="Visualize">
      <div className={styles.topBar}>
        <div className={styles.topBarItem}>
          <h3>Main value</h3>
          <Select
            className={styles.select}
            value={mainValue.key}
            onChange={selectMainValue}
            renderValue={renderSelectValue}
          >
            {valueOptions.map((value) => (
              <MenuItem key={value.key} value={value.key}>
                {value.name}
              </MenuItem>
            ))}
          </Select>
        </div>
        <div className={styles.topBarItem}>
          <Select
            className={styles.select}
            value={mainValue.key}
            onChange={(e) => addCompareValue(e.target.value)}
            renderValue={() => compareValues.length > 0 ? `Comparing ${compareValues.length} values` : "Select values to compare"}
          >
            {valueOptions.map((value) => (
              <MenuItem key={value.key} value={value.key}
                        disabled={compareValues.findIndex(v => v.key === value.key) >= 0 || value.key === mainValue.key}>
                {value.name}
              </MenuItem>
            ))}
          </Select>
        </div>

      </div>

      <div className={styles.content}>
        <div className={styles.graphContainer}>
          <ComparisonGraph
            data={data} mainValue={mainValue} valuesToCompare={compareValues}
            dontCompareValue={dontCompareValue} dateFormatter={(date) => dateFormatter(date, startDate, endDate)}
          />
        </div>
      </div>


      <div className={styles.bottomBar}>
        <DateRangeSelector
          startDate={startDate} setStartDate={setStartDate}
          endDate={endDate} setEndDate={setEndDate}
        />
      </div>
    </Card>
  );
};

export default Visualization;