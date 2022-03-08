import { ISOStringToSQLTimestamp as toSQL } from "../../../src/lib/conversions/convertTimestamp";

it("should accept full ISO8601 format", () => {
    expect(toSQL('2022-01-01T12:00:00.000Z')).toEqual('2022-01-01T12:00:00.000');
    expect(toSQL('2022-01-01T12:00:00.000+5')).toEqual('2022-01-01T07:00:00.000');
    expect(toSQL('2022-01-01T12:00:00.000-5')).toEqual('2022-01-01T17:00:00.000');
});

it("should accept variations of it", () => {
    expect(toSQL('2022-01-01T12:00:00Z')).toEqual('2022-01-01T12:00:00.000');
    expect(toSQL('2022-01-01T12:00:00+3')).toEqual('2022-01-01T09:00:00.000');
    expect(toSQL('2022-01-01T12:00:00-3')).toEqual('2022-01-01T15:00:00.000');

    expect(toSQL('2022-01-01 12:00:00.000-5')).toEqual('2022-01-01T17:00:00.000');
    expect(toSQL('2022-01-01:12:00:00.000-5')).toEqual('2022-01-01T17:00:00.000');
    expect(toSQL('2022-01-01:12:00:00.000-05')).toEqual('2022-01-01T17:00:00.000');
    expect(toSQL('2022-01-01 12:00:00.000-0500')).toEqual('2022-01-01T17:00:00.000');

});

it("should give good error messages if input is invalid", () => {
    expect(() => toSQL('2022-01-01T12-00:00+3')).toThrow();
    expect(() => toSQL('2022-01-01T30:00:00+3')).toThrow();
    expect(() => toSQL('2022-01-40T12:00:00+3')).toThrow();
    expect(() => toSQL('2022-13-01T12:00:00+3')).toThrow();

})