import { createMocks } from 'node-mocks-http';
import { performance } from "perf_hooks";
const MAX_QUERYTIME_MS = 100;

import handler from 'src/pages/api/v1';
import { getConnectionPool, endConnection } from 'src/lib/database';
import {
    STATUS_OK,
    STATUS_BAD_REQUEST, STATUS_METHOD_NOT_ALLOWED
} from "src/lib/httpStatusCodes";
import { UNITS as TEMP_UNITS } from 'src/lib/units/temperature';
import { UNITS as COND_UNITS } from 'src/lib/units/conductivity';

describe('/ API Endpoint', () => {
    console.log = jest.fn();    // silence the console logs during tests
    function mockReqRes (method = 'GET') {
        return createMocks({
            method,
        });
    }

    beforeAll(async () => {
        const conn = await getConnectionPool();
        await conn.query(`
            DELETE FROM Data WHERE id >= 0;
        `)
        await conn.query(`
            INSERT INTO Data 
                (date, position, pH, temperature, conductivity) 
            VALUES
                ('2022-01-01 00:00:00', ST_GeomFromText('POINT(56 15)', 4326), 7, 300, 5)
        `);
    });

    describe("the endpoint respond with the correct status codes and the json response-object has the correct form", () => {
        it('should return with status code 200[OK] and the "raw" data if queried without params', async () => {
            const {req, res} = mockReqRes();
            await handler(req, res);
            const data = res._getJSONData();
            expect(res._getStatusCode()).toBe(STATUS_OK);
            expect(data).toBeInstanceOf(Array);
            expect(data.length).toEqual(1);
            expect(data[0]).toEqual(
                expect.objectContaining({
                    date: '2022-01-01T00:00:00.000Z',
                    latitude: 56,
                    longitude: 15,
                    pH: 7,
                    temperature: 300,
                    conductivity: 5
                })
            );
        });

        it("should return with status code 200[OK] and converted data if queried with valid unit-params", async () => {
            const { req, res } = mockReqRes();
            req.query = { tempunit: 'c', conductunit: 'ppm' };

            // testing the time for query + conversions. necessary since there is only 1 element?
            const startTime = performance.now();
            await handler(req, res);
            const endTime = performance.now();
            expect(endTime - startTime).toBeLessThan(MAX_QUERYTIME_MS);

            const data = res._getJSONData();
            expect(res._getStatusCode()).toEqual(STATUS_OK);
            expect(data).toBeInstanceOf(Array);
            expect(data.length).toEqual(1);
            expect(data[0]).toEqual(
                expect.objectContaining({
                    date: '2022-01-01T00:00:00.000Z',
                    latitude: 56,
                    longitude: 15,
                    pH: 7,
                    temperature: TEMP_UNITS.CELSIUS.fromKelvin(300),
                    conductivity: COND_UNITS.PARTS_PER_MILLION.fromSiemensPerMeter(5)
                })
            );
        });

        it("should return with status code 400[BAD REQUEST] if queried with an invalid temperature unit.", async () => {
            const {req, res } = mockReqRes();
            req.query = { tempunit: 'spm' };
            await handler(req, res);
            expect(res._getStatusCode()).toEqual(STATUS_BAD_REQUEST);
            expect(res._getJSONData()).toEqual(
                expect.objectContaining({
                    fieldErrors: {
                        temperature_unit: [ expect.stringContaining('Unexpected unit spm') ]
                    }
                })
            );
        });

        it("should return with status code 400[BAD REQUEST] if queried with an invalid conductivity unit.", async () => {
            const {req, res } = mockReqRes();
            req.query = { conductunit: 'c' };
            await handler(req, res);
            expect(res._getStatusCode()).toEqual(STATUS_BAD_REQUEST);
            expect(res._getJSONData()).toEqual(
                expect.objectContaining({
                    fieldErrors: {
                        conductivity_unit: [ expect.stringContaining('Unexpected unit c') ]
                    }
                })
            );
        });

        it("should return with status code 405[NOT_ALLOWED] if request method is POST", async () => {
            const { req, res } = mockReqRes('POST');
            await handler(req, res);
            expect(res._getStatusCode()).toEqual(STATUS_METHOD_NOT_ALLOWED);
            expect(res._getJSONData()).toEqual(
                expect.objectContaining({
                    error: expect.stringContaining('Method POST is not allowed')
                })
            );
        });
    });

    afterAll(async () => {
        /* close the database connection after running all the tests */
        await endConnection();
    });
});