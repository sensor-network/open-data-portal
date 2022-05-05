import { z } from "zod";

export const zCreateStation = z.object({
  locationId: z.number().int().positive(),
  sensorIds: z.array(z.number().int().positive()),
});

export const zStationExpandParam = z
  .optional(
    z.enum(["sensors", "location"]).or(z.array(z.enum(["sensors", "location"])))
  )
  .default([]);

export const zStationParams = z
  .object({
    sensorId: z.optional(
      z
        .string() // input is a string which has to be transformed
        .transform((str) => parseInt(str, 10))
        .refine((num) => num > 0, "id has to be positive")
    ),
    locationName: z.optional(z.string()),
    sensorType: z.optional(z.string()),
    expand: zStationExpandParam,
  })
  .strict();
