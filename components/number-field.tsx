"use client";

import * as React from "react";
import { Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface NumberFieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  prefix?: string;
  step?: number;
  min?: number;
  max?: number;
  tooltip?: string;
  disabled?: boolean;
  className?: string;
}

export function NumberField({
  id,
  label,
  value,
  onChange,
  unit,
  prefix,
  step = 1,
  min,
  max,
  tooltip,
  disabled,
  className,
}: NumberFieldProps) {
  // While focused we let the user type freely (a "draft" string); on blur we
  // snap back to the canonical numeric value. This keeps intermediate states
  // like "0." or "" usable without fighting the controlled value.
  const [draft, setDraft] = React.useState<string | null>(null);
  const shown = draft ?? (Number.isFinite(value) ? String(value) : "");

  function handleChange(raw: string) {
    setDraft(raw);
    if (raw === "" || raw === "-") {
      onChange(0);
      return;
    }
    const parsed = Number(raw);
    if (!Number.isNaN(parsed)) {
      let next = parsed;
      if (min !== undefined) next = Math.max(min, next);
      if (max !== undefined) next = Math.min(max, next);
      onChange(next);
    }
  }

  return (
    <div className={cn("grid gap-1.5", className)}>
      <div className="flex items-center gap-1.5">
        <Label
          htmlFor={id}
          className="text-label font-medium text-muted-foreground"
        >
          {label}
        </Label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger
              aria-label={`About: ${label}`}
              className="text-muted-foreground/60 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
            >
              <Info className="size-3.5" />
            </TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-sm text-muted-foreground">
            {prefix}
          </span>
        )}
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          value={shown}
          step={step}
          min={min}
          max={max}
          disabled={disabled}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={() => setDraft(null)}
          className={cn(
            "nums h-9",
            prefix && "pl-6",
            unit && "pr-12",
          )}
        />
        {unit && (
          <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-label font-medium text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
