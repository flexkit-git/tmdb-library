import {
  ArrowUpRightIcon,
  PlayIcon,
  StarIcon,
  UserRoundIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { MovieRail } from "@/components/movie-rail";
import { Poster } from "@/components/poster";
import { RailScroller } from "@/components/rail-scroller";
import { SectionHeading } from "@/components/section-heading";
import { TmdbImage } from "@/components/tmdb-image";
import { Button } from "@/components/ui/button";
import { VideoDialog } from "@/components/video-dialog";
import { WatchlistButton } from "@/components/watchlist-button";
import {
  formatCount,
  formatDate,
  formatLanguage,
  formatMoney,
  formatRating,
  formatRuntime,
  formatYear,
} from "@/lib/format";
import { toWatchlistItem } from "@/lib/watchlist-item";
import type { CastMember, MovieDetails, Video } from "@/types/movie";

const MAX_COMPANIES = 3;

export function MovieView({ movie }: { movie: MovieDetails }) {
  const year = formatYear(movie.releaseDate);

  const facts: { label: string; value: string | null }[] = [
    { label: "Status", value: movie.status },
    {
      label: "Release date",
      value: movie.releaseDate ? formatDate(movie.releaseDate) : null,
    },
    {
      label: "Original language",
      value: movie.originalLanguage
        ? formatLanguage(movie.originalLanguage)
        : null,
    },
    { label: "Budget", value: movie.budget ? formatMoney(movie.budget) : null },
    {
      label: "Box office",
      value: movie.revenue ? formatMoney(movie.revenue) : null,
    },
    {
      label: "Production",
      value:
        movie.productionCompanies.slice(0, MAX_COMPANIES).join(", ") || null,
    },
  ].filter((fact) => fact.value !== null);

  const links = [
    movie.homepage && { label: "Official site", href: movie.homepage },
    movie.imdbId && {
      label: "IMDb",
      href: `https://www.imdb.com/title/${movie.imdbId}/`,
    },
    { label: "TMDB", href: `https://www.themoviedb.org/movie/${movie.id}` },
  ].filter((link) => !!link);

  return (
    <article>
      <div className="relative isolate -mt-(--header-height) pt-(--header-height)">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 -z-10 h-[34rem] overflow-hidden sm:h-[40rem]"
        >
          {movie.backdropPath && (
            <TmdbImage
              kind="backdrop"
              path={movie.backdropPath}
              alt=""
              fill
              sizes="100vw"
              loading="eager"
              fetchPriority="high"
              className="object-cover object-[center_15%] opacity-60"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/75 to-background/30" />
          <div className="absolute inset-0 bg-linear-to-r from-background/80 to-transparent" />
        </div>

        <div className="container-page pt-10 sm:pt-20">
          <div className="grid gap-8 md:grid-cols-[16rem_minmax(0,1fr)] lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-12">
            <Poster
              path={movie.posterPath}
              title={movie.title}
              sizes="(min-width: 1024px) 304px, (min-width: 768px) 256px, 192px"
              standalone
              eager
              className="mx-auto w-48 self-start rounded-xl shadow-2xl shadow-black/60 md:w-full"
            />

            <div className="min-w-0">
              <h1 className="font-display text-5xl leading-[0.9] font-black tracking-tight text-balance uppercase sm:text-7xl">
                {movie.title}
              </h1>
              {movie.originalTitle && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Original title: {movie.originalTitle}
                </p>
              )}

              <ul className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-foreground/80">
                {movie.certification && (
                  <li>
                    <span className="sr-only">Rated </span>
                    <span className="rounded-sm border border-white/40 px-1.5 py-0.5 text-xs font-semibold tracking-wide">
                      {movie.certification}
                    </span>
                  </li>
                )}
                {year && <li>{year}</li>}
                {movie.runtime && <li>{formatRuntime(movie.runtime)}</li>}
                {movie.rating !== null && (
                  <li className="flex items-center gap-1.5">
                    <StarIcon
                      aria-hidden
                      className="size-4 fill-primary text-primary"
                    />
                    <span>
                      <span className="font-semibold text-foreground">
                        {formatRating(movie.rating)}
                      </span>
                      <span className="text-muted-foreground"> / 10</span>
                    </span>
                    <span className="text-muted-foreground">
                      ({formatCount(movie.voteCount)} votes)
                    </span>
                  </li>
                )}
              </ul>

              {movie.genres.length > 0 && (
                <ul aria-label="Genres" className="mt-5 flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <li key={genre.id}>
                      <Link
                        href={`/genre/${genre.id}`}
                        className="block rounded-full border border-input bg-white/5 px-3 py-1 text-xs font-medium text-foreground/90 backdrop-blur-sm transition outline-none hover:border-primary/60 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {genre.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                {movie.trailer && (
                  <VideoDialog video={movie.trailer} movieTitle={movie.title}>
                    <Button size="lg" className="h-11 gap-2 px-6 text-sm">
                      <PlayIcon aria-hidden className="size-4 fill-current" />
                      Play trailer
                    </Button>
                  </VideoDialog>
                )}
                <WatchlistButton
                  movie={toWatchlistItem(movie)}
                  variant="labeled"
                />
              </div>

              {movie.tagline && (
                <p className="mt-10 font-display text-2xl leading-tight font-semibold tracking-wide text-primary uppercase">
                  {movie.tagline}
                </p>
              )}

              <h2 className="sr-only">Overview</h2>
              <p
                className={
                  movie.tagline
                    ? "mt-3 max-w-3xl text-base leading-relaxed text-pretty text-foreground/85 sm:text-lg"
                    : "mt-10 max-w-3xl text-base leading-relaxed text-pretty text-foreground/85 sm:text-lg"
                }
              >
                {movie.overview || "No overview is available for this movie yet."}
              </p>

              {(movie.directors.length > 0 || movie.writers.length > 0) && (
                <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-4">
                  <Credit
                    label={movie.directors.length > 1 ? "Directors" : "Director"}
                    names={movie.directors}
                  />
                  <Credit
                    label={movie.writers.length > 1 ? "Writers" : "Writer"}
                    names={movie.writers}
                  />
                </dl>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 space-y-16 sm:mt-24 sm:space-y-20">
        {movie.cast.length > 0 && <CastRail cast={movie.cast} />}

        {movie.videos.length > 1 && (
          <section className="container-page">
            <SectionHeading eyebrow="Trailers & clips" title="Videos" />
            <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {movie.videos.map((video) => (
                <li key={video.key}>
                  <VideoThumbnail video={video} movieTitle={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="container-page">
          <SectionHeading eyebrow="The fine print" title="Details" />
          <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-white/10 pt-6 sm:grid-cols-3 lg:grid-cols-6">
            {facts.map((fact) => (
              <div key={fact.label}>
                <FactLabel>{fact.label}</FactLabel>
                <dd className="mt-1.5 text-sm text-foreground">{fact.value}</dd>
              </div>
            ))}
          </dl>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-sm text-sm text-muted-foreground underline decoration-white/20 underline-offset-4 transition-colors outline-none hover:text-primary hover:decoration-primary focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {link.label}
                  <ArrowUpRightIcon aria-hidden className="size-3.5" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <MovieRail
          eyebrow="If you liked this"
          title="More like this"
          movies={movie.recommendations.map(toWatchlistItem)}
        />
      </div>
    </article>
  );
}

function FactLabel({ children }: { children: ReactNode }) {
  return (
    <dt className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
      {children}
    </dt>
  );
}

function Credit({ label, names }: { label: string; names: string[] }) {
  if (names.length === 0) return null;

  return (
    <div>
      <FactLabel>{label}</FactLabel>
      <dd className="mt-1.5 text-sm font-medium text-foreground">
        {names.join(", ")}
      </dd>
    </div>
  );
}

function CastRail({ cast }: { cast: CastMember[] }) {
  return (
    <section>
      <RailScroller
        label="Cast"
        header={<SectionHeading eyebrow="Starring" title="Cast" />}
        focusable
      >
        {cast.map((member) => (
          <li key={member.id} className="w-28 shrink-0 snap-start sm:w-32">
            <div className="relative aspect-4/5 overflow-hidden rounded-lg bg-muted ring-1 ring-white/10">
              {member.profilePath ? (
                <TmdbImage
                  kind="profile"
                  path={member.profilePath}
                  alt=""
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-linear-to-b from-secondary to-muted">
                  <UserRoundIcon
                    aria-hidden
                    className="size-8 text-muted-foreground/50"
                  />
                </div>
              )}
            </div>
            <p className="mt-3 line-clamp-2 text-sm leading-snug font-medium">
              {member.name}
            </p>
            {member.character && (
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                <span className="sr-only">as </span>
                {member.character}
              </p>
            )}
          </li>
        ))}
      </RailScroller>
    </section>
  );
}

function VideoThumbnail({
  video,
  movieTitle,
}: {
  video: Video;
  movieTitle: string;
}) {
  return (
    <VideoDialog video={video} movieTitle={movieTitle}>
      <button
        type="button"
        className="group/video block w-full rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      >
        <span className="relative block aspect-video overflow-hidden rounded-lg bg-muted ring-1 ring-white/10 transition group-hover/video:ring-primary/60">
          <Image
            src={`https://i.ytimg.com/vi/${encodeURIComponent(video.key)}/mqdefault.jpg`}
            alt=""
            width={320}
            height={180}
            unoptimized
            className="size-full object-cover transition duration-500 ease-out group-hover/video:scale-[1.04]"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/30 transition group-hover/video:bg-black/10">
            <span className="flex size-11 items-center justify-center rounded-full bg-black/60 ring-1 ring-white/30 backdrop-blur-sm transition group-hover/video:bg-primary group-hover/video:text-primary-foreground group-hover/video:ring-0">
              <PlayIcon aria-hidden className="size-4 fill-current" />
            </span>
          </span>
        </span>
        <span className="mt-3 block truncate text-sm font-medium">
          <span className="sr-only">Play </span>
          {video.name}
        </span>
        <span className="block text-xs text-muted-foreground">
          {video.type}
        </span>
      </button>
    </VideoDialog>
  );
}
