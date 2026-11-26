import Link from "next/link";

import { SearchPalette } from "@/components/search-palette";
import { WatchlistLink } from "@/components/watchlist-link";

const NAV_LINKS = [
  { href: "/#trending", label: "Trending" },
  { href: "/#now-playing", label: "In theaters" },
  { href: "/#coming-soon", label: "Coming soon" },
  { href: "/#top-rated", label: "Top rated" },
  { href: "/#genres", label: "Genres" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 h-(--header-height) border-b border-white/5 bg-background/65 backdrop-blur-xl">
      <div className="container-page flex h-full items-center gap-4 sm:gap-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        >
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-md bg-primary font-display text-2xl leading-none font-black text-primary-foreground"
          >
            M
          </span>
          <span className="font-display text-2xl leading-none font-extrabold tracking-[0.14em] uppercase">
            Marquee
          </span>
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-md px-3 py-2 text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <SearchPalette />
          <WatchlistLink />
        </div>
      </div>
    </header>
  );
}
