import { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from 'zod';
import { format, isValid } from 'date-fns';

import { HTTP_STATUS as STATUS } from 'src/lib/httpStatusCodes';
import { zDataColumns } from 'lib/types/ZodSchemas';
import * as Location from 'lib/database/location';
import * as HistoryDaily from 'lib/database/history_daily';

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
    /* parse and validate date from query, use yesterday if not specified (request is coming in at 00:00) */
    const date = z.string()
      .refine(str => isValid(new Date(str)), 'Unable to parse string as Date')
      .transform(str => format(new Date(str), 'yyyy-MM-dd'))
      .parse(req.query.date);

    /* get all locations from database, as well as the available sensors */
    const locations = await Location.findMany();
    const location_names = locations.map(l => l.name);
    const sensor_types = zDataColumns.options;

    /* now aggregate the data for all locations and sensor-types */
    let insertedIds: Array<number> = [];
    for (const name of location_names) {
      for (const type of sensor_types) {
        /* see if data for such date and sensor has already been aggregated */
        const history = await HistoryDaily.findByFilter({ date, sensor_type: type, location_name: name });
        if (history.length === 0) {
          const [min, avg, max] = [0, 0, 0];
          const insertId = await HistoryDaily.createOne({
            date,
            sensor_type: type,
            location_name: name,
            min,
            avg,
            max
          });
          insertedIds.push(insertId);
        }
      }
    }
    res.status(200).json({
      inserted_ids: insertedIds,
    });
  }
  catch (e) {
    if (e instanceof ZodError) {
      console.log(e.flatten());
      res.status(STATUS.BAD_REQUEST)
        .json(e.flatten());
    }
    else {
      console.error(e);
      res.status(STATUS.SERVER_ERROR)
        .json({
          error: 'There was an error when executing the cron job.'
        });
    }
  }
};

export default handler;