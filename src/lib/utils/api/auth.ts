import type { NextApiRequest, NextApiResponse } from "next";
import { HTTP_STATUS as STATUS } from "~/lib/constants";

const AUTHENTICATION_SCHEMA = "Bearer";
const AUTHENTICATION_TOKEN = process.env.NEXT_PUBLIC_API_KEY;

export const authorizeRequest = (req: NextApiRequest, res: NextApiResponse) => {
  const { authorization } = req.headers;

  if (authorization !== `${AUTHENTICATION_SCHEMA} ${AUTHENTICATION_TOKEN}`) {
    const errorMessage = `Failed to authenticate the request with the provided authorization-header: '${authorization}'`;
    console.log(`${req.method} ${req.url}:: ${errorMessage}`);

    res.setHeader("WWW-Authenticate", AUTHENTICATION_SCHEMA);
    res.status(STATUS.UNAUTHORIZED).json({ error: errorMessage });
    return false;
  }
  return true;
};
