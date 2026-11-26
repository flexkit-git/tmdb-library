import { describe, expect, it } from "vitest";

import {
  formatCount,
  formatDate,
  formatLanguage,
  formatMoney,
  formatRating,
  formatRuntime,
  formatShortDate,
  formatYear,
} from "./format";

describe("formatRuntime", () => {
  it.each([
    [148, "2h 28m"],
    [120, "2h"],
    [45, "45m"],
  ])("formats %i minutes as %s", (minutes, expected) => {
    expect(formatRuntime(minutes)).toBe(expected);
  });
});

describe("dates", () => {
  it("keeps release dates on their calendar day regardless of time zone", () => {
    // Parsing "2010-01-01" as local time would show Dec 31 west of UTC.
    expect(formatDate("2010-01-01")).toBe("Jan 1, 2010");
    expect(formatShortDate("2010-01-01")).toBe("Jan 1");
  });

  it("extracts the year, or nothing when there is no date", () => {
    expect(formatYear("2010-07-16")).toBe("2010");
    expect(formatYear(null)).toBeNull();
  });
});

describe("numbers", () => {
  it("rounds ratings to one decimal", () => {
    expect(formatRating(8.367)).toBe("8.4");
    expect(formatRating(7)).toBe("7.0");
  });

  it("abbreviates large counts and amounts", () => {
    expect(formatCount(34_512)).toBe("34.5K");
    expect(formatMoney(160_000_000)).toBe("$160M");
    expect(formatMoney(2_923_706_026)).toBe("$2.9B");
  });
});

describe("formatLanguage", () => {
  it("turns ISO codes into names", () => {
    expect(formatLanguage("ja")).toBe("Japanese");
  });

  it("falls back to the code for values Intl rejects", () => {
    expect(formatLanguage("not a code")).toBe("NOT A CODE");
  });
});
