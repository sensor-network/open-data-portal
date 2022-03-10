import {
    conductivityToSpm as toSpm,
    conductivityFromSpm as fromSpm
} from "../../../src/lib/conversions/convertConductivity"

Number.prototype.countDecimals = function () {
    if(Math.floor(this.valueOf()) === this.valueOf()) return 0;
    return this.toString().split(".")[1].length || 0;
}

describe("The conversion-functions throws if provided invalid input", () => {
    it("[toSpm] throws if the value cant be parsed as number", () => {
        expect(() => toSpm('20e', 'Spm')).toThrowError();
        expect(() => toSpm('smth', 'mS/m')).toThrowError();
        expect(() => toSpm('two', 'ppm')).toThrowError();
        expect(() => toSpm('Spm', 'ppm')).toThrowError();
    });
    it("[fromSpm] throws if the value cant be parsed as number", () => {
        expect(() => fromSpm('20e', 'Spm')).toThrowError();
        expect(() => fromSpm('smth', 'mS/m')).toThrowError();
        expect(() => fromSpm('two', 'ppm')).toThrowError();
        expect(() => fromSpm('Spm', 'ppm')).toThrowError();
    });

    it("[toSpm] throws if the unit is not allowed", () => {
        expect(() => toSpm(0, 'C')).toThrowError();
        expect(() => toSpm(2, 'Spum')).toThrowError();
        expect(() => toSpm(5.545, 'kg')).toThrowError();
        expect(() => toSpm(10, 30)).toThrowError();
    });
    it("[fromSpm] throws if the unit is not allowed", () => {
        expect(() => fromSpm(0, 'C')).toThrowError();
        expect(() => fromSpm(2, 'Spum')).toThrowError();
        expect(() => fromSpm(5.545, 'kg')).toThrowError();
        expect(() => fromSpm(10, 30)).toThrowError();
    });
});

describe("The conversion rates are correct", () => {
    describe("Spm and its derivaties", () => {
        it("Spm -> Spm", () => { expect(toSpm(1, 'Spm')).toEqual(1); });
        it("S/m -> Spm", () => { expect(toSpm(1, 'S/m')).toEqual(1); });
        it("mhopm -> Spm", () => { expect(toSpm(1, 'mhopm')).toEqual(1); });
        it("mho/m -> Spm", () => { expect(toSpm(1, 'mho/m')).toEqual(1); });

        it("Spm -> Spm", () => { expect(fromSpm(1, 'Spm')).toEqual(1); });
        it("Spm -> S/m", () => { expect(fromSpm(1, 'S/m')).toEqual(1); });
        it("Spm -> mhopm", () => { expect(fromSpm(1, 'mhopm')).toEqual(1); });
        it("Spm -> mho/m", () => { expect(fromSpm(1, 'mho/m')).toEqual(1); });
    });

    describe("mSpm and its derivatives", () => {
        it("mSpm -> Spm", () => { expect(toSpm(1E3, 'mSpm')).toEqual(1); });
        it("mS/m -> Spm", () => { expect(toSpm(1E3, 'mS/m')).toEqual(1); });

        it("Spm -> mSpm", () => { expect(fromSpm(1, 'mSpm')).toEqual(1E3); });
        it("Spm -> mS/m", () => { expect(fromSpm(1, 'mS/m')).toEqual(1E3); });
    });

    describe("uSpm and its derivatives", () => {
        it("uSpm -> Spm", () => { expect(toSpm(1E6, 'uSpm')).toEqual(1); });
        it("uS/m -> Spm", () => { expect(toSpm(1E6, 'uS/m')).toEqual(1); });

        it("Spm -> uSpm", () => { expect(fromSpm(1, 'uSpm')).toEqual(1E6); });
        it("Spm -> uS/m", () => { expect(fromSpm(1, 'uS/m')).toEqual(1E6); });
    });

    describe("Spcm and its derivatives", () => {
        it("Spcm -> Spm", () => { expect(toSpm(0.01, 'Spcm')).toEqual(1); });
        it("Sp/m -> Spm", () => { expect(toSpm(0.01, 'S/cm')).toEqual(1); });
        it("mhopcm -> Spm", () => { expect(toSpm(0.01, 'mhopcm')).toEqual(1); });
        it("mho/cm -> Spm", () => { expect(toSpm(0.01, 'mho/cm')).toEqual(1); });

        it("Spm -> Spcm", () => { expect(fromSpm(1, 'Spcm')).toEqual(0.01); });
        it("Spm -> S/cm", () => { expect(fromSpm(1, 'S/cm')).toEqual(0.01); });
        it("Spm -> mhopcm", () => { expect(fromSpm(1, 'mhopcm')).toEqual(0.01); });
        it("Spm -> mho/cm", () => { expect(fromSpm(1, 'mho/cm')).toEqual(0.01); });
    });

    describe("mSpcm and its derivatives", () => {
        it("mSpcm -> Spm", () => { expect(toSpm(1, 'mSpcm')).toEqual(0.1); });
        it("mS/cm -> Spm", () => { expect(toSpm(1, 'mS/cm')).toEqual(0.1); });

        it("Spm -> mSpcm", () => { expect(fromSpm(0.1, 'mSpcm')).toEqual(1); });
        it("Spm -> mS/cm", () => { expect(fromSpm(0.1, 'mS/cm')).toEqual(1); });
    });

    describe("uSpcm and its derivatives", () => {
        it("uSpcm -> Spm", () => { expect(toSpm(1E4, 'uSpcm')).toEqual(1); });
        it("uS/cm -> Spm", () => { expect(toSpm(1E4, 'uS/cm')).toEqual(1); });

        it("Spm -> uSpcm", () => { expect(fromSpm(1, 'uSpcm')).toEqual(1E4); });
        it("Spm -> uS/cm", () => { expect(fromSpm(1, 'uS/cm')).toEqual(1E4); });
    });

    describe("ppm and its derivatives", () => {
        it("ppm -> Spm", () => { expect(toSpm(1E4, 'ppm')).toEqual(1.563); }); // actual value 1.5625
        it("PPM -> Spm", () => { expect(toSpm(1E4, 'PPM')).toEqual(1.563); }); // actual value 1.5625

        it("Spm -> ppm", () => { expect(fromSpm(1.5625, 'ppm')).toEqual(1E4); });
        it("Spm -> PPM", () => { expect(fromSpm(1.5625, 'PPM')).toEqual(1E4); });
    });
});

