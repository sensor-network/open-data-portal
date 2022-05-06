import { DECIMAL_PLACES } from "~/lib/constants";

/* round given value to specified precision */
export const round = (value: number, decimals = DECIMAL_PLACES) => {
  const roundFactor = Math.pow(10, decimals);
  return Math.round(value * roundFactor) / roundFactor;
};
