import mysql from 'mysql2/promise'
import { ZodError } from "zod";

import { getConnectionPool } from "src/lib/database";
import { parseUnit } from "src/lib/units/conductivity";

import {
    STATUS_OK,
    STATUS_BAD_REQUEST,
    STATUS_METHOD_NOT_ALLOWED,
    STATUS_SERVER_ERROR
} from "src/lib/httpStatusCodes";

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
        const unit = parseUnit(req.query.unit || 'spm');

        const connection = await getConnectionPool();
        const query = mysql.format(`
            SELECT date, conductivity, ST_Y(position) as longitude, ST_X(position) as latitude 
            FROM Data
            WHERE conductivity IS NOT NULL
            ORDER BY id;
        `);
        const [data] = await connection.query(query);

        for (const row of data) {
            row.conductivity = unit.fromKelvin(row.conductivity);
        }

        res.status(STATUS_OK).json(data);
    }
    catch(e) {
        if (e instanceof ZodError) {
            console.log("Error parsing query params:\n", e.flatten())
            res.status(STATUS_BAD_REQUEST)
                .json(e.flatten());
        }
        else {
            console.error(e);
            res.status(STATUS_SERVER_ERROR)
                .json({error: "Error fetching data"});
        }
    }
}