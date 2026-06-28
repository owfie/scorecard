"use client";

import * as React from "react";
import { compute, type Inputs } from "@/lib/model";
import { num, percent } from "@/lib/format";
import { NumberField } from "@/components/number-field";
import { OutputBar } from "@/components/output-bar";
import { PnlTable, CapexTable } from "@/components/pnl-table";
import { BreakEvenChart } from "@/components/break-even-chart";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Numeric-only keys of Inputs — keeps the field helper type-safe.
type NumKey = {
  [K in keyof Inputs]: Inputs[K] extends number ? K : never;
}[keyof Inputs];

interface FieldOpts {
  unit?: string;
  prefix?: string;
  step?: number;
  min?: number;
  max?: number;
  tooltip?: string;
  disabled?: boolean;
}

interface EconomicsTabProps {
  inputs: Inputs;
  onInput: <K extends keyof Inputs>(key: K, value: Inputs[K]) => void;
}

export function EconomicsTab({ inputs, onInput }: EconomicsTabProps) {
  const results = React.useMemo(() => compute(inputs), [inputs]);

  // A plain factory — returns a stable <NumberField/> element (not a freshly
  // declared component), so inputs keep focus across re-renders.
  const field = (k: NumKey, label: string, opts: FieldOpts = {}) => (
    <NumberField
      id={k}
      label={label}
      value={inputs[k]}
      onChange={(v) => onInput(k, v)}
      {...opts}
    />
  );

  return (
    <div className="flex flex-col gap-6">
      <OutputBar
        results={results}
        renewMode={inputs.renewMode}
        plannedCoffees={inputs.coffeesPerDay}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ── Inputs ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          <Card>
            <CardHeader>
              <CardTitle>Daytime trade &amp; pricing</CardTitle>
              <CardDescription>The bread-and-butter coffee &amp; food counter.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
              {field("coffeesPerDay", "Coffees / day", { tooltip: "Average cups sold per trading day." })}
              {field("coffeePrice", "Coffee price", { prefix: "$", step: 0.1, min: 0 })}
              {field("foodAttach", "Food attach", { unit: "%", min: 0, max: 100, tooltip: "Share of coffees that also buy food." })}
              {field("foodPrice", "Food price", { prefix: "$", step: 0.5, min: 0 })}
              {field("daysPerWeek", "Days / week", { step: 1, min: 1, max: 7 })}
              {field("weeksPerYear", "Weeks / year", { step: 1, min: 1, max: 52 })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cost of goods</CardTitle>
              <CardDescription>
                {inputs.cogsMode === "perUnit"
                  ? "Built up from per-unit ingredient & packaging costs."
                  : "Entered directly as a % of the menu price."}
              </CardDescription>
              <CardAction>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-xs",
                      inputs.cogsMode === "percent"
                        ? "font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    % of price
                  </span>
                  <Switch
                    checked={inputs.cogsMode === "perUnit"}
                    onCheckedChange={(c) =>
                      onInput("cogsMode", c ? "perUnit" : "percent")
                    }
                    aria-label="Estimate COGS from per-unit costs"
                  />
                  <span
                    className={cn(
                      "text-xs",
                      inputs.cogsMode === "perUnit"
                        ? "font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    $ / unit
                  </span>
                </div>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {inputs.cogsMode === "percent" ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  {field("coffeeCogs", "Coffee COGS", { unit: "%", min: 0, max: 100, tooltip: "Cost of milk, beans, cup as a % of price." })}
                  {field("foodCogs", "Food COGS", { unit: "%", min: 0, max: 100, tooltip: "Food ingredients & packaging as a % of price." })}
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        Per coffee
                      </span>
                      <span className="nums text-xs text-muted-foreground">
                        ${results.coffeeUnitCost.toFixed(2)} / cup ·{" "}
                        <strong className="text-foreground">
                          {percent(results.coffeeCogsPct, 0)}
                        </strong>{" "}
                        of price
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
                      {field("coffeeMilkCost", "Milk", { prefix: "$", step: 0.05, min: 0 })}
                      {field("coffeeBeanCost", "Beans", { prefix: "$", step: 0.05, min: 0 })}
                      {field("coffeeCupCost", "Cup & lid", { prefix: "$", step: 0.05, min: 0 })}
                      {field("coffeeSundryCost", "Sundries", { prefix: "$", step: 0.05, min: 0, tooltip: "Sugar, napkins, stirrer etc." })}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex flex-col gap-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        Per food item
                      </span>
                      <span className="nums text-xs text-muted-foreground">
                        ${results.foodUnitCost.toFixed(2)} / item ·{" "}
                        <strong className="text-foreground">
                          {percent(results.foodCogsPct, 0)}
                        </strong>{" "}
                        of price
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                      {field("foodIngredientCost", "Ingredients", { prefix: "$", step: 0.1, min: 0 })}
                      {field("foodPackagingCost", "Packaging", { prefix: "$", step: 0.05, min: 0 })}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evening service</CardTitle>
              <CardDescription>An optional dinner / wine-bar pivot.</CardDescription>
              <CardAction>
                <Switch
                  checked={inputs.eveningOn}
                  onCheckedChange={(c) => onInput("eveningOn", c)}
                  aria-label="Toggle evening service"
                />
              </CardAction>
            </CardHeader>
            <CardContent
              className={cn(
                "grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4 transition-opacity",
                !inputs.eveningOn && "pointer-events-none opacity-45",
              )}
            >
              {field("eveningNights", "Nights / week", { step: 1, min: 0, max: 7, disabled: !inputs.eveningOn })}
              {field("eveningCovers", "Covers / night", { min: 0, disabled: !inputs.eveningOn })}
              {field("eveningSpend", "Spend / cover", { prefix: "$", step: 1, min: 0, disabled: !inputs.eveningOn })}
              {field("eveningCogs", "Evening COGS", { unit: "%", min: 0, max: 100, disabled: !inputs.eveningOn })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Co-working memberships</CardTitle>
              <CardDescription>Recurring desk revenue against floor area.</CardDescription>
              <CardAction>
                <Switch
                  checked={inputs.coworkOn}
                  onCheckedChange={(c) => onInput("coworkOn", c)}
                  aria-label="Toggle co-working"
                />
              </CardAction>
            </CardHeader>
            <CardContent
              className={cn(
                "grid grid-cols-2 gap-x-4 gap-y-4 transition-opacity",
                !inputs.coworkOn && "pointer-events-none opacity-45",
              )}
            >
              {field("coworkMembers", "Members", { min: 0, disabled: !inputs.coworkOn })}
              {field("coworkPrice", "Price / member / mo", { prefix: "$", step: 5, min: 0, disabled: !inputs.coworkOn })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Labour</CardTitle>
              <CardDescription>Wages are usually the largest single line.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
              {field("staffHoursPerWeek", "Staff hours / week", { min: 0, tooltip: "Total rostered hours across all staff." })}
              {field("blendedRate", "Blended rate", { prefix: "$", unit: "/hr", min: 0, tooltip: "Average hourly cost incl. on-costs." })}
              {field("ownerWagesAnnual", "Owner wages / yr", { prefix: "$", step: 1000, min: 0 })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rent &amp; space</CardTitle>
              <CardDescription>Floor area is modelled from peak-hour seating, then priced.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
                {field("ratePerM2", "Rent rate", { prefix: "$", unit: "/m²", min: 0, disabled: inputs.renewMode })}
                {field("outgoingsPerM2", "Outgoings", { prefix: "$", unit: "/m²", min: 0, tooltip: "Council rates, water, body corp per m²." })}
                {field("merchantPct", "Merchant fees", { unit: "%", step: 0.1, min: 0, tooltip: "Card processing as a % of revenue." })}
              </div>

              <Separator />

              <div className="flex items-center justify-between gap-3">
                <div className="grid gap-0.5">
                  <Label className="text-sm">Override modelled floor area</Label>
                  <span className="text-xs text-muted-foreground">
                    Off = sized from seating demand below.
                  </span>
                </div>
                <Switch
                  checked={inputs.areaMode === "manual"}
                  onCheckedChange={(c) => onInput("areaMode", c ? "manual" : "modelled")}
                  aria-label="Override modelled floor area"
                />
              </div>

              {inputs.areaMode === "manual" ? (
                field("manualArea", "Manual floor area", { unit: "m²", min: 0 })
              ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
                  {field("dineInPct", "Dine-in", { unit: "%", min: 0, max: 100, tooltip: "Share of daytime covers that sit in." })}
                  {field("busiestHourShare", "Peak-hour share", { unit: "%", min: 0, max: 100, tooltip: "Share of dine-in covers in the busiest hour." })}
                  {field("seatTurns", "Seat turns / hr", { step: 0.1, min: 0.1 })}
                  {field("seatArea", "Area / seat", { unit: "m²", step: 0.1, min: 0 })}
                  {field("counterArea", "Counter area", { unit: "m²", step: 0.5, min: 0 })}
                  {field("bohPct", "Back-of-house", { unit: "%", min: 0, max: 100, tooltip: "Kitchen / storage as a % of front area." })}
                  {field("deskArea", "Area / desk", { unit: "m²", step: 0.1, min: 0, tooltip: "Used only when co-working is on." })}
                  {field("outdoorSeats", "Outdoor seats", { min: 0, tooltip: "Footpath dining capacity (planning input)." })}
                </div>
              )}

              <div className="nums flex flex-wrap gap-x-6 gap-y-1 rounded-lg bg-muted/60 px-3 py-2.5 text-xs text-muted-foreground">
                <span>
                  Modelled: <strong className="text-foreground">{num(results.modelledArea)} m²</strong>
                </span>
                <span>
                  Seats: <strong className="text-foreground">{num(results.seats)}</strong>
                </span>
                <span>
                  Charged on: <strong className="text-foreground">{num(results.area)} m²</strong>
                </span>
              </div>

              {/* Demoted, deliberately muted speculative scenario. */}
              <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-border/70 bg-muted/30 px-3 py-2.5">
                <div className="grid gap-0.5">
                  <Label className="text-[0.8rem] text-muted-foreground">
                    Scenario: Renew Adelaide rent-free (speculative)
                  </Label>
                  <span className="text-xs text-muted-foreground/80">
                    Zeroes rent only. Outgoings still apply.
                  </span>
                </div>
                <Switch
                  size="sm"
                  checked={inputs.renewMode}
                  onCheckedChange={(c) => onInput("renewMode", c)}
                  aria-label="Renew rent-free scenario"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fixed costs</CardTitle>
              <CardDescription>Entered monthly; the model annualises (×12).</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
              {field("utilities", "Utilities", { prefix: "$", unit: "/mo", min: 0 })}
              {field("insurance", "Insurance", { prefix: "$", unit: "/mo", min: 0 })}
              {field("equipLease", "Equip. lease", { prefix: "$", unit: "/mo", min: 0 })}
              {field("softwarePos", "Software / POS", { prefix: "$", unit: "/mo", min: 0 })}
              {field("marketing", "Marketing", { prefix: "$", unit: "/mo", min: 0 })}
              {field("accounting", "Accounting", { prefix: "$", unit: "/mo", min: 0 })}
              {field("repairsSundries", "Repairs / sundries", { prefix: "$", unit: "/mo", min: 0 })}
              {field("financeMonthly", "Finance / loan", { prefix: "$", unit: "/mo", min: 0 })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Capital required</CardTitle>
              <CardDescription>One-off spend to open the doors.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
              {field("fitout", "Fit-out", { prefix: "$", step: 1000, min: 0 })}
              {field("equipment", "Equipment", { prefix: "$", step: 1000, min: 0 })}
              {field("coffeeMachine", "Coffee machine", { prefix: "$", step: 500, min: 0 })}
              {field("bondDeposit", "Bond / deposit", { prefix: "$", step: 1000, min: 0 })}
              {field("licensingLegal", "Licensing & legal", { prefix: "$", step: 500, min: 0 })}
              {field("initialStock", "Initial stock", { prefix: "$", step: 500, min: 0 })}
              {field("contingency", "Contingency", { unit: "%", min: 0, tooltip: "Buffer applied across all capital lines." })}
            </CardContent>
          </Card>
        </div>

        {/* ── Results ────────────────────────────────────────── */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          <div className="flex flex-col gap-6 lg:sticky lg:top-6">
            <Card>
              <CardHeader>
                <CardTitle>Profit &amp; loss</CardTitle>
                <CardDescription>Annualised, at the current assumptions.</CardDescription>
              </CardHeader>
              <CardContent>
                <PnlTable results={results} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Break-even</CardTitle>
                <CardDescription>
                  Operating profit as coffees/day sweeps from zero. Amber marks
                  break-even; the dot is today&apos;s plan.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BreakEvenChart inputs={inputs} results={results} />
                <p className="nums mt-2 text-xs text-muted-foreground">
                  Break-even ≈ <strong className="text-foreground">{num(Math.ceil(results.beCoffees))}</strong>{" "}
                  coffees/day · planned <strong className="text-foreground">{num(inputs.coffeesPerDay)}</strong>{" "}
                  ({percent(results.beCoffees > 0 ? (inputs.coffeesPerDay / results.beCoffees) * 100 - 100 : 0, 0)} headroom).
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Capital</CardTitle>
                <CardDescription>What it costs to get to opening day.</CardDescription>
              </CardHeader>
              <CardContent>
                <CapexTable inputs={inputs} results={results} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
