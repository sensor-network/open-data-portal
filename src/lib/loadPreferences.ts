import {UNITS as TEMP_UNITS} from "lib/units/temperature";
import {UNITS as COND_UNITS} from "lib/units/conductivity";

export const loadPreferences = (prefCookieString: string) => {
    /* load preferences from cookies, or fallback to default values */
    let json;
    try {
        json = JSON.parse(prefCookieString);
    } catch (e) {}
    return {
        location: json?.location || { name: '', symbol: '' },
        temperature_unit:  json?.temperature_unit ||  { name: TEMP_UNITS.CELSIUS.name,           symbol: TEMP_UNITS.CELSIUS.symbol },
        conductivity_unit: json?.conductivity_unit || { name: COND_UNITS.PARTS_PER_MILLION.name, symbol: COND_UNITS.PARTS_PER_MILLION.symbols[0] }
    }
};