"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { LoaderCircleIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { MovieCard } from "@/components/movie-card";
import {
  GRID_POSTER_SIZES,
  MovieCardSkeleton,
  MovieGridLayout,
} from "@/components/movie-grid";
import { Button } from "@/components/ui/button";
import type { Feed } from "@/lib/feed";
import { useTRPC } from "@/trpc/client";

/** TMDB serves 20 movies per page. */
const PAGE_SIZE = 20;

type LoadMoreMoviesProps = {
  feed: Feed;
  /**
   * Ids already rendered on the server (page 1). TMDB lists shift while you
   * page through them, so a movie can show up again on a later page.
   */
  renderedIds: number[];
  /** Continue the 1…n numbering of a ranked grid. */
  ranked?: boolean;
};

/**
 * Continues a server-rendered grid of movies. Page 1 arrives as HTML with the
 * rest of the page; this picks up from page 2 over tRPC, and only once asked.
 */
export function LoadMoreMovies({
  feed,
  renderedIds,
  ranked = false,
}: LoadMoreMoviesProps) {
  const trpc = useTRPC();
  const [requested, setRequested] = useState(false);

  const query = useInfiniteQuery(
    trpc.movie.feed.infiniteQueryOptions(
      { feed },
      {
        initialCursor: 2,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        // Pages already in the cache (e.g. after switching tabs and back) are
        // shown right away; nothing is fetched until the button is pressed.
        enabled: requested,
      },
    ),
  );

  const movies = useMemo(() => {
    const seen = new Set(renderedIds);
    return (query.data?.pages ?? [])
      .flatMap((page) => page.movies)
      .filter((movie) => !seen.has(movie.id) && seen.add(movie.id));
  }, [query.data, renderedIds]);

  const isLoading = query.isFetching;
  const hasMore = query.data ? query.hasNextPage : true;

  function loadMore() {
    if (query.data) {
      void query.fetchNextPage();
    } else {
      setRequested(true);
      // After a failed first attempt the query is already enabled; retry it.
      if (query.isError) void query.refetch();
    }
  }

  return (
    <div className="mt-8 lg:mt-10">
      {(movies.length > 0 || isLoading) && (
        <MovieGridLayout className="mb-8 lg:mb-10">
          {movies.map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              rank={ranked ? renderedIds.length + index + 1 : undefined}
              sizes={GRID_POSTER_SIZES}
            />
          ))}
          {isLoading &&
            Array.from({ length: PAGE_SIZE / 2 }, (_, index) => (
              <MovieCardSkeleton key={`skeleton-${index}`} />
            ))}
        </MovieGridLayout>
      )}

      <div className="flex flex-col items-center gap-3">
        {query.isError && !isLoading && (
          <p role="alert" className="text-sm text-muted-foreground">
            Couldn’t load more movies. Check your connection and try again.
          </p>
        )}

        {hasMore ? (
          <Button
            variant="outline"
            size="lg"
            className="h-11 min-w-44 gap-2 px-6 text-sm"
            disabled={isLoading}
            onClick={loadMore}
          >
            {isLoading && (
              <LoaderCircleIcon aria-hidden className="size-4 animate-spin" />
            )}
            {isLoading
              ? "Loading…"
              : query.isError
                ? "Try again"
                : "Show more"}
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            That’s everything on this list.
          </p>
        )}
      </div>
    </div>
  );
}
