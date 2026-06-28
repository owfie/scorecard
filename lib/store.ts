import {
  DEFAULT_INPUTS,
  SEED_WEIGHTS,
  SEED_SITES,
  type Inputs,
  type CriterionKey,
  type Site,
} from "./defaults";

export interface AppState {
  inputs: Inputs;
  weights: Record<CriterionKey, number>;
  sites: Site[];
}

export const DEFAULT_STATE: AppState = {
  inputs: DEFAULT_INPUTS,
  weights: SEED_WEIGHTS,
  sites: SEED_SITES,
};

export type Action =
  | { type: "setInput"; key: keyof Inputs; value: Inputs[keyof Inputs] }
  | { type: "setWeight"; key: CriterionKey; value: number }
  | { type: "setSiteScore"; index: number; key: CriterionKey; value: number }
  | { type: "setSiteField"; index: number; field: "name" | "rentPerM2"; value: string | number }
  | { type: "addSite" }
  | { type: "removeSite"; index: number }
  | { type: "load"; state: AppState }
  | { type: "reset" };

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "setInput":
      return { ...state, inputs: { ...state.inputs, [action.key]: action.value } };

    case "setWeight":
      return {
        ...state,
        weights: { ...state.weights, [action.key]: clamp(action.value, 0, 100) },
      };

    case "setSiteScore": {
      const sites = state.sites.map((s, idx) =>
        idx === action.index
          ? {
              ...s,
              scores: {
                ...s.scores,
                [action.key]: clamp(Math.round(action.value), 0, 10),
              },
            }
          : s,
      );
      return { ...state, sites };
    }

    case "setSiteField": {
      const sites = state.sites.map((s, idx) =>
        idx === action.index ? { ...s, [action.field]: action.value } : s,
      );
      return { ...state, sites };
    }

    case "addSite": {
      const blank: Site = {
        name: `New site ${state.sites.length + 1}`,
        rentPerM2: 250,
        scores: {
          rentAfford: 5,
          footTraffic: 5,
          daytimePop: 5,
          eveningVibe: 5,
          lowComp: 5,
          grantElig: 5,
          outdoor: 5,
          access: 5,
        },
      };
      return { ...state, sites: [...state.sites, blank] };
    }

    case "removeSite":
      return {
        ...state,
        sites: state.sites.filter((_, idx) => idx !== action.index),
      };

    case "load":
      return action.state;

    case "reset":
      return DEFAULT_STATE;

    default:
      return state;
  }
}

// ── Share-link (de)serialisation ───────────────────────────────────
// State is round-tripped through URL-safe base64 so a scenario can be shared.

export function encodeState(state: AppState): string {
  const json = JSON.stringify(state);
  if (typeof window === "undefined") return "";
  return window
    .btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decodeState(encoded: string): AppState | null {
  try {
    const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(escape(window.atob(b64)));
    const parsed = JSON.parse(json) as Partial<AppState>;
    if (!parsed.inputs || !parsed.weights || !parsed.sites) return null;
    // Merge over defaults so older / partial links still hydrate cleanly.
    return {
      inputs: { ...DEFAULT_INPUTS, ...parsed.inputs },
      weights: { ...SEED_WEIGHTS, ...parsed.weights },
      sites: parsed.sites,
    };
  } catch {
    return null;
  }
}
