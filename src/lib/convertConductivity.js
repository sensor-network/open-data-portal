import {ConversionError} from "lib/CustomErrors";
export default function (conductivity, unit) {
    // Converts the given `conductivity` from the given unit to `Siemens per metre`
    // Returns the conductivity in Spm (Siemens per metre) if successful, else `null`.
    const value = Number(conductivity);
    if (isNaN(value))
        throw new ConversionError(`Provided conductivity value '${value}' could not be parsed as a number.`);

    let ret;
    switch (unit) {
    case "S/m":
    case "Spm": // (Siemens per metre)
    case "mho/m":
    case "mhopm": // (Mho per metre)
        ret = value;
        break;

    case "mS/m":
    case "mSpm": // (millisiemens per metre)
        ret = value * 1E-3;
        break;
    
    case "uS/m":
    case "uSpm": // (microsiemens per metre)
        ret = value * 1E-6;
        break;

    case "S/cm":
    case "Spcm": // (Siemens per centimeter)
    case "mho/cm":
    case "mhopcm": // (Mho per centimeter)
        ret = value * 1E2;
        break;

    case "mS/cm":
    case "mSpcm":   // (millisiemens per centimeter)
        ret = value * 1E-1;
        break;
    
    case "uS/cm":
    case "uSpcm":   // (microsiemens per centimeter)
        ret = value * 1E-4;
        break;

    case "PPM":
    case "ppm":   // (parts per million)
        ret = value * 1.56 * 1E-4;
        break;

    default:
        throw new ConversionError(`Provided conductivity unit '${unit}' is not supported. Read the documentation for valid parameters.`);
    }

    return Number(ret.toPrecision(7));
}