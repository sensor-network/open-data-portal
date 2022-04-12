import { createPool, OkPacket, Pool, RowDataPacket } from 'mysql2/promise';
import { add, format } from 'date-fns';

const c = {
  /* define time range of when to insert measurements */
  START_TIME: new Date('2021-01-01Z'),
  END_TIME: new Date('2024Z'),

  /* select time interval between measurements (seconds) */
  DATA_DENSITY: 5 * 60,

  /* define what sensors are sending the data */
  TEMPERATURE_SENSOR_ID: 1,
  PH_SENSOR_ID: 3,
  CONDUCTIVITY_SENSOR_ID: 2,

  /* specify the coordinates which the measurement is coming from. */
  LOCATION: {
    LAT: 56.2,
    LONG: 15.6,
  },

  /* define ranges for measurements (in SI-units) */
  MIN_TEMP: 283,
  MAX_TEMP: 298,
  MIN_COND: 3,
  MAX_COND: 8,
  MIN_PH: 4,
  MAX_PH: 9,

  /* define how much each datapoint is allowed to change between each point,
   * the rate is a randomized value between -<change_rate> < 0 < <change_rate> */
  TEMP_CHANGE_RATE: 0.1,
  COND_CHANGE_RATE: 0.1,
  PH_CHANGE_RATE: 0.1,
};

const adjustTemp = (value: number) => {
  let rate = Math.random() < 0.5 ?
    Math.random() * c.TEMP_CHANGE_RATE :
    -Math.random() * c.TEMP_CHANGE_RATE;
  let newVal = value + rate;
  return newVal < c.MIN_TEMP || newVal > c.MAX_TEMP ? value - rate : value + rate;
};
const adjustCond = (value: number) => {
  let rate = Math.random() < 0.5 ?
    Math.random() * c.COND_CHANGE_RATE :
    -Math.random() * c.COND_CHANGE_RATE;
  let newVal = value + rate;
  return newVal < c.MIN_COND || newVal > c.MAX_COND ? value - rate : value + rate;
};
const adjustPH = (value: number) => {
  let rate = Math.random() < 0.5 ?
    Math.random() * c.PH_CHANGE_RATE :
    -Math.random() * c.PH_CHANGE_RATE;
  let newVal = value + rate;
  return newVal < c.MIN_PH || newVal > c.MAX_PH ? value - rate : value + rate;
};

export const loadData = async () => {
  const connection: Pool = createPool({
    host: 'localhost',
    user: 'admin',
    password: 'admin',
    database: 'sensor_network',
    timezone: '+00:00',
    connectionLimit: 1000,
  });

  /* find the sensors, or create them */
  const [temp] = await connection.query(`
      SELECT id
      FROM sensor
      WHERE id = ?
  `, [c.TEMPERATURE_SENSOR_ID]);
  if (!(<RowDataPacket[]>temp).length) {
    await connection.query(`
        INSERT INTO sensor (id, type)
        VALUES (?, ?)
    `, [c.TEMPERATURE_SENSOR_ID, 'temperature']);
  }
  const [cond] = await connection.query(`
      SELECT id
      FROM sensor
      WHERE id = ?
  `, [c.CONDUCTIVITY_SENSOR_ID]);
  if (!(<RowDataPacket[]>cond).length) {
    await connection.query(`
        INSERT INTO sensor (id, type)
        VALUES (?, ?)
    `, [c.CONDUCTIVITY_SENSOR_ID, 'conductivity']);
  }
  const [ph] = await connection.query(`
      SELECT id
      FROM sensor
      WHERE id = ?
  `, [c.PH_SENSOR_ID]);
  if (!(<RowDataPacket[]>ph).length) {
    await connection.query(`
        INSERT INTO sensor (id, type)
        VALUES (?, ?)
    `, [c.PH_SENSOR_ID, 'ph']);
  }

  /* find the location, or create it */
  const [location] = await connection.query(`
      SELECT id
      FROM Location
      WHERE ST_Distance_Sphere(position, ST_GeomFromText('POINT(? ?)', 4326)) < radius_meters
  `, [c.LOCATION.LAT, c.LOCATION.LONG]);
  let location_id: number;
  if ((<RowDataPacket[]>location).length) {
    location_id = (<RowDataPacket[]>location)[0].id;
  }
  else {
    const [new_location] = await connection.query(`
        INSERT INTO Location (name, position, radius_meters)
        VALUES ('unknown', ST_GeomFromText('POINT(? ?)', 4326), 200)
    `, [c.LOCATION.LAT, c.LOCATION.LONG]);
    console.log(new_location);
    location_id = (<OkPacket>new_location).insertId;
  }

  let current_time = c.START_TIME;
  let s = {
    temp: 293,
    cond: 5,
    ph: 7,
  };

  while (current_time.getTime() <= c.END_TIME.getTime()) {
    const next_time = add(current_time, { seconds: c.DATA_DENSITY });

    /* insert summary into history table if it's a new day */
    if (next_time.getDate() !== current_time.getDate()) {
      for (const type of ['temperature', 'conductivity', 'ph']) {
        await connection.query(`
            INSERT INTO history (type, location_id, date, daily_min, daily_avg, daily_max)
            VALUES (?, ?, ?,
                    (SELECT MIN(value) FROM measurement WHERE date(time) = ? AND location_id = ? AND type = ?),
                    (SELECT AVG(value) FROM measurement WHERE date(time) = ? AND location_id = ? AND type = ?),
                    (SELECT MAX(value) FROM measurement WHERE date(time) = ? AND location_id = ? AND type = ?))
        `, [
          type, location_id, format(current_time, 'yyyy-MM-dd'),
          format(current_time, 'yyyy-MM-dd'), location_id, type,
          format(current_time, 'yyyy-MM-dd'), location_id, type,
          format(current_time, 'yyyy-MM-dd'), location_id, type,
        ]);
      }
    }

    s.temp = adjustTemp(s.temp);
    s.cond = adjustCond(s.cond);
    s.ph = adjustPH(s.ph);

    try {
      await connection.query(`
          INSERT INTO measurement (sensor_id, location_id, position, value, time, type)
          VALUES (?, ?, ST_GeomFromText('POINT(? ?)', 4326), ?, ?, ?),
                 (?, ?, ST_GeomFromText('POINT(? ?)', 4326), ?, ?, ?),
                 (?, ?, ST_GeomFromText('POINT(? ?)', 4326), ?, ?, ?);
      `, [
        c.TEMPERATURE_SENSOR_ID, location_id, c.LOCATION.LAT, c.LOCATION.LONG, s.temp, current_time, 'temperature',
        c.PH_SENSOR_ID, location_id, c.LOCATION.LAT, c.LOCATION.LONG, s.ph, current_time, 'ph',
        c.CONDUCTIVITY_SENSOR_ID, location_id, c.LOCATION.LAT, c.LOCATION.LONG, s.cond, current_time, 'conductivity',
      ]);
      console.log(current_time);

    }
    catch (e) {
      console.log(e);
      console.log(`Duplicate entry for ${current_time}. Skipping.`);
    }

    current_time = next_time;
  }
  return;
};

loadData();
