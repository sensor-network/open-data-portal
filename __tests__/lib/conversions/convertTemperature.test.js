import {
    temperatureToKelvin as toK,
    temperatureFromKelvin as fromK
} from "../../../src/lib/conversions/convertTemperature";

Number.prototype.countDecimals = function () {
    if(Math.floor(this.valueOf()) === this.valueOf()) return 0;
    return this.toString().split(".")[1].length || 0;
}

describe("The conversion-functions throws if provided invalid input", () => {
    it("[toK] throws errors if the value cant be parsed as number", () => {
        expect(() => toK("20r", 'K')).toThrowError();
        expect(() => toK("smth", 'K')).toThrowError();
        expect(() => toK("twentytwo", 'C')).toThrowError();
        expect(() => toK("C", 'F')).toThrowError();
    });
    it("[fromK] throws errors if the value cant be parsed as number", () => {
        expect(() => fromK("20r", 'K')).toThrowError();
        expect(() => fromK("smth", 'K')).toThrowError();
        expect(() => fromK("twentytwo", 'C')).toThrowError();
        expect(() => fromK("C", 'F')).toThrowError();
    });

    it("[toK] throws errors if unit is not allowed", () => {
        expect(() => toK(0, 0)).toThrowError();
        expect(() => toK(270, 'CC')).toThrowError();
        expect(() => toK(50, 's')).toThrowError();
        expect(() => toK(0, 'kg')).toThrowError();
    });
    it("[fromK] throws errors if unit is not allowed", () => {
        expect(() => fromK(0, 0)).toThrowError();
        expect(() => fromK(270, 'CC')).toThrowError();
        expect(() => fromK(50, 's')).toThrowError();
        expect(() => fromK(0, 'kg')).toThrowError();
    });
});

/* Valid temperatures are 263.15 <= K <= 303.15 */
describe("Temperatures can be converted from Kelvin to Kelvin", () => {
    it("throws if temperature is out of range", () => {
        expect(() => toK(26, 'K')).toThrowError();
        expect(() => toK(263.14, 'K')).toThrowError();
        expect(() => toK(303.16, 'K')).toThrowError();
        expect(() => toK(500, 'K')).toThrowError();
    });

    it("should return the same value if within range", () => {
        expect(toK(263.15, 'K')).toEqual(263.15);
        expect(toK(270, 'K')).toEqual(270);
        expect(toK(280.123, 'K')).toEqual(280.123);
        expect(toK(303.15, 'K')).toEqual(303.15);

        expect(fromK(263.15, 'K')).toEqual(263.15);
        expect(fromK(270, 'K')).toEqual(270);
        expect(fromK(280.123, 'K')).toEqual(280.123);
        expect(fromK(303.15, 'K')).toEqual(303.15);
    });

    it("should round values to 3 decimals", () => {
        expect(toK(264.123123, 'K').countDecimals()).toEqual(3);
        expect(toK(264.567567, 'K').countDecimals()).toEqual(3);

        expect(fromK(264.123123, 'K').countDecimals()).toEqual(3);
        expect(fromK(264.567567, 'K').countDecimals()).toEqual(3);
    });

    it("returns values rounded correctly", () => {
        expect(toK(264, 'K')).toEqual(264.000);
        expect(toK(264.123, 'K')).toEqual(264.123);
        expect(toK(264.123123, 'K')).toEqual(264.123);
        expect(toK(264.567567, 'K')).toEqual(264.568);

        expect(fromK(264, 'K')).toEqual(264.000);
        expect(fromK(264.123, 'K')).toEqual(264.123);
        expect(fromK(264.123123, 'K')).toEqual(264.123);
        expect(fromK(264.567567, 'K')).toEqual(264.568);
    });
});

