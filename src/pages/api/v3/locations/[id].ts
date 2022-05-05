import { NextApiRequest, NextApiResponse } from "next";

import * as Location from "~/lib/database/location";
import { HTTP_STATUS as STATUS } from "~/lib/constants";
import { ZodError } from "zod";
import { zUpdateLocation } from "~/lib/validators/location";
import { zIdFromString } from "~/lib/validators/id";

import { authorizeRequest } from "~/lib/utils/api/auth";

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
        console.log(`${req.method}: ${req.url}:: ${message}`);

        res.status(STATUS.NOT_FOUND).json({ message });
        return;
      }

      res.status(STATUS.OK).json(location);
    } catch (e) {
      if (e instanceof ZodError) {
        console.log(
          `${req.method}: ${req.url}:: Error parsing request:\n`,
          e.flatten()
        );
        res.status(STATUS.BAD_REQUEST).json(e.flatten());
      } else {
        console.error(`${req.method}: ${req.url}::`, e);
        res
          .status(STATUS.SERVER_ERROR)
          .json({ message: "Internal server error" });
      }
    }
  } else if (req.method === "PATCH") {
    /**
     * PATCH /api/v3/locations/[id]
     **/
    if (!authorizeRequest(req, res)) {
      return;
    }

    try {
      /* parse request parameters from query and body */
      const locationId = zIdFromString.parse(req.query.id);
      const { name } = zUpdateLocation.parse(req.body);

      let location = await Location.findById({ id: locationId });
      if (!location) {
        const message = `Location with id '${locationId}' does not exist`;
        console.log(`${req.method}: ${req.url}:: ${message}`);

        res.status(STATUS.NOT_FOUND).json({ message });
        return;
      }

      let totalChanges = 0;
      if (name) {
        const { changedRows } = await Location.updateName({
          id: locationId,
          name,
        });
        totalChanges += changedRows;
      }

      location = await Location.findById({ id: locationId });

      res
        .status(STATUS.OK)
        .json({ status: "Success", totalChanges, updatedValue: location });
    } catch (e) {
      if (e instanceof ZodError) {
        console.log(
          `${req.method}: ${req.url}:: Error parsing request body:\n`,
          e.flatten()
        );
        res.status(STATUS.BAD_REQUEST).json(e.flatten());
      } else {
        console.error(`${req.method}: ${req.url}::`, e);
        res
          .status(STATUS.SERVER_ERROR)
          .json({ error: "Internal server error" });
      }
    }
  } else if (req.method === "DELETE") {
    /**
     * DELETE /api/v3/locations/[id]
     **/
    if (!authorizeRequest(req, res)) {
      return;
    }

    try {
      /* parse request parameters from query and body */
      const locationId = zIdFromString.parse(req.query.id);

      let location = await Location.findById({ id: locationId });
      if (!location) {
        const message = `Location with id '${locationId}' does not exist`;
        console.log(`${req.method}: ${req.url}:: ${message}`);

        res.status(STATUS.NOT_FOUND).json({ message });
        return;
      }

      const { changedRows } = await Location.deleteById({ id: locationId });

      res.status(STATUS.OK).json({ status: "Success", deletedValue: location });
    } catch (e) {
      if (e instanceof ZodError) {
        console.log(
          `${req.method}: ${req.url}:: Error parsing request body:\n`,
          e.flatten()
        );
        res.status(STATUS.BAD_REQUEST).json(e.flatten());
      } else {
        console.error(`${req.method}: ${req.url}::`, e);
        res
          .status(STATUS.SERVER_ERROR)
          .json({ error: "Internal server error" });
      }
    }
  } else {
    /**
     * {unknown} /api/v3/locations/[id]
     **/
    console.log(`${req.method}: ${req.url}:: Method not allowed`);
    res.setHeader("Allow", "GET, PATCH, DELETE");
    res
      .status(STATUS.NOT_ALLOWED)
      .json({ error: `Method '${req.method}' not allowed.` });
    return;
  }
};

export default handler;
