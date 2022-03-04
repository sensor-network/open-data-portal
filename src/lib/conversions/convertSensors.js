import { temperatureToKelvin } from "./convertTemperature";
import { conductivityToSpm } from "./convertConductivity";

export function sensorDataAsSI(sensors) {
    // Converts all the sensor data provided. If units are not specified they will default to SI units.
    let converted = {}

    // Convert temperature
    if (!(sensors.temperature === undefined || sensors.temperature === null)) {
        const unit = sensors.temperature_unit ?? "K";
        try {
            converted.temperature = temperatureToKelvin(sensors.temperature, unit);
        } catch (e) {
            throw e;
        }
    }

    // Convert conductivity 
    if (!(sensors.conductivity === undefined || sensors.conductivity === null)) {
        const unit = sensors.conductivity_unit ?? "Spm";
        try {
            converted.conductivity = conductivityToSpm(sensors.conductivity, unit);
        } catch (e) {
            throw e;
        }
    }

    // Push back items that don't need to be converted.
    if (!(sensors.ph_level === undefined || sensors.ph_level === null))
        converted.ph_level = sensors.ph_level;

    return converted;
}