import { createMocks } from "node-mocks-http";
import handler from "~/pages/api/v3/locations/index";
import {
  createOne,
  findMany,
  findByName,
  findByLatLong,
} from "~/lib/database/location";

const locationDb = [
  { id: 1, name: "foo", position: { lat: 0, long: 0 }, radiusMeters: 100 },
  { id: 2, name: "bar", position: { lat: 10, long: 10 }, radiusMeters: 200 },
  { id: 3, name: "baz", position: { lat: 20, long: 20 }, radiusMeters: 300 },
];

jest.mock("~/lib/database/location", () => ({
  __esModule: true,
  // createOne:
  findMany: jest.fn().mockImplementation(async () => locationDb),
  findByName: jest
    .fn()
    .mockImplementation(async ({ name }) =>
      locationDb.filter((l) => l.name === name)
    ),
  // FIXME: currently filtering exact location
  findByLatLong: jest
    .fn()
    .mockImplementation(async ({ lat, long }) =>
      locationDb.filter(
        (l) => l.position.lat === lat && l.position.long === long
      )
    ),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET: /api/v3/locations", () => {
  const mockReqRes = ({ method = "GET", query = {} }) => {
    return createMocks({
      method,
      query,
    });
  };

  it("should return 400 if called with invalid query", async () => {
    const { req, res } = mockReqRes({ query: { name: 1 } });

    await handler(req, res);

    expect(findMany.mock.calls.length).toEqual(0);
    expect(findByName.mock.calls.length).toEqual(0);
    expect(findByLatLong.mock.calls.length).toEqual(0);
    expect(res.statusCode).toBe(400);
  });

  describe("no filters", () => {
    it("should return a list of locations", async () => {
      const { req, res } = mockReqRes({});

      await handler(req, res);

      expect(findMany.mock.calls.length).toEqual(1);
      expect(res._getStatusCode()).toEqual(200);
      expect(res._getJSONData()).toEqual(locationDb);
    });

    it("should return 404 if no location is found", async () => {
      const { req, res } = mockReqRes({});

      findMany.mockImplementation(async () => []);

      await handler(req, res);

      expect(findMany.mock.calls.length).toEqual(1);
      expect(res._getStatusCode()).toEqual(404);
      expect(res._getJSONData()).toEqual({
        message: expect.stringContaining("No location"),
      });
    });
  });

  describe("filter by name", () => {
    it("should filter by name if provided", async () => {
      const { req, res } = mockReqRes({ query: { name: "foo" } });

      await handler(req, res);

      expect(findByName.mock.calls.length).toEqual(1);
      expect(res._getStatusCode()).toEqual(200);
      expect(res._getJSONData()).toEqual([locationDb[0]]);
    });

    it("should return 404 if no locations matched", async () => {
      const { req, res } = mockReqRes({ query: { name: "foobar" } });

      await handler(req, res);

      expect(findByName.mock.calls.length).toEqual(1);
      expect(res._getStatusCode()).toEqual(404);
      expect(res._getJSONData()).toEqual({
        message: expect.stringContaining("No location"),
      });
    });
  });

  describe("filter by lat/lng", () => {
    it("should return the matched locations", async () => {
      const { req, res } = mockReqRes({ query: { lat: "10", long: "10" } });

      await handler(req, res);

      expect(findByLatLong.mock.calls.length).toEqual(1);
      expect(res._getStatusCode()).toEqual(200);
      expect(res._getJSONData()).toEqual([locationDb[1]]);
    });

    it("should return 404 if no locations matched", async () => {
      const { req, res } = mockReqRes({ query: { lat: "-10", long: "-10" } });

      await handler(req, res);

      expect(findByLatLong.mock.calls.length).toEqual(1);
      expect(res._getStatusCode()).toEqual(404);
      expect(res._getJSONData()).toEqual({
        message: expect.stringContaining("No location"),
      });
    });
  });
});
