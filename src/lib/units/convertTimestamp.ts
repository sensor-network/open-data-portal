import { ZodError } from "zod";

export function ISOStringToSQLTimestamp(ISOString: string) {
  try {
    /* JS Date-object is weird, and does not always support the T-separator  */
    const withoutT = ISOString.replace("T", " ");
    const inUTC = new Date(withoutT).toISOString();
    /* And Node MySQL does not accept the trailing Z when inserting timestamps */
    const idx = inUTC.length - 1;
    return inUTC.substring(0, idx);
  } catch (e) {
    throw new ZodError([
      {
        code: "invalid_date",
        path: ["time"],
        message:
          "Invalid time format. Time should be provided using ISO8601 format.",
      },
    ]);
  }
}
