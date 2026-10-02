import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// scripts/set-version.mjs rewrites every `@omsimos/stackmap@x.y.z` in tracked files, but the release commit
// never includes site/: a pin here would be edited in the release job's tree and left uncommitted.
describe('no version pins in site/', () => {
  it('has no @omsimos/stackmap@<version> literal in any tracked or new file', () => {
    const repo = fileURLToPath(new URL('../../', import.meta.url));
    let hits = '';
    try {
      hits = execFileSync('git', ['grep', '-nE', '--untracked', '@omsimos/stackmap@[0-9]', '--', 'site'], { cwd: repo, encoding: 'utf8' });
    } catch {
      // git grep exits 1 when nothing matches
    }
    expect(hits).toBe('');
  });
});
