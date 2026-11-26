import "server-only";

import { z } from "zod";

const API_BASE_URL = "https://api.themoviedb.org/3";
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 2;

export class TmdbError extends Error {
  readonly status: number;

  constructor(message: string, status: number, options?: ErrorOptions) {
    super(message, options);
    this.name = "TmdbError";
    this.status = status;
  }
}

type QueryParams = Record<string, string | number | boolean | undefined>;

/**
 * TMDB hands out two credentials: a v4 "API Read Access Token" (a JWT, sent as
 * a bearer token) and a v3 "API Key" (sent as a query param). Either works for
 * the v3 endpoints used here, and people regularly paste one into the env var
 * meant for the other, so accept both and decide by shape.
 */
function resolveCredentials(): { bearer: string } | { apiKey: string } {
  // `||`, not `??`: a blank `TMDB_ACCESS_TOKEN=` line shouldn't hide the key.
  const credential =
    process.env.TMDB_ACCESS_TOKEN?.trim() || process.env.TMDB_API_KEY?.trim();

  if (!credential) {
    throw new TmdbError(
      "Missing TMDB credentials. Set TMDB_ACCESS_TOKEN (or TMDB_API_KEY) in .env.local for local development, or in the hosting provider's environment variables for deploys (pages are prerendered, so the build needs it too). See .env.example.",
      401,
    );
  }

  const looksLikeJwt = credential.split(".").length === 3;
  return looksLikeJwt ? { bearer: credential } : { apiKey: credential };
}

function buildRequest(path: string, params: QueryParams) {
  const url = new URL(`${API_BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const headers = new Headers({ accept: "application/json" });
  const credentials = resolveCredentials();
  if ("bearer" in credentials) {
    headers.set("authorization", `Bearer ${credentials.bearer}`);
  } else {
    url.searchParams.set("api_key", credentials.apiKey);
  }

  return { url, headers };
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

function retryDelay(attempt: number, response?: Response) {
  const retryAfterSeconds = Number(response?.headers.get("retry-after"));
  const delay =
    Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
      ? retryAfterSeconds * 1000
      : 250 * 2 ** attempt;
  return Math.min(delay, 2_000);
}

/**
 * Fetches a TMDB endpoint and validates the response against `schema`.
 *
 * Rate limiting (429), upstream 5xx and network failures are retried briefly;
 * everything else surfaces as a `TmdbError` carrying the HTTP status so callers
 * can tell "not found" apart from "TMDB is having a moment".
 */
export async function tmdb<Schema extends z.ZodType>(
  path: string,
  schema: Schema,
  params: QueryParams = {},
): Promise<z.output<Schema>> {
  const { url, headers } = buildRequest(path, params);

  for (let attempt = 0; ; attempt++) {
    const canRetry = attempt < MAX_RETRIES;

    let response: Response;
    try {
      response = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (cause) {
      if (canRetry) {
        await sleep(retryDelay(attempt));
        continue;
      }
      throw new TmdbError(`Could not reach TMDB (${path}).`, 503, { cause });
    }

    if (response.ok) {
      const parsed = schema.safeParse(await response.json());
      if (!parsed.success) {
        throw new TmdbError(
          `Unexpected response shape from TMDB (${path}): ${z.prettifyError(parsed.error)}`,
          502,
        );
      }
      return parsed.data;
    }

    if ((response.status === 429 || response.status >= 500) && canRetry) {
      await sleep(retryDelay(attempt, response));
      continue;
    }

    if (response.status === 401) {
      throw new TmdbError(
        "TMDB rejected the credentials. Check TMDB_ACCESS_TOKEN / TMDB_API_KEY.",
        401,
      );
    }

    throw new TmdbError(
      `TMDB responded with ${response.status} (${path}).`,
      response.status,
    );
  }
}
