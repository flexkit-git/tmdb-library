import { MovieCardSkeleton } from "@/components/movie-grid";
import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors the layout of `MovieView` so the page doesn't jump when it streams in. */
export function MovieSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading movie">
      <div className="container-page pt-10 sm:pt-20">
        <div className="grid gap-8 md:grid-cols-[16rem_minmax(0,1fr)] lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-12">
          <Skeleton className="mx-auto aspect-2/3 w-48 rounded-xl md:w-full" />
          <div>
            <Skeleton className="h-14 w-4/5 sm:h-20" />
            <Skeleton className="mt-5 h-5 w-64" />
            <div className="mt-8 flex gap-3">
              <Skeleton className="h-11 w-36" />
              <Skeleton className="h-11 w-44" />
            </div>
            <div className="mt-10 space-y-3">
              <Skeleton className="h-4 w-full max-w-2xl" />
              <Skeleton className="h-4 w-full max-w-2xl" />
              <Skeleton className="h-4 w-2/3 max-w-xl" />
            </div>
          </div>
        </div>

        <Skeleton className="mt-20 h-10 w-40" />
        <div className="mt-6 flex gap-4 overflow-hidden sm:gap-5">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="w-36 shrink-0 sm:w-44">
              <MovieCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
