// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
//This file will be responsible for querying only the the temperature and the date columns.
import mysql from "mysql2/promise"
import moment from "moment"

import { getConnectionPool } from "src/lib/database";

import {
    STATUS_OK,
    STATUS_BAD_REQUEST,
    STATUS_METHOD_NOT_ALLOWED,
    STATUS_SERVER_ERROR
} from "src/lib/httpStatusCodes";

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

    const startDate = moment(req.query.startDate, 'YYYY-MM-DD', true);
    const endDate = moment(req.query.endDate, 'YYYY-MM-DD', true);

    if (startDate.isValid() !== true || endDate.isValid() !== true){
        res.status(STATUS_BAD_REQUEST).json({error: "Invalid parameters. Please, read the documentation for valid parameters"})
        return;
    }
    if (startDate.isAfter(endDate)){
        res.status(STATUS_BAD_REQUEST).json({error: "Start date can't be after End date!"})
        return;
    }

    try {
        //Connecting to the database
        const connection = await getConnectionPool();

        //Specifying mySQL query
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
                    WHERE
                        date(date) >= ? AND date(date) <= ?
                    ORDER BY
                        date;
            `,
            [
                startDate.format("YYYY-MM-DD"),
                endDate.format("YYYY-MM-DD")
            ]);

        //console.log(query);

        //Executing the query
        const [data] = await connection.query(query);

        res.status(STATUS_OK).json(data);
    }
    catch(e) {
        console.error(e);
        res.status(STATUS_SERVER_ERROR).json({ error: "Error fetching data from the database" });
    }
}