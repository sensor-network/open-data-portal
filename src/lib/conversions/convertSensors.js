import { parseConductivity } from "lib/units/conductivity";
import { parseTemperature } from "lib/units/temperature";
import {ZodError} from "zod";

const DECIMAL_COUNT = 2;
const ROUND_FACTOR = Math.pow(10, DECIMAL_COUNT);

export function sensorDataAsSI(sensors) {
    // Converts all the sensor data provided. If units are not specified they will default to SI units.
    let converted = {}

    if (!(sensors.temperature === undefined || sensors.temperature === null)) {
        try {
            converted.temperature = parseTemperature(sensors.temperature, sensors.temperature_unit).asKelvin();
        } catch (e) {
            throw e;
        }
    }

    if (!(sensors.conductivity === undefined || sensors.conductivity === null)) {
        try {
            converted.conductivity = parseConductivity(sensors.conductivity, sensors.conductivity_unit).asSiemensPerMeter();
        } catch (e) {
            throw e;
        }
    }

    // Push back items that don't need to be converted, after rounding them to 2 decimals.
    if (!(sensors.ph_level === undefined || sensors.ph_level === null))
        converted.ph_level = Math.round(sensors.ph_level * ROUND_FACTOR) / ROUND_FACTOR;

    /* Don't allow measurements without any datapoints */
    if (!Object.keys(converted).length) {
        throw new ZodError([{
            code: 'too_small',
            minimum: 1,
            inclusive: true,
            type: "number",
            path: ["sensors"],
            message: "Must contain at least one data-value. Did you specify only a unit?"
        }])
    }

    return converted;
}