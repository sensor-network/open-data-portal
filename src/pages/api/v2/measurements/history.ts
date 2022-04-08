import { NextApiRequest, NextApiResponse } from 'next';

import { HTTP_STATUS as STATUS } from 'lib/httpStatusCodes';
import * as History from 'lib/database/history';
import * as Measurement from 'lib/database/measurement';
import * as Location from 'lib/database/location';
import * as Sensor from 'lib/database/sensor';
import { z, ZodError } from 'zod';
import { zTime } from 'lib/types/ZodSchemas';
import type { CombinedFormat } from 'lib/database/history';

import { add, format } from 'date-fns';

import {
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


type SummarizedMeasurement = {
  date: string,
  sensors: {
    [key: string]: { min: number, avg: number, max: number },
  },
};
type Summary = {
  location_name: string,
  start_date: string,
  end_date: string,
  sensors: {
    [key: string]: {
      min: number,
      avg: number,
      max: number,
      start: number,
      end: number,
    },
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
    /* whether we should include all measurements or just summarize */
    const include_measurements = z.enum(['true', 'false']).default('true')
      .transform(str => str === 'true')
      .parse(req.query.include_measurements);
    let location_name = z.string().default('Karlskrona').parse(req.query.location_name);
    /* how much time between each measurement */
    const density = zDensity.parse(req.query.density) || defineDataDensity(new Date(start_date), new Date(end_date));
    const next_date_options = DENSITY_OPTIONS[density];

    const temperature_unit = parseTempUnit(
      z.string().default("k")
        .parse(req.query.temperature_unit)
    );
    const conductivity_unit = parseCondUnit(
      z.string()
        .default("spm")
        .parse(req.query.conductivity_unit)
    );

    /* find specified location */
    const location = await Location.findByName({ name: location_name });
    if (!location) {
      console.log(`/api/v2/data/history:: Location '${location_name}' not found`);
      res.status(STATUS.OK).json({});
      return;
    }

    const summary: Summary = {
      location_name,
      start_date: format(new Date(start_date), 'yyyy-MM-dd'),
      end_date: format(new Date(end_date), 'yyyy-MM-dd'),
      sensors: {},
    };
    let measurements: Array<SummarizedMeasurement> = [];

    /* decide what table to query */
    /* FIXME: manually setting id to null if name = Karlskrona is a bit hacky way to select all */
    let rows: Array<CombinedFormat>;
    if (DAILY_DENSITIES.find(d => d === density)) {
      rows = await Measurement.findInCombinedFormat({
        location_id: location_name === 'Karlskrona' ? null : location.id,
        start_time: start_date,
        end_time: end_date,
      });
    }
    else {
      rows = await History.findInCombinedFormat({
        location_id: location_name === 'Karlskrona' ? null : location.id,
        start_date,
        end_date,
      });
    }
    /* convert to correct units */
    const converted = rows.map(row => {
      if (row.type === 'temperature') {
        Object.assign(row, {
          min: round(temperature_unit.fromKelvin(row.min), 1),
          avg: round(temperature_unit.fromKelvin(row.avg), 1),
          max: round(temperature_unit.fromKelvin(row.max), 1),
        });
      }
      else if (row.type === 'conductivity') {
        Object.assign(row, {
          min: round(conductivity_unit.fromSiemensPerMeter(row.min), 1),
          avg: round(conductivity_unit.fromSiemensPerMeter(row.avg), 1),
          max: round(conductivity_unit.fromSiemensPerMeter(row.max), 1),
        });
      }
      else {
        Object.assign(row, {
          min: round(row.min, 1),
          avg: round(row.avg, 1),
          max: round(row.max, 1),
        });
      }
      return row;
    });

    /* set start & end here for each sensor, rest of the properties are set later... */
    const sensor_types = await Sensor.findAllTypes();
    if (converted.length) {
      sensor_types.forEach(type => {
        Object.assign(summary.sensors, {
          [type]: {
            start: converted.find(row => row.type === type)?.avg,
            end: findLast(converted, (row: CombinedFormat) => row.type === type)?.avg,
          },
        });
      });
    }

    let current_time = new Date(start_date);
    while (current_time <= new Date(end_date)) {
      const next_time = add(current_time, next_date_options);
      const in_range = converted.filter(row => (
        current_time <= row.time && row.time < next_time
      ));

      if (!in_range.length) {
        current_time = next_time;
        continue;
      }

      const measurement: SummarizedMeasurement = {
        date: format(current_time, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        sensors: {},
      };

      sensor_types.forEach(type => {
        const values = in_range.filter(row => row.type === type)
          .map(row => ({ min: row.min, avg: row.avg, max: row.max, }));
        Object.assign(measurement.sensors, {
          [type]: {
            min: round(getMin(values.map(v => v.min)), 1),
            avg: round(getAverage(values.map(v => v.avg)), 1),
            max: round(getMax(values.map(v => v.max)), 1),
          }
        });
      });

      measurements.push(measurement);
      current_time = next_time;
    }

    sensor_types.forEach(type => {
      /* if property 'column' is undefined, we never assigned a start/end meaning the data is empty */
      if (summary.sensors.hasOwnProperty(type)) {
        Object.assign(summary.sensors[type], {
          min: round(getMin(measurements.map(m => m.sensors[type].min)), 1),
          avg: round(getAverage(measurements.map(m => m.sensors[type].avg)), 1),
          max: round(getMax(measurements.map(m => m.sensors[type].max)), 1),
        });
      }
    });

    res.status(STATUS.OK)
      .json(include_measurements ? { summary, measurements } : { summary });
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