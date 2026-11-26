import { FilmIcon } from "lucide-react";

import { TmdbImage } from "@/components/tmdb-image";
import { cn } from "@/lib/utils";

type PosterProps = {
  path: string | null;
  title: string;
  /** The `sizes` attribute: how wide the poster renders at each breakpoint. */
  sizes: string;
  /**
   * Pass `true` when the title is not shown next to the poster, so the image
   * itself needs to carry it for screen readers.
   */
  standalone?: boolean;
  /** For thumbnails too small to fit the title in the "no poster" placeholder. */
  compact?: boolean;
  eager?: boolean;
  className?: string;
  imageClassName?: string;
};

export function Poster({
  path,
  title,
  sizes,
  standalone = false,
  compact = false,
  eager = false,
  className,
  imageClassName,
}: PosterProps) {
  return (
    <div
      className={cn(
        "relative aspect-2/3 overflow-hidden rounded-lg bg-muted ring-1 ring-white/10",
        className,
      )}
    >
      {path ? (
        <TmdbImage
          kind="poster"
          path={path}
          alt={standalone ? `Poster for ${title}` : ""}
          fill
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
          className={cn("object-cover", imageClassName)}
        />
      ) : (
        <div
          role={standalone ? "img" : undefined}
          aria-label={standalone ? `No poster available for ${title}` : undefined}
          className={cn(
            "flex size-full flex-col items-center justify-center gap-3 bg-linear-to-b from-secondary to-muted text-center",
            !compact && "p-4",
          )}
        >
          <FilmIcon
            aria-hidden
            className={cn(
              "text-muted-foreground/60",
              compact ? "size-4" : "size-7",
            )}
          />
          {!compact && (
            <span
              aria-hidden
              className="line-clamp-3 font-display text-lg leading-tight font-semibold tracking-wide text-muted-foreground uppercase"
            >
              {title}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
