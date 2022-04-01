import { useContext, useMemo, useState } from "react";

import { Select, MenuItem, LinearProgress } from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import Card from "src/components/Card";
import ComparisonGraph from "src/components/ComparisonGraph";
import DateRangeSelector from "src/components/DateRangeSelector";
import styles from "src/styles/Visualization.module.css";

import { PreferenceContext } from "src/pages/_app";
import { fetcher, urlWithParams, dateFormatter } from "src/lib/utilityFunctions";
import { useMeasurements } from "src/lib/hooks/swr-extensions";

const ENDPOINT = "http://localhost:3000/api/v2/data?";

const valueOptions = [
  { key: "temperature", name: "Temperature", color: "#1565c0" },
  { key: "ph", name: "PH", color: "#A83636" },
  { key: "conductivity", name: "Conductivity", color: "#A4C42F" },
];

const renderSelectValue = (valueKey) => {
  const value = valueOptions.find(v => v.key === valueKey);
  return (
    <div className={styles.selectValue}>
      <CircleIcon sx={{ fontSize: 16 }} style={{ color: value.color }}/>
      <p>{value.name}</p>
    </div>
  );
};

const Visualization = () => {
  /* Get correct url for fetching the filtered data */
  const { preferences } = useContext(PreferenceContext);
  const url = useMemo(() => urlWithParams(ENDPOINT, {
    temperature_unit: preferences.temperature_unit.symbol,
    conductivity_unit: preferences.conductivity_unit.symbol,
    location_name: preferences.location.symbol,
  }), [preferences]);

  const { measurements } = useMeasurements(url, fetcher);

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
          {
            !measurements ?
              <LinearProgress/> :
              <ComparisonGraph
                data={measurements} mainValue={mainValue} valuesToCompare={compareValues}
                dontCompareValue={dontCompareValue} dateFormatter={(date) => dateFormatter(date, startDate, endDate)}
              />
          }
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