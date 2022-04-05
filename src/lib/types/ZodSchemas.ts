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
    .or(z.number().gte(-90).lte(90))
  ),
  long: z.optional(z.string()
    .transform(str => Number(str))
    .refine((num) => num >= -180, 'should be greater than or equal to -180')
    .refine((num) => num <= 180, 'should be less than or equal to 180')
    .or(z.number().gte(-180).lte(180))
  ),
  rad: z.string().optional().default('200')
    .transform(str => Number(str))
    .refine((num) => num > 0, 'should be positive')
    .or(z.number().positive())
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

export const zDataColumns = z.enum(["temperature", "conductivity", "ph"]);

/**
 * schema for incoming post-request's body
 **/
export const zCreateInstance = z.object({
  timestamp: z.preprocess(
    // maximize compatibility and validate the inputted date
    inputStr => ISOStringToSQLTimestamp(inputStr), z.string()
  ),
  latitude: z.number().gte(-90).lte(90),      // lat ranges from +-90 deg
  longitude: z.number().gte(-180).lte(180),   // lng ranges from +-180 deg
  sensors: z.object({
    temperature: z.number().optional(),
    temperature_unit: z.string().optional(),
    ph_level: z.number().gte(0).lte(14).optional(),    // ph scale ranges from 0 to 14
    conductivity: z.number().optional(),
    conductivity_unit: z.string().optional(),
  }).strict()
}).strict();


/* new schema for uploading sensor data */
export const zCreateSensorData = z.object({
  timestamp: z.preprocess(
    // maximize compatibility and validate the inputted date
    inputStr => ISOStringToSQLTimestamp(inputStr), z.string()
  ),
  sensors: z.array(z.object({
    sensor_id: z.number(),
    value: z.number(),
    unit: z.string().optional(),
  }))
});

export const zCreateStation = z.object({
  location_name: z.string(),
  sensor_ids: z.array(z.number().int().positive()),
});