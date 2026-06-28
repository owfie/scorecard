"use client";

import type { Inputs, Results } from "@/lib/model";
import { accounting } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type RowVariant = "line" | "cost" | "subtotal" | "total";

function LedgerRow({
  label,
  amount,
  variant = "line",
  hint,
}: {
  label: string;
  amount: number;
  variant?: RowVariant;
  hint?: string;
}) {
  const negative = amount < 0;
  const isSubtotal = variant === "subtotal";
  const isTotal = variant === "total";

  return (
    <TableRow
      className={cn(
        "border-0 hover:bg-transparent",
        isSubtotal && "border-t border-border",
        isTotal && "border-t-2 border-foreground/35",
      )}
    >
      <TableCell
        className={cn(
          "py-2 align-baseline",
          (isSubtotal || isTotal) && "font-semibold",
        )}
      >
        {label}
        {hint && (
          <span className="ml-2 text-label font-normal text-muted-foreground">
            {hint}
          </span>
        )}
      </TableCell>
      <TableCell
        className={cn(
          "nums py-2 text-right align-baseline tabular-nums",
          variant === "cost" && "text-negative/80",
          (isSubtotal || isTotal) && "font-semibold",
          (isSubtotal || isTotal) && (negative ? "text-negative" : "text-positive"),
          isTotal && "text-base",
        )}
      >
        {accounting(amount)}
      </TableCell>
    </TableRow>
  );
}

export function PnlTable({ results }: { results: Results }) {
  return (
    <Table className="text-label">
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead className="h-8 text-label font-medium tracking-wide text-muted-foreground">
            Annual P&amp;L
          </TableHead>
          <TableHead className="h-8 text-right text-label font-medium tracking-wide text-muted-foreground">
            AUD / yr
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <LedgerRow label="Revenue" amount={results.revenue} />
        <LedgerRow label="Cost of goods sold" amount={-results.cogs} variant="cost" />
        <LedgerRow label="Gross profit" amount={results.grossProfit} variant="subtotal" />
        <LedgerRow
          label="Rent + outgoings"
          amount={-(results.rent + results.outgoings)}
          variant="cost"
        />
        <LedgerRow label="Labour" amount={-results.labour} variant="cost" />
        <LedgerRow
          label="Fixed + merchant fees"
          amount={-(results.fixed + results.merchant)}
          variant="cost"
        />
        <LedgerRow
          label="Operating profit"
          amount={results.netProfit}
          variant="total"
          hint="pre-tax · pre-depreciation"
        />
      </TableBody>
    </Table>
  );
}

export function CapexTable({
  inputs,
  results,
}: {
  inputs: Inputs;
  results: Results;
}) {
  return (
    <Table className="text-label">
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead className="h-8 text-label font-medium tracking-wide text-muted-foreground">
            Capital required
          </TableHead>
          <TableHead className="h-8 text-right text-label font-medium tracking-wide text-muted-foreground">
            AUD
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <LedgerRow label="Fit-out" amount={inputs.fitout} />
        <LedgerRow label="Equipment" amount={inputs.equipment} />
        <LedgerRow label="Coffee machine" amount={inputs.coffeeMachine} />
        <LedgerRow label="Bond / deposit" amount={inputs.bondDeposit} />
        <LedgerRow label="Licensing & legal" amount={inputs.licensingLegal} />
        <LedgerRow label="Initial stock" amount={inputs.initialStock} />
        <LedgerRow label="Sub-total" amount={results.capexBase} variant="subtotal" />
        <LedgerRow
          label="Contingency"
          amount={results.contingencyAmount}
          hint={`+${inputs.contingency}%`}
        />
        <TableRow className="border-t-2 border-foreground/35 hover:bg-transparent">
          <TableCell className="py-2 align-baseline font-semibold">
            Total capital required
          </TableCell>
          <TableCell className="nums py-2 text-right align-baseline text-base font-semibold tabular-nums">
            {accounting(results.capex)}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
