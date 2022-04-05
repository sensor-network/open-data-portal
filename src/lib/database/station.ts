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
  { id, expandSensors = true }: { id: number, expandSensors: boolean },
) => {
  const connection = await getConnectionPool();
  const [result] = expandSensors ? await connection.query(`
              SELECT DISTINCT station.id  as station_id,
                              sensor.type as sensor_type
              FROM station
                       INNER JOIN sensor
              WHERE station.id = ?
    `, [id]) :
    await connection.execute(`
        SELECT *
        FROM station
        WHERE id = ?
    `, [id]);
  return (<RowDataPacket[]>result);
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