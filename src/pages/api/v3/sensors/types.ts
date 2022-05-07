import { NextApiRequest, NextApiResponse } from "next";
import { HTTP_STATUS as STATUS } from "~/lib/constants";
import * as Sensor from "~/lib/database/sensor";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    console.log(`${req.method}: ${req.url}:: Method not allowed`);
    res.setHeader("Allow", "GET");
    res
      .status(STATUS.NOT_ALLOWED)
      .json({ error: `Method '${req.method}' not allowed.` });
    return;
  }

  try {
    const sensorTypes = await Sensor.findAllTypes();

    if (!sensorTypes.length) {
      const message = `No sensor types found.`;
      console.log(`${req.method}: ${req.url}:: ${message}`);

      res.status(STATUS.NOT_FOUND).json({ message });
      return;
    }

    /* Returning the locations with STATUS.OK response code */
    res.status(STATUS.OK).json(sensorTypes);
  } catch (e) {
    console.error(`${req.method}: ${req.url}::`, e);
    res.status(STATUS.SERVER_ERROR).json({ error: "Internal server error" });
  }
};

export default handler;
