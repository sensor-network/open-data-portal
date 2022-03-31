import type { NextApiRequest, NextApiResponse } from "next";
import { z, ZodError } from "zod";
import mysql, { RowDataPacket } from 'mysql2/promise';

import { getConnectionPool } from "lib/database/connection";
import { ISOStringToSQLTimestamp } from "lib/units/convertTimestamp";
import { sensorDataAsSI } from "lib/units/convertSensors";
import {
  STATUS_BAD_REQUEST,
  STATUS_CREATED,
  STATUS_FORBIDDEN,
  STATUS_METHOD_NOT_ALLOWED,
  STATUS_SERVER_ERROR
} from "lib/httpStatusCodes";

// Incoming requests must follow this schema
const Measurement = z.object({
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
type Measurement = z.infer<typeof Measurement>;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Only allow POST-requests for this endpoint.
  if (req.method !== "POST") {
    console.log(`ERROR: Method ${req.method} not allowed.`);
    res.status(STATUS_METHOD_NOT_ALLOWED)
      .json({
        error:
          `Method ${req.method} is not allowed for this endpoint. Please read the documentation on how to query the endpoint.`
      });
    return;
  }

  if (!(req.body instanceof Array || req.body instanceof Object)) {
    console.log(`ERROR: Invalid type of JSON-body. Expected Array or Object but got ${typeof req.body}`);
    res.status(STATUS_BAD_REQUEST)
      .json({ error: `Invalid type of JSON-body. Expected Array or Object but got ${typeof req.body}` });
    return;
  }

  // Basic authorization of predefined API keys. Some more sophisticated authorization may be done in the future.
  const api_key = req.query.api_key;
  if (!api_key) {
    console.log("ERROR: You have to provide an api_key as query parameter.");
    res.status(STATUS_FORBIDDEN).json({ error: "No API key provided." });
    return;
  }
  if (api_key !== process.env.NEXT_PUBLIC_API_KEY) {
    console.log("ERROR: The provided api_key could not be verified.");
    res.status(STATUS_FORBIDDEN).json({ error: "The provided API key could not be verified." });
    return;
  }

  try {
    const connection = await getConnectionPool();
    const SRID = 4326; // For GeoLocation in DB

    const parseAndConvertInput = (measurement: Measurement) => {
      const requestInput = Measurement.parse(measurement);
      return {
        ...requestInput,
        sensors: sensorDataAsSI(requestInput.sensors)
      };
    };
    const queryDb = async (uploadObject: any) => {
      const query = mysql.format(`
                  INSERT INTO Data (date,
                                    position,
                                    pH,
                                    temperature,
                                    conductivity)
                  VALUES (?,
                          ST_GeomFromText('POINT(? ?)', ?),
                          ?,
                          ?,
                          ?)`,
        [
          uploadObject.timestamp,
          uploadObject.latitude, uploadObject.longitude, SRID,
          uploadObject.sensors.ph_level ?? null,
          uploadObject.sensors.temperature ?? null,
          uploadObject.sensors.conductivity ?? null
        ]
      );
      const [result] = await connection.query(query);
      return (<RowDataPacket>result).insertId;
    };

    if (Array.isArray(req.body)) {
      let measurements = [];
      for (const measurement of req.body) {
        const uploadObject = parseAndConvertInput(measurement);
        const insertId = await queryDb(uploadObject);
        measurements.push({ id: insertId, ...uploadObject });
      }
      res.status(STATUS_CREATED).json(measurements);
      return;
    }

    const uploadObject = parseAndConvertInput(req.body);
    const insertId = await queryDb(uploadObject);
    res.status(STATUS_CREATED).json({
      id: insertId,
      ...uploadObject
    });
  }
  catch (e) {
    if (e instanceof ZodError) {
      /*
       * e.issues can have path: ['sensors', '<ph_level>']. Want to remove the path
       * 'sensors' so that the inner-path '<ph_level>' is shown, for better error messages
       */
      e.issues.forEach(issue => {
        issue.path = issue.path.filter((path: string | number) => path !== 'sensors');
      });
      console.log("ERROR: Could not parse request json:\n", e.flatten());
      res.status(STATUS_BAD_REQUEST)
        .json(e.flatten());
    }
    else {
      console.error(e);
      res.status(STATUS_SERVER_ERROR)
        .json({ error: "Error uploading data" });
    }
  }
};

export default handler;
