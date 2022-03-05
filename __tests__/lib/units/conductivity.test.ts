import { Conductivity, UNITS, parseConductivity } from "../../../src/lib/units/conductivity";

it("parses Siemens per meter correctly", () => {
    expect(() => parseConductivity(UNITS.SIEMENS_PER_METER.minValue-1, 'spm')).toThrow();

    const minCond : Conductivity = parseConductivity(UNITS.SIEMENS_PER_METER.minValue, 'spm');
    expect(minCond).toBeInstanceOf(Conductivity);
    expect(minCond.value).toEqual(UNITS.SIEMENS_PER_METER.minValue);
    expect(minCond.unit).toEqual(UNITS.SIEMENS_PER_METER);
    expect(minCond.asSiemensPerMeter()).toEqual(UNITS.SIEMENS_PER_METER.minValue);

    const maxCond : Conductivity = parseConductivity(UNITS.SIEMENS_PER_METER.maxValue, 's/m');
    expect(maxCond).toBeInstanceOf(Conductivity);
    expect(maxCond.value).toEqual(UNITS.SIEMENS_PER_METER.maxValue);
    expect(maxCond.unit).toEqual(UNITS.SIEMENS_PER_METER);
    expect(maxCond.asSiemensPerMeter()).toEqual(UNITS.SIEMENS_PER_METER.maxValue);

    expect(() => parseConductivity(UNITS.SIEMENS_PER_METER.maxValue+1, 's/m')).toThrow();
});

it("handles unknown UNITS", () => {
    expect(() => parseConductivity(20, 'e')).toThrow();
});

it("can retrieve values from siemens per meter", () => {
    const spmVal = UNITS.SIEMENS_PER_METER.fromSiemensPerMeter(UNITS.SIEMENS_PER_METER.maxValue);
    expect(spmVal).toEqual(UNITS.SIEMENS_PER_METER.maxValue);

    const mhopmVal = UNITS.MHO_PER_METER.fromSiemensPerMeter(UNITS.SIEMENS_PER_METER.maxValue);
    expect(mhopmVal).toEqual(UNITS.MHO_PER_METER.maxValue);

    const spcmVal = UNITS.SIEMENS_PER_CENTIMETER.fromSiemensPerMeter(UNITS.SIEMENS_PER_METER.maxValue);
    expect(spcmVal).toEqual(UNITS.SIEMENS_PER_CENTIMETER.maxValue);

    const mhopcmVal = UNITS.MHO_PER_CENTIMETER.fromSiemensPerMeter(UNITS.SIEMENS_PER_METER.maxValue);
    expect(mhopcmVal).toEqual(UNITS.MHO_PER_CENTIMETER.maxValue);

    const mspmVal = UNITS.MILLISIEMENS_PER_METER.fromSiemensPerMeter(UNITS.SIEMENS_PER_METER.maxValue);
    expect(mspmVal).toEqual(UNITS.MILLISIEMENS_PER_METER.maxValue);

    const mspcmVal = UNITS.MILLISIEMENS_PER_CENTIMETER.fromSiemensPerMeter(UNITS.SIEMENS_PER_METER.maxValue);
    expect(mspcmVal).toEqual(UNITS.MILLISIEMENS_PER_CENTIMETER.maxValue);

    const uspmVal = UNITS.MICROSIEMENS_PER_METER.fromSiemensPerMeter(UNITS.SIEMENS_PER_METER.maxValue);
    expect(uspmVal).toEqual(UNITS.MICROSIEMENS_PER_METER.maxValue);

    const uspcmVal = UNITS.MICROSIEMENS_PER_CENTIMETER.fromSiemensPerMeter(UNITS.SIEMENS_PER_METER.maxValue);
    expect(uspcmVal).toEqual(UNITS.MICROSIEMENS_PER_CENTIMETER.maxValue);

    const ppmVal = UNITS.PARTS_PER_MILLION.fromSiemensPerMeter(10);
    expect(ppmVal).toEqual(UNITS.PARTS_PER_MILLION.maxValue);
});