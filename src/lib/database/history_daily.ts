import { getConnectionPool } from 'lib/database/connection';
import { RowDataPacket, OkPacket } from 'mysql2/promise';

export type Options = {
  date: string,
  sensorType: string,
  locationId: number,
}

export const createOne = async ({ date, sensorType, locationId }: Options) => {
  const connection = await getConnectionPool();
  const [result] = await connection.query(`
      INSERT INTO history_daily
          (date, sensor_type, location_id, daily_min, daily_avg, daily_max)
      VALUES (?, ?, ?,
              (SELECT MIN(${sensorType}) FROM Data WHERE date(Data.date) = ?),
              (SELECT AVG(${sensorType}) FROM Data WHERE date(Data.date) = ?),
              (SELECT MAX(${sensorType}) FROM Data WHERE date(Data.date) = ?))
  `, [
    date, sensorType, locationId,
    date,
    date,
    date
  ]);
  return (<OkPacket>result).insertId;
};

export const findMany = async ({ date, sensorType, locationId }: Options) => {
  const connection = await getConnectionPool();
  const [result] = await connection.query(`
      SELECT *
      FROM history_daily
      WHERE date = ?
        AND sensor_type = ?
        AND location_id = ?;
  `, [date, sensorType, locationId]);
  return <RowDataPacket[]>result;
};