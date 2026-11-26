import "server-only";

import { z } from "zod";

import type {
  CastMember,
  Genre,
  MovieDetails,
  MovieSummary,
  Page,
  Video,
} from "@/types/movie";

/** TMDB refuses to paginate past page 500 regardless of `total_pages`. */
export const MAX_PAGE = 500;

const MAX_CAST = 14;
const MAX_VIDEOS = 6;
const MAX_RECOMMENDATIONS = 14;
const MAX_WRITERS = 3;

// TMDB uses "" (and 0) for "unknown" about as often as it uses null.
const text = z
  .string()
  .nullish()
  .transform((value) => value?.trim() || null);

const positiveNumber = z
  .number()
  .nullish()
  .transform((value) => (value && value > 0 ? value : null));

const isoDate = z
  .string()
  .nullish()
  .transform((value) =>
    value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null,
  );

/**
 * Parses each element on its own and drops the ones that don't validate, so a
 * single malformed entry can't take down a whole list.
 */
function lenientArray<Item extends z.ZodType>(item: Item) {
  return z
    .array(z.unknown())
    .nullish()
    .transform((values) =>
      (values ?? []).flatMap((value) => {
        const parsed = item.safeParse(value);
        return parsed.success ? [parsed.data] : [];
      }),
    );
}

const rawMovieFields = {
  id: z.number().int(),
  title: z.string().trim().min(1),
  overview: text,
  poster_path: text,
  backdrop_path: text,
  release_date: isoDate,
  vote_average: z.number().nullish(),
  vote_count: z.number().nullish(),
  adult: z.boolean().nullish(),
};

type RawMovieBase = z.output<z.ZodObject<typeof rawMovieFields>>;

function toSummary(raw: RawMovieBase, genreIds: number[]): MovieSummary {
  const voteCount = raw.vote_count ?? 0;
  return {
    id: raw.id,
    title: raw.title,
    overview: raw.overview ?? "",
    posterPath: raw.poster_path,
    backdropPath: raw.backdrop_path,
    releaseDate: raw.release_date,
    rating: voteCount > 0 && raw.vote_average ? raw.vote_average : null,
    voteCount,
    genreIds,
  };
}

function uniqueById<T extends { id: number }>(items: T[]) {
  const seen = new Set<number>();
  return items.filter((item) => !seen.has(item.id) && seen.add(item.id));
}

const movieSummary = z
  .object({ ...rawMovieFields, genre_ids: z.array(z.number()).nullish() })
  .transform((raw) => ({
    adult: raw.adult === true,
    movie: toSummary(raw, raw.genre_ids ?? []),
  }));

const movieSummaries = lenientArray(movieSummary).transform((entries) =>
  uniqueById(
    entries.filter((entry) => !entry.adult).map((entry) => entry.movie),
  ),
);

export const moviePageSchema = z
  .object({
    page: z.number().int(),
    results: movieSummaries,
    total_pages: z.number().int(),
    total_results: z.number().int(),
  })
  .transform(
    (raw): Page<MovieSummary> => ({
      page: raw.page,
      totalPages: Math.min(raw.total_pages, MAX_PAGE),
      totalResults: raw.total_results,
      results: raw.results,
    }),
  );

const genre = z.object({ id: z.number().int(), name: z.string().min(1) });

export const genreListSchema = z
  .object({ genres: lenientArray(genre) })
  .transform((raw): Genre[] => raw.genres);

const castMember = z
  .object({
    id: z.number().int(),
    name: z.string().min(1),
    character: text,
    profile_path: text,
    order: z.number().nullish(),
  })
  .transform((raw) => ({
    order: raw.order ?? Number.MAX_SAFE_INTEGER,
    member: {
      id: raw.id,
      name: raw.name,
      character: raw.character,
      profilePath: raw.profile_path,
    } satisfies CastMember,
  }));

const crewMember = z.object({
  name: z.string().min(1),
  job: text,
  department: text,
});

