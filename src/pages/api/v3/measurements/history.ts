import { NextApiRequest, NextApiResponse } from "next";
import { add, startOfDay, endOfDay, format } from "date-fns";
import { z, ZodError } from "zod";

import { HTTP_STATUS as STATUS } from "~/lib/constants";
import * as History from "~/lib/database/history";
import * as Measurement from "~/lib/database/measurement";
import * as Location from "~/lib/database/location";
import * as Sensor from "~/lib/database/sensor";
import type { CombinedFormat } from "~/lib/database/history";

import { zTimeRange } from "~/lib/validators/time";
import { getAverage, getMin, getMax, round } from "~/lib/utils/math";
import { defineDataDensity } from "~/lib/utils/define-data-density";
import findLast from "~/lib/utils/find-last";
import {
  parseUnit as parseTempUnit,
  Temperature,
} from "~/lib/units/temperature";
import {
  Conductivity,
  parseUnit as parseCondUnit,
} from "~/lib/units/conductivity";
import { PH } from "~/lib/units/ph";

const DAILY_DENSITIES = ["5min", "30min", "1h", "12h"] as const;
const HISTORY_DENSITIES = ["1d", "1w", "2w", "1mon", "1y"] as const;
const zDensity = z.enum([...DAILY_DENSITIES, ...HISTORY_DENSITIES]).optional();
const DENSITY_OPTIONS = {
  "5min": { minutes: 5 },
  "30min": { minutes: 30 },
  "1h": { hours: 1 },
  "12h": { hours: 12 },
  "1d": { days: 1 },
  "1w": { weeks: 1 },
  "2w": { weeks: 2 },
  "1mon": { months: 1 },
  "1y": { years: 1 },
};

export type SummarizedMeasurement = {
  time: Date;
  sensors: {
    [key: string]: { min: number; avg: number; max: number };
  };
};
export type Summary = {
  locationName: string;
  startTime: Date;
  endTime: Date;
  sensors: {
    [key: string]: {
      min: number;
      avg: number;
      max: number;
      start: number;
      end: number;
    };
  };
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    console.log(`${req.method}: ${req.url}:: Method not allowed`);
    res.setHeader("Allow", "GET");
    res
      .status(STATUS.NOT_ALLOWED)
      .json({ error: `Method '${req.method}' not allowed.` });
    return;
  }

  try {
    /* parse necessary parameters */
    const { startTime, endTime } = zTimeRange.parse(req.query);
    /* whether we should include all measurements or just summarize */
    const includeMeasurements = z
      .enum(["true", "false"])
      .default("true")
      .transform((str) => str === "true")
      .parse(req.query.includeMeasurements);
    const sortOrder = z
      .enum(["asc", "desc"])
      .default("asc")
      .parse(req.query.sortOrder);
    let locationName = z.string().optional().parse(req.query.locationName);
    /* how much time between each measurement */
    const density =
      zDensity.parse(req.query.density) ||
      defineDataDensity(new Date(startTime), new Date(endTime));
    const nextDateOptions = DENSITY_OPTIONS[density];

    const temperatureUnit = parseTempUnit(
      z.string().default("k").parse(req.query.temperatureUnit)
    );
    const conductivityUnit = parseCondUnit(
      z.string().default("spm").parse(req.query.conductivityUnit)
    );

    /* find specified location, use a dummy as default, dummy is placeholder to select all locations */
    let location: Location.Location = {
      id: -1,
      name: "Everywhere",
      position: { lat: 0, long: 0 },
      radiusMeters: 0,
    };
    /* if a specific name was provided, override the dummy and use an actual position */
    if (locationName !== undefined && locationName !== "Everywhere") {
      const locations = await Location.findByName({ name: locationName });
      /* return 404 if no matching location was found */
      if (!locations.length) {
        const message = `Location '${locationName}' not found.`;
        console.log(`${req.method}: /api/v3/measurements/history:: ${message}`);
        res.status(STATUS.NOT_FOUND).json({ message });
        return;
      }
      /* else continue with first match */
      location = locations[0];
    }

    const summary: Summary = {
      locationName: location.name,
      startTime,
      endTime,
      sensors: {},
    };
    let measurements: SummarizedMeasurement[] = [];

    /* decide what table to query */
    let rows: CombinedFormat[];
    if (DAILY_DENSITIES.find((d) => d === density)) {
      rows = await Measurement.findInCombinedFormat({
        locationId: location.id,
        startTime,
        endTime,
        sortOrder,
      });
    } else {
      rows = await History.findInCombinedFormat({
        locationId: location.id,
        startDate: startTime,
        endDate: endTime,
        sortOrder,
      });
    }

    if (!rows.length) {
      const message = `No measurements found for location '${location.name}' between ${startTime} and ${endTime}.`;
      console.log(`${req.method}: ${req.url}:: ${message}`);
      res.status(STATUS.NOT_FOUND).json({ message });
      return;
    }

    /* convert to correct units */
    const converted = rows.map((row) => {
      let convert: (v: number) => number;
      switch (row.type) {
        case Temperature.keyName:
          convert = (v) => temperatureUnit.fromKelvin(v);
          break;
        case Conductivity.keyName:
          convert = (v) => conductivityUnit.fromSiemensPerMeter(v);
          break;
        case PH.keyName:
          convert = (v) => new PH(v).getValue();
          break;
        default:
          convert = (v) => round(v);
          break;
      }
      Object.assign(row, {
        min: row.min === null ? null : convert(row.min),
        avg: row.avg === null ? null : convert(row.avg),
        max: row.max === null ? null : convert(row.max),
      });
      return row;
    });

    /* set start & end here for each sensor, rest of the properties are set later... */
    const sensorTypes = await Sensor.findAllTypes();
    sensorTypes.forEach((type) => {
      const first = converted.find(
        (row: CombinedFormat) => row.type === type
      )?.avg;
      const last = findLast(
        converted,
        (row: CombinedFormat) => row.type === type
      )?.avg;
      if (
        first === undefined ||
        last === undefined ||
        first === null ||
        last === null
      ) {
        return;
      }
      Object.assign(summary.sensors, {
        [type]: {
          start: round(first),
          end: round(last),
        },
      });
    });

    /* if we should include measurements, then we need to do some more work */
    /* aggregate the result in chunks of the given density */
    if (includeMeasurements) {
      let currentTime = startTime;
      while (currentTime <= endTime) {
        const nextTime = add(currentTime, nextDateOptions);
        const inRange = converted.filter(
          (row) => currentTime <= row.time && row.time < nextTime
        );

        if (!inRange.length) {
          currentTime = nextTime;
          continue;
        }

        const measurement: SummarizedMeasurement = {
          time: currentTime,
          sensors: {},
        };

        sensorTypes.forEach((type) => {
          const values = inRange
            .filter((row) => row.type === type)
            .map((row) => ({ min: row.min, avg: row.avg, max: row.max }));
          if (!values.length) {
            return;
          }

          const min = getMin(values.map((v) => v.min));
          const avg = getAverage(values.map((v) => v.avg));
          const max = getMax(values.map((v) => v.max));
          Object.assign(measurement.sensors, {
            [type]: {
              min: min === null ? null : round(min),
              avg: avg === null ? null : round(avg),
              max: max === null ? null : round(max),
            },
          });
        });
        measurements.push(measurement);
        currentTime = nextTime;
      }

      sensorTypes.forEach((type) => {
        /* if property 'column' is undefined, we never assigned a start/end meaning the data is empty */
        if (type in summary.sensors) {
          const min = getMin(measurements.map((m) => m.sensors[type]?.min));
          const avg = getAverage(measurements.map((m) => m.sensors[type]?.avg));
          const max = getMax(measurements.map((m) => m.sensors[type]?.max));
          Object.assign(summary.sensors[type], {
            min: min === null ? null : round(min),
            avg: avg === null ? null : round(avg),
            max: max === null ? null : round(max),
          });
        }
      });

      res.status(STATUS.OK).json({ summary, measurements });
    } else {
      /** if we should not include measurements, we summarize directly from the db response */
      sensorTypes.forEach((type) => {
        const values = converted.filter((row) => row.type === type);
        if (type in summary.sensors) {
          const min = getMin(values.map((m) => m.min));
          const avg = getAverage(values.map((m) => m.avg));
          const max = getMax(values.map((m) => m.max));
          Object.assign(summary.sensors[type], {
            min: min === null ? null : round(min),
            avg: avg === null ? null : round(avg),
            max: max === null ? null : round(max),
          });
        }
      });

      res.status(STATUS.OK).json({ summary });
    }
  } catch (e) {
    if (e instanceof ZodError) {
      console.log(
        `${req.method}: ${req.url}:: Error parsing query params:\n`,
        e.flatten()
      );
      res.status(STATUS.BAD_REQUEST).json(e.flatten());
    } else {
      console.error(`${req.method}: ${req.url}::`, e);
      res.status(STATUS.SERVER_ERROR).json({ error: "Internal server error" });
    }
  }
};

export default handler;
