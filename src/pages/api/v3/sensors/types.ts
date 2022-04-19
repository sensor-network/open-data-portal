import { NextApiRequest, NextApiResponse } from 'next';

import * as Sensor from "lib/database/sensor";
import { HTTP_STATUS as STATUS } from "lib/httpStatusCodes";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    console.log(`${req.method}: /api/v3/sensors/types:: Method not allowed`);
    res.setHeader('Allow', 'GET')
      .status(STATUS.NOT_ALLOWED)
      .json({ error: `Method '${req.method}' not allowed.` });
    return;
  }

  try {
    const sensorTypes = await Sensor.findAllTypes();

    if (!sensorTypes.length) {
      const message = `No sensor types found.`;
      console.log(`${req.method} /api/v3/sensors/types:: ${message}`);

      res.status(STATUS.NOT_FOUND)
        .json({ message });
      return;
    }

    /* Returning the locations with STATUS.OK response code */
    res.status(STATUS.OK)
      .json(sensorTypes);
  }

  catch (e) {
    console.error(`${req.method}: /api/v3/sensors/types::`, e);
    res.status(STATUS.SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
};

export default handler;
