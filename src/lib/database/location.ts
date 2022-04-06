import { getConnectionPool } from "./connection";
import { RowDataPacket, OkPacket } from 'mysql2/promise';

const SRID = 4326;

export const createOne = async (
  { name, lat, long, rad }: { name: string; lat: number; long: number; rad: number },
) => {
  const connection = await getConnectionPool();
  const [result] = await connection.query(`
      INSERT INTO location
          (name, radius_meters, position)
      VALUES (?, ?, ST_GeomFromText('POINT(? ?)', ?))
  `, [name, rad, lat, long, SRID]);
  return <OkPacket>result;
};

export const findMany = async () => {
  const connection = await getConnectionPool();
  const [result] = await connection.query(`
      SELECT name,
             radius_meters,
             JSON_OBJECT(
                     'lat', ST_X(position),
                     'long', ST_Y(position)
                 ) as position
      FROM location
  `);
  return <RowDataPacket[]>result;
};

export const findByName = async ({ name }: { name: string }) => {
  const connection = await getConnectionPool();
  const [result] = await connection.query(`
      SELECT name,
             radius_meters,
             JSON_OBJECT(
                     'lat', ST_X(position),
                     'long', ST_Y(position)
                 ) as position
      FROM location
      WHERE name = ?
  `, [name]);
  return (<RowDataPacket[]>result)[0];
};


export const findByGeo = async (
  { lat, long, rad }: { lat: number; long: number, rad: number }
) => {
  const connection = await getConnectionPool();
  const [result] = await connection.query(`
      SELECT name,
             radius_meters,
             JSON_OBJECT(
                     'lat', ST_X(position),
                     'long', ST_Y(position)
                 ) as position
      FROM location
      WHERE ST_Distance_Sphere(position, ST_GeomFromText('POINT(? ?)', ?)) <= ?
  `, [lat, long, SRID, rad]);
  return <RowDataPacket[]>result;
};