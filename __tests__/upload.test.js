// Testing response from /api/v1/upload
import next from 'next';

const reqInput = JSON.stringify({
    timestamp : "2022-02-09T09:58:50.093Z",
    UTC_offset: 1,
    latitude  : 56.34534523,
    longitude : 15.21341234,
    sensors   : {
        temperature     : 20,
        temperature_unit: "C"
    }
});

const resOutput = {
    timestamp: "2022-02-09T08:58:50.093Z",
    latitude: 56.34534523,
    longitude : 15.21341234,
    sensors: {
        temperature: 293.15,
    }
};

test("The endpoint returns the correct response after a valid input", async () => {
    const response = await fetch("http://localhost:3001/api/v1/upload", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body  : reqInput
    });
    const data = await response.json();

    expect(data).toEqual(resOutput);
})