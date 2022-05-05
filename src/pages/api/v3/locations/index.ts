import { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { HTTP_STATUS as STATUS } from "~/lib/constants";
import * as Location from "~/lib/database/location";
import { zLocation, zCreateLocation } from "~/lib/validators/location";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  /**
   * GET /api/v3/locations
   **/
  if (req.method === "GET") {
    try {
      /* parse parameters */
      const { lat, long, rad, name } = zLocation.parse(req.query);

      let locations: Location.Location[] | Location.Location;
      let status: { found: boolean; message: string } = {
        found: true,
        message: "",
      };

      /* take filters in order `name` -> `lat,long` */
      if (name) {
        locations = await Location.findByName({ name });
        if (!locations.length) {
          status = {
            found: false,
            message: `No location named '${name}' found.`,
          };
        }
      } else if (lat && long) {
        locations = await Location.findByLatLong({ lat, long, rad });
        if (!locations.length) {
          status = {
            found: false,
            message: `No location found matching { lat: ${lat}, long: ${long} }.`,
          };
        }
      } else {
        locations = await Location.findMany();
        if (!locations.length) {
          status = {
            found: false,
            message: `No locations found.`,
          };
        }
      }

      /* respond with 404 with appropriate message if no locations matching filter was found */
      if (!status.found) {
        console.log(`${req.method} /api/v3/locations:: ${status.message}`);
        res.status(STATUS.NOT_FOUND).json({ message: status.message });
        return;
      }

      /* else respond with 200 and the locations matching the query */
      res.status(STATUS.OK).json(locations);
    } catch (e) {
      if (e instanceof ZodError) {
        console.log(
          `${req.method}: /api/v3/locations:: Error parsing query params:\n`,
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
  } else if (req.method === "POST") {
    /**
     * POST /api/v3/locations
     **/
    /**
     * TODO: Implement more sophisticated authentication
     */
    const AUTHENTICATION_SCHEMA = "Bearer";
    const AUTHENTICATION_TOKEN = process.env.NEXT_PUBLIC_API_KEY;
    const { authorization } = req.headers;

    if (authorization !== `${AUTHENTICATION_SCHEMA} ${AUTHENTICATION_TOKEN}`) {
      const errorMessage = `Failed to authenticate the request with the provided authorization-header: '${authorization}'`;
      console.log(`${req.method} /api/v3/locations:: ${errorMessage}`);

      res.setHeader("WWW-Authenticate", AUTHENTICATION_SCHEMA);
      res.status(STATUS.UNAUTHORIZED).json({ error: errorMessage });
      return;
    }

    try {
      /* parse request body */
      let { lat, long, rad, name } = zCreateLocation.parse(req.body);

      const id = await Location.createOne({ name, lat, long, rad });

      /* Returning the location with STATUS.CREATED response code */
      res
        .status(STATUS.CREATED)
        .json({ id, name, position: { lat, long }, radiusMeters: rad });
    } catch (e) {
      if (e instanceof ZodError) {
        console.log(
          `${req.method}: /api/v3/locations:: Error parsing request body:\n`,
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
    /**
     * {unknown} /api/v3/locations
     **/
    console.log(`${req.method}: /api/v3/locations:: Method not allowed`);
    res.setHeader("Allow", "POST, GET");
    res
      .status(STATUS.NOT_ALLOWED)
      .json({ error: `Method '${req.method}' not allowed.` });
    return;
  }
};

export default handler;
