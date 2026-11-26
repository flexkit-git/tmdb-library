import "server-only";

import { movieRouter } from "./routers/movie";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  movie: movieRouter,
});

export type AppRouter = typeof appRouter;
