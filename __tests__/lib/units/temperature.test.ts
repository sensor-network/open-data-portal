import { Temperature, units, parseTemperature } from "../../../src/lib/units/temperature";

it("parses Kelvin correctly", () => {
    expect(() => parseTemperature(units.KELVIN.minValue - 1, 'k')).toThrow();

    const minTemp : Temperature = parseTemperature(units.KELVIN.minValue, 'k');
    expect(minTemp.value).toEqual(units.KELVIN.minValue);
    expect(minTemp.unit).toEqual(units.KELVIN);
    expect(minTemp.asKelvin()).toEqual(units.KELVIN.minValue);

    const maxTemp : Temperature = parseTemperature(units.KELVIN.maxValue, 'k');
    expect(maxTemp.value).toEqual(units.KELVIN.maxValue);
    expect(minTemp.unit).toEqual(units.KELVIN);
    expect(maxTemp.asKelvin()).toEqual(units.KELVIN.maxValue);

    expect(() => parseTemperature(units.KELVIN.maxValue + 1, 'k')).toThrow();
});

it("parses Celsius correctly", () => {
    expect(() => parseTemperature(units.CELSIUS.minValue - 1, 'c')).toThrow();

    const minTemp : Temperature = parseTemperature(units.CELSIUS.minValue, 'c');
    expect(minTemp.value).toEqual(units.CELSIUS.minValue);
    expect(minTemp.unit).toEqual(units.CELSIUS);
    expect(minTemp.asKelvin()).toEqual(units.KELVIN.minValue);

    const maxTemp : Temperature = parseTemperature(units.CELSIUS.maxValue, 'c');
    expect(maxTemp.value).toEqual(units.CELSIUS.maxValue);
    expect(minTemp.unit).toEqual(units.CELSIUS);
    expect(maxTemp.asKelvin()).toEqual(units.KELVIN.maxValue);

    expect(() => parseTemperature(units.CELSIUS.maxValue + 1, 'c')).toThrow();
});

it("parses Fahrenheit correctly", () => {
    expect(() => parseTemperature(units.FAHRENHEIT.minValue - 1, 'f')).toThrow();

    const minTemp : Temperature = parseTemperature(units.FAHRENHEIT.minValue, 'f');
    expect(minTemp.value).toEqual(units.FAHRENHEIT.minValue);
    expect(minTemp.unit).toEqual(units.FAHRENHEIT);
    expect(minTemp.asKelvin()).toEqual(units.KELVIN.minValue);

    const maxTemp : Temperature = parseTemperature(units.FAHRENHEIT.maxValue, 'f');
    expect(maxTemp.value).toEqual(units.FAHRENHEIT.maxValue);
    expect(minTemp.unit).toEqual(units.FAHRENHEIT);
    expect(maxTemp.asKelvin()).toEqual(units.KELVIN.maxValue);

    expect(() => parseTemperature(units.FAHRENHEIT.maxValue + 1, 'f')).toThrow();
});

it("handles unknown units", () => {
    expect(() => parseTemperature(20, 'e')).toThrow();
});

it("can retrieve values from kelvin", () => {
    const kVal = units.KELVIN.fromKelvin(300);
    expect(kVal).toEqual(300);

    const cVal = units.CELSIUS.fromKelvin(300);
    expect(cVal).toEqual(26.85);

    const fVal = units.FAHRENHEIT.fromKelvin(300);
    expect(fVal).toEqual(80.33);
});
