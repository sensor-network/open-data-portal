/* get the minimum from an array of values that may contain null */
export const getMin = (values: (number | null | undefined)[]) => {
  let min = Number.MAX_SAFE_INTEGER;
  for (const value of values) {
    if (value !== null && value !== undefined && value < min) {
      min = value;
    }
  }
  /** return null if there were no numbers in the array */
  if (min === Number.MAX_SAFE_INTEGER) {
    return null;
  }
  /** else return minimum */
  return min;
};
