import convertTemperature from "lib/convertTemperature";
// import convertConductivity from "lib/convertConductivity";

export default function (sensors) {
    // Converts all the sensor data provided. If units are not specified they will default to SI units.
    let converted = {}

    // Convert temperature
    if (sensors.temperature) {
        const unit = sensors.temperature_unit || "K";
        try {
            converted.temperature = convertTemperature(sensors.temperature, unit);
        } catch (e) {
            throw e;
        }
    }

    // Convert conductivity 
    if (sensors.conductivity) {
        const unit = sensors.conductivity_unit || "";
        // converted.conductivity = convertConductivity(sensors.conductivity, unit);
    }

    return converted;
}