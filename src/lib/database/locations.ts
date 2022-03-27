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