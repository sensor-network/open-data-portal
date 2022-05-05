import { useContext, useState, useMemo } from "react";
import { formatISO, startOfToday, endOfDay, sub } from "date-fns";
import { Grid, Skeleton } from "@mui/material";

import type { Summary as SummaryType } from "~/pages/api/v3/measurements/history";
import { useSummary } from "~/lib/hooks";
import { round } from "~/lib/utils/math";
import capitalize from "~/lib/utils/capitalize";
import { urlWithParams } from "~/lib/utils/fetch";
import {
  PreferenceContext,
  getPreferredUnitSymbol,
} from "~/lib/utils/preferences";

import Card from "./Card";
import { CustomProgressBar } from "./CustomProgressBar";
import DateRangeSelector from "./DateRangeSelector";
import styles from "~/styles/Summary.module.css";

const ENDPOINT = "/api/v3/measurements/history?";

/** SUB COMPONENT FOR ALL THE SECTION TITLES */
const TitleColumn: React.FC<{ columnCount: number }> = ({ columnCount }) => {
  return (
    <>
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
    </>
  );
};

/** SUBCOMPONENT FOR ALL THE SECTIONS DATA */
const DataColumns: React.FC<{
  currentSummary: SummaryType;
  allTimeSummary: SummaryType | undefined;
  lastYearsSummary: SummaryType | undefined;
  archipelagoSummary: SummaryType | undefined;
}> = ({
  currentSummary,
  allTimeSummary,
  lastYearsSummary,
  archipelagoSummary,
}) => {
  const { preferences } = useContext(PreferenceContext);
  return (
    <>
      {Object.entries(currentSummary.sensors).map(
        ([sensor, currentSensorData], index) => {
          const unitKey = sensor.toLowerCase() + "Unit";
          const unit = getPreferredUnitSymbol(unitKey, preferences);
          const capitalizedUnit = capitalize(unit);

          const getComparison = (a?: number, b?: number) => {
            if (a === undefined || b === undefined) {
              return {
                string: "No data found",
                color: "black",
              };
            }
            const delta = a - b;
            const percentage = (delta / b) * 100;
            const sign = delta < 0 ? "" : "+";
            const color = delta < 0 ? "red" : "green";
            return {
              string: `${sign}${round(delta)} (${sign}${round(percentage)} %)`,
              color,
            };
          };

          const delta = getComparison(
            currentSensorData.end,
            currentSensorData.start
          );

          const comparedToAllTime = getComparison(
            allTimeSummary?.sensors[sensor].avg,
            currentSensorData.avg
          );

          const comparedToLastYear = getComparison(
            lastYearsSummary?.sensors[sensor].avg,
            currentSensorData.avg
          );

          const comparedToArchipelago = getComparison(
            archipelagoSummary?.sensors[sensor].avg,
            currentSensorData.avg
          );

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
                <div className={styles.row}>{currentSensorData.start}</div>
                <div className={styles.row}>{currentSensorData.end}</div>
                <div className={styles.row}>
                  <span
                    style={{
                      color: delta.color,
                      width: "max-content",
                    }}
                  >
                    {delta.string}
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
                <div className={`${styles.row} ${styles.comparedToHeader}`}>
                  {"\u200b"}
                </div>

                {[
                  comparedToAllTime,
                  comparedToLastYear,
                  comparedToArchipelago,
                ].map((section, index) => (
                  <div className={styles.row} key={index}>
                    <span
                      style={{
                        color: section.color,
                        minWidth: "max-content",
                      }}
                    >
                      {section.string}
                    </span>
                  </div>
                ))}
              </div>
            </Grid>
          );
        }
      )}
    </>
  );
};

const Summary: React.FC<{}> = () => {
  const { preferences } = useContext(PreferenceContext);
  const [startDate, setStartDate] = useState(startOfToday());
  const [endDate, setEndDate] = useState(new Date());

  /** Get all the necessary URLs for the given preferences and dates */
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

  /* Then fetch the required data for those URLs */
  const {
    summary: currentSummary,
    isLoading: currentLoading,
    error: currentError,
  } = useSummary(urls.current);
  const {
    summary: allTimeSummary,
    isLoading: allTimeLoading,
    error: allTimeError,
  } = useSummary(urls.allTime);

  const {
    summary: lastYearsSummary,
    isLoading: lastYearsLoading,
    error: lastYearsError,
  } = useSummary(urls.lastYears);
  const {
    summary: archipelagoSummary,
    isLoading: archipelagoLoading,
    error: archipelagoError,
  } = useSummary(urls.archipelago);

  const isLoading =
    currentLoading || allTimeLoading || lastYearsLoading || archipelagoLoading;

  const columns =
    isLoading || !currentSummary ? [] : Object.keys(currentSummary.sensors);
  const columnCount = columns.length ? 3 + 3 * columns.length : 12;

  return (
    <Card title="Summarize data over a period">
      {isLoading && <CustomProgressBar />}
      <Grid
        container
        columns={columnCount}
        spacing={0}
        className={styles.gridContainer}
      >
        {/** Left section */}
        <Grid
          item
          xs={Math.floor(columnCount / 2)}
          sm={Math.floor(columnCount / 3)}
          md={Math.floor(columnCount / 4)}
          sx={{ fontWeight: 600 }}
        >
          <TitleColumn columnCount={columnCount} />
        </Grid>

        {/** Right section */}
        <Grid
          item
          xs={Math.floor(columnCount / 2)}
          sm={columnCount - Math.floor(columnCount / 3)}
          md={columnCount - Math.floor(columnCount / 4)}
          className={styles.gridValues}
        >
          {currentSummary && !currentError ? (
            <DataColumns
              currentSummary={currentSummary}
              allTimeSummary={allTimeSummary}
              lastYearsSummary={lastYearsSummary}
              archipelagoSummary={archipelagoSummary}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                minHeight: "max-content",
              }}
            >
              <h4 style={{ margin: "5px 0" }}>
                Sorry, but there is no data matching your selected filters.
              </h4>
              <p style={{ margin: "5px 0" }}>
                Try selecting a longer time-range or change the preferred
                location in the settings-menu at the top.
              </p>
              <Skeleton
                animation="wave"
                variant="rectangular"
                sx={{ height: "100%", width: "95%" }}
              />
            </div>
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
