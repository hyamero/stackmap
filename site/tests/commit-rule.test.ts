import { describe, expect, it } from 'vitest';
// @ts-expect-error: the commitlint config is plain JS with no declaration file
import config from '../../commitlint.config.mjs';

type Rule = (parsed: { type: string | null; scope: string | null }) => [boolean, string];
const rule = (config as { plugins: { rules: Record<string, Rule> }[] }).plugins[0]!.rules['site-no-release']!;
const check = (type: string, scope: string | null) => rule({ type, scope })[0];

describe('site-no-release', () => {
  it('rejects releasing types on the site scope, whatever the case', () => {
    for (const type of ['feat', 'fix', 'perf', 'revert', 'Feat', 'FIX']) expect(check(type, 'site')).toBe(false);
    expect(check('feat', 'Site')).toBe(false);
  });

  it('allows docs and chore on the site scope, and releasing types elsewhere', () => {
    expect(check('docs', 'site')).toBe(true);
    expect(check('chore', 'site')).toBe(true);
    expect(check('feat', 'viewer')).toBe(true);
    expect(check('fix', null)).toBe(true);
  });

  it('is an error-level rule', () => {
    expect((config as { rules: Record<string, unknown> }).rules['site-no-release']).toEqual([2, 'always']);
  });

  it('says what to use instead', () => {
    expect(rule({ type: 'feat', scope: 'site' })[1]).toMatch(/docs\(site\)/);
  });
});
