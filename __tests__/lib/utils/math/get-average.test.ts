import { getAverage } from "~/lib/utils/math";

it("should get the average when all values are numbers", () => {
  const values = [1, 2, 3];
  const avg = getAverage(values);
  expect(avg).toBe(2);
});

it("should get the average if there are nulled values", () => {
  const values = [1, null, 3];
  const avg = getAverage(values);
  expect(avg).toBe(2);
});

it("should return null if there are no numbers", () => {
  const values = [null, null, null];
  const avg = getAverage(values);
  expect(avg).toBeNull();
});

it("should return null if the array is empty", () => {
  const values: (number | null)[] = [];
  const avg = getAverage(values);
  expect(avg).toBeNull();
});
