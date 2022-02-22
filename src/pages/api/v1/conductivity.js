import mysql from 'mysql2/promise'
import { z, ZodError} from "zod";

import {ConversionError} from "../../../lib/CustomErrors";
import {conductivityFromSpm} from "../../../lib/conversions/convertConductivity";

const STATUS_OK = 200;
const STATUS_BAD_REQUEST = 400;
const STATUS_METHOD_NOT_ALLOWED = 405;
const STATUS_SERVER_ERROR = 500;

const QuerySchema = z.object({
    unit: z.enum(
        ["Spm", "S/m", "mho/m", "mhopm", "mS/m", "mSpm", "uS/m", "uSpm",
         "S/cm", "Spcm", "mho/cm", "mhopcm", "mS/cm", "mSpcm", "uS/cm", "uSpcm", "ppm", "PPM"]
    ).optional().default("Spm")
}).strict();

export default async function(req, res) {
    if (req.method !== "GET") {
        console.log(`Error: Method ${req.method} not allowed.`)
        res.status(STATUS_METHOD_NOT_ALLOWED)
            .json({ error:
                    `Method ${req.method} is not allowed for this endpoint. Please read the documentation on how to query the endpoint.`
            });
        return;
    }

    try {
        // Parse unit from query params.
        const { unit } = QuerySchema.parse(req.query);

        // Establish connection and connect to db
        const connection = await mysql.createConnection({
            host: process.env.NEXT_PUBLIC_DB_HOST,
            user     : process.env.NEXT_PUBLIC_DB_USER,
            password : process.env.NEXT_PUBLIC_DB_PASSWORD,
            database : process.env.NEXT_PUBLIC_DB_DATABASE,
            // ssl      : {"rejectUnauthorized":true},
            timezone : "+00:00"
        });
        await connection.connect();

        // Prepare query, then execute
        const query = mysql.format(`
            SELECT date, conductivity
            FROM Data
            WHERE conductivity IS NOT NULL
            ORDER BY id ASC;
        `);
        const [data] = await connection.execute(query);
        await connection.end();

        // Convert conductivity if needed (siemens per meter or moh per meter)
        if (!["Spm", "S/m", "mho/m", "mhopm"].includes(unit)) {
            for (const row of data) {
                row.conductivity = conductivityFromSpm(row.conductivity, unit);
            }
        }

        // Return data with success code
        res.status(STATUS_OK).json(data)
    }
    catch(e) {
        if (e instanceof ZodError) {
            console.log("Error parsing query params:\n", e.flatten())
            res.status(STATUS_BAD_REQUEST)
                .json(e.flatten());
        }
        else if (e instanceof ConversionError) {    // custom error-class to separate faulty input data
            console.log("ERROR:", e.message)
            res.status(STATUS_BAD_REQUEST)
                .json({error: e.message});
        }
        else {
            console.error(e);
            res.status(STATUS_SERVER_ERROR)
                .json({error: "Error fetching data"});
        }
    }
}