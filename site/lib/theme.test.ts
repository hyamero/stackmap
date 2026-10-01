import { describe, expect, it } from 'vitest';
import { themeVars, tokens } from '@stackmap/core';
import { ACCENT, THEME_KEY, THEME_SCRIPT, themeCss } from './theme';

describe('themeCss', () => {
  const css = themeCss();

  it('keeps the viewer root rules, including the system preference', () => {
    expect(css).toContain(`:root{color-scheme:light;${themeVars(tokens.light)}`);
    expect(css).toContain('@media (prefers-color-scheme: dark){:root:not([data-theme="light"])');
  });

  it('lets a section force either theme for its subtree', () => {
    expect(css).toContain(`[data-theme="dark"]{color-scheme:dark;${themeVars(tokens.dark)}--site-accent:${ACCENT.dark};--brand-accent:${ACCENT.dark};`);
    expect(css).toContain(`[data-theme="light"]{color-scheme:light;${themeVars(tokens.light)}--site-accent:${ACCENT.light};--brand-accent:${ACCENT.light};`);
  });

  it('follows the system for the brand accent and panel shadow until the reader picks a theme', () => {
    expect(css).toContain(`@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--site-accent:${ACCENT.dark};--brand-accent:${ACCENT.dark};--shadow-panel:inset 0 0 0 1px ${tokens.dark.panelBorder}`);
  });

  it('puts the section rules after the root rules so a nested section wins', () => {
    expect(css.lastIndexOf('[data-theme="light"]{')).toBeGreaterThan(css.indexOf('@media (prefers-color-scheme: dark)'));
  });

  it('uses the brand accents', () => {
    expect(ACCENT).toEqual({ light: '#4f63c9', dark: '#8fa6f2' });
  });
});

describe('THEME_SCRIPT', () => {
  const run = (stored: string | null) => {
    const root = { dataset: {} as Record<string, string>, classList: { add: (c: string) => (root.classes = [...root.classes, c]) }, classes: [] as string[] };
    new Function('document', 'localStorage', THEME_SCRIPT)({ documentElement: root }, { getItem: (k: string) => (k === THEME_KEY ? stored : null) });
    return root;
  };

  it('applies a stored choice and marks that script runs', () => {
    const root = run('dark');
    expect(root.dataset.theme).toBe('dark');
    expect(root.classes).toEqual(['js']);
  });

  it('ignores anything that is not a theme, leaving the system preference', () => {
    expect(run('purple').dataset.theme).toBeUndefined();
    expect(run(null).dataset.theme).toBeUndefined();
  });
});
