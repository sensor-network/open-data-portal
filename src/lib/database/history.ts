import { getConnectionPool } from "./connection";
import mysql, { RowDataPacket, OkPacket } from "mysql2/promise";

export type CombinedFormat = {
  type: string;
  time: Date;
  min: number | null;
  avg: number | null;
  max: number | null;
};

export const createOne = async ({
  date,
  sensorType,
  locationId,
}: {
  date: Date;
  sensorType: string;
  locationId: number;
}) => {
  const connection = await getConnectionPool();

  const getMinAvgMax = await connection.query(
    `
    SELECT 
      MIN(value) AS min, AVG(value) AS avg, MAX(value) AS max 
    FROM measurement 
    WHERE date(time) = ? 
      AND location_id = ? 
      AND type = ?
  `,
    [date, locationId, sensorType]
  );
  const rows = getMinAvgMax[0] as RowDataPacket[];
  const { min, avg, max } = rows[0];

  if (min === null || avg === null || max === null) {
    return null;
  }

  const result = await connection.query(
    `
      INSERT INTO history
          (date, location_id, type, daily_min, daily_avg, daily_max)
      VALUES (?, ?, ?, ?, ?, ?)
  `,
    [date, locationId, sensorType, min, avg, max]
  );
  const okPacket = result[0] as OkPacket;
  return okPacket.insertId;
};

/* query for getting data formatted the same way for history and measurement table */
export const findInCombinedFormat = async ({
  startDate,
  endDate,
  locationId,
  sortOrder = "ASC",
}: {
  startDate: Date;
  endDate: Date;
  locationId: number;
  sortOrder?: string;
}) => {
  /* if locationId = -1 we select all, else select with id */
  let query: string;
  if (locationId > 0) {
    query = mysql.format(
      `
        SELECT type, daily_avg as avg, date as time, daily_min as min, daily_max as max
        FROM history
        WHERE location_id = ?
          AND date BETWEEN ? AND ?
        ORDER BY date ${sortOrder}
    `,
      [locationId, startDate, endDate]
    );
  } else {
    query = mysql.format(
      `
        SELECT type, daily_avg as avg, date as time, daily_min as min, daily_max as max
        FROM history
        WHERE date BETWEEN ? AND ?
        ORDER BY date ${sortOrder}
    `,
      [startDate, endDate]
    );
  }
  const connection = await getConnectionPool();
  const result = await connection.query(query);
  return result[0] as CombinedFormat[];
};

export const findMany = async ({
  startDate,
  endDate,
  locationId,
  sortOrder = "ASC",
}: {
  startDate: Date;
  endDate: Date;
  locationId: number;
  sortOrder?: string;
}) => {
  const connection = await getConnectionPool();
  const result = await connection.query(
    `
      SELECT *
      FROM history
      WHERE date BETWEEN ? AND ?
        AND location_id = ?
      ORDER BY date ${sortOrder}
  `,
    [startDate, endDate, locationId]
  );
  return result[0] as RowDataPacket[];
};

export const findByFilter = async ({
  date,
  sensorType,
  locationId,
  sortOrder = "ASC",
}: {
  date: Date;
  sensorType: string;
  locationId: number;
  sortOrder?: string;
}) => {
  const connection = await getConnectionPool();
  const result = await connection.query(
    `
      SELECT *
      FROM history
      WHERE date = ?
        AND location_id = ?
        AND type = ?
      ORDER BY date ${sortOrder}
  `,
    [date, locationId, sensorType]
  );
  return result[0] as RowDataPacket[];
};
