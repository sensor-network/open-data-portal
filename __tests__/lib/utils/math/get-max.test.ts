import { getMax } from "~/lib/utils/math";

it("should get the maximum when all values are numbers", () => {
  const values = [1, 2, 3];
  const max = getMax(values);
  expect(max).toBe(3);
});

it("should get the maximum if there are nulled values", () => {
  const values = [1, null, 3];
  const max = getMax(values);
  expect(max).toBe(3);
});

it("should get the maximum if there are undefined values", () => {
  const values = [1, undefined, 3];
  const max = getMax(values);
  expect(max).toBe(3);
});

it("should get the maximum if there are undefined and nulled values", () => {
  const values = [1, undefined, null, 3];
  const max = getMax(values);
  expect(max).toBe(3);
});

it("should return null if there are no numbers", () => {
  const values = [null, undefined, null];
  const max = getMax(values);
  expect(max).toBeNull();
});

it("should return null if the array is empty", () => {
  const values: (number | null)[] = [];
  const max = getMax(values);
  expect(max).toBeNull();
});
