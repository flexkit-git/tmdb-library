const LOCALE = "en-US";

const mediumDate = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: "medium",
  timeZone: "UTC",
});

const shortDate = new Intl.DateTimeFormat(LOCALE, {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const compactNumber = new Intl.NumberFormat(LOCALE, {
  notation: "compact",
  maximumFractionDigits: 1,
});

const compactCurrency = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const languageNames = new Intl.DisplayNames(LOCALE, { type: "language" });

/** Release dates are plain calendar days, so pin them to UTC to avoid drift. */
const parseIsoDate = (isoDate: string) => new Date(`${isoDate}T00:00:00Z`);

export function formatYear(isoDate: string | null) {
  return isoDate ? isoDate.slice(0, 4) : null;
}

/** "Jul 16, 2010" */
export function formatDate(isoDate: string) {
  return mediumDate.format(parseIsoDate(isoDate));
}

/** "Jul 16" */
export function formatShortDate(isoDate: string) {
  return shortDate.format(parseIsoDate(isoDate));
}

/** 148 → "2h 28m" */
export function formatRuntime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}m`;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

/** 8.367 → "8.4" */
export function formatRating(rating: number) {
  return rating.toFixed(1);
}

/** 34512 → "34.5K" */
export function formatCount(value: number) {
  return compactNumber.format(value);
}

/** 160000000 → "$160M" */
export function formatMoney(dollars: number) {
  return compactCurrency.format(dollars);
}

/** "ja" → "Japanese" */
export function formatLanguage(code: string) {
  try {
    return languageNames.of(code) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}
