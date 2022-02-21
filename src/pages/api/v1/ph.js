import mysql from 'mysql2/promise';

const NOT_ALLOWED = 405;

export default async function handler(req, res) {
    // Only allow GET-requests
    if (req.method !== "GET") {
        console.log(`Error: Method ${req.method} not allowed.`)
        res.status(NOT_ALLOWED)
            .json({ error:
                `Method ${req.method} is not allowed for this endpoint. Please read the documentation on how to query the endpoint.`
        });
        return;
    }
    try {
      // Connecting to database
      const connection = await mysql.createConnection({
        host     : process.env.NEXT_PUBLIC_DB_HOST,
        user     : process.env.NEXT_PUBLIC_DB_USER,
        password : process.env.NEXT_PUBLIC_DB_PASSWORD,
        database : process.env.NEXT_PUBLIC_DB_DATABASE,
        ssl      : {"rejectUnauthorized":true},
        timezone : "+00:00"
    });
        await connection.connect();

        // Creates and executes the query and then closes the connection
        const query = mysql.format('SELECT pH, date FROM Data WHERE pH IS NOT NULL;');
        const [data] = await connection.execute(query);
        connection.destroy();

        // Returning the data
        res.status(200).json({content: data});
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error fetching pH data from the database" })
    }
}