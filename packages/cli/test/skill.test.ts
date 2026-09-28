import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SCHEMA_ID } from '@stackmap/schema';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { name: string; version: string };
const skill = (p: string) => readFileSync(new URL(`../../../skill/${p}`, import.meta.url), 'utf8');
const pinned = `${pkg.name}@${pkg.version}`;

// A release bumps the CLI version; the skill must then run and describe that same version.
describe('skill ↔ CLI version', () => {
  it('SKILL.md runs exactly this CLI version', () => {
    const md = skill('SKILL.md');
    const pins = [...md.matchAll(/@hyamero\/stackmap@[\w.-]+/g)].map((m) => m[0]);
    expect(pins.length).toBeGreaterThan(0);
    expect(new Set(pins)).toEqual(new Set([pinned]));
    expect(md).toContain(`version: "${pkg.version}"`);
  });

  it('the JSON Schema id and the examples point at this version', () => {
    expect(SCHEMA_ID).toBe(`https://unpkg.com/${pinned}/dist/stackmap.schema.json`);
    for (const f of readdirSync(new URL('../../../skill/examples/', import.meta.url)).filter((x) => x.endsWith('.json')))
      expect(JSON.parse(skill(`examples/${f}`)).$schema, f).toBe(SCHEMA_ID);
  });
});

describe('package.json', () => {
  it('declares bin paths the way npm publish accepts them (no "./" prefix, or npm drops the bin)', () => {
    const { bin } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { bin: Record<string, string> };
    expect(bin).toEqual({ stackmap: 'dist/cli.js' });
  });
});
