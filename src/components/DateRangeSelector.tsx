import { sub, startOfDay, startOfYear, endOfDay } from "date-fns";
import { useEffect, useState, Dispatch, SetStateAction } from "react";

import InsertInvitationIcon from "@mui/icons-material/InsertInvitation";
import TextField from "@mui/material/TextField";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import { DatePicker, LocalizationProvider } from "@mui/lab";

import styles from "~/styles/DateRangeSelector.module.css";

import { PRIMARY_BLUE_COLOR } from "~/lib/constants";
const NOW = new Date();
/**
 * available predefined ranges to select from, NOTE: 'Custom' starts as 'today'
 * endDate is redundant here since it's always set to 'today', but may be useful in the future
 **/
const DATE_RANGES = [
  { label: "today", startDate: startOfDay(new Date()), endDate: endOfDay(NOW) },
  {
    label: "1 week",
    startDate: sub(new Date(), { weeks: 1 }),
    endDate: endOfDay(NOW),
  },
  {
    label: "1 month",
    startDate: sub(new Date(), { months: 1 }),
    endDate: endOfDay(NOW),
  },
  {
    label: "3 months",
    startDate: sub(new Date(), { months: 3 }),
    endDate: endOfDay(NOW),
  },
  {
    label: "this year",
    startDate: startOfYear(new Date()),
    endDate: endOfDay(NOW),
  },
  {
    label: "1 year",
    startDate: sub(new Date(), { years: 1 }),
    endDate: endOfDay(NOW),
  },
  {
    label: "3 years",
    startDate: sub(new Date(), { years: 3 }),
    endDate: endOfDay(NOW),
  },
  { label: "Max", startDate: new Date(1), endDate: endOfDay(NOW) },
  {
    label: "Custom",
    startDate: startOfDay(new Date()),
    endDate: endOfDay(NOW),
  },
];

type DateSelectorProps = {
  label: string;
  minDate: Date;
  maxDate: Date;
  date: Date;
  setDate: Dispatch<SetStateAction<Date>>;
};
/* This is a wrapper-component for MUI-DatePicker */
const DateSelector = ({
  label,
  date,
  setDate,
  minDate,
  maxDate,
}: DateSelectorProps) => {
  const [tempDate, setTempDate] = useState<Date | null>(date);
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        label={label}
        value={tempDate}
        minDate={minDate}
        maxDate={maxDate}
        onChange={(newDate) => setTempDate(newDate)}
        onAccept={(newDate) => {
          if (newDate instanceof Date) {
            setDate(newDate);
          }
        }}
        renderInput={(params) => <TextField {...params} />}
      />
    </LocalizationProvider>
  );
};

type ComponentProps = {
  startDate: Date;
  setStartDate: Dispatch<SetStateAction<Date>>;
  endDate: Date;
  setEndDate: Dispatch<SetStateAction<Date>>;
};
const DateRangeSelector = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: ComponentProps) => {
  const [activeRangeIndex, setActiveRangeIndex] = useState<number>(0);

  /* update parent on mount to be in sync */
  useEffect(() => {
    setStartDate(DATE_RANGES[activeRangeIndex].startDate);
    setEndDate(DATE_RANGES[activeRangeIndex].endDate);
  }, [activeRangeIndex, setEndDate, setStartDate]);

  /* state for toggling the custom date-range-selector */
  const [customIsOpen, setCustomIsOpen] = useState<boolean>(false);

  const selectRange = (rangeIndex: number) => {
    const isCustom = DATE_RANGES[rangeIndex].label === "Custom";
    /* toggle if the calendar was pressed, else close it */
    setCustomIsOpen(isCustom ? !customIsOpen : false);

    setActiveRangeIndex(rangeIndex);
    /**
     * if the range selected is not 'Custom', update the
     * parent state, if it is custom, the state will be
     * updated when the custom date-range is accepted
     **/
    if (!isCustom) {
      setStartDate(DATE_RANGES[rangeIndex].startDate);
      setEndDate(DATE_RANGES[rangeIndex].endDate);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <div className={styles.bar}>
        {DATE_RANGES.map((curr, idx) => (
          <div
            key={curr.label}
            className={styles.item}
            style={
              idx === activeRangeIndex
                ? { borderBottom: `4px solid ${PRIMARY_BLUE_COLOR}` }
                : {}
            }
            onClick={() => selectRange(idx)}
          >
            {curr.label === "Custom" ? (
              <InsertInvitationIcon sx={{ color: PRIMARY_BLUE_COLOR }} />
            ) : (
              <p className={styles.itemText}>{curr.label}</p>
            )}
          </div>
        ))}
      </div>

      {customIsOpen && (
        <div className={`${styles.bar} ${styles.bottomBar}`}>
          {/* DateSelector for selecting start date */}
          <DateSelector
            date={startDate}
            minDate={new Date(1)}
            maxDate={endDate}
            setDate={setStartDate}
            label={"Start"}
          />
          {/* DateSelector for selecting end date */}
          <DateSelector
            date={endDate}
            minDate={startDate}
            maxDate={NOW}
            setDate={setEndDate}
            label={"End"}
          />
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;
