import { getMin } from "~/lib/utils/math";

it("should get the minimum when all values are numbers", () => {
  const values = [1, 2, 3];
  const min = getMin(values);
  expect(min).toBe(1);
});

it("should get the minimum if there are nulled values", () => {
  const values = [1, null, 3];
  const min = getMin(values);
  expect(min).toBe(1);
});

it("should get the minimum if there are undefined values", () => {
  const values = [1, undefined, 3];
  const min = getMin(values);
  expect(min).toBe(1);
});

it("should get the minimum if there are undefined and nulled values", () => {
  const values = [1, undefined, null, 3];
  const min = getMin(values);
  expect(min).toBe(1);
});

it("should return null if there are no numbers", () => {
  const values = [null, null, null];
  const min = getMin(values);
  expect(min).toBeNull();
});

it("should return null if the array is empty", () => {
  const values: (number | null)[] = [];
  const min = getMin(values);
  expect(min).toBeNull();
});
