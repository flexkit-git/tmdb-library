# Marquee

A movie discovery homepage built on the [TMDB API](https://developer.themoviedb.org/docs): see what's trending today, open any film for the details, search the catalogue and keep a watchlist.

## What it does

- **Trending today.** A rotating spotlight of the top five, then the full ranked list. Switch to "this week" instantly, and keep loading further pages.
- **Movie pages.** Trailer, cast, crew, certification, runtime, budget and box office, more videos, and recommendations. Every card in the app links to one.
- **Search.** Press <kbd>/</kbd> or <kbd>⌘K</kbd> / <kbd>Ctrl K</kbd> anywhere for a command palette with live results.
- **Watchlist.** Bookmark any movie; it's saved in the browser (no account) and stays in sync across tabs.
- **More to browse.** Now playing, coming soon, top rated, and a page per genre.

## Stack

| | |
| --- | --- |
| Framework | Next.js 16 (App Router, Cache Components), React 19, TypeScript |
| API layer | tRPC 11 with TanStack Query 5 |
| UI | Tailwind CSS 4, shadcn/ui on Radix primitives |
| Validation | Zod 4 |
| Tests | Vitest |

Two parts of Ordinal's stack are deliberately absent. **Prisma** has nothing to persist here: all data is TMDB's, and without accounts the watchlist belongs in the browser. **Inngest** has no background work to run, because cache revalidation already keeps the data fresh. Adding either just to tick the box would have been code with no job. Where they would come in is under [With more time](#with-more-time).

## How it's put together

```
Browser ──────────────► Server Components ─┐
   │  (HTML, prerendered)                  ├─► src/server/tmdb ──► TMDB API
   └─► tRPC  /api/trpc ──► movie router ───┘    (cached queries)
       (search, "show more")
```

**One data layer, two callers.** Every read from TMDB is a function in [src/server/tmdb/queries.ts](src/server/tmdb/queries.ts). Server Components call those functions directly to render pages. The browser reaches the same functions through a small tRPC router ([src/server/api/routers/movie.ts](src/server/api/routers/movie.ts)) for the things that are interactive by nature: search-as-you-type and loading further pages of a list. The API key never leaves the server.

**Pages are prerendered, not rendered per visit.** The query functions are cached with `use cache`, so Next.js builds the home page, every genre page and the day's trending movies as static HTML and refreshes them in the background (hourly for lists, daily for movie details). A movie outside that set is rendered on its first visit and cached from then on; until it is, visitors get an instant skeleton that the content streams into.

**TMDB's responses are validated and reshaped at the boundary.** [src/server/tmdb/schemas.ts](src/server/tmdb/schemas.ts) parses each response with Zod and maps it to the app's own types ([src/types/movie.ts](src/types/movie.ts)). That is where TMDB's quirks are absorbed: empty strings and zeros meaning "unknown", adult titles, duplicate entries across pages, and the occasional malformed item, which is dropped rather than failing the whole list. The client ([src/server/tmdb/client.ts](src/server/tmdb/client.ts)) adds timeouts and a short retry for rate limits and upstream errors.

**Images come straight from TMDB's CDN.** TMDB already serves every image in a fixed set of sizes, so [src/components/tmdb-image.tsx](src/components/tmdb-image.tsx) gives `next/image` a loader that maps each requested width to the nearest TMDB rendition. That keeps responsive `srcset`s and lazy loading without resizing every poster a second time through the Next.js optimizer.

**tRPC responses are cacheable.** Every procedure is a public read, so successful queries are sent with `s-maxage`. Repeat searches and list pages are answered by the CDN instead of the function, which also keeps the app well inside TMDB's rate limits.

**The watchlist is an external store.** [src/lib/watchlist.ts](src/lib/watchlist.ts) wraps `localStorage` in `useSyncExternalStore`, so every bookmark button, the header count and the watchlist page agree with each other, across tabs, with no provider.

**Built to be used without a mouse.** Everything is reachable by keyboard, the spotlight pauses on hover and focus and does not rotate under `prefers-reduced-motion`, and the pages pass an automated axe audit.

## Running it locally

You need Node 22.12 or newer and a free TMDB credential ([create one here](https://www.themoviedb.org/settings/api)).

```bash
cp .env.example .env.local   # then paste your TMDB credential into it
npm install
npm run dev                  # http://localhost:3000
```

Either TMDB credential works: the "API Read Access Token" or the shorter "API Key".

| Command | |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build, and serve it |
| `npm test` | Unit tests |
| `npm run typecheck` / `npm run lint` | Static checks |

## Deploying

The app deploys to Vercel as is. Set `TMDB_ACCESS_TOKEN` in the project's environment variables before the first build: pages are prerendered, so the build itself calls TMDB.

## With more time

- **Accounts.** With sign-in, the watchlist would move to Postgres through Prisma and follow people across devices. That is also where Inngest would earn its place, for example a scheduled job that emails you when something on your watchlist reaches theaters.
- **End-to-end tests in CI.** The unit tests cover the data layer; the flows themselves (search, watchlist, pagination) deserve Playwright coverage.
- **Region and language.** Lists, certifications and release dates are currently fixed to `en-US`.
- **Where to watch** on movie pages, and pages for cast and crew.

---

This product uses the TMDB API but is not endorsed or certified by TMDB.
