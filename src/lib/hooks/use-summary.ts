import useSWR from "swr";
import { fetcher } from "~/lib/utils/fetch";
import type {
  SummarizedMeasurement,
  Summary,
} from "~/pages/api/v3/measurements/history";

export const useSummary = (
  url: string,
  swrOptions?: { [key: string]: any }
) => {
  const { data, error } = useSWR<{
    summary: Summary;
    measurements: SummarizedMeasurement[];
  }>(url, {
    fetcher: () => fetcher(url),
    ...swrOptions,
  });
  return {
    summary: data?.summary,
    error: error,
    isLoading: !data && !error,
  };
};
