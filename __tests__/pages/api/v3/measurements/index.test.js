import { createMocks } from "node-mocks-http";
import handler from "~/pages/api/v3/measurements";
import { createOne, findMany } from "~/lib/database/measurement";

/* Mock the database modules. */
jest.mock("~/lib/database/measurement", () => ({
  __esModule: true,
  createOne: jest.fn().mockImplementation(async () => void 0),
  findMany: jest.fn().mockImplementation(async () => [
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
}));
jest.mock("~/lib/database/location", () => ({
  __esModule: true,
  /* simulate there being a single entry at (lat,lng) = (0, 0) with id 1 */
  findClosest: jest.fn().mockImplementation(async ({ lat, long }) => {
    return lat === 0 && long === 0 ? { id: 1 } : null;
  }),
  // create a new location and return inserted id = 2
  createOne: jest.fn().mockImplementation(async () => 2),
}));

const sensorDb = [
  { id: 1, name: "temp1", type: "temperature" },
  { id: 2, name: "cond1", type: "conductivity" },
  { id: 3, name: "ph1", type: "ph" },
  { id: 4, name: "orp1", type: "random-sensor-type" },
];
jest.mock("~/lib/database/sensor", () => ({
  __esModule: true,
  findById: jest
    .fn()
    .mockImplementation(async ({ id }) => sensorDb.find((s) => s.id === id)),
  updateStatus: jest.fn().mockImplementation(async () => void 0),
}));

describe("POST: /api/v3/measurements", () => {
  const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? "default";
  /* wrapper for 'node-mocks-http' createMocks() with some default values */
  const mockReqRes = ({
    body = {},
    method = "POST",
    headers = { Authorization: `Bearer ${apiKey}` },
  }) => {
    return createMocks({
      headers,
      method,
      body,
    });
  };

  describe("valid insertions", () => {
    it("should handle single measurement insertions", async () => {
      /* setup req, res object (arrange) */
      const { req, res } = mockReqRes({
        body: {
          time: "2022-01-01Z",
          position: { lat: 0, long: 0 },
          sensors: [{ id: 1, value: 5, unit: "c" }],
        },
      });

      /* call the api endpoint (act) */
      await handler(req, res);

      /* there should have been 2 calls to the database (assert)*/
      expect(createOne.mock.calls.length).toEqual(1);
      expect(res._getStatusCode()).toEqual(201);
      expect(res._getJSONData()).toEqual({
        insertedMeasurements: [
          {
            sensorId: 1,
            locationId: 1,
            value: 278.15,
            time: "2022-01-01T00:00:00.000Z",
          },
        ],
        errors: [],
      });
    });

    it("should use default units if none are provided", async () => {
      /* setup req, res object (arrange) */
      const { req, res } = mockReqRes({
        body: {
          time: "2022-01-01Z",
          position: { lat: 0, long: 0 },
          sensors: [
            { id: 1, value: 300 },
            { id: 2, value: 5 },
            { id: 3, value: 5 },
          ],
        },
      });

      /* call the api endpoint (act) */
      await handler(req, res);

      /* there should have been 2 calls to the database (assert)*/
      expect(createOne.mock.calls.length).toEqual(3);
      expect(res._getStatusCode()).toEqual(201);
      expect(res._getJSONData()).toEqual({
        insertedMeasurements: [
          {
            sensorId: 1,
            locationId: 1,
            value: 300,
            time: "2022-01-01T00:00:00.000Z",
          },
          {
            sensorId: 2,
            locationId: 1,
            value: 5,
            time: "2022-01-01T00:00:00.000Z",
          },
          {
            sensorId: 3,
            locationId: 1,
            value: 5,
            time: "2022-01-01T00:00:00.000Z",
          },
        ],
        errors: [],
      });
    });

    it("should accept unknown sensor-types", async () => {
      /* setup req, res object (arrange) */
      const { req, res } = mockReqRes({
        body: {
          time: "2022-01-01Z",
          position: { lat: 0, long: 0 },
          sensors: [{ id: 4, value: 5, unit: "c" }],
        },
      });

      /* call the api endpoint (act) */
      await handler(req, res);

      /* there should have been 2 calls to the database (assert)*/
      expect(createOne.mock.calls.length).toEqual(1);
      expect(res._getStatusCode()).toEqual(201);
      expect(res._getJSONData()).toEqual({
        insertedMeasurements: [
          {
            sensorId: 4,
            locationId: 1,
            value: 5,
            time: "2022-01-01T00:00:00.000Z",
          },
        ],
        errors: [],
      });
    });

    it("should create a location if none is found close enough", async () => {
      const { req, res } = mockReqRes({
        body: {
          time: "2022-01-01Z",
          position: { lat: 10, long: 10 },
          sensors: [{ id: 1, value: 5, unit: "c" }],
        },
      });

      await handler(req, res);

      expect(createOne.mock.calls.length).toEqual(1);
      expect(res._getStatusCode()).toEqual(201);
      expect(res._getJSONData()).toEqual({
        insertedMeasurements: [
          {
            sensorId: 1,
            locationId: 2,
            value: 278.15,
            time: "2022-01-01T00:00:00.000Z",
          },
        ],
        errors: [],
      });
    });

    it("should handle multiple insertions in a single request", async () => {
      const { req, res } = mockReqRes({
        body: [
          {
            time: "2022-01-01T00:00:00Z",
            position: { lat: 0, long: 0 },
            sensors: [
              { id: 1, value: 5, unit: "c" },
              { id: 2, value: 5, unit: "spm" },
            ],
          },
          {
            time: "2022-01-01T01:00:00Z",
            position: { lat: 0, long: 0 },
            sensors: [
              { id: 1, value: 10, unit: "c" },
              { id: 2, value: 10, unit: "spm" },
            ],
          },
        ],
      });

      await handler(req, res);

      expect(createOne.mock.calls.length).toEqual(4);
      expect(res._getStatusCode()).toEqual(201);
      expect(res._getJSONData()).toEqual({
        insertedMeasurements: [
          {
            sensorId: 1,
            locationId: 1,
            value: 278.15,
            time: "2022-01-01T00:00:00.000Z",
          },
          {
            sensorId: 2,
            locationId: 1,
            value: 5,
            time: "2022-01-01T00:00:00.000Z",
          },
          {
            sensorId: 1,
            locationId: 1,
            value: 283.15,
            time: "2022-01-01T01:00:00.000Z",
          },
          {
            sensorId: 2,
            locationId: 1,
            value: 10,
            time: "2022-01-01T01:00:00.000Z",
          },
        ],
        errors: [],
      });
    });

    it("should handle both valid and invalid data in the same request", async () => {
      const { req, res } = mockReqRes({
        body: [
          {
            time: "2022-01-01T00:00:00Z",
            position: { lat: 0, long: 0 },
            sensors: [
              { id: 1, value: 5, unit: "c" },
              { id: 2, value: 5, unit: "c" }, // invalid unit
            ],
          },
          {
            time: "December 15th", // invalid time format
            position: { lat: 0, long: 0 },
            sensors: [
              { id: 1, value: 10, unit: "c" },
              { id: 2, value: 10, unit: "spm" },
            ],
          },
        ],
      });

      await handler(req, res);

      // sensor 1 of the first body item should be inserted, rest should be caught as invalid
      expect(createOne.mock.calls.length).toEqual(1);
      expect(res._getStatusCode()).toEqual(201);
      expect(res._getJSONData()).toEqual({
        insertedMeasurements: [
          {
            sensorId: 1,
            locationId: 1,
            value: 278.15,
            time: "2022-01-01T00:00:00.000Z",
          },
        ],
        errors: [
          { sensorId: 2, status: "INVALID_ENUM_VALUE" },
          {
            body: {
              time: "December 15th", // invalid time format
              position: { lat: 0, long: 0 },
              sensors: [
                { id: 1, value: 10, unit: "c" },
                { id: 2, value: 10, unit: "spm" },
              ],
            },
            error: {
              formErrors: [],
              fieldErrors: {
                time: [
                  "Invalid time format. Time should be provided using ISO8601 format.",
                ],
              },
            },
          },
        ],
      });
    });
  });

  describe("invalid insertions", () => {
    it("should return 400 when the sensor sends invalid data", async () => {
      const { req, res } = mockReqRes({
        body: {
          time: "2022-01-01Z",
          position: { lat: 0, long: 0 },
          sensors: [{ id: 1, value: 5, unit: "k" }], // <-- 5 K is too small
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toEqual(400);
      expect(res._getJSONData()).toEqual({
        message: "No inserted measurements",
        errors: [{ sensorId: 1, status: "TOO_SMALL" }],
      });
    });

    it("should return 400 when a non-registerred sensors is used", async () => {
      const { req, res } = mockReqRes({
        body: {
          time: "2022-01-01Z",
          position: { lat: 0, long: 0 },
          sensors: [{ id: 10, value: 5, unit: "c" }],
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toEqual(400);
      expect(res._getJSONData()).toEqual({
        message: "No inserted measurements",
        errors: [{ sensorId: 10, status: "SENSOR_NOT_FOUND" }],
      });
    });

    it("should return 400 if a duplicate entry is sent", async () => {
      /* override the mock to throw duplcate-entry this time */
      createOne.mockImplementationOnce(async () => {
        const error = new Error();
        error.code = "ER_DUP_ENTRY";
        throw error;
      });

      const { req, res } = mockReqRes({
        body: {
          time: "2022-01-01Z",
          position: { lat: 0, long: 0 },
          sensors: [{ id: 1, value: 5, unit: "c" }],
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toEqual(400);
      expect(res._getJSONData()).toEqual({
        message: "No inserted measurements",
        errors: [{ sensorId: 1, status: "ER_DUP_ENTRY" }],
      });
    });

    it("should return 400 if", async () => {});

    it("should return 401 if the correct authorization is not provided", async () => {
      const { req, res } = mockReqRes({
        headers: { Authorization: "Bearer wrong" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toEqual(401);
      expect(res.hasHeader("WWW-Authenticate")).toEqual(true);
      expect(res.getHeader("WWW-Authenticate")).toEqual("Bearer");
    });
  });
});

describe("GET: /api/v3/measurements", () => {
  /* wrapper for 'node-mocks-http' createMocks() */
  const mockReqRes = ({ query, method = "GET" }) => {
    return createMocks({
      method,
      query,
    });
  };

  it("should call the database once using the mock function", async () => {
    /* setup req, res object - (arrange) */
    const { req, res } = mockReqRes({ query: {} });
    /* call the api endpoint - (act) */
    await handler(req, res);

    /* check result - (assert) */
    /* there should only have been a single call to the database */
    expect(findMany.mock.calls.length).toEqual(1);
    expect(res._getStatusCode()).toEqual(200);
    expect(res._getJSONData()).toEqual({
      pagination: {
        page: 1,
        pageSize: 100,
        lastPage: 1,
        totalRows: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
      units: {
        time: "UTC",
        temperature: "k",
        conductivity: "spm",
      },
      measurements: [
        {
          time: "2022-01-01T00:00:00.000Z",
          locationName: "test",
          position: {
            lat: 0,
            long: 0,
          },
          sensors: {
            temperature: 278.15,
          },
        },
      ],
    });
  });
});

describe("PATCH /api/v3/measurements", () => {
  it("should return with 405 if called with unsupported method", async () => {
    const { req, res } = createMocks({ method: "PATCH" });

    await handler(req, res);

    expect(res._getStatusCode()).toEqual(405);
    expect(res.hasHeader("Allow")).toEqual(true);
    expect(res._getJSONData()).toEqual({
      error: "Method 'PATCH' not allowed.",
    });
  });
});
