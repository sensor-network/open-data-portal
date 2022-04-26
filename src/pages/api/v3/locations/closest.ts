import { HTTP_STATUS as STATUS } from "~/lib/httpStatusCodes";
import { NextApiRequest, NextApiResponse } from "next";
import * as Station from "~/lib/database/location";
import {zLatLong} from "~/lib/types/ZodSchemas";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    /* parse query params */
    const {lat, long} = zLatLong.parse(req.query);

    /* call db (separat funktion för att det ska vara testbart) */
    const closest = await Station.findClosest({lat, long});
  
    /* error checks etc.*/
    if (!closest) {
      const message = "no location found close enough.";
      console.log(`${req.method} /api/v3/location:: ${message}`);
        res.status(STATUS.NOT_FOUND).json({ message });
        return;
    }

    /* success */
    res.status(STATUS.OK).json(
      closest
    );
  }

  else {
    console.log(`${req.method}: /api/v3/stations:: Method not allowed`);
    res.setHeader("Allow", "GET");
    res
      .status(STATUS.NOT_ALLOWED)
      .json({ error: `Method '${req.method}' not allowed.` });
    return;
  }
};

export default handler;

  