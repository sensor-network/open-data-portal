// Testing response from /api/v1/upload
import next from 'next';

const BASE_URL = 'http://localhost:3000';

const reqInput = [
    {
        timestamp : "2022-02-09:09:58:50",
        UTC_offset: 1,
        latitude  : 56.34534523,
        longitude : 15.21341234,
        sensors   : {
            temperature     : 20,
            temperature_unit: "C"
        }
    },
    {
        timestamp : "2022-02-09:09:58:50",
        UTC_offset: -2,
        latitude  : 56.34534523,
        longitude : 15.21341234,
        sensors   : {
            temperature     : -273.15,
            temperature_unit: "C",
            ph_level: 6.9
        },
    }
];

const resOutput = [
    {
        timestamp: "2022-02-09T08:58:50.000Z",
        latitude: 56.34534523,
        longitude : 15.21341234,
        sensors: {
            temperature: 293.15,
        }
    },
    {
        timestamp: "2022-02-09T11:58:50.000Z",
        latitude: 56.34534523,
        longitude : 15.21341234,
        sensors: {
            temperature: 0,
            ph_level: 6.9
        }
    }
];

describe("The endpoint returns the correct response after a valid input", () => {
    // Test requires a valid server to test against, and is therefore not run by default.
    test.skip("", async () => {
        const response = await fetch(`${BASE_URL}/api/v1/upload`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body  : JSON.stringify(reqInput)
        });
        const data = await response.json();

        expect(data).toEqual(resOutput);
    });
});