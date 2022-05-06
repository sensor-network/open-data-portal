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
