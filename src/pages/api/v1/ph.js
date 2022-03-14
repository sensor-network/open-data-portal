import mysql from 'mysql2/promise';

import { getConnectionPool } from "src/lib/database";
import {
    STATUS_OK,
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
        const connection = await getConnectionPool();
        const query = mysql.format(`
            SELECT
                pH, date, ST_Y(position) as longitude, ST_X(position) as latitude
            FROM Data 
            WHERE pH IS NOT NULL;
        `);
        const [data] = await connection.query(query);

        res.status(STATUS_OK).json({content: data});
    }
    catch (error) {
        console.log(error);
        res.status(STATUS_SERVER_ERROR).json({ error: "Error fetching pH data from the database" })
    }
}
