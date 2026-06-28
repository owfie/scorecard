"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { CRITERIA, type CriterionKey, type Site } from "@/lib/defaults";
import { accounting } from "@/lib/format";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

type SortKey = "weighted" | "name" | "rent" | CriterionKey;

function CellNumber({
  value,
  onCommit,
  min,
  max,
  step = 1,
  className,
  prefix,
}: {
  value: number;
  onCommit: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  prefix?: string;
}) {
  const [draft, setDraft] = React.useState<string | null>(null);
  const shown = draft ?? String(value);
  return (
    <div className="relative">
      {prefix && (
        <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-xs text-muted-foreground">
          {prefix}
        </span>
      )}
      <Input
        type="number"
        inputMode="decimal"
        value={shown}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          setDraft(e.target.value);
          const n = Number(e.target.value);
          if (e.target.value !== "" && !Number.isNaN(n)) onCommit(n);
        }}
        onBlur={() => setDraft(null)}
        className={cn("nums h-8 px-2 text-center", prefix && "pl-5", className)}
      />
    </div>
  );
}

interface LocationTabProps {
  weights: Record<CriterionKey, number>;
  sites: Site[];
  onWeight: (key: CriterionKey, value: number) => void;
  onSiteScore: (index: number, key: CriterionKey, value: number) => void;
  onSiteField: (
    index: number,
    field: "name" | "rentPerM2",
    value: string | number,
  ) => void;
  onAddSite: () => void;
  onRemoveSite: (index: number) => void;
}

