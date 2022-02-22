import mysql from "mysql2/promise"
import {z, ZodError} from "zod";

const STATUS_OK = 200
const STATUS_BAD_REQUEST = 400
const STATUS_SERVER_ERROR = 500

const QuerySchema = z.object({
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
}).strict();

export default async function (req, res) {
  try {
    // Establish database connection and connect
    const connection = await mysql.createConnection({
        host     : process.env.NEXT_PUBLIC_DB_HOST,
        user     : process.env.NEXT_PUBLIC_DB_USER,
        password : process.env.NEXT_PUBLIC_DB_PASSWORD,
        database : process.env.NEXT_PUBLIC_DB_DATABASE,
        ssl      : {"rejectUnauthorized":true},
        timezone : "+00:00"
    });
    await connection.connect();

    //query parameters
    const SRID = 4326 //default spatial reference system
    // Try parsing params using Zod schema
    const params = QuerySchema.parse(req.query);
    
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
      ORDER BY 
        ST_Distance_Sphere(position, ST_GeomFromText('POINT(? ?)', ?, 'axis-order=long-lat')) ASC;
    `, 
      [
        params.long, params.lat, SRID,
        params.long, params.lat, SRID, params.rad,
        params.long, params.lat, SRID
      ]
    ); 

    // Execute the query
    const [data] = await connection.execute(query);

    // Close connection to the database
    connection.destroy();

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

