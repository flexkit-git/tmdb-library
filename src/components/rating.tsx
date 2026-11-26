import { StarIcon } from "lucide-react";

import { formatRating } from "@/lib/format";
import { cn } from "@/lib/utils";

/** TMDB's 0–10 audience score. Renders nothing for movies without votes. */
export function Rating({
  value,
  className,
}: {
  value: number | null;
  className?: string;
}) {
  if (value === null) return null;

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <StarIcon
        aria-hidden
        className="size-[0.9em] fill-primary text-primary"
      />
      <span className="tabular-nums">
        <span className="sr-only">Rated </span>
        {formatRating(value)}
        <span className="sr-only"> out of 10</span>
      </span>
    </span>
  );
}
