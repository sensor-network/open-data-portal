import { NextApiRequest, NextApiResponse } from "next";

import * as Station from "lib/database/station";
import { HTTP_STATUS as STATUS } from "lib/httpStatusCodes";
import { ZodError } from "zod";
import { zIdFromString, zId, zStationExpandParam } from "lib/types/ZodSchemas";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  /**
   * GET /api/v3/stations/[id]
   **/
  if (req.method === "GET") {
    try {
      /* parse parameters */
      const stationId = zIdFromString.parse(req.query.id);
      const expand = zStationExpandParam.parse(req.query.expand);
      const expandLocation = expand.includes("location");
      const expandSensors = expand.includes("sensors");

      const station = await Station.findByStationId({
        stationId,
        expandSensors,
        expandLocation,
      });

      if (!station) {
        const message = `Station with id '${stationId}' does not exist`;
        console.log(`${req.method} /api/v3/stations/[id]:: ${message}`);

        res.status(STATUS.NOT_FOUND).json({ message });
        return;
      }

      res.status(STATUS.OK).json(station);
    } catch (e) {
      if (e instanceof ZodError) {
        console.log(
          `${req.method}: /api/v3/stations/[id]:: Error parsing request:\n`,
          e.flatten()
        );
        res.status(STATUS.BAD_REQUEST).json(e.flatten());
      } else {
        console.error(`${req.method}: /api/v3/stations/[id]::`, e);
        res
          .status(STATUS.SERVER_ERROR)
          .json({ message: "Internal server error" });
      }
    }
  } else if (req.method === "PATCH") {
    /**
     * PATCH /api/v3/stations/[id]
     **/
    /**
     * TODO: Implement more sophisticated authentication
     */
    const AUTHENTICATION_SCHEMA = "Bearer";
    const AUTHENTICATION_TOKEN = process.env.NEXT_PUBLIC_API_KEY;
    const { authorization } = req.headers;

    if (authorization !== `${AUTHENTICATION_SCHEMA} ${AUTHENTICATION_TOKEN}`) {
      const errorMessage = `Failed to authenticate the request with the provided authorization-header: '${authorization}'`;
      console.log(`${req.method} /api/v3/stations/[id]:: ${errorMessage}`);

      res.setHeader("WWW-Authenticate", AUTHENTICATION_SCHEMA);
      res.status(STATUS.UNAUTHORIZED).json({ error: errorMessage });
      return;
    }

    try {
      /* parse request parameters from query and body */
      const stationId = zIdFromString.parse(req.query.id);
      const locationId = zId.parse(req.body.locationId);

      let station = await Station.findByStationId({
        stationId,
        expandSensors: false,
        expandLocation: false,
      });
      if (!station) {
        const message = `Station with id '${stationId}' does not exist`;
        console.log(`${req.method} /api/v3/stations/[id]:: ${message}`);

        res.status(STATUS.NOT_FOUND).json({ message });
        return;
      }

      const { changedRows } = await Station.updateLocation({
        id: stationId,
        locationId,
      });

      station = await Station.findByStationId({
        stationId,
        expandSensors: false,
        expandLocation: true, // expand location to show detailed view of the new location
      });

      res.status(STATUS.OK).json({
        status: "Success",
        totalChanges: changedRows,
        updatedValue: station,
      });
    } catch (e) {
      if (e instanceof ZodError) {
        console.log(
          `${req.method}: /api/v3/stations/[id]:: Error parsing request body:\n`,
          e.flatten()
        );
        res.status(STATUS.BAD_REQUEST).json(e.flatten());
      } else {
        console.error(`${req.method}: /api/v3/stations/[id]::`, e);
        res
          .status(STATUS.SERVER_ERROR)
          .json({ error: "Internal server error" });
      }
    }
  } else if (req.method === "DELETE") {
    /**
     * DELETE /api/v3/locations/[id]
     **/
    /**
     * TODO: Implement more sophisticated authentication
     **/
    const AUTHENTICATION_SCHEMA = "Bearer";
    const AUTHENTICATION_TOKEN = process.env.NEXT_PUBLIC_API_KEY;
    const { authorization } = req.headers;

    if (authorization !== `${AUTHENTICATION_SCHEMA} ${AUTHENTICATION_TOKEN}`) {
      const errorMessage = `Failed to authenticate the request with the provided authorization-header: '${authorization}'`;
      console.log(`${req.method} /api/v3/location/[id]:: ${errorMessage}`);

      res.setHeader("WWW-Authenticate", AUTHENTICATION_SCHEMA);
      res.status(STATUS.UNAUTHORIZED).json({ error: errorMessage });
      return;
    }
    try {
      /* parse request parameters from query and body */
      const stationId = zIdFromString.parse(req.query.id);

      let station = await Station.findByStationId({
        stationId,
        expandSensors: false,
        expandLocation: false,
      });
      if (!station) {
        const message = `Station with id '${stationId}' does not exist`;
        console.log(`${req.method} /api/v3/stations/[id]:: ${message}`);

        res.status(STATUS.NOT_FOUND).json({ message });
        return;
      }

      const { changedRows } = await Station.deleteById({ id: stationId });

      res.status(STATUS.OK).json({ status: "Success", deletedValue: station });
    } catch (e) {
      if (e instanceof ZodError) {
        console.log(
          `${req.method}: /api/v3/stations/[id]:: Error parsing request body:\n`,
          e.flatten()
        );
        res.status(STATUS.BAD_REQUEST).json(e.flatten());
      } else {
        console.error(`${req.method}: /api/v3/stations/[id]::`, e);
        res
          .status(STATUS.SERVER_ERROR)
          .json({ error: "Internal server error" });
      }
    }
  } else {
    /**
     * {unknown} /api/v3/stations/[id]
     **/
    console.log(`${req.method}: /api/v3/stations/[id]:: Method not allowed`);
    res.setHeader("Allow", "GET, PATCH, DELETE");
    res
      .status(STATUS.NOT_ALLOWED)
      .json({ error: `Method '${req.method}' not allowed.` });
    return;
  }
};

export default handler;
