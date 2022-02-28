// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import mysql from 'mysql2/promise';

import { getConnectionPool } from "src/lib/database";

import { temperatureFromKelvin } from "../../../lib/conversions/convertTemperature.js";
import { conductivityFromSpm } from "../../../lib/conversions/convertConductivity.js";
import { ConversionError } from "../../../lib/CustomErrors";

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
        // Connecting to database
        const connection = await getConnectionPool();

        // Creates and executes the query and then closes the connection
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
        `);
        const [data] = await connection.query(query);
    
        let unit = req.query.tempunit || 'K';   // fallback to `Kelvin` if not specified
        if(unit.toUpperCase() !== 'K'){
            for(const obj of data){
              if(!(obj.temperature === null)){
                obj.temperature = temperatureFromKelvin(obj.temperature, unit);
              }
            }
        }

        let conductunit = req.query.conductunit || 'spm';   // fallback to `Siemens per metre` if not specified
        if(!(conductunit === 'spm' || conductunit === 'Spm' || conductunit === 'mhopm' || conductunit === 'Mhopm' )){
            for(const obj of data){
                if(!(obj.conductivity === null)){
                obj.conductivity = conductivityFromSpm(obj.conductivity, conductunit);
              }
            }
        }

        res.status(STATUS_OK).json(data);
    }
    catch(e) {
        if (e instanceof ConversionError) {     // Errors from converting
            console.error(e);
            res.status(STATUS_BAD_REQUEST).json({ error: e.message });
        }
        else {      // Other unknown errors
            console.error(e);
            res.status(STATUS_SERVER_ERROR).json({error: "Error fetching data from the database"});
        }
    }
}
