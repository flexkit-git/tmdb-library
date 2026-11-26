import { MovieCard } from "@/components/movie-card";
import { RailScroller } from "@/components/rail-scroller";
import { SectionHeading } from "@/components/section-heading";
import type { WatchlistItem } from "@/lib/watchlist-item";

const RAIL_POSTER_SIZES = "(min-width: 640px) 176px, 144px";

type MovieRailProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  movies: WatchlistItem[];
  showReleaseDay?: boolean;
  className?: string;
};

/** A titled, horizontally scrolling row of movie cards. */
export function MovieRail({
  id,
  eyebrow,
  title,
  movies,
  showReleaseDay,
  className,
}: MovieRailProps) {
  if (movies.length === 0) return null;

  return (
    <section id={id} className={className}>
      <RailScroller
        label={title}
        header={<SectionHeading eyebrow={eyebrow} title={title} />}
      >
        {movies.map((movie) => (
          <li key={movie.id} className="w-36 shrink-0 snap-start sm:w-44">
            <MovieCard
              movie={movie}
              showReleaseDay={showReleaseDay}
              sizes={RAIL_POSTER_SIZES}
            />
          </li>
        ))}
      </RailScroller>
    </section>
  );
}
