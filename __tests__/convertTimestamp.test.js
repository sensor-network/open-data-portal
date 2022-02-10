import convertTimestamp from "src/lib/convertTimestamp";

// Format: YYYY-MM-DDTHH:mm:ss
const test_cases1 = [
    {input_timestamp: "2022-01-01:12:34:56", offset: 0, expected_output: new Date("2022-01-01T12:34:56.000Z")},
    {input_timestamp: "2022-01-01:12:34:56", offset: 1, expected_output: new Date("2022-01-01T11:34:56.000Z")},
    {input_timestamp: "2022-01-01:12:34:56", offset: -1, expected_output: new Date("2022-01-01T13:34:56.000Z")},
    {input_timestamp: "2022-01-01:00:00:00", offset: 1, expected_output: new Date("2021-12-31T23:00:00.000Z")},

];

// Format: YYYY-MM-DDTHH:mm:ss.xxxZ
const test_cases2 = [
    {input_timestamp: "2022-01-01T12:34:56.000Z", offset: 0, expected_output: new Date("2022-01-01T12:34:56.000Z")}
]


describe("Timestamps can be converted to UTC time given a timestamp and an offset", () => {
    test("Timestamps on format 'YYYY-MM-DD:HH:mm:ss' can be converted", () => {
        for (const test_case of test_cases1) {
            const output = convertTimestamp(test_case.input_timestamp, test_case.offset);
            expect(output).toEqual(test_case.expected_output);
        }
    });
    
    test("Timestamps on format 'YYYY-MM-DDTHH:mm:ss.xxxZ' can be converted", () => {
        for (const test_case of test_cases2) {
            const output = convertTimestamp(test_case.input_timestamp, test_case.offset);
            expect(output).toEqual(test_case.expected_output);
        }
    });
});