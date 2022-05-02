import { HTTP_STATUS as STATUS } from "~/lib/httpStatusCodes";
import { NextApiRequest, NextApiResponse } from "next";
import * as Location from "~/lib/database/location";
import { zLatLong } from "~/lib/types/ZodSchemas";
import { ZodError } from "zod";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    /* parse query params */
    try {
      const { lat, long } = zLatLong.parse(req.query);
      /* call db (separat funktion för att det ska vara testbart) */
      const closest = await Location.findClosest({ lat, long });

      /* error checks etc.*/
      if (!closest) {
        const message = "No location found close enough";
        console.log(`${req.method} /api/v3/locations/closest:: ${message}`);
        res.status(STATUS.NOT_FOUND).json({ message });
        return;
      }

      /* success */
      res.status(STATUS.OK).json(closest);
    } catch (e) {
      if (e instanceof ZodError) {
        console.log(
          `${req.method}: /api/v3/locations/closest:: Error parsing query params:\n`,
          e.flatten()
        );
        res.status(STATUS.BAD_REQUEST).json(e.flatten());
      } else {
        console.error(e);
        res
          .status(STATUS.SERVER_ERROR)
          .json({ error: "Internal server error" });
      }
    }
  } else {
    console.log(
      `${req.method}: /api/v3/locations/closest:: Method not allowed`
    );
    res.setHeader("Allow", "GET");
    res
      .status(STATUS.NOT_ALLOWED)
      .json({ error: `Method '${req.method}' not allowed.` });
    return;
  }
};

export default handler;
