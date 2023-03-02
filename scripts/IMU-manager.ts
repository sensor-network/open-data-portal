// This code defines a type for IMU data and a class for managing IMU data.
// The ImuManager class has methods for adding new IMU data, getting the most recent IMU data,
// and getting IMU data between two timestamps.The example usage code creates an instance of ImuManager,
// adds two sample IMU data objects, and then calls the getLatestData() and getDataBetweenTimestamps() methods
// to retrieve the added data.

//TEST DATA BELOW
// const imuData: ImuData = {
//     timestamp: Date.now(),
//     acceleration: { x: 0.5, y: 0.2, z: 0.7 },
//     gyro: { x: 0.1, y: -0.3, z: 0.2 }
// };
//TEST DATA ABOVE

export {}
// Define a type for IMU data
type ImuData = {
    timestamp: number;
    acceleration: {
        x: number;
        y: number;
        z: number;
    };
    gyro: {
        x: number;
        y: number;
        z: number;
    };
};

// Class for managing IMU data
class ImuManager {
    private imuData: ImuData[];

    constructor() {
        this.imuData = [];
    }

    // Method for adding new IMU data
    addData(data: ImuData): void {
        this.imuData.push(data);
    }

    // Method for getting the most recent IMU data
    getLatestData(): ImuData {
        return this.imuData[this.imuData.length - 1];
    }

    // Method for getting IMU data between two timestamps
    getDataBetweenTimestamps(startTime: number, endTime: number): ImuData[] {
        return this.imuData.filter((data) => {
            return data.timestamp >= startTime && data.timestamp <= endTime;
        });
    }
}

// Example usage
const imuManager = new ImuManager();
const data1: ImuData = {
    timestamp: Date.now(),
    acceleration: { x: 1.0, y: 2.0, z: 3.0 },
    gyro: { x: 0.1, y: 0.2, z: 0.3 }
};
imuManager.addData(data1);
const data2: ImuData = {
    timestamp: Date.now(),
    acceleration: { x: -1.0, y: -2.0, z: -3.0 },
    gyro: { x: -0.1, y: -0.2, z: -0.3 }
};
imuManager.addData(data2);
console.log(imuManager.getLatestData()); // prints the most recent IMU data
console.log(imuManager.getDataBetweenTimestamps(data1.timestamp, data2.timestamp)); // prints IMU data between the two timestamps
