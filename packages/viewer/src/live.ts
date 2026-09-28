import type { Transform } from './canvas/viewport';

/** `stackmap serve` adds this block; delivered files never have it, so they never open a connection. */
export const LIVE_ELEMENT_ID = 'stackmap-live';
const VIEWPORT_KEY = 'stackmap:viewport';

export interface LiveDiagnostic {
  code: string;
  severity: 'error' | 'warning';
  subject: string;
  message: string;
}
export interface LiveStatus {
  ok: boolean;
  diagnostics: LiveDiagnostic[];
}

export function readLiveConfig(doc: Document): { events: string } | null {
  const text = doc.getElementById(LIVE_ELEMENT_ID)?.textContent;
  if (!text) return null;
  try {
    const cfg = JSON.parse(text) as { events?: unknown };
    return typeof cfg.events === 'string' ? { events: cfg.events } : null;
  } catch {
    return null;
  }
}

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
  source.addEventListener('diagnostics', (e) => onStatus(JSON.parse((e as MessageEvent<string>).data) as LiveStatus));
  source.addEventListener('reload', () => {
    const t = currentViewport(doc);
    if (t) storeViewport(t);
    source.close();
    location.reload();
  });
  return () => source.close();
}