const video = z.object({
  key: z.string().min(1),
  name: text,
  site: z.string(),
  type: z.string(),
  official: z.boolean().nullish(),
  published_at: text,
});

type RawVideo = z.output<typeof video>;

const VIDEO_TYPE_ORDER = ["Trailer", "Teaser", "Clip", "Featurette"];

/** Trailers first, official uploads before fan ones, newest first within that. */
function rankVideos(videos: RawVideo[]): Video[] {
  const typeRank = (type: string) => {
    const index = VIDEO_TYPE_ORDER.indexOf(type);
    return index === -1 ? VIDEO_TYPE_ORDER.length : index;
  };

  return videos
    .filter((entry) => entry.site === "YouTube")
    .sort(
      (a, b) =>
        typeRank(a.type) - typeRank(b.type) ||
        Number(b.official === true) - Number(a.official === true) ||
        (b.published_at ?? "").localeCompare(a.published_at ?? ""),
    )
    .map((entry) => ({
      key: entry.key,
      name: entry.name ?? entry.type,
      type: entry.type,
    }));
}

const releaseDatesByCountry = z.object({
  iso_3166_1: z.string(),
  release_dates: lenientArray(z.object({ certification: text })),
});

function unique(values: string[]) {
  return [...new Set(values)];
}

export const movieDetailsSchema = z
  .object({
    ...rawMovieFields,
    original_title: text,
    original_language: text,
    tagline: text,
    runtime: positiveNumber,
    status: text,
    homepage: text,
    imdb_id: text,
    budget: positiveNumber,
    revenue: positiveNumber,
    genres: lenientArray(genre),
    production_companies: lenientArray(z.object({ name: z.string().min(1) })),
    credits: z
      .object({
        cast: lenientArray(castMember),
        crew: lenientArray(crewMember),
      })
      .nullish(),
    videos: z.object({ results: lenientArray(video) }).nullish(),
    recommendations: z.object({ results: movieSummaries }).nullish(),
    similar: z.object({ results: movieSummaries }).nullish(),
    release_dates: z
      .object({ results: lenientArray(releaseDatesByCountry) })
      .nullish(),
  })
  .transform((raw): MovieDetails => {
    const crew = raw.credits?.crew ?? [];
    const videos = rankVideos(raw.videos?.results ?? []);
    const trailer = videos.find((entry) => entry.type === "Trailer") ?? null;

    const recommendations = raw.recommendations?.results.length
      ? raw.recommendations.results
      : (raw.similar?.results ?? []);

    const usCertification =
      raw.release_dates?.results
        .find((entry) => entry.iso_3166_1 === "US")
        ?.release_dates.find((release) => release.certification)
        ?.certification ?? null;

    return {
      ...toSummary(
        raw,
        raw.genres.map((entry) => entry.id),
      ),
      originalTitle:
        raw.original_title && raw.original_title !== raw.title
          ? raw.original_title
          : null,
      tagline: raw.tagline,
      runtime: raw.runtime,
      status: raw.status,
      genres: raw.genres,
      certification: usCertification,
      homepage: raw.homepage,
      imdbId: raw.imdb_id,
      budget: raw.budget,
      revenue: raw.revenue,
      originalLanguage: raw.original_language,
      productionCompanies: unique(
        raw.production_companies.map((company) => company.name),
      ),
      directors: unique(
        crew.filter((member) => member.job === "Director").map((m) => m.name),
      ),
      writers: unique(
        crew
          .filter((member) => member.department === "Writing")
          .map((member) => member.name),
      ).slice(0, MAX_WRITERS),
      cast: (raw.credits?.cast ?? [])
        .sort((a, b) => a.order - b.order)
        .slice(0, MAX_CAST)
        .map((entry) => entry.member),
      trailer,
      videos: videos.slice(0, MAX_VIDEOS),
      recommendations: recommendations
        .filter((movie) => movie.id !== raw.id)
        .slice(0, MAX_RECOMMENDATIONS),
    };
  });
