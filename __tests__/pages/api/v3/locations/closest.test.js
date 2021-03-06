import { createMocks } from "node-mocks-http";
import handler from "~/pages/api/v3/locations/closest";
import { findClosest } from "~/lib/database/location";
import { haversine } from "~/lib/utils/math";

const locationDb = [
  { id: 1, name: "foo", position: { lat: 56, long: 15 }, radiusMeters: 100 },
  { id: 2, name: "bar", position: { lat: 56, long: 16 }, radiusMeters: 200 },
  {
    id: 3,
    name: "baz",
    position: { lat: 55.899, long: 15.499 },
    radiusMeters: 1000,
  },
  {
    id: 4,
    name: "buz",
    position: { lat: 55.905, long: 15.505 },
    radiusMeters: 1000,
  },
];

jest.mock("~/lib/database/location", () => ({
  __esModule: true,
  findClosest: jest.fn().mockImplementation(async ({ lat, long }) => {
    /* mock of DistanceSphere */
    const closest = locationDb.map((location, idx) => ({
      location,
      distance: haversine(location.position, { lat, long }),
    }));
    /* sort by distance low->high */
    const sorted = closest.sort((a, b) => a.distance - b.distance);
    /* return closest if it's within the location's radius */
    if (sorted[0].distance < sorted[0].location.radiusMeters) {
      return sorted[0].location;
    }
    return null;
  }),
}));

describe("GET: /api/v3/locations/closest", () => {
  const mockReqRes = ({ method = "GET", query = {} }) => {
    return createMocks({
      method,
      query,
    });
  };

  it("should return 200 and the closest location if one is found within their given radius", async () => {
    const { req, res } = mockReqRes({
      query: { lat: "56.0005", long: "15.9995" },
    });

    await handler(req, res);

    expect(findClosest.mock.calls.length).toEqual(1);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual(locationDb[1]);
  });

  it("should return the closest one if two are within the radius", async () => {
    const { req, res } = mockReqRes({
      query: { lat: "55.9", long: "15.5" },
    });

    await handler(req, res);

    expect(findClosest.mock.calls.length).toEqual(1);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual(locationDb[2]);
  });

  it("should return 400 if latitude is not provided", async () => {
    const { req, res } = mockReqRes({ query: { long: "16" } });

    await handler(req, res);

    expect(findClosest.mock.calls.length).toEqual(0);
    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toEqual({
      formErrors: [],
      fieldErrors: { lat: ["Required"] },
    });
  });

  it("should return 400 if longitude is missing", async () => {
    const { req, res } = mockReqRes({ query: { lat: "56" } });

    await handler(req, res);

    expect(findClosest.mock.calls.length).toEqual(0);
    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toEqual({
      formErrors: [],
      fieldErrors: { long: ["Required"] },
    });
  });

  it("should return 400 if lat/long are not valid", async () => {
    const { req, res } = mockReqRes({ query: { lat: "foo", long: "200" } });

    await handler(req, res);

    expect(findClosest.mock.calls.length).toEqual(0);
    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toEqual({
      formErrors: [],
      fieldErrors: {
        lat: [
          "should be greater than or equal to 55.8",
          "should be less than or equal to 56.3",
        ],
        long: ["should be less than or equal to 16.5"],
      },
    });
  });

  it("should return 404 if no location is found within their given radius", async () => {
    const { req, res } = mockReqRes({ query: { lat: "55.8", long: "16.5" } });

    await handler(req, res);

    expect(findClosest.mock.calls.length).toEqual(1);
    expect(res._getStatusCode()).toBe(404);
    expect(res._getJSONData()).toEqual({
      message: "No location found close enough",
    });
  });

  it("should return 500 if the db crashes", async () => {
    const { req, res } = mockReqRes({ query: { lat: "56", long: "15" } });

    findClosest.mockImplementationOnce(() => {
      throw new Error("db error");
    });

    await handler(req, res);

    expect(findClosest.mock.calls.length).toEqual(1);
    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData()).toEqual({
      error: "Internal server error",
    });
  });
});

describe("POST /api/v3/locations/closest", () => {
  it("should return with 405 if called with unsupported method", async () => {
    const { req, res } = createMocks({ method: "POST" });

    await handler(req, res);

    expect(res._getStatusCode()).toEqual(405);
    expect(res.hasHeader("Allow")).toEqual(true);
    expect(res._getJSONData()).toEqual({
      error: "Method 'POST' not allowed.",
    });
  });
});
