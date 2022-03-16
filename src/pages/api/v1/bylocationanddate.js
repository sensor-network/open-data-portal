import mysql from "mysql2/promise"
import {z, ZodError} from "zod";
import moment from "moment"

import { getConnectionPool } from "src/lib/database";

import {
  STATUS_OK,
  STATUS_BAD_REQUEST,
  STATUS_SERVER_ERROR
} from "src/lib/httpStatusCodes";

const LocationParams = z.object({
    lat: z.preprocess(   // preprocess converts the string-query to a number
        lat => Number(z.string().parse(lat)),   // validates the string could be parsed as number
        z.number().gte(-90).lte(90)  // then validate the number is in valid range
    ),
    long: z.preprocess(
        long => Number(z.string().parse(long)),
        z.number().gte(-180).lte(180)
    ),

    rad: z.preprocess(
        rad => Number(z.string().default("200").parse(rad)),
        z.number().positive()
    )
});

const TimeParams = z.object({
  start_date: z.string().default('2022Z' /* new year 2022 */)
      .refine(str => new Date(str).getTime() > 0, 'Unable to parse string as Date')
      .refine(str => new Date(str) >= new Date('2022Z'), 'must be after 2022')
      .transform(str => new Date(str).toISOString()),
  end_date: z.string().default(new Date().toISOString() /* current time */)
      .refine(str => new Date(str).getTime() > 0, 'Unable to parse string as Date')
      .refine(str => new Date(str) <= new Date(), "can't be in the future")
      .transform(str => new Date(str).toISOString()),
}).refine(({start_date, end_date}) => end_date >= start_date, 'end_date must be before start_date');

const PageParams = z.object({
  page: z.preprocess(
      page => Number(z.string().default("1").parse(page)),
      z.number().positive()
  ),
  page_size: z.preprocess(
      page_size => Number(z.string().default("100").parse(page_size)),
      z.number().positive()
  ),
})

 
export default async function (req, res) {
  try {
    // Establish database connection and connect
    const connection = await getConnectionPool();

    //query parameters
    const SRID = 4326 //default spatial reference system

    // Try parsing params using Zod schema
    const {long, lat, rad} = LocationParams.parse(req.query); //location specifics
    const {start_date, end_date} = TimeParams.parse(req.query); //date interval

    let { page, page_size } = PageParams.parse(req.query); //page number and page size
    const [rows] = await connection.query('SELECT count(*) FROM Data');
    const last_page = Math.ceil(rows / page_size);
    if (page > last_page) page = last_page;
    const offset = (page - 1) * page_size;

    
    // Prepare the query
    const query = mysql.format(`
      SELECT 
        id,
        pH,
        temperature,
        conductivity,
        date,
        ST_Y(position) as longitude,
        ST_X(position) as latitude,
        ST_Distance_Sphere(position, ST_GeomFromText('POINT(? ?)', ?, 'axis-order=long-lat')) as 'distance in meters'
      FROM 
        Data 
      WHERE 
        ST_Distance_Sphere(position, ST_GeomFromText('POINT(? ?)', ?, 'axis-order=long-lat')) < ?
      AND
        date(date) >= ? AND date(date) <= ?
      ORDER BY 
        Date
      Limit 
        ?, ?
    `, 
      [
        long, lat, SRID,
        long, lat, SRID, rad,
        start_date, end_date,
        offset, page_size
      ]
    ); 

    // Execute the query
    const [data] = await connection.query(query);

    // Respond with appropriate status code and json
    res.status(STATUS_OK).json({content: data});
  }

  catch (e) {
      if (e instanceof ZodError) {
          console.log("Error parsing query params:\n", e.flatten())
          res.status(STATUS_BAD_REQUEST)
              .json(e.flatten());
      }
      else {
          console.error(e)
          res.status(STATUS_SERVER_ERROR).json({error: "Internal server error"})
      }
  }
} 

