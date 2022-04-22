import { dateFormatter } from '../../../src/lib/utils/date-formatter';

describe("TEST dateFormatter", () => {
  it("test 1 - includes time if year and month is the same", () => {
    // arrange
    const date = new Date("2022-01-01 12:00:00");
    const startDate = new Date("2022-02-05 00:00:00");
    const endDate = new Date("2022-02-10 00:00:00");
    // act
    const result = dateFormatter(date, startDate, endDate);
    // assert
    expect(result).toEqual("1 Jan 12:00");
  });

  it("test 4 - skips time if months aren't the same", () => {
    const date = new Date("2022-01-01 12:00:00");
    const startDate = new Date("2022-01-05 00:00:00");
    const endDate = new Date("2022-02-10 00:00:00");

    const result = dateFormatter(date, startDate, endDate);

    expect(result).toEqual("1 Jan");
  });

  it("test 5 - includes year if years are different", () => {
    const date = new Date("2022-01-01 12:00:00");
    const startDate = new Date("2021-01-05 00:00:00");
    const endDate = new Date("2022-01-10 00:00:00");

    const result = dateFormatter(date, startDate, endDate);

    expect(result).toEqual("1 Jan 2022");
  });
});