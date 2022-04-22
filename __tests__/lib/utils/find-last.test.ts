import { findLast } from "../../../src/lib/utils/find-last";

type SimpleObject = {
  id: number;
  value: string;
};
const callback = (arg: SimpleObject) => arg.id === 1;

describe("TEST findLast", () => {
  it("TEST 1 - returns null on an empty array", () => {
    const array: SimpleObject[] = [];

    const result = findLast(array, callback);

    expect(result).toEqual(null);
  });

  it("TEST 2 - it gets the last of the searched values", () => {
    const array: SimpleObject[] = [
      { id: 1, value: "1" },
      { id: 2, value: "2" },
      { id: 1, value: "1.1" },
      { id: 3, value: "3" },
    ];

    const result = findLast(array, callback);

    expect(result).toEqual({ id: 1, value: "1.1" });
  });
});