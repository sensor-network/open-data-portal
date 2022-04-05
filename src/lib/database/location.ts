import { getConnectionPool } from "./connection";
import { RowDataPacket, OkPacket } from 'mysql2/promise';

const SRID = 4326;

export const createOne = async (
  { name, lat, lng, rad }: { name: string; lat: number; lng: number; rad: number },
) => {
  const connection = await getConnectionPool();
  const [result] = await connection.query(`
      INSERT INTO location
          (name, radius, position)
      VALUES (?, ?, ST_GeomFromText('POINT(? ?)', ?))
  `, [name, rad, lat, lng, SRID]);
  return <OkPacket>result;
};

export const findMany = async () => {
  const connection = await getConnectionPool();
  const [result] = await connection.query(`
      SELECT *
      FROM location
  `);
  return <RowDataPacket[]>result;
};

export const findByName = async ({ name }: { name: string }) => {
  const connection = await getConnectionPool();
  const [result] = await connection.query(`
      SELECT *
      FROM location
      WHERE name = ?
  `, [name]);
  return (<RowDataPacket[]>result)[0];
};


export const findByGeo = async (
  { lat, lng, rad }: { lat: number; lng: number, rad: number }
) => {
  const connection = await getConnectionPool();
  const [result] = await connection.query(`
      SELECT *
      FROM location
      WHERE ST_Distance_Sphere(position, ST_GeomFromText('POINT(? ?)', ?)) <= ?
  `, [lat, lng, SRID, rad]);
  return <RowDataPacket[]>result;
};