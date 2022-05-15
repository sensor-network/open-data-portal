import { getConnectionPool } from "./connection";
import mysql, { RowDataPacket, OkPacket } from "mysql2/promise";

export type Sensor = {
  id: number;
  name: string;
  firmware: string;
  type: string;
  status?: string;
  lastActive?: Date;
};

export const createOne = async ({
  name,
  firmware,
  type,
}: {
  name: string | null;
  firmware: string | null;
  type: string;
}) => {
  const connection = await getConnectionPool();
  const result = await connection.query(
    `
      INSERT INTO sensor (name, firmware, type)
      VALUES (?, ?, ?)
  `,
    [name, firmware, type]
  );
  const okPacket = result[0] as OkPacket;
  return okPacket.insertId;
};

export const findById = async ({
  id,
  includeStatus = false,
}: {
  id: number;
  includeStatus?: boolean;
}) => {
  let query: string;
  if (includeStatus) {
    query = mysql.format(
      `
        SELECT id, name, firmware, type, status, last_active AS lastActive
        FROM sensor
        WHERE id = ?
    `,
      [id]
    );
  } else {
    query = mysql.format(
      `
        SELECT id, name, firmware, type
        FROM sensor
        WHERE id = ?
    `,
      [id]
    );
  }
  const connection = await getConnectionPool();
  const result = await connection.query(query);
  const rows = result[0] as RowDataPacket[];
  return rows[0] as Sensor;
};

export const findByName = async ({
  name,
  includeStatus = false,
}: {
  name: string;
  includeStatus?: boolean;
}) => {
  let query: string;
  if (includeStatus) {
    query = mysql.format(
      `
        SELECT id, name, firmware, type, status, last_active AS lastActive
        FROM sensor
        WHERE name = ?
    `,
      [name]
    );
  } else {
    query = mysql.format(
      `
        SELECT id, name, firmware, type
        FROM sensor
        WHERE name = ?
    `,
      [name]
    );
  }
  const connection = await getConnectionPool();
  const result = await connection.query(query);
  return result[0] as Sensor[];
};

export const findByType = async ({
  type,
  includeStatus = false,
}: {
  type: string;
  includeStatus?: boolean;
}) => {
  let query: string;
  if (includeStatus) {
    query = mysql.format(
      `
        SELECT id, name, firmware, type, status, last_active AS lastActive
        FROM sensor
        WHERE type = ?
    `,
      [type]
    );
  } else {
    query = mysql.format(
      `
        SELECT id, name, firmware, type
        FROM sensor
        WHERE type = ?
    `,
      [type]
    );
  }
  const connection = await getConnectionPool();
  const result = await connection.query(query);
  return result[0] as Sensor[];
};

export const findMany = async ({
  includeStatus = false,
}: {
  includeStatus?: boolean;
}) => {
  let query: string;
  if (includeStatus) {
    query = `
        SELECT id, name, firmware, type, status, last_active AS lastActive
        FROM sensor
    `;
  } else {
    query = `
        SELECT id, name, firmware, type
        FROM sensor
    `;
  }
  const connection = await getConnectionPool();
  const result = await connection.query(query);
  return result[0] as Sensor[];
};

export const updateFirmware = async ({
  id,
  firmware,
}: {
  id: number;
  firmware: string;
}) => {
  const connection = await getConnectionPool();
  const result = await connection.query(
    `
      UPDATE sensor
      SET firmware = ?
      WHERE id = ?
  `,
    [firmware, id]
  );
  return result[0] as OkPacket;
};

export const updateName = async ({
  id,
  name,
}: {
  id: number;
  name: string;
}) => {
  const connection = await getConnectionPool();
  const result = await connection.query(
    `
      UPDATE sensor
      SET name = ?
      WHERE id = ?
  `,
    [name, id]
  );
  return result[0] as OkPacket;
};

export const updateStatus = async ({
  id,
  status,
}: {
  id: number;
  status: string;
}) => {
  const connection = await getConnectionPool();
  const result = await connection.query(
    `
      UPDATE sensor
      SET status      = ?,
          last_active = NOW()
      WHERE id = ?
  `,
    [status, id]
  );
  return result[0] as OkPacket;
};

export const findAllTypes = async () => {
  const connection = await getConnectionPool();
  const result = await connection.query(`
      SELECT DISTINCT type
      FROM sensor
  `);
  const rows = result[0] as RowDataPacket[];
  return rows.map((row) => row.type) as string[];
};
