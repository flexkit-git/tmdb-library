"use client";

import { BookmarkCheckIcon, BookmarkIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsInWatchlist, watchlist } from "@/lib/watchlist";
import type { WatchlistItem } from "@/lib/watchlist-item";

type WatchlistButtonProps = {
  movie: WatchlistItem;
  /** `icon` sits on top of posters; `labeled` is the full button on detail views. */
  variant?: "icon" | "labeled";
  className?: string;
};

export function WatchlistButton({
  movie,
  variant = "icon",
  className,
}: WatchlistButtonProps) {
  const saved = useIsInWatchlist(movie.id);

  function toggle() {
    if (saved) {
      watchlist.remove(movie.id);
      toast(`Removed “${movie.title}” from your watchlist`, {
        action: { label: "Undo", onClick: () => watchlist.add(movie) },
      });
    } else {
      watchlist.add(movie);
      toast(`Added “${movie.title}” to your watchlist`);
    }
  }

  const Icon = saved ? BookmarkCheckIcon : BookmarkIcon;

  if (variant === "labeled") {
    return (
      <Button
        variant="outline"
        size="lg"
        aria-pressed={saved}
        onClick={toggle}
        className={cn(
          "h-11 gap-2 px-5 text-sm backdrop-blur-sm",
          saved && "border-primary/50 text-primary dark:border-primary/50",
          className,
        )}
      >
        <Icon aria-hidden className="size-4" />
        {saved ? "In watchlist" : "Add to watchlist"}
      </Button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={
        saved
          ? `Remove ${movie.title} from watchlist`
          : `Add ${movie.title} to watchlist`
      }
      title={saved ? "Remove from watchlist" : "Add to watchlist"}
      onClick={toggle}
      className={cn(
        "flex size-9 items-center justify-center rounded-full bg-black/60 text-white ring-1 ring-white/15 backdrop-blur-sm transition outline-none hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-ring active:scale-95",
        saved && "bg-primary text-primary-foreground ring-0 hover:bg-primary/90",
        className,
      )}
    >
      <Icon aria-hidden className="size-4" />
    </button>
  );
}
