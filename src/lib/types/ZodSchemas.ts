import { z } from 'zod';
import { ISOStringToSQLTimestamp } from 'lib/units/convertTimestamp';
import { isValid } from 'date-fns';

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
  locationName: z.string().optional(),
});

/**
 * schema for parsing a valid time range
 * must be a valid ISO date and defaults to 2022-01-01 -> now
 **/
export const zTime = z.object({
  /* FIXME: Sort out proper ranges later */
  startDate: z.string().default('2022Z' /* new year 2022 */)
    .refine(str => isValid(new Date(str)), 'Unable to parse string as Date')
    //.refine(str => new Date(str) >= new Date('2022Z'), 'must be after 2022')
    .transform(str => new Date(str).toISOString()),
  endDate: z.string().default(new Date().toISOString() /* current time */)
    .refine(str => new Date(str).getTime() > 0, 'Unable to parse string as Date')
    //.refine(str => new Date(str) <= endOfToday(), "can't be a future date")
    .transform(str => new Date(str).toISOString()),
}).refine(({ startDate, endDate }) => endDate >= startDate, 'endDate must be before startDate');

/**
 * schema for selecting pagination options,
 * defaults to page 1 with pageSize 100
 **/
export const zPage = z.object({
  page: z.preprocess(
    page => Number(z.string().default("1").parse(page)),
    z.number().int().positive()
  ),
  pageSize: z.preprocess(
    pageSize => Number(z.string().default("100").parse(pageSize)),
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
      .refine((num) => num <= 90, 'should be less than or equal to 90')
      .or(z.number().gte(-90).lte(90)), // no need to transform if input is already a number (e.g. when coming from req. body)

    long: z.string()
      .transform(str => Number(str))
      .refine((num) => num >= -180, 'should be greater than or equal to -180')
      .refine((num) => num <= 180, 'should be less than or equal to 180')
      .or(z.number().gte(-180).lte(180)), // no need to transform if input is already a number (e.g. when coming from req. body)

  }),
  sensors: z.array(z.object({
    sensorId: z.number().positive(),
    value: z.number(),
    unit: z.string().optional(),
  }))
});

export const zCreateStation = z.object({
  locationId: z.number().int().positive(),
  sensorIds: z.array(
    z.number().int().positive()
  ),
});

export const zCreateSensor = z.object({
  name: z.string().optional().nullable(),
  firmware: z.string().optional().nullable(),
  type: z.string(),
});

export const zStationExpandParam = z.optional(
  z.enum(['sensors', 'location'])
    .or(z.array(
      z.enum(['sensors', 'location'])
    ))
).default([]);

export const zStationParams = z.object({
  sensorId: z.optional(z.string()  // input is a string which has to be transformed
    .transform(str => parseInt(str, 10))
    .refine((num) => num > 0, 'id has to be positive'),
  ),
  locationName: z.optional(z.string()),
  sensorType: z.optional(z.string()),
  expand: zStationExpandParam,
}).strict();

export const zIdFromString = z.string()
  .transform(str => parseInt(str, 10))
  .refine((num) => num > 0, 'id has to be positive');

export const zId = z.number().int().positive();