import { z } from 'zod';

/**
 * schema for parsing location information,
 * geo-information is validated to be in range
 **/
export const zLocation = z.object({
    lat: z.optional(z.string()  // input is a string which has to be transformed
        .transform(str => Number(str))
        .refine((num) => num >= -90, 'should be greater than or equal to -90')
        .refine((num) => num <= 90, 'should be less than or equal to 90')
    ),
    long: z.optional(z.string()
        .transform(str => Number(str))
        .refine((num) => num >= -180, 'should be greater than or equal to -180')
        .refine((num) => num <= 180, 'should be less than or equal to 180')
    ),
    rad: z.optional(z.string().default('200')
        .transform(str => Number(str))
        .refine((num) => num > 0, 'should be positive')
    ),
    name: z.string().optional(),
});

/**
 * schema for parsing a valid time range
 * must be a valid ISO date and defaults to 2022-01-01 -> now
 **/
export const zTime = z.object({
    start_date: z.string().default('2022Z' /* new year 2022 */)
        .refine(str => new Date(str).getTime() > 0, 'Unable to parse string as Date')
        .refine(str => new Date(str) >= new Date('2022Z'), 'must be after 2022')
        .transform(str => new Date(str).toISOString()),
    end_date: z.string().default(new Date().toISOString() /* current time */)
        .refine(str => new Date(str).getTime() > 0, 'Unable to parse string as Date')
        .refine(str => new Date(str) <= new Date(), "can't be in the future")
        .transform(str => new Date(str).toISOString()),
}).refine(({start_date, end_date}) => end_date >= start_date, 'end_date must be before start_date');

/**
 * schema for selecting pagination options,
 * defaults to page 1 with page_size 100
 **/
export const zPage = z.object({
    page: z.preprocess(
        page => Number(z.string().default("1").parse(page)),
        z.number().int().positive()
    ),
    page_size: z.preprocess(
        page_size => Number(z.string().default("100").parse(page_size)),
        z.number().int().positive()
    ),
})