import { createPool, Pool } from 'mysql2/promise';

let pool: Pool | undefined = undefined;

export async function getConnectionPool(): Promise<Pool> {
    /* returns a mysql connection pool */
    if (pool) {
        /* pool is created, return existing one */
        return pool;
    }

    pool = await createPool({
        host: process.env.NEXT_PUBLIC_DB_HOST,
        user: process.env.NEXT_PUBLIC_DB_USER,
        password: process.env.NEXT_PUBLIC_DB_PASSWORD,
        database: process.env.NEXT_PUBLIC_DB_DATABASE,
        timezone: "+00:00",
        connectionLimit: 100,
        // ssl      : {"rejectUnauthorized":true},
    });

    return pool;
}

export async function endConnection() : Promise<void> {
    /* closes down the pool connection if one exists */
    if (pool) await pool.end();
}
