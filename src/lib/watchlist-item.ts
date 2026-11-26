import type { MovieSummary } from "@/types/movie";

/** The slice of a movie we persist, enough to render its card offline. */
export type WatchlistItem = Pick<
  MovieSummary,
  "id" | "title" | "posterPath" | "releaseDate" | "rating"
>;

/**
 * Narrows a movie to what the watchlist stores. Server Components call this
 * before handing a movie to `<WatchlistButton>` so the rest of the object
 * (overview, cast, …) isn't serialized into the page for no reason.
 */
export function toWatchlistItem(movie: WatchlistItem): WatchlistItem {
  return {
    id: movie.id,
    title: movie.title,
    posterPath: movie.posterPath,
    releaseDate: movie.releaseDate,
    rating: movie.rating,
  };
}
