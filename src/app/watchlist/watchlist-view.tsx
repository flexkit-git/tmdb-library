"use client";

import { BookmarkIcon } from "lucide-react";
import Link from "next/link";

import { MovieGrid, MovieGridSkeleton } from "@/components/movie-grid";
import { Button } from "@/components/ui/button";
import { useHasHydrated, useWatchlist } from "@/lib/watchlist";

export function WatchlistView() {
  const movies = useWatchlist();
  const hydrated = useHasHydrated();

  // The list lives in localStorage, which the server can't see. Hold a neutral
  // placeholder until hydration instead of flashing the empty state at people
  // who do have saved movies.
  if (!hydrated) {
    return (
      <div className="mt-12" aria-busy="true" aria-label="Loading watchlist">
        <MovieGridSkeleton count={5} />
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="mt-12 flex flex-col items-center rounded-2xl border border-dashed border-white/15 px-6 py-20 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <BookmarkIcon aria-hidden className="size-5" />
        </span>
        <h2 className="mt-5 text-lg font-medium">Nothing saved yet</h2>
        <p className="mt-2 max-w-sm text-sm text-pretty text-muted-foreground">
          Tap the bookmark on any movie to save it here. Your watchlist is kept
          in this browser, no account needed.
        </p>
        <Button asChild size="lg" className="mt-7 h-11 px-6 text-sm">
          <Link href="/#trending">Browse trending movies</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <p className="mt-4 text-muted-foreground">
        {movies.length} {movies.length === 1 ? "movie" : "movies"} saved in this
        browser.
      </p>
      <section className="mt-12">
        <h2 className="sr-only">Saved movies</h2>
        <MovieGrid movies={movies} eager />
      </section>
    </>
  );
}
