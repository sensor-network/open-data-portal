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
