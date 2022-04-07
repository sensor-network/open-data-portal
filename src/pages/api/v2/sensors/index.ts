import { NextApiRequest, NextApiResponse } from 'next';

import * as Sensor from "src/lib/database/sensor";
import { HTTP_STATUS as STATUS } from "src/lib/httpStatusCodes";
import { z, ZodError } from "zod";
import { zCreateSensor } from 'src/lib/types/ZodSchemas';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    try {
      /* parse parameters */
      const { station_id, sensor_id, type } = z.object({
        station_id: z.optional(z.string()  // input is a string which has to be transformed
          .transform(str => Number(str))
          .refine((num) => num > 0, 'id has to be positive'),
        ),
        sensor_id: z.optional(z.string()  // input is a string which has to be transformed
          .transform(str => Number(str))
          .refine((num) => num > 0, 'id has to be positive'),
        ),
        type: z.optional(z.string()),
      }).parse(req.query);

      let sensors: Array<Sensor.Sensor> = [];
      if (station_id) {
        sensors = await Sensor.findByStationId({ station_id });
      }
      else if (sensor_id) {
        const sensor = await Sensor.findById({ id: sensor_id });
        sensors.push(sensor);
      }
      else if (type) {
        sensors = await Sensor.findByType({ type });
      }
      else {
        sensors = await Sensor.findMany();
      }

      /* Returning the locations with STATUS.OK response code */
      res.status(STATUS.OK).json(sensors);
    }

    catch (e) {
      if (e instanceof ZodError) {
        console.log("Error parsing query params:\n", e.flatten());
        res.status(STATUS.BAD_REQUEST)
          .json(e.flatten());
      }
      else {
        console.error(e);
        res.status(STATUS.SERVER_ERROR).json({ error: "Internal server error" });
      }
    }
  }

  else if (req.method === "POST") {
    try {
      /* parse request body */
      let { name, firmware, type } = zCreateSensor.parse(req.body);
      if (!name) {
        name = null;
      }
      if (!firmware) {
        firmware = null;
      }
      const id = await Sensor.createOne({ name, firmware, type });

      /* Returning the location with STATUS.CREATED response code */
      res.status(STATUS.CREATED).json({ id });
    }

    catch (e) {
      if (e instanceof ZodError) {
        console.log("Error parsing request body:\n", e.flatten());
        res.status(STATUS.BAD_REQUEST)
          .json(e.flatten());
      }
      else {
        console.error(e);
        res.status(STATUS.SERVER_ERROR).json({ error: "Internal server error" });
      }
    }
  }
  else if (req.method === 'PATCH') {
    console.assert(false, "Not implemented");
    res.status(200).json("Not implemented");
  }
  else {
    console.log(`${req.method}: /api/v2/stations:: Method not allowed`);
    res.setHeader('Allow', 'POST, GET, PATCH')
      .status(STATUS.NOT_ALLOWED)
      .json({ error: `Method '${req.method}' not allowed.` });
    return;
  }
};

export default handler;
