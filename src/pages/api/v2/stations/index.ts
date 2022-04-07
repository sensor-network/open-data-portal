import { NextApiRequest, NextApiResponse } from 'next';

import * as Station from "src/lib/database/station";
import * as Sensor from "src/lib/database/sensor";
import * as Location from "src/lib/database/location";
import { HTTP_STATUS as STATUS } from "src/lib/httpStatusCodes";
import { z, ZodError } from "zod";
import { zCreateStation } from 'src/lib/types/ZodSchemas';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    try {
      /* parse parameters */
      const { station_id, sensor_id, location_name } = z.object({
        station_id: z.optional(z.string()  // input is a string which has to be transformed
          .transform(str => Number(str))
          .refine((num) => num > 0, 'id has to be positive'),
        ),
        sensor_id: z.optional(z.string()  // input is a string which has to be transformed
          .transform(str => Number(str))
          .refine((num) => num > 0, 'id has to be positive'),
        ),
        location_name: z.optional(z.string()),
      }).parse(req.query);

      let stations: Array<Station.Station> | Station.Station;
      if (location_name) {
        stations = await Station.findByLocationName({ location_name });
      }
      else if (station_id) {
        stations = await Station.findByStationId({ station_id });
      }
      else if (sensor_id) {
        stations = await Station.findBySensorId({ sensor_id });
      }
      else {
        stations = await Station.findMany();
      }

      /* Returning the locations with STATUS.OK response code */
      res.status(STATUS.OK).json(stations);
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
      const { sensor_ids, location_id } = zCreateStation.parse(req.body);

      /* */
      for (const sensor_id of sensor_ids) {
        const sensor = await Sensor.findById({ id: sensor_id });
        if (!sensor) {
          res.status(STATUS.BAD_REQUEST)
            .json({ error: `Sensor with id ${sensor_id} not found` });
          return;
        }

        const location = await Location.findById({ id: location_id });
        if (!location) {
          res.status(STATUS.BAD_REQUEST)
            .json({ error: `Location with id ${location_id} not found` });
          return;
        }

        await Station.createOne({ sensor_id, location_id });
      }

      /* Returning the location with STATUS.CREATED response code */
      res.status(STATUS.CREATED).json({ sensor_ids, location_id });
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
