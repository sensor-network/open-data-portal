import { ZodError } from 'zod';

const DECIMAL_COUNT = 3;
const ROUND_FACTOR = Math.pow(10, DECIMAL_COUNT);

interface Unit {
    name: string;
    symbol: string;
    minValue: number;
    maxValue: number;
    toKelvin: (v: number) => number;
    fromKelvin: (v: number) => number;
}

export const UNITS : { [name: string]: Unit } = {
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
        toKelvin: v => Math.round(((v + 459.67) * 5/9) * ROUND_FACTOR) / ROUND_FACTOR,
        fromKelvin: v => Math.round(((v - 273.15) * 9/5 + 32) * ROUND_FACTOR) / ROUND_FACTOR
    }
};

export class Temperature {
    value: number;
    unit: Unit;

    constructor(value: number, unit: Unit = UNITS.KELVIN) {
        this.value = value;
        this.unit  = unit;
    }

    asKelvin = () => this.unit.toKelvin(this.value);
}

export const parseTemperature = (value: number, unit: string = 'k') : Temperature => {
    let temperature : Temperature | undefined = undefined;
    Object.values(UNITS).forEach(u => {
        if (unit.toLowerCase() === u.symbol) {
            if (value < u.minValue)
                throw new ZodError([{
                    code: 'too_small',
                    path: [ 'temperature' ],
                    type: 'number',
                    minimum: u.minValue,
                    inclusive: true,
                    message: `Value should be greater than or equal to ${u.minValue} ${u.name}.`
                }]);
            if (value > u.maxValue)
                throw new ZodError([{
                    code: 'too_big',
                    path: [ 'temperature' ],
                    type: 'number',
                    maximum: u.maxValue,
                    inclusive: true,
                    message: `Value should be less than or equal to ${u.maxValue} ${u.name}.`
                }]);

            temperature = new Temperature(value, u);
        }
    });

    if (!temperature) {
        const options = Array.from(Object.values(UNITS), u => u.symbol);
        throw new ZodError([{
            code: "invalid_enum_value",
            options,
            path: [ 'temperature_unit' ],
            message: `Unexpected unit ${unit.toLowerCase()}. Expected${options.map(o => ' ' + o)}.`
        }]);
    }

    return temperature;
}