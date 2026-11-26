"use client";

import { useSyncExternalStore } from "react";

import type { WatchlistItem } from "@/lib/watchlist-item";

/**
 * The watchlist lives in localStorage: there are no accounts, so there is
 * nothing to key server-side storage on. It is exposed as an external store so
 * every button, badge and page showing watchlist state stays in sync, including
 * across browser tabs.
 */

const STORAGE_KEY = "marquee:watchlist";
const EMPTY: WatchlistItem[] = [];

let cache: WatchlistItem[] | undefined;
const listeners = new Set<() => void>();

function isWatchlistItem(value: unknown): value is WatchlistItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === "number" && typeof item.title === "string";
}

function readStorage(): WatchlistItem[] {
  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? "[]",
    );
    return Array.isArray(parsed) ? parsed.filter(isWatchlistItem) : EMPTY;
  } catch {
    // Storage can be unavailable (private mode) or hold something we didn't write.
    return EMPTY;
  }
}

function getSnapshot() {
  cache ??= readStorage();
  return cache;
}

function getServerSnapshot() {
  return EMPTY;
}

function commit(next: WatchlistItem[]) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Keep the in-memory list so the session still works without storage.
  }
  for (const listener of listeners) listener();
}

function handleStorageEvent(event: StorageEvent) {
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  cache = readStorage();
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) {
    window.addEventListener("storage", handleStorageEvent);
  }
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("storage", handleStorageEvent);
    }
  };
}

export const watchlist = {
  add(item: WatchlistItem) {
    const current = getSnapshot();
    if (current.some((entry) => entry.id === item.id)) return;
    commit([item, ...current]);
  },
  remove(id: number) {
    commit(getSnapshot().filter((entry) => entry.id !== id));
  },
};

/** The saved movies, most recently added first. Empty during server rendering. */
export function useWatchlist() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useIsInWatchlist(id: number) {
  return useSyncExternalStore(
    subscribe,
    () => getSnapshot().some((entry) => entry.id === id),
    () => false,
  );
}

const subscribeToNothing = () => () => {};

/**
 * False on the server and during hydration, true afterwards. Lets UI that
 * depends on localStorage show a placeholder instead of flashing "empty".
 */
export function useHasHydrated() {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}
