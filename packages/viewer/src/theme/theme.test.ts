import { beforeEach, describe, expect, it } from 'vitest';
import { applyTheme, readStoredTheme, resolveTheme, THEME_STORAGE_KEY } from './theme';

const throwingStorage = {
  getItem: () => {
    throw new Error('SecurityError');
  },
  setItem: () => {
    throw new Error('SecurityError');
  },
} as unknown as Storage;

describe('theme', () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it('stored choice wins over the OS preference', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('falls back to the OS preference', () => {
    expect(resolveTheme(null, true)).toBe('dark');
    expect(resolveTheme(null, false)).toBe('light');
  });

  it('ignores junk in storage', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'sepia');
    expect(readStoredTheme()).toBeNull();
  });

  it('applies to <html> and persists only when asked', () => {
    applyTheme('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
    applyTheme('light', { persist: true });
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('survives throwing storage', () => {
    expect(readStoredTheme(throwingStorage)).toBeNull();
    expect(() => applyTheme('dark', { persist: true, storage: throwingStorage })).not.toThrow();
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});
