import { getConnectionPool } from "./connection";
import mysql, { RowDataPacket, OkPacket } from 'mysql2/promise';

const SRID = 4326;

export type Location = {
  id: number,
  name: string,
  position: {
    lat: number,
    long: number
  },
  radiusMeters: number,
}

export const createOne = async (
  { name, lat, long, rad }: { name: string; lat: number; long: number; rad: number },
) => {
  const connection = await getConnectionPool();
  const [result, _]: [result: OkPacket, _: any] = await connection.query(`
      INSERT INTO location
          (name, radius_meters, position)
      VALUES (?, ?, ST_GeomFromText('POINT(? ?)', ?))
  `, [name, rad, long, lat, SRID]);
  return result.insertId;
};

export const findMany = async () => {
  const connection = await getConnectionPool();
  const [result, _]: [result: RowDataPacket[], _: any] = await connection.query(`
      SELECT id,
             name,
             radius_meters AS radiusMeters,
             JSON_OBJECT(
                     'lat', ST_X(position),
                     'long', ST_Y(position)
                 )         AS position
      FROM location
  `);

  return result as Location[];
};

export const findById = async ({ id }: { id: number }) => {
  const connection = await getConnectionPool();
  const [result, _]: [result: RowDataPacket[], _: any] = await connection.query(`
      SELECT id,
             name,
             radius_meters AS radiusMeters,
             JSON_OBJECT(
                     'lat', ST_X(position),
                     'long', ST_Y(position)
                 )         AS position
      FROM location
      WHERE id = ?
  `, [id]);
  return result[0] as Location;
};

export const findByName = async ({ name }: { name: string }) => {
  const connection = await getConnectionPool();
  const [result, _]: [result: RowDataPacket[], _: any] = await connection.query(`
      SELECT id,
             name,
             radius_meters AS radiusMeters,
             JSON_OBJECT(
                     'lat', ST_X(position),
                     'long', ST_Y(position)
                 )         AS position
      FROM location
      WHERE name = ?
  `, [name]);
  return result as Location[];
};


export const findByLatLong = async (
  { lat, long, rad }: { lat: number; long: number, rad: number | null }
) => {
  const connection = await getConnectionPool();
  // if rad is provided, use the provided radius, else inherit from db entry
  const query = rad
    ? mysql.format(`
              SELECT id,
                     name,
                     radius_meters AS radiusMeters,
                     JSON_OBJECT(
                             'lat', ST_X(position),
                             'long', ST_Y(position)
                         )         AS position
              FROM location
              WHERE ST_Distance_Sphere(position, ST_GeomFromText('POINT(? ?)', ?)) <= ?
              ORDER BY ST_Distance_Sphere(position, ST_GeomFromText('POINT(? ?)', ?))
    `, [
      lat, long, SRID, rad,
      lat, long, SRID,
    ])
    : mysql.format(`
              SELECT id,
                     name,
                     radius_meters AS radiusMeters,
                     JSON_OBJECT(
                             'lat', ST_X(position),
                             'long', ST_Y(position)
                         )         AS position
              FROM location
              WHERE ST_Distance_Sphere(position, ST_GeomFromText('POINT(? ?)', ?)) <= radius_meters
              ORDER BY ST_Distance_Sphere(position, ST_GeomFromText('POINT(? ?)', ?))
    `, [
      lat, long, SRID,
      lat, long, SRID,
    ]);
  const [result, _]: [result: RowDataPacket[], _: any] = await connection.query(query);

  return result as Location[];
};

export const updateName = async (
  { id, name }: { id: number, name: string },
) => {
  const connection = await getConnectionPool();
  const [result, _]: [result: OkPacket, _: any] = await connection.query(`
      UPDATE location
      SET name = ?
      WHERE id = ?
  `, [name, id]);
  return result;
};