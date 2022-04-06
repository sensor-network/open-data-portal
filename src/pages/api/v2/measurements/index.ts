import { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from "zod";

import * as Measurement from "src/lib/database/measurement";
import * as Sensor from "src/lib/database/sensor";
import { HTTP_STATUS as STATUS } from "src/lib/httpStatusCodes";
import { parseUnit as parseTempUnit } from "src/lib/units/temperature";
import { parseUnit as parseCondUnit } from "src/lib/units/conductivity";

import { zCreateSensorData, zTime } from 'src/lib/types/ZodSchemas';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    try {
      /* parse parameters */
      const temperatureUnit = parseTempUnit(
        z.string().default("k")
          .parse(req.query.temperature_unit)
      );
      const conductivityUnit = parseCondUnit(
        z.string()
          .default("spm")
          .parse(req.query.conductivity_unit)
      );

      const data = await Measurement.findByLocationName({
        locationName: 'Hästö',
        startTime: new Date('2022-01-05'), endTime: new Date('2022-01-07')
      });

      const jsonParsed = data.map(d => {
        const s = JSON.parse(d.sensors);
        if (s.hasOwnProperty("temperature")) {
          s.temperature = temperatureUnit.fromKelvin(s.temperature);
        }
        if (s.hasOwnProperty("conductivity")) {
          s.conductivity = conductivityUnit.fromSiemensPerMeter(s.conductivity);
        }
        if (s.hasOwnProperty("ph")) {
          s.ph = Math.round(s.ph * 1E2) / 1E2;
        }
        return {
          ...d,
          sensors: s
        };
      });

      /* Returning the locations with STATUS.OK response code */
      res.status(STATUS.OK).json(jsonParsed);
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
      const { timestamp, sensors } = zCreateSensorData.parse(req.body);

      let insertedData = [];
      for (const { sensor_id, value, unit } of sensors) {
        /* find associated sensor by the id to get its type */
        const sensor = await Sensor.findById({ id: sensor_id });

        /* convert the value to SI-unit if there is one */
        let convertedValue = value;
        if (sensor.type === 'temperature') {
          convertedValue = parseTempUnit(unit || 'k').toKelvin(value);
        }
        else if (sensor.type === 'conductivity') {
          convertedValue = parseCondUnit(unit || 'spm').toSiemensPerMeter(value);
        }

        /* insert sensor data into db */
        await Measurement.createOne({
          sensorId: sensor_id,
          value: convertedValue,
          time: timestamp
        });

        /* push to response array */
        insertedData.push({ sensor_id, value, time: timestamp });
      }

      /* Returning the location with STATUS.CREATED response code */
      res.status(STATUS.CREATED).json(insertedData);
    }

    catch (e) {
      if (e instanceof ZodError) {
        console.log("Error parsing request body:\n", e.flatten());
        res.status(STATUS.BAD_REQUEST)
          .json(e.flatten());
      }
      else {
        console.error(e);
        res.status(STATUS.SERVER_ERROR).json({ error: "Internal server error" });
      }
    }
  }
};

export default handler;
