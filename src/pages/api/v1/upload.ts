import type { NextApiRequest, NextApiResponse } from "next";
import { z, ZodError } from "zod";

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
    }).strict()
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

    try {
        const requestInput = Request.parse(req.body);   // validate input

        res.status(201)     // 201: created
            .json(requestInput);
    }
    catch (e) {
        if (e instanceof ZodError) {
            console.log("Error parsing request json:\n", e.flatten())
            res.status(400)
                .json(e.flatten());
        }
        else {
            console.error(e);
            res.status(500)     // 500: internal server error
                .json({error: "Error uploading data"});
        }
    }
}