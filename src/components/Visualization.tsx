import { useContext, useMemo, useState } from "react";
import { formatISO } from "date-fns";

import { Select, MenuItem, Skeleton } from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import Card from "./Card";
import ComparisonGraph from "./ComparisonGraph";
import DateRangeSelector from "./DateRangeSelector";
import { CustomProgressBar } from "./CustomProgressBar";
import styles from "~/styles/Visualization.module.css";

import { PreferenceContext } from "~/lib/utils/preferences";
import { urlWithParams } from "~/lib/utils/fetch";
import dateFormatter from "~/lib/utils/date-formatter";
import { useSummarizedMeasurements } from "~/lib/hooks";

const ENDPOINT = "/api/v3/measurements/history?";

export type ValueOption = { key: string; name: string; color: string };
const valueOptions: ValueOption[] = [
  { key: "temperature", name: "Temperature", color: "#1565c0" },
  { key: "ph", name: "PH", color: "#A83636" },
  { key: "conductivity", name: "Conductivity", color: "#A4C42F" },
];
const renderSelectValue = (valueKey: string) => {
  const value = valueOptions.find((v) => v.key === valueKey);
  if (!value) return <div>Unknown field</div>;
  return (
    <div className={styles.selectValue}>
      <CircleIcon sx={{ fontSize: 16 }} style={{ color: value.color }} />
      <p>{value.name}</p>
    </div>
  );
};

const Visualization = () => {
  const { preferences } = useContext(PreferenceContext);
  const [startDate, setStartDate] = useState(new Date(1));
  const [endDate, setEndDate] = useState(new Date());

  /* Get correct url for fetching the filtered data */
  const url: string = useMemo(
    () =>
      urlWithParams(ENDPOINT, {
        temperatureUnit: preferences.temperatureUnit.symbol,
        conductivityUnit: preferences.conductivityUnit.symbol,
        locationName: preferences.location.symbol,
        startTime: formatISO(startDate),
        endTime: formatISO(endDate),
      }),
    [preferences, startDate, endDate]
  );

  const {
    summarizedMeasurements: measurements,
    isLoading,
    isLagging,
    error,
  } = useSummarizedMeasurements(url);

  /* mainValue is graphed as an Area */
  const [mainValue, setMainValue] = useState(valueOptions[0]);
  const selectMainValue = (key: string) => {
    const value = valueOptions.find((v) => v.key === key);
    if (!value) {
      console.log(
        `components/Visualization:: selectMainValue: Unknown key: ${key}`
      );
      return;
    }
    setMainValue(value);
    dontCompareValue(value.name);
  };

  /* compareValues are graphed as Lines */
  const [compareValues, setCompareValues] = useState<ValueOption[]>([
    valueOptions[2],
  ]);
  const addCompareValue = (key: string) => {
    const value = valueOptions.find((v) => v.key === key);
    const alreadyIn = compareValues.findIndex((v) => v.key === key) !== -1;
    if (value && !alreadyIn) {
      setCompareValues((prev) => [...prev, value]);
    }
  };
  const dontCompareValue = (name: string) => {
    const valuesWithout = compareValues.filter((v) => v.name !== name);
    setCompareValues(valuesWithout);
  };

  return (
    <Card title="Visualize">
      <div className={styles.topBar}>
        <div className={styles.topBarItem}>
          <h3>Main value</h3>
          <Select
            className={styles.select}
            value={mainValue.key}
            onChange={(e) => selectMainValue(e.target.value)}
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
            renderValue={() =>
              compareValues.length > 0
                ? `Comparing ${compareValues.length} values`
                : "Select values to compare"
            }
          >
            {valueOptions.map((value) => (
              <MenuItem
                key={value.key}
                value={value.key}
                disabled={
                  compareValues.findIndex((v) => v.key === value.key) >= 0 ||
                  value.key === mainValue.key
                }
              >
                {value.name}
              </MenuItem>
            ))}
          </Select>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.graphContainer}>
          {isLoading && (
            <>
              <CustomProgressBar />
              <Skeleton
                animation="wave"
                variant="rectangular"
                width="100%"
                height={500}
              />
            </>
          )}
          {isLagging && !error && <CustomProgressBar />}
          {!isLoading && (
            <ComparisonGraph
              data={measurements}
              error={error}
              height={500}
              mainValue={mainValue}
              valuesToCompare={compareValues}
              dontCompareValue={dontCompareValue}
              dateFormatter={(date: Date) =>
                dateFormatter(date, startDate, endDate)
              }
            />
          )}
        </div>
      </div>

      <div className={styles.bottomBar}>
        <DateRangeSelector
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
      </div>
    </Card>
  );
};

export default Visualization;
