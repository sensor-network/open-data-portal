import { NextApiRequest, NextApiResponse } from "next";

import * as Sensor from "lib/database/sensor";
import { HTTP_STATUS as STATUS } from "lib/httpStatusCodes";
import { ZodError } from "zod";
import { zIdFromString, zUpdateSensor } from "lib/types/ZodSchemas";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  /**
   * GET /api/v3/sensors/[id]
   **/
  if (req.method === "GET") {
    try {
      /* parse parameters */
      const sensorId = zIdFromString.parse(req.query.id);

      const sensor = await Sensor.findById({ id: sensorId });

      if (!sensor) {
        const message = `Sensor with id '${sensorId}' does not exist`;
        console.log(`${req.method} /api/v3/sensors/[id]:: ${message}`);

        res.status(STATUS.NOT_FOUND).json({ message });
        return;
      }

      res.status(STATUS.OK).json(sensor);
    } catch (e) {
      if (e instanceof ZodError) {
        console.log(
          `${req.method}: /api/v3/sensors/[id]:: Error parsing request:\n`,
          e.flatten()
        );
        res.status(STATUS.BAD_REQUEST).json(e.flatten());
      } else {
        console.error(`${req.method}: /api/v3/sensors/[id]::`, e);
        res
          .status(STATUS.SERVER_ERROR)
          .json({ message: "Internal server error" });
      }
    }
  } else if (req.method === "PATCH") {
    /**
     * PATCH /api/v3/sensors/[id]
     **/
    /**
     * TODO: Implement more sophisticated authentication
     */
    const AUTHENTICATION_SCHEMA = "Bearer";
    const AUTHENTICATION_TOKEN = process.env.NEXT_PUBLIC_API_KEY;
    const { authorization } = req.headers;

    if (authorization !== `${AUTHENTICATION_SCHEMA} ${AUTHENTICATION_TOKEN}`) {
      const errorMessage = `Failed to authenticate the request with the provided authorization-header: '${authorization}'`;
      console.log(`${req.method} /api/v3/sensors/[id]:: ${errorMessage}`);

      res.setHeader("WWW-Authenticate", AUTHENTICATION_SCHEMA);
      res.status(STATUS.UNAUTHORIZED).json({ error: errorMessage });
      return;
    }

    try {
      /* parse request parameters from query and body */
      const sensorId = zIdFromString.parse(req.query.id);
      const { name, firmware } = zUpdateSensor.parse(req.body);

      let sensor = await Sensor.findById({ id: sensorId });
      if (!sensor) {
        const message = `Sensor with id '${sensorId}' does not exist`;
        console.log(`${req.method} /api/v3/sensors/[id]:: ${message}`);

        res.status(STATUS.NOT_FOUND).json({ message });
        return;
      }

      let totalChanges = 0;
      if (name) {
        const { changedRows } = await Sensor.updateName({ id: sensorId, name });
        totalChanges += changedRows;
      }
      if (firmware) {
        const { changedRows } = await Sensor.updateFirmware({
          id: sensorId,
          firmware,
        });
        totalChanges += changedRows;
      }

      sensor = await Sensor.findById({ id: sensorId });

      res
        .status(STATUS.OK)
        .json({ status: "Success", totalChanges, updatedValue: sensor });
    } catch (e) {
      if (e instanceof ZodError) {
        console.log(
          `${req.method}: /api/v3/sensors/[id]:: Error parsing request body:\n`,
          e.flatten()
        );
        res.status(STATUS.BAD_REQUEST).json(e.flatten());
      } else {
        console.error(`${req.method}: /api/v3/sensors/[id]::`, e);
        res
          .status(STATUS.SERVER_ERROR)
          .json({ error: "Internal server error" });
      }
    }
  } else {
    /**
     * {unknown} /api/v3/sensors/[id]
     **/
    console.log(`${req.method}: /api/v3/sensors/[id]:: Method not allowed`);
    res.setHeader("Allow", "GET, PATCH");
    res
      .status(STATUS.NOT_ALLOWED)
      .json({ error: `Method '${req.method}' not allowed.` });
    return;
  }
};

export default handler;
