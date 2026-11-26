import Link from "next/link";

import { Poster } from "@/components/poster";
import { Rating } from "@/components/rating";
import { WatchlistButton } from "@/components/watchlist-button";
import { formatShortDate, formatYear } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toWatchlistItem, type WatchlistItem } from "@/lib/watchlist-item";

type MovieCardProps = {
  movie: WatchlistItem;
  /** 1-based position in a ranked list; rendered as a large numeral on the poster. */
  rank?: number;
  /** Show the release day ("Dec 18") instead of the year, for upcoming films. */
  showReleaseDay?: boolean;
  /** The `sizes` attribute for the poster image. */
  sizes: string;
  /** Load the poster immediately; use for cards that are visible on first paint. */
  eager?: boolean;
  className?: string;
};

export function MovieCard({
  movie,
  rank,
  showReleaseDay = false,
  sizes,
  eager,
  className,
}: MovieCardProps) {
  const released = movie.releaseDate
    ? showReleaseDay
      ? formatShortDate(movie.releaseDate)
      : formatYear(movie.releaseDate)
    : null;

  return (
    <article className={cn("group/card relative", className)}>
      <Link
        href={`/movie/${movie.id}`}
        className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      >
        <Poster
          path={movie.posterPath}
          title={movie.title}
          sizes={sizes}
          eager={eager}
          className="transition duration-300 group-hover/card:ring-primary/60"
          imageClassName="transition duration-500 ease-out group-hover/card:scale-[1.04]"
        />

        {rank !== undefined && (
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute top-0 left-0 flex aspect-2/3 w-full items-end rounded-lg bg-linear-to-t from-black/85 via-black/10 via-35% to-transparent p-3 font-display text-6xl leading-[0.8] font-black tracking-tight",
              rank <= 3 ? "text-primary" : "text-white",
            )}
          >
            {rank}
          </span>
        )}

        <div className="mt-3 space-y-1">
          <h3 className="truncate text-sm leading-snug font-medium text-foreground transition-colors group-hover/card:text-primary">
            {rank !== undefined && <span className="sr-only">#{rank}: </span>}
            {movie.title}
          </h3>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            {released && <span>{released}</span>}
            {released && movie.rating !== null && (
              <span aria-hidden className="text-muted-foreground/40">
                •
              </span>
            )}
            <Rating value={movie.rating} />
            {!released && movie.rating === null && <span>Release date TBA</span>}
          </p>
        </div>
      </Link>

      <WatchlistButton
        movie={toWatchlistItem(movie)}
        className={cn(
          "absolute top-2 right-2 opacity-0 transition group-hover/card:opacity-100 focus-visible:opacity-100 aria-pressed:opacity-100 pointer-coarse:opacity-100",
        )}
      />
    </article>
  );
}
