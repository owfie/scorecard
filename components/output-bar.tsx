"use client";

import type { Results } from "@/lib/model";
import { accounting, currency, months, num, percent } from "@/lib/format";
import { cn } from "@/lib/utils";

function Stat({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "neutral" | "positive" | "negative";
}) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3.5 sm:px-5">
      <span className="text-label font-medium tracking-wide text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "nums font-display text-2xl leading-none font-semibold tabular-nums",
          tone === "positive" && "text-positive",
          tone === "negative" && "text-negative",
        )}
      >
        {value}
      </span>
      {sub && (
        <span className="nums text-label text-muted-foreground">{sub}</span>
      )}
    </div>
  );
}

export function OutputBar({
  results,
  renewMode,
  plannedCoffees,
}: {
  results: Results;
  renewMode: boolean;
  plannedCoffees: number;
}) {
  const profitTone = results.netProfit >= 0 ? "positive" : "negative";
  const beHeadroom = plannedCoffees - results.beCoffees;

  return (
    <div className="grid grid-cols-2 divide-x divide-y divide-border overflow-hidden rounded-xl border bg-card/70 shadow-sm backdrop-blur-sm sm:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
      <Stat
        label="Revenue / yr"
        value={currency(results.revenue)}
        sub={`${num(results.opDays)} trading days`}
      />
      <Stat
        label="Operating profit"
        value={accounting(results.netProfit)}
        sub="pre-tax, pre-deprec."
        tone={profitTone}
      />
      <Stat
        label="Return on capital"
        value={percent(results.roi, 0)}
        sub={`on ${currency(results.capex)}`}
        tone={profitTone}
      />
      <Stat
        label="Payback"
        value={months(results.paybackMonths)}
        sub={Number.isFinite(results.paybackMonths) ? "to recover capex" : "never recovers"}
        tone={Number.isFinite(results.paybackMonths) ? "neutral" : "negative"}
      />
      <Stat
        label="Break-even"
        value={`${num(Math.ceil(results.beCoffees))}/day`}
        sub={
          beHeadroom >= 0
            ? `${num(Math.floor(beHeadroom))} headroom`
            : `${num(Math.abs(Math.ceil(beHeadroom)))} short`
        }
        tone={beHeadroom >= 0 ? "positive" : "negative"}
      />
      <Stat
        label="Rent / month"
        value={renewMode ? "rent-free" : currency(results.rent / 12)}
        sub={renewMode ? "Renew scenario" : `${num(results.area)} m² @ base rate`}
        tone={renewMode ? "positive" : "neutral"}
      />
    </div>
  );
}
