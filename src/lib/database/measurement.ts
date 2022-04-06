import { OkPacket, RowDataPacket } from 'mysql2/promise';
import { getConnectionPool } from 'src/lib//database/connection';
import type { CombinedFormat } from 'src/lib/database/history';
import mysql from 'mysql2/promise';

export type Measurement = {
  location_name: string,
  time: Date,
  sensors: Array<{
    [key: string]: number,
  }>
}

/* query for getting data formatted the same way for history and measurement table */
export const findInCombinedFormat = async (
  {
    start_time,
    end_time,
    location_id
  }: { start_time: Date | string, end_time: Date | string, location_id: number | null },
) => {
  /* if location_id specified select with it, else select all */
  const query = location_id ? mysql.format(`
              SELECT type, value as avg, time, value as min, value as max
              FROM measurement
              WHERE location_id = ?
                AND time BETWEEN ? AND ?
    `, [location_id, start_time, end_time]) :
    mysql.format(`
        SELECT type, value as avg, time, value as min, value as max
        FROM measurement
        WHERE time BETWEEN ? AND ?
    `, [start_time, end_time]);
  const connection = await getConnectionPool();
  const [result] = await connection.query(query);
  return <RowDataPacket[]>result as Array<CombinedFormat>;
};

export const createOne = async (
  {
    sensor_id,
    value,
    time,
    sensor_type,
    location_id
  }: { sensor_id: number, value: number, time: Date | string, sensor_type: string, location_id: number },
) => {
  const connection = await getConnectionPool();
  const [result] = await connection.query(`
      INSERT INTO measurement (sensor_id, value, time, type, location_id)
      VALUES (?, ?, ?, ?, ?)
  `, [sensor_id, value, time, sensor_type, location_id]);
  return <OkPacket>result;
};

export const findMany = async (
  { start_date, end_date }: { start_date: Date | string, end_date: Date | string },
) => {
  const connection = await getConnectionPool();
  console.time('db-call-all');
  const [result] = await connection.query(`
      select l.name     as location_name,
             l.position as position,
             m.time,
             CONCAT('{',
                    GROUP_CONCAT(CONCAT(JSON_QUOTE(m.type), ':', m.value) separator ',')
                 , '}') as sensors
      from measurement m
               INNER JOIN location l
                          ON l.id = m.location_id
                              AND m.time BETWEEN ? AND ?
      group by m.time, l.position, l.name
      order by m.time
  `, [start_date, end_date]);
  console.timeEnd('db-call-all');
  return (<RowDataPacket[]>result).map(row => ({
    ...row,
    sensors: JSON.parse(row.sensors),
  })) as Array<Measurement>;
};

export const findByLocationId = async (
  { location_id, startTime, endTime }:
    { location_id: number, startTime: Date | string, endTime: Date | string },
) => {
  const connection = await getConnectionPool();
  console.time('db-call-by-id');
  const [result] = await connection.query(`
      select l.name     as location_name,
             l.position as position,
             m.time,
             CONCAT('{',
                    GROUP_CONCAT(CONCAT(JSON_QUOTE(m.type), ':', m.value) separator ',')
                 , '}') as sensors
      from measurement m
               INNER JOIN location l
                          ON l.id = m.location_id
      where m.location_id = ?
        AND m.time BETWEEN ? AND ?
      group by m.time
      order by m.time;
  `, [
    location_id,
    startTime, endTime
  ]);
  console.timeEnd('db-call-by-id');
  return (<RowDataPacket[]>result).map(row => ({
    ...row,
    sensors: JSON.parse(row.sensors),
  })) as Array<Measurement>;
};
