import { createOne, findMany, getRowCount } from "src/lib/database/data";
import { createMocks } from "node-mocks-http";

/* Mock the database calls. */
jest.mock("src/lib/database/measurement", () => ({
  __esModule: true,
  /**
   * createOne is an async function that takes in an instance and returns an id.
   * by mocking this, we can test the api alone, and not have the api tests be
   * dependent on the sql database logic.
   **/
  createOne: jest.fn().mockResolvedValue(1),
  /**
   * findMany is an async function that takes in a query and returns an array of
   * Measurements.
   **/
  findMany: jest.fn().mockResolvedValue([{
    location_name: "test",
    time: new Date("2022-01-01T00:00:00.000Z"),
    sensors: {
      "temperature": 300,
      "conductivity": 5,
      "ph": 7,
      "random_sensor_type": 10,
    },
  }]),
  /**
   * findByLocationId is an async function that takes in a location id and
   * returns an array of Measurements matching the given location.
   **/
  findByLocationId: jest.fn().mockResolvedValue([{
    location_name: "test",
    time: new Date("2022-01-01T00:00:00.000Z"),
    sensors: {
      "temperature": 300,
      "conductivity": 5,
      "ph": 7,
      "random_sensor_type": 10,
    },
  }]),
}));

describe.skip("POST: /measurements", () => {
  const api_key = process.env.NEXT_PUBLIC_API_KEY || "default";
  /* wrapper for 'node-mocks-http' createMocks() */
  const mockReqRes = (body = [], method = "POST") => {
    return createMocks({
      method,
      query: {
        api_key,
      },
      body,
    });
  };

  it("should call the database using the mock function", async () => {
    /* setup req, res object */
    const { req, res } = mockReqRes({
      timestamp: "2022-01-01Z",
      latitude: 56,
      longitude: 15,
      sensors: {
        temperature: 5,
        temperature_unit: "c",
      },
    });
    /* call the api endpoint */
    await handler(req, res);

    /* there should only have been a single call to the database */
    expect(createOne.mock.calls.length).toEqual(1);
    /* mock.calls[0][0] is the first argument the mock was called with the first time */
    expect(createOne.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        /* mySQL in Node cannot take the trailing Z when inserting timestamps for some
        *  reason, hence we have cut this of in 'src/lib/conversions/convertTimestamp' */
        timestamp: "2022-01-01T00:00:00.000",
        latitude: 56,
        longitude: 15,
        sensors: {
          temperature: 278.15,
        },
      }),
    );
    /* the database should return with the inserted id. in this case we mocked it to be 1 */
    await expect(createOne.mock.results[0].value).resolves.toEqual(1);
    /* if the database called returned with 1, the id of the returned object should also be 1 */
    expect(res._getJSONData()).toEqual(
      expect.objectContaining({
        id: 1,
        timestamp: "2022-01-01T00:00:00.000",
        latitude: 56,
        longitude: 15,
        sensors: {
          temperature: 278.15,
        },
      }),
    );
    expect(res._getStatusCode()).toEqual(201);
  });
});


describe.skip("GET: /data", () => {
  /* wrapper for 'node-mocks-http' createMocks() */
  const mockReqRes = (query, method = "GET") => {
    return createMocks({
      method,
      query,
    });
  };

  it("should call the database using the mock function", async () => {
    /* setup req, res object */
    const { req, res } = mockReqRes({});
    /* call the api endpoint */
    await handler(req, res);

    /* there should only have been a single call to the database */
    expect(findMany.mock.calls.length).toEqual(1);

    /* mock.calls[0][0] is the argument the mock was called with the first time */
    expect(findMany.mock.calls[0][0]).toEqual("all");
    expect(findMany.mock.calls[0][1]).toEqual(
      expect.objectContaining({
        start_date: "2022-01-01T00:00:00.000Z",
        /* cut off the seconds/milliseconds to take some latency into account */
        end_date: expect.stringContaining(new Date().toISOString().substring(0, 15)),
        offset: 0,
        page_size: 100,
      }),
    );
    expect(findMany.mock.calls[0][2]).toEqual(
      expect.arrayContaining(["temperature", "conductivity", "ph"]),
    );
    /* the database should return with the inserted id. in this case we mocked it to be 1 */
    await expect(findMany.mock.results[0].value).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          date: "2022-01-01T00:00:00.000Z",
          latitude: 56,
          longitude: 15,
          temperature: 278.15,
          conductivity: 5,
          ph: 7,
        }),
      ]),
    );
    /* given rowCount = 1, there should not be a next_page. */
    expect(getRowCount.mock.calls.length).toEqual(1);
    await expect(getRowCount.mock.results[0].value).resolves.toEqual(1);
    /* if the database returned correctly, the api should respond accordingly */
    expect(res._getJSONData()).toEqual(
      expect.objectContaining({
        pagination: expect.objectContaining({
          page: 1,
          page_size: 100,
          has_previous_page: false,
          has_next_page: false,
        }),
        units: expect.objectContaining({
          date: "UTC",
          temperature_unit: "k",
          conductivity_unit: "spm",
        }),
        data: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            date: "2022-01-01T00:00:00.000Z",
            latitude: 56,
            longitude: 15,
            temperature: 278.15,
            conductivity: 5,
            ph: 7,
          }),
        ]),
      }),
    );
  });
});