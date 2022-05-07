import { renderHook } from "@testing-library/react-hooks";
import { useLocations } from "~/lib/hooks";
import { fetcher } from "~/lib/utils/fetch";

let locationsFromAPI = [
  {
    id: 1,
    name: "test1",
    position: { lat: 1, long: 1 },
    radiusMeters: 1,
  },
  {
    id: 2,
    name: "test2",
    position: { lat: 2, long: 2 },
    radiusMeters: 2,
  },
];

// mock external dependency
jest.mock("~/lib/utils/fetch", () => ({
  __esModule: true,
  fetcher: jest.fn().mockImplementation(async () => locationsFromAPI),
}));

describe("useLocations hook", () => {
  it("should return an empty array if the db is empty", async () => {
    // ARRANGE: the behavior from api is to throw 404 error if the db is empty
    fetcher.mockImplementationOnce(() => {
      throw new Error("No locations found");
    });

    // ACT: render the hook and wait for it to resolve
    const { result, waitFor } = renderHook(() => useLocations(""));
    await waitFor(() => Array.isArray(result.current));

    // ASSERT: check that the array is empty
    expect(result.current).toEqual([]);
  });

  it("should return the locations from api", async () => {
    const { result, waitFor } = renderHook(() => useLocations(""));
    await waitFor(() => Array.isArray(result.current));

    expect(result.current).toEqual(locationsFromAPI);
  });
});
