import { getConnectionPool } from "./connection";
import { RowDataPacket } from "mysql2";

export const findMany = async () => {
  const connection = await getConnectionPool();
  const [locations] = await connection.query(`
      SELECT *
      FROM Locations
  `);
  return <RowDataPacket[]>locations;
};

export const findByName = async (name: string) => {
  const connection = await getConnectionPool();
  const [result] = await connection.query(`
      SELECT id
      FROM locations
      WHERE name = ?
  `, [name]);
  return (<RowDataPacket[]>result)[0];
};