import { useContext, useState, useMemo } from "react";
import { PreferenceContext } from "src/pages/_app";
import { formatISO, startOfToday, sub } from "date-fns";

import { Grid } from "@mui/material";
import { CustomProgressBar } from "./CustomProgressBar";
import Card from "src/components/Card";
import DateRangeSelector from "src/components/DateRangeSelector";

import { useSummarizedData } from "src/lib/hooks/swr-extensions";
import { round, capitalize, urlWithParams } from "src/lib/utilityFunctions";
import styles from "src/styles/Summary.module.css";

const ENDPOINT = "http://localhost:3000/api/v2/measurements/history?";

const Summary = () => {
  const { preferences } = useContext(PreferenceContext);
  const [startDate, setStartDate] = useState(startOfToday());
  const [endDate, setEndDate] = useState(new Date());

  const urls = useMemo(() => {
    const base = {
      temperature_unit: preferences.temperature_unit.symbol,
      conductivity_unit: preferences.conductivity_unit.symbol,
      include_measurements: false,
    };
    return {
      current: urlWithParams(ENDPOINT, {
        ...base,
        start_date: formatISO(startDate),
        end_date: formatISO(endDate),
        location_name: preferences.location.symbol,
      }),
      allTime: urlWithParams(ENDPOINT, {
        ...base,
        location_name: preferences.location.symbol,
      }),
      lastYears: urlWithParams(ENDPOINT, {
        ...base,
        start_date: formatISO(sub(startDate, { years: 1 })),
        end_date: formatISO(sub(endDate, { years: 1 })),
        location_name: preferences.location.symbol,
      }),
      archipelago: urlWithParams(ENDPOINT, {
        ...base,
        start_date: formatISO(startDate),
        end_date: formatISO(endDate),
      }),
    };
  }, [preferences, startDate, endDate]);

  /* the data for the selected period */
  const { summarizedData, isLoading, isLagging } = useSummarizedData(urls.current);

  /* the data for comparing all time */
  const {
    summarizedData: allTimeData,
    isLoading: allTimeLoading,
    isLagging: allTimeLagging,
  } = useSummarizedData(urls.allTime);

  /* the data for comparing the same period last year */
  const {
    summarizedData: lastYearsData,
    isLoading: lastYearsLoading,
    isLagging: lastYearsLagging,
  } = useSummarizedData(urls.lastYears);

  /* the data for comparing the entire archipelago for this period*/
  const {
    summarizedData: archipelagoData,
    isLoading: archipelagoLoading,
    isLagging: archipelagoLagging,
  } = useSummarizedData(urls.archipelago);

  const columns = isLoading ? 0 : Object.keys(summarizedData.sensors);
  const columnCount = 3 + 3 * columns.length;

  const isAnyLoading = isLoading || allTimeLoading || lastYearsLoading || archipelagoLoading;
  const isAnyLagging = isLagging || allTimeLagging || lastYearsLagging || archipelagoLagging;

  return (
    <Card title="Summarize data over a period">
      {(isAnyLagging || isAnyLoading) && <CustomProgressBar/>}
      {!isLoading && columns <= 0 && <div>No data for selected timerange</div>}
      <Grid container columns={columnCount} spacing={0} className={styles.gridContainer}>
        <Grid item xs={6} sm={4} md={3} sx={{ fontWeight: 600 }}>

          {/* empty div but force height with 0-width unicode symbol */}
          <div className={styles.header}>{"\u200b"}</div>

          {/* period's delta */}
          <div className={styles.section}>
            <div className={styles.row}>Period start</div>
            <div className={styles.row}>Period end</div>
            <div className={styles.row}>Change</div>
          </div>

          {/* current period */}
          <div className={styles.section}>
            <div className={styles.row}>Minimum</div>
            <div className={styles.row}>Average</div>
            <div className={styles.row}>Maximum</div>
          </div>

          {/* compared to section */}
          <div className={styles.section}>
            <div className={`${styles.row}  ${styles.comparedToHeader}`}>
              Compared to:
            </div>

            {/* compared to all-time */}
            <div className={`${styles.row}  ${styles.comparedTo}`}>
              <span className={styles.icon}>{"\u27A4"}</span>
              {"all time's average"}
            </div>

            {/* compared to last year */}
            <div className={`${styles.row}  ${styles.comparedTo}`}>
              <span className={styles.icon}>{"\u27A4"}</span>
              same period last year
            </div>

            {/* compared to the archipelago */}
            <div className={`${styles.row}  ${styles.comparedTo}`}>
              <span className={styles.icon}>{"\u27A4"}</span>
              the entire archipelago
            </div>
          </div>

        </Grid>

        <Grid item xs={6} sm={8} md={9} className={styles.gridValues}>
          {!isAnyLoading && Object.entries(summarizedData.sensors).map(([sensor, sensorData], index) => {
            const unit = preferences[`${sensor.toLowerCase()}_unit`]?.symbol;
            const capitalizedUnit = capitalize(unit);

            const periodDelta = round(sensorData.end - sensorData.start, 1);
            const deltaOptions = {
              inPercent: round(periodDelta / sensorData.start * 100, 1),
              sign: periodDelta < 0 ? "" : "+",
              color: periodDelta < 0 ? "red" : "green",
            };

            const comparedToAllTime = round(allTimeData.sensors[sensor]?.avg - sensorData.avg, 1);
            const allTimeOptions = {
              inPercent: round(comparedToAllTime / sensorData.avg * 100, 1),
              sign: comparedToAllTime < 0 ? "" : "+",
              color: comparedToAllTime < 0 ? "red" : "green",
            };

            const comparedToLastYear = round(lastYearsData.sensors[sensor]?.avg - sensorData.avg, 1);
            const lastYearsOptions = {
              inPercent: round(comparedToLastYear / sensorData.avg * 100, 1),
              sign: comparedToLastYear < 0 ? "" : "+",
              color: comparedToLastYear < 0 ? "red" : "green",
            };

            const archipelagoAverage = round(archipelagoData.sensors[sensor]?.avg - sensorData.avg, 1);
            const archipelagoOptions = {
              inPercent: round(archipelagoAverage / sensorData.avg * 100, 1),
              sign: archipelagoAverage < 0 ? "" : "+",
              color: archipelagoAverage < 0 ? "red" : "green",
            };

            return (
              <Grid item key={index} xs={6} md={4} lg={3} className={styles.gridValue}>

                <div className={styles.header}>
                  {sensor === "ph" ? "ph" : capitalize(sensor)} {capitalizedUnit && `(${capitalizedUnit})`}
                </div>

                {/* period's delta */}
                <div className={styles.section}>
                  <div className={styles.row}>{sensorData.start}</div>
                  <div className={styles.row}>{sensorData.end}</div>
                  <div className={styles.row}>
                    <span style={{ color: deltaOptions.color, width: "max-content" }}>
                      {deltaOptions.sign}{periodDelta} {capitalizedUnit} ({deltaOptions.sign}{deltaOptions.inPercent} %)
                    </span>
                  </div>
                </div>

                {/* current period */}
                <div className={styles.section}>
                  <div className={styles.row}>{sensorData.min}</div>
                  <div className={styles.row}>{sensorData.avg}</div>
                  <div className={styles.row}>{sensorData.max}</div>
                </div>

                {/* compared to section */}
                <div className={styles.section}>

                  {/* empty div but force height with 0-width unicode symbol */}
                  <div className={`${styles.row} ${styles.comparedToHeader}`}>{"\u200b"}</div>

                  {/* compared to all-time */}
                  <div className={styles.row}>
                    <span style={{ color: allTimeOptions.color, minWidth: "max-content" }}>
                      {allTimeOptions.sign}{comparedToAllTime} {capitalizedUnit} ({allTimeOptions.sign}{allTimeOptions.inPercent} %)
                    </span>
                  </div>

                  {/* compared to last year */}
                  <div className={styles.row}>
                    <span style={{ color: lastYearsOptions.color, minWidth: "max-content" }}>
                      {lastYearsOptions.sign}{comparedToLastYear} {capitalizedUnit} ({lastYearsOptions.sign}{lastYearsOptions.inPercent} %)
                    </span>
                  </div>

                  {/* compared to the archipelago */}
                  <div className={styles.row}>
                    <span style={{ color: archipelagoOptions.color, minWidth: "max-content" }}>
                      {archipelagoOptions.sign}{archipelagoAverage} {capitalizedUnit} ({archipelagoOptions.sign}{archipelagoOptions.inPercent} %)
                    </span>
                  </div>

                </div>

              </Grid>
            );
          })}
        </Grid>
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
