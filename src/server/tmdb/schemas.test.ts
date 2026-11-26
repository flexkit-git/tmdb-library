import { describe, expect, it, vi } from "vitest";

import { movieDetailsSchema, moviePageSchema } from "./schemas";

// `server-only` throws when imported outside a React Server environment.
vi.mock("server-only", () => ({}));

const rawMovie = {
  id: 27205,
  title: "Inception",
  overview: "A thief who steals corporate secrets…",
  poster_path: "/poster.jpg",
  backdrop_path: "/backdrop.jpg",
  release_date: "2010-07-15",
  vote_average: 8.369,
  vote_count: 37000,
  genre_ids: [28, 878],
  adult: false,
};

function page(results: unknown[], overrides: Record<string, unknown> = {}) {
  return {
    page: 1,
    results,
    total_pages: 1,
    total_results: results.length,
    ...overrides,
  };
}

describe("moviePageSchema", () => {
  it("maps a TMDB list entry to a MovieSummary", () => {
    expect(moviePageSchema.parse(page([rawMovie])).results).toEqual([
      {
        id: 27205,
        title: "Inception",
        overview: "A thief who steals corporate secrets…",
        posterPath: "/poster.jpg",
        backdropPath: "/backdrop.jpg",
        releaseDate: "2010-07-15",
        rating: 8.369,
        voteCount: 37000,
        genreIds: [28, 878],
      },
    ]);
  });

  it("normalizes TMDB's empty values to null", () => {
    const [movie] = moviePageSchema.parse(
      page([
        {
          ...rawMovie,
          overview: "",
          poster_path: null,
          backdrop_path: "",
          release_date: "",
          vote_average: 0,
          vote_count: 0,
          genre_ids: undefined,
        },
      ]),
    ).results;

    expect(movie).toMatchObject({
      overview: "",
      posterPath: null,
      backdropPath: null,
      releaseDate: null,
      rating: null,
      voteCount: 0,
      genreIds: [],
    });
  });

  it("drops adult, malformed and duplicate entries instead of failing", () => {
    const { results } = moviePageSchema.parse(
      page([
        rawMovie,
        { ...rawMovie, id: 2, title: "Adults only", adult: true },
        { id: "not-a-number", title: 42 },
        { ...rawMovie, id: 3, title: "" },
        rawMovie,
        { ...rawMovie, id: 4, title: "Tenet" },
      ]),
    );

    expect(results.map((movie) => movie.title)).toEqual(["Inception", "Tenet"]);
  });

  it("caps the page count at what TMDB will actually serve", () => {
    const parsed = moviePageSchema.parse(page([], { total_pages: 48_213 }));
    expect(parsed.totalPages).toBe(500);
  });
});

describe("movieDetailsSchema", () => {
  const video = (overrides: Record<string, unknown>) => ({
    key: "key",
    name: "Video",
    site: "YouTube",
    type: "Trailer",
    official: true,
    published_at: "2010-05-10T00:00:00.000Z",
    ...overrides,
  });

  const rawDetails = {
    ...rawMovie,
    genre_ids: undefined,
    genres: [
      { id: 28, name: "Action" },
      { id: 878, name: "Science Fiction" },
    ],
    original_title: "Inception",
    original_language: "en",
    tagline: "Your mind is the scene of the crime.",
    runtime: 148,
    status: "Released",
    homepage: "",
    imdb_id: "tt1375666",
    budget: 160_000_000,
    revenue: 0,
    production_companies: [
      { id: 1, name: "Legendary Pictures" },
      { id: 2, name: "Syncopy" },
      { id: 3, name: "Syncopy" },
    ],
    credits: {
      cast: [
        { id: 2, name: "Second Billed", character: "Arthur", order: 1 },
        { id: 1, name: "First Billed", character: "Cobb", order: 0 },
        { id: 3, name: "No Character", character: "", order: 2 },
      ],
      crew: [
        { name: "Christopher Nolan", job: "Director", department: "Directing" },
        { name: "Christopher Nolan", job: "Writer", department: "Writing" },
        { name: "Christopher Nolan", job: "Story", department: "Writing" },
        { name: "Emma Thomas", job: "Producer", department: "Production" },
      ],
    },
    videos: {
      results: [
        video({ key: "featurette", type: "Featurette" }),
        video({ key: "fan-trailer", official: false, published_at: "2024-01-01" }),
        video({ key: "vimeo", site: "Vimeo" }),
        video({ key: "old-trailer", published_at: "2009-12-01" }),
        video({ key: "new-trailer", published_at: "2010-05-10" }),
        video({ key: "teaser", type: "Teaser" }),
      ],
    },
    recommendations: { results: [] },
    similar: {
      results: [rawMovie, { ...rawMovie, id: 157336, title: "Interstellar" }],
    },
    release_dates: {
      results: [
        { iso_3166_1: "DE", release_dates: [{ certification: "12" }] },
        {
          iso_3166_1: "US",
          release_dates: [{ certification: "" }, { certification: "PG-13" }],
        },
      ],
    },
  };

  const movie = movieDetailsSchema.parse(rawDetails);

  it("treats zeros and empty strings as unknown", () => {
    expect(movie.revenue).toBeNull();
    expect(movie.homepage).toBeNull();
    expect(movie.budget).toBe(160_000_000);
  });

  it("only reports an original title that differs from the title", () => {
    expect(movie.originalTitle).toBeNull();
    expect(
      movieDetailsSchema.parse({ ...rawDetails, original_title: "インセプション" })
        .originalTitle,
    ).toBe("インセプション");
  });

  it("orders cast by billing and blanks empty characters", () => {
    expect(movie.cast.map((member) => member.name)).toEqual([
      "First Billed",
      "Second Billed",
      "No Character",
    ]);
    expect(movie.cast[2]?.character).toBeNull();
  });

  it("lists each director and writer once", () => {
    expect(movie.directors).toEqual(["Christopher Nolan"]);
    expect(movie.writers).toEqual(["Christopher Nolan"]);
    expect(movie.productionCompanies).toEqual(["Legendary Pictures", "Syncopy"]);
  });

  it("picks the newest official YouTube trailer", () => {
    expect(movie.trailer?.key).toBe("new-trailer");
    expect(movie.videos.map((entry) => entry.key)).toEqual([
      "new-trailer",
      "old-trailer",
      "fan-trailer",
      "teaser",
      "featurette",
    ]);
  });

  it("has no trailer when there are only other kinds of video", () => {
    const parsed = movieDetailsSchema.parse({
      ...rawDetails,
      videos: { results: [video({ key: "teaser", type: "Teaser" })] },
    });
    expect(parsed.trailer).toBeNull();
  });

  it("uses the first US certification that isn't blank", () => {
    expect(movie.certification).toBe("PG-13");
  });

  it("falls back to similar movies, never recommending the movie itself", () => {
    expect(movie.recommendations.map((entry) => entry.title)).toEqual([
      "Interstellar",
    ]);
  });

  it("tolerates a response without any of the appended sections", () => {
    const bare = movieDetailsSchema.parse({ id: 1, title: "Bare" });
    expect(bare).toMatchObject({
      cast: [],
      directors: [],
      videos: [],
      trailer: null,
      recommendations: [],
      certification: null,
      genres: [],
      genreIds: [],
    });
  });
});
