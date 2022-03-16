// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import mysql from 'mysql2/promise';
import { ZodError } from "zod";

import { getConnectionPool } from "src/lib/database";
import { parseUnit as parseTempUnit } from "src/lib/units/temperature";
import { parseUnit as parseCondUnit } from "src/lib/units/conductivity";
import {
    STATUS_OK,
    STATUS_BAD_REQUEST,
    STATUS_METHOD_NOT_ALLOWED,
    STATUS_SERVER_ERROR
} from "src/lib/httpStatusCodes";

export default async function handler(req, res) {
    // Only allow GET-requests
    if (req.method !== "GET") {
        console.log(`Error: Method ${req.method} not allowed.`)
        res.status(STATUS_METHOD_NOT_ALLOWED)
            .json({ error:
                `Method ${req.method} is not allowed for this endpoint. Please read the documentation on how to query the endpoint.`
        });
        return;
    }
    try {
        const tempUnit = parseTempUnit(req.query.tempunit || 'k');
        const condUnit = parseCondUnit(req.query.conductunit || 'spm');

        const connection = await getConnectionPool();
        const query = mysql.format(`
            SELECT
                id,
                pH,
                temperature,
                conductivity,
                date,
                ST_Y(position) as longitude,
                ST_X(position) as latitude
            FROM
                Data
            ORDER BY date
        `);
        const [data] = await connection.query(query);

        for (const row of data) {
            if (row.temperature !== null) {
                row.temperature = tempUnit.fromKelvin(row.temperature);
            }
             if (row.conductivity !== null) {
                  row.conductivity = condUnit.fromSiemensPerMeter(row.conductivity);
            }
        }

        res.status(STATUS_OK).json(data);
    }
    catch(e) {
        if (e instanceof ZodError) {
            console.log("ERROR: Could not parse query parameters:\n", e.flatten())
            res.status(STATUS_BAD_REQUEST)
                .json(e.flatten());
        }
        else {
            console.error(e);
            res.status(STATUS_SERVER_ERROR).json({error: "Error fetching data from the database"});
        }
    }
}
