import { z } from "zod";

export const zCreateSensor = z
  .object({
    name: z.string().optional().nullable().default(null),
    firmware: z.string().optional().nullable().default(null),
    type: z.string(),
  })
  .strict();

export const zUpdateSensor = z
  .object({
    name: z.string().optional().nullable(),
    firmware: z.string().optional().nullable(),
  })
  .strict();

export const zSensorParams = z
  .object({
    type: z.optional(z.string()),
    name: z.optional(z.string()),
  })
  .strict();
