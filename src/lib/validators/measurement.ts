import { isValid, parseISO } from "date-fns";
import { z } from "zod";
import { MIN_LAT, MAX_LAT, MIN_LONG, MAX_LONG } from "../constants";
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
      .refine(
        (num) => num >= MIN_LAT,
        `should be greater than or equal to ${MIN_LAT}`
      )
      .refine(
        (num) => num <= MAX_LAT,
        `should be less than or equal to ${MAX_LAT}`
      )
      .or(z.number().gte(MIN_LAT).lte(MAX_LAT)), // no need to transform if input is already a number (e.g. when coming from req. body)

    long: z
      .string()
      .transform((str) => Number(str))
      .refine(
        (num) => num >= MIN_LONG,
        `should be greater than or equal to ${MIN_LONG}`
      )
      .refine(
        (num) => num <= MAX_LONG,
        `should be less than or equal to ${MAX_LONG}`
      )
      .or(z.number().gte(MIN_LONG).lte(MAX_LONG)), // no need to transform if input is already a number (e.g. when coming from req. body)
  }),
  stationId: z.number().positive().int(),
  sensors: z.array(
    z.object({
      id: z.number().positive(),
      value: z.number(),
      unit: z.string().optional(),
    })
  ),
});
