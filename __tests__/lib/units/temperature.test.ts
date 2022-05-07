import { Temperature, UNITS, parseTemperature } from "~/lib/units/temperature";

it("constructs Temperature-instances correctly", () => {
  const tempInstance = new Temperature(20, UNITS.CELSIUS);
  expect(tempInstance).toBeInstanceOf(Temperature);
  expect(tempInstance.unit).toEqual(UNITS.CELSIUS);
  expect(tempInstance.value).toEqual(20);
  expect(tempInstance.asKelvin()).toEqual(293.15);
});

it("instantiates Temperatures as Kelvin if nothing else specified", () => {
  const tempInstance = new Temperature(20);
  expect(tempInstance).toBeInstanceOf(Temperature);
  expect(tempInstance.unit).toEqual(UNITS.KELVIN);
  expect(tempInstance.value).toEqual(20);
  expect(tempInstance.asKelvin()).toEqual(20);
});

it("parses Temperatures as Kelvin if nothing else specified", () => {
  expect(() => parseTemperature(UNITS.KELVIN.minValue - 1)).toThrow();

  const minTemp: Temperature = parseTemperature(UNITS.KELVIN.minValue);
  expect(minTemp).toBeInstanceOf(Temperature);
  expect(minTemp.value).toEqual(UNITS.KELVIN.minValue);
  expect(minTemp.unit).toEqual(UNITS.KELVIN);
  expect(minTemp.asKelvin()).toEqual(UNITS.KELVIN.minValue);

  const maxTemp: Temperature = parseTemperature(UNITS.KELVIN.maxValue);
  expect(maxTemp).toBeInstanceOf(Temperature);
  expect(maxTemp.value).toEqual(UNITS.KELVIN.maxValue);
  expect(minTemp.unit).toEqual(UNITS.KELVIN);
  expect(maxTemp.asKelvin()).toEqual(UNITS.KELVIN.maxValue);

  expect(() => parseTemperature(UNITS.KELVIN.maxValue + 1)).toThrow();
});

it("parses Kelvin correctly", () => {
  expect(() => parseTemperature(UNITS.KELVIN.minValue - 1, "k")).toThrow();

  const minTemp: Temperature = parseTemperature(UNITS.KELVIN.minValue, "k");
  expect(minTemp).toBeInstanceOf(Temperature);
  expect(minTemp.value).toEqual(UNITS.KELVIN.minValue);
  expect(minTemp.unit).toEqual(UNITS.KELVIN);
  expect(minTemp.asKelvin()).toEqual(UNITS.KELVIN.minValue);

  const maxTemp: Temperature = parseTemperature(UNITS.KELVIN.maxValue, "k");
  expect(maxTemp).toBeInstanceOf(Temperature);
  expect(maxTemp.value).toEqual(UNITS.KELVIN.maxValue);
  expect(minTemp.unit).toEqual(UNITS.KELVIN);
  expect(maxTemp.asKelvin()).toEqual(UNITS.KELVIN.maxValue);

  expect(() => parseTemperature(UNITS.KELVIN.maxValue + 1, "k")).toThrow();
});

it("parses Celsius correctly", () => {
  expect(() => parseTemperature(UNITS.CELSIUS.minValue - 1, "c")).toThrow();

  const minTemp: Temperature = parseTemperature(UNITS.CELSIUS.minValue, "c");
  expect(minTemp).toBeInstanceOf(Temperature);
  expect(minTemp.value).toEqual(UNITS.CELSIUS.minValue);
  expect(minTemp.unit).toEqual(UNITS.CELSIUS);
  expect(minTemp.asKelvin()).toEqual(UNITS.KELVIN.minValue);

  const maxTemp: Temperature = parseTemperature(UNITS.CELSIUS.maxValue, "c");
  expect(maxTemp).toBeInstanceOf(Temperature);
  expect(maxTemp.value).toEqual(UNITS.CELSIUS.maxValue);
  expect(minTemp.unit).toEqual(UNITS.CELSIUS);
  expect(maxTemp.asKelvin()).toEqual(UNITS.KELVIN.maxValue);

  expect(() => parseTemperature(UNITS.CELSIUS.maxValue + 1, "c")).toThrow();
});

it("parses Fahrenheit correctly", () => {
  expect(() => parseTemperature(UNITS.FAHRENHEIT.minValue - 1, "f")).toThrow();

  const minTemp: Temperature = parseTemperature(UNITS.FAHRENHEIT.minValue, "f");
  expect(minTemp).toBeInstanceOf(Temperature);
  expect(minTemp.value).toEqual(UNITS.FAHRENHEIT.minValue);
  expect(minTemp.unit).toEqual(UNITS.FAHRENHEIT);
  expect(minTemp.asKelvin()).toEqual(UNITS.KELVIN.minValue);

  const maxTemp: Temperature = parseTemperature(UNITS.FAHRENHEIT.maxValue, "f");
  expect(maxTemp).toBeInstanceOf(Temperature);
  expect(maxTemp.value).toEqual(UNITS.FAHRENHEIT.maxValue);
  expect(minTemp.unit).toEqual(UNITS.FAHRENHEIT);
  expect(maxTemp.asKelvin()).toEqual(UNITS.KELVIN.maxValue);

  expect(() => parseTemperature(UNITS.FAHRENHEIT.maxValue + 1, "f")).toThrow();
});

it("handles unknown units", () => {
  expect(() => parseTemperature(20, "e")).toThrow();
});

it("can retrieve values from kelvin", () => {
  const kVal = UNITS.KELVIN.fromKelvin(300);
  expect(kVal).toEqual(300);

  const cVal = UNITS.CELSIUS.fromKelvin(300);
  expect(cVal).toEqual(26.85);

  const fVal = UNITS.FAHRENHEIT.fromKelvin(300);
  expect(fVal).toEqual(80.33);
});
