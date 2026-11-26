"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Poster } from "@/components/poster";
import { Rating } from "@/components/rating";
import {
  Command,
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatYear } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import type { MovieSummary } from "@/types/movie";

const SUGGESTION_COUNT = 5;

function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

/** The header search button plus the ⌘K / "/" command palette it opens. */
export function SearchPalette() {
  const router = useRouter();
  const trpc = useTRPC();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const query = useDebouncedValue(input.trim(), 250);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isCommandK =
        event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey);
      const isSlash = event.key === "/" && !isTypingTarget(event.target);
      if (!isCommandK && !isSlash) return;

      event.preventDefault();
      setOpen((current) => (isCommandK ? !current : true));
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const search = useQuery(
    trpc.movie.search.queryOptions(
      { query },
      {
        enabled: open && query.length > 0,
        // Keep the previous matches on screen while the next ones load.
        placeholderData: keepPreviousData,
      },
    ),
  );

  // Something to pick from before the first keystroke.
  const suggestions = useQuery(
    trpc.movie.feed.queryOptions(
      { feed: { kind: "trending", window: "day" } },
      { enabled: open },
    ),
  );

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) setInput("");
  }

  function goToMovie(id: number) {
    handleOpenChange(false);
    router.push(`/movie/${id}`);
  }

  const isSearching = query.length > 0;
  const results = isSearching ? search : suggestions;
  const movies = isSearching
    ? search.data?.movies
    : suggestions.data?.movies.slice(0, SUGGESTION_COUNT);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search movies"
        aria-keyshortcuts="/ Meta+K Control+K"
        className="flex h-9 items-center gap-2 rounded-full border border-input bg-white/5 px-3 text-sm text-muted-foreground transition outline-none hover:bg-white/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring md:w-64"
      >
        <SearchIcon aria-hidden className="size-4 shrink-0" />
        <span className="hidden flex-1 text-left md:inline">
          Search movies…
        </span>
        <kbd className="hidden rounded border border-input bg-background/60 px-1.5 font-sans text-[0.7rem] leading-5 md:inline">
          /
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Search movies"
        description="Find a movie by its title."
        className="top-[12vh] sm:max-w-xl"
      >
        <Command shouldFilter={false} loop>
          <CommandInput
            value={input}
            onValueChange={setInput}
            placeholder="Search movies…"
          />
          <CommandList className="max-h-[min(60vh,28rem)]">
            {results.isPending ? (
              <ResultSkeletons />
            ) : results.isError ? (
              <Message>Search is unavailable right now. Try again shortly.</Message>
            ) : movies && movies.length > 0 ? (
              <CommandGroup
                heading={isSearching ? "Movies" : "Trending today"}
                className={cn(
                  "transition-opacity",
                  search.isPlaceholderData && isSearching && "opacity-60",
                )}
              >
                {movies.map((movie) => (
                  <CommandItem
                    key={movie.id}
                    value={String(movie.id)}
                    onSelect={() => goToMovie(movie.id)}
                    className="gap-3 py-2"
                  >
                    <SearchResult movie={movie} />
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : (
              <Message>
                {isSearching
                  ? `No movies found for “${query}”.`
                  : "Start typing to search."}
              </Message>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}

function SearchResult({ movie }: { movie: MovieSummary }) {
  const year = formatYear(movie.releaseDate);

  return (
    <>
      <Poster
        path={movie.posterPath}
        title={movie.title}
        sizes="40px"
        compact
        className="w-10 shrink-0 rounded-sm"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{movie.title}</span>
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          {year ?? "Release date TBA"}
          <Rating value={movie.rating} />
        </span>
      </span>
    </>
  );
}

function ResultSkeletons() {
  return (
    <div className="space-y-1 p-1" aria-busy="true" aria-label="Loading">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex items-center gap-3 px-2 py-2">
          <Skeleton className="aspect-2/3 w-10 rounded-sm" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Message({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 py-10 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}
