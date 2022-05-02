import { getConnectionPool } from "lib/database/connection";
import mysql, { OkPacket, RowDataPacket } from "mysql2/promise";
import type { Sensor } from "src/lib/database/sensor";
import type { Location } from "src/lib/database/location";

export type Station = {
  id: number;
  location: number | Location;
  sensors: number[] | Sensor[];
};

export const reformatSQLResult = (
  result: RowDataPacket[],
  expandLocation: boolean,
  expandSensors: boolean,
  includeSensorStatus?: boolean
): Station[] => {
  /**
   * Reformats the RowDataPacket[] => Station[]
   * Example input: [
   *   {id: 1, sensorId: 1, locationId: 1},
   *   {id: 1, sensorId: 2, locationId: 1},
   *   {id: 2, sensorId: 3, locationId: 2},
   *   {id: 2, sensorId: 4, locationId: 2},
   * ]
   * Converts into: [
   *   {id: 1, sensors: [1, 2], location: 1},
   *   {id: 2, sensors: [3, 4], location: 2},
   * ]
   * Note: sensors and location can be extended to include the full object:
   * { id: 1, ... }
   **/
  let stations: Station[] = [];
  /* use map between stationId and index in stations for instant lookup */
  const stationIdsMap: Map<number, number> = new Map();
  result.forEach((row) => {
    if (!stationIdsMap.has(row.stationId)) {
      /* initialize station if we haven't already (not in map) */
      const newLength = stations.push({
        id: row.stationId,
        location: expandLocation
          ? {
              id: row.locationId,
              name: row.locationName,
              position: {
                lat: row.position.y,
                lng: row.position.x,
              },
            }
          : row.locationId,
        sensors: [],
      });
      /* then add the station to the map, linking the station.id to the stations-index */
      stationIdsMap.set(row.stationId, newLength - 1);
    }

    /* add sensor to the correct station, either an existing one or the one we just created */
    const stationIdx = stationIdsMap.get(row.stationId);
    // @ts-ignore - by here we know stationId is in the map hence we can ignore the ts-warning
    stations[stationIdx].sensors.push(
      expandSensors
        ? {
            id: row.sensorId,
            name: row.sensorName,
            firmware: row.firmware,
            type: row.type,
          }
        : includeSensorStatus
        ? {
            id: row.sensorId,
            name: row.sensorName,
            firmware: row.firmware,
            type: row.type,
            status: row.status,
            lastActive: row.lastActive,
          }
        : row.sensorId
    );
  });
  return stations;
};

export const getNextId = async (): Promise<number> => {
  const connection = await getConnectionPool();
  const result = await connection.query(`
      SELECT max(id + 1) AS nextId
      FROM station
  `);
  /* 1 if empty, else next id */
  const rows = result[0] as RowDataPacket[];
  return rows[0].nextId ?? 1;
};

export const createOne = async ({
  stationId,
  sensorId,
  locationId,
}: {
  stationId: number;
  sensorId: number;
  locationId: number;
}) => {
  const connection = await getConnectionPool();
  const result = await connection.query(
    `
      INSERT INTO station (id, sensor_id, location_id)
      VALUES (?, ?, ?)
  `,
    [stationId, sensorId, locationId]
  );
  const okPacket = result[0] as OkPacket;
  return okPacket.insertId;
};

const selectQuery = (
  expandSensors: boolean,
  expandLocation: boolean,
  includeSensorStatus?: boolean
) => `
    SELECT st.id AS stationId,
           ${
             expandLocation
               ? "l.id AS locationId, l.name AS locationName, l.position"
               : "l.id AS locationId"
           },
           ${
             expandSensors
               ? "sn.id AS sensorId, sn.name AS sensorName, sn.firmware, sn.type"
               : includeSensorStatus
               ? "sn.id AS sensorId, sn.name AS sensorName, sn.firmware, sn.type, sn.status, sn.last_active as lastActive"
               : "sn.id AS sensorId"
           }
    FROM station st
             JOIN sensor sn ON st.sensor_id = sn.id
             JOIN location l ON st.location_id = l.id
`;

