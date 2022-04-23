import { OkPacket, RowDataPacket } from 'mysql2/promise';
import { getConnectionPool } from 'src/lib//database/connection';
import type { CombinedFormat } from 'src/lib/database/history';
import mysql from 'mysql2/promise';
import { SRID } from 'src/lib/constants';

export type Measurement = {
  locationName: string,
  position: { lat: number, long: number },
  time: Date,
  sensors: {
    [key: string]: number,
  }
}

/* query for getting data formatted the same way for history and measurement table */
export const findInCombinedFormat = async (
  {
    startTime,
    endTime,
    locationId,
    sortOrder = "ASC"
  }: { startTime: Date | string, endTime: Date | string, locationId: number, sortOrder?: string }
) => {
  /* if locationId = -1 we select all, else select with id */
  let query: string;
  if (locationId < 0) {
    query = mysql.format(`
        SELECT type, value as avg, time, value as min, value as max
        FROM measurement
        WHERE time BETWEEN ? AND ?
          AND location_id = ?
        ORDER BY time ${sortOrder};
    `, [startTime, endTime, locationId]);
  }
  else {
    query = mysql.format(`
        SELECT type, value as avg, time, value as min, value as max
        FROM measurement
        WHERE time BETWEEN ? AND ?
        ORDER BY time ${sortOrder};
    `, [startTime, endTime]);
  }
  const connection = await getConnectionPool();
  const result = await connection.query(query);
  return result[0] as CombinedFormat[];
};

export const createOne = async (
  {
    sensorId,
    value,
    time,
    sensorType,
    locationId,
    position,
  }: { sensorId: number, value: number, time: Date | string, sensorType: string, locationId: number, position: { lat: number, long: number }, sortOrder?: string },
) => {
  const connection = await getConnectionPool();
  const result = await connection.query(`
      INSERT INTO measurement (sensor_id, value, time, type, location_id, position)
      VALUES (?, ?, ?, ?, ?, ST_GeomFromText('POINT(? ?)', 4326))
  `, [
    sensorId, value, time, sensorType, locationId, position.lat, position.long
  ]);
  return result[0] as OkPacket;
};

/**
 * FIXME: this query should probably be looked over in the future and be simplified
 * The goal is to reformat the RowDataPackets into an array of Measurements
 **/
const selectQuery = `
    SELECT l.name     AS locationName,
           JSON_OBJECT(
                   'lat', ST_X(m.position),
                   'long', ST_Y(m.position)
               )      AS position,
           m.time,
           CONCAT('{',
                  GROUP_CONCAT(CONCAT(JSON_QUOTE(m.type), ':', m.value) SEPARATOR ',')
               , '}') AS sensors
    FROM measurement m
             INNER JOIN location l
                        ON l.id = m.location_id`;

export const findMany = async (
  { startTime, endTime, sortOrder = "ASC" }: { startTime: Date | string, endTime: Date | string, sortOrder?: string },
) => {
  const query = mysql.format(selectQuery + `
      WHERE m.time BETWEEN ? AND ?
      GROUP BY m.time, l.position, l.name, m.position
      ORDER BY m.time ${sortOrder}
  `, [startTime, endTime]);

  const connection = await getConnectionPool();
  const result = await connection.query(query);
  const rows = result[0] as RowDataPacket[];

  return rows.map(row => ({
    ...row,
    sensors: JSON.parse(row.sensors), /* sensors are a json-string, parse them into a proper array */
  })) as Measurement[];
};

export const findByLocationIds = async (
  { locationIds, startTime, endTime, sortOrder = "ASC" }:
    { locationIds: number[], startTime: Date | string, endTime: Date | string, sortOrder?: string },
) => {
  const query = mysql.format(selectQuery + `
      WHERE m.time BETWEEN ? AND ?
        AND m.location_id IN (?)
      GROUP BY m.time, m.position, l.name
      ORDER BY m.time ${sortOrder};
  `, [
    startTime, endTime,
    locationIds,
  ]);

  const connection = await getConnectionPool();
  const result = await connection.query(query);
  const rows = result[0] as RowDataPacket[];

  return rows.map(row => ({
    ...row,
    sensors: JSON.parse(row.sensors),
  })) as Measurement[];
};

export const findByLatLong = async (
  { lat, long, rad, startTime, endTime, sortOrder = "ASC" }:
    { lat: number, long: number, rad: number, startTime: Date | string, endTime: Date | string, sortOrder?: string },
) => {

  const query = mysql.format(selectQuery + `
      WHERE m.time BETWEEN ? AND ?
        AND ST_Distance_Sphere(m.position, ST_GeomFromText('POINT(? ?)', ?)) <= ?
      GROUP BY m.time, m.position, l.name
      ORDER BY m.time ${sortOrder};
  `, [
    startTime, endTime,
    lat, long, SRID, rad,
  ]);

  const connection = await getConnectionPool();
  const result = await connection.query(query);
  const rows = result[0] as RowDataPacket[];

  return rows.map(row => ({
    ...row,
    sensors: JSON.parse(row.sensors),
  })) as Measurement[];
};
