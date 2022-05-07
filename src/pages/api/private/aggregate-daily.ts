import { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";

import { HTTP_STATUS as STATUS } from "~/lib/constants";
import * as Location from "~/lib/database/location";
import * as History from "~/lib/database/history";
import * as Sensor from "~/lib/database/sensor";

import { zTime } from "~/lib/validators/time";
import { authorizeRequest } from "~/lib/utils/api/auth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    console.log(`${req.method}: ${req.url}:: Method not allowed`);
    res
      .setHeader("Allow", "POST")
      .status(STATUS.NOT_ALLOWED)
      .json({ error: `Method '${req.method}' not allowed.` });
    return;
  }

  if (!authorizeRequest(req, res)) {
    return;
  }

  try {
    /* parse and validate date from query */
    const date = zTime.parse(req.query.date);

    /* get all locations from database, as well as the available sensors */
    const locations = await Location.findMany();
    const sensorTypes = await Sensor.findAllTypes();

    /* now aggregate the data for all locations and sensor-types */
    let insertedIds: number[] = [];
    for (const { id: locationId } of locations) {
      for (const type of sensorTypes) {
        /* see if data for such date and sensor has already been aggregated */
        const history = await History.findByFilter({
          date,
          sensorType: type,
          locationId,
        });
        if (history.length === 0) {
          const insertId = await History.createOne({
            date,
            sensorType: type,
            locationId,
          });
          if (insertId !== null) insertedIds.push(insertId);
        }
      }
    }
    res.status(STATUS.OK).json({ insertedIds });
  } catch (e) {
    if (e instanceof ZodError) {
      console.log(`${req.method}: ${req.url}::`, e.flatten());
      res.status(STATUS.BAD_REQUEST).json(e.flatten());
    } else {
      console.error(`${req.method}: ${req.url}::`, e);
      res.status(STATUS.SERVER_ERROR).json({
        error: "There was an error when executing the cron job.",
      });
    }
  }
};

export default handler;
