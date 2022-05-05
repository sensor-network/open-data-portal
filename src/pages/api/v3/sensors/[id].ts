import { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";

import { HTTP_STATUS as STATUS } from "~/lib/constants";
import * as Sensor from "~/lib/database/sensor";
import { zIdFromString } from "~/lib/validators/id";
import { zUpdateSensor } from "~/lib/validators/sensor";

import { authorizeRequest } from "~/lib/utils/api/auth";

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
        console.log(`${req.method} ${req.url}:: ${message}`);

        res.status(STATUS.NOT_FOUND).json({ message });
        return;
      }

      res.status(STATUS.OK).json(sensor);
    } catch (e) {
      if (e instanceof ZodError) {
        console.log(
          `${req.method}: ${req.url}:: Error parsing request:\n`,
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
  } else if (req.method === "PATCH") {
    /**
     * PATCH /api/v3/sensors/[id]
     **/
    if (!authorizeRequest(req, res)) {
      return;
    }

    try {
      /* parse request parameters from query and body */
      const sensorId = zIdFromString.parse(req.query.id);
      const { name, firmware } = zUpdateSensor.parse(req.body);

      let sensor = await Sensor.findById({ id: sensorId });
      if (!sensor) {
        const message = `Sensor with id '${sensorId}' does not exist`;
        console.log(`${req.method} ${req.url}:: ${message}`);

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
          `${req.method}: ${req.url}:: Error parsing request body:\n`,
          e.flatten()
        );
        res.status(STATUS.BAD_REQUEST).json(e.flatten());
      } else {
        console.error(`${req.method}: ${req.url}]::`, e);
        res
          .status(STATUS.SERVER_ERROR)
          .json({ error: "Internal server error" });
      }
    }
  } else {
    /**
     * {unknown} /api/v3/sensors/[id]
     **/
    console.log(`${req.method}: ${req.url}:: Method not allowed`);
    res.setHeader("Allow", "GET, PATCH");
    res
      .status(STATUS.NOT_ALLOWED)
      .json({ error: `Method '${req.method}' not allowed.` });
    return;
  }
};

export default handler;
