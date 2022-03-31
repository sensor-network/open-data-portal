import { useContext, useState } from "react";

import { Grid, styled } from "@mui/material";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import Card from "src/components/Card";

import DateRangeSelector from "src/components/DateRangeSelector";


import { PreferenceContext } from "src/pages/_app";
import styles from "src/styles/Summary.module.css";
/* From https://mui.com/components/tooltips/#customization */
const LightTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }}/>
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: "#000",
    boxShadow: `0 0 10px #8a8a8a`,
    borderRadius: "10px",
    maxWidth: 200,
    fontSize: 16,
    padding: "20px 10px",
  },
}));

/* FIXME: fetch from history table*/
const data = [
  { sensor: "Temperature", start: 17.1, end: 19.6, min: 15.3, max: 22.7, avg: 21.3, maxAvg: 19.9, lastYearsAvg: 22 },
  { sensor: "Conductivity", start: 5.2, end: 5.1, min: 4, max: 5.6, avg: 5, maxAvg: 5.4, lastYearsAvg: 6 },
  { sensor: "PH", start: 7, end: 7, min: 6.8, max: 7.5, avg: 7.1, maxAvg: 7.0, lastYearsAvg: 6.8 },
];

const round = (value, decimals) => (
  Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
);
const capitalize = (string) => string?.replace(/^\w/, ch => ch.toUpperCase());

const Summary = ({}) => {
  const { preferences } = useContext(PreferenceContext);
  const [startDate, setStartDate] = useState(new Date(1));
  const [endDate, setEndDate] = useState(new Date());

  /* define how much wider the columns should be than the left pane */
  const columnCount = 3 + 3 * data.length;

  return (
    <Card title="Summarize data over a period">
      <Grid container columns={columnCount} spacing={0} className={styles.gridContainer}>
        <Grid item xs={6} sm={4} md={3} sx={{ fontWeight: 600 }}>

          {/* empty div but force height with 0-width unicode symbol */}
          <div className={styles.header}>{"\u200b"}</div>

          <div className={styles.section}>
            <div className={styles.row}>Start</div>
            <div className={styles.row}>End</div>
            <div className={styles.row}>Delta</div>
          </div>

          <div className={styles.section}>
            <div className={styles.row}>Min</div>
            <div className={styles.row}>Max</div>
            <div className={styles.row}>Average</div>
          </div>

          <div className={styles.section}>
            <div className={`${styles.row}  ${styles.comparedToHeader}`}>Compared to:
              <LightTooltip
                title="Comparisons are made between the period's average to other periods' averages"
                arrow placement="right-end">
                <span className={styles.tooltipIcon}>{"\u24D8"}</span>
              </LightTooltip>
            </div>
            <div className={`${styles.row}  ${styles.comparedTo}`}>
              <span className={styles.icon}>{"\u27A4"}</span>all time
            </div>
            <div className={`${styles.row}  ${styles.comparedTo}`}>
              <span className={styles.icon}>{"\u27A4"}</span>same period last year
            </div>
          </div>

        </Grid>

        <Grid item xs={6} sm={8} md={9} className={styles.gridValues}>
          {data.map((item, index) => {
            const unit = preferences[`${item.sensor.toLowerCase()}_unit`]?.symbol;
            const capitalizedUnit = capitalize(unit);

            const periodDelta = round(item.end - item.start, 1);
            const deltaOptions = {
              inPercent: round(periodDelta / item.start * 100, 1),
              sign: periodDelta < 0 ? "" : "+",
              color: periodDelta < 0 ? "red" : "green",
            };

            const comparedToAllTime = round(item.maxAvg - item.avg, 1);
            const allTimeOptions = {
              inPercent: round(comparedToAllTime / item.avg * 100, 1),
              sign: comparedToAllTime < 0 ? "" : "+",
              color: comparedToAllTime < 0 ? "red" : "green",
            };

            const comparedToLastYear = round(item.lastYearsAvg - item.avg, 1);
            const lastYearsOptions = {
              inPercent: round(comparedToLastYear / item.avg * 100, 1),
              sign: comparedToLastYear < 0 ? "" : "+",
              color: comparedToLastYear < 0 ? "red" : "green",
            };

            return (
              <Grid item key={index} xs={6} md={4} lg={3} className={styles.gridValue}>
                <div className={styles.header}>{item.sensor} {capitalizedUnit && `(${capitalizedUnit})`}</div>

                {/* period's delta */}
                <div className={styles.section}>
                  <div className={styles.row}>{item.start} </div>
                  <div className={styles.row}>{item.end}</div>
                  <div className={styles.row}>
                    <span style={{ color: deltaOptions.color, width: "max-content" }}>
                      {deltaOptions.sign}{periodDelta} {capitalizedUnit} ({deltaOptions.sign}{deltaOptions.inPercent} %)
                    </span>
                  </div>
                </div>

                {/* current period */}
                <div className={styles.section}>
                  <div className={styles.row}>{item.min}</div>
                  <div className={styles.row}>{item.max}</div>
                  <div className={styles.row}>{item.avg}</div>
                </div>

                {/* compared to section */}
                <div className={styles.section}>
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

/**
 * Period minimum
 * Period average
 * Period maximum
 * Period change
 * Compared to same period last year
 * Compared to other locations
 **/