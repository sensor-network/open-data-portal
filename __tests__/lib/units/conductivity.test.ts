import {
  Conductivity,
  UNITS,
  parseConductivity,
} from "~/lib/units/conductivity";

it("constructs Conductivity-instances correctly", () => {
  const condInstance = new Conductivity(40000, UNITS.PARTS_PER_MILLION);
  expect(condInstance).toBeInstanceOf(Conductivity);
  expect(condInstance.unit).toEqual(UNITS.PARTS_PER_MILLION);
  expect(condInstance.value).toEqual(40000);
  expect(condInstance.asSiemensPerMeter()).toEqual(6.25);
});

it("instantiates Conductivities as Siemens per meter if nothing else specified", () => {
  const condInstance = new Conductivity(10);
  expect(condInstance).toBeInstanceOf(Conductivity);
  expect(condInstance.unit).toEqual(UNITS.SIEMENS_PER_METER);
  expect(condInstance.value).toEqual(10);
  expect(condInstance.asSiemensPerMeter()).toEqual(10);
});

it("parses as Siemens per meter if nothing else specified", () => {
  expect(() =>
    parseConductivity(UNITS.SIEMENS_PER_METER.minValue - 1)
  ).toThrow();

  const minCond: Conductivity = parseConductivity(
    UNITS.SIEMENS_PER_METER.minValue
  );
  expect(minCond).toBeInstanceOf(Conductivity);
  expect(minCond.value).toEqual(UNITS.SIEMENS_PER_METER.minValue);
  expect(minCond.unit).toEqual(UNITS.SIEMENS_PER_METER);
  expect(minCond.asSiemensPerMeter()).toEqual(UNITS.SIEMENS_PER_METER.minValue);

  const maxCond: Conductivity = parseConductivity(
    UNITS.SIEMENS_PER_METER.maxValue
  );
  expect(maxCond).toBeInstanceOf(Conductivity);
  expect(maxCond.value).toEqual(UNITS.SIEMENS_PER_METER.maxValue);
  expect(maxCond.unit).toEqual(UNITS.SIEMENS_PER_METER);
  expect(maxCond.asSiemensPerMeter()).toEqual(UNITS.SIEMENS_PER_METER.maxValue);

  expect(() =>
    parseConductivity(UNITS.SIEMENS_PER_METER.maxValue + 1)
  ).toThrow();
});

it("parses microsiemens per centimeter correctly", () => {
  expect(() =>
    parseConductivity(UNITS.MICROSIEMENS_PER_CENTIMETER.minValue - 1, "uspcm")
  ).toThrow();

  const minCond: Conductivity = parseConductivity(
    UNITS.MICROSIEMENS_PER_CENTIMETER.minValue,
    "uspcm"
  );
  expect(minCond).toBeInstanceOf(Conductivity);
  expect(minCond.value).toEqual(UNITS.MICROSIEMENS_PER_CENTIMETER.minValue);
  expect(minCond.unit).toEqual(UNITS.MICROSIEMENS_PER_CENTIMETER);
  expect(minCond.asSiemensPerMeter()).toEqual(UNITS.SIEMENS_PER_METER.minValue);

  const maxCond: Conductivity = parseConductivity(
    UNITS.MICROSIEMENS_PER_CENTIMETER.maxValue,
    "us/cm"
  );
  expect(maxCond).toBeInstanceOf(Conductivity);
  expect(maxCond.value).toEqual(UNITS.MICROSIEMENS_PER_CENTIMETER.maxValue);
  expect(maxCond.unit).toEqual(UNITS.MICROSIEMENS_PER_CENTIMETER);
  expect(maxCond.asSiemensPerMeter()).toEqual(UNITS.SIEMENS_PER_METER.maxValue);

  expect(() =>
    parseConductivity(UNITS.MICROSIEMENS_PER_CENTIMETER.maxValue + 1, "us/cm")
  ).toThrow();
});

it("handles unknown UNITS", () => {
  expect(() => parseConductivity(20, "e")).toThrow();
});

it("properly converts from Siemens per meter", () => {
  expect(
    UNITS.SIEMENS_PER_METER.fromSiemensPerMeter(
      UNITS.SIEMENS_PER_METER.maxValue
    )
  ).toEqual(UNITS.SIEMENS_PER_METER.maxValue);

  expect(
    UNITS.MHO_PER_METER.fromSiemensPerMeter(UNITS.SIEMENS_PER_METER.maxValue)
  ).toEqual(UNITS.MHO_PER_METER.maxValue);

  expect(
    UNITS.SIEMENS_PER_CENTIMETER.fromSiemensPerMeter(
      UNITS.SIEMENS_PER_METER.maxValue
    )
  ).toEqual(UNITS.SIEMENS_PER_CENTIMETER.maxValue);

  expect(
    UNITS.MHO_PER_CENTIMETER.fromSiemensPerMeter(
      UNITS.SIEMENS_PER_METER.maxValue
    )
  ).toEqual(UNITS.MHO_PER_CENTIMETER.maxValue);

  expect(
    UNITS.MILLISIEMENS_PER_METER.fromSiemensPerMeter(
      UNITS.SIEMENS_PER_METER.maxValue
    )
  ).toEqual(UNITS.MILLISIEMENS_PER_METER.maxValue);

  expect(
    UNITS.MILLISIEMENS_PER_CENTIMETER.fromSiemensPerMeter(
      UNITS.SIEMENS_PER_METER.maxValue
    )
  ).toEqual(UNITS.MILLISIEMENS_PER_CENTIMETER.maxValue);

  expect(
    UNITS.MICROSIEMENS_PER_METER.fromSiemensPerMeter(
      UNITS.SIEMENS_PER_METER.maxValue
    )
  ).toEqual(UNITS.MICROSIEMENS_PER_METER.maxValue);

  expect(
    UNITS.MICROSIEMENS_PER_CENTIMETER.fromSiemensPerMeter(
      UNITS.SIEMENS_PER_METER.maxValue
    )
  ).toEqual(UNITS.MICROSIEMENS_PER_CENTIMETER.maxValue);

  expect(
    UNITS.PARTS_PER_MILLION.fromSiemensPerMeter(
      UNITS.SIEMENS_PER_METER.maxValue
    )
  ).toEqual(UNITS.PARTS_PER_MILLION.maxValue);
});

it("properly converts to Siemens per meter", () => {
  expect(
    UNITS.SIEMENS_PER_METER.toSiemensPerMeter(UNITS.SIEMENS_PER_METER.maxValue)
  ).toEqual(UNITS.SIEMENS_PER_METER.maxValue);

  expect(
    UNITS.MHO_PER_METER.toSiemensPerMeter(UNITS.MHO_PER_METER.maxValue)
  ).toEqual(UNITS.SIEMENS_PER_METER.maxValue);

  expect(
    UNITS.SIEMENS_PER_CENTIMETER.toSiemensPerMeter(
      UNITS.SIEMENS_PER_CENTIMETER.maxValue
    )
  ).toEqual(UNITS.SIEMENS_PER_METER.maxValue);

  expect(
    UNITS.MHO_PER_CENTIMETER.toSiemensPerMeter(
      UNITS.MHO_PER_CENTIMETER.maxValue
    )
  ).toEqual(UNITS.SIEMENS_PER_METER.maxValue);

  expect(
    UNITS.MILLISIEMENS_PER_METER.toSiemensPerMeter(
      UNITS.MILLISIEMENS_PER_METER.maxValue
    )
  ).toEqual(UNITS.SIEMENS_PER_METER.maxValue);

  expect(
    UNITS.MILLISIEMENS_PER_CENTIMETER.toSiemensPerMeter(
      UNITS.MILLISIEMENS_PER_CENTIMETER.maxValue
    )
  ).toEqual(UNITS.SIEMENS_PER_METER.maxValue);

  expect(
    UNITS.MICROSIEMENS_PER_METER.toSiemensPerMeter(
      UNITS.MICROSIEMENS_PER_METER.maxValue
    )
  ).toEqual(UNITS.SIEMENS_PER_METER.maxValue);

  expect(
    UNITS.MICROSIEMENS_PER_CENTIMETER.toSiemensPerMeter(
      UNITS.MICROSIEMENS_PER_CENTIMETER.maxValue
    )
  ).toEqual(UNITS.SIEMENS_PER_METER.maxValue);

  expect(
    UNITS.PARTS_PER_MILLION.toSiemensPerMeter(UNITS.PARTS_PER_MILLION.maxValue)
  ).toEqual(UNITS.SIEMENS_PER_METER.maxValue);
});
