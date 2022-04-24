import { createMocks } from "node-mocks-http";
import handler from "~/pages/api/v3/locations/index";
import { findByName } from "~/lib/database/location";

const locationDb = [
  { id: 1, name: "foo", position: { lat: 0, long: 0 }, radiusMeters: 100 },
  { id: 2, name: "bar", position: { lat: 10, long: 10 }, radiusMeters: 200 },
  { id: 3, name: "baz", position: { lat: 20, long: 20 }, radiusMeters: 300 },
];

jest.mock("~/lib/database/location", () => ({
  __esModule: true,
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

describe("GET: /api/v3/locations", () => {
  const mockReqRes = ({ method = "GET", query = {} }) => {
    return createMocks({
      method,
      query,
    });
  };

  describe("no filters", () => {
    it("should return a list of locations", async () => {
      const { req, res } = mockReqRes({});

      await handler(req, res);

      expect(res._getStatusCode()).toEqual(200);
      expect(res._getJSONData()).toEqual(locationDb);
    });
  });

  describe("filter by name", () => {
    it("should filter by name if provided", async () => {
      const { req, res } = mockReqRes({ query: { name: "foo" } });

      await handler(req, res);

      expect(res._getStatusCode()).toEqual(200);
      expect(res._getJSONData()).toEqual([locationDb[0]]);
    });
  });

  describe("filter by lat/lng", () => {
    it("should filter by lat/lng if provided", async () => {
      const { req, res } = mockReqRes({ query: { lat: "10", long: "10" } });

      await handler(req, res);

      expect(res._getStatusCode()).toEqual(200);
      expect(res._getJSONData()).toEqual([locationDb[1]]);
    });
  });
});
