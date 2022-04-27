import useSWR, { Middleware, SWRHook } from "swr";
import { useRef, useEffect, useCallback } from "react";

import { fetcher } from "src/lib/utilityFunctions";
import type { Measurement } from "~/lib/database/measurement";
import type { Pagination } from "~/pages/api/v3/measurements";
import type {
  SummarizedMeasurement,
  Summary,
} from "pages/api/v3/measurements/history";

/**
 * Taken from the official docs at:
 * https://swr.vercel.app/docs/middleware#keep-previous-result
 * This is an SWR middleware for keeping the data even if key changes.
 **/
export const laggy: Middleware = (useSWRNext: SWRHook) => {
  return (key, fetcher, config) => {
    // Use a ref to store previous returned data.
    const laggyDataRef = useRef<any>();

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
    const dataOrLaggyData =
      swr.data === undefined ? laggyDataRef.current : swr.data;

    // Is it showing previous data?
    const isLagging =
      swr.data === undefined && laggyDataRef.current !== undefined;

    // Also add a `isLagging` field to SWR.
    return Object.assign({}, swr, {
      data: dataOrLaggyData,
      error: swr.error,
      isLagging,
      resetLaggy,
    });
  };
};

/* Wrapper for SWR using 'laggy' data */
export const useMeasurements = (
  url: string,
  swrOptions?: { [key: string]: any }
) => {
  // @ts-ignore - isLagging field added by 'laggy' middleware. Not sure how to type this.
  const { data, isLagging, error } = useSWR<{
    measurements: Measurement;
    pagination: Pagination;
  }>(url, {
    fetcher: () => fetcher(url),
    ...swrOptions,
    use: [laggy],
  });
  return {
    measurements: data?.measurements,
    pagination: data?.pagination,
    isLoading: !data && !error,
    isLagging: isLagging,
    error: error,
  };
};

export const useSummarizedData = (
  url: string,
  swrOptions?: { [key: string]: any }
) => {
  // @ts-ignore - isLagging field added by 'laggy' middleware. Not sure how to type this.
  const { data, isLagging, error } = useSWR<{
    summary: Summary;
    measurements: SummarizedMeasurement[];
  }>(url, {
    fetcher: () => fetcher(url),
    ...swrOptions,
    use: [laggy],
  });

  return {
    summarizedData: data?.summary,
    isLoading: !data && !error,
    isLagging,
    error,
  };
};

export const useSummarizedMeasurements = (
  url: string,
  swrOptions?: { [key: string]: any }
) => {
  // @ts-ignore - isLagging field added by 'laggy' middleware. Not sure how to type this.
  const { data, isLagging, error } = useSWR<{
    summary: Summary;
    measurements: SummarizedMeasurement[];
  }>(url, {
    fetcher: () => fetcher(url),
    ...swrOptions,
    use: [laggy],
  });

  return {
    summarizedMeasurements: data?.measurements,
    isLoading: !data && !error,
    isLagging,
    error,
  };
};
