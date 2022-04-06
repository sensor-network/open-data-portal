import { NextApiRequest, NextApiResponse } from 'next';

import { HTTP_STATUS as STATUS } from 'lib/httpStatusCodes';
import * as HistoryDaily from 'lib/database/history_daily';
import * as Measurements from 'lib/database/data';
import * as Location from 'lib/database/location';
import { z, ZodError } from 'zod';
import { zDataColumns, zTime, zLocation } from 'lib/types/ZodSchemas';

import { add, format } from 'date-fns';
import { RowDataPacket } from 'mysql2/promise';

import {
  summarizeValues,
  getAverage,
  getMin,
  getMax,
  round,
  defineDataDensity,
  findLast
} from 'lib/utilityFunctions';
import { parseUnit as parseTempUnit } from "lib/units/temperature";
import { parseUnit as parseCondUnit } from "lib/units/conductivity";

const DAILY_DENSITIES = ['5min', '30min', '1h', '12h'] as const;
const HISTORY_DENSITIES = ['1d', '1w', '2w', '1mon', '1y'] as const;
const zDensity = z.enum([...DAILY_DENSITIES, ...HISTORY_DENSITIES]).optional();
const DENSITY_OPTIONS = {
  '5min': { minutes: 5 },
  '30min': { minutes: 30 },
  '1h': { hours: 1 },
  '12h': { hours: 12 },
  '1d': { days: 1 },
  '1w': { weeks: 1 },
  '2w': { weeks: 2 },
  '1mon': { months: 1 },
  '1y': { years: 1 },
};

interface SensorSummary {
  min: number,
  avg: number,
  max: number,
}

interface ExtendedSensors extends SensorSummary {
  start: number,
  end: number,
}

