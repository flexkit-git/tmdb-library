"use client";

import { BookmarkIcon } from "lucide-react";
import Link from "next/link";

import { useWatchlist } from "@/lib/watchlist";

/** Header link to the watchlist, with a live count of saved movies. */
export function WatchlistLink() {
  const count = useWatchlist().length;

  return (
    <Link
      href="/watchlist"
      className="relative flex h-9 items-center gap-2 rounded-full px-3 text-sm text-muted-foreground transition outline-none hover:bg-white/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
    >
      <BookmarkIcon aria-hidden className="size-4" />
      <span className="sr-only sm:not-sr-only">Watchlist</span>
      {count > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[0.7rem] leading-none font-semibold text-primary-foreground tabular-nums">
          {count}
          <span className="sr-only"> saved</span>
        </span>
      )}
    </Link>
  );
}
