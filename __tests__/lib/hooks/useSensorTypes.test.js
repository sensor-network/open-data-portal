import { renderHook } from "@testing-library/react-hooks";
import { useSensorTypes } from "~/lib/hooks/useSensorTypes";
import { fetcher } from "~/lib/utilityFunctions";

let sensorTypesFromAPI = ["temperature", "conductivity", "ph"];

// mock external dependency
jest.mock("~/lib/utilityFunctions", () => ({
  __esModule: true,
  fetcher: jest.fn().mockImplementation(async () => sensorTypesFromAPI),
}));

describe("useLocations hook", () => {
  it("should return an empty array if the db is empty", async () => {
    // ARRANGE: the behavior from api is to throw 404 error if the db is empty
    fetcher.mockImplementationOnce(() => {
      throw new Error("No sensors found");
    });

    // ACT: render the hook and wait for it to resolve
    const { result, waitFor } = renderHook(() => useSensorTypes(""));
    await waitFor(() => Array.isArray(result.current));

    // ASSERT: check that the array is empty
    expect(result.current).toEqual([]);
  });

  it("should return the sensorTypes from api", async () => {
    const { result, waitFor } = renderHook(() => useSensorTypes(""));
    await waitFor(() => Array.isArray(result.current));

    expect(result.current).toEqual(sensorTypesFromAPI);
  });
});
