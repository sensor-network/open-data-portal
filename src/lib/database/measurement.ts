import { OkPacket, RowDataPacket } from 'mysql2/promise';
import { getConnectionPool } from 'src/lib//database/connection';

export const createOne = async (
  { sensorId, value, time }: { sensorId: number, value: number, time: Date | string },
) => {
  const connection = await getConnectionPool();
  const [result] = await connection.query(`
      INSERT INTO measurement (sensor_id, value, time)
      VALUES (?, ?, ?)
  `, [sensorId, value, time],);
  return <OkPacket>result;
};

export const findByLocationName = async (
  { locationName, startTime, endTime }: { locationName: string, startTime: Date, endTime: Date },
) => {
  const connection = await getConnectionPool();
  const [result] = await connection.query(`
      SELECT st.location_name,
             m.time,
             CONCAT('{',
                    (
                        SELECT GROUP_CONCAT(
                                       CONCAT(JSON_QUOTE(s2.type), ':', m2.value)
                                       SEPARATOR ','
                                   )
                        FROM measurement m2
                                 INNER JOIN sensor s2
                                            ON s2.id = m2.sensor_id
                        WHERE m2.time = m.time
                        GROUP BY m2.time
                    ),
                    '}') AS sensors
      FROM station st
               INNER JOIN sensor s
                          ON st.sensor_id = s.id
               INNER JOIN measurement m
                          ON s.id = m.sensor_id
      WHERE st.location_name = ?
        AND m.time BETWEEN ? AND ?
      GROUP BY m.time;
  `, [locationName, startTime, endTime]);

  return <RowDataPacket[]>result;
};
