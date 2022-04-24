import { summarizeValues } from "../../../src/lib/utilityFunctions";

describe("TEST summarizeValues", () => {
  it("TEST 1", () => {
    const values = [];
    const result = summarizeValues(values);
    expect(result).toEqual({
      min: NaN,
      max: NaN,
      avg: NaN,
    });
  });

  it("TEST 2", () => {
    const values = [2, 1, 3];
    const result = summarizeValues(values);
    expect(result).toEqual({
      min: 1,
      max: 3,
      avg: 2,
    });
  });
});