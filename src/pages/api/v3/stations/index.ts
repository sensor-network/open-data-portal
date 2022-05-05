import { NextApiRequest, NextApiResponse } from "next";

import * as Station from "~/lib/database/station";
import * as Sensor from "~/lib/database/sensor";
import * as Location from "~/lib/database/location";
import { HTTP_STATUS as STATUS } from "~/lib/constants";
import { ZodError } from "zod";
import { zCreateStation, zStationParams } from "~/lib/validators/station";

import { authorizeRequest } from "~/lib/utils/api/auth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  /**
   * GET /api/v3/stations
   **/
  if (req.method === "GET") {
    try {
      /* parse parameters */
      const { sensorId, locationName, sensorType, expand } =
        zStationParams.parse(req.query);
      const expandSensors = expand.includes("sensors");
      const expandLocation = expand.includes("location");

      let stations: Station.Station[] | Station.Station | null;
      let status: { found: boolean; message: string } = {
        found: true,
        message: "",
      };
      if (locationName) {
        stations = await Station.findByLocationName({
          locationName,
          expandLocation,
          expandSensors,
        });
        if (!stations.length) {
          status = {
            found: false,
            message: `No stations found at location with name '${locationName}'`,
          };
        }
      } else if (sensorId) {
        stations = await Station.findBySensorId({
          sensorId,
          expandSensors,
          expandLocation,
        });
        if (!stations) {
          status = {
            found: false,
            message: `No stations found containing a sensor with id '${sensorId}'`,
          };
        }
      } else if (sensorType) {
        stations = await Station.findBySensorType({
          sensorType,
          expandSensors,
          expandLocation,
        });
        if (!stations.length) {
          status = {
            found: false,
            message: `No stations found using a sensor with type '${sensorType}'`,
          };
        }
      } else {
        stations = await Station.findMany({ expandSensors, expandLocation });
        if (!stations.length) {
          status = {
            found: false,
            message: `No stations found`,
          };
        }
      }

      /* respond with 404 with appropriate message if no stations matching filter was found */
      if (!status.found) {
        console.log(`${req.method}: ${req.url}:: ${status.message}`);
        res.status(STATUS.NOT_FOUND).json({ message: status.message });
        return;
      }

      /* else respond with 200 and the stations matching the query */
      res.status(STATUS.OK).json(stations);
    } catch (e) {
      if (e instanceof ZodError) {
        console.log(
          `${req.method}: ${req.url}:: Error parsing request body:\n`,
          e.flatten()
        );
        res.status(STATUS.BAD_REQUEST).json(e.flatten());
      } else {
        console.error(`${req.method}: ${req.url}::`, e);
        res
          .status(STATUS.SERVER_ERROR)
          .json({ message: "Internal server error" });
      }
    }
  } else if (req.method === "POST") {
    /**
     * POST /api/v3/stations
     **/
    if (!authorizeRequest(req, res)) {
      return;
    }

    try {
      /* parse request body */
      const { sensorIds, locationId } = zCreateStation.parse(req.body);

      /* first check that the sensors and location exists */
      const location = await Location.findById({ id: locationId });
      if (!location) {
        const message = `Location with id '${locationId}' does not exist`;
        console.log(`${req.method}: ${req.url}:: ${message}`);
        res.status(STATUS.NOT_FOUND).json({ message });
        return;
      }
      for (const sensorId of sensorIds) {
        const sensor = await Sensor.findById({ id: sensorId });
        if (!sensor) {
          const message = `Sensor with id '${sensorId}' does not exist`;
          console.log(`${req.method}: ${req.url}:: ${message}`);
          res.status(STATUS.NOT_FOUND).json({ message });
          return;
        }
      }

      /* if all exists, then create the station for each sensor using the next available stationId */
      const stationId = await Station.getNextId();
      await Promise.all(
        sensorIds.map((sensorId) =>
          Station.createOne({ stationId, locationId, sensorId })
        )
      );

      /* Returning the location with STATUS.CREATED response code */
      res.status(STATUS.CREATED).json({ stationId, sensorIds, locationId });
    } catch (e) {
      if (e instanceof ZodError) {
        console.log(
          `${req.method}: ${req.url}:: Error parsing request body:\n`,
          e.flatten()
        );
        res.status(STATUS.BAD_REQUEST).json(e.flatten());
      } else {
        console.error(`${req.method}: ${req.url}::`, e);
        res
          .status(STATUS.SERVER_ERROR)
          .json({ error: "Internal server error" });
      }
    }
  } else {
    /**
     * {unknown} /api/v3/stations
     **/
    console.log(`${req.method}: ${req.url}:: Method not allowed`);
    res.setHeader("Allow", "POST, GET");
    res
      .status(STATUS.NOT_ALLOWED)
      .json({ error: `Method '${req.method}' not allowed.` });
    return;
  }
};

export default handler;
