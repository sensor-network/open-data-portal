/**
 * this function originates from
 * https://github.com/sensor-network/sensor-collector/blob/main/src/Sensor_reader/Sensor_reader.ino
 * and were rewritten to be tested, and the sensor-collector project has no active test-suite
 * the function is never used inside this project.
 **/
export const getMedianNum = (bArray: any[], iFilterLen: number) => {
  const bTab: any[] = [];
  for (let i = 0; i < iFilterLen; i++) {
    bTab[i] = bArray[i];

  }
  let i: number, j: number, bTemp: number;
  for (j = 0; j < iFilterLen - 1; j++) {
    for (i = 0; i < iFilterLen - j - 1; i++) {
      if (bTab[i] > bTab[i + 1]) {
        bTemp = bTab[i];
        bTab[i] = bTab[i + 1];
        bTab[i + 1] = bTemp;
      }
    }
  }
  if ((iFilterLen & 1) > 0) {
    bTemp = bTab[(iFilterLen - 1) / 2];
  }
  else {
    bTemp = (bTab[iFilterLen / 2] + bTab[iFilterLen / 2 - 1]) / 2;
  }
  return bTemp;
};
