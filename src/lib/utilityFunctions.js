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
