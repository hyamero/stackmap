import type { InfraType, NodeType, StateType } from './types';

export type ThemeName = 'light' | 'dark';

export interface Tint {
  /** card background */
  fill: string;
  /** card outline, in-card dividers, stats panel outline */
  border: string;
  /** icon tile, stats panel, CTA background */
  tile: string;
  /** icon, handle dot, legend dot, traced edge */
  accent: string;
}

export interface ThemeTokens {
  page: string;
  stage: string;
  grid: string;
  panel: string;
  panelBorder: string;
  text: string;
  textMuted: string;
  divider: string;
  edge: string;
  primary: string;
  primaryText: string;
  groupFill: string;
  groupBorder: string;
  tints: Record<NodeType, Tint>;
}

// Lifecycle states reuse the infra palette, picked for meaning: success green, failure red, waiting amber.
const STATE_TINT: Record<StateType, InfraType> = {
  start: 'client',
  active: 'database',
  waiting: 'gateway',
  decision: 'queue',
  success: 'service',
  failure: 'cache',
  neutral: 'external',
};

const withStates = (t: Record<InfraType, Tint>): Record<NodeType, Tint> => ({
  ...t,
  ...(Object.fromEntries(Object.entries(STATE_TINT).map(([s, i]) => [s, t[i]])) as Record<StateType, Tint>),
});

const light: ThemeTokens = {
  page: '#f4f4f3',
  stage: '#ffffff',
  grid: '#dcdcd8',
  panel: '#ffffff',
  panelBorder: '#e7e7e4',
  text: '#161616',
  textMuted: '#5f5f5c',
  divider: '#e7e7e4',
  edge: '#8a8a86',
  primary: '#161616',
  primaryText: '#ffffff',
  groupFill: '#fafaf9',
  groupBorder: '#8f8f8a',
  tints: withStates({
    client: { fill: '#e3f0ef', border: '#cfe4e2', tile: '#cfe4e2', accent: '#2a7f7b' },
    service: { fill: '#e9f0e8', border: '#dce6da', tile: '#dce6da', accent: '#4e7f3f' },
    gateway: { fill: '#f8ece2', border: '#efdccb', tile: '#f0dcca', accent: '#b25e14' },
    database: { fill: '#e8ebfa', border: '#d6dcf5', tile: '#d6dcf5', accent: '#4f63c9' },
    cache: { fill: '#f9e6e3', border: '#f0d2cd', tile: '#f2d3ce', accent: '#c4432f' },
    queue: { fill: '#efe8f7', border: '#dfd3ee', tile: '#e1d6ef', accent: '#7c4fbf' },
    storage: { fill: '#f4f0de', border: '#e6dfc2', tile: '#e7dfc0', accent: '#8a7417' },
    external: { fill: '#efefed', border: '#e1e1de', tile: '#e1e1de', accent: '#5f5f5c' },
    security: { fill: '#f8e6ef', border: '#edd0df', tile: '#efd1e0', accent: '#b83c74' },
  }),
};

const dark: ThemeTokens = {
  page: '#121212',
  stage: '#171717',
  grid: '#262626',
  panel: '#1b1b1b',
  panelBorder: '#2a2a2a',
  text: '#ededec',
  textMuted: '#9c9c99',
  divider: '#2a2a2a',
  edge: '#6e6e6b',
  primary: '#f5f5f4',
  primaryText: '#141414',
  groupFill: '#1b1b1b',
  groupBorder: '#686868',
  tints: withStates({
    client: { fill: '#141c1c', border: '#28504d', tile: '#1b2d2c', accent: '#6fd1c9' },
    service: { fill: '#181c16', border: '#33402b', tile: '#232b1e', accent: '#a6d97a' },
    gateway: { fill: '#1d1914', border: '#4a3822', tile: '#2e2419', accent: '#f0b05a' },
    database: { fill: '#15181f', border: '#2c3a5a', tile: '#1e2536', accent: '#8fa6f2' },
    cache: { fill: '#1f1514', border: '#55302b', tile: '#331e1c', accent: '#f0806e' },
    queue: { fill: '#1a1620', border: '#443468', tile: '#292039', accent: '#be9bf0' },
    storage: { fill: '#1c1a13', border: '#4a4426', tile: '#2b2819', accent: '#dec96a' },
    external: { fill: '#1a1a1a', border: '#383838', tile: '#262626', accent: '#b3b3b1' },
    security: { fill: '#1f1419', border: '#55293f', tile: '#331d29', accent: '#f07db4' },
  }),
};

export const tokens: Record<ThemeName, ThemeTokens> = { light, dark };

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

function themeVars(t: ThemeTokens): string {
  const { tints, ...base } = t;
  let out = '';
  for (const [key, value] of Object.entries(base)) out += `--sm-${kebab(key)}:${value};`;
  for (const [type, tint] of Object.entries(tints)) {
    for (const [key, value] of Object.entries(tint)) out += `--sm-${type}-${key}:${value};`;
  }
  return out;
}

export function tokensToCss(t: Record<ThemeName, ThemeTokens>): string {
  const lightVars = themeVars(t.light);
  const darkVars = themeVars(t.dark);
  return [
    `:root{color-scheme:light;${lightVars}}`,
    `:root[data-theme="dark"]{color-scheme:dark;${darkVars}}`,
    `@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){color-scheme:dark;${darkVars}}}`,
  ].join('\n');
}
