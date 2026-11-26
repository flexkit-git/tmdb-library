"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Rating } from "@/components/rating";
import { Eyebrow } from "@/components/section-heading";
import { TmdbImage } from "@/components/tmdb-image";
import { Button } from "@/components/ui/button";
import { WatchlistButton } from "@/components/watchlist-button";
import { formatYear } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toWatchlistItem, type WatchlistItem } from "@/lib/watchlist-item";

export type SpotlightMovie = WatchlistItem & {
  /** Position in today's trending list (1-based). */
  rank: number;
  overview: string;
  backdropPath: string;
  genres: string[];
};

/**
 * The rotating spotlight at the top of the home page.
 *
 * Auto-advance is driven by the CSS animation on the active progress bar: when
 * it finishes, we move on. That gives pause-on-hover, pause-on-focus and
 * "don't rotate under prefers-reduced-motion" for free via `animation-play-state`
 * and `motion-reduce`, with no timers to keep in sync with the UI.
 */
export function HeroSpotlight({ movies }: { movies: SpotlightMovie[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  // The first backdrop is the LCP element. Hold the others back until it has
  // loaded so they don't compete with it for bandwidth.
  const [firstBackdropLoaded, setFirstBackdropLoaded] = useState(false);

  const active = movies[activeIndex];
  if (!active) return null;

  const year = formatYear(active.releaseDate);
  const advance = () => setActiveIndex((index) => (index + 1) % movies.length);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Top trending movies today"
      className="group/hero relative isolate -mt-(--header-height) flex h-[min(88svh,48rem)] min-h-[36rem] items-end overflow-hidden"
    >
      <div aria-hidden className="absolute inset-0 -z-10">
        {movies.map((movie, index) => {
          const isActive = index === activeIndex;
          if (index > 0 && !isActive && !firstBackdropLoaded) return null;

          return (
            <TmdbImage
              key={movie.id}
              kind="backdrop"
              path={movie.backdropPath}
              alt=""
              fill
              sizes="100vw"
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              onLoad={
                index === 0 ? () => setFirstBackdropLoaded(true) : undefined
              }
              className={cn(
                "object-cover object-[center_20%] transition-opacity duration-1000 ease-out",
                isActive ? "opacity-100" : "opacity-0",
              )}
            />
          );
        })}
        {/* Scrims: keep the copy legible and melt the image into the page. */}
        <div className="absolute inset-0 bg-linear-to-r from-background/95 via-background/55 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-t from-background via-background/70 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-background/70 to-transparent" />
      </div>

      <div className="container-page grid gap-8 pb-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-12 lg:pb-14">
        <div
          key={active.id}
          className="max-w-2xl animate-in duration-700 fade-in slide-in-from-bottom-3 motion-reduce:animate-none"
        >
          <Eyebrow>No. {active.rank} trending today</Eyebrow>
          <h2 className="mt-3 font-display text-6xl leading-[0.88] font-black tracking-tight text-balance uppercase sm:text-7xl lg:text-8xl">
            {active.title}
          </h2>

          <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-foreground/80">
            {year && <span>{year}</span>}
            {active.genres.length > 0 && (
              <>
                <Dot />
                <span>{active.genres.join(", ")}</span>
              </>
            )}
            {active.rating !== null && (
              <>
                <Dot />
                <Rating value={active.rating} className="font-medium" />
              </>
            )}
          </p>

          {active.overview && (
            <p className="mt-4 line-clamp-3 max-w-xl text-base leading-relaxed text-pretty text-foreground/75">
              {active.overview}
            </p>
          )}

          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-11 gap-2 px-6 text-sm">
              <Link href={`/movie/${active.id}`}>
                View details
                <ArrowRightIcon aria-hidden className="size-4" />
              </Link>
            </Button>
            <WatchlistButton
              movie={toWatchlistItem(active)}
              variant="labeled"
            />
          </div>
        </div>

        {movies.length > 1 && (
          <ol className="flex gap-2 sm:gap-3">
            {movies.map((movie, index) => {
              const isActive = index === activeIndex;
              return (
                <li key={movie.id} className="flex-1 sm:w-32 sm:flex-none">
                  <button
                    type="button"
                    aria-label={`${movie.rank}. ${movie.title}`}
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => setActiveIndex(index)}
                    className="group/thumb block w-full rounded-md py-3 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:py-0"
                  >
                    <span
                      className={cn(
                        "relative hidden aspect-video overflow-hidden rounded-md ring-1 ring-white/15 transition sm:block",
                        isActive
                          ? "ring-2 ring-primary"
                          : "opacity-60 group-hover/thumb:opacity-100",
                      )}
                    >
                      <TmdbImage
                        kind="backdrop"
                        path={movie.backdropPath}
                        alt=""
                        fill
                        sizes="128px"
                        className="object-cover"
                      />
                      <span className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
                      <span className="absolute bottom-1 left-2 font-display text-2xl leading-none font-black text-white">
                        {movie.rank}
                      </span>
                    </span>

                    <span className="block h-1 overflow-hidden rounded-full bg-white/20 sm:mt-2">
                      {isActive && (
                        <span
                          onAnimationEnd={advance}
                          className="block h-full origin-left animate-hero-progress bg-primary group-focus-within/hero:[animation-play-state:paused] group-hover/hero:[animation-play-state:paused] motion-reduce:animate-none"
                        />
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}

function Dot() {
  return (
    <span aria-hidden className="text-foreground/30">
      •
    </span>
  );
}
