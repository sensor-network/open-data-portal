import { ConversionError } from "../CustomErrors";
import { ZodError } from "zod";

const MIN_SPM = 0;
const MAX_SPM = 10;

export function conductivityToSpm(conductivity, unit) {
    // Converts the given `conductivity` from the given unit to `Siemens per metre`
    // Returns the conductivity in Spm (Siemens per metre) if successful, else `null`.
    const value = Number(conductivity);
    if (isNaN(value))
        // unreachable, Zod will only parse numbers from the /upload endpoint
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
            ret = value * 1.5625 * 1E-4;
            break;

        default:
            // unreachable, Zod only allows for valid units
            throw new ConversionError(`Provided conductivity unit '${unit}' is not supported. Read the documentation for valid parameters.`);
    }

    let rounded = Math.round(ret * 1E3) / 1E3;  // round to 3 decimals
    if (rounded < MIN_SPM)
        // Using ZodError here to have them formatted the same way as the rest of the BAD_REQUEST-errors are
        throw new ZodError([{
            code: 'too_small',
            path: [ 'conductivity' ],
            message: `Value should be greater than or equal to ${MIN_SPM} Siemens per metre`
        }]);
    else if (rounded > MAX_SPM)
        throw new ZodError([{
            code: 'too_large',
            path: [ 'conductivity' ],
            message: `Value should be less than or equal to ${MAX_SPM} Siemens per metre`
        }]);
    return rounded;
}

export function conductivityFromSpm(conductivity, unit) {
    // Converts the provided conductivity measurement from spm to the given unit
    // Returns the conductivity in the chosen unit if successful, else `null`.
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
            ret = value / 1E-3;
            break;

        case "uS/m":
        case "uSpm": // (microsiemens per metre)
            ret = value / 1E-6;
            break;

        case "S/cm":
        case "Spcm": // (Siemens per centimeter)
        case "mho/cm":
        case "mhopcm": // (Mho per centimeter)
            ret = value / 1E2;
            break;

        case "mS/cm":
        case "mSpcm":   // (millisiemens per centimeter)
            ret = value / 1E-1;
            break;

        case "uS/cm":
        case "uSpcm":   // (microsiemens per centimeter)
            ret = value / 1E-4;
            break;

        case "PPM":
        case "ppm":   // (parts per million)
            ret = value / 1.5625 / 1E-4;
            break;

        default:
            throw new ConversionError(`Provided conductivity unit '${unit}' is not supported. Read the documentation for valid parameters.`);
    }

    return Math.round(ret * 1E3) / 1E3;
}
