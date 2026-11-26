import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { GenreLinks } from "@/components/genre-links";
import { LoadMoreMovies } from "@/components/load-more-movies";
import { MovieGrid, MovieGridSkeleton } from "@/components/movie-grid";
import { Eyebrow } from "@/components/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { toWatchlistItem } from "@/lib/watchlist-item";
import { getGenres, getMoviesByGenre } from "@/server/tmdb/queries";

type Props = PageProps<"/genre/[id]">;

async function loadGenre(params: Props["params"]) {
  const { id } = await params;
  const genres = await getGenres();
  const genre = genres.find((entry) => String(entry.id) === id);
  return { genre, genres };
}

/** There are only a couple dozen genres, so prerender them all. */
export async function generateStaticParams() {
  const genres = await getGenres();
  return genres.map((genre) => ({ id: String(genre.id) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { genre } = await loadGenre(params);
  if (!genre) return { title: "Genre not found" };

  return {
    title: `${genre.name} movies`,
    description: `The most popular ${genre.name.toLowerCase()} movies right now.`,
  };
}

export default function GenrePage({ params }: Props) {
  return (
    <div className="container-page pt-10 sm:pt-16">
      <Suspense fallback={<GenreSkeleton />}>
        <GenreMovies params={params} />
      </Suspense>
    </div>
  );
}

async function GenreMovies({ params }: Pick<Props, "params">) {
  const { genre, genres } = await loadGenre(params);
  if (!genre) notFound();

  const { results, totalPages } = await getMoviesByGenre(genre.id);

  return (
    <>
      <Eyebrow>Genre</Eyebrow>
      <h1 className="mt-3 font-display text-6xl leading-[0.9] font-black tracking-tight uppercase sm:text-7xl">
        {genre.name}
      </h1>
      <p className="mt-4 text-muted-foreground">
        The most popular {genre.name.toLowerCase()} movies right now.
      </p>

      <nav aria-label="Genres" className="mt-8">
        <GenreLinks genres={genres} activeId={genre.id} />
      </nav>

      <section className="mt-12">
        <h2 className="sr-only">{genre.name} movies</h2>
        {results.length > 0 ? (
          <>
            <MovieGrid movies={results.map(toWatchlistItem)} eager />
            {totalPages > 1 && (
              <LoadMoreMovies
                feed={{ kind: "genre", genreId: genre.id }}
                renderedIds={results.map((movie) => movie.id)}
              />
            )}
          </>
        ) : (
          <p className="py-12 text-center text-muted-foreground">
            No movies found for this genre.
          </p>
        )}
      </section>
    </>
  );
}

function GenreSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading genre">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="mt-3 h-14 w-72 sm:h-16" />
      <Skeleton className="mt-4 h-5 w-80 max-w-full" />
      <div className="mt-8 flex flex-wrap gap-2.5">
        {Array.from({ length: 12 }, (_, index) => (
          <Skeleton key={index} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="mt-12">
        <MovieGridSkeleton />
      </div>
    </div>
  );
}
