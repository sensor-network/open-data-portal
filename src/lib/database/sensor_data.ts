import { OkPacket, RowDataPacket } from 'mysql2/promise';
import { getConnectionPool } from 'src/lib//database/connection';

export const createOne = async (
  { sensorId, value, time }: { sensorId: number, value: number, time: Date | string },
) => {
  const connection = await getConnectionPool();
  const [result] = await connection.query(`
      INSERT INTO sensor_data (sensor_id, value, time)
      VALUES (?, ?, ?)
  `, [sensorId, value, time],);
  return <OkPacket>result;
};