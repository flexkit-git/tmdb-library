import { GenreLinks } from "@/components/genre-links";
import { HeroSpotlight, type SpotlightMovie } from "@/components/hero-spotlight";
import { LoadMoreMovies } from "@/components/load-more-movies";
import { MovieGrid } from "@/components/movie-grid";
import { MovieRail } from "@/components/movie-rail";
import { SectionHeading } from "@/components/section-heading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toWatchlistItem } from "@/lib/watchlist-item";
import {
  getGenres,
  getMovieList,
  getTrending,
  getUpcoming,
} from "@/server/tmdb/queries";
import type { MovieSummary, Page, TrendingWindow } from "@/types/movie";

const SPOTLIGHT_COUNT = 5;
const SPOTLIGHT_GENRE_COUNT = 3;

/**
 * Everything on this page reads from cached TMDB queries, so the whole page is
 * prerendered and served as static HTML, then refreshed in the background as
 * those caches expire. Nothing here waits on TMDB while a visitor is loading.
 */
export default function HomePage() {
  return (
    <>
      <h1 className="sr-only">Trending movies today</h1>
      <Spotlight />
      <div className="mt-14 space-y-20 sm:mt-20 sm:space-y-24">
        <Trending />
        <NowPlaying />
        <ComingSoon />
        <TopRated />
        <Genres />
      </div>
    </>
  );
}

async function Spotlight() {
  const [trending, genres] = await Promise.all([
    getTrending("day"),
    getGenres(),
  ]);
  const genreNames = new Map(genres.map((genre) => [genre.id, genre.name]));

  const movies = trending.results
    .flatMap((movie, index): SpotlightMovie[] =>
      // The spotlight is built around the backdrop; skip films without one.
      movie.backdropPath
        ? [
            {
              ...toWatchlistItem(movie),
              rank: index + 1,
              overview: movie.overview,
              backdropPath: movie.backdropPath,
              genres: movie.genreIds
                .flatMap((id) => genreNames.get(id) ?? [])
                .slice(0, SPOTLIGHT_GENRE_COUNT),
            },
          ]
        : [],
    )
    .slice(0, SPOTLIGHT_COUNT);

  return <HeroSpotlight movies={movies} />;
}

async function Trending() {
  const [today, thisWeek] = await Promise.all([
    getTrending("day"),
    getTrending("week"),
  ]);

  return (
    <section id="trending" className="container-page">
      <Tabs defaultValue="day" className="gap-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="What everyone’s watching" title="Trending" />
          <TabsList className="h-10! rounded-full p-1">
            <TabsTrigger value="day" className="rounded-full px-4">
              Today
            </TabsTrigger>
            <TabsTrigger value="week" className="rounded-full px-4">
              This week
            </TabsTrigger>
          </TabsList>
        </div>
        {/* Both lists are server-rendered, so switching tabs is instant. */}
        <TabsContent value="day">
          <TrendingList window="day" page={today} />
        </TabsContent>
        <TabsContent value="week">
          <TrendingList window="week" page={thisWeek} />
        </TabsContent>
      </Tabs>
    </section>
  );
}

function TrendingList({
  window,
  page,
}: {
  window: TrendingWindow;
  page: Page<MovieSummary>;
}) {
  const movies = page.results;

  if (movies.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        Nothing is trending right now. Check back in a bit.
      </p>
    );
  }

  return (
    <>
      <MovieGrid movies={movies.map(toWatchlistItem)} ranked />
      {page.totalPages > 1 && (
        <LoadMoreMovies
          feed={{ kind: "trending", window }}
          renderedIds={movies.map((movie) => movie.id)}
          ranked
        />
      )}
    </>
  );
}

async function NowPlaying() {
  const { results } = await getMovieList("now_playing");
  return (
    <MovieRail
      id="now-playing"
      eyebrow="In theaters"
      title="Now playing"
      movies={results.map(toWatchlistItem)}
    />
  );
}

async function ComingSoon() {
  const { results } = await getUpcoming();
  return (
    <MovieRail
      id="coming-soon"
      eyebrow="Mark your calendar"
      title="Coming soon"
      movies={results.map(toWatchlistItem)}
      showReleaseDay
    />
  );
}

async function TopRated() {
  const { results } = await getMovieList("top_rated");
  return (
    <MovieRail
      id="top-rated"
      eyebrow="All-time favorites"
      title="Top rated"
      movies={results.map(toWatchlistItem)}
    />
  );
}

async function Genres() {
  const genres = await getGenres();
  if (genres.length === 0) return null;

  return (
    <section id="genres" className="container-page">
      <SectionHeading eyebrow="In the mood for" title="Browse by genre" />
      <GenreLinks genres={genres} className="mt-6" />
    </section>
  );
}
