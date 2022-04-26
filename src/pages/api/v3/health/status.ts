import { HTTP_STATUS as STATUS } from "~/lib/httpStatusCodes";
import { NextApiRequest, NextApiResponse } from "next";
import * as Connection from "~/lib/database/connection";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {

    /* call db (separat funktion för att det ska vara testbart) */
    try {
      await Connection.status({});
      res.status(STATUS.OK).json({ status: { server: "OK", database: "OK" } });
    } catch (e) {
      res
        .status(STATUS.OK)
        .json({ status: { server: "OK", database: "DOWN" } });
    }
  }
};

export default handler;

  