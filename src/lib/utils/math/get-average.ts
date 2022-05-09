/* calculate average from an array of values that may contain null */
export const getAverage = (values: (number | null | undefined)[]) => {
  //console.log(values);
  let [sum, validValues] = [0, 0];
  for (const value of values) {
    if (value !== null && value !== undefined) {
      sum += value;
      validValues++;
    }
  }
  /** return null if there were no numbers in the array */
  if (validValues === 0) {
    return null;
  }
  return sum / validValues;
};