export const findMany = async ({
  expandLocation,
  expandSensors,
  includeSensorStatus = false,
}: {
  expandLocation: boolean;
  expandSensors: boolean;
  includeSensorStatus?: boolean;
}) => {
  const query = selectQuery(expandSensors, expandLocation, includeSensorStatus);

  const connection = await getConnectionPool();
  const result = await connection.query(query);
  const rows = result[0] as RowDataPacket[];

  return reformatSQLResult(
    rows,
    expandLocation,
    expandSensors,
    includeSensorStatus
  );
};

export const findByStationId = async ({
  stationId,
  expandSensors,
  expandLocation,
}: {
  stationId: number;
  expandSensors: boolean;
  expandLocation: boolean;
}) => {
  const query = mysql.format(
    selectQuery(expandSensors, expandLocation) +
      `
    WHERE st.id = ?
  `,
    [stationId]
  );

  const connection = await getConnectionPool();
  const result = await connection.query(query);
  const rows = result[0] as RowDataPacket[];

  const stations = reformatSQLResult(rows, expandLocation, expandSensors);
  return stations.length > 0 ? stations[0] : null;
};

export const findByLocationName = async ({
  locationName,
  expandLocation,
  expandSensors,
}: {
  locationName: string;
  expandLocation: boolean;
  expandSensors: boolean;
}) => {
  const query = mysql.format(
    selectQuery(expandSensors, expandLocation) +
      `
    WHERE l.name = ?
  `,
    [locationName]
  );

  const connection = await getConnectionPool();
  const result = await connection.query(query);
  const rows = result[0] as RowDataPacket[];

  return reformatSQLResult(rows, expandLocation, expandSensors);
};

export const findBySensorId = async ({
  sensorId,
  expandLocation,
  expandSensors,
}: {
  sensorId: number;
  expandLocation: boolean;
  expandSensors: boolean;
}) => {
  const connection = await getConnectionPool();
  /* find the station id of the station containing the sensor */
  const stationResult = await connection.query(
    `
      SELECT id
      FROM station
      WHERE sensor_id = ?
  `,
    [sensorId]
  );
  const stationIds = stationResult[0] as RowDataPacket[];
  if (!stationIds.length) {
    return null;
  }

  /* then get the data for that station */
  const query = mysql.format(
    selectQuery(expandSensors, expandLocation) +
      `
    WHERE st.id = ?
  `,
    [stationIds[0].id]
  );
  const result = await connection.query(query);
  const rows = result[0] as RowDataPacket[];

  /* and return the result after reformatting */
  const stations = reformatSQLResult(rows, expandLocation, expandSensors);
  return stations.length > 0 ? stations[0] : null;
};

export const findBySensorType = async ({
  sensorType,
  expandLocation,
  expandSensors,
}: {
  sensorType: string;
  expandLocation: boolean;
  expandSensors: boolean;
}) => {
  const connection = await getConnectionPool();
  /* find the station id of the station containing sensors of given type */
  const stationResult = await connection.query(
    `
      SELECT st.id
      FROM station st
               JOIN sensor sn on st.sensor_id = sn.id
      WHERE sn.type = ?
  `,
    [sensorType]
  );
  const stationIds = stationResult[0] as RowDataPacket[];

  /* then get the data for that station */
  const query = mysql.format(
    selectQuery(expandSensors, expandLocation) +
      `
    WHERE st.id IN (?)
  `,
    [stationIds.map((row) => row.id)]
  );
  const result = await connection.query(query);
  const rows = result[0] as RowDataPacket[];

  /* and return the result after reformatting */
  return reformatSQLResult(rows, expandLocation, expandSensors);
};

export const updateLocation = async ({
  id,
  locationId,
}: {
  id: number;
  locationId: number;
}) => {
  const connection = await getConnectionPool();
  const result = await connection.query(
    `
      UPDATE station
      SET location_id = ?
      WHERE id = ?
  `,
    [locationId, id]
  );
  return result[0] as OkPacket;
};

export const deleteById = async ({ id }: { id: number }) => {
  const connection = await getConnectionPool();
  const result = await connection.query(
    `
      DELETE FROM station
      WHERE id = ?
  `,
    [id]
  );
  return result[0] as OkPacket;
};
