import { describe, expect, it } from 'vitest';
import { themeVars, tokens } from '@stackmap/core';
import { ACCENT, themeCss } from './theme';

describe('themeCss', () => {
  const css = themeCss();

  it('keeps the viewer root rules, including the system preference', () => {
    expect(css).toContain(`:root{color-scheme:light;${themeVars(tokens.light)}`);
    expect(css).toContain('@media (prefers-color-scheme: dark){:root:not([data-theme="light"])');
  });

  it('lets a section force either theme for its subtree', () => {
    expect(css).toContain(`[data-theme="dark"]{color-scheme:dark;${themeVars(tokens.dark)}--site-accent:${ACCENT.dark};}`);
    expect(css).toContain(`[data-theme="light"]{color-scheme:light;${themeVars(tokens.light)}--site-accent:${ACCENT.light};}`);
  });

  it('puts the section rules after the root rules so a nested section wins', () => {
    expect(css.lastIndexOf('[data-theme="light"]{')).toBeGreaterThan(css.indexOf('@media (prefers-color-scheme: dark)'));
  });

  it('uses the brand accents', () => {
    expect(ACCENT).toEqual({ light: '#4f63c9', dark: '#8fa6f2' });
  });
});
