import { ZodError } from 'zod';
import { DECIMAL_PLACES } from 'src/lib/constants';

const ROUND_FACTOR = Math.pow(10, DECIMAL_PLACES);

interface Unit {
  name: string;
  symbol: string;
  minValue: number;
  maxValue: number;
  toKelvin: (v: number) => number;
  fromKelvin: (v: number) => number;
}

export const UNITS: { [name: string]: Unit } = {
  KELVIN: {
    name: 'Kelvin',
    symbol: 'k',
    minValue: 263.15,
    maxValue: 303.15,
    toKelvin: v => v,
    fromKelvin: v => v
  },
  CELSIUS: {
    name: 'Celsius',
    symbol: 'c',
    minValue: -10,
    maxValue: 30,
    toKelvin: v => Math.round((v + 273.15) * ROUND_FACTOR) / ROUND_FACTOR,
    fromKelvin: v => Math.round((v - 273.15) * ROUND_FACTOR) / ROUND_FACTOR
  },
  FAHRENHEIT: {
    name: 'Fahrenheit',
    symbol: 'f',
    minValue: 14,
    maxValue: 86,
    toKelvin: v => Math.round(((v + 459.67) * 5 / 9) * ROUND_FACTOR) / ROUND_FACTOR,
    fromKelvin: v => Math.round(((v - 273.15) * 9 / 5 + 32) * ROUND_FACTOR) / ROUND_FACTOR
  }
};

export class Temperature {
  value: number;
  unit: Unit;

  constructor(value: number, unit: Unit = UNITS.KELVIN) {
    this.value = value;
    this.unit = unit;
  }

  asKelvin = () => this.unit.toKelvin(this.value);
}

export const parseUnit = (unit: string) => {
  /* Returns a Unit from a given string. It throws a ZodError if the unit cannot be parsed. */
  const parsed = Object.values(UNITS).find(u => u.symbol === unit.toLowerCase());
  if (!parsed) {
    const options = Array.from(Object.values(UNITS), u => u.symbol);
    throw new ZodError([{
      code: "invalid_enum_value",
      options,
      path: ['temperature_unit'],
      message: `Unexpected unit ${unit.toLowerCase()}. Expected${options.map(o => ' ' + o)}.`
    }]);
  }
  return parsed;
};

export const parseTemperature = (value: number, unit: string = 'k'): Temperature => {
  /* Returns a Temperature from a given value and unit.
   * It throws a ZodError if the unit cannot be parsed or if the value is out of range of the specified unit.
   */
  const u = parseUnit(unit);
  if (value < u.minValue) {
    throw new ZodError([{
      code: 'too_small',
      path: ['temperature'],
      type: 'number',
      minimum: u.minValue,
      inclusive: true,
      message: `Value should be greater than or equal to ${u.minValue} ${u.name}.`
    }]);
  }
  if (value > u.maxValue) {
    throw new ZodError([{
      code: 'too_big',
      path: ['temperature'],
      type: 'number',
      maximum: u.maxValue,
      inclusive: true,
      message: `Value should be less than or equal to ${u.maxValue} ${u.name}.`
    }]);
  }

  return new Temperature(value, u);
};