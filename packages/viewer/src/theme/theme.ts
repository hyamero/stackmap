import { useCallback, useState } from 'react';

export type ThemeChoice = 'light' | 'dark';
export const THEME_STORAGE_KEY = 'stackmap:theme';

// Storage can be missing or throw (file:// in private mode, blocked site data); theme must still work.
const defaultStorage = (): Storage | undefined => {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
};

export function readStoredTheme(storage: Storage | undefined = defaultStorage()): ThemeChoice | null {
  try {
    const value = storage?.getItem(THEME_STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

export function resolveTheme(stored: ThemeChoice | null, prefersDark: boolean): ThemeChoice {
  return stored ?? (prefersDark ? 'dark' : 'light');
}

export function applyTheme(
  theme: ThemeChoice,
  { persist = false, storage = defaultStorage() }: { persist?: boolean; storage?: Storage } = {},
): void {
  document.documentElement.dataset.theme = theme;
  if (!persist) return;
  try {
    storage?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // best effort
  }
}

export function useTheme(): { theme: ThemeChoice; toggle: () => void } {
  const [theme, setTheme] = useState<ThemeChoice>(() => {
    const initial = resolveTheme(readStoredTheme(), matchMedia('(prefers-color-scheme: dark)').matches);
    applyTheme(initial);
    return initial;
  });
  const toggle = useCallback(() => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next, { persist: true });
      return next;
    });
  }, []);
  return { theme, toggle };
}
