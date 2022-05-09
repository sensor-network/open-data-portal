/* get the maximum from an array of values that may contain null */
export const getMax = (values: (number | null | undefined)[]) => {
  let max = Number.MIN_SAFE_INTEGER;
  for (const value of values) {
    if (value !== null && value !== undefined && value > max) {
      max = value;
    }
  }
  /** return null if there were no numbers in the array */
  if (max === Number.MIN_SAFE_INTEGER) {
    return null;
  }
  return max;
};
