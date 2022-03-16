import { ZodError } from "zod";

import {
  STATUS_OK,
  STATUS_BAD_REQUEST,
  STATUS_SERVER_ERROR
} from "src/lib/httpStatusCodes";
import { getRowCount, findMany } from "src/lib/database/findData";
import { zLocation, zTime, zPage } from 'src/lib/schemas/ZodSchemas';
 
export default async function (req, res) {
    try {
        const { long, lat, rad, name } = zLocation.parse(req.query);
        const { start_date, end_date } = zTime.parse(req.query);
        let { page, page_size } = zPage.parse(req.query);

        const rowCount = await getRowCount();
        const last_page = Math.ceil(rowCount / page_size);
        if (page > last_page)
            page = last_page;
        const offset = (page - 1) * page_size;  // last row of previous page

        let data;
        if ( name ) {   // prioritize selecting by name
            data = await findMany('by-location-name', {
                name, start_date, end_date, offset, page_size
            });
        }
        else if ( lat && long && rad ) {   // require both lat, long and rad to select by geolocation
            data = await findMany('by-geolocation', {
                lat, long, rad, start_date, end_date, offset, page_size
            });
        }
        else {  // find all data if no location is specified
            data = await findMany('all', {
                start_date, end_date, offset, page_size
            });
        }

        res.status(STATUS_OK).json({content: data});
    }

    catch (e) {
        if (e instanceof ZodError) {
            console.log("Error parsing query params:\n", e.flatten())
            res.status(STATUS_BAD_REQUEST)
                .json(e.flatten());
        }
        else {
            console.error(e)
            res.status(STATUS_SERVER_ERROR).json({error: "Internal server error"})
        }
    }
} 

