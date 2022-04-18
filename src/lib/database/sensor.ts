import { getConnectionPool } from "./connection";
import { RowDataPacket, OkPacket } from 'mysql2/promise';

export type Sensor = {
  id: number,
  name: string,
  firmware: string,
  type: string,
  status?: string,
  lastActive?: Date
}

export const createOne = async (
  { name, firmware, type }: { name: string | null, firmware: string | null, type: string },
) => {
  const connection = await getConnectionPool();
  const [result, _]: [result: OkPacket, _: any] = await connection.query(`
      INSERT INTO sensor (name, firmware, type)
      VALUES (?, ?, ?)
  `, [name, firmware, type]);
  return result.insertId;
};

export const findById = async (
  { id, includeStatus = false }: { id: number, includeStatus?: boolean },
) => {
  const connection = await getConnectionPool();
  const query = includeStatus
    ? `
              SELECT id, name, firmware, type, status, last_active AS lastActive
              FROM sensor
              WHERE id = ?
    `
    : `
              SELECT id, name, firmware, type
              FROM sensor
              WHERE id = ?
    `;
  const [result, _]: [result: RowDataPacket[], _: any] = await connection.query(query, [id]);
  return result[0] as Sensor;
};

export const findByName = async (
  { name, includeStatus = false }: { name: string, includeStatus?: boolean }
) => {
  const connection = await getConnectionPool();
  const query = includeStatus
    ? `
              SELECT id, name, firmware, type, status, last_active AS lastActive
              FROM sensor
              WHERE name = ?
    `
    : `
              SELECT id, name, firmware, type
              FROM sensor
              WHERE name = ?
    `;
  const [result, _]: [result: RowDataPacket[], _: any] = await connection.query(query, [name]);
  return result as Sensor[];
};

export const findByType = async (
  { type, includeStatus = false }: { type: string, includeStatus?: boolean }
) => {
  const connection = await getConnectionPool();
  const query = includeStatus
    ? `
              SELECT id, name, firmware, type, status, last_active AS lastActive
              FROM sensor
              WHERE type = ?
    `
    : `
              SELECT id, name, firmware, type
              FROM sensor
              WHERE type = ?
    `;
  const [result, _]: [result: RowDataPacket[], _: any] = await connection.query(query, [type]);
  return result as Sensor[];
};

export const findMany = async (
  { includeStatus = false }: { includeStatus?: boolean }
) => {
  const connection = await getConnectionPool();
  const query = includeStatus
    ? `
              SELECT id, name, firmware, type, status, last_active AS lastActive
              FROM sensor
    `
    : `
              SELECT id, name, firmware, type
              FROM sensor
    `;
  const [result, _]: [result: RowDataPacket[], _: any] = await connection.query(query);
  return result as Sensor[];
};

export const updateFirmware = async (
  { id, firmware }: { id: number, firmware: string }
) => {
  const connection = await getConnectionPool();
  const [result, _]: [result: OkPacket, _: any] = await connection.query(`
      UPDATE sensor
      SET firmware = ?
      WHERE id = ?
  `, [firmware, id]);
  return result;
};

export const updateName = async (
  { id, name }: { id: number, name: string }
) => {
  const connection = await getConnectionPool();
  const [result, _]: [result: OkPacket, _: any] = await connection.query(`
      UPDATE sensor
      SET name = ?
      WHERE id = ?
  `, [name, id]);
  return result;
};

export const updateStatus = async (
  { id, status }: { id: number, status: string }
) => {
  const connection = await getConnectionPool();
  const [result, _]: [result: OkPacket, _: any] = await connection.query(`
      UPDATE sensor
      SET status      = ?,
          last_active = NOW()
      WHERE id = ?
  `, [status, id]);
  return result;
};


export const findAllTypes = async () => {
  const connection = await getConnectionPool();
  const [result, _]: [result: RowDataPacket[], _: any] = await connection.query(`
      SELECT DISTINCT type
      FROM sensor
  `);
  return result.map(row => row.type) as string[];
};