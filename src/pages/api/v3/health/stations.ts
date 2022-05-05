import { NextApiRequest, NextApiResponse } from "next";
import * as Station from "~/lib/database/station";
import { HTTP_STATUS as STATUS } from "~/lib/constants";
import { z } from "zod";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    console.log(`${req.method}: /api/v3/health/stations:: Method not allowed`);
    res.setHeader("Allow", "GET");
    res
      .status(STATUS.NOT_ALLOWED)
      .json({ error: `Method '${req.method}' not allowed.` });
    return;
  }

  try {
    const expandLocation = z
      .enum(["true", "false"])
      .transform((str) => str === "true")
      .parse(req.query.expandLocation);

    const stations = await Station.findMany({
      expandSensors: false,
      expandLocation,
      includeSensorStatus: true,
    });

    /* respond with 404 with appropriate message if no stations matching filter was found */
    if (!stations.length) {
      const message = `no status.`;
      console.log(`${req.method} /api/v3/health/stations:: ${message}`);
      res.status(STATUS.NOT_FOUND).json({ message });
      return;
    }

    /** go over all the stations and set the stations status depending on its sensors' status */
    const includeStationStatus = stations.map((station) => {
      const sensors = station.sensors;
      const stationHasOkSensor = sensors.some((sensor) => {
        if (sensor instanceof Object && "status" in sensor) {
          return sensor.status === "OK";
        }
        return false;
      });
      const stationHasFaultySensor = sensors.some((sensor) => {
        if (sensor instanceof Object && "status" in sensor) {
          return sensor.status !== "OK";
        }
        return false;
      });
      /** a station is OK if all its sensors are, its faulty if none of the sensors are OK */
      const stationStatus =
        stationHasOkSensor && !stationHasFaultySensor
          ? "OK"
          : stationHasOkSensor && stationHasFaultySensor
          ? "PARTIALLY FAULTY"
          : "FAULTY";

      /** the station inherits lastActive from the latest active sensor */
      // @ts-ignore - we know that the sensors are all of type Sensor with prop lastActive
      const stationLastActive = sensors.reduce((acc, curr) => {
        return acc > curr.lastActive ? acc : curr.lastActive;
        // @ts-ignore - we know that the sensors are all of type Sensor with prop lastActive
      }, sensors[0].lastActive);

      return {
        id: station.id,
        location: station.location,
        status: stationStatus,
        lastActive: stationLastActive,
        sensors: station.sensors,
      };
    });

    /* else respond with 200 and the stations matching the query */
    res.status(STATUS.OK).json(includeStationStatus);
  } catch (e) {
    console.error(`${req.method}: /api/v3/health/stations::`, e);
    res.status(STATUS.SERVER_ERROR).json({ error: "Internal server error" });
  }
};

export default handler;
