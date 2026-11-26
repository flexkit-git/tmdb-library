"use client";

import { XIcon } from "lucide-react";
import { type ReactNode, useLayoutEffect, useState } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Video } from "@/types/movie";

type VideoDialogProps = {
  video: Video;
  movieTitle: string;
  /** The element that opens the player; must be a single button-like element. */
  children: ReactNode;
};

/**
 * Plays a YouTube video in a modal. The iframe only exists while the dialog is
 * open, so nothing is loaded from YouTube until someone asks for it and
 * closing the dialog stops playback.
 */
export function VideoDialog({ video, movieTitle, children }: VideoDialogProps) {
  const [open, setOpen] = useState(false);

  // When you navigate away (say, with the back button while a trailer plays),
  // Next.js keeps this page mounted but hidden so it can be restored later. A
  // player left open would keep playing out of sight, so close it as the page
  // is hidden, which is when this cleanup runs.
  useLayoutEffect(() => () => setOpen(false), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      {/*
        Rendered conditionally rather than left to Radix's exit animation:
        that animation is driven by effects, and effects don't run while a
        page is hidden, so the iframe would otherwise outlive the close above.
      */}
      {open && (
        <DialogContent
          showCloseButton={false}
          className="gap-0 bg-transparent p-0 ring-0 sm:max-w-5xl"
        >
          <DialogTitle className="sr-only">
            {movieTitle}: {video.name}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {video.type} video player
          </DialogDescription>

          <DialogClose
            aria-label="Close video"
            className="absolute -top-11 right-0 flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition outline-none hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <XIcon aria-hidden className="size-4" />
          </DialogClose>

          <div className="aspect-video overflow-hidden rounded-xl bg-black ring-1 ring-white/10">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.key)}?autoplay=1&rel=0`}
              title={`${movieTitle}: ${video.name}`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              className="size-full"
            />
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
