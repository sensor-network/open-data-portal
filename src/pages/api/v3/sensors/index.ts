import { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";

import { HTTP_STATUS as STATUS } from "~/lib/constants";
import * as Sensor from "~/lib/database/sensor";
import { zCreateSensor, zSensorParams } from "~/lib/validators/sensor";

import { authorizeRequest } from "~/lib/utils/api/auth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  /**
   * GET /api/v3/sensors
   **/
  if (req.method === "GET") {
    try {
      /* parse parameters */
      const { name, type } = zSensorParams.parse(req.query);

      let sensors: Sensor.Sensor[];
      let status: { found: boolean; message: string } = {
        found: true,
        message: "",
      };
      if (name) {
        sensors = await Sensor.findByName({ name });
        if (!sensors.length) {
          status = {
            found: false,
            message: `No sensors named '${name}' found.`,
          };
        }
      } else if (type) {
        sensors = await Sensor.findByType({ type });
        if (!sensors.length) {
          status = {
            found: false,
            message: `No sensors with type '${type}' found.`,
          };
        }
      } else {
        sensors = await Sensor.findMany({});
        if (!sensors.length) {
          status = {
            found: false,
            message: `No sensors found.`,
          };
        }
      }

      /* respond with 404 with appropriate message if no sensors matching filter was found */
      if (!status.found) {
        console.log(`${req.method}: ${req.url}:: ${status.message}`);
        res.status(STATUS.NOT_FOUND).json({ message: status.message });
        return;
      }

      /* else respond with 200 and the sensors matching the query */
      res.status(STATUS.OK).json(sensors);
    } catch (e) {
      if (e instanceof ZodError) {
        console.log(
          `${req.method}: ${req.url}:: Error parsing query params:\n`,
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
  } else if (req.method === "POST") {
    /**
     * POST /api/v3/sensors
     **/
    if (!authorizeRequest(req, res)) {
      return;
    }

    try {
      /* parse request body */
      let { name, firmware, type } = zCreateSensor.parse(req.body);

      const id = await Sensor.createOne({ name, firmware, type });

      /* Returning the sensor with STATUS.CREATED response code */
      res.status(STATUS.CREATED).json({ id, name, firmware, type });
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
     * {unknown} /api/v3/sensors
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
