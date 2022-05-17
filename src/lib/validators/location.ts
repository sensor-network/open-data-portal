import { z } from "zod";

import { MIN_LAT, MIN_LONG, MAX_LAT, MAX_LONG } from "../constants";

/**
 * schema for creating a location entry.
 * since params comes from body, no need to convert from string
 **/
export const zCreateLocation = z
  .object({
    lat: z.number().gte(MIN_LAT).lte(MAX_LAT),
    long: z.number().gte(MIN_LONG).lte(MAX_LONG),
    rad: z.number().positive(),
    name: z.string(),
  })
  .strict();

export const zUpdateLocation = z
  .object({
    name: z.string().optional().nullable(),
  })
  .strict();
/**
 * schema for parsing location information,
 * geo-information is validated to be in range.
 * params comes from query string, so need to convert from string
 **/

export const zLatLong = z.object({
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
    ),
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
    ),
});

export const zLocation = z
  .object({
    lat: z.optional(
      z
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
    ),
    long: z.optional(
      z
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
    ),
    rad: z.preprocess((rad) => {
      /* radius is optional, if it is left out, it should be null */
      if (rad === undefined) {
        return null;
      }
      return Number(rad);
    }, z.number().int().positive().nullable()),
    name: z.optional(z.string()),
    locationName: z.optional(z.string()),
    useExactPosition: z
      .enum(["true", "false"])
      .default("false")
      .transform((str) => str === "true"),
  })
  .refine(({ lat, long, useExactPosition, rad }) => {
    /* if one of them are specified, both have to be specified */
    if (lat !== undefined || long !== undefined) {
      return lat !== undefined && long !== undefined;
    }
    /* but they can both be left out */
    return true;
  }, "lat and long must be provided together")
  .refine(({ lat, long, useExactPosition, rad }) => {
    /* if useExactPosition is true, then lat and long must be specified */
    if (useExactPosition) {
      return lat !== undefined && long !== undefined && rad !== null;
    }
    return true;
  }, "lat, long and rad must be provided if using useExactPosition");
