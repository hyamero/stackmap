import { themeVars, tokens, tokensToCss, type ThemeName } from '@stackmap/core';

export const ACCENT: Record<ThemeName, string> = { light: '#4f63c9', dark: '#8fa6f2' };

const accentRoot = `:root{--site-accent:${ACCENT.light}}:root[data-theme="dark"]{--site-accent:${ACCENT.dark}}@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--site-accent:${ACCENT.dark}}}`;

// The viewer scopes themes to :root only; landing scenes force a theme per section, so the same
// variables are also declared on any [data-theme] element. These come last so a section beats its root.
const section = (name: ThemeName) =>
  `[data-theme="${name}"]{color-scheme:${name};${themeVars(tokens[name])}--site-accent:${ACCENT[name]};}`;

export function themeCss(): string {
  return [tokensToCss(tokens), accentRoot, section('dark'), section('light')].join('\n');
}