export function LocationTab({
  weights,
  sites,
  onWeight,
  onSiteScore,
  onSiteField,
  onAddSite,
  onRemoveSite,
}: LocationTabProps) {
  const [sort, setSort] = React.useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "weighted",
    dir: "desc",
  });

  const totalWeight = React.useMemo(
    () => Object.values(weights).reduce((a, b) => a + b, 0) || 1,
    [weights],
  );

  const scoreOf = React.useCallback(
    (site: Site) =>
      CRITERIA.reduce(
        (sum, c) => sum + site.scores[c.key] * (weights[c.key] / totalWeight),
        0,
      ),
    [weights, totalWeight],
  );

  // Rank is always by weighted score, independent of the active sort.
  const rankByIndex = React.useMemo(() => {
    const order = sites
      .map((site, index) => ({ index, score: scoreOf(site) }))
      .sort((a, b) => b.score - a.score);
    const map = new Map<number, number>();
    order.forEach((o, i) => map.set(o.index, i + 1));
    return map;
  }, [sites, scoreOf]);

  const rows = React.useMemo(() => {
    const withMeta = sites.map((site, index) => ({
      site,
      index,
      weighted: scoreOf(site),
    }));
    const dir = sort.dir === "asc" ? 1 : -1;
    return withMeta.sort((a, b) => {
      let av: number | string;
      let bv: number | string;
      if (sort.key === "weighted") {
        av = a.weighted;
        bv = b.weighted;
      } else if (sort.key === "name") {
        av = a.site.name.toLowerCase();
        bv = b.site.name.toLowerCase();
      } else if (sort.key === "rent") {
        av = a.site.rentPerM2;
        bv = b.site.rentPerM2;
      } else {
        av = a.site.scores[sort.key];
        bv = b.site.scores[sort.key];
      }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }, [sites, sort, scoreOf]);

  function toggleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "name" ? "asc" : "desc" },
    );
  }

  // Plain factory (not a nested component) so sort state stays stable.
  const sortHeader = (
    label: string,
    sortKey: SortKey,
    className?: string,
    title?: string,
  ) => {
    const active = sort.key === sortKey;
    return (
      <TableHead className={cn("h-9", className)}>
        <button
          type="button"
          onClick={() => toggleSort(sortKey)}
          title={title}
          className={cn(
            "inline-flex items-center gap-1 text-xs font-medium tracking-wide transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none",
            active ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {label}
          {active &&
            (sort.dir === "asc" ? (
              <ArrowUp className="size-3" />
            ) : (
              <ArrowDown className="size-3" />
            ))}
        </button>
      </TableHead>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* ── Weights sidebar ──────────────────────────────────── */}
      <div className="lg:col-span-3">
        <Card className="lg:sticky lg:top-6">
          <CardHeader>
            <CardTitle>Criteria weights</CardTitle>
            <CardDescription>
              Auto-normalised to 100%. Tune what matters to you.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {CRITERIA.map((c) => {
              const pct = (weights[c.key] / totalWeight) * 100;
              return (
                <div key={c.key} className="grid gap-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <Label className="text-xs leading-tight text-muted-foreground">
                      {c.label}
                    </Label>
                    <span className="nums text-xs font-semibold tabular-nums">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <Slider
                    value={[weights[c.key]]}
                    min={0}
                    max={40}
                    step={1}
                    onValueChange={(v) =>
                      // base-ui hands pointer interactions a bare number for a
                      // single-thumb slider, but an array via keyboard — accept both.
                      onWeight(c.key, typeof v === "number" ? v : (v[0] ?? 0))
                    }
                    aria-label={`Weight: ${c.label}`}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* ── Sites table ──────────────────────────────────────── */}
      <div className="lg:col-span-9">
        <Card>
          <CardHeader>
            <CardTitle>Location scorecard</CardTitle>
            <CardDescription>
              Scores (0–10) are placeholder estimates — overwrite each cell with
              your own research. Click a column header to sort.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="overflow-x-auto">
              <Table className="min-w-[920px] text-sm">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    {sortHeader("#", "weighted", "w-10")}
                    {sortHeader("Site", "name", "min-w-44")}
                    {sortHeader("Rent $/m²", "rent", "text-right")}
                    {CRITERIA.map((c) => (
                      <React.Fragment key={c.key}>
                        {sortHeader(
                          c.key.replace(/([A-Z])/g, " $1"),
                          c.key,
                          "text-center",
                          c.label,
                        )}
                      </React.Fragment>
                    ))}
                    {sortHeader("Score", "weighted", "text-right")}
                    <TableHead className="h-9 w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(({ site, index, weighted }) => {
                    const rank = rankByIndex.get(index) ?? 0;
                    return (
                      <TableRow key={index} className="hover:bg-muted/40">
                        <TableCell>
                          <Badge
                            variant={rank === 1 ? "default" : "secondary"}
                            className="nums size-6 justify-center rounded-full p-0 tabular-nums"
                          >
                            {rank}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={site.name}
                            onChange={(e) =>
                              onSiteField(index, "name", e.target.value)
                            }
                            className="h-8 min-w-40 font-medium"
                            aria-label="Site name"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <CellNumber
                            value={site.rentPerM2}
                            min={0}
                            step={10}
                            prefix="$"
                            className="w-24 text-right"
                            onCommit={(v) => onSiteField(index, "rentPerM2", v)}
                          />
                          <div className="nums mt-0.5 text-sm text-muted-foreground">
                            {site.rentPerM2 === 0
                              ? "rent-free"
                              : accounting(site.rentPerM2)}
                          </div>
                        </TableCell>
                        {CRITERIA.map((c) => (
                          <TableCell key={c.key} className="text-center">
                            <CellNumber
                              value={site.scores[c.key]}
                              min={0}
                              max={10}
                              className="mx-auto w-12"
                              onCommit={(v) => onSiteScore(index, c.key, v)}
                            />
                          </TableCell>
                        ))}
                        <TableCell className="text-right">
                          <span className="nums font-display text-lg font-semibold tabular-nums">
                            {weighted.toFixed(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            /10
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onRemoveSite(index)}
                            disabled={sites.length <= 1}
                            aria-label={`Remove ${site.name}`}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div>
              <Button variant="outline" size="sm" onClick={onAddSite}>
                <Plus className="size-4" />
                Add site
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
