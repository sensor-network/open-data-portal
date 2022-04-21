import { format } from "date-fns";
import { DECIMAL_PLACES } from "src/lib/constants";
import { UNITS as TEMP_UNITS } from "lib/units/temperature";
import { UNITS as COND_UNITS } from "lib/units/conductivity";

export const loadPreferences = (prefCookieString) => {
  /* load preferences from cookies, or fallback to default values */
  let json;
  try {
    json = JSON.parse(prefCookieString);
  } catch (e) {
  }
  return {
    location: json?.location || { name: "Karlskrona", symbol: "" },
    temperatureUnit: json?.temperatureUnit || { name: TEMP_UNITS.CELSIUS.name, symbol: TEMP_UNITS.CELSIUS.symbol },
    conductivityUnit: json?.conductivityUnit || {
      name: COND_UNITS.SIEMENS_PER_METER.name,
      symbol: COND_UNITS.SIEMENS_PER_METER.symbols[0],
    },
  };
};

export const fetcher = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error(response.statusText);
    error.info = await response.json();
    error.status = response.status;
    throw error;
  }
  return await response.json();
};

export const urlWithParams = (baseUrl, params) => baseUrl + new URLSearchParams(params);

/* decide a good format depending on the date-range */
export const dateFormatter = (date, startDate, endDate) => {
  /* date can either be a date-parsable string or a Date */
  const parsed = new Date(date);
  const millisBetween = endDate.getTime() - startDate.getTime();
  const daysBetween = millisBetween / (1000 * 60 * 60 * 24);

  /* if startDate and endDate are from different years, include year */
  if (startDate.getFullYear() !== endDate.getFullYear()) {
    return format(parsed, "d MMM yyyy");
  }
  /* if startDate and endDate are from the same months, include time */
  if (startDate.getMonth() === endDate.getMonth() || daysBetween < 10) {
    return format(parsed, "d MMM HH:mm");
  }
  /* otherwise, just include date */
  return format(parsed, "d MMM");
};

/* take in an array of values and return the min, max and avg */
 export const summarizeValues = (values, decimals = 2) => {
   let [minIndex, maxIndex, sum] = [0, 0, 0];
   for (let i = 0; i < values.length; i++) {
     const value = values[i];
     if (value < values[minIndex]) {
       minIndex = i;
     }
     if (value > values[maxIndex]) {
       maxIndex = i;
     }
     sum += value;
   }
   return {
     min: round(values[minIndex], decimals),
     max: round(values[maxIndex], decimals),
     avg: round(sum / values.length, decimals),
   };
 };

/* round given value to specified precision */
export const round = (value, decimals = DECIMAL_PLACES) => {
  const roundFactor = Math.pow(10, decimals);
  return Math.round(value * roundFactor) / roundFactor;
};

/* capitalize given string using RegEx */
export const capitalize = (string) => string?.replace(/^\w/, ch => ch.toUpperCase());

/* calculate average from an array of values that may contain null */
export const getAverage = (values) => {
  let [sum, validValues] = [0, 0];
  for (let i = 0; i < values.length; i++) {
    const value = Number(values[i]);
    if (!isNaN(value)) {
      sum += value;
      validValues++;
    }
  }
  return sum / validValues;
};

/* get the minimum from an array of values that may contain null */
export const getMin = (values) => {
  let min = Number.MAX_SAFE_INTEGER;
  for (let i = 0; i < values.length; i++) {
    const value = Number(values[i]);
    if (!isNaN(value) && value < min) {
      min = value;
    }
  }
  return min;
};

/* get the maximum from an array of values that may contain null */
export const getMax = (values) => {
  let max = Number.MIN_SAFE_INTEGER;
  for (let i = 0; i < values.length; i++) {
    const value = Number(values[i]);
    if (!isNaN(value) && value > max) {
      max = value;
    }
  }
  return max;
};

/* define a reasonable density given a date-range */
export const defineDataDensity = (startDate, endDate) => {
  const millisBetween = endDate.getTime() - startDate.getTime();
  const daysBetween = Math.round(millisBetween / (1000 * 60 * 60 * 24));

  return daysBetween < 2 ? "5min" :
    daysBetween < 10 ? "30min" :
      daysBetween < 35 ? "12h" :
        daysBetween < 95 ? "1d" :
          daysBetween < 370 ? "1w" :
            daysBetween < 3 * 370 ? "1w" :
              "2w";
};

/* Array.prototype.find() but starts searching at the back */
export const findLast = (array, callback) => {
  let last = null;
  for (let i = array.length - 1; i >= 0; i--) {
    const item = array[i];
    if (callback(item)) {
      last = item;
      break;
    }
  }
  return last;
};
