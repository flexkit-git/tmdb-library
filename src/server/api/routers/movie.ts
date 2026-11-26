import "server-only";

import { z } from "zod";

import { type Feed, feedSchema } from "@/lib/feed";
import {
  getMoviesByGenre,
  getTrending,
  searchMovies,
} from "@/server/tmdb/queries";
import { MAX_PAGE } from "@/server/tmdb/schemas";

import { createTRPCRouter, publicProcedure } from "../trpc";

const SEARCH_RESULT_LIMIT = 8;

function loadFeed(feed: Feed, page: number) {
  switch (feed.kind) {
    case "trending":
      return getTrending(feed.window, page);
    case "genre":
      return getMoviesByGenre(feed.genreId, page);
  }
}

export const movieRouter = createTRPCRouter({
  /** Cursor-paginated movie lists, shaped for `useInfiniteQuery`. */
  feed: publicProcedure
    .input(
      z.object({
        feed: feedSchema,
        cursor: z.number().int().min(1).max(MAX_PAGE).default(1),
      }),
    )
    .query(async ({ input }) => {
      const { page, totalPages, results } = await loadFeed(
        input.feed,
        input.cursor,
      );
      return {
        movies: results,
        nextCursor: page < totalPages ? page + 1 : null,
      };
    }),

  /** Top matches for the search palette. */
  search: publicProcedure
    .input(z.object({ query: z.string().trim().min(1).max(100) }))
    .query(async ({ input }) => {
      const { results, totalResults } = await searchMovies(input.query);
      return {
        movies: results.slice(0, SEARCH_RESULT_LIMIT),
        totalResults,
      };
    }),
});
