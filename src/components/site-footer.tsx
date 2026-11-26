export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/5">
      <div className="container-page flex flex-col gap-3 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-display text-base font-extrabold tracking-[0.14em] text-foreground uppercase">
            Marquee
          </span>
          <span className="mx-2 text-muted-foreground/40">/</span>
          Built with Next.js, tRPC and Tailwind CSS.
        </p>
        {/* Attribution wording required by TMDB's API terms of use. */}
        <p className="max-w-md sm:text-right">
          This product uses the{" "}
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noreferrer"
            className="text-foreground underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-primary"
          >
            TMDB
          </a>{" "}
          API but is not endorsed or certified by TMDB.
        </p>
      </div>
    </footer>
  );
}
