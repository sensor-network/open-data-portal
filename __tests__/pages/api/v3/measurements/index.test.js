import handler from "../../../../../src/pages/api/v3/measurements";
import { createOne, findMany } from "src/lib/database/measurement";

import { createMocks } from "node-mocks-http";

/* Mock the database modules. */
jest.mock("src/lib/database/measurement", () => ({
  __esModule: true,
  createOne: jest.fn().mockImplementation(() => Promise.resolve()),
  findMany: jest.fn().mockImplementation(() =>
    Promise.resolve([
      {
        locationName: "test",
        position: {
          lat: 0,
          long: 0,
        },
        time: new Date("2022-01-01T00:00:00.000Z"),
        sensors: {
          temperature: 278.15,
        },
      },
    ]),
  ),
}));
jest.mock("src/lib/database/location", () => ({
  __esModule: true,
  /* just return an array with a single location whose id = 1 for now */
  findByLatLong: jest
    .fn()
    .mockImplementation(() => Promise.resolve([{ id: 1 }])),
}));
jest.mock("src/lib/database/sensor", () => ({
  __esModule: true,
  findById: jest
    .fn()
    .mockImplementation(() => Promise.resolve({ id: 1, type: "temperature" })),
  updateStatus: jest.fn().mockImplementation(() => Promise.resolve()),
}));

describe("POST: /measurements", () => {
  const apiKey = process.env.NEXT_PUBLIC_API_KEY || "default";
  /* wrapper for 'node-mocks-http' createMocks() */
  const mockReqRes = (body = [], method = "POST") => {
    return createMocks({
      headers: { Authorization: `Bearer ${apiKey}` },
      method,
      body,
    });
  };

  it("should call the database once using the mock function", async () => {
    /* setup req, res object (arrange) */
    const { req, res } = mockReqRes({
      time: "2022-01-01Z",
      position: { lat: 0, long: 0 },
      sensors: [{ sensorId: 1, value: 5, unit: "c" }],
    });
    /* call the api endpoint (act) */
    await handler(req, res);

    /* there should only have been a single call to the database (assert)*/
    expect(createOne.mock.calls.length).toEqual(1);
    /* mock.calls[0][0] is the first argument the mock was called with the first time */
    expect(createOne.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        /* mySQL in Node cannot take the trailing Z when inserting timestamps for some
         *  reason, hence we have cut this of in 'src/lib/conversions/convertTimestamp' */
        time: "2022-01-01T00:00:00.000",
        position: {
          lat: 0,
          long: 0,
        },
        locationId: 1, // returned from mock
        sensorId: 1,
        sensorType: "temperature",
        value: 278.15, // 5 'C
      }),
    );
    /* if the database called returned with 1, the id of the returned object should also be 1 */
    expect(res._getJSONData()).toEqual(
      expect.objectContaining({
        insertedMeasurements: expect.arrayContaining([
          expect.objectContaining({
            sensorId: 1,
            value: 278.15,
            time: "2022-01-01T00:00:00.000",
          }),
        ]),
      }),
    );
    expect(res._getStatusCode()).toEqual(201);
  });
});

describe("GET: /measurements", () => {
  /* wrapper for 'node-mocks-http' createMocks() */
  const mockReqRes = (query, method = "GET") => {
    return createMocks({
      method,
      query,
    });
  };

  it("should call the database once using the mock function", async () => {
    /* setup req, res object - (arrange) */
    const { req, res } = mockReqRes({});
    /* call the api endpoint - (act) */
    await handler(req, res);

    /* check result - (assert) */
    /* there should only have been a single call to the database */
    expect(findMany.mock.calls.length).toEqual(1);

    console.log(findMany.mock.results[0].value);
    expect(await findMany.mock.results[0].value).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          locationName: "test",
          position: {
            lat: 0,
            long: 0,
          },
          time: new Date("2022-01-01T00:00:00.000Z"),
          sensors: {
            temperature: 278.15,
          },
        }),
      ]),
    );
    /* if the database returned correctly, the api should respond accordingly */
    expect(res._getJSONData()).toEqual(
      expect.objectContaining({
        pagination: expect.objectContaining({
          page: 1,
          pageSize: 100,
          lastPage: 1,
          totalRows: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        }),
        units: expect.objectContaining({
          time: "UTC",
          temperature: "k",
          conductivity: "spm",
        }),
        measurements: expect.arrayContaining([
          expect.objectContaining({
            time: "2022-01-01T00:00:00.000Z",
            locationName: "test",
            position: {
              lat: 0,
              long: 0,
            },
            sensors: {
              temperature: 278.15,
            },
          }),
        ]),
      }),
    );
  });
});