/* Valid values are the equivalent of 0 <= Spm <= 10 */
describe("The conversion to Spm throws if value if out of range", () => {
    describe("should throw if value is greater than the equivalent of 10 Spm", () => {
        it("11 Spm      =>  11 Spm", () => { expect(() => toSpm(11, 'Spm')).toThrowError(); });
        it("1.1E4 mSpm  =>  11 Spm", () => { expect(() => toSpm(1.1E4, 'mSpm')).toThrowError(); });
        it("1.1E7 uSpm  =>  11 Spm", () => { expect(() => toSpm(1.1E7, 'uSpm')).toThrowError(); });
        it("0.11 Spcm   =>  11 Spm", () => { expect(() => toSpm(0.11, 'Spcm')).toThrowError(); });
        it("110 mSpcm   =>  11 Spm", () => { expect(() => toSpm(110, 'mSpcm')).toThrowError(); });
        it("1.1E5 uSpcm =>  11 Spm", () => { expect(() => toSpm(1.1E5, 'uSpcm')).toThrowError(); });
        it("7E5 ppm     => ~11 Spm", () => { expect(() => toSpm(7E5, 'ppm')).toThrowError(); });
    });
    describe("should throw if value is less than the equivalent of 0 Spm", () => {
        it("-1 Spm     => -0.1 Spm", () => { expect(() => toSpm(-0.1, 'Spm')).toThrowError(); });
        it("-100 mSpm  => -0.1 Spm", () => { expect(() => toSpm(-100, 'mSpm')).toThrowError(); });
        it("-1E5 uSpm  => -0.1 Spm", () => { expect(() => toSpm(-1E5, 'uSpm')).toThrowError(); });
        it("-1E-3 Spcm => -0.1 Spm", () => { expect(() => toSpm(-1E-3, 'Spcm')).toThrowError(); });
        it("-1 mSpcm   => -0.1 Spm", () => { expect(() => toSpm(-1, 'mSpcm')).toThrowError(); });
        it("-1E3 uSpcm => -0.1 Spm", () => { expect(() => toSpm(-1E3, 'uSpcm')).toThrowError(); });
        it("-640 ppm   => -0.1 Spm", () => { expect(() => toSpm(-640, 'ppm')).toThrowError(); });
    });

});

describe("The conversions are rounded to 3 decimals", () => {

});