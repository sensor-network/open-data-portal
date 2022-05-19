import { z } from "zod";
import { isValid, endOfToday } from "date-fns";

export const zTime = z
  .string()
  .refine((str) => isValid(new Date(str)), "Unable to parse string as Date")
  .transform((str) => new Date(str));

/**
 * schema for parsing a valid time range
 * must be a valid ISO date and defaults to 2022-01-01 -> now
 **/
export const zTimeRange = z
  .object({
    startTime: z
      .string()
      .default("2022Z" /* new year 2022 */)
      .refine((str) => isValid(new Date(str)), "Unable to parse string as Date")
      .refine((str) => new Date(str) >= new Date("2022Z"), "must be after 2022")
      .transform((str) => new Date(str)),
    endTime: z
      .string()
      .default(new Date().toISOString() /* current time */)
      .refine((str) => isValid(new Date(str)), "Unable to parse string as Date")
      /** FIXME: Should not accept future dates, but there seems to be some time difference 
       * between the client and the server which causes the time to be out-of-sync.
      .refine((str) => new Date(str) <= endOfToday(), "can't be a future date") 
     */
      .transform((str) => new Date(str)),
  })
  .refine(
    ({ startTime, endTime }) => endTime >= startTime,
    "endTime cannot be before startTime"
  );
