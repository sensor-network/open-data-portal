import {ConversionError} from "../CustomErrors";

export function temperatureToKelvin(temperature, fromUnit) {
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

    return ret;
}

export function temperatureFromKelvin(temperature, toUnit){
    //Converts the provided tmperature measurement from Kelvin to the given unit
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

    return ret;
}