import { isValid, parseISO } from "date-fns";
import { z } from "zod";
import ISOStringToSQLTimestamp from "~/lib/utils/iso-to-sql-timestamp";

export const zCreateMeasurement = z.object({
  time: z
    .string()
    .refine(
      (str) => isValid(parseISO(str)),
      "Invalid time format. Time should be provided using ISO8601 format."
    )
    .transform((str) => parseISO(str)),
  position: z.object({
    lat: z
      .string()
      .transform((str) => Number(str))
      .refine((num) => num >= -90, "should be greater than or equal to -90")
      .refine((num) => num <= 90, "should be less than or equal to 90")
      .or(z.number().gte(-90).lte(90)), // no need to transform if input is already a number (e.g. when coming from req. body)

    long: z
      .string()
      .transform((str) => Number(str))
      .refine((num) => num >= -180, "should be greater than or equal to -180")
      .refine((num) => num <= 180, "should be less than or equal to 180")
      .or(z.number().gte(-180).lte(180)), // no need to transform if input is already a number (e.g. when coming from req. body)
  }),
  sensors: z.array(
    z.object({
      id: z.number().positive(),
      value: z.number(),
      unit: z.string().optional(),
    })
  ),
});
