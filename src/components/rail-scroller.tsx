"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RailScrollerProps = {
  /** Heading area rendered on the left of the arrow buttons. */
  header: ReactNode;
  /** Names the scrollable list for assistive tech. */
  label: string;
  /**
   * Set when the items contain nothing focusable (no links or buttons). The
   * track itself then takes focus, so keyboard users can still scroll it.
   */
  focusable?: boolean;
  children: ReactNode;
  className?: string;
};

/**
 * A horizontally scrolling row with previous/next buttons. Scrolling itself is
 * native (touch, trackpad, keyboard), so the buttons are a convenience for
 * mouse users and simply hide when there is nowhere left to go.
 */
export function RailScroller({
  header,
  label,
  focusable = false,
  children,
  className,
}: RailScrollerProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ atStart: true, atEnd: false });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const update = () => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      const atStart = track.scrollLeft <= 1;
      const atEnd = track.scrollLeft >= maxScroll - 1;
      setEdges((previous) =>
        previous.atStart === atStart && previous.atEnd === atEnd
          ? previous
          : { atStart, atEnd },
      );
    };

    update();
    track.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(track);

    return () => {
      track.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  function scrollByPage(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.85 });
  }

  const canScroll = !(edges.atStart && edges.atEnd);

  return (
    <div className={className}>
      <div className="container-page flex items-end justify-between gap-4">
        {header}
        <div className={cn("hidden gap-2 sm:flex", !canScroll && "sm:hidden")}>
          <Button
            variant="outline"
            size="icon-lg"
            className="rounded-full"
            aria-label={`Scroll ${label} back`}
            disabled={edges.atStart}
            onClick={() => scrollByPage(-1)}
          >
            <ChevronLeftIcon aria-hidden />
          </Button>
          <Button
            variant="outline"
            size="icon-lg"
            className="rounded-full"
            aria-label={`Scroll ${label} forward`}
            disabled={edges.atEnd}
            onClick={() => scrollByPage(1)}
          >
            <ChevronRightIcon aria-hidden />
          </Button>
        </div>
      </div>

      {/*
        Full-bleed, so cards slide under the viewport edge instead of clipping
        at the container. `relative` makes the track the containing block for
        absolutely positioned descendants (e.g. `sr-only` text); without it
        they escape the scroller's clipping and widen the whole page.
      */}
      <ul
        ref={trackRef}
        aria-label={label}
        tabIndex={focusable ? 0 : undefined}
        className="scrollbar-none rail-inset relative mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pt-1 pb-2 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset motion-reduce:scroll-auto sm:gap-5"
      >
        {children}
      </ul>
    </div>
  );
}
