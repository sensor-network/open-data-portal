import { useContext, useState, useMemo } from "react";
import { PreferenceContext } from "src/pages/_app";
import { formatISO, startOfToday, endOfDay, sub } from "date-fns";

import { Grid } from "@mui/material";
import { CustomProgressBar } from "./CustomProgressBar";
import Card from "src/components/Card";
import DateRangeSelector from "src/components/DateRangeSelector";

import { useSummarizedData } from "src/lib/hooks/swr-extensions";
import { round, capitalize, urlWithParams } from "src/lib/utilityFunctions";
import styles from "src/styles/Summary.module.css";

import { getPreferredUnitSymbol } from "~/lib/utils/load-preferences";

const ENDPOINT = "/api/v3/measurements/history?";

const Summary: React.FC<{}> = () => {
  const { preferences } = useContext(PreferenceContext);
  const [startDate, setStartDate] = useState(startOfToday());
  const [endDate, setEndDate] = useState(new Date());

  const urls = useMemo(() => {
    const base = {
      temperatureUnit: preferences.temperatureUnit.symbol,
      conductivityUnit: preferences.conductivityUnit.symbol,
      includeMeasurements: "false",
    };
    const endOfEndDate = endOfDay(endDate);
    return {
      current: urlWithParams(ENDPOINT, {
        ...base,
        startTime: formatISO(startDate),
        endTime: formatISO(endOfEndDate),
        locationName: preferences.location.symbol,
      }),
      allTime: urlWithParams(ENDPOINT, {
        ...base,
        locationName: preferences.location.symbol,
      }),
      lastYears: urlWithParams(ENDPOINT, {
        ...base,
        startTime: formatISO(sub(startDate, { years: 1 })),
        endTime: formatISO(sub(endOfEndDate, { years: 1 })),
        locationName: preferences.location.symbol,
      }),
      archipelago: urlWithParams(ENDPOINT, {
        ...base,
        startTime: formatISO(startDate),
        endTime: formatISO(endOfEndDate),
      }),
    };
  }, [preferences, startDate, endDate]);

  /* the data for the selected period */
  const {
    summarizedData: currentData,
    isLoading: currentLoading,
    isLagging: currentLagging,
    error: currentError,
  } = useSummarizedData(urls.current);

  /* the data for comparing all time */
  const {
    summarizedData: allTimeData,
    isLoading: allTimeLoading,
    isLagging: allTimeLagging,
    error: allTimeError,
  } = useSummarizedData(urls.allTime);

  /* the data for comparing the same period last year */
  const {
    summarizedData: lastYearsData,
    isLoading: lastYearsLoading,
    isLagging: lastYearsLagging,
    error: lastYearsError,
  } = useSummarizedData(urls.lastYears);

  /* the data for comparing the entire archipelago for this period*/
  const {
    summarizedData: archipelagoData,
    isLoading: archipelagoLoading,
    isLagging: archipelagoLagging,
    error: archipelagoError,
  } = useSummarizedData(urls.archipelago);

  const isLoading =
    currentLoading || allTimeLoading || lastYearsLoading || archipelagoLoading;
  const isLagging =
    currentLagging || allTimeLagging || lastYearsLagging || archipelagoLagging;

  const columns =
    isLoading || !currentData ? [] : Object.keys(currentData.sensors);
  const columnCount = 3 + 3 * columns.length;

  return (
    <Card title="Summarize data over a period">
      {(isLagging || isLoading) && !currentError && <CustomProgressBar />}
      {currentError && <div>No data for selected timerange and location</div>}
      <Grid
        container
        columns={columnCount}
        spacing={0}
        className={styles.gridContainer}
      >
        <Grid
          item
          xs={Math.floor(columnCount / 2)}
          sm={Math.floor(columnCount / 3)}
          md={Math.floor(columnCount / 4)}
          sx={{ fontWeight: 600 }}
        >
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

        <Grid
          item
          xs={Math.floor(columnCount / 2)}
          sm={columnCount - Math.floor(columnCount / 3)}
          md={columnCount - Math.floor(columnCount / 4)}
          className={styles.gridValues}
        >
          {!isLoading &&
            currentData &&
            Object.entries(currentData.sensors).map(
              ([sensor, currentSensorData], index) => {
                const unitKey = sensor.toLowerCase() + "Unit";
                const unit = getPreferredUnitSymbol(unitKey, preferences);
                const capitalizedUnit = capitalize(unit);

                const periodDelta = round(
                  currentSensorData.end - currentSensorData.start
                );
                const deltaOptions = {
                  inPercent: round(
                    (periodDelta / currentSensorData.start) * 100
                  ),
                  sign: periodDelta < 0 ? "" : "+",
                  color: periodDelta < 0 ? "red" : "green",
                };

                const comparedToAllTime = allTimeData
                  ? round(
                      allTimeData.sensors[sensor].avg - currentSensorData.avg
                    )
                  : "No data found";
                const allTimeOptions =
                  typeof comparedToAllTime === "number"
                    ? {
                        inPercent: round(
                          (comparedToAllTime / currentSensorData.avg) * 100
                        ),
                        sign: comparedToAllTime < 0 ? "" : "+",
                        color: comparedToAllTime < 0 ? "red" : "green",
                      }
                    : undefined;

                const comparedToLastYear = lastYearsData
                  ? round(
                      lastYearsData.sensors[sensor].avg - currentSensorData.avg
                    )
                  : "No data found";
                const lastYearsOptions =
                  typeof comparedToLastYear === "number"
                    ? {
                        inPercent: round(
                          (comparedToLastYear / currentSensorData.avg) * 100
                        ),
                        sign: comparedToLastYear < 0 ? "" : "+",
                        color: comparedToLastYear < 0 ? "red" : "green",
                      }
                    : undefined;

                const comparedToArchipelago = archipelagoData
                  ? round(
                      archipelagoData.sensors[sensor].avg -
                        currentSensorData.avg
                    )
                  : "No data found";
                const archipelagoOptions =
                  typeof comparedToArchipelago === "number"
                    ? {
                        inPercent: round(
                          (comparedToArchipelago / currentSensorData.avg) * 100
                        ),
                        sign: comparedToArchipelago < 0 ? "" : "+",
                        color: comparedToArchipelago < 0 ? "red" : "green",
                      }
                    : undefined;

                return (
                  <Grid
                    item
                    key={index}
                    xs={6}
                    md={4}
                    lg={3}
                    className={styles.gridValue}
                  >
                    <div className={styles.header}>
                      {sensor === "ph" ? "ph" : capitalize(sensor)}{" "}
                      {capitalizedUnit && `(${capitalizedUnit})`}
                    </div>

                    {/* period's delta */}
                    <div className={styles.section}>
                      <div className={styles.row}>
                        {currentSensorData.start}
                      </div>
                      <div className={styles.row}>{currentSensorData.end}</div>
                      <div className={styles.row}>
                        <span
                          style={{
                            color: deltaOptions.color,
                            width: "max-content",
                          }}
                        >
                          {deltaOptions.sign}
                          {periodDelta} {capitalizedUnit} ({deltaOptions.sign}
                          {deltaOptions.inPercent} %)
                        </span>
                      </div>
                    </div>

                    {/* current period */}
                    <div className={styles.section}>
                      <div className={styles.row}>{currentSensorData.min}</div>
                      <div className={styles.row}>{currentSensorData.avg}</div>
                      <div className={styles.row}>{currentSensorData.max}</div>
                    </div>

                    {/* compared to section */}
                    <div className={styles.section}>
                      {/* empty div but force height with 0-width unicode symbol */}
                      <div
                        className={`${styles.row} ${styles.comparedToHeader}`}
                      >
                        {"\u200b"}
                      </div>

                      {/* compared to all-time */}
                      <div className={styles.row}>
                        {allTimeOptions ? (
                          <span
                            style={{
                              color: allTimeOptions.color,
                              minWidth: "max-content",
                            }}
                          >
                            {allTimeOptions.sign}
                            {comparedToAllTime} {capitalizedUnit} (
                            {allTimeOptions.sign} {allTimeOptions.inPercent} %)
                          </span>
                        ) : (
                          <span>{comparedToAllTime}</span>
                        )}
                      </div>

                      {/* compared to last year */}
                      <div className={styles.row}>
                        {lastYearsOptions ? (
                          <span
                            style={{
                              minWidth: "max-content",
                              color: lastYearsOptions.color,
                            }}
                          >
                            {lastYearsOptions.sign}
                            {comparedToLastYear} {capitalizedUnit} (
                            {lastYearsOptions.sign}
                            {lastYearsOptions.inPercent} %)
                          </span>
                        ) : (
                          <span>{comparedToLastYear}</span>
                        )}
                      </div>

                      {/* compared to the archipelago */}
                      <div className={styles.row}>
                        {archipelagoOptions ? (
                          <span
                            style={{
                              color: archipelagoOptions.color,
                              minWidth: "max-content",
                            }}
                          >
                            {archipelagoOptions.sign}
                            {comparedToArchipelago} {capitalizedUnit} (
                            {archipelagoOptions.sign}
                            {archipelagoOptions.inPercent} %)
                          </span>
                        ) : (
                          <span>{comparedToArchipelago}</span>
                        )}
                      </div>
                    </div>
                  </Grid>
                );
              }
            )}
        </Grid>
      </Grid>

      <div>
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
export default Summary;
