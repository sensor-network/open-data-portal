/* take in an array of values and return the min, max and avg */
import { round } from 'lib/utilityFunctions';
import { DECIMAL_PLACES } from 'lib/constants';

export const summarizeValues = (values: any[], decimals = DECIMAL_PLACES) => {
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