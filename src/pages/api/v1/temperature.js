// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
//This file will be responsible for querying only the the temperature and the date columns.
import mysql from "mysql2/promise"
import { ZodError } from "zod";

import { getConnectionPool } from "src/lib/database/connection";

import {
    STATUS_OK,
    STATUS_BAD_REQUEST,
    STATUS_METHOD_NOT_ALLOWED,
    STATUS_SERVER_ERROR
} from "src/lib/httpStatusCodes";
import { parseUnit } from "src/lib/units/temperature";

export default async function handler(req, res){
    // Only allow GET-requests for this endpoint. I do not know how to test this
    if (req.method !== "GET") {
        console.log(`Error: Method ${req.method} not allowed.`)
        res.status(STATUS_METHOD_NOT_ALLOWED)        // 405: method not allowed
            .json({ error:
                    `Method ${req.method} is not allowed for this endpoint. Please read the documentation on how to query the endpoint.`
            });
        return;
    }

    try {
        const unit = parseUnit(req.query.unit || 'k');

        const connection = await getConnectionPool();
        const query = mysql.format(`
            SELECT
                temperature, date, ST_Y(position) as longitude, ST_X(position) as latitude
            FROM Data 
            WHERE temperature IS NOT NULL;
        `);
        const [data] = await connection.query(query);

        for (const row of data) {
            row.temperature = unit.fromKelvin(row.temperature);
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


  