"use client";

import Image, { type ImageLoader, type ImageProps } from "next/image";

import { type TmdbImageKind, tmdbImageUrl } from "@/lib/tmdb-image";

/**
 * TMDB already serves every image pre-resized from its own CDN, so instead of
 * proxying them through the Next.js image optimizer we map each width that
 * `next/image` asks for onto the closest size TMDB offers. We keep responsive
 * `srcset`s, lazy loading and layout stability without paying for a second
 * round of resizing.
 *
 * (Loaders are functions, which is why this is a Client Component.)
 */
const loaders: Record<TmdbImageKind, ImageLoader> = {
  poster: ({ src, width }) => tmdbImageUrl("poster", src, width),
  backdrop: ({ src, width }) => tmdbImageUrl("backdrop", src, width),
  profile: ({ src, width }) => tmdbImageUrl("profile", src, width),
};

type TmdbImageProps = Omit<ImageProps, "src" | "loader"> & {
  kind: TmdbImageKind;
  /** The file path TMDB returns, e.g. `/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg`. */
  path: string;
};

export function TmdbImage({ kind, path, alt, ...props }: TmdbImageProps) {
  return <Image loader={loaders[kind]} src={path} alt={alt} {...props} />;
}
