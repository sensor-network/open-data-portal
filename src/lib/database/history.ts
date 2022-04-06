import { getConnectionPool } from 'lib/database/connection';
import { RowDataPacket, OkPacket } from 'mysql2/promise';

export const createOne = async (
  {
    date,
    sensor_type,
    location_id,
  }: { date: string | Date, sensor_type: string, location_id: number },
) => {
  const connection = await getConnectionPool();
  const [result] = await connection.query(`
      INSERT INTO history
          (date, type, location_id, daily_min, daily_avg, daily_max)
      VALUES (?, ?, ?,
              (SELECT MIN(value) FROM measurement WHERE date(time) = ? AND type = ? AND location_id = ?),
              (SELECT AVG(value) FROM measurement WHERE date(time) = ? AND type = ? AND location_id = ?),
              (SELECT MAX(value) FROM measurement WHERE date(time) = ? AND type = ? AND location_id = ?))
  `, [
    date, sensor_type, location_id,
    date, sensor_type, location_id,
    date, sensor_type, location_id,
    date, sensor_type, location_id,
  ]);
  return (<OkPacket>result).insertId;
};

export const findMany = async (
  {
    start_date,
    end_date,
    location_id
  }: { start_date: string | Date, end_date: string | Date, location_id: string },
) => {
  const connection = await getConnectionPool();
  const [result] = await connection.query(`
      SELECT *
      FROM history
      WHERE date BETWEEN ? AND ?
        AND location_id = ?
  `, [start_date, end_date, location_id]);
  return <RowDataPacket[]>result;
};

export const findByFilter = async (
  { date, sensor_type, location_id }: { date: string | Date, sensor_type: string, location_id: number },
) => {
  const connection = await getConnectionPool();
  const [result] = await connection.query(`
      SELECT *
      FROM history
      WHERE date = ?
        AND location_id = ?
        AND type = ?
  `, [date, location_id, sensor_type]);
  return <RowDataPacket[]>result;
};