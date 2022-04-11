import { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from "zod";

import * as Measurement from "src/lib/database/measurement";
import * as Sensor from "src/lib/database/sensor";
import * as Location from "src/lib/database/location";
import { HTTP_STATUS as STATUS } from "src/lib/httpStatusCodes";
import { parseUnit as parseTempUnit, parseTemperature } from "src/lib/units/temperature";
import { parseUnit as parseCondUnit, parseConductivity } from "src/lib/units/conductivity";
import { PH } from "src/lib/units/ph";

import { zCreateMeasurement, zTime, zPage, zLocation } from 'src/lib/types/ZodSchemas';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    try {
      /* parse parameters */
      const temperature_unit = parseTempUnit(
        z.string()
          .default("k")
          .parse(req.query.temperature_unit)
      );
      const conductivity_unit = parseCondUnit(
        z.string()
          .default("spm")
          .parse(req.query.conductivity_unit)
      );
      const { long, lat, rad, location_name } = zLocation.parse(req.query);
      const { start_date, end_date } = zTime.parse(req.query);
      let { page, page_size } = zPage.parse(req.query);
      const offset = (page - 1) * page_size;  // last row of previous page

      /* query the db based on parameters */
      let data: Array<Measurement.Measurement> = [];
      if (location_name && location_name !== 'Karlskrona') {
        const location = await Location.findByName({ name: location_name });
        if (location) {
          data = await Measurement.findByLocationId({
            location_id: location.id,
            startTime: new Date(start_date), endTime: new Date(end_date)
          });
        }
      }
      else if (long && lat && rad) {
        /* find all locations matching the geo-information, then get their measurements */
        const locations = await Location.findByGeo({ long, lat, rad });
        for (const { id } of locations) {
          const measurements = await Measurement.findByLocationId({
            location_id: id,
            startTime: new Date(start_date), endTime: new Date(end_date)
          });
          data = data.concat(measurements);
        }
      }
      else {
        data = await Measurement.findMany({ start_date, end_date });
      }

      /* apply pagination options */
      const row_count = data.length;
      const last_page = Math.ceil(row_count / page_size) || 1; /* if rows=0, still want last_page=1 */
      page = page > last_page ? last_page : page;
      const pagedData = data.slice(offset, offset + page_size);

      /* convert necessary sensors (or just round) to selected unit */
      pagedData.forEach(({ sensors }) => {
        if (sensors.hasOwnProperty("temperature")) {
          // @ts-ignore - this validation is apparently not enough to keep TS happy :(
          sensors.temperature = temperature_unit.fromKelvin(sensors.temperature);
        }
        if (sensors.hasOwnProperty("conductivity")) {
          // @ts-ignore - this validation is apparently not enough to keep TS happy :(
          sensors.conductivity = conductivity_unit.fromSiemensPerMeter(sensors.conductivity);
        }
        if (sensors.hasOwnProperty("ph")) {
          // @ts-ignore - this validation is apparently not enough to keep TS happy :(
          sensors.ph = new PH(sensors.ph).getValue();
        }
      });

      /* Returning the locations with STATUS.OK response code */
      res.status(STATUS.OK).json({
        pagination: {
          page,
          page_size: page_size,
          last_page: last_page,
          total_rows: row_count,
          has_previous_page: page > 1,
          has_next_page: page < last_page
        },
        units: {
          time: "UTC",
          temperature_unit: temperature_unit.symbol,
          conductivity_unit: conductivity_unit.symbols[0]
        },
        data: pagedData
      });
    }

    catch (e) {
      if (e instanceof ZodError) {
        console.log("Error parsing query params:\n", e.flatten());
        res.status(STATUS.BAD_REQUEST)
          .json(e.flatten());
      }
      else {
        console.error(e);
        res.status(STATUS.SERVER_ERROR).json({ error: "Internal server error" });
      }
    }
  }

  else if (req.method === "POST") {
    try {
      /* parse request body */
      const { timestamp, location, sensors } = zCreateMeasurement.parse(req.body);

      /* find location in the table from the lat,long specified */
      const [closest_location] = await Location.findByGeo({ long: location.long, lat: location.lat });
      let location_id: number;
      if (closest_location) {
        location_id = closest_location.id;
      }
      else {
        /* create a new location whose name could be filled in later, useful when on boat? */
        const DEFAULT_RADIUS = 200;
        location_id = await Location.createOne({
          name: 'unknown',
          long: location.long,
          lat: location.lat,
          rad: DEFAULT_RADIUS
        });
      }

      let insertedData = [];
      let errors: Array<{ id: number, status: string }> = [];
      for (const { sensor_id, value, unit } of sensors) {
        try {
          /* find associated sensor by the id to get its type */
          const sensor = await Sensor.findById({ id: sensor_id });
          if (!sensor) {
            errors.push({ id: sensor_id, status: "sensor_not_found" });
          }

          /* convert the value to SI-unit if there is one */
          let convertedValue = value;
          if (sensor.type === 'temperature') {
            convertedValue = parseTemperature(value, unit || 'k').asKelvin();
          }
          else if (sensor.type === 'conductivity') {
            convertedValue = parseConductivity(value, unit || 'spm').asSiemensPerMeter();
          }
          else if (sensor.type === 'ph') {
            convertedValue = new PH(value).getValue();
          }

          /* insert measurement into db */
          await Measurement.createOne({
            sensor_id: sensor_id,
            value: convertedValue,
            time: timestamp,
            sensor_type: sensor.type,
            location_id: location_id,
            position: location
          });

          /* push to response array */
          insertedData.push({ sensor_id, value, time: timestamp });
        }
        catch (e) {
          if (e instanceof ZodError) {
            errors.push({ id: sensor_id, status: e.issues[0].code });
          }
          else if (e instanceof Object && e.hasOwnProperty('code')) {
            // @ts-ignore - error is from MySQL
            errors.push({ id: sensor_id, value, status: e.code });
          }
        }
      }

      /* update sensor health status */
      for (const { id, status } of errors) {
        await Sensor.updateStatus({ id, status });
      }
      for (let i = 0; i < insertedData.length; i++) {
        await Sensor.updateStatus({ id: insertedData[i].sensor_id, status: 'ok' });
      }

      /* Returning the location with STATUS.CREATED response code */
      res.status(STATUS.CREATED).json({ errors, inserted_data: insertedData });
    }

    catch (e) {
      if (e instanceof ZodError) {
        console.log("Error parsing request body:\n", e.flatten());
        res.status(STATUS.BAD_REQUEST)
          .json(e.flatten());
      }
      // @ts-ignore - mysql errors throws errors which has property code
      else if (e.hasOwnProperty('code') && e.code === 'ER_DUP_ENTRY') {
        console.error(e);
        res.status(STATUS.BAD_REQUEST)
          .json({
            error: "Unable to upload the given measurement. A sensor can only upload a single measurement for a given time and " +
              "such measurement already exists."
          });
      }
      else {
        console.error(e);
        res.status(STATUS.SERVER_ERROR)
          .json({
            error: "Internal server error"
          });
      }
    }
  }

  else {
    console.log(`${req.method}: /api/private/aggregate-daily:: Method not allowed`);
    res.setHeader('Allow', 'POST, GET')
      .status(STATUS.NOT_ALLOWED)
      .json({ error: `Method '${req.method}' not allowed.` });
    return;
  }
};

export default handler;
