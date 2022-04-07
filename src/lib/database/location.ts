import { getConnectionPool } from "./connection";
import { RowDataPacket, OkPacket } from 'mysql2/promise';

const SRID = 4326;

export type Location = {
  id: number,
  name: string,
  position: {
    lat: number,
    long: number
  },
  radius_meters: number,
}

export const createOne = async (
  { name, lat, long, rad }: { name: string; lat: number; long: number; rad: number },
) => {
  const connection = await getConnectionPool();
  const [result] = await connection.query(`
      INSERT INTO location
          (name, radius_meters, position)
      VALUES (?, ?, ST_GeomFromText('POINT(? ?)', ?))
  `, [name, rad, lat, long, SRID]);
  return (<OkPacket>result).insertId;
};

export const findMany = async () => {
  const connection = await getConnectionPool();
  const [result] = await connection.query(`
      SELECT id,
             name,
             radius_meters,
             JSON_OBJECT(
                     'lat', ST_X(position),
                     'long', ST_Y(position)
                 ) as position
      FROM location
  `);

  return <RowDataPacket[]>result as Array<Location>;
};

export const findById = async ({ id }: { id: number }) => {
  const connection = await getConnectionPool();
  const [result] = await connection.query(`
      SELECT id,
             name,
             radius_meters,
             JSON_OBJECT(
                     'lat', ST_X(position),
                     'long', ST_Y(position)
                 ) as position
      FROM location
      WHERE id = ?
  `, [id]);
  const rows = <RowDataPacket[]>result;
  console.assert(rows.length <= 1, 'Found multiple locations with the same name');
  return rows[0] as Location;
};

export const findByName = async ({ name }: { name: string }) => {
  const connection = await getConnectionPool();
  const [result] = await connection.query(`
      SELECT id,
             name,
             radius_meters,
             JSON_OBJECT(
                     'lat', ST_X(position),
                     'long', ST_Y(position)
                 ) as position
      FROM location
      WHERE name = ?
  `, [name]);
  const rows = <RowDataPacket[]>result;
  console.assert(rows.length <= 1, 'Found multiple locations with the same name');
  return rows[0] as Location;
};


export const findByGeo = async (
  { lat, long, rad }: { lat: number; long: number, rad: number }
) => {
  const connection = await getConnectionPool();
  const [result] = await connection.query(`
      SELECT id,
             name,
             radius_meters,
             JSON_OBJECT(
                     'lat', ST_X(position),
                     'long', ST_Y(position)
                 ) as position
      FROM location
      WHERE ST_Distance_Sphere(position, ST_GeomFromText('POINT(? ?)', ?)) <= ?
  `, [lat, long, SRID, rad]);

  return <RowDataPacket[]>result as Array<Location>;
};