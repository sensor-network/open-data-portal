import { ZodError } from "zod";

import { HTTP_STATUS as STATUS } from "src/lib/httpStatusCodes";
import { parseUnit as parseTempUnit } from "src/lib/units/temperature";
import { parseUnit as parseCondUnit } from "src/lib/units/conductivity";
import { getRowCount, findMany, createOne } from "src/lib/database/data";
import { zLocation, zTime, zPage, zDataColumns, zCreateInstance } from "src/lib/types/ZodSchemas";
import { sensorDataAsSI } from "src/lib/units/convertSensors";


const parseIncludeExclude = (include, exclude) => {
  /* select columns specified in include (or all if include is not specified)
  *  then remove columns specified in exclude */
  if (!include && !exclude) return zDataColumns.options;
  const includes = include ? include.split(",") : zDataColumns.options;
  const excludes = exclude ? exclude.split(",") : [];
  return includes.filter(col => !excludes.includes(col));
};

const handler = async (req, res) => {
  if (req.method === "GET") {
    try {
      const temperatureUnit = parseTempUnit(req.query.temperature_unit || "k");
      const conductivityUnit = parseCondUnit(req.query.conductivity_unit || "spm");

      const { long, lat, rad, location_name } = zLocation.parse(req.query);
      const { start_date, end_date } = zTime.parse(req.query);
      let { page, page_size } = zPage.parse(req.query);
      const include_columns = parseIncludeExclude(req.query.include, req.query.exclude);
      console.time("row-count");
      const rowCount = await getRowCount();
      const last_page = Math.ceil(rowCount / page_size) || 1; /* if rows=0, still want last_page=1 */
      if (page > last_page)
        page = last_page;
      const offset = (page - 1) * page_size;  // last row of previous page
      console.timeEnd("row-count");
      let data;
      
      if (location_name && location_name !== "all") {   // prioritize selecting by name
        console.time("db-call-by-name");
        data = await findMany("by-location-name", {
          location_name, start_date, end_date, offset, page_size,
        }, include_columns);
        console.timeEnd("db-call-by-name");
        
      }
      else if (lat && long && rad) {   // require both lat, long and rad to select by geolocation
        console.time("db-call-by-geo");
        data = await findMany("by-geolocation", {
          lat, long, rad, start_date, end_date, offset, page_size,
        }, include_columns);
        console.timeEnd("db-call-by-geo");
      }
      else {  // find all data if no location is specified
        console.time("db-call-all-locations");
        data = await findMany("all", {
          start_date, end_date, offset, page_size,
        }, include_columns);
        console.timeEnd("db-call-all-locations");
      }

      console.time("conversions");
      data.forEach(d => {
        if (d.hasOwnProperty("temperature"))
          d.temperature = temperatureUnit.fromKelvin(d.temperature);
        if (d.hasOwnProperty("conductivity"))
          d.conductivity = conductivityUnit.fromSiemensPerMeter(d.conductivity);
        if (d.hasOwnProperty("ph"))
          d.ph = Math.round(d.ph * 1E2) / 1E2;
      });
      console.timeEnd("conversions");
      
      res.status(STATUS.OK).json({
        pagination: {
          page,
          page_size,
          total_rows: rowCount,
          has_previous_page: page > 1,
          has_next_page: page < last_page,
        },
        units: {
          date: "UTC",
          temperature_unit: temperatureUnit.symbol,
          conductivity_unit: conductivityUnit.symbols[0],
        },
        data,
      });
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
    const api_key = req.query.api_key;
    if (!api_key) {
      console.log("ERROR: You have to provide an api_key as query parameter.");
      res.status(STATUS.FORBIDDEN).json({ error: "No API key provided." });
      return;
    }
    if (api_key !== process.env.NEXT_PUBLIC_API_KEY) {
      console.log("ERROR: The provided api_key could not be verified.");
      res.status(STATUS.FORBIDDEN).json({ error: "The provided API key could not be verified." });
      return;
    }

    const parseAndConvertInput = (input) => {
      const parsed = zCreateInstance.parse(input);
      return {
        ...parsed,
        sensors: sensorDataAsSI(parsed.sensors),
      };
    };
    try {
      if (Array.isArray(req.body)) {
        let measurements = [];
        for (const row of req.body) {
          const instance = parseAndConvertInput(row);
          const id = await createOne(instance);
          measurements.push({ id, ...instance });
        }
        res.status(STATUS.CREATED).json(measurements);
        return;
      }

      const instance = parseAndConvertInput(req.body);
      const id = await createOne(instance);
      res.status(STATUS.CREATED).json({ id, ...instance });
    } 
    catch (e) {
      if (e instanceof ZodError) {
        /*
         * e.issues can have path: ['sensors', '<ph_level>']. Want to remove the path
         * 'sensors' so that the inner-path '<ph_level>' is shown, for better error messages
         */
        e.issues.forEach(issue => {
          issue.path = issue.path.filter((path) => path !== "sensors");
        });
        console.log("ERROR: Could not parse request json:\n", e.flatten());
        res.status(STATUS.BAD_REQUEST)
          .json(e.flatten());
      } else {
        console.error(e);
        res.status(STATUS.SERVER_ERROR)
          .json({ error: "Error uploading data" });
      }
    }
  } else {
    console.log(`ERROR: Method ${req.method} not allowed.`);
    res.status(STATUS.NOT_ALLOWED)
      .json({
        error:
          `Method ${req.method} is not allowed for this endpoint. Please read the documentation on how to query the endpoint.`,
      });
  }
};

export default handler;
