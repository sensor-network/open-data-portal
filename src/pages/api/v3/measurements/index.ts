import { NextApiRequest, NextApiResponse } from "next";
import { z, ZodError } from "zod";

import * as Measurement from "src/lib/database/measurement";
import * as Sensor from "src/lib/database/sensor";
import * as Location from "src/lib/database/location";
import { HTTP_STATUS as STATUS } from "src/lib/httpStatusCodes";
import {
  parseUnit as parseTempUnit,
  parseTemperature,
} from "src/lib/units/temperature";
import {
  parseUnit as parseCondUnit,
  parseConductivity,
} from "src/lib/units/conductivity";
import { PH } from "src/lib/units/ph";
import { round } from "src/lib/utilityFunctions";

import {
  zCreateMeasurement,
  zTime,
  zPage,
  zLocation,
} from "src/lib/types/ZodSchemas";
import { OkPacket } from "mysql2/promise";

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
      const { startTime, endTime } = zTime.parse(req.query);
      let { page, pageSize } = zPage.parse(req.query);
      const offset = (page - 1) * pageSize; // last row of previous page

      /* status to keep track if we should return 404 */
      let status: { found: boolean; message: string } = {
        found: true,
        message: "",
      };

      /* first find matching locations */
      let locations: Location.Location[] | null = null;
      if (locationName && locationName !== "Karlskrona") {
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
        if (sensors.hasOwnProperty("temperature")) {
          // @ts-ignore - this validation is apparently not enough to keep TS happy :(
          sensors.temperature = temperatureUnit.fromKelvin(sensors.temperature);
        }
        if (sensors.hasOwnProperty("conductivity")) {
          // @ts-ignore - this validation is apparently not enough to keep TS happy :(
          sensors.conductivity = conductivityUnit.fromSiemensPerMeter(
            sensors.conductivity
          );
        }
        if (sensors.hasOwnProperty("ph")) {
          // @ts-ignore - this validation is apparently not enough to keep TS happy :(
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
    const AUTHENTICATION_SCHEMA = "Bearer";
    const AUTHENTICATION_TOKEN = process.env.NEXT_PUBLIC_API_KEY;
    const { authorization } = req.headers;

    if (authorization !== `${AUTHENTICATION_SCHEMA} ${AUTHENTICATION_TOKEN}`) {
      const errorMessage = `Failed to authenticate the request with the provided authorization-header: '${authorization}'`;
      console.log(`${req.method} /api/v3/measurements:: ${errorMessage}`);

      res.setHeader("WWW-Authenticate", AUTHENTICATION_SCHEMA);
      res.status(STATUS.UNAUTHORIZED).json({ error: errorMessage });
      return;
    }

    try {
      /* parse request body */
      const { time, position, sensors } = zCreateMeasurement.parse(req.body);

      /* find location in the db from the lat,long specified */
      const [closestLocation] = await Location.findByLatLong({
        long: position.long,
        lat: position.lat,
        rad: null,
      });
      let locationId: number;
      if (closestLocation) {
        locationId = closestLocation.id;
      } else {
        /* if no location is found nearby, create a new location whose name could be filled in later, useful when on boat? */
        const DEFAULT_RADIUS = 200;
        locationId = await Location.createOne({
          name: "unknown",
          long: position.long,
          lat: position.lat,
          rad: DEFAULT_RADIUS,
        });
      }

      let insertedMeasurements = [];
      let errors: { sensorId: number; status: string }[] = [];
      for (const { sensorId, value, unit } of sensors) {
        try {
          /* find associated sensor by the id to get its type */
          const sensor = await Sensor.findById({ id: sensorId });
          if (!sensor) {
            errors.push({ sensorId, status: "SENSOR_NOT_FOUND" });
          }

          /* convert the value to SI-unit if there is one */
          let convertedValue = value;
          if (sensor.type === "temperature") {
            convertedValue = parseTemperature(value, unit || "k").asKelvin();
          } else if (sensor.type === "conductivity") {
            convertedValue = parseConductivity(
              value,
              unit || "spm"
            ).asSiemensPerMeter();
          } else if (sensor.type === "ph") {
            convertedValue = new PH(value).getValue();
          } else {
            convertedValue = round(value);
          }

          /* insert measurement into db */
          await Measurement.createOne({
            sensorId,
            value: convertedValue,
            time,
            sensorType: sensor.type,
            locationId,
            position,
          });

          /* push to response array */
          insertedMeasurements.push({
            sensorId,
            value: convertedValue,
            time,
            locationId,
          });
        } catch (e) {
          if (e instanceof ZodError) {
            errors.push({ sensorId, status: e.issues[0].code });
          } else if (e instanceof Object && e.hasOwnProperty("code")) {
            // @ts-ignore - this validation is apparently not enough to keep TS happy :(
            errors.push({ sensorId, status: e.code });
          } else {
            console.error(`${req.method}: /api/v3/measurements::`, e);
            errors.push({ sensorId, status: "UNKNOWN_ERROR" });
          }
        }
      }

      /* update sensor health status */
      const updateStatuses: Promise<OkPacket>[] = [];
      errors.forEach(({ sensorId, status }) => {
        updateStatuses.push(
          Sensor.updateStatus({ id: sensorId, status: status.toUpperCase() })
        );
      });
      insertedMeasurements.forEach(({ sensorId }) => {
        updateStatuses.push(
          Sensor.updateStatus({ id: sensorId, status: "OK" })
        );
      });
      await Promise.all(updateStatuses);

      if (!insertedMeasurements.length) {
        res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "No inserted measurements", errors });
        return;
      }

      /* Returning the location with STATUS.CREATED response code */
      res.status(STATUS.CREATED).json({ errors, insertedMeasurements });
    } catch (e) {
      if (e instanceof ZodError) {
        console.log(
          `${req.method}: /api/v3/measurements:: Error parsing request body:\n`,
          e.flatten()
        );
        res.status(STATUS.BAD_REQUEST).json(e.flatten());
      }
      // @ts-ignore - mysql errors throws errors which has property code
      else if (e.hasOwnProperty("code") && e.code === "ER_DUP_ENTRY") {
        console.log(`${req.method}: /api/v3/measurements::`, e);
        res.status(STATUS.BAD_REQUEST).json({
          error:
            "Unable to upload the given measurement. A sensor can only upload a single measurement for a given time and such measurement already exists.",
        });
      } else {
        console.error(`${req.method}: /api/v3/measurements::`, e);
        res.status(STATUS.SERVER_ERROR).json({
          error: "Internal server error",
        });
      }
    }
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
