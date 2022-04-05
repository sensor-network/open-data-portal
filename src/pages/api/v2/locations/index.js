import * as Location from "src/lib/database/location";
import { HTTP_STATUS as STATUS } from "src/lib/httpStatusCodes";
import { zLocation } from "src/lib/types/ZodSchemas";
import { ZodError } from "zod";

const handler = async (req, res) => {
  if (req.method === "GET") {
    try {
      /* parse parameters */
      const { lat, long, rad, location_name: locationName } = zLocation.parse(req.query);

      /* execute appropriate query based on the parameters */
      const locations =
        locationName ? await Location.findByName({ name: locationName }) :
          lat && long && rad ? await Location.findByGeo({ lat, long, rad }) :
            await Location.findMany();

      /* Returning the locations with STATUS.OK response code */
      res.status(STATUS.OK).json(locations);

    } catch (e) {
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
      /* parse parameters */
      const { location_name: locationName, lat, long, rad } = zLocation.parse(req.body);

      console.log(locationName);
      /* execute appropriate query based on the parameters */
      const location = await Location.createOne({ name: locationName, lat, long, rad });

      /* Returning the location with STATUS.CREATED response code */
      res.status(STATUS.CREATED).json(location);

    } catch (e) {
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
};

export default handler;
