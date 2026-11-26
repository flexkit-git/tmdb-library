import { describe, expect, it } from "vitest";

import { tmdbImageUrl } from "./tmdb-image";

const BASE = "https://image.tmdb.org/t/p";

describe("tmdbImageUrl", () => {
  it("picks the smallest rendition that covers the requested width", () => {
    expect(tmdbImageUrl("poster", "/a.jpg", 300)).toBe(`${BASE}/w342/a.jpg`);
    expect(tmdbImageUrl("poster", "/a.jpg", 342)).toBe(`${BASE}/w342/a.jpg`);
    expect(tmdbImageUrl("poster", "/a.jpg", 343)).toBe(`${BASE}/w500/a.jpg`);
  });

  it("uses each image kind's own size list", () => {
    expect(tmdbImageUrl("backdrop", "/a.jpg", 342)).toBe(`${BASE}/w780/a.jpg`);
    expect(tmdbImageUrl("profile", "/a.jpg", 92)).toBe(`${BASE}/w185/a.jpg`);
  });

  it("never falls through to the multi-megabyte originals", () => {
    expect(tmdbImageUrl("backdrop", "/a.jpg", 3840)).toBe(
      `${BASE}/w1280/a.jpg`,
    );
    expect(tmdbImageUrl("poster", "/a.jpg", 3840)).toBe(`${BASE}/w780/a.jpg`);
    expect(tmdbImageUrl("profile", "/a.jpg", 640)).toBe(`${BASE}/h632/a.jpg`);
  });
});
