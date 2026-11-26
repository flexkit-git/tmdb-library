const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

/**
 * The widths TMDB's image CDN serves for each kind of image
 * (see https://developer.themoviedb.org/docs/image-basics).
 *
 * Backdrops stop at 1280px on purpose: the next step up is `original`, which
 * can be a multi-megabyte 4K file.
 */
const WIDTHS = {
  poster: [92, 154, 185, 342, 500, 780],
  backdrop: [300, 780, 1280],
  profile: [45, 185],
} as const;

/** What to request when the layout wants more than the largest listed width. */
const LARGEST = {
  poster: "w780",
  backdrop: "w1280",
  profile: "h632",
} as const;

export type TmdbImageKind = keyof typeof WIDTHS;

/** URL for the smallest rendition of `path` that is at least `width` px wide. */
export function tmdbImageUrl(
  kind: TmdbImageKind,
  path: string,
  width: number,
) {
  const match = WIDTHS[kind].find((candidate) => candidate >= width);
  const size = match ? `w${match}` : LARGEST[kind];
  return `${IMAGE_BASE_URL}/${size}${path}`;
}
