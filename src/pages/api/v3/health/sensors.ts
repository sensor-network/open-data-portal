import { NextApiRequest, NextApiResponse } from "next";

import * as Sensor from "lib/database/sensor";
import { HTTP_STATUS as STATUS } from "lib/httpStatusCodes";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    console.log(`${req.method}: /api/v3/sensors/types:: Method not allowed`);
    res.setHeader("Allow", "GET");
    res
      .status(STATUS.NOT_ALLOWED)
      .json({ error: `Method '${req.method}' not allowed.` });
    return;
  }

  try {
    const sensors = await Sensor.findMany({ includeStatus: true });

    /* respond with 404 with appropriate message if no stations matching filter was found */
    if (!sensors.length) {
      const message = `No sensors found.`;
      console.log(`${req.method} /api/v3/health/sensors:: ${message}`);
      res.status(STATUS.NOT_FOUND).json({ message });
      return;
    }

    /* else respond with 200 and the stations matching the query */
    res.status(STATUS.OK).json(sensors);
  } catch (e) {
    console.error(`${req.method}: /api/v3/health/sensors::`, e);
    res.status(STATUS.SERVER_ERROR).json({ error: "Internal server error" });
  }
};

export default handler;
