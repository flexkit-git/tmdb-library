import { z } from "zod";

/**
 * A paginated list of movies the browser can keep loading from. Pages render
 * the first page on the server and hand the matching `Feed` to
 * `<LoadMoreMovies>` so the client can fetch the rest over tRPC.
 */
export const feedSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("trending"), window: z.enum(["day", "week"]) }),
  z.object({ kind: z.literal("genre"), genreId: z.number().int().positive() }),
]);

export type Feed = z.infer<typeof feedSchema>;
