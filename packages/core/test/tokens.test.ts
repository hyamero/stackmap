import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../src/contrast';
import { tokens, tokensToCss, type ThemeName } from '../src/tokens';
import { NODE_TYPES } from '../src/types';

const THEMES: ThemeName[] = ['light', 'dark'];

describe.each(THEMES)('%s theme contrast', (theme) => {
  const t = tokens[theme];
  const surfaces = { page: t.page, stage: t.stage, panel: t.panel, groupFill: t.groupFill };

  it.each(Object.entries(surfaces))('text and muted text are AA on %s', (_name, surface) => {
    expect(contrastRatio(t.text, surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t.textMuted, surface)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(NODE_TYPES)('%s card: text AA on fill, accent 3:1 on tile', (type) => {
    const tint = t.tints[type];
    expect(contrastRatio(t.text, tint.fill)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t.textMuted, tint.fill)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t.text, tint.tile)).toBeGreaterThanOrEqual(4.5); // CTA label sits on tile
    expect(contrastRatio(tint.accent, tint.tile)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(tint.accent, t.stage)).toBeGreaterThanOrEqual(3); // handle dots, legend dots
  });

  it('edges are 3:1 on the stage and the primary pill is AA', () => {
    expect(contrastRatio(t.edge, t.stage)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(t.primaryText, t.primary)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('tokensToCss', () => {
  const css = tokensToCss(tokens);

  it('defines light on :root and dark behind both the attribute and the media query', () => {
    expect(css).toContain(':root{color-scheme:light;');
    expect(css).toContain(':root[data-theme="dark"]{color-scheme:dark;');
    expect(css).toContain('@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){');
  });

  it('kebab-cases base tokens and namespaces tints by type', () => {
    expect(css).toContain(`--sm-panel-border:${tokens.light.panelBorder};`);
    expect(css).toContain(`--sm-text-muted:${tokens.dark.textMuted};`);
    expect(css).toContain(`--sm-database-accent:${tokens.light.tints.database.accent};`);
  });
});
