import {timestampToUTC} from "../src/lib/conversions/convertTimestamp";

// Format: YYYY-MM-DDTHH:mm:ss
const test_cases1 = [
    {input_timestamp: "2022-01-01:12:34:56", offset: 0, expected_output: "2022-01-01 12:34:56"},
    {input_timestamp: "2022-01-01:12:34:56", offset: 1, expected_output: "2022-01-01 11:34:56"},
    {input_timestamp: "2022-01-01:12:34:56", offset: -1, expected_output: "2022-01-01 13:34:56"},
    {input_timestamp: "2022-01-01:00:00:00", offset: 1, expected_output: "2021-12-31 23:00:00"},

];

// Format: YYYY-MM-DDTHH:mm:ss.xxxZ
const test_cases2 = [
    {input_timestamp: "2022-01-01T12:34:56.000Z", offset: 0, expected_output: "2022-01-01 12:34:56"}
]


describe("Timestamps can be converted to UTC time given a timestamp and an offset", () => {
    test("Timestamps on format 'YYYY-MM-DD:HH:mm:ss' can be converted", () => {
        for (const test_case of test_cases1) {
            const output = timestampToUTC(test_case.input_timestamp, test_case.offset);
            expect(output).toEqual(test_case.expected_output);
        }
    });
    
    /*test("Timestamps on format 'YYYY-MM-DDTHH:mm:ss.xxxZ' can be converted", () => {
        for (const test_case of test_cases2) {
            const output = timestampToUTC(test_case.input_timestamp, test_case.offset);
            expect(output).toEqual(test_case.expected_output);
        }
    });*/
});
