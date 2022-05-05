import handler from "~/pages/api/v3/stations/index";
import {
  createOne,
  findMany,
  findByStationId,
  findBySensorId,
  findByLocationName,
  findBySensorType,
  reformatSQLResult,
} from "~/lib/database/station";

const stationDb = [
  { stationId: 1, sensorId: 1, locationId: 1 },
  { stationId: 1, sensorId: 2, locationId: 1 },
  { stationId: 2, sensorId: 3, locationId: 2 },
  { stationId: 2, sensorId: 4, locationId: 2 },
  { stationId: 3, sensorId: 5, locationId: 3 },
  { stationId: 3, sensorId: 6, locationId: 3 },
];

jest.mock("~/lib/database/station", () => ({
  __esModule: true,
  reformatSQLResult: jest.requireActual("~/lib/database/station")
    .reformatSQLResult,
  createOne: jest.fn().mockImplementation(async () => 1),
  findMany: jest.fn().mockImplementation(async () => stationDb),
  findByStationId: jest
    .fn()
    .mockImplementation(async ({ id }) => stationDb.filter((s) => s.id === id)),
}));

describe("test reformatSQLResult", () => {
  it("can handle empty input", () => {
    const filteredStations = [];

    const result = reformatSQLResult(filteredStations, false, false);

    expect(result).toEqual([]);
  });

  it("can handle single station", () => {
    const filteredStations = [stationDb[0]];

    const result = reformatSQLResult(filteredStations, false, false);

    expect(result).toEqual([{ id: 1, sensors: [1], location: 1 }]);
  });
});
