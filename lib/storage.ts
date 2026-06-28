import { DEFAULT_INPUTS, SEED_WEIGHTS } from "./defaults";
import type { AppState } from "./store";

const KEY = "cafe-model:v1";

/** Load persisted state, merging over defaults so partial blobs still hydrate. */
export function loadState(): AppState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (!parsed.inputs || !parsed.weights || !parsed.sites) return null;
    return {
      inputs: { ...DEFAULT_INPUTS, ...parsed.inputs },
      weights: { ...SEED_WEIGHTS, ...parsed.weights },
      sites: parsed.sites,
    };
  } catch {
    return null;
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota or privacy mode — fail quietly */
  }
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
