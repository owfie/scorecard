"use client";

import * as React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { compute, type Inputs, type Results } from "@/lib/model";
import { accounting, num } from "@/lib/format";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

function moneyShort(v: number) {
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(0)}k`;
  return `${sign}$${abs.toFixed(0)}`;
}

interface ChartDatum {
  coffees: number;
  profit: number;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartDatum }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="nums font-medium">{num(d.coffees)} coffees / day</div>
      <div
        className="nums"
        style={{ color: d.profit >= 0 ? "var(--positive)" : "var(--negative)" }}
      >
        {accounting(d.profit)} profit
      </div>
    </div>
  );
}

export function BreakEvenChart({
  inputs,
  results,
}: {
  inputs: Inputs;
  results: Results;
}) {
  const reduced = usePrefersReducedMotion();

  const { data, planProfit, beCoffees } = React.useMemo(() => {
    const planned = Math.max(inputs.coffeesPerDay, 1);
    const maxX = Math.max(Math.ceil(planned * 1.8), 10);
    const steps = 64;
    const out: ChartDatum[] = [];
    for (let s = 0; s <= steps; s++) {
      const coffees = (maxX / steps) * s;
      out.push({
        coffees,
        profit: compute({ ...inputs, coffeesPerDay: coffees }).netProfit,
      });
    }
    return {
      data: out,
      planProfit: results.netProfit,
      beCoffees: results.beCoffees,
    };
  }, [inputs, results.netProfit, results.beCoffees]);

  const showBE =
    Number.isFinite(beCoffees) &&
    beCoffees >= 0 &&
    beCoffees <= inputs.coffeesPerDay * 1.8;

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 12, right: 16, left: 4, bottom: 4 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="coffees"
            type="number"
            domain={[0, "dataMax"]}
            tickFormatter={(v: number) => num(v)}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            stroke="var(--border)"
            tickMargin={8}
            label={{
              value: "coffees / day",
              position: "insideBottom",
              offset: -2,
              style: { fontSize: 11, fill: "var(--muted-foreground)" },
            }}
          />
          <YAxis
            tickFormatter={moneyShort}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            stroke="var(--border)"
            width={52}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
          />
          {/* Zero-profit baseline */}
          <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeWidth={1} />
          {/* Break-even intercept */}
          {showBE && (
            <ReferenceLine
              x={beCoffees}
              stroke="var(--amber)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              label={{
                value: `break-even ≈ ${num(Math.ceil(beCoffees))}`,
                position: "insideTopLeft",
                style: { fontSize: 11, fill: "var(--amber)", fontWeight: 600 },
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey="profit"
            stroke="var(--chart-1)"
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={!reduced}
            animationDuration={500}
          />
          {/* Current plan */}
          <ReferenceDot
            x={inputs.coffeesPerDay}
            y={planProfit}
            r={5}
            fill="var(--chart-1)"
            stroke="var(--card)"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
