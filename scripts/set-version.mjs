// Sets the release version everywhere it is pinned: the CLI's package.json and lockfile entry, and every
// `@omsimos/stackmap@x.y.z` in tracked files (the skill's npx commands, the JSON Schema id, the examples).
// semantic-release runs it before packing; `skill.test.ts` checks the pins agree. Usage: node scripts/set-version.mjs <version>
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const version = process.argv[2];
if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(version ?? '')) {
  console.error('usage: node scripts/set-version.mjs <semver>');
  process.exit(1);
}

const root = new URL('..', import.meta.url);
const edit = (path, fn) => {
  const url = new URL(path, root);
  const before = readFileSync(url, 'utf8');
  const after = fn(before);
  if (after !== before) writeFileSync(url, after);
  return after !== before;
};

const changed = [];
// Only the version line, so the rest of each file keeps its formatting.
if (edit('packages/cli/package.json', (s) => s.replace(/^(  "version": )"[^"]+"/m, `$1"${version}"`))) changed.push('packages/cli/package.json');
// `bun install --frozen-lockfile` fails when a workspace's version no longer matches its lockfile entry.
if (edit('bun.lock', (s) => s.replace(/("packages\/cli": \{\s*"name": "@omsimos\/stackmap",\s*"version": )"[^"]+"/, `$1"${version}"`))) changed.push('bun.lock');
if (edit('skill/SKILL.md', (s) => s.replace(/^(  version: )"[^"]+"/m, `$1"${version}"`))) changed.push('skill/SKILL.md');

const pin = /@omsimos\/stackmap@\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?/g;
const tracked = execFileSync('git', ['grep', '-lE', '@omsimos/stackmap@[0-9]', '--', ':!bun.lock'], { cwd: root, encoding: 'utf8' });
for (const path of tracked.split('\n').filter(Boolean))
  if (edit(path, (s) => s.replace(pin, `@omsimos/stackmap@${version}`)) && !changed.includes(path)) changed.push(path);

console.log(`stackmap ${version}: ${changed.length ? changed.join(', ') : 'already set'}`);
