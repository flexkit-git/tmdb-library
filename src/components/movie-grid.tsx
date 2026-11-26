import type { ReactNode } from "react";

import { MovieCard } from "@/components/movie-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { WatchlistItem } from "@/lib/watchlist-item";

/** How wide a grid poster renders, for the image `sizes` attribute. */
export const GRID_POSTER_SIZES =
  "(min-width: 1344px) 240px, (min-width: 1024px) 18vw, (min-width: 640px) 22vw, 45vw";

/** Posters in the first rows are likely above the fold; load those eagerly. */
const EAGER_POSTERS = 5;

export function MovieGridLayout({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-5 lg:grid-cols-5 lg:gap-x-6 lg:gap-y-10",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function MovieGrid({
  movies,
  ranked = false,
  eager = false,
}: {
  movies: WatchlistItem[];
  /** Number the cards 1…n. */
  ranked?: boolean;
  /** Set for a grid that starts above the fold. */
  eager?: boolean;
}) {
  return (
    <MovieGridLayout>
      {movies.map((movie, index) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          rank={ranked ? index + 1 : undefined}
          sizes={GRID_POSTER_SIZES}
          eager={eager && index < EAGER_POSTERS}
        />
      ))}
    </MovieGridLayout>
  );
}

export function MovieCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-2/3 rounded-lg" />
      <Skeleton className="mt-3 h-4 w-4/5" />
      <Skeleton className="mt-2 h-3 w-2/5" />
    </div>
  );
}

export function MovieGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <MovieGridLayout>
      {Array.from({ length: count }, (_, index) => (
        <MovieCardSkeleton key={index} />
      ))}
    </MovieGridLayout>
  );
}
