import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Every poster and backdrop comes straight from TMDB's CDN through a custom
    // loader (see src/components/tmdb-image.tsx), so the widths `next/image`
    // offers in a srcset are the widths TMDB serves. The browser then lands on
    // a real rendition instead of overshooting to the next one up.
    imageSizes: [92, 154, 185, 342, 500],
    deviceSizes: [780, 1280],
    // YouTube video thumbnails on the movie page.
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
