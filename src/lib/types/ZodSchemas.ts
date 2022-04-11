import { z } from 'zod';
import { ISOStringToSQLTimestamp } from 'lib/units/convertTimestamp';
import { endOfToday, isValid } from 'date-fns';

/**
 * schema for parsing location information,
 * geo-information is validated to be in range
 **/
export const zLocation = z.object({
  lat: z.optional(z.string()  // input is a string which has to be transformed
    .transform(str => Number(str))
    .refine((num) => num >= -90, 'should be greater than or equal to -90')
    .refine((num) => num <= 90, 'should be less than or equal to 90')
    .or(z.number().gte(-90).lte(90)) // no need to transform if input is already a number (e.g. when coming from req. body)
  ),
  long: z.optional(z.string()
    .transform(str => Number(str))
    .refine((num) => num >= -180, 'should be greater than or equal to -180')
    .refine((num) => num <= 180, 'should be less than or equal to 180')
    .or(z.number().gte(-180).lte(180)) // no need to transform if input is already a number (e.g. when coming from req. body)
  ),
  rad: z.string().optional().default('200')
    .transform(str => Number(str))
    .refine((num) => num > 0, 'should be positive')
    .or(z.number().positive())  // no need to transform if input is already a number (e.g. when coming from req. body)
  ,
  location_name: z.string().optional(),
});

/**
 * schema for parsing a valid time range
 * must be a valid ISO date and defaults to 2022-01-01 -> now
 **/
export const zTime = z.object({
  /* FIXME: Sort out proper ranges later */
  start_date: z.string().default('2022Z' /* new year 2022 */)
    .refine(str => isValid(new Date(str)), 'Unable to parse string as Date')
    //.refine(str => new Date(str) >= new Date('2022Z'), 'must be after 2022')
    .transform(str => new Date(str).toISOString()),
  end_date: z.string().default(new Date().toISOString() /* current time */)
    .refine(str => new Date(str).getTime() > 0, 'Unable to parse string as Date')
    .refine(str => new Date(str) <= endOfToday(), "can't be a future date")
    .transform(str => new Date(str).toISOString()),
}).refine(({ start_date, end_date }) => end_date >= start_date, 'end_date must be before start_date');

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
});

/* new schema for uploading sensor data */
export const zCreateMeasurement = z.object({
  timestamp: z.string()
    // maximize compatibility and validate the inputted date
    .transform((str: string) => ISOStringToSQLTimestamp(str)),
  location: z.object({
    lat: z.string()
      .transform(str => Number(str))
      .refine((num) => num >= -90, 'should be greater than or equal to -90')
      .refine((num) => num <= 90, 'should be less than or equal to 90'),
    long: z.string()
      .transform(str => Number(str))
      .refine((num) => num >= -180, 'should be greater than or equal to -180')
      .refine((num) => num <= 180, 'should be less than or equal to 180'),
  }),
  sensors: z.array(z.object({
    sensor_id: z.number().positive(),
    value: z.number(),
    unit: z.string().optional(),
  }))
});

export const zCreateStation = z.object({
  location_id: z.number().int().positive(),
  sensor_ids: z.array(
    z.number().int().positive()
  ),
});

export const zCreateSensor = z.object({
  name: z.string().optional().nullable(),
  firmware: z.string().optional().nullable(),
  type: z.string(),
});