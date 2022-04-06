import { getConnectionPool } from 'lib/database/connection';
import { OkPacket, RowDataPacket } from 'mysql2/promise';
import type { Sensor } from 'src/lib/database/sensor';

export type Station = {
  id: number,
  location_id: number,
}
export type ExtendedStation = Station & {
  location_name: string,
  sensors: Sensor[],
}

export const createOne = async (
  { sensor_id, location_id }: { sensor_id: number, location_id: number },
) => {
  const connection = await getConnectionPool();
  const [result] = await connection.query(`
      INSERT INTO station (sensor_id, location_id)
      VALUES (?, ?)
  `, [sensor_id, location_id]);
  return (<OkPacket>result).insertId;
};

export const findMany = async () => {
  const connection = await getConnectionPool();
  const [result] = await connection.query(`
      SELECT min(st.id) AS id,
             min(l.id)  AS location_id,
             l.name     AS location_name,
             CONCAT('[',
                    GROUP_CONCAT('{',
                                 CONCAT(
                                         '"id":', sn.id,
                                         ', "name":', JSON_QUOTE(sn.name),
                                         ', "firmware":', JSON_QUOTE(sn.firmware),
                                         ', "type":', JSON_QUOTE(sn.type)
                                     ),
                                 '}')
                 , ']')
                        AS sensors
      FROM station st
               JOIN sensor sn ON st.sensor_id = sn.id
               JOIN location l ON st.location_id = l.id
      GROUP BY l.name
  `);
  return (<RowDataPacket[]>result).map(row => ({
    ...row, sensors: JSON.parse(row.sensors)
  })) as Array<ExtendedStation>;
};

export const findByStationId = async (
  { station_id }: { station_id: number },
) => {
  const connection = await getConnectionPool();

  const [result] = await connection.query(`
      SELECT min(st.id) AS id,
             min(l.id)  AS location_id,
             l.name     AS location_name,
             CONCAT('[',
                    GROUP_CONCAT('{',
                                 CONCAT(
                                         '"id":', sn.id,
                                         ', "name":', JSON_QUOTE(sn.name),
                                         ', "firmware":', JSON_QUOTE(sn.firmware),
                                         ', "type":', JSON_QUOTE(sn.type)
                                     ),
                                 '}')
                 , ']')
                        AS sensors
      FROM station st
               JOIN sensor sn ON st.sensor_id = sn.id
               JOIN location l ON st.location_id = l.id
      WHERE st.id = ?
  `, [station_id]);
  console.log(result);
  return (<RowDataPacket[]>result).map(row => ({
    ...row, sensors: JSON.parse(row.sensors)
  })) as Array<ExtendedStation>;
};

export const findByLocationName = async (
  { location_name }: { location_name: string },
) => {
  const connection = await getConnectionPool();

  const [result] = await connection.query(`
      SELECT min(st.id) AS id,
             min(l.id)  AS location_id,
             l.name     AS location_name,
             CONCAT('[',
                    GROUP_CONCAT('{',
                                 CONCAT(
                                         '"id":', sn.id,
                                         ', "name":', JSON_QUOTE(sn.name),
                                         ', "firmware":', JSON_QUOTE(sn.firmware),
                                         ', "type":', JSON_QUOTE(sn.type)
                                     ),
                                 '}')
                 , ']')
                        AS sensors
      FROM station st
               JOIN sensor sn ON st.sensor_id = sn.id
               JOIN location l ON st.location_id = l.id
      WHERE l.name = ?
  `, [location_name]);
  return (<RowDataPacket[]>result).map(row => ({
    ...row, sensors: JSON.parse(row.sensors)
  })) as Array<ExtendedStation>;
};

export const findBySensorId = async (
  { sensor_id }: { sensor_id: number }
) => {
  const connection = await getConnectionPool();
  const [result] = await connection.execute(`
      SELECT min(st.id)  AS id,
             min(l.id)   AS location_id,
             min(l.name) AS location_name,
             CONCAT('[',
                    GROUP_CONCAT('{',
                                 CONCAT(
                                         '"id":', sn.id,
                                         ', "name":', JSON_QUOTE(sn.name),
                                         ', "firmware":', JSON_QUOTE(sn.firmware),
                                         ', "type":', JSON_QUOTE(sn.type)
                                     ),
                                 '}')
                 , ']')
                         AS sensors
      FROM station st
               JOIN sensor sn ON st.sensor_id = sn.id
               JOIN location l ON st.location_id = l.id
      WHERE sn.id = ?
  `, [sensor_id]);
  return (<RowDataPacket[]>result).map(row => ({
    ...row, sensors: JSON.parse(row.sensors)
  })) as Array<ExtendedStation>;
};

export const updateLocation = async (
  { id, location_id }: { id: number, location_id: number },
) => {
  const connection = await getConnectionPool();
  const [result] = await connection.query(`
      UPDATE station
      SET location_id = ?
      WHERE id = ?
  `, [location_id, id]);
  return <OkPacket>result;
};