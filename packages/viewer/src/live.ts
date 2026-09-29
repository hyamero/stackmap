import type { Transform } from './canvas/viewport';

/** `stackmap serve` adds this block; delivered files never have it, so they never open a connection. */
export const LIVE_ELEMENT_ID = 'stackmap-live';
const VIEWPORT_KEY = 'stackmap:viewport';
const SHOWN_KEY = 'stackmap:shown';

export interface LiveDiagnostic {
  code: string;
  severity: 'error' | 'warning';
  subject: string;
  message: string;
}
export interface LiveStatus {
  ok: boolean;
  diagnostics: LiveDiagnostic[];
  /** the server's current good build ('none' before the first valid diagram) */
  build?: string;
  /** set while the EventSource can't reach the server (it keeps retrying) */
  disconnected?: boolean;
}

export interface LiveConfig {
  events: string;
  /** build id this page was served with */
  build: string;
}

export function readLiveConfig(doc: Document): LiveConfig | null {
  const text = doc.getElementById(LIVE_ELEMENT_ID)?.textContent;
  if (!text) return null;
  try {
    const cfg = JSON.parse(text) as { events?: unknown; build?: unknown };
    return typeof cfg.events === 'string' ? { events: cfg.events, build: typeof cfg.build === 'string' ? cfg.build : 'none' } : null;
  } catch {
    return null;
  }
}

/** A page is stale when the server has a good build other than the one it was served with. */
export const isStale = (cfg: LiveConfig, s: LiveStatus) => !!s.build && s.build !== 'none' && s.build !== cfg.build;

const session = (): Storage | undefined => {
  try {
    return globalThis.sessionStorage;
  } catch {
    return undefined;
  }
};

/** A live reload keeps the camera for this long; later visits start from a fresh fit. */
const VIEWPORT_TTL_MS = 10_000;

/** Survives the live reload: the hash keeps selection/view/lens, this keeps the camera. */
export function storeViewport(t: Transform, now = Date.now()): void {
  try {
    session()?.setItem(VIEWPORT_KEY, JSON.stringify({ ...t, at: now }));
  } catch {
    // best effort
  }
}

/** Called once the stored camera is applied, so a manual refresh later starts from a fresh fit. */
export function clearStoredViewport(): void {
  try {
    session()?.removeItem(VIEWPORT_KEY);
  } catch {
    // best effort
  }
}

/**
 * The camera stored just before a live reload. A pure read with an expiry, not take-and-delete:
 * StrictMode (and a re-mount) may call it twice for one page load.
 */
export function readStoredViewport(now = Date.now()): Transform | null {
  try {
    const raw = session()?.getItem(VIEWPORT_KEY);
    if (!raw) return null;
    const t = JSON.parse(raw) as Transform & { at?: number };
    const fresh = typeof t.at === 'number' && now - t.at >= 0 && now - t.at < VIEWPORT_TTL_MS;
    const valid = [t.x, t.y, t.k].every((n) => typeof n === 'number' && Number.isFinite(n)) && t.k > 0;
    return fresh && valid ? { x: t.x, y: t.y, k: t.k } : null;
  } catch {
    return null;
  }
}

/** Ids on screen in a live session, so after the next reload only what is new animates in. */
export function storeShown(ids: Iterable<string>): void {
  try {
    session()?.setItem(SHOWN_KEY, JSON.stringify([...ids]));
  } catch {
    // best effort
  }
}

export function readShown(): Set<string> | null {
  try {
    const raw = session()?.getItem(SHOWN_KEY);
    const ids: unknown = raw ? JSON.parse(raw) : null;
    return Array.isArray(ids) && ids.every((id) => typeof id === 'string') ? new Set(ids) : null;
  } catch {
    return null;
  }
}

const currentViewport = (doc: Document): Transform | null => {
  const el = doc.querySelector('.sm-viewport');
  if (!el) return null;
  const m = new DOMMatrix(getComputedStyle(el).transform);
  return { x: m.e, y: m.f, k: m.a };
};

export function connectLive(doc: Document, onStatus: (s: LiveStatus) => void): () => void {
  const cfg = readLiveConfig(doc);
  if (!cfg) return () => {};
  const source = new EventSource(cfg.events);
  const reload = () => {
    const t = currentViewport(doc);
    if (t) storeViewport(t);
    source.close();
    location.reload();
  };
  let last: LiveStatus | null = null;
  source.addEventListener('diagnostics', (e) => {
    last = JSON.parse((e as MessageEvent<string>).data) as LiveStatus;
    // Covers a serve restart (and any save that landed between page load and connect).
    if (isStale(cfg, last)) return reload();
    onStatus(last);
  });
  source.addEventListener('reload', reload);
  source.addEventListener('error', () => onStatus({ ...(last ?? { ok: true, diagnostics: [] }), disconnected: true }));
  return () => source.close();
}
