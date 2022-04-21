import { PH } from "../../../src/lib/units/ph";

it("should only accept values between 0 <= value <= 14", () => {
  expect(() => new PH(0)).not.toThrow();
  expect(() => new PH(14)).not.toThrow();
  expect(() => new PH(-0.1)).toThrow();
  expect(() => new PH(14.1)).toThrow();
});
