export const urlWithParams = (
  baseUrl: string,
  params: { [key: string]: any }
) => baseUrl + new URLSearchParams(params);

export class FetcherError extends Error {
  constructor({
    name,
    message,
    status,
  }: {
    name: string;
    message: string;
    status: number;
  }) {
    super(message);
    this.name = "FetcherError";
  }
}

export const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new FetcherError({
      name: response.statusText,
      message: await response.json(),
      status: response.status,
    });
  }
  return await response.json();
};
