// Accounting + number/percent formatters. AUD throughout.

const aud0 = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

const plain0 = new Intl.NumberFormat("en-AU", { maximumFractionDigits: 0 });

/**
 * Accounting format: positive `$1,234`, negatives in parentheses with no
 * minus sign `($1,234)`, zero `$0`. Non-finite values render as an em dash.
 */
export function accounting(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const r = Math.round(n);
  if (r === 0) return "$0";
  if (r < 0) return `(${aud0.format(Math.abs(r))})`;
  return aud0.format(r);
}

/** Plain currency with a leading sign for negatives — used in stat tiles. */
export function currency(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return aud0.format(Math.round(n));
}

/** Whole-number with thousands separators. */
export function num(n: number, dp = 0): string {
  if (!Number.isFinite(n)) return "—";
  if (dp === 0) return plain0.format(Math.round(n));
  return n.toLocaleString("en-AU", {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });
}

/** Whole-number percent, e.g. `42%`. Input is already a percentage value. */
export function percent(n: number, dp = 0): string {
  if (!Number.isFinite(n)) return "—";
  return `${n.toFixed(dp)}%`;
}

/** Payback in months — `—` when the venture never pays back. */
export function months(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n >= 24) return `${(n / 12).toFixed(1)} yrs`;
  return `${Math.round(n)} mo`;
}
