import convertTemperature from "lib/convertTemperature";
import convertConductivity from "lib/convertConductivity";

export default function (sensors) {
    // Converts all the sensor data provided. If units are not specified they will default to SI units.
    let converted = {}

    // Convert temperature
    if (sensors.temperature) {
        const unit = sensors.temperature_unit ?? "K";
        try {
            converted.temperature = convertTemperature(sensors.temperature, unit);
        } catch (e) {
            throw e;
        }
    }

    // Convert conductivity 
    if (sensors.conductivity) {
        const unit = sensors.conductivity_unit ?? "Spm";
        try {
            converted.conductivity = convertConductivity(sensors.conductivity, unit);
        } catch (e) {
            throw e;
        }
    }

    // Push back items that dont need to be converted.
    if (sensors.ph_level)
        converted.ph_level = sensors.ph_level;

    return converted;
}