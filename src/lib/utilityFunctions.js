export const fetcher = async (url) => {
    const response = await fetch(url);
    return await response.json();
  };

export const urlWithParams = (baseUrl, params) => baseUrl + new URLSearchParams(params);