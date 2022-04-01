import { useRef, useEffect, useCallback } from "react";
import useSWR from "swr";

import { fetcher as defaultFetcher } from "src/lib/utilityFunctions";

/**
 * Taken from the official docs at:
 * https://swr.vercel.app/docs/middleware#keep-previous-result
 * This is an SWR middleware for keeping the data even if key changes.
 **/
export function laggy(useSWRNext) {
  return (key, fetcher, config) => {
    // Use a ref to store previous returned data.
    const laggyDataRef = useRef();

    // Actual SWR hook.
    const swr = useSWRNext(key, fetcher, config);

    useEffect(() => {
      // Update ref if data is not undefined.
      if (swr.data !== undefined) {
        laggyDataRef.current = swr.data;
      }
    }, [swr.data]);

    // Expose a method to clear the laggy data, if any.
    const resetLaggy = useCallback(() => {
      laggyDataRef.current = undefined;
    }, []);

    // Fallback to previous data if the current data is undefined.
    const dataOrLaggyData = swr.data === undefined ? laggyDataRef.current : swr.data;

    // Is it showing previous data?
    const isLagging = swr.data === undefined && laggyDataRef.current !== undefined;

    // Also add a `isLagging` field to SWR.
    return Object.assign({}, swr, {
      data: dataOrLaggyData,
      isLagging,
      resetLaggy,
    });
  };
}


/* Wrapper for SWR using 'laggy' data */
export const useMeasurements = (url, fetcher = defaultFetcher) => {
  const { data, isLagging } = useSWR(url, {
    fetcher: () => fetcher(url),
    use: [laggy],
  });
  return {
    measurements: data?.data,
    rowCount: data?.pagination.total_rows,
    isLoading: isLagging,
  };
};