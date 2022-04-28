import { format } from "date-fns";
import { DECIMAL_PLACES } from "src/lib/constants";

class FetcherError extends Error {
  constructor({
    name,
    message,
    status,
  }: {
    name: string;
    message: string;
    status: number;
  }) {
    super(message);
    this.name = "FetcherError";
  }
}

export const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new FetcherError({
      name: response.statusText,
      message: await response.json(),
      status: response.status,
    });
  }
  return await response.json();
};

export const urlWithParams = (
  baseUrl: string,
  params: { [key: string]: string }
) => baseUrl + new URLSearchParams(params);

/* decide a good format depending on the date-range */
export const dateFormatter = (
  date: Date | string,
  startDate: Date,
  endDate: Date
) => {
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
export const summarizeValues = (values: number[], decimals = 2) => {
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
export const round = (value: number, decimals = DECIMAL_PLACES) => {
  const roundFactor = Math.pow(10, decimals);
  return Math.round(value * roundFactor) / roundFactor;
};

/* capitalize given string using RegEx */
export const capitalize = (string: string) =>
  string?.replace(/^\w/, (ch) => ch.toUpperCase());

/* calculate average from an array of values that may contain null */
export const getAverage = (values: number[]) => {
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
export const getMin = (values: number[]) => {
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
export const getMax = (values: number[]) => {
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
export const defineDataDensity = (startDate: Date, endDate: Date) => {
  const millisBetween = endDate.getTime() - startDate.getTime();
  const daysBetween = Math.round(millisBetween / (1000 * 60 * 60 * 24));

  return daysBetween < 2
    ? "5min"
    : daysBetween < 10
    ? "30min"
    : daysBetween < 35
    ? "12h"
    : daysBetween < 95
    ? "1d"
    : daysBetween < 370
    ? "1w"
    : daysBetween < 3 * 370
    ? "1w"
    : "2w";
};

/* Array.prototype.find() but starts searching at the back */
export const findLast = (array: any[], callback: (arg0: any) => boolean) => {
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
