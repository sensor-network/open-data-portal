import { getConnectionPool } from "./connection";
import { RowDataPacket, OkPacket } from 'mysql2/promise';

export const createOne = async (
  { name, firmware, type }: { name?: string, firmware?: string, type: string },
) => {
  if (!name) {
    name = "";
  }
  if (!firmware) {
    firmware = "";
  }
  const connection = await getConnectionPool();
  const [result] = await connection.execute(`
      INSERT INTO sensor (name, firmware, type)
      VALUES (?, ?, ?)
  `, [name, firmware, type]);
  return <OkPacket>result;
};

export const findById = async (
  { id }: { id: number }
) => {
  const connection = await getConnectionPool();
  const [result] = await connection.execute(`
      SELECT *
      FROM sensor
      WHERE id = ?
  `, [id]);
  return (<RowDataPacket>result)[0];
};

export const findByType = async (
  { type }: { type: string }
) => {
  const connection = await getConnectionPool();
  const [result] = await connection.execute(`
      SELECT *
      FROM sensor
      WHERE type = ?
  `, [type]);
  return <RowDataPacket[]>result;
};

export const findAll = async () => {
  const connection = await getConnectionPool();
  const [result] = await connection.execute(`
      SELECT *
      FROM sensor
  `);
  return <RowDataPacket[]>result;
};

export const updateFirmware = async (
  { id, firmware }: { id: number, firmware: string }
) => {
  const connection = await getConnectionPool();
  const [result] = await connection.execute(`
      UPDATE sensor
      SET firmware = ?
      WHERE id = ?
  `, [firmware, id]);
  return <OkPacket>result;
};