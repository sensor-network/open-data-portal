import { format, sub, startOfDay, startOfYear, endOfDay } from "date-fns";
import { useState } from "react";
import { flushSync } from "react-dom";

import InsertInvitationIcon from "@mui/icons-material/InsertInvitation";
import TextField from "@mui/material/TextField";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import { DatePicker, LocalizationProvider } from "@mui/lab";

import styles from "src/styles/DateRangeSelector.module.css";

const BLUE = "#185693";
const NOW = new Date();
const DATE_RANGES = [
  { label: "today", active: false, startDate: startOfDay(new Date()), endDate: endOfDay(NOW) },
  { label: "1 week", active: false, startDate: sub(new Date(), { weeks: 1 }), endDate: endOfDay(NOW) },
  { label: "1 month", active: false, startDate: sub(new Date(), { months: 1 }), endDate: endOfDay(NOW) },
  { label: "3 months", active: false, startDate: sub(new Date(), { months: 3 }), endDate: endOfDay(NOW) },
  { label: "this year", active: false, startDate: startOfYear(new Date()), endDate: endOfDay(NOW) },
  { label: "1 year", active: false, startDate: sub(new Date(), { years: 1 }), endDate: endOfDay(NOW) },
  { label: "3 years", active: false, startDate: sub(new Date(), { years: 3 }), endDate: endOfDay(NOW) },
  { label: "Max", active: false, startDate: new Date(1), endDate: endOfDay(NOW) },
  { label: "Custom", active: false, startDate: null, endDate: null },
];

/* This is a wrapper-component for MUI-DatePicker */
const DateSelector = ({ label, date, setDate, minDate, maxDate }) => {
  const [tempDate, setTempDate] = useState(date);
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        label={label}
        value={tempDate}
        minDate={minDate}
        maxDate={maxDate}
        onChange={newDate => setTempDate(newDate)}
        onAccept={newDate => setDate(newDate)}
        renderInput={params => <TextField {...params}/>}
      />
    </LocalizationProvider>
  );
};

const DateRangeSelector = ({ setStartDate, setEndDate }) => {
  /* state for handling internal selections, only valid ranges are passed upto parent */
  const [range, setRange] = useState(DATE_RANGES[0]);
  /* state for toggling the custom date-range-selector */
  const [customIsOpen, setCustomIsOpen] = useState(false);

  const selectRange = (newRange) => {
    const isCustom = newRange.label === "Custom";
    /* toggle if the calendar was pressed, else close it */
    setCustomIsOpen(isCustom ? !customIsOpen : false);

    setRange(prevRange => {
      /* toggle active */
      prevRange.active = false;
      newRange.active = true;

      /* inherit if the calendar was pressed, else use predefined */
      newRange.startDate = isCustom ? prevRange.startDate : newRange.startDate;
      newRange.endDate = isCustom ? prevRange.endDate : newRange.endDate;

      return newRange;
    });

    /**
     * FIXME: flushSync is a workaround for waiting for the internal
     * state to finish updating before passing the new values to the parent
     **/
    flushSync(() => {
      setStartDate(range.startDate);
      setEndDate(range.endDate);
    });
  };

  const handleCustomDateChange = (type, date) => {
    /* change date accordingly, if the range is valid, update the global one */
    if (type === "startDate") {
      setRange(prev => {
        prev.startDate = format(date, "yyyy-MM-dd");
        setStartDate(range.startDate);
        setEndDate(range.endDate);
        return prev;
      });
    }
    else {
      setRange(prev => {
        prev.endDate = format(date, "yyyy-MM-dd");
        setStartDate(new Date(range.startDate));
        setEndDate(new Date(range.endDate));
        return prev;
      });
    }
  };

  return (
    <div style={{ width: "100%" }}>

      <div className={styles.bar}>
        {DATE_RANGES.map(curr => (
          <div
            key={curr.label}
            className={styles.item}
            style={curr.active ? { borderBottom: `4px solid ${BLUE}` } : {}}
            onClick={() => selectRange(curr)}
          >
            {curr.label === "Custom" ? (
              <InsertInvitationIcon sx={{ color: BLUE }}/>
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
            date={range.startDate}
            minDate={new Date(1)}
            maxDate={new Date(range.endDate)}
            setDate={date => handleCustomDateChange("startDate", date)}
            label={"Start"}
          />

          {/* DateSelector for selecting end date */}
          <DateSelector
            date={range.endDate}
            minDate={new Date(range.startDate)}
            maxDate={new Date()}
            setDate={date => handleCustomDateChange("endEnd", date)}
            label={"End"}
          />
        </div>
      )}

    </div>

  );
};

export default DateRangeSelector;