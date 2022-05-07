import { z } from "zod";

/**
 * schema for selecting pagination options,
 * defaults to page 1 with pageSize 100
 **/
export const zPage = z.object({
  page: z.preprocess(
    (page) => Number(z.string().default("1").parse(page)),
    z.number().int().positive()
  ),
  pageSize: z.preprocess(
    (pageSize) => Number(z.string().default("100").parse(pageSize)),
    z.number().int().positive()
  ),
});
