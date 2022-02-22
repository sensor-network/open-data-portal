import {conductivityToSpm} from "../src/lib/conversions/convertConductivity"
import {conductivityFromSpm} from "../src/lib/conversions/convertConductivity"

const basic_test_cases = [
    {conductivity: 1, unit: "Spm", expected_output: 1},
    {conductivity: 1, unit: "mhopm", expected_output: 1},
    {conductivity: 1, unit: "mSpm", expected_output: 1E-3},
    {conductivity: 1, unit: "uSpm", expected_output: 1E-6},
    {conductivity: 1, unit: "Spcm", expected_output: 100},
    {conductivity: 1, unit: "mhopcm", expected_output: 100},
    {conductivity: 1, unit: "mSpcm", expected_output: 0.1},
    {conductivity: 1, unit: "uSpcm", expected_output: 1E-4},
    {conductivity: 1, unit: "ppm", expected_output: 0.000156},

]

const more_valid_tests = [
    {conductivity: "0.1", unit: "S/m", expected_output: 0.1},
    {conductivity: "0.12345678987654321", unit: "S/m", expected_output: 0.12345678987654321},
    {conductivity: "0.12345678987654321", unit: "mho/cm", expected_output: 12.345678987654},
]

const invalid_test_cases = [
    {conductivity: "a", unit: "mhopm"},
    {conductivity: "0,1", unit: "mhopm"},
]

describe("Conductivity measurements can be properly converted", () => {
    test("Conversion rates are correct", () => {
        for (const {conductivity, unit, expected_output} of basic_test_cases) {
            const output = conductivityToSpm(conductivity, unit);
            expect(output).toEqual(expected_output);
        }
    });

    test("Valid input is converted correctly", () => {
        for (const {conductivity, unit, expected_output} of more_valid_tests) {
            const output = conductivityToSpm(conductivity, unit);
            expect(output).toBeCloseTo(expected_output, 3);
        }
    });

    test("Passing invalid values should throw an error.", () => {
        for (const {conductivity, unit} of invalid_test_cases) {
            expect(() => conductivityToSpm(conductivity, unit)).toThrow();
        }
    });
});


// Test cases for the function tempratureFromSpm()
const basic_test_cases_from = [
    {conductivity: 1, unit: "Spm", expected_output: 1},
    {conductivity: 1, unit: "mhopm", expected_output: 1},
    {conductivity: 1, unit: "mSpm", expected_output: 1000},
    {conductivity: 1, unit: "uSpm", expected_output: 1000000},
    {conductivity: 1, unit: "Spcm", expected_output: 0.01},
    {conductivity: 1, unit: "mhopcm", expected_output: 0.01},
    {conductivity: 1, unit: "mSpcm", expected_output: 10},
    {conductivity: 1, unit: "uSpcm", expected_output: 10000},
    {conductivity: 1, unit: "ppm", expected_output: 6410.256},

]

const more_valid_tests_from = [
    {conductivity: "0.1", unit: "S/m", expected_output: 0.1},
    {conductivity: "0.12345678987654321", unit: "S/m", expected_output: 0.12345678987654321},
    {conductivity: "0.12345678987654321", unit: "mho/cm", expected_output: 0.0012345678987654321},
]

const invalid_test_cases_from = [
    {conductivity: "1", unit: "a"},
    {conductivity: "1", unit: "1"},
]

describe("Conductivity can be converted from the SI-unit (Spm) correctly", () => {
    test("Conversion rates are correct", () => {
        for (const {conductivity, unit, expected_output} of basic_test_cases_from) {
            const output = conductivityFromSpm(conductivity, unit);
            expect(output).toEqual(expected_output);
        }
    });

    test("Valid input is converted correctly", () => {
        for (const {conductivity, unit, expected_output} of more_valid_tests_from) {
            const output = conductivityFromSpm(conductivity, unit);
            expect(output).toBeCloseTo(expected_output, 3);
        }
    });

    test("Passing invalid values should throw an error.", () => {
        for (const {conductivity, unit} of invalid_test_cases_from) {
            expect(() => conductivityFromSpm(conductivity, unit)).toThrow();
        }
    });
});
