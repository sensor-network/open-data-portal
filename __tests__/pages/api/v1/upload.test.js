import { createMocks } from 'node-mocks-http';

import handler from 'src/pages/api/v1/upload';
import { endConnection } from 'src/lib/database';
import {
    STATUS_CREATED,
    STATUS_FORBIDDEN, STATUS_BAD_REQUEST,
    STATUS_METHOD_NOT_ALLOWED
} from "src/lib/httpStatusCodes";
import { UNITS as TEMP_UNITS } from "src/lib/units/temperature";
import { UNITS as COND_UNITS } from "src/lib/units/conductivity";

describe('/upload API Endpoint', () => {
    console.log = jest.fn();    // silence the console logs during tests
    const api_key = process.env.NEXT_PUBLIC_API_KEY || 'default';

    function mockReqRes (method = 'POST') {
        /*
         * Creating mock-objects of valid types for Next API handlers
         * The passed object should correspond to the correct request-format for the endpoint, you can
         * modify or delete any property within a test-case to test for request-format-deviations
         */
        return createMocks({
            method,
            /*headers: {
                'Content-Type': 'application/json
            },*/
            query: {
                api_key
            },
            body: []
        });
    }

    describe("the endpoint respond with the correct status codes and the json response-object has the correct form", () => {
        it("should return with status code 201[CREATED] and an empty array if queried correctly, but with empty body", async () => {
            const { req, res } = mockReqRes();             // generate new mock-objects
            await handler(req, res);                                     // query the endpoint using the mocks
            expect(res._getStatusCode()).toEqual(STATUS_CREATED);        // case-2-case assertions
            expect(res._getJSONData()).toBeInstanceOf(Array);
            expect(res._getJSONData().length).toEqual(0);
        });

        it("should return with status code 400[BAD_REQUEST] and an error message if the request body is not an array", async () => {
            const { req, res } = mockReqRes();
            req.body = {};
            await handler(req, res);
            expect(res._getStatusCode()).toEqual(STATUS_BAD_REQUEST);
            expect(res._getJSONData()).toEqual(
                expect.objectContaining({
                    error: expect.stringContaining('Expected Array but got object')
                })
            );
        });

        it("should return with status code 400[BAD_REQUEST] and an error message if no request body is provided", async () => {
            const { req, res } = mockReqRes();
            delete req.body;
            await handler(req, res);
            expect(res._getStatusCode()).toEqual(STATUS_BAD_REQUEST);
            expect(res._getJSONData()).toEqual(
                expect.objectContaining({
                    error: expect.stringContaining('Expected Array but got undefined')
                })
            );
        });

        it("should return with status code 403[FORBIDDEN] and an error message if no api_key is provided", async () => {
            const { req, res } = mockReqRes();
            delete req.query.api_key;
            await handler(req, res);
            expect(res._getStatusCode()).toEqual(STATUS_FORBIDDEN);
            expect(res._getJSONData()).toEqual(
                expect.objectContaining({
                    error: expect.stringContaining("No API key provided")
                })
            );
        });

        it("should return with status code 403[FORBIDDEN] and an error message if a bad api_key is provided", async () => {
            const { req, res } = mockReqRes();
            req.query.api_key = 'something';
            await handler(req, res);
            expect(res._getStatusCode()).toEqual(STATUS_FORBIDDEN);
            expect(res._getJSONData()).toEqual(
                expect.objectContaining({
                    error: expect.stringContaining("The provided API key could not be verified")
                })
            );
        });

        it("should return with status code 405[NOT_ALLOWED] and an error message if method is GET", async () => {
            const { req, res } = mockReqRes('GET');
            await handler(req, res);
            expect(res._getStatusCode()).toEqual(STATUS_METHOD_NOT_ALLOWED);
            expect(res._getJSONData()).toEqual(
                expect.objectContaining({
                    error: expect.stringContaining("Method GET is not allowed")
                })
            );
        });
    });

    describe("the endpoint can handle faulty request-body", () => {
        /*
         * All inputs given in these test cases are possible user inputs, they should be handled
         * correctly without any crashes and give the user appropriate error messages.
         */
        const acceptedMeasurement = {
            timestamp: "2022-01-01 00:00:00",
            UTC_offset: 0,
            latitude: 0,
            longitude: 0,
            sensors: {
                temperature: 300,
                ph_level: 0,
                conductivity: 0
            }
        };

        describe("the endpoint accepts only valid timestamps", () => {
            it("should not accept UTC_offsets less than -12", async () => {
                const { req, res } = mockReqRes();
                req.body = [{...acceptedMeasurement, UTC_offset: -13}];
                await handler(req, res);
                expect(res._getStatusCode()).toEqual(STATUS_BAD_REQUEST);
                expect(res._getJSONData()).toEqual(
                    expect.objectContaining({
                        fieldErrors: {
                            UTC_offset: [ expect.stringContaining("Value should be greater than or equal to -12") ]
                        }
                    })
                );
            });
            it("should not accept UTC_offsets greater than 14", async () => {
                const { req, res } = mockReqRes();
                req.body = [{...acceptedMeasurement, UTC_offset: 15}];
                await handler(req, res);
                expect(res._getStatusCode()).toEqual(STATUS_BAD_REQUEST);
                expect(res._getJSONData()).toEqual(
                    expect.objectContaining({
                        fieldErrors: {
                            UTC_offset: [ expect.stringContaining("Value should be less than or equal to 14") ]
                        }
                    })
                );
            });
            it("should not accept random strings as timestamps", async () => {
                const { req, res } = mockReqRes();
                req.body = [{...acceptedMeasurement, timestamp: "something"}];
                await handler(req, res);
                expect(res._getStatusCode()).toEqual(STATUS_BAD_REQUEST);
                expect(res._getJSONData()).toEqual(
                    expect.objectContaining({
                        fieldErrors: {
                            timestamp: [ expect.stringContaining('Invalid format') ]
                        }
                    })
                );
            });
            it("should accept timestamps formatted as YYYY-MM-DD hh:mm:ss", async () => {
                const { req, res } = mockReqRes();
                req.body = [acceptedMeasurement];
                await handler(req, res);
                expect(res._getStatusCode()).toEqual(STATUS_CREATED);
                expect(res._getJSONData()[0]).toEqual(
                    expect.objectContaining({
                        timestamp: "2022-01-01 00:00:00"
                    })
                );
            });
            it("should not accept timestamps formatted as YYYY-MM-DDThh:mm:ss.SSSZ", async () => {
                const { req, res } = mockReqRes();
                req.body = [{...acceptedMeasurement, timestamp: "2022-01-01T00:00:00.000Z"}];
                await handler(req, res);
                expect(res._getStatusCode()).toEqual(STATUS_BAD_REQUEST);
                expect(res._getJSONData()).toEqual(
                    expect.objectContaining({
                        fieldErrors: {
                            timestamp: [ expect.stringContaining("Invalid format") ]
                        }
                    })
                );
            });
        });

        describe("the endpoint accepts only valid coordinates", () => {
            it("should not accept latitude less than -90", async () => {
                const { req, res } = mockReqRes();
                req.body = [{...acceptedMeasurement, latitude: -90.1}];
                await handler(req, res);
                expect(res._getStatusCode()).toEqual(STATUS_BAD_REQUEST);
                expect(res._getJSONData()).toEqual(
                    expect.objectContaining({
                        fieldErrors: {
                            latitude: [ expect.stringContaining("Value should be greater than or equal to -90") ]
                        }
                    })
                );
            });
            it("should not accept latitude greater than 90", async () => {
                const { req, res } = mockReqRes();
                req.body = [{...acceptedMeasurement, latitude: 90.1}];
                await handler(req, res);
                expect(res._getStatusCode()).toEqual(STATUS_BAD_REQUEST);
                expect(res._getJSONData()).toEqual(
                    expect.objectContaining({
                        fieldErrors: {
                            latitude: [ expect.stringContaining("Value should be less than or equal to 90") ]
                        }
                    })
                );
            });
            it("should not accept longitude less than -180", async () => {
                const { req, res } = mockReqRes();
                req.body = [{...acceptedMeasurement, longitude: -180.1}];
                await handler(req, res);
                expect(res._getStatusCode()).toEqual(STATUS_BAD_REQUEST);
                expect(res._getJSONData()).toEqual(
                    expect.objectContaining({
                        fieldErrors: {
                            longitude: [ expect.stringContaining("Value should be greater than or equal to -180") ]
                        }
                    })
                );
            });
            it("should not accept longitude greater than 180", async () => {
                const { req, res } = mockReqRes();
                req.body = [{...acceptedMeasurement, longitude: 180.1}];
                await handler(req, res);
                expect(res._getStatusCode()).toEqual(STATUS_BAD_REQUEST);
                expect(res._getJSONData()).toEqual(
                    expect.objectContaining({
                        fieldErrors: {
                            longitude: [ expect.stringContaining("Value should be less than or equal to 180") ]
                        }
                    })
                );
            });
        });

        describe("the endpoint accepts only valid sensor data", () => {
            it("should not accept an empty sensor-object", async () => {
                const { req, res } = mockReqRes();
                req.body = [{...acceptedMeasurement, sensors: {}}]
                await handler(req, res);
                expect(res._getStatusCode()).toEqual(STATUS_BAD_REQUEST);
                expect(res._getJSONData()).toEqual(
                    expect.objectContaining({
                        formErrors: [ expect.stringContaining("Must contain at least") ]
                    })
                );
            });

            describe("the endpoint accepts only valid temperature inputs", () => {
                it(`should not accept temperature values below ${TEMP_UNITS.KELVIN.minValue} Kelvin`, async () => {
                    const { req, res } = mockReqRes();
                    req.body = [{...acceptedMeasurement, sensors: { temperature: TEMP_UNITS.KELVIN.minValue-1, temperature_unit: 'K'}}];
                    await handler(req, res);
                    expect(res._getStatusCode()).toEqual(STATUS_BAD_REQUEST);
                    expect(res._getJSONData()).toEqual(
                        expect.objectContaining({
                            fieldErrors: {
                                temperature: [ expect.stringContaining(`Value should be greater than or equal to ${TEMP_UNITS.KELVIN.minValue} Kelvin`) ]
                            }
                        })
                    );
                });
                it(`should not accept temperature values below ${TEMP_UNITS.CELSIUS.minValue} Celsius`, async () => {
                    const { req, res } = mockReqRes();
                    req.body = [{...acceptedMeasurement, sensors: { temperature: TEMP_UNITS.CELSIUS.minValue-1, temperature_unit: 'C'}}];
                    await handler(req, res);
                    expect(res._getStatusCode()).toEqual(STATUS_BAD_REQUEST);
                    expect(res._getJSONData()).toEqual(
                        expect.objectContaining({
                            fieldErrors: {
                                temperature: [ expect.stringContaining(`Value should be greater than or equal to ${TEMP_UNITS.CELSIUS.minValue} Celsius`) ]
                            }
                        })
                    );
                });
                it(`should not accept temperature values below ${TEMP_UNITS.FAHRENHEIT.minValue} Fahrenheit`, async () => {
                    const { req, res } = mockReqRes();
                    req.body = [{...acceptedMeasurement, sensors: { temperature: TEMP_UNITS.FAHRENHEIT.minValue-1, temperature_unit: 'F'}}];
                    await handler(req, res);
                    expect(res._getStatusCode()).toEqual(STATUS_BAD_REQUEST);
                    expect(res._getJSONData()).toEqual(
                        expect.objectContaining({
                            fieldErrors: {
                                temperature: [ expect.stringContaining(`Value should be greater than or equal to ${TEMP_UNITS.FAHRENHEIT.minValue} Fahrenheit`) ]
                            }
                        })
                    );
                });
            });

            describe("the endpoint accepts only valid ph inputs", () => {
                it("should not accept ph values below 0", async () => {
                    const { req, res } = mockReqRes();
                    req.body = [{...acceptedMeasurement, sensors: { ph_level: -0.1 }}];
                    await handler(req, res);
                    expect(res._getStatusCode()).toEqual(STATUS_BAD_REQUEST);
                    expect(res._getJSONData()).toEqual(
                        expect.objectContaining({
                            fieldErrors: {
                                ph_level: [ expect.stringContaining("Value should be greater than or equal to 0") ]
                            }
                        })
                    );
                });
                it("should not accept ph values above 14", async () => {
                    const { req, res } = mockReqRes();
                    req.body = [{...acceptedMeasurement, sensors: { ph_level: 14.1 }}];
                    await handler(req, res);
                    expect(res._getStatusCode()).toEqual(STATUS_BAD_REQUEST);
                    expect(res._getJSONData()).toEqual(
                        expect.objectContaining({
                            fieldErrors: {
                                ph_level: [ expect.stringContaining("Value should be less than or equal to 14") ]
                            }
                        })
                    );
                });
            });

            describe("the endpoint accepts only valid conductivity inputs", () => {
                it(`should not accept conductivity values below ${COND_UNITS.SIEMENS_PER_METER.minValue} ${COND_UNITS.SIEMENS_PER_METER.name}`, async () => {
                    const { req, res } = mockReqRes();
                    req.body = [{...acceptedMeasurement, sensors: { conductivity: COND_UNITS.SIEMENS_PER_METER.minValue-1 }}];
                    await handler(req, res);
                    expect(res._getStatusCode()).toEqual(STATUS_BAD_REQUEST);
                    expect(res._getJSONData()).toEqual(
                        expect.objectContaining({
                            fieldErrors: {
                                conductivity: [ expect.stringContaining(
                                    `Value should be greater than or equal to ${COND_UNITS.SIEMENS_PER_METER.minValue} ${COND_UNITS.SIEMENS_PER_METER.name}`
                                ) ]
                            }
                        })
                    );
                });
                it(`should not accept conductivity values greater than ${COND_UNITS.PARTS_PER_MILLION.maxValue} ${COND_UNITS.PARTS_PER_MILLION.name}`, async () => {
                    const { req, res } = mockReqRes();
                    req.body = [{...acceptedMeasurement, sensors: { conductivity: COND_UNITS.PARTS_PER_MILLION.maxValue+1, conductivity_unit: COND_UNITS.PARTS_PER_MILLION.symbols[0] }}];
                    await handler(req, res);
                    expect(res._getStatusCode()).toEqual(STATUS_BAD_REQUEST);
                    expect(res._getJSONData()).toEqual(
                        expect.objectContaining({
                            fieldErrors: {
                                conductivity: [ expect.stringContaining(
                                    `Value should be less than or equal to ${COND_UNITS.PARTS_PER_MILLION.maxValue} ${COND_UNITS.PARTS_PER_MILLION.name}`
                                ) ]
                            }
                        })
                    );
                });
            });
        });

        describe("the endpoint can successfully push data to the database", () => {
            it("should upload unconverted data if no units are provided", async () => {
                const {req, res} = mockReqRes();
                req.body = [acceptedMeasurement];
                await handler(req, res);
                const data = res._getJSONData();
                expect(res._getStatusCode()).toEqual(STATUS_CREATED);
                expect(data.length).toEqual(1);
                expect(data[0]).toEqual(
                    expect.objectContaining({
                    timestamp: "2022-01-01 00:00:00",
                    latitude: 0,
                    longitude: 0,
                    sensors: expect.objectContaining({
                        temperature: 300,
                        ph_level: 0,
                        conductivity: 0
                    })
                }));
            });
            it("should upload converted data if units are provided", async () => {
                const {req, res} = mockReqRes();
                req.body = [{...acceptedMeasurement, UTC_offset: -1, sensors: { temperature: 0, ph_level: 0, temperature_unit: 'C', conductivity: 100, conductivity_unit: 'ppm' }}];
                await handler(req, res);
                const data = res._getJSONData();
                expect(res._getStatusCode()).toEqual(STATUS_CREATED);
                expect(data.length).toEqual(1);
                expect(data[0]).toEqual(
                    expect.objectContaining({
                        timestamp: "2022-01-01 01:00:00",
                        latitude: 0,
                        longitude: 0,
                        sensors: expect.objectContaining({
                            temperature: 273.15,
                            ph_level: 0,
                            conductivity: 0.016
                        })
                    })
                );
            });
            describe("should upload data even if not all sensors are measured",  () => {
                it("should upload if temperature is missing", async () => {
                    const {req, res} = mockReqRes();
                    req.body = [{...acceptedMeasurement, sensors: { ph_level: 5, conductivity: 5 }}];
                    await handler(req, res);
                    expect(res._getStatusCode()).toEqual(STATUS_CREATED);
                });
                it("should upload if ph is missing", async () => {
                    const {req, res} = mockReqRes();
                    req.body = [{...acceptedMeasurement, sensors: { temperature: 300, conductivity: 5 }}];
                    await handler(req, res);
                    expect(res._getStatusCode()).toEqual(STATUS_CREATED);
                });
                it("should upload if conductivity is missing", async () => {
                    const {req, res} = mockReqRes();
                    req.body = [{...acceptedMeasurement, sensors: { ph_level: 5, temperature: 300 }}];
                    await handler(req, res);
                    expect(res._getStatusCode()).toEqual(STATUS_CREATED);
                });
            });
        });
    });


    afterAll(async () => {
        /* close the database connection after running all the tests */
        await endConnection();
    });
});
