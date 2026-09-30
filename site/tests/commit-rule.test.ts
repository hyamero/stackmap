import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Through the real CLI and parser, so `!`, footers and reverts are parsed the way CI parses them.
const repo = fileURLToPath(new URL('../../', import.meta.url));
const lint = (message: string) =>
  spawnSync(`${repo}node_modules/.bin/commitlint`, [], { cwd: repo, input: `${message}\n`, encoding: 'utf8' });

// Each of these would publish an npm release (semantic-release: feat/breaking → minor, fix/perf/revert → patch).
const RELEASING = [
  'feat(site): add a section',
  'Fix(site): typo',
  'perf(site): lazy-load the viewer',
  'feat(Site): add a section',
  'feat(site)!: drop the old route',
  'docs(site)!: rewrite the docs',
  'docs(site): rewrite the docs\n\nBREAKING CHANGE: the old anchors are gone',
  'Revert "docs(site): add the nav"\n\nThis reverts commit 0123abc.',
  'revert: docs(site): add the nav',
  'revert(site): add the nav',
];

const ALLOWED = [
  'docs(site): add the nav',
  'chore(site): bump next',
  'feat(viewer): route between two nodes',
  'Revert "feat(viewer): route between two nodes"\n\nThis reverts commit 0123abc.',
  'Merge pull request #24 from hyamero/docs/site-foundation',
  "Merge branch 'main' into staging",
  'chore(release): merge main into staging [skip ci]',
];

describe('site-no-release', () => {
  it.each(RELEASING)('rejects %j', (message) => {
    const r = lint(message);
    expect(r.status).toBe(1);
    expect(r.stdout).toContain('[site-no-release]');
  });

  it.each(ALLOWED)('allows %j', (message) => {
    const r = lint(message);
    expect(r.stdout + r.stderr).not.toContain('✖');
    expect(r.status).toBe(0);
  });
});
