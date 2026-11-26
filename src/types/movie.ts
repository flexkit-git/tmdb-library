/**
 * Domain types for the app. The TMDB layer (`src/server/tmdb`) validates raw
 * API responses and maps them into these shapes, so nothing outside that layer
 * depends on TMDB's snake_case payloads or its "empty string means missing"
 * conventions.
 */

export type MovieSummary = {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  /** ISO date (`YYYY-MM-DD`), or null when TMDB has no release date. */
  releaseDate: string | null;
  /** TMDB vote average on a 0–10 scale; null when nobody has voted yet. */
  rating: number | null;
  voteCount: number;
  genreIds: number[];
};

export type Page<T> = {
  page: number;
  totalPages: number;
  totalResults: number;
  results: T[];
};

export type Genre = {
  id: number;
  name: string;
};

export type CastMember = {
  id: number;
  name: string;
  character: string | null;
  profilePath: string | null;
};

export type Video = {
  /** YouTube video id. */
  key: string;
  name: string;
  type: string;
};

export type MovieDetails = MovieSummary & {
  /** Only set when it differs from `title`. */
  originalTitle: string | null;
  tagline: string | null;
  /** Runtime in minutes. */
  runtime: number | null;
  status: string | null;
  genres: Genre[];
  /** US certification, e.g. "PG-13". */
  certification: string | null;
  homepage: string | null;
  imdbId: string | null;
  /** US dollars. */
  budget: number | null;
  /** US dollars. */
  revenue: number | null;
  /** ISO 639-1 code. */
  originalLanguage: string | null;
  productionCompanies: string[];
  directors: string[];
  writers: string[];
  cast: CastMember[];
  trailer: Video | null;
  videos: Video[];
  recommendations: MovieSummary[];
};

export type TrendingWindow = "day" | "week";
