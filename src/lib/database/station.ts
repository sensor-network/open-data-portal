import { getConnectionPool } from 'lib/database/connection';
import { OkPacket, RowDataPacket } from 'mysql2/promise';

export const createOne = async (
  { sensor_id, location_id }: { sensor_id: number, location_id: string },
) => {
  const connection = await getConnectionPool();
  const [result] = await connection.query(`
      INSERT INTO station (sensor_id, location_id)
      VALUES (?, ?)
  `, [sensor_id, location_id]);
  return <OkPacket>result;
};

export const findMany = async () => {
  const connection = await getConnectionPool();
  const [result] = await connection.query(`
      SELECT station.id,
             station.location_id,
             location.name AS location_name,
             JSON_OBJECT(
                     'id', sensor.id,
                     'name', sensor.name,
                     'firmware', sensor.firmware,
                     'type', sensor.type
                 )         as sensor
      FROM station
               JOIN sensor ON station.sensor_id = sensor.id
               JOIN location ON station.location_id = location.id
  `);
  const rows = <RowDataPacket[]>result;
  const sensors = rows.map(row => row.sensor);
  return {
    id: rows[0].id,
    location_id: rows[0].location_id,
    locationName: rows[0].location_name,
    sensors,
  };
};

export const findById = async (
  { id }: { id: number },
) => {
  const connection = await getConnectionPool();

  const [result] = await connection.query(`
      SELECT DISTINCT station.id,
                      station.location_name,
                      JSON_OBJECT(
                              'id', sensor.id,
                              'name', sensor.name,
                              'firmware', sensor.firmware,
                              'type', sensor.type
                          ) as sensor
      FROM station
               INNER JOIN sensor ON station.sensor_id = sensor.id
      WHERE station.id = ?;
  `, [id]);
  const rows = <RowDataPacket[]>result;
  const sensors = rows.map(row => row.sensor);
  return {
    id: rows[0].id,
    locationName: rows[0].location_name,
    sensors,
  };
};

export const findByLocationName = async (
  { location_id }: { location_id: number },
) => {
  const connection = await getConnectionPool();

  const [result] = await connection.query(`
      SELECT DISTINCT station.id,
                      station.location_id,
                      JSON_OBJECT(
                              'id', sensor.id,
                              'name', sensor.name,
                              'firmware', sensor.firmware,
                              'type', sensor.type
                          ) as sensor
      FROM station
               INNER JOIN sensor ON station.sensor_id = sensor.id
      WHERE station.location_id = ?;
  `, [location_id]);
  const rows = <RowDataPacket[]>result;
  console.log(rows);
  const sensors = rows.map(row => row.sensor);
  return {
    id: rows[0].id,
    locationName: rows[0].location_name,
    sensors,
  };
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