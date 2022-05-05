import { NextApiRequest, NextApiResponse } from "next";
import { z, ZodError } from "zod";
import { OkPacket } from "mysql2/promise";

import * as Measurement from "~/lib/database/measurement";
import * as Sensor from "~/lib/database/sensor";
import * as Location from "~/lib/database/location";

import { HTTP_STATUS as STATUS } from "~/lib/constants";
import { zCreateMeasurement } from "~/lib/validators/measurement";
import { zTimeRange } from "~/lib/validators/time";
import { zLocation } from "~/lib/validators/location";
import { zPage } from "~/lib/validators/pagination";
import { authorizeRequest } from "~/lib/utils/api/auth";
import { round } from "~/lib/utils/math";
import {
  parseUnit as parseTempUnit,
  parseTemperature,
  Temperature,
} from "~/lib/units/temperature";
import {
  parseUnit as parseCondUnit,
  parseConductivity,
  Conductivity,
} from "~/lib/units/conductivity";
import { PH } from "~/lib/units/ph";

export type Pagination = {
  page: number;
  pageSize: number;
  lastPage: number;
  totalRows: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  /**
   * GET /api/v3/measurements
   **/
  if (req.method === "GET") {
    try {
      /* parse parameters */
      const temperatureUnit = parseTempUnit(
        z.string().default("k").parse(req.query.temperatureUnit)
      );
      const conductivityUnit = parseCondUnit(
        z.string().default("spm").parse(req.query.conductivityUnit)
      );
      const sortOrder = z
        .enum(["asc", "desc"])
        .default("asc")
        .parse(req.query.sortOrder);
      const { lat, long, rad, locationName, useExactPosition } =
        zLocation.parse(req.query);
      const { startTime, endTime } = zTimeRange.parse(req.query);
      let { page, pageSize } = zPage.parse(req.query);
      const offset = (page - 1) * pageSize; // last row of previous page

      /* status to keep track if we should return 404 */
      let status: { found: boolean; message: string } = {
        found: true,
        message: "",
      };

      /* first find matching locations */
      let locations: Location.Location[] | null = null;
      if (locationName !== undefined && locationName !== "Everywhere") {
        locations = await Location.findByName({ name: locationName });
        if (!locations.length) {
          status = {
            found: false,
            message: `No location named '${locationName}' found.`,
          };
        }
      } else if (lat && long && !useExactPosition) {
        locations = await Location.findByLatLong({ lat, long, rad });
        if (!locations.length) {
          status = {
            found: false,
            message: `No location found matching { lat: ${lat}, long: ${long} }.`,
          };
        }
      }

      /* return early if no matching locations were found */
      if (!status.found) {
        console.log(`${req.method} /api/v3/measurements:: ${status.message}`);
        res.status(STATUS.NOT_FOUND).json({ message: status.message });
        return;
      }

      /* find measurements */
      let measurements: Measurement.Measurement[];
      if (locations === null) {
        /* locations === null means we didn't look for any locations */
        if (lat && long && rad && useExactPosition) {
          /* run distance formula against every row. off by default since it is slow */
          measurements = await Measurement.findByLatLong({
            lat,
            long,
            rad,
            startTime,
            endTime,
            sortOrder,
          });
        } else {
          console.log("SEARCHING ALL LOCATIONS");
          measurements = await Measurement.findMany({
            startTime,
            endTime,
            sortOrder,
          });
        }
        if (!measurements.length) {
          status = {
            found: false,
            message: `No measurements found between ${startTime} and ${endTime}.`,
          };
        }
      } else {
        /* find measurements based on the locations we queried earlier */
        measurements = await Measurement.findByLocationIds({
          locationIds: locations.map((l) => l.id),
          startTime,
          endTime,
          sortOrder,
        });
        if (!measurements.length) {
          status = {
            found: false,
            message: `No measurements found between ${startTime} and ${endTime} for locations ${locations
              .map((l) => l.name)
              .join(", ")}`,
          };
        }
      }

      /* return early if no measurements were found */
      if (!status.found) {
        console.log(`${req.method} /api/v3/measurements:: ${status.message}`);
        res.status(STATUS.NOT_FOUND).json({ message: status.message });
        return;
      }

      /* apply pagination options */
      const rowCount = measurements.length;
      const lastPage =
        Math.ceil(rowCount / pageSize) ||
        1; /* if rows=0, still want last_page=1 */
      page = page > lastPage ? lastPage : page;
      measurements = measurements.slice(offset, offset + pageSize);

      /* convert necessary sensors (or just round) to selected unit */
      measurements.forEach(({ sensors }) => {
        if (Temperature.keyName in sensors) {
          sensors.temperature = temperatureUnit.fromKelvin(sensors.temperature);
        }
        if (Conductivity.keyName in sensors) {
          sensors.conductivity = conductivityUnit.fromSiemensPerMeter(
            sensors.conductivity
          );
        }
        if (PH.keyName in sensors) {
          sensors.ph = new PH(sensors.ph).getValue();
        }
        // FIXME: other sensors will not be converted nor rounded
      });

      /* Returning the locations with STATUS.OK response code */
      res.status(STATUS.OK).json({
        pagination: {
          page,
          pageSize,
          lastPage,
          totalRows: rowCount,
          hasPreviousPage: page > 1,
          hasNextPage: page < lastPage,
        },
        units: {
          time: "UTC",
          temperature: temperatureUnit.symbol,
          conductivity: conductivityUnit.symbols[0],
        },
        measurements,
      });
    } catch (e) {
      if (e instanceof ZodError) {
        console.log(
          `${req.method}: /api/v3/measurements:: Error parsing query params:\n`,
          e.flatten()
        );
        res.status(STATUS.BAD_REQUEST).json(e.flatten());
      } else {
        console.error(`${req.method}: /api/v3/measurements::`, e);
        res
          .status(STATUS.SERVER_ERROR)
          .json({ error: "Internal server error" });
      }
    }
  } else if (req.method === "POST") {
    /**
     * POST /api/v3/measurements
     **/
    /**
     * TODO: Implement more sophisticated authentication
     */
    if (!authorizeRequest(req, res, "")) {
      return;
    }

    /* parse request body, put it into an array if its not */
    let arrayedBody = Array.isArray(req.body) ? req.body : [req.body];
    let insertedMeasurements: {
      time: string;
      locationId: number;
      sensorId: number;
      value: number;
    }[] = [];
    let sensorErrors: { sensorId: number; status: string }[] = [];
    let parsingErrors: { body: {}; error: any }[] = [];

    for (const body of arrayedBody) {
      try {
        /* validate request body */
        const { time, position, sensors } = zCreateMeasurement.parse(body);

        /* find location in the db from the lat,long specified */
        const closestLocation = await Location.findClosest(position);
        let locationId: number;
        if (closestLocation) {
          locationId = closestLocation.id;
        } else {
          /* if no location is found nearby, create a new location whose name could be filled in later, useful when on boat? */
          const DEFAULT_RADIUS = 200;
          locationId = await Location.createOne({
            name: `unknown-${Math.floor(Math.random() * 100)}`,
            long: position.long,
            lat: position.lat,
            rad: DEFAULT_RADIUS,
          });
        }

        for (const { id, value, unit } of sensors) {
          try {
            /* find associated sensor by the id to get its type */
            const sensor = await Sensor.findById({ id });
            if (!sensor) {
              sensorErrors.push({ sensorId: id, status: "SENSOR_NOT_FOUND" });
              continue;
            }

            /* convert the value to SI-unit if there is one */
            let convertedValue = value;
            if (sensor.type === Temperature.keyName) {
              convertedValue = parseTemperature(value, unit || "k").asKelvin();
            } else if (sensor.type === Conductivity.keyName) {
              convertedValue = parseConductivity(
                value,
                unit || "spm"
              ).asSiemensPerMeter();
            } else if (sensor.type === PH.keyName) {
              convertedValue = new PH(value).getValue();
            } else {
              convertedValue = round(value);
            }

            /* insert measurement into db */
            await Measurement.createOne({
              sensorId: id,
              value: convertedValue,
              time,
              sensorType: sensor.type,
              locationId,
              position,
            });

            /* push to response array */
            insertedMeasurements.push({
              sensorId: id,
              value: convertedValue,
              time: time + "Z", // add the removed Z back when responding
              locationId,
            });
          } catch (e) {
            if (e instanceof ZodError) {
              sensorErrors.push({
                sensorId: id,
                status: e.issues[0].code.toUpperCase(),
              });
            } else if (e instanceof Object && e.hasOwnProperty("code")) {
              // @ts-ignore - this validation is apparently not enough to keep TS happy :(
              sensorErrors.push({ sensorId: id, status: e.code.toUpperCase() });
            } else {
              console.error(`${req.method}: /api/v3/measurements::`, e);
              sensorErrors.push({ sensorId: id, status: "UNKNOWN_ERROR" });
            }
          }
        }
      } catch (e) {
        if (e instanceof ZodError) {
          parsingErrors.push({
            body,
            error: e.flatten(),
          });
        }
      }
    }
    /* update sensor health status */
    const updateStatuses: Promise<OkPacket>[] = [];
    sensorErrors.forEach(({ sensorId, status }) => {
      updateStatuses.push(
        Sensor.updateStatus({ id: sensorId, status: status.toUpperCase() })
      );
    });
    insertedMeasurements.forEach(({ sensorId }) => {
      updateStatuses.push(Sensor.updateStatus({ id: sensorId, status: "OK" }));
    });
    await Promise.all(updateStatuses);

    if (!insertedMeasurements.length) {
      res.status(STATUS.BAD_REQUEST).json({
        message: "No inserted measurements",
        errors: [...sensorErrors, ...parsingErrors],
      });
      return;
    }

    /* Returning the location with STATUS.CREATED response code */
    res.status(STATUS.CREATED).json({
      insertedMeasurements,
      errors: [...sensorErrors, ...parsingErrors],
    });
  } else {
    /**
     * {unknown} /api/v3/measurements
     **/
    console.log(`${req.method}: /api/v3/measurements:: Method not allowed`);
    res.setHeader("Allow", "POST, GET");
    res
      .status(STATUS.NOT_ALLOWED)
      .json({ error: `Method '${req.method}' not allowed.` });
    return;
  }
};

export default handler;
