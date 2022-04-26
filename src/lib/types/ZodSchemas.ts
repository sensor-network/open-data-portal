import { z } from 'zod';
import { ISOStringToSQLTimestamp } from 'lib/units/convertTimestamp';
import { isValid } from 'date-fns';


/* GENERAL SCHEMAS */
/* used when parsing an id from query param */
export const zIdFromString = z.string()
  .transform(str => parseInt(str, 10))
  .refine((num) => num > 0, 'id has to be positive');

/* used when parsing an id from body param */
export const zId = z.number().int().positive();

/**
 * schema for parsing a valid time range
 * must be a valid ISO date and defaults to 2022-01-01 -> now
 **/
export const zTime = z.object({
  /* FIXME: Sort out proper ranges later */
  startTime: z.string().default('2022Z' /* new year 2022 */)
    .refine(str => isValid(new Date(str)), 'Unable to parse string as Date')
    //.refine(str => new Date(str) >= new Date('2022Z'), 'must be after 2022')
    .transform(str => new Date(str).toISOString()),
  endTime: z.string().default(new Date().toISOString() /* current time */)
    .refine(str => new Date(str).getTime() > 0, 'Unable to parse string as Date')
    //.refine(str => new Date(str) <= endOfToday(), "can't be a future date")
    .transform(str => new Date(str).toISOString()),
}).refine(({ startTime, endTime }) => endTime >= startTime, 'endTime cannot be before startTime');

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


/* LOCATION SCHEMAS */
/**
 * schema for creating a location entry.
 * since params comes from body, no need to convert from string
 **/
export const zCreateLocation = z.object({
  lat: z.number().gte(-90).lte(90),
  long: z.number().gte(-180).lte(180),
  rad: z.number().positive(),
  name: z.string()
}).strict();

export const zUpdateLocation = z.object({
  name: z.string().optional().nullable(),
}).strict();
/**
 * schema for parsing location information,
 * geo-information is validated to be in range.
 * params comes from query string, so need to convert from string
 **/

export const zLatLong = z.object({
  lat: z.string()
    .transform(str => Number(str))
    .refine((num) => num >= -90, 'should be greater than or equal to -90')
    .refine((num) => num <= 90, 'should be less than or equal to 90'),
  long: z.string()
    .transform(str => Number(str))
    .refine((num) => num >= -180, 'should be greater than or equal to -180')
    .refine((num) => num <= 180, 'should be less than or equal to 180')
});
export const zLocation = z.object({
  lat: z.optional(z.string()
    .transform(str => Number(str))
    .refine((num) => num >= -90, 'should be greater than or equal to -90')
    .refine((num) => num <= 90, 'should be less than or equal to 90')),
  long: z.optional(z.string()
    .transform(str => Number(str))
    .refine((num) => num >= -180, 'should be greater than or equal to -180')
    .refine((num) => num <= 180, 'should be less than or equal to 180')),
  rad: z.preprocess(rad => {
    /* radius is optional, if it is left out, it should be null */
    if (rad === undefined) {
      return null;
    }
    return Number(rad);
  }, z.number().int().positive().nullable()),
  name: z.optional(z.string()),
  locationName: z.optional(z.string()),
  useExactPosition: z.enum(['true', 'false']).default('false').transform(str => str === 'true'),
})
  .refine(({ lat, long, useExactPosition, rad }) => {
    /* if one of them are specified, both have to be specified */
    if (lat !== undefined || long !== undefined) {
      return lat !== undefined && long !== undefined;
    }
    /* but they can both be left out */
    return true;
  }, 'lat and long must be provided together')
  .refine(({ lat, long, useExactPosition, rad }) => {
    /* if useExactPosition is true, then lat and long must be specified */
    if (useExactPosition) {
      return lat !== undefined && long !== undefined && rad !== null;
    }
    return true;
  }, 'lat, long and rad must be provided if using useExactPosition');


/* MEASUREMENT SCHEMA */
export const zCreateMeasurement = z.object({
  time: z.string()
    // maximize compatibility and validate the inputted date
    .transform((str: string) => ISOStringToSQLTimestamp(str)),
  position: z.object({
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


/* STATION SCHEMAS */
export const zCreateStation = z.object({
  locationId: z.number().int().positive(),
  sensorIds: z.array(
    z.number().int().positive()
  ),
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


/* SENSOR SCHEMAS */
export const zCreateSensor = z.object({
  name: z.string().optional().nullable().default(null),
  firmware: z.string().optional().nullable().default(null),
  type: z.string(),
}).strict();

export const zUpdateSensor = z.object({
  name: z.string().optional().nullable(),
  firmware: z.string().optional().nullable(),
}).strict();

export const zSensorParams = z.object({
  type: z.optional(z.string()),
  name: z.optional(z.string()),
}).strict();
