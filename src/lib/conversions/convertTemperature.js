import {ConversionError} from "../CustomErrors";
import {ZodError} from "zod";

const MIN_KELVIN = 263.15;
const MAX_KELVIN = 303.15;

export function temperatureToKelvin(temperature, fromUnit) {
    // Converts the provided temperature measurement from the given unit to Kelvin
    // Returns the temperature value in Kelvin if successful, else -1
    const value = Number(temperature);
    if (isNaN(value))
        // unreachable, Zod will only parse numbers from the /upload endpoint
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
            // unreachable, Zod only allows C, K, F for the unit
            throw new ConversionError(`Provided temperature unit '${fromUnit}' is not supported. Read the documentation for valid parameters.`);
    }

    let rounded = Math.round(ret * 1E3) / 1E3;  // round to 3 decimals
    if (rounded < MIN_KELVIN || rounded > MAX_KELVIN)
        // Using ZodError here to have them formatted the same way as the rest of the BAD_REQUEST-errors are
        throw new ZodError([{
            code: 'too_small',
            path: [ 'temperature' ],
            message: ret < MIN_KELVIN ? `Value should be greater than or equal to ${MIN_KELVIN} Kelvin` : `Value should be less than or equal to ${MAX_KELVIN} Kelvin`
        }]);
    return rounded;
}

export function temperatureFromKelvin(temperature, toUnit){
    //Converts the provided temperature measurement from Kelvin to the given unit
    // Returns the temperature value in Kelvin if successful, else -1
    const value = Number(temperature);
    if(isNaN(value))
        throw new ConversionError(`Provided temperature value '${temperature}' could not be parsed as a number.`);

    let ret;
    switch (toUnit){
        case 'K':
        case 'k':
            ret = value;
            break;
        case 'C':
        case 'c':
            ret = temperature - 273.15;
            break;
        case 'F':
        case 'f':
            ret = (value - 273.15) * 9/5 + 32;
            break;
        default:
            throw new ConversionError(`Provided temperature unit '${toUnit}' is not supported. Read the documentation for valid parameters.`);
    }

    return Math.round(ret * 1E3) / 1E3;  // round to 3 decimals
}