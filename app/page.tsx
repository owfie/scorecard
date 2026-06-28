"use client";

import * as React from "react";
import { Check, Link2, Moon, RotateCcw, Sun } from "lucide-react";
import type { Inputs } from "@/lib/model";
import {
  reducer,
  DEFAULT_STATE,
  encodeState,
  decodeState,
} from "@/lib/store";
import { loadState, saveState, clearState } from "@/lib/storage";
import { EconomicsTab } from "@/components/economics-tab";
import { LocationTab } from "@/components/location-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export default function Page() {
  const [state, dispatch] = React.useReducer(reducer, DEFAULT_STATE);
  const [copied, setCopied] = React.useState(false);
  const [dark, setDark] = React.useState(true);
  // Skip persisting the initial default render — we only want to save real
  // state (post-hydration and user edits), never clobber storage with defaults.
  const skipNextSave = React.useRef(true);

  // Hydrate (post-mount to avoid SSR mismatch): share-link > localStorage > defaults.
  React.useEffect(() => {
    const shared = new URLSearchParams(window.location.search).get("s");
    const next = (shared && decodeState(shared)) || loadState();
    if (next) dispatch({ type: "load", state: next });
  }, []);

  React.useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    saveState(state);
  }, [state]);

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const onInput = React.useCallback(
    <K extends keyof Inputs>(key: K, value: Inputs[K]) =>
      dispatch({ type: "setInput", key, value }),
    [],
  );

  function handleReset() {
    dispatch({ type: "reset" });
    clearState();
    window.history.replaceState(null, "", window.location.pathname);
  }

  function handleShare() {
    const url = `${window.location.origin}${window.location.pathname}?s=${encodeState(state)}`;
    window.history.replaceState(null, "", url);
    navigator.clipboard?.writeText(url).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      },
      () => {},
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Masthead ──────────────────────────────────────────── */}
      <header className="mb-8 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl leading-none font-medium tracking-tight sm:text-4xl">
            Scorecard
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            A client-only financial model and weighted location scorecard. Tune
            the assumptions; the P&amp;L, returns and break-even respond live.
            Everything saves to your browser.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle dark mode"
            onClick={() => setDark((d) => !d)}
          >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
            {copied ? "Copied" : "Share"}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleReset}>
            <RotateCcw className="size-4" />
            Reset
          </Button>
        </div>
      </header>

      <Tabs defaultValue="economics" className="gap-6">
        <TabsList>
          <TabsTrigger value="economics">Economics</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
        </TabsList>

        <TabsContent value="economics">
          <EconomicsTab inputs={state.inputs} onInput={onInput} />
        </TabsContent>

        <TabsContent value="location">
          <LocationTab
            weights={state.weights}
            sites={state.sites}
            onWeight={(key, value) => dispatch({ type: "setWeight", key, value })}
            onSiteScore={(index, key, value) =>
              dispatch({ type: "setSiteScore", index, key, value })
            }
            onSiteField={(index, field, value) =>
              dispatch({ type: "setSiteField", index, field, value })
            }
            onAddSite={() => dispatch({ type: "addSite" })}
            onRemoveSite={(index) => dispatch({ type: "removeSite", index })}
          />
        </TabsContent>
      </Tabs>

      <footer className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
        Operating profit is stated <em>pre-tax &amp; pre-depreciation</em>.
        Figures are a planning model, not financial advice.
      </footer>
    </div>
  );
}
