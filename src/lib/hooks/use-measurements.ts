import type { Measurement } from "~/lib/database/measurement";
import type { Pagination } from "~/pages/api/v3/measurements";
import { fetcher } from "~/lib/utils/fetch";
import { laggy } from "~/lib/middleware/swr-laggy";

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
