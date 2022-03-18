import { getConnectionPool } from "./connection";
const SRID = 4326;

export const getRowCount = async () => {
    const connection = await getConnectionPool();
    const [ rowCount ] = await connection.query(
        `SELECT count(*) as row_count FROM Data`
    );
    return rowCount[0].row_count;
}

export const createOne = async (instance) => {
    const connection = await getConnectionPool();
    const [ result ] = await connection.query(`
        INSERT INTO Data (
            date,
            position,
            pH,
            temperature,
            conductivity
        ) VALUES (
            ?,
            ST_GeomFromText('POINT(? ?)', ?),
            ?,
            ?,
            ?
        )`, [
        instance.timestamp,
        instance.latitude, instance.longitude, SRID,
        instance.sensors.ph_level ?? null,
        instance.sensors.temperature ?? null,
        instance.sensors.conductivity ?? null
    ]);
    return result.insertId;
}

export const findMany = async (location, params, columns) => {
    let data;
    switch (location) {
        case 'all':
            data = await findAll(params, columns);
            break;
        case 'by-geolocation':
            data = await findAllByGeolocation(params, columns);
            break;
        case 'by-location-name':
            data = await findAllByLocationName(params, columns);
            break;
        default:
            throw Error('unknown location-filter')
    }
    return data;
}

const findAll = async (
    { offset, page_size, start_date, end_date }, columns
) => {
    const connection = await getConnectionPool();
    const [ data ] = await connection.query(`
        SELECT
            id, date,
            ST_Y(position) as longitude, ST_X(position) as latitude
            ${ columns.length ? ',' + columns.join(', ') : ''}
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
    { location_name, offset, page_size, start_date, end_date }, columns
) => {
    const connection = await getConnectionPool();
    const [ data ] = await connection.query(`
        SELECT 
            id, date,
            ST_Y(position) as longitude, ST_X(position) as latitude
            ${ columns.length ? ',' + columns.join(', ') : ''}
        FROM 
            Data AS d
        WHERE 
            ST_Distance_Sphere(d.position, (SELECT position from Locations where name = ?)) < (SELECT radius from Locations where name = ?)
        AND
            d.date >= ? AND d.date <= ?
        ORDER BY 
            d.date
        LIMIT 
            ?, ?
    `, [
        location_name, location_name,
        start_date, end_date,
        offset, page_size
    ]);
    return data;
}

const findAllByGeolocation = async (
    { long, lat, rad, offset, page_size, start_date, end_date }, columns
) => {
    const connection = await getConnectionPool();
    const [ data ] = await connection.query(`
        SELECT 
            id, date,
            ST_Y(position) as longitude, ST_X(position) as latitude
            ${ columns.length ? ',' + columns.join(', ') : ''}
            ,ST_Distance_Sphere(position, ST_GeomFromText('POINT(? ?)', ?, 'axis-order=long-lat')) as 'distance_in_meters'
        FROM 
            Data 
        WHERE 
            ST_Distance_Sphere(position, ST_GeomFromText('POINT(? ?)', ?, 'axis-order=long-lat')) < ?
        AND
            date >= ? AND date <= ?
        ORDER BY 
            date
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