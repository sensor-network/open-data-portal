import { format } from "date-fns";

export const fetcher = async (url) => {
  const response = await fetch(url);
  return await response.json();
};

export const urlWithParams = (baseUrl, params) => baseUrl + new URLSearchParams(params);

/* decide a good format depending on the date-range */
export const dateFormatter = (date, startDate, endDate) => {
  /* date can either be a date-parsable string or a Date */
  const parsed = new Date(date);
  /* if startDate and endDate are from different years, include year */
  if (startDate.getFullYear() !== endDate.getFullYear()) {
    return format(parsed, "d MMM yyyy");
  }
  /* if startDate and endDate are from the same months, include time */
  if (startDate.getMonth() === endDate.getMonth()) {
    return format(parsed, "d MMM HH:mm");
  }
  /* otherwise, just include date */
  return format(parsed, "d MMM");
};

/* round given value to specified precision */
export const round = (value, decimals) => {
  const roundFactor = Math.pow(10, decimals);
  return Math.round(value * roundFactor) / roundFactor;
};

/* capitalize given string using RegEx */
export const capitalize = (string) => string?.replace(/^\w/, ch => ch.toUpperCase());
