import {ZodError} from "zod";

export function ISOStringToSQLTimestamp (ISOString) {
    /* JS Date-object is weird, and does not always support the T-separator  */
    const withoutT = ISOString.replace('T', ' ');
    try {
        const inUTC = new Date(withoutT).toISOString();
        /* And SQL Timestamps does not accept the trailing Z */
        const idx = inUTC.length - 1;
        return inUTC.substring(0, idx);
    }
    catch (e) {
        throw new ZodError([{
            code: "invalid_date",
            path: [ "timestamp" ],
            message: "Invalid timestamp format. Timestamps should be provided using ISO8601 format, e.g. 2022-03-08T18:31:23+0100."
        }]);
    }
}