/* Valid temperatures are -10 <= C <= 30 */
describe("Temperatures can be converted from Celsius to Kelvin", () => {
    it("throws if temperature is out of range", () => {
        expect(() => toK(-30, 'C')).toThrowError();
        expect(() => toK(-10.1, 'C')).toThrowError();
        expect(() => toK(30.1, 'C')).toThrowError();
        expect(() => toK(500, 'C')).toThrowError();
    });

    it("should return the correct value if within range", () => {
        expect(toK(-10, 'C')).toEqual(263.15);
        expect(toK(0, 'C')).toEqual(273.15);
        expect(toK(20.6, 'C')).toEqual(293.75);
        expect(toK(30, 'C')).toEqual(303.15);
    });

    it("should round values to 3 decimals", () => {
        expect(toK(-5.123123, 'C').countDecimals()).toEqual(3);
        expect(toK(-5.567567, 'C').countDecimals()).toEqual(3);
        expect(toK(15.123123, 'C').countDecimals()).toEqual(3);
        expect(toK(15.567567, 'C').countDecimals()).toEqual(3);
    });

    it("returns values rounded correctly", () => {
        expect(toK(-5.123123, 'C')).toEqual(268.027);
        expect(toK(-5.567567, 'C')).toEqual(267.582);
        expect(toK(15.123123, 'C')).toEqual(288.273);
        expect(toK(15.567567, 'C')).toEqual(288.718);
    });
});

/* Valid temperatures are 14 <= F <= 86 */
describe("Temperatures can be converted from Fahrenheit to Kelvin", () => {
    it("throws if temperature is out of range", () => {
        expect(() => toK(0, 'F')).toThrowError();
        expect(() => toK(13.9, 'F')).toThrowError();
        expect(() => toK(86.1, 'F')).toThrowError();
        expect(() => toK(500, 'F')).toThrowError();
    });

    it("should return the correct value if within range", () => {
        expect(toK(14, 'F')).toEqual(263.15);
        expect(toK(17.33, 'F')).toEqual(265);
        expect(toK(29.93, 'F')).toEqual(272);
        expect(toK(86, 'F')).toEqual(303.15);
    });

    it("should round values to 3 decimals", () => {
        expect(toK(15.123123, 'F').countDecimals()).toEqual(3);
        expect(toK(20, 'F').countDecimals()).toEqual(3);
        expect(toK(70.567567, 'F').countDecimals()).toEqual(3);
        expect(toK(80, 'F').countDecimals()).toEqual(3);
    });

    it("returns values rounded correctly", () => {
        expect(toK(15.123123, 'F')).toEqual(263.774);
        expect(toK(20, 'F')).toEqual(266.483);
        expect(toK(20.567567, 'F')).toEqual(266.799);
        expect(toK(80, 'F')).toEqual(299.817);
    });
});


/* Valid inputs are 263.15 <= K <= 303.15 */
describe("Temperatures can be converted from Kelvin to Celsius", () => {
    it("should return the correct value", () => {
        expect(fromK(263.15, 'C')).toEqual(-10);
        expect(fromK(273.15, 'C')).toEqual(0);
        expect(fromK(300, 'C')).toEqual(26.85);
        expect(fromK(303.15, 'C')).toEqual(30);
    });

    it("should round values to 3 decimals", () => {
        expect(fromK(270.123123, 'C').countDecimals()).toEqual(3);
        expect(fromK(270.567567, 'C').countDecimals()).toEqual(3);
        expect(fromK(300.123123, 'C').countDecimals()).toEqual(3);
        expect(fromK(300.567567, 'C').countDecimals()).toEqual(3);
    });

    it("returns values rounded correctly", () => {
        expect(fromK(270.123123, 'C')).toEqual(-3.027);
        expect(fromK(270.567567, 'C')).toEqual(-2.582);
        expect(fromK(300.123123, 'C')).toEqual(26.973);
        expect(fromK(300.567567, 'C')).toEqual(27.418);
    });
});

describe("Temperatures can be converted from Kelvin to Fahrenheit", () => {
    it("should return the correct value", () => {
        expect(fromK(263.15, 'F')).toEqual(14);
        expect(fromK(273.15, 'F')).toEqual(32);
        expect(fromK(300, 'F')).toEqual(80.33);
        expect(fromK(303.15, 'F')).toEqual(86);
    });

    it("should round values to 3 decimals", () => {
        expect(fromK(270.123123, 'F').countDecimals()).toEqual(3);
        expect(fromK(270.567567, 'F').countDecimals()).toEqual(3);
        expect(fromK(300.123123, 'F').countDecimals()).toEqual(3);
        expect(fromK(300.567567, 'F').countDecimals()).toEqual(3);
    });

    it("returns values rounded correctly", () => {
        expect(fromK(270.123123, 'F')).toEqual(26.552);
        expect(fromK(270.567567, 'F')).toEqual(27.352);
        expect(fromK(300.123123, 'F')).toEqual(80.552);
        expect(fromK(300.567567, 'F')).toEqual(81.352);
    });
});
