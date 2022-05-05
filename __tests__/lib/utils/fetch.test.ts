import { urlWithParams, fetcher } from "~/lib/utils/fetch";

describe("urlWithParams", () => {
  it("no params", () => {
    const url = "https://example.com";
    const params = {};
    const result = urlWithParams(url, params);
    expect(result).toEqual(url);
  });

  it("one param", () => {
    const url = "https://example.com";
    const params = {
      param1: "value1",
    };
    const result = urlWithParams(url, params);
    expect(result).toEqual("https://example.com?param1=value1");
  });

  it("multiple params", () => {
    const url = "https://example.com";
    const params = {
      param1: "value1",
      param2: "value2",
    };
    const result = urlWithParams(url, params);
    expect(result).toEqual("https://example.com?param1=value1&param2=value2");
  });

  it("baseUrl already has param", () => {
    const url = "https://example.com?param1=value1";
    const params = {
      param2: "value2",
    };
    const result = urlWithParams(url, params);
    expect(result).toEqual("https://example.com?param1=value1&param2=value2");
  });

  it("should handle different type of keys", () => {
    const url = "https://example.com";
    const params = {
      param1: "value1",
      param2: 2,
      param3: true,
    };
    const result = urlWithParams(url, params);
    expect(result).toEqual(
      "https://example.com?param1=value1&param2=2&param3=true"
    );
  });
});

describe("fetcher", () => {
  it("should return apiResponse", async () => {
    const apiResponse = [
      { id: 1, name: "John" },
      { id: 2, name: "Jane" },
    ];

    global.fetch = jest.fn().mockImplementation(async () => ({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => apiResponse,
    }));

    const url = "https://example.com";
    const result = await fetcher(url);
    expect(result).toEqual(apiResponse);
  });

  it("should throw if status is 404", async () => {
    global.fetch = jest.fn().mockImplementation(async () => ({
      ok: false,
      status: 404,
      statusText: "Not Found",
      json: async () => undefined,
    }));

    const url = "https://example.com";
    await expect(fetcher(url)).rejects.toThrow();
  });
});
