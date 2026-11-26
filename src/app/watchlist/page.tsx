import type { Metadata } from "next";

import { Eyebrow } from "@/components/section-heading";

import { WatchlistView } from "./watchlist-view";

export const metadata: Metadata = {
  title: "Your watchlist",
  description: "Movies you've saved to watch later.",
};

export default function WatchlistPage() {
  return (
    <div className="container-page pt-10 sm:pt-16">
      <Eyebrow>Saved for later</Eyebrow>
      <h1 className="mt-3 font-display text-6xl leading-[0.9] font-black tracking-tight uppercase sm:text-7xl">
        Your watchlist
      </h1>
      <WatchlistView />
    </div>
  );
}
