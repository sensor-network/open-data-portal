import { createPool, Pool } from 'mysql2/promise';
import { add } from 'date-fns';
const c = {
    /* define time range of when to insert measurements */
    START_TIME: new Date('2023Z'),
    END_TIME: new Date('2024Z'),

    /* select time interval between measurements (seconds) */
    DATA_DENSITY: 1 * 60,

    /* define location to insert*/
    LAT: 56.16192,
    LNG: 15.58676,
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
    }

    const adjustTemp = (value: number) => {
        let rate = Math.random() < 0.5 ?
            Math.random() * 0.1 :
            -Math.random() * 0.1;
        let newVal = value + rate;
        return newVal < 283 || newVal > 293 ? value - rate : value + rate;
    }
    const adjustCond = (value: number) => {
        let rate = Math.random() < 0.5 ?
            Math.random() * 0.1 :
            -Math.random() * 0.1;
        let newVal = value + rate;
        return newVal < 3 || newVal > 8 ? value - rate : value + rate;
    }
    const adjustPH = (value: number) => {
        let rate = Math.random() < 0.5 ?
            Math.random() * 0.1 :
            -Math.random() * 0.1;
        let newVal = value + rate;
        return newVal < 4 || newVal > 9 ? value - rate : value + rate;
    }

    while (time.getTime() <= c.END_TIME.getTime()) {
        time = add(time, {seconds: c.DATA_DENSITY});

        s.temp = adjustTemp(s.temp);
        s.cond = adjustCond(s.cond);
        s.ph = adjustPH(s.ph);

        await connection.query(`
            INSERT INTO Data (
                date, position, temperature, conductivity, pH
            ) VALUES (
                ?, 
                ST_GeomFromText('POINT(? ?)', 4326, 'axis-order=lat-long'), 
                ?, ?, ?
            );
        `, [
            time,
            c.LAT, c.LNG,
            s.temp,
            s.cond,
            s.ph
        ]);

        console.log(time);
    }
    return;
}

loadData();