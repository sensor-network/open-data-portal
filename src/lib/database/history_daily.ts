import { getConnectionPool } from 'lib/database/connection';
import { RowDataPacket, OkPacket } from 'mysql2/promise';


export const createOne = async (
  {
    date,
    sensor_type,
    location_name,
    min,
    max,
    avg
  }: { date: string | Date, sensor_type: string, location_name: string, min: number, max: number, avg: number },
) => {
  const connection = await getConnectionPool();
  const [result] = await connection.query(`
      INSERT INTO history
          (date, sensor_type, location_name, daily_min, daily_avg, daily_max)
      VALUES (?, ?, ?, ?, ?, ?)
  `, [
    date, sensor_type, location_name, min, avg, max
  ]);
  return (<OkPacket>result).insertId;
};

export const findMany = async (
  {
    start_date,
    end_date,
    location_name
  }: { start_date: string | Date, end_date: string | Date, location_name: string },
) => {
  const connection = await getConnectionPool();
  const [result] = await connection.query(`
      SELECT *
      FROM history
      WHERE date BETWEEN ? AND ?
        AND location_name = ?
  `, [start_date, end_date, location_name]);
  return <RowDataPacket[]>result;
};

export const findByFilter = async (
  { date, sensor_type, location_name }: { date: string | Date, sensor_type: string, location_name: string },
) => {
  const connection = await getConnectionPool();
  const [result] = await connection.query(`
      SELECT *
      FROM history
      WHERE date = ?
        AND location_name = ?
        AND sensor_type = ?
  `, [date, location_name, sensor_type]);
  return <RowDataPacket[]>result;
};