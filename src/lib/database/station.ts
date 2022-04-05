import { getConnectionPool } from 'lib/database/connection';
import { OkPacket, RowDataPacket } from 'mysql2/promise';

export const createOne = async (
  { sensorId, locationName }: { sensorId: number, locationName: string },
) => {
  const connection = await getConnectionPool();
  const [result] = await connection.query(`
      INSERT INTO station (sensor_id, location_name)
      VALUES (?, ?)
  `, [sensorId, locationName]);
  return <OkPacket>result;
};

export const findById = async (
  { id }: { id: number }
) => {
  const connection = await getConnectionPool();
  const [result] = await connection.execute(`
      SELECT *
      FROM station
      WHERE id = ?
  `, [id]);
  return (<RowDataPacket[]>result)[0];
};

export const findBySensorId = async (
  { sensorId }: { sensorId: number }
) => {
  const connection = await getConnectionPool();
  const [result] = await connection.execute(`
      SELECT *
      FROM station
      WHERE sensor_id = ?
  `, [sensorId]);
  return <RowDataPacket[]>result;
};

export const updateLocation = async (
  { id, locationName }: { id: number, locationName: string },
) => {
  const connection = await getConnectionPool();
  const [result] = await connection.query(`
      UPDATE station
      SET location_name = ?
      WHERE id = ?
  `, [locationName, id]);
  return <OkPacket>result;
};