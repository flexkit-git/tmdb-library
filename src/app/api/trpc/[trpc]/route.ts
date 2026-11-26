import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter } from "@/server/api/root";

const handler = (request: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: () => ({}),
    /**
     * Every procedure is a public, user-independent read of TMDB data, so
     * successful queries can be cached at the CDN. Identical requests (same
     * search term, same page of a feed) then never reach the function, which
     * also keeps us well inside TMDB's rate limits.
     */
    responseMeta({ type, errors }) {
      if (type !== "query" || errors.length > 0) return {};
      return {
        headers: new Headers({
          "cache-control":
            "public, s-maxage=300, stale-while-revalidate=3600",
        }),
      };
    },
    onError({ path, error }) {
      // Bad input is the caller's problem; only log what we need to act on.
      if (error.code === "BAD_REQUEST") return;
      console.error(`tRPC ${path ?? "<unknown>"} failed: ${error.code}`);
    },
  });

export { handler as GET, handler as POST };
