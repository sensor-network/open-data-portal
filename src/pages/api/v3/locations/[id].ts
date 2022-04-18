import { NextApiRequest, NextApiResponse } from 'next';

import * as Location from "lib/database/location";
import { HTTP_STATUS as STATUS } from "lib/httpStatusCodes";
import { ZodError } from "zod";
import { zIdFromString, zUpdateLocation } from 'lib/types/ZodSchemas';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  /**
   * GET /api/v3/locations/[id]
   **/
  if (req.method === "GET") {
    try {
      /* parse parameters */
      const locationId = zIdFromString.parse(req.query.id);

      const location = await Location.findById({ id: locationId });

      if (!location) {
        const message = `Location with id '${locationId}' does not exist`;
        console.log(`${req.method} /api/v3/locations/[id]:: ${message}`);

        res.status(STATUS.NOT_FOUND)
          .json({ message });
        return;
      }

      res.status(STATUS.OK)
        .json(location);
    }

    catch (e) {
      if (e instanceof ZodError) {
        console.log(`${req.method}: /api/v3/location/[id]:: Error parsing request:\n`, e.flatten());
        res.status(STATUS.BAD_REQUEST)
          .json(e.flatten());
      }
      else {
        console.error(`${req.method}: /api/v3/locations/[id]::`, e);
        res.status(STATUS.SERVER_ERROR)
          .json({ message: "Internal server error" });
      }
    }
  }

  /**
   * PATCH /api/v3/locations/[id]
   **/
  else if (req.method === 'PATCH') {
    /**
     * TODO: Implement more sophisticated authentication
     */
    const AUTHENTICATION_SCHEMA = 'Bearer';
    const AUTHENTICATION_TOKEN = process.env.NEXT_PUBLIC_API_KEY;
    const { authorization } = req.headers;

    if (authorization !== `${AUTHENTICATION_SCHEMA} ${AUTHENTICATION_TOKEN}`) {
      const errorMessage = `Failed to authenticate the request with the provided authorization-header: '${authorization}'`;
      console.log(`${req.method} /api/v3/location/[id]:: ${errorMessage}`);

      res.setHeader('WWW-Authenticate', AUTHENTICATION_SCHEMA)
        .status(STATUS.UNAUTHORIZED)
        .json({ error: errorMessage });
      return;
    }

    try {
      /* parse request parameters from query and body */
      const locationId = zIdFromString.parse(req.query.id);
      const { name } = zUpdateLocation.parse(req.body);

      let location = await Location.findById({ id: locationId });
      if (!location) {
        const message = `Location with id '${locationId}' does not exist`;
        console.log(`${req.method} /api/v3/locations/[id]:: ${message}`);

        res.status(STATUS.NOT_FOUND)
          .json({ message });
        return;
      }

      let totalChanges = 0;
      if (name) {
        const { changedRows } = await Location.updateName({ id: locationId, name });
        totalChanges += changedRows;
      }

      location = await Location.findById({ id: locationId });

      res.status(STATUS.OK)
        .json({ status: "Success", totalChanges, updatedValue: location });
    }

    catch (e) {
      if (e instanceof ZodError) {
        console.log(`${req.method}: /api/v3/locations/[id]:: Error parsing request body:\n`, e.flatten());
        res.status(STATUS.BAD_REQUEST)
          .json(e.flatten());
      }
      else {
        console.error(`${req.method}: /api/v3/locations/[id]::`, e);
        res.status(STATUS.SERVER_ERROR)
          .json({ error: "Internal server error" });
      }
    }
  }

  /**
   * {unknown} /api/v3/locations/[id]
   **/
  else {
    console.log(`${req.method}: /api/v3/locations/[id]:: Method not allowed`);
    res.setHeader('Allow', 'GET, PATCH')
      .status(STATUS.NOT_ALLOWED)
      .json({ error: `Method '${req.method}' not allowed.` });
    return;
  }
};

export default handler;
