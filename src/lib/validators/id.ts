import { z } from "zod";

/* used when parsing an id from query param */
export const zIdFromString = z
  .string()
  .transform((str) => parseInt(str, 10))
  .refine((num) => num > 0, "id has to be positive");

/* used when parsing an id from body param */
export const zId = z.number().int().positive();
