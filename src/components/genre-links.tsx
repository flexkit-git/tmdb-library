import Link from "next/link";

import { cn } from "@/lib/utils";
import type { Genre } from "@/types/movie";

/** A wrapping row of genre pills linking to each genre's page. */
export function GenreLinks({
  genres,
  activeId,
  className,
}: {
  genres: Genre[];
  /** The genre currently being viewed, if any. */
  activeId?: number;
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-wrap gap-2.5", className)}>
      {genres.map((genre) => {
        const isActive = genre.id === activeId;
        return (
          <li key={genre.id}>
            <Link
              href={`/genre/${genre.id}`}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "block rounded-full border px-4 py-2 text-sm transition outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "border-primary bg-primary font-medium text-primary-foreground"
                  : "border-input bg-white/3 text-foreground/90 hover:border-primary/60 hover:bg-primary/10 hover:text-primary",
              )}
            >
              {genre.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
