import { PH } from "~/lib/units/ph";
import { DECIMAL_PLACES } from "~/lib/constants";

it("should only accept values between 0 <= value <= 14", () => {
  expect(() => new PH(0)).not.toThrow();
  expect(() => new PH(14)).not.toThrow();
  expect(() => new PH(7)).not.toThrow();
  expect(() => new PH(-0.1)).toThrow();
  expect(() => new PH(14.1)).toThrow();
});

it("should return the value but rounded", () => {
  /* include assertion of DECIMAL_PLACES so that we
   know the reason if the test fail in the future */
  expect(DECIMAL_PLACES).toBe(2);
  const ph = new PH(7.123456789);
  const expected = 7.12;
  expect(ph.getValue()).toEqual(expected);
});
