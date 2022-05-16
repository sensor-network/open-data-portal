import { ZodError } from "zod";
import { DECIMAL_PLACES } from "src/lib/constants";

const ROUND_FACTOR = Math.pow(10, DECIMAL_PLACES);
const MIN_PH = 5;
const MAX_PH = 9;

/* pH doesn't have any unit, but we take this step to validate the range, and keep the system coherent */
export class PH {
  value: number;

  constructor(value: number) {
    if (value < MIN_PH) {
      throw new ZodError([
        {
          code: "too_small",
          path: ["ph"],
          type: "number",
          minimum: MIN_PH,
          inclusive: true,
          message: `Value should be greater than or equal to ${MIN_PH}.`,
        },
      ]);
    }
    if (value > MAX_PH) {
      throw new ZodError([
        {
          code: "too_big",
          path: ["ph"],
          type: "number",
          maximum: MAX_PH,
          inclusive: true,
          message: `Value should be less than or equal to ${MAX_PH}.`,
        },
      ]);
    }
    this.value = value;
  }

  static keyName = "ph";
  static displayName = "pH";

  getValue = () => Math.round(this.value * ROUND_FACTOR) / ROUND_FACTOR;
}
