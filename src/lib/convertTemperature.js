import {ConversionError} from "lib/CustomErrors";
export default function(temperature, fromUnit) {
    // Converts the provided temperature measurement from the given unit to Kelvin
    // Returns the temperature value in Kelvin if successful, else -1
    const value = Number(temperature);
    if (isNaN(value))
        throw new ConversionError(`Provided temperature value '${temperature}' could not be parsed as a number.`);

    let ret;
    switch (fromUnit) {
        case 'K':
        case 'k':
            ret = value;
            break;
        case 'C':
        case 'c':
            ret = value + 273.15;
            break;
        case 'F':
        case 'f':
            ret = (value + 459.67) * 5/9;
            break;
        default:
            throw new ConversionError(`Provided temperature unit '${fromUnit}' is not supported. Read the documentation for valid parameters.`);
    }

    if (ret < 0)
        throw new ConversionError(`Provided temperature value '${value}' is below absolute zero.`);

    return Number(ret.toPrecision(7));
}