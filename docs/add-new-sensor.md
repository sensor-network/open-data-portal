# Checklist after adding a new sensor

You could add a new sensor to the system without any work needed. However, there are a few things to keep in mind:

## Units

All sensor-types which doesn't have a unit implemented in [units](/src/lib/units/) should be treated as their [SI](https://en.wikipedia.org/wiki/International_System_of_Units)-representative. That is, **Kelvin** for temperature, **Siemens per Meter** for conductivity etc. If you want to use separate units, you should implement a unit for the sensor

_Note: As seen in the [units](/src/lib/units/)-directory, there is a unit for [PH](/src/lib/units/ph.ts) even though there is only a single scale for PH. In this regard, the unit is used to validate the input range._

### Implement a Class for the sensor with the available Units

Take a closer look at one of the already implemented units. They contain

1. `Unit`-interface:

```ts
// temperature.ts
interface Unit {
  name: string;
  symbols: Array<string>;
  minValue: number;
  maxValue: number;
  toKelvin: (v: number) => number;
  fromKelvin: (v: number) => number;
}
```

2. all the available `Units`:

```ts
export const UNITS: { [name: string]: Unit } = {
  KELVIN: {
    name: 'Kelvin',
    symbol: 'k',
    minValue: 263.15,
    maxValue: 303.15,
    toKelvin: v => v,
    fromKelvin: v => v
  },
  ...
};
```

3. the type's Class:

```ts
export class Temperature {
  value: number;
  unit: Unit;

  constructor(value: number, unit: Unit = UNITS.KELVIN) {
    this.value = value;
    this.unit = unit;
  }

  static keyName = "temperature";
  static displayName = "Temperature";

  asKelvin = () => this.unit.toKelvin(this.value);
}
```

4. as well as parsing methods.

```ts
export const parseUnit = (unit: string) => {
  ...
};

export const parseTemperature = (value: number, unit: string = 'k'): Temperature => {
  ...
}
```

After implementing the unit for your new sensor, you can make use of it in the API.

### Usage

The files you need to modify are **(row-numbers could have changed since writing this)**:

#### **/measurements API-route**

- [index](/src/pages/api/v3/measurements/index.ts)
- [history](/src/pages/api/v3/measurements/history.ts)

_Check all methods, e.g. GET and POST. These rows are from GET: index_

1. Add the ability to enter the unit as a query parameter:

```ts
43. const temperatureUnit = parseTempUnit(
      z // we use Zod validator to ensure inputs are valid
        .string()
        .default("k") // default symbol for the unit
        .parse(req.query.temperatureUnit) // the query parameter
    );
```

2. Do the actual unit-conversion

```ts
156. measurements.forEach(({ sensors }) => {
       if (Temperature.keyName in sensors) {
         sensors.temperature = temperatureUnit
           .fromKelvin(sensors.temperature);
       }
       ...
     };
```

3. Return that you used a specific unit:

```ts
173. res.status(STATUS.OK).json({
       ...,
       units: {
         temperature: temperatureUnit.symbol,
         ...
       },
     };
```

#### **Preferences**

Preferences are used to store the user-specified units between session.

- [load-preferences](/src/lib/utils/load-preferences.ts)

Include the usages:

```ts
const DEFAULT_TEMP = TEMP_UNITS.CELSIUS;

export type Preferences = {
  temperatureUnit: PreferenceItem;
  ...
};

export const loadPreferences = (prefCookieString: string): Preferences => {
  try {
    ...
    return {
      temperatureUnit: json.temperatureUnit,
      ...
    };
  } catch (e) {
    return {
      temperatureUnit: {
        name: DEFAULT_TEMP.name,
        symbol: DEFAULT_TEMP.symbol,
      },
      ...
    };
  }
};
```

#### **PreferenceModal**

- [PreferenceModal.jsx](/src/components/PreferenceModal.jsx)

Include it as an option in the dropdown

```ts
23. const preferenceOptions = useMemo(() => {
      return [
        {
          name: "Temperature",
          key: "temperatureUnit",
          options: Object.values(TEMP_UNITS).map((u) => ({
            name: u.name,
            symbol: u.symbol,
          })),
          default: preferences.temperatureUnit,
        },
        ...
      ];
    }, [locations, preferences]);
```

#### Measurement Fetching Components

Other than those specified already, there are a lot of components that fetches measurements using the preferred unit.
Examples are:

- [Summary.jsx](/src/components/Summary.tsx)
- [LocationRow.jsx]()
- [Map.tsx](/src/components/Map.tsx)
- [ServerPaginationGrid.tsx](/src/components/ServerPaginationGrid.jsx)

Usages varies from case to case, but usually looks something like this:

```ts
const url = useMemo(
  () =>
    urlWithParams(ENDPOINT, {
      temperatureUnit: preferences.temperatureUnit.symbol,
      ...
    }),
  [preferences, ...]
);
```