type SummarizedMeasurement = {
  date: string,
  sensors: {
    [key: string]: SensorSummary,
  },
};
type Summary = {
  location_name: string,
  start_date: string,
  end_date: string,
  sensors: {
    [key: string]: ExtendedSensors,
  },
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    console.log(`${req.method}: /api/v2/aggregate:: Method not allowed`);
    res.setHeader('Allow', 'GET')
      .status(STATUS.NOT_ALLOWED)
      .json({ error: `Method '${req.method}' not allowed.` });
    return;
  }

  try {
    /* parse necessary parameters */
    const { start_date, end_date } = zTime.parse(req.query);
    const includeMeasurements = z.enum(['true', 'false']).default('true')
      .transform(str => str === 'true')
      .parse(req.query.include_measurements);
    let location_name = z.string().default('Karlskrona').parse(req.query.location_name);
    const density = zDensity.parse(req.query.density) || defineDataDensity(new Date(start_date), new Date(end_date));
    const nextDateOptions = DENSITY_OPTIONS[density];

    const tempUnitParam = z.string().default('k').parse(req.query.temperature_unit);
    const temperatureUnit = parseTempUnit(tempUnitParam);
    const condUnitParam = z.string().default('spm').parse(req.query.conductivity_unit);
    const conductivityUnit = parseCondUnit(condUnitParam);

    /* find specified location */
    const location = await Location.findByName({ name: location_name });
    if (!location) {
      console.log(`/api/v2/data/history:: Location '${location_name}' not found`);
      res.status(STATUS.OK).json({});
    }

    const summary: Summary = {
      location_name,
      start_date: format(new Date(start_date), 'yyyy-MM-dd'),
      end_date: format(new Date(end_date), 'yyyy-MM-dd'),
      sensors: {},
    };
    let measurements: Array<SummarizedMeasurement> = [];

    /* decide what table to query */
    if (DAILY_DENSITIES.find(d => d === density)) {
      /* get all measurements for specified location */
      const response = await Measurements.findMany('by-location-name', {
        offset: 0,
        page_size: 10000,
        location_name,
        start_date,
        end_date,
      }, zDataColumns.options);
      const rows = <RowDataPacket[]>response;
      const converted = rows.map(row => {
        Object.assign(row, {
          temperature: temperatureUnit.fromKelvin(row.temperature),
          conductivity: conductivityUnit.fromSiemensPerMeter(row.conductivity),
          ph: round(row.ph, 1),
        });
        return row;
      });

      console.log(rows);

      /* set start & end here for each sensor, rest of the properties are set later... */
      if (converted.length) {
        zDataColumns.options.forEach(column => {
          Object.assign(summary.sensors, {
            [column]: {
              start: converted[0][column],
              end: converted[rows.length - 1][column],
            },
          });
        });
      }

      let currentDate = new Date(start_date);
      /* FIXME: This loop is quite expensive */
      while (currentDate <= new Date(end_date)) {
        /* add the density */
        const nextDate = add(currentDate, nextDateOptions);
        /* get all rows within the current range */
        const inRange = converted.filter(row => (
          currentDate <= new Date(row.date) && new Date(row.date) < nextDate
        ));
        /* summarize the rows */
        const measurement: SummarizedMeasurement = {
          date: format(currentDate, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
          sensors: {},
        };
        zDataColumns.options.forEach(column => {
          const values = inRange.map(row => row[column]);
          measurement.sensors[column] = summarizeValues(values);
        });

        measurements.push(measurement);
        currentDate = nextDate;
      }
    }

    /* query history table if density is larger */
    else {
      const response = await HistoryDaily.findMany({
        start_date, end_date, location_name,
      });

      /* convert to correct units */
      const converted = response.map(row => {
        if (row.sensor_type === 'temperature') {
          Object.assign(row, {
            daily_min: round(temperatureUnit.fromKelvin(row.daily_min), 1),
            daily_avg: round(temperatureUnit.fromKelvin(row.daily_avg), 1),
            daily_max: round(temperatureUnit.fromKelvin(row.daily_max), 1),
          });
        }
        else if (row.sensor_type === 'conductivity') {
          Object.assign(row, {
            daily_min: round(conductivityUnit.fromSiemensPerMeter(row.daily_min), 1),
            daily_avg: round(conductivityUnit.fromSiemensPerMeter(row.daily_avg), 1),
            daily_max: round(conductivityUnit.fromSiemensPerMeter(row.daily_max), 1),
          });
        }
        else if (row.sensor_type === 'ph') {
          Object.assign(row, {
            daily_min: round(row.daily_min, 1),
            daily_avg: round(row.daily_avg, 1),
            daily_max: round(row.daily_max, 1),
          });
        }
        return row;
      });

      /* set start & end here for each sensor, rest of the properties are set later... */
      if (converted.length) {
        zDataColumns.options.forEach(column => {
          Object.assign(summary.sensors, {
            [column]: {
              start: converted.find(row => row.sensor_type === column)?.daily_avg,
              end: findLast(converted, (row: any) => row.sensor_type === column)?.daily_avg,
            },
          });
        });
      }

      let currentDate = new Date(start_date);
      while (currentDate <= new Date(end_date)) {
        const nextDate = add(currentDate, nextDateOptions);
        const inRange = converted.filter(row => (
          currentDate <= new Date(row.date) && new Date(row.date) < nextDate
        ));

        if (!inRange.length) {
          currentDate = nextDate;
          continue;
        }

        const measurement: SummarizedMeasurement = {
          date: format(currentDate, "yyyy-MM-dd"),
          sensors: {},
        };

        zDataColumns.options.forEach(column => {
          const values = inRange.filter(row => row.sensor_type === column)
            .map(row => ({ min: row.daily_min, avg: row.daily_avg, max: row.daily_max, }));
          Object.assign(measurement.sensors, {
            [column]: {
              min: round(getMin(values.map(v => v.min)), 1),
              avg: round(getAverage(values.map(v => v.avg)), 1),
              max: round(getMax(values.map(v => v.max)), 1),
            }
          });
        });

        measurements.push(measurement);
        currentDate = nextDate;
      }
    }

    zDataColumns.options.forEach(column => {
      /* if property 'column' is undefined, we never assigned a start/end meaning the data is empty */
      if (summary.sensors[column]) {
        Object.assign(summary.sensors[column], {
          min: round(getMin(measurements.map(m => m.sensors[column].min)), 1),
          avg: round(getAverage(measurements.map(m => m.sensors[column].avg)), 1),
          max: round(getMax(measurements.map(m => m.sensors[column].max)), 1),
        });
      }
    });

    //console.log("GET: /api/v2/data/history :: returning from handler with");
    //console.log(summary);
    res.status(STATUS.OK)
      .json(includeMeasurements ? { summary, measurements } : { summary });
  }
  catch (e) {
    if (e instanceof ZodError) {
      console.log("Error parsing query params:\n", e.flatten());
      res.status(STATUS.BAD_REQUEST)
        .json(e.flatten());
    }
    else {
      console.error(e);
      res.status(STATUS.SERVER_ERROR)
        .json({ error: "Internal server error" });
    }
  }
};

export default handler;