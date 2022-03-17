import { getConnectionPool } from "../database";
const SRID = 4326;

export const createOne = async (instance) => {
    const connection = await getConnectionPool();
    const [ result ] = await connection.query(`
        INSERT INTO Data (
            date,
            position,
            pH,
            temperature,
            conductivity
        ) VALUES (
            ?,
            ST_GeomFromText('POINT(? ?)', ?),
            ?,
            ?,
            ?
        )`, [
        instance.timestamp,
        instance.latitude, instance.longitude, SRID,
        instance.sensors.ph_level ?? null,
        instance.sensors.temperature ?? null,
        instance.sensors.conductivity ?? null
    ]);
    return result.insertId;
}