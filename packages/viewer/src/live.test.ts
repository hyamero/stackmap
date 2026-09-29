import { afterEach, describe, expect, it } from 'vitest';
import { clearStoredViewport, isStale, LIVE_ELEMENT_ID, readLiveConfig, readStoredViewport, storeViewport } from './live';

const block = (text: string) => {
  const el = document.createElement('script');
  el.type = 'application/json';
  el.id = LIVE_ELEMENT_ID;
  el.textContent = text;
  document.body.append(el);
};
afterEach(() => {
  document.getElementById(LIVE_ELEMENT_ID)?.remove();
  sessionStorage.clear();
});

describe('live mode', () => {
  it('is off without the live block (delivered files)', () => {
    expect(readLiveConfig(document)).toBeNull();
  });

  it('reads the events URL from the live block, rejecting junk', () => {
    block('{"events":"/events","build":"abc"}');
    expect(readLiveConfig(document)).toEqual({ events: '/events', build: 'abc' });
    document.getElementById(LIVE_ELEMENT_ID)!.textContent = '{"events":42}';
    expect(readLiveConfig(document)).toBeNull();
    document.getElementById(LIVE_ELEMENT_ID)!.textContent = 'nope';
    expect(readLiveConfig(document)).toBeNull();
  });

  it('keeps the camera across the reload that follows, then lets it expire', () => {
    storeViewport({ x: 10, y: -20, k: 1.5 }, 1_000);
    expect(readStoredViewport(1_500)).toEqual({ x: 10, y: -20, k: 1.5 });
    expect(readStoredViewport(1_500)).toEqual({ x: 10, y: -20, k: 1.5 }); // repeatable (StrictMode)
    expect(readStoredViewport(11_001)).toBeNull();
  });

  it('is stale only when the server has a different good build', () => {
    const cfg = { events: '/events', build: 'aaa' };
    expect(isStale(cfg, { ok: true, diagnostics: [], build: 'aaa' })).toBe(false);
    expect(isStale(cfg, { ok: true, diagnostics: [], build: 'bbb' })).toBe(true);
    expect(isStale(cfg, { ok: false, diagnostics: [], build: 'none' })).toBe(false);
    expect(isStale(cfg, { ok: false, diagnostics: [] })).toBe(false);
  });

  it('forgets the camera once it has been applied', () => {
    storeViewport({ x: 1, y: 2, k: 1 });
    clearStoredViewport();
    expect(readStoredViewport()).toBeNull();
  });

  it('ignores a corrupt stored camera', () => {
    const now = Date.now();
    sessionStorage.setItem('stackmap:viewport', JSON.stringify({ x: 1, y: 2, k: 0, at: now }));
    expect(readStoredViewport(now)).toBeNull();
    sessionStorage.setItem('stackmap:viewport', 'garbage');
    expect(readStoredViewport(now)).toBeNull();
  });
});
