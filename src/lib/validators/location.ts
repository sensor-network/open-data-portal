import { z } from "zod";

/**
 * schema for creating a location entry.
 * since params comes from body, no need to convert from string
 **/
export const zCreateLocation = z
  .object({
    lat: z.number().gte(-90).lte(90),
    long: z.number().gte(-180).lte(180),
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
    .refine((num) => num >= -90, "should be greater than or equal to -90")
    .refine((num) => num <= 90, "should be less than or equal to 90"),
  long: z
    .string()
    .transform((str) => Number(str))
    .refine((num) => num >= -180, "should be greater than or equal to -180")
    .refine((num) => num <= 180, "should be less than or equal to 180"),
});

export const zLocation = z
  .object({
    lat: z.optional(
      z
        .string()
        .transform((str) => Number(str))
        .refine((num) => num >= -90, "should be greater than or equal to -90")
        .refine((num) => num <= 90, "should be less than or equal to 90")
    ),
    long: z.optional(
      z
        .string()
        .transform((str) => Number(str))
        .refine((num) => num >= -180, "should be greater than or equal to -180")
        .refine((num) => num <= 180, "should be less than or equal to 180")
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
