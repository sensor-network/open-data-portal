import { PH, MIN_PH, MAX_PH } from "~/lib/units/ph";
import { DECIMAL_PLACES } from "~/lib/constants";

it("should only accept values between 5 and 9", () => {
  // for easier debugging if theses changes in the future, we know the reason for the test to fail
  expect(MIN_PH).toBe(5);
  expect(MAX_PH).toBe(9);

  expect(() => new PH(5)).not.toThrow();
  expect(() => new PH(5.1)).not.toThrow();
  expect(() => new PH(7)).not.toThrow();
  expect(() => new PH(9)).not.toThrow();
  expect(() => new PH(9.1)).toThrow();
});

it("should return the value but rounded", () => {
  /* include assertion of DECIMAL_PLACES so that we
   know the reason if the test fail in the future */
  expect(DECIMAL_PLACES).toBe(2);
  const ph = new PH(7.123456789);
  const expected = 7.12;
  expect(ph.getValue()).toEqual(expected);
});
