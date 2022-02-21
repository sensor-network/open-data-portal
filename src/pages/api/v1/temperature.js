// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
//This file will be responsible for querying only the the temperature and the date columns.
import mysql from "mysql2/promise"
import { temperatureFromKelvin } from "../../../lib/conversions/convertTemperature.js"

export default async function handler(req, res){
  
  // Only allow GET-requests for this endpoint. I do not know how to test this
  if (req.method !== "GET") {
    console.log(`Error: Method ${req.method} not allowed.`)
    res.status(405)        // 405: method not allowed
        .json({ error:
            `Method ${req.method} is not allowed for this endpoint. Please read the documentation on how to query the endpoint.`
    });
    return;
}

  try{

    //Connecting to the database
    const connection = await mysql.createConnection({
      host     : process.env.NEXT_PUBLIC_DB_HOST,
      user     : process.env.NEXT_PUBLIC_DB_USER,
      password : process.env.NEXT_PUBLIC_DB_PASSWORD,
      database : process.env.NEXT_PUBLIC_DB_DATABASE,
      ssl      : {"rejectUnauthorized":true},
      timezone : "+00:00"
    });

    await connection.connect();
    
    //Specifying mySQL query
    const query = "SELECT temperature, date FROM Data WHERE temperature IS NOT NULL;";

    //Executing the query
    const [data] = await connection.execute(query);
    
    //Disconnecting from the database
    connection.destroy();

    let unit = req.query.unit;
    if(!unit){
      unit = 'K'
    }
    try{
      //Checks if the unit is not kelvin.
      if(!(unit === 'k' || unit === 'K')){
        for(const objIndex in data){
          data[objIndex].temperature = temperatureFromKelvin(data[objIndex].temperature, unit);
        }
      }
    }
    //If the unit is not C, K or F
    catch(e){
      console.error(e);
      res.status(400).json({error: e.message});
    }

    res.status(200).json(data);
  }
  catch(e) {
    console.error(e);
    res.status(500).json({ error: "Error fetching data from the database" });
  }
}


  