import "server-only";

import { initTRPC, TRPCError } from "@trpc/server";

const t = initTRPC.create();

/**
 * Every procedure is a thin read from TMDB, so an unexpected failure means the
 * upstream call failed. Report it as a 502 with a message that is safe to show
 * to people, instead of a generic 500.
 *
 * The original error is not inspected here on purpose: it is thrown inside a
 * `use cache` function and Next.js masks errors crossing that boundary (it logs
 * the real one, with its status, on the server).
 */
const upstreamErrors = t.middleware(async ({ next }) => {
  const result = await next();

  if (!result.ok && result.error.code === "INTERNAL_SERVER_ERROR") {
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: "The movie database is unavailable right now.",
      cause: result.error.cause,
    });
  }

  return result;
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure.use(upstreamErrors);
