import { parseConductivity } from "lib/units/conductivity";
import { parseTemperature } from "lib/units/temperature";

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

    // Push back items that don't need to be converted.
    if (!(sensors.ph_level === undefined || sensors.ph_level === null))
        converted.ph_level = sensors.ph_level;

    return converted;
}