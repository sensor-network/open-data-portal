import { createMocks } from "node-mocks-http";
import handler from "~/pages/api/v3/health/index";
import { getStatus } from "~/lib/database/connection";

jest.mock("~/lib/database/connection", () => ({
  __esModule: true,
  getStatus: jest.fn().mockImplementation(async () => void 0),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("TEST /health", () => {
  const mockReqRes = () => createMocks();

  it("should return UP if the database is up", async () => {
    const { req, res } = mockReqRes();

    await handler(req, res);

    expect(getStatus.mock.calls.length).toEqual(1);
    expect(res._getStatusCode()).toEqual(200);
    expect(res._getJSONData()).toEqual({
      status: { server: "UP", database: "UP" },
    });
  });

  it("should return DOWN if the database is down", async () => {
    const { req, res } = mockReqRes();

    getStatus.mockImplementation(async () => {
      throw new Error("db error");
    });

    await handler(req, res);

    expect(getStatus.mock.calls.length).toEqual(1);
    expect(res._getStatusCode()).toEqual(200);
    expect(res._getJSONData()).toEqual({
      status: { server: "UP", database: "DOWN" },
    });
  });
});
