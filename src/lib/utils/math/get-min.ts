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
