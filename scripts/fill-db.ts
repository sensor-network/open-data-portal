import { createPool, Pool } from 'mysql2/promise';
import { add } from 'date-fns';

const c = {
  /* define time range of when to insert measurements */
  START_TIME: new Date('2022Z'),
  END_TIME: new Date('2024Z'),

  /* select time interval between measurements (seconds) */
  DATA_DENSITY: 5 * 60,

  TEMP_SENSOR_ID: 1,
  PH_SENSOR_ID: 3,
  CONDUCTIVITY_SENSOR_ID: 2,

  /* define ranges for measurements (in SI-units) */
  MIN_TEMP: 283,
  MAX_TEMP: 298,
  MIN_COND: 3,
  MAX_COND: 8,
  MIN_PH: 4,
  MAX_PH: 9,

  /* define how much each datapoint is allowed to change between each point,
   *  the rate is a randomized value between -<change_rate> < 0 < <change_rate> */
  TEMP_CHANGE_RATE: 0.1,
  COND_CHANGE_RATE: 0.1,
  PH_CHANGE_RATE: 0.1,
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
  /*await connection.query(`
   DELETE FROM Data;
   `);*/

  let time = c.START_TIME;
  let s = {
    temp: 293,
    cond: 5,
    ph: 7,
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

  while (time.getTime() <= c.END_TIME.getTime()) {
    time = add(time, { seconds: c.DATA_DENSITY });

    s.temp = adjustTemp(s.temp);
    s.cond = adjustCond(s.cond);
    s.ph = adjustPH(s.ph);

    await connection.query(`
        INSERT INTO measurement (sensor_id, value, time)
        VALUES (?, ?, ?),
               (?, ?, ?),
               (?, ?, ?);
    `, [
      c.TEMP_SENSOR_ID, s.temp, time,
      c.PH_SENSOR_ID, s.ph, time,
      c.CONDUCTIVITY_SENSOR_ID, s.cond, time,
    ]);
    console.log(time);
  }
  return;
};

loadData();