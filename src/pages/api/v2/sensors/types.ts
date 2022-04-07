import { NextApiRequest, NextApiResponse } from 'next';

import * as Sensor from "src/lib/database/sensor";
import { HTTP_STATUS as STATUS } from "src/lib/httpStatusCodes";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    console.log(`${req.method}: /api/v2/sensors/types:: Method not allowed`);
    res.setHeader('Allow', 'GET')
      .status(STATUS.NOT_ALLOWED)
      .json({ error: `Method '${req.method}' not allowed.` });
    return;
  }

  try {
    const sensor_types = await Sensor.findAllTypes();

    /* Returning the locations with STATUS.OK response code */
    res.status(STATUS.OK).json(sensor_types);
  }

  catch (e) {
    console.error(e);
    res.status(STATUS.SERVER_ERROR).json({ error: "Internal server error" });
  }
};

export default handler;
