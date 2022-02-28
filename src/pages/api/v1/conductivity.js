import mysql from 'mysql2/promise'
import { z, ZodError} from "zod";

import { getConnectionPool } from "src/lib/database";

import {ConversionError} from "../../../lib/CustomErrors";
import {conductivityFromSpm} from "../../../lib/conversions/convertConductivity";

import {
    STATUS_OK,
    STATUS_BAD_REQUEST,
    STATUS_METHOD_NOT_ALLOWED,
    STATUS_SERVER_ERROR
} from "src/lib/httpStatusCodes";

const QuerySchema = z.object({
    unit: z.enum([
        "Spm", "S/m", "mho/m", "mhopm", "mS/m", "mSpm", "uS/m", "uSpm",
        "S/cm", "Spcm", "mho/cm", "mhopcm", "mS/cm", "mSpcm", "uS/cm", "uSpcm", "ppm", "PPM"
    ]).optional().default("Spm")
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
        const connection = await getConnectionPool();

        // Prepare query, then execute
        const query = mysql.format(`
            SELECT date, conductivity
            FROM Data
            WHERE conductivity IS NOT NULL
            ORDER BY id ASC;
        `);
        const [data] = await connection.query(query);

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