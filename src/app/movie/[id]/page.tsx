import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { formatYear } from "@/lib/format";
import { tmdbImageUrl } from "@/lib/tmdb-image";
import { getMovie, getTrending } from "@/server/tmdb/queries";

import { MovieSkeleton } from "./movie-skeleton";
import { MovieView } from "./movie-view";

type Props = PageProps<"/movie/[id]">;

/** TMDB ids are positive integers; anything else can 404 without a request. */
function parseMovieId(id: string) {
  return /^[1-9]\d{0,9}$/.test(id) ? Number(id) : null;
}

async function loadMovie(params: Props["params"]) {
  const { id } = await params;
  const movieId = parseMovieId(id);
  return movieId === null ? null : getMovie(movieId);
}

/**
 * Prerender the movies people are most likely to click: today's trending list.
 * Every other movie is rendered on its first visit and cached from then on.
 */
export async function generateStaticParams() {
  const trending = await getTrending("day");
  return trending.results.map((movie) => ({ id: String(movie.id) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // If TMDB is failing, the page itself renders the error state; metadata
  // just falls back to the site defaults rather than failing a second time.
  const movie = await loadMovie(params).catch(() => undefined);
  if (movie === undefined) return {};
  if (movie === null) return { title: "Movie not found" };

  const year = formatYear(movie.releaseDate);
  const title = year ? `${movie.title} (${year})` : movie.title;
  const description = movie.overview || movie.tagline || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "video.movie",
      images: movie.backdropPath
        ? [tmdbImageUrl("backdrop", movie.backdropPath, 1280)]
        : undefined,
    },
  };
}

export default function MoviePage({ params }: Props) {
  return (
    // `params` is only known per request, so it is read inside the boundary:
    // the skeleton is the instant shell, and the movie streams into it.
    <Suspense fallback={<MovieSkeleton />}>
      <Movie params={params} />
    </Suspense>
  );
}

async function Movie({ params }: Pick<Props, "params">) {
  const movie = await loadMovie(params);
  if (!movie) notFound();

  return <MovieView movie={movie} />;
}
