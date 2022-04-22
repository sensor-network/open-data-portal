import { getMedianNum } from "../../../src/lib/utils/get-median-num";

describe("TEST getMedianNum", () => {
  it("TEST 1", () => {
    const bArray: any[] = [];
    const iFilterLen = 0;
    const result = getMedianNum(bArray, iFilterLen);
    expect(result).toEqual(NaN);
  });

  it("TEST 2", () => {
    const bArray = [2, 1, 3];
    const iFilterLen = 3;
    const result = getMedianNum(bArray, iFilterLen);
    expect(result).toEqual(2);
  });
});