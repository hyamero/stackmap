'use client';

import { useSyncExternalStore } from 'react';
import type { ThemeName } from '@stackmap/core';
import { Moon, Sun } from 'lucide-react';
import { THEME_KEY } from '@/lib/theme';

const dark = () => matchMedia('(prefers-color-scheme: dark)');
const listeners = new Set<() => void>();

function current(): ThemeName {
  const forced = document.documentElement.dataset.theme;
  if (forced === 'light' || forced === 'dark') return forced;
  return dark().matches ? 'dark' : 'light';
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  const mq = dark();
  mq.addEventListener('change', fn);
  return () => {
    listeners.delete(fn);
    mq.removeEventListener('change', fn);
  };
}

/** The theme the page shows: the reader's choice, else the system's. Null while rendering on the server. */
export function useTheme(): ThemeName | null {
  return useSyncExternalStore(subscribe, current, () => null);
}

export function toggleTheme() {
  const next: ThemeName = current() === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    // private mode: the choice lasts for this page only
  }
  listeners.forEach((fn) => fn());
}

/** Both icons are in the markup and CSS shows the right one, so the server's render is already correct. */
export function ThemeButton({ className = 'ib' }: { className?: string }) {
  const theme = useTheme();
  return (
    <button type="button" className={className} onClick={toggleTheme} aria-label={theme ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme` : 'Switch theme'}>
      <Sun size={17} strokeWidth={1.75} aria-hidden="true" className="ic on-dark" />
      <Moon size={17} strokeWidth={1.75} aria-hidden="true" className="ic on-light" />
    </button>
  );
}
