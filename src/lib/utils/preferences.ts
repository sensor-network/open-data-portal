import { createContext } from "react";

import { UNITS as TEMP_UNITS } from "lib/units/temperature";
import { UNITS as COND_UNITS } from "lib/units/conductivity";
import type { Location } from "~/lib/database/location";

const DEFAULT_TEMP = TEMP_UNITS.CELSIUS;
const DEFAULT_COND = COND_UNITS.SIEMENS_PER_METER;

export type PreferenceItem = { name: string; symbol: string };
export type Preferences = {
  location: PreferenceItem;
  temperatureUnit: PreferenceItem;
  conductivityUnit: PreferenceItem;
};

export type PreferenceContextType = {
  preferences: Preferences;
  locations: Location[] | undefined;
};

export const PreferenceContext = createContext<PreferenceContextType>(
  {} as PreferenceContextType
);

export const loadPreferences = (prefCookieString: string): Preferences => {
  /* load preferences from cookies, or fallback to default values */
  try {
    const json = JSON.parse(prefCookieString) as {
      [key: string]: PreferenceItem;
    };
    return {
      location: json.location,
      temperatureUnit: json.temperatureUnit,
      conductivityUnit: json.conductivityUnit,
    };
  } catch (e) {
    return {
      location: { name: "Everywhere", symbol: "Everywhere" },
      temperatureUnit: {
        name: DEFAULT_TEMP.name,
        symbol: DEFAULT_TEMP.symbol,
      },
      conductivityUnit: {
        name: DEFAULT_COND.name,
        symbol: DEFAULT_COND.symbols[0],
      },
    };
  }
};

export const getPreferredUnitSymbol = (
  entryString: string,
  preferences: Preferences
) => {
  /* get the preferred unit for a given key */
  const preferenceEntry = Object.entries(preferences).find(
    ([key, value]) => key === entryString
  );
  if (preferenceEntry) {
    return preferenceEntry[1].symbol;
  }
  return "";
};
