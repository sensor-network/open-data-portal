import { createPool, OkPacket, RowDataPacket, Pool } from "mysql2/promise";
import { add } from "date-fns";

const c = {
  startDate: "2021Z",
  endDate: "2025Z",
};

const aggregateData = async () => {
  const connection: Pool = createPool({
    host: "localhost",
    user: "admin",
    password: "admin",
    database: "sensor_network",
    timezone: "+00:00",
    connectionLimit: 1000,
  });

  /* get locations and sensor types */
  const [location_ids] = await connection.query(`
      SELECT id
      FROM location
  `);
  const [sensor_types] = await connection.query(`
      SELECT distinct type
      FROM sensor
  `);

  /* loop the entire date-range */
  let currentDate = new Date(c.startDate);
  while (currentDate <= new Date(c.endDate)) {
    for (const { id } of <RowDataPacket[]>location_ids) {
      for (const { type } of <RowDataPacket[]>sensor_types) {
        /* insert into table for each location and sensor type */
        try {
          const [result] = await connection.query(
            `
              INSERT INTO history
                  (date, location_id, type, daily_min, daily_avg, daily_max)
              VALUES (?, ?, ?,
                      (SELECT MIN(value) FROM measurement WHERE date(time) = ? AND location_id = ? AND type = ?),
                      (SELECT AVG(value) FROM measurement WHERE date(time) = ? AND location_id = ? AND type = ?),
                      (SELECT MAX(value) FROM measurement WHERE date(time) = ? AND location_id = ? AND type = ?))
          `,
            [
              currentDate,
              id,
              type,
              currentDate,
              id,
              type,
              currentDate,
              id,
              type,
              currentDate,
              id,
              type,
            ]
          );
          const insertId: number = (<OkPacket>result).insertId;
          console.log(
            `Date: ${currentDate.toDateString()} :: inserted id: ${insertId}`
          );
        } catch (e) {
          console.log(
            `Duplicate entry for {${currentDate.toDateString()}, ${id}, ${type}}`
          );
        }
      }
    }
    /* step date */
    currentDate = add(currentDate, { days: 1 });
  }
};

aggregateData();
