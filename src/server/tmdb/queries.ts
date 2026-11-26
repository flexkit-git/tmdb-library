import "server-only";

import { cacheLife } from "next/cache";

import type {
  Genre,
  MovieDetails,
  MovieSummary,
  Page,
  TrendingWindow,
} from "@/types/movie";

import { TmdbError, tmdb } from "./client";
import {
  genreListSchema,
  movieDetailsSchema,
  moviePageSchema,
} from "./schemas";

/**
 * Every read from TMDB goes through one of these functions. They are cached
 * with `use cache`, which is what lets Next.js prerender the pages built on
 * them and refresh the data in the background instead of on a visitor's time.
 * Server Components call them directly; the tRPC router exposes the same
 * functions to the browser.
 */

const LANGUAGE = "en-US";
const REGION = "US";

export type MovieListCategory = "now_playing" | "top_rated";

export async function getTrending(
  window: TrendingWindow,
  page = 1,
): Promise<Page<MovieSummary>> {
  "use cache";
  cacheLife("hours");

  return tmdb(`/trending/movie/${window}`, moviePageSchema, {
    language: LANGUAGE,
    page,
  });
}

export async function getMovieList(
  category: MovieListCategory,
  page = 1,
): Promise<Page<MovieSummary>> {
  "use cache";
  cacheLife("hours");

  return tmdb(`/movie/${category}`, moviePageSchema, {
    language: LANGUAGE,
    region: REGION,
    page,
  });
}

/**
 * TMDB's own `/movie/upcoming` list regularly includes films that are already
 * out, so ask `discover` for releases dated from today onwards instead.
 */
export async function getUpcoming(page = 1): Promise<Page<MovieSummary>> {
  "use cache";
  cacheLife("hours");

  const today = new Date().toISOString().slice(0, 10);

  return tmdb("/discover/movie", moviePageSchema, {
    language: LANGUAGE,
    region: REGION,
    include_adult: false,
    sort_by: "popularity.desc",
    "primary_release_date.gte": today,
    with_release_type: "2|3",
    page,
  });
}

export async function getMoviesByGenre(
  genreId: number,
  page = 1,
): Promise<Page<MovieSummary>> {
  "use cache";
  cacheLife("hours");

  return tmdb("/discover/movie", moviePageSchema, {
    language: LANGUAGE,
    include_adult: false,
    sort_by: "popularity.desc",
    with_genres: genreId,
    // Keeps obscure entries with a handful of votes from topping the list.
    "vote_count.gte": 50,
    page,
  });
}

export async function searchMovies(
  query: string,
  page = 1,
): Promise<Page<MovieSummary>> {
  "use cache";
  cacheLife("hours");

  return tmdb("/search/movie", moviePageSchema, {
    language: LANGUAGE,
    include_adult: false,
    query,
    page,
  });
}

export async function getGenres(): Promise<Genre[]> {
  "use cache";
  cacheLife("weeks");

  return tmdb("/genre/movie/list", genreListSchema, { language: LANGUAGE });
}

/** Resolves to `null` when TMDB has no movie with this id. */
export async function getMovie(id: number): Promise<MovieDetails | null> {
  "use cache";
  cacheLife("days");

  try {
    return await tmdb(`/movie/${id}`, movieDetailsSchema, {
      language: LANGUAGE,
      append_to_response:
        "credits,videos,recommendations,similar,release_dates",
    });
  } catch (error) {
    if (error instanceof TmdbError && error.status === 404) return null;
    throw error;
  }
}
