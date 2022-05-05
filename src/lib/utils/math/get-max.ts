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
