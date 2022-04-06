import { getConnectionPool } from "./connection";
import { RowDataPacket, OkPacket } from 'mysql2/promise';

const SRID = 4326;

export type Location = {
  name: string,
  position: {
    lat: number,
    lng: number
  },
  radius: number,
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
  const rows = <RowDataPacket[]>result;

  return rows.map(row => ({
    name: row.name,
    radius: row.radius_meters,
    position: row.position,
  })) as Array<Location>;
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
  const rows = <RowDataPacket[]>result;
  console.assert(rows.length <= 1, 'Found multiple locations with the same name');
  return rows.length ? {
    name: rows[0].name,
    radius: rows[0].radius_meters,
    position: rows[0].position,
  } as Location : {};
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
  const rows = <RowDataPacket[]>result;

  return rows.map(row => ({
    name: row.name,
    radius: row.radius_meters,
    position: row.position,
  })) as Array<Location>;
};