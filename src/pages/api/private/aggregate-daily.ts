import { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from 'zod';
import { format, isValid } from 'date-fns';

import { HTTP_STATUS as STATUS } from 'src/lib/httpStatusCodes';
import * as Location from 'lib/database/location';
import * as History from 'lib/database/history';
import * as Sensor from 'lib/database/sensor';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    console.log(`${req.method}: /api/private/aggregate-daily:: Method not allowed`);
    res.setHeader('Allow', 'POST')
      .status(STATUS.NOT_ALLOWED)
      .json({ error: `Method '${req.method}' not allowed.` });
    return;
  }

  /**
   * Use Bearer authentication schema with private token for this
   * endpoint, which should not be queryable by external sources.
   **/
  const AUTHENTICATION_SCHEMA = 'Bearer';
  const AUTHENTICATION_TOKEN = process.env.NEXT_PUBLIC_PRIVATE_API_KEY;

  const { authorization } = req.headers;
  if (authorization !== `${AUTHENTICATION_SCHEMA} ${AUTHENTICATION_TOKEN}`) {
    const errorMessage = `Failed to authenticate the request with the provided authorization-header: '${authorization}'`;
    console.log(`${req.method} /api/private/aggregate-daily:: ${errorMessage}`);

    res.setHeader('WWW-Authenticate', AUTHENTICATION_SCHEMA)
      .status(STATUS.UNAUTHORIZED)
      .json({ error: errorMessage });
    return;
  }

  try {
    /* parse and validate date from query */
    const date = z.string()
      .refine(str => isValid(new Date(str)), 'Unable to parse string as Date')
      .transform(str => format(new Date(str), 'yyyy-MM-dd'))
      .parse(req.query.date);

    /* get all locations from database, as well as the available sensors */
    const locations = await Location.findMany();
    const sensorTypes = await Sensor.findAllTypes();

    /* now aggregate the data for all locations and sensor-types */
    let insertedIds: number[] = [];
    for (const { id: locationId } of locations) {
      for (const type of sensorTypes) {
        /* see if data for such date and sensor has already been aggregated */
        const history = await History.findByFilter({ date, sensorType: type, locationId });
        if (history.length === 0) {
          const insertId = await History.createOne({
            date,
            sensorType: type,
            locationId,
          });
          insertedIds.push(insertId);
        }
      }
    }
    res.status(STATUS.OK)
      .json({ insertedIds });
  }
  catch (e) {
    if (e instanceof ZodError) {
      console.log(`${req.method}: /api/private/aggregate-daily::`, e.flatten());
      res.status(STATUS.BAD_REQUEST)
        .json(e.flatten());
    }
    else {
      console.error(`${req.method}: /api/private/aggregate-daily::`, e);
      res.status(STATUS.SERVER_ERROR)
        .json({
          error: 'There was an error when executing the cron job.'
        });
    }
  }
};

export default handler;