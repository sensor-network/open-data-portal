import { getConnectionPool } from 'lib/database/connection';
import { RowDataPacket, OkPacket } from 'mysql2/promise';
import mysql from 'mysql2/promise';

export type CombinedFormat = {
  type: string,
  time: Date
  min: number,
  avg: number,
  max: number,
}

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
              (SELECT MIN(value) FROM measurement WHERE date(time) = ? AND location_id = ? AND type = ?),
              (SELECT AVG(value) FROM measurement WHERE date(time) = ? AND location_id = ? AND type = ?),
              (SELECT MAX(value) FROM measurement WHERE date(time) = ? AND location_id = ? AND type = ?))
  `, [
    date, location_id, sensor_type,
    date, location_id, sensor_type,
    date, location_id, sensor_type,
    date, location_id, sensor_type,
  ]);
  return (<OkPacket>result).insertId;
};

/* query for getting data formatted the same way for history and measurement table */
export const findInCombinedFormat = async (
  {
    start_date,
    end_date,
    location_id
  }: { start_date: Date | string, end_date: Date | string, location_id: number | null },
) => {
  /* if location_id specified select with it, else select all */
  const query = location_id ? mysql.format(`
              SELECT type, daily_avg as avg, date as time, daily_min as min, daily_max as max
              FROM history
              WHERE location_id = ?
                AND date BETWEEN ? AND ?
    `, [location_id, start_date, end_date]) :
    mysql.format(`
        SELECT type, daily_avg as avg, date as time, daily_min as min, daily_max as max
        FROM history
        WHERE date BETWEEN ? AND ?
    `, [start_date, end_date]);
  const connection = await getConnectionPool();
  const [result] = await connection.query(query);
  return <RowDataPacket[]>result as Array<CombinedFormat>;
};

export const findMany = async (
  {
    start_date,
    end_date,
    location_id
  }: { start_date: string | Date, end_date: string | Date, location_id: number },
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