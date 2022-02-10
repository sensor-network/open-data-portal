import type { NextApiRequest, NextApiResponse } from "next";
import { z, ZodError } from "zod";

import convertTimestamp from "lib/convertTimestamp";
import convertSensors from "lib/convertSensors";
import { ConversionError } from "lib/CustomErrors";

// Incoming requests must follow this schema
const Request = z.object({
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
        conductivity_unit: z.string().optional(),
    })
}).strict();

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow POST-requests for this endpoint.
    if (req.method !== "POST") {
        console.log(`Error: Method ${req.method} not allowed.`)
        res.status(405)        // 405: method not allowed
            .json({ error:
                `Method ${req.method} is not allowed for this endpoint. Please read the documentation on how to query the endpoint.`
        });
        return;
    }

    // TODO: Possibly check authorization?

    try {
        if (!(req.body instanceof Array)) {
            console.log(`ERROR: Invalid type of JSON-body. Expected Array but got ${typeof req.body}`);
            res.status(400)
                .json({ error: `Invalid type of JSON-body. Expected Array but got ${typeof req.body}`})
        }
        let measurements = [];
        for (const measurement of req.body) {
                const requestInput = Request.parse(measurement);
                let responseObject = {
                    timestamp: convertTimestamp(requestInput.timestamp, requestInput.UTC_offset),
                    latitude: requestInput.latitude,
                    longitude: requestInput.longitude,
                    sensors: convertSensors(requestInput.sensors)
                }
                measurements.push(responseObject);
        }
        //const requestInput = Request.parse(req.body);   // validate input
        
        // TODO: Convert input to SI units
        /*let responseObject = {
            timestamp: convertTimestamp(requestInput.timestamp, requestInput.UTC_offset),
            latitude: requestInput.latitude,
            longitude: requestInput.longitude,
            sensors: convertSensors(requestInput.sensors)
        }*/

        // TODO: Upload to database


        // Successfully respond to caller 
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