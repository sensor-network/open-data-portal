/* decide a good format depending on the date-range */
import { format } from 'date-fns';

export const dateFormatter = (date: Date | string, startDate: Date, endDate: Date) => {
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