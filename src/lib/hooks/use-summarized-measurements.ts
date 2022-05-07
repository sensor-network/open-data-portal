import useSWR from "swr";
import { fetcher } from "~/lib/utils/fetch";
import type {
  SummarizedMeasurement,
  Summary,
} from "~/pages/api/v3/measurements/history";
import { laggy } from "~/lib/middleware/swr-laggy";

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
