import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { TmdbError, tmdb } from "./client";

// `server-only` throws when imported outside a React Server environment.
vi.mock("server-only", () => ({}));

const schema = z.object({ ok: z.boolean() });

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), init);

const fetchMock = vi.fn<typeof fetch>();

/** The URL and headers of the nth call to `fetch`. */
function request(call = 0) {
  const [url, init] = fetchMock.mock.calls[call] ?? [];
  return { url: url as URL, headers: new Headers(init?.headers) };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("TMDB_ACCESS_TOKEN", "");
  vi.stubEnv("TMDB_API_KEY", "");
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

/** Runs a request to completion, fast-forwarding through retry back-off. */
async function settle<T>(
  promise: Promise<T>,
): Promise<{ value?: T; error?: unknown }> {
  const settled = promise.then(
    (value) => ({ value }),
    (error: unknown) => ({ error }),
  );
  await vi.runAllTimersAsync();
  return settled;
}

describe("credentials", () => {
  it("sends a v4 read access token as a bearer header", async () => {
    vi.stubEnv("TMDB_ACCESS_TOKEN", "header.payload.signature");
    fetchMock.mockResolvedValue(json({ ok: true }));

    await tmdb("/movie/1", schema);

    expect(request().headers.get("authorization")).toBe(
      "Bearer header.payload.signature",
    );
    expect(request().url.searchParams.has("api_key")).toBe(false);
  });

  it("sends a v3 key as a query parameter", async () => {
    vi.stubEnv("TMDB_API_KEY", "0123456789abcdef0123456789abcdef");
    fetchMock.mockResolvedValue(json({ ok: true }));

    await tmdb("/movie/1", schema);

    expect(request().url.searchParams.get("api_key")).toBe(
      "0123456789abcdef0123456789abcdef",
    );
    expect(request().headers.has("authorization")).toBe(false);
  });

  it("goes by the credential's shape, not the variable it was put in", async () => {
    vi.stubEnv("TMDB_API_KEY", "header.payload.signature");
    fetchMock.mockResolvedValue(json({ ok: true }));

    await tmdb("/movie/1", schema);

    expect(request().headers.get("authorization")).toBe(
      "Bearer header.payload.signature",
    );
  });

  it("fails with setup instructions when nothing is configured", async () => {
    await expect(tmdb("/movie/1", schema)).rejects.toThrow(
      /Missing TMDB credentials/,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("requests", () => {
  beforeEach(() => vi.stubEnv("TMDB_API_KEY", "key"));

  it("builds the URL from the path and params, skipping undefined ones", async () => {
    fetchMock.mockResolvedValue(json({ ok: true }));

    await tmdb("/discover/movie", schema, {
      page: 2,
      include_adult: false,
      region: undefined,
    });

    const { url } = request();
    expect(url.origin + url.pathname).toBe(
      "https://api.themoviedb.org/3/discover/movie",
    );
    expect(url.searchParams.get("page")).toBe("2");
    expect(url.searchParams.get("include_adult")).toBe("false");
    expect(url.searchParams.has("region")).toBe(false);
  });

  it("retries when rate limited, then succeeds", async () => {
    fetchMock
      .mockResolvedValueOnce(json({}, { status: 429 }))
      .mockResolvedValueOnce(json({ ok: true }));

    const result = await settle(tmdb("/movie/1", schema));

    expect(result).toEqual({ value: { ok: true } });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("retries network failures and gives up after three attempts", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));

    const result = await settle(tmdb("/movie/1", schema));

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(result.error).toBeInstanceOf(TmdbError);
    expect(result.error).toMatchObject({ status: 503 });
  });

  it("does not retry a 404, and reports the status", async () => {
    fetchMock.mockResolvedValue(json({ status_code: 34 }, { status: 404 }));

    const result = await settle(tmdb("/movie/0", schema));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.error).toMatchObject({ name: "TmdbError", status: 404 });
  });

  it("explains a rejected credential", async () => {
    fetchMock.mockResolvedValue(json({ status_code: 7 }, { status: 401 }));

    await expect(tmdb("/movie/1", schema)).rejects.toThrow(
      /rejected the credentials/,
    );
  });

  it("rejects a response that doesn't match the schema", async () => {
    fetchMock.mockResolvedValue(json({ ok: "yes" }));

    const result = await settle(tmdb("/movie/1", schema));

    expect(result.error).toMatchObject({ name: "TmdbError", status: 502 });
  });
});
