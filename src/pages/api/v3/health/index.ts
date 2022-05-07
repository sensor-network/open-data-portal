import { NextApiRequest, NextApiResponse } from "next";
import { HTTP_STATUS as STATUS } from "~/lib/constants";
import * as Connection from "~/lib/database/connection";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  /* if the endpoint is callable and the request gets here, the server is ok */
  try {
    /* call db, if it doesn't throw, it is up and running */
    await Connection.getStatus();
    res.status(STATUS.OK).json({ status: { server: "UP", database: "UP" } });
  } catch (e) {
    /* if it throws, it is down */
    res.status(STATUS.OK).json({ status: { server: "UP", database: "DOWN" } });
  }
};

export default handler;
