import type { NextApiRequest, NextApiResponse } from "next";
import { z, ZodError } from "zod";
import mysql from 'mysql2/promise';

import { timestampToUTC } from "src/lib/conversions/convertTimestamp";
import { sensorDataAsSI } from "src/lib/conversions/convertSensors";
import { ConversionError } from "src/lib/CustomErrors";

// Incoming requests must follow this schema
const Measurement = z.object({
    timestamp: z.string()
        .refine((str) => (
            new Date(str).getTime() / 1000 >= 0     // checks if string can be parsed as Date
        ), { message: "String could not be parsed as Date" }),
    UTC_offset: z.number().gte(-12).lte(14),    // UTC ranges from -12 to 14
    latitude: z.number().gte(-90).lte(90),      // lat ranges from +-90 deg
    longitude: z.number().gte(-180).lte(180),   // lng ranges from +-180 deg
    sensors: z.object({
        temperature: z.number().optional(),
        temperature_unit: z.enum(["C", "K", "F"]).optional(),   // Celsius, Kelvin, Fahrenheit
        ph_level: z.number().gte(0).lte(14).optional(),    // ph scale ranges from 0 to 14
        conductivity: z.number().optional(),
        conductivity_unit: z.enum(
            ["Spm", "S/m", "mho/m", "mhopm", "mS/m", "mSpm", "uS/m", "uSpm", "S/cm", "Spcm", "mho/cm", "mhopcm", "mS/cm", "mSpcm", "uS/cm", "uSpcm", "ppm", "PPM"]
        ).optional(),
    }).strict()
}).strict();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow POST-requests for this endpoint.
    if (req.method !== "POST") {
        console.log(`Error: Method ${req.method} not allowed.`)
        res.status(405)        // 405: method not allowed
            .json({ error:
                `Method ${req.method} is not allowed for this endpoint. Please read the documentation on how to query the endpoint.`
        });
        return;
    }

    try {
        if (!(req.body instanceof Array)) {
            console.log(`ERROR: Invalid type of JSON-body. Expected Array but got ${typeof req.body}`);
            res.status(400)
                .json({ error: `Invalid type of JSON-body. Expected Array but got ${typeof req.body}`});
            return;
        }

        // Basic authorization of predefined API keys. Some more sophisticated authorization may be done in the future.
        const api_key = req.query.api_key;
        if (!api_key) {
            console.log("ERROR: You have to provide an api_key as query parameter.");
            res.status(403).json({ error: "No API key provided." });
            return;
        }
        if (api_key !== process.env.NEXT_PUBLIC_API_KEY1 &&
            api_key !== process.env.NEXT_PUBLIC_API_KEY2 &&
            api_key !== process.env.NEXT_PUBLIC_API_KEY3 &&
            api_key !== process.env.NEXT_PUBLIC_API_KEY4 &&
            api_key !== process.env.NEXT_PUBLIC_API_KEY5
        ) {
            console.log("ERROR: The provided api_key could not be verified.");
            res.status(403).json({ error: "The provided API key could not be verified." });
            return;
        }

        // Establish connection to database
        const connection = await mysql.createConnection({
            host: process.env.NEXT_PUBLIC_DB_HOST,
            user: process.env.NEXT_PUBLIC_DB_USER,
            password: process.env.NEXT_PUBLIC_DB_PASSWORD,
            database: process.env.NEXT_PUBLIC_DB_DATABASE,
            ssl: {"rejectUnauthorized":true},
            timezone: "+00:00"
        });
        await connection.connect();

        // Iterate all the measurements, parse them using Zod and insert the data into the database
        let measurements = [];
        for (const measurement of req.body) {
            const requestInput = Measurement.parse(measurement);
            let responseObject = {
                timestamp: timestampToUTC(requestInput.timestamp, requestInput.UTC_offset),
                latitude: requestInput.latitude,
                longitude: requestInput.longitude,
                sensors: sensorDataAsSI(requestInput.sensors)
            }
            if (Object.keys(responseObject.sensors).length === 0) {
                throw new ZodError([{
                    code: 'too_small',
                    minimum: 1,
                    inclusive: true,
                    type: "array",
                    path: ["sensors"],
                    message: "Must contain at least one data-value. Did you specify only a unit?"
                }])
            }

            // Prepare SQL-query with correct parameters
            const SRID = 4326; // For GeoLocation in DB
            const query = mysql.format(`
                INSERT INTO Data (
                    date,
                    position,
                    pH,
                    temperature,
                    conductivity
                ) VALUES (
                    ?,
                    ST_GeomFromText('POINT(? ?)', ?),
                    ?,
                    ?,
                    ?
                )`, 
                [
                    responseObject.timestamp,
                    responseObject.latitude, responseObject.longitude, SRID,
                    responseObject.sensors.ph_level ?? null,
                    responseObject.sensors.temperature ?? null,
                    responseObject.sensors.conductivity ?? null
                ]
            );
            // Then execute the query asynchronously
            await connection.execute(query);
            measurements.push(responseObject);
        }

        // Close connection to the database
        connection.destroy();

        // Respond with the inserted data
        res.status(201)     // 201: created
            .json(measurements);
    }
    catch (e) {
        if (e instanceof ZodError) {
            console.log("Error parsing request json:\n", e.flatten())
            res.status(400)     // 400: bad request (syntax error)
                .json(e.flatten());
        }
        else if (e instanceof ConversionError) {    // custom error-class to separate faulty input data
            console.log("ERROR:", e.message)
            res.status(400)     // 400: bad request
                .json({error: e.message});
        }
        else {
            console.error(e);
            res.status(500)     // 500: internal server error
                .json({error: "Error uploading data"});
        }
    }
}