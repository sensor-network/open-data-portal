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
        // Connecting to database
        const connection = await getConnectionPool();

        // Creates and executes the query

        const params = req.query

        const query = (params.name==null) ? 
        mysql.format(`
        SELECT 
            name, 
            radius, ST_Y(position) as longitude, 
            ST_X(position) as latitude 
        FROM 
            Locations
        WHERE 
            name = name;`)
        : 
        mysql.format(`
        SELECT
            radius, 
            ST_Y(position) as longitude, 
            ST_X(position) as latitude 
        FROM 
            Locations 
        WHERE 
            name = ?;`,
        [params.name]);
        
        
        console.log(query)

        const [data] = await connection.query(query);

        // Returning the data
        res.status(STATUS_OK).json({content: data});
        
    } catch (error) {
        console.log(error);
        res.status(STATUS_SERVER_ERROR).json({ error: "Error fetching location data from the database" })
    }
}
