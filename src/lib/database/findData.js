import { getConnectionPool } from "../database";
const SRID = 4326;

export const getRowCount = async () => {
    const connection = await getConnectionPool();
    const [ rowCount ] = await connection.query(
        `SELECT count(*) FROM Data`
    );
    return rowCount;
}

export const findMany = async (location, params) => {
    let data;
    switch (location) {
        case 'all':
            data = await findAll(params);
            break;
        case 'by-geolocation':
            data = await findAllByGeolocation(params);
            break;
        case 'by-location-name':
            data = await findAllByLocationName(params);
            break;
        default:
            throw Error('unknown location-filter')
    }
    return data;
}

const findAll = async (
    { offset, page_size, start_date, end_date }
) => {
    const connection = await getConnectionPool();
    const [ data ] = await connection.query(`
        SELECT
            id, date,
            ST_Y(position) as longitude, ST_X(position) as latitude,
            temperature, ph, conductivity
        FROM
            Data
        WHERE
            date >= ? AND date <= ?
        ORDER BY
            date
        LIMIT
            ?, ?
    `, [
        start_date, end_date,
        offset, page_size
    ]);
    return data;
}

const findAllByLocationName = async (
    /* TODO: Not implemented */
    { name, offset, page_size, start_date, end_date }
) => {
    const connection = await getConnectionPool();
    const [ data ] = await connection.query(`
    SELECT 
        id,
        pH,
        temperature,
        conductivity,
        date,
        ST_Y(position) as longitude,
        ST_X(position) as latitude
    FROM 
        Data 
    AS 
        d
    WHERE 
        ST_Distance_Sphere(d.position, (SELECT position from Locations where name = ?)) < (SELECT radius from Locations where name = ?)
    AND
        date(date) >= ? AND date(date) <= ?;
    ORDER BY 
        Date
    LIMIT 
        ?, ?
  `, [
    name, name,
    start_date, end_date,
    offset, page_size
    ]);
    return data;
}

const findAllByGeolocation = async (
    { long, lat, rad, offset, page_size, start_date, end_date }
) => {
    const connection = await getConnectionPool();
    const [ data ] = await connection.query(`
        SELECT 
            id,
            pH,
            temperature,
            conductivity,
            date,
            ST_Y(position) as longitude,
            ST_X(position) as latitude,
            ST_Distance_Sphere(position, ST_GeomFromText('POINT(? ?)', ?, 'axis-order=long-lat')) as 'distance in meters'
        FROM 
            Data 
        WHERE 
            ST_Distance_Sphere(position, ST_GeomFromText('POINT(? ?)', ?, 'axis-order=long-lat')) < ?
        AND
            date >= ? AND date <= ?
        ORDER BY 
            Date
        LIMIT 
            ?, ?
    `, [
        long, lat, SRID,
        long, lat, SRID, rad,
        start_date, end_date,
        offset, page_size
    ]);
    return data;
}