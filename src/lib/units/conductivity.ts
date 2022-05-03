import { ZodError } from "zod";
import { DECIMAL_PLACES } from "src/lib/constants";

const ROUND_FACTOR = Math.pow(10, DECIMAL_PLACES);

interface Unit {
  name: string;
  symbols: Array<string>;
  minValue: number;
  maxValue: number;
  toSiemensPerMeter: (v: number) => number;
  fromSiemensPerMeter: (v: number) => number;
}

export const UNITS: { [name: string]: Unit } = {
  SIEMENS_PER_METER: {
    name: "Siemens per meter",
    symbols: ["spm", "s/m"],
    minValue: 0,
    maxValue: 10,
    toSiemensPerMeter: (v) => Math.round(v * ROUND_FACTOR) / ROUND_FACTOR,
    fromSiemensPerMeter: (v) => Math.round(v * ROUND_FACTOR) / ROUND_FACTOR,
  },
  MHO_PER_METER: {
    name: "Mho per meter",
    symbols: ["mhopm", "mho/m"],
    minValue: 0,
    maxValue: 10,
    toSiemensPerMeter: (v) => v,
    fromSiemensPerMeter: (v) => v,
  },
  SIEMENS_PER_CENTIMETER: {
    name: "Siemens per centimeter",
    symbols: ["spcm", "s/cm"],
    minValue: 0,
    maxValue: 0.1,
    toSiemensPerMeter: (v) => Math.round(v * 100 * ROUND_FACTOR) / ROUND_FACTOR,
    fromSiemensPerMeter: (v) =>
      Math.round((v / 100) * ROUND_FACTOR) / ROUND_FACTOR,
  },
  MHO_PER_CENTIMETER: {
    name: "Mho per centimeter",
    symbols: ["mhopcm", "mho/cm"],
    minValue: 0,
    maxValue: 0.1,
    toSiemensPerMeter: (v) => Math.round(v * 100 * ROUND_FACTOR) / ROUND_FACTOR,
    fromSiemensPerMeter: (v) =>
      Math.round((v / 100) * ROUND_FACTOR) / ROUND_FACTOR,
  },
  MILLISIEMENS_PER_METER: {
    name: "Millisiemens per meter",
    symbols: ["mspm", "ms/m"],
    minValue: 0,
    maxValue: 1e4,
    toSiemensPerMeter: (v) =>
      Math.round((v / 1e3) * ROUND_FACTOR) / ROUND_FACTOR,
    fromSiemensPerMeter: (v) =>
      Math.round(v * 1e3 * ROUND_FACTOR) / ROUND_FACTOR,
  },
  MILLISIEMENS_PER_CENTIMETER: {
    name: "Millisiemens per centimeter",
    symbols: ["mspcm", "ms/cm"],
    minValue: 0,
    maxValue: 100,
    toSiemensPerMeter: (v) =>
      Math.round((v / 10) * ROUND_FACTOR) / ROUND_FACTOR,
    fromSiemensPerMeter: (v) =>
      Math.round(v * 10 * ROUND_FACTOR) / ROUND_FACTOR,
  },
  MICROSIEMENS_PER_METER: {
    name: "Microsiemens per meter",
    symbols: ["uspm", "us/m"],
    minValue: 0,
    maxValue: 1e7,
    toSiemensPerMeter: (v) =>
      Math.round((v / 1e6) * ROUND_FACTOR) / ROUND_FACTOR,
    fromSiemensPerMeter: (v) =>
      Math.round(v * 1e6 * ROUND_FACTOR) / ROUND_FACTOR,
  },
  MICROSIEMENS_PER_CENTIMETER: {
    name: "Microsiemens per centimeter",
    symbols: ["uspcm", "us/cm"],
    minValue: 0,
    maxValue: 1e5,
    toSiemensPerMeter: (v) =>
      Math.round((v / 1e4) * ROUND_FACTOR) / ROUND_FACTOR,
    fromSiemensPerMeter: (v) =>
      Math.round(v * 1e4 * ROUND_FACTOR) / ROUND_FACTOR,
  },
  PARTS_PER_MILLION: {
    name: "Parts per million",
    symbols: ["ppm", "p/m"],
    minValue: 0,
    maxValue: 64000,
    toSiemensPerMeter: (v) =>
      Math.round((v / 1e4) * 1.5625 * ROUND_FACTOR) / ROUND_FACTOR,
    fromSiemensPerMeter: (v) =>
      Math.round(((v * 1e4) / 1.5625) * ROUND_FACTOR) / ROUND_FACTOR,
  },
};

export class Conductivity {
  value: number;
  unit: Unit;

  constructor(value: number, unit: Unit = UNITS.SIEMENS_PER_METER) {
    this.value = value;
    this.unit = unit;
  }

  static keyName = "conductivity";
  static displayName = "Conductivity";

  asSiemensPerMeter = () => this.unit.toSiemensPerMeter(this.value);
}

export const parseUnit = (unit: string) => {
  /* Returns a Unit from a given string. It throws a ZodError if the unit cannot be parsed. */
  const parsed = Object.values(UNITS).find((u) =>
    u.symbols.includes(unit.toLowerCase())
  );
  if (!parsed) {
    let options: Array<string> = [];
    Object.values(UNITS).forEach((u) => {
      options = options.concat(u.symbols);
    });
    throw new ZodError([
      {
        code: "invalid_enum_value",
        options,
        path: ["conductivity_unit"],
        message: `Unexpected unit ${unit.toLowerCase()}. Expected${options.map(
          (o) => " " + o
        )}.`,
      },
    ]);
  }
  return parsed;
};

export const parseConductivity = (
  value: number,
  unit: string = "spm"
): Conductivity => {
  /* Returns a Conductivity from a given value and unit.
   * It throws a ZodError if the unit cannot be parsed or if the value is out of range of the specified unit.
   */
  const u = parseUnit(unit);
  if (value < u.minValue) {
    throw new ZodError([
      {
        code: "too_small",
        path: ["conductivity"],
        type: "number",
        minimum: u.minValue,
        inclusive: true,
        message: `Value should be greater than or equal to ${u.minValue} ${u.name}.`,
      },
    ]);
  }
  if (value > u.maxValue) {
    throw new ZodError([
      {
        code: "too_big",
        path: ["conductivity"],
        type: "number",
        maximum: u.maxValue,
        inclusive: true,
        message: `Value should be less than or equal to ${u.maxValue} ${u.name}.`,
      },
    ]);
  }

  return new Conductivity(value, u);
};
