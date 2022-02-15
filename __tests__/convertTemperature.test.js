import {temperatureToKelvin} from "../src/lib/conversions/convertTemperature";

const valid_test_cases = [
    {input_temperature: 0,       temperature_unit: "K", expected_output: 0},
    {input_temperature: 1,       temperature_unit: "K", expected_output: 1},
    {input_temperature: 1.2,     temperature_unit: "K", expected_output: 1.2},
    {input_temperature: -273.15, temperature_unit: "C", expected_output: 0},
    {input_temperature: 0,       temperature_unit: "c", expected_output: 273.15},
    {input_temperature: -459.67, temperature_unit: "F", expected_output: 0},
    {input_temperature: -50,     temperature_unit: "f", expected_output: 227.594},
    {input_temperature: "-50",   temperature_unit: "f", expected_output: 227.594},
];

const invalid_test_cases = [
    {input: 123,     temperature_unit: 4},
    {input: "123",   temperature_unit: "j"},
    {input: "abc",   temperature_unit: "C"},
    {input: "123,5", temperature_unit: "f"},
]

describe("Temperatures can be converted to SI-unit (K) correctly", () => {
    test("Valid input shall return the expected output", () => {
        for (const {input_temperature, temperature_unit, expected_output} of valid_test_cases) {
            const output = temperatureToKelvin(input_temperature, temperature_unit);
            expect(output).toBeCloseTo(expected_output, 3);
        }
    })

    test("Invalid input should throw errors", () => {
        for (const {input, temperature_unit} of invalid_test_cases) {
            expect(() => {temperatureToKelvin(input, temperature_unit)}).toThrowError()
        }
    })
});