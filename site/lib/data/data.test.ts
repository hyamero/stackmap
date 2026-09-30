import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import { GALLERY } from '@stackmap/core/gallery';
import { deliverCommand } from '../../../packages/cli/src/commands';
import { layoutSite, readSources } from './diagrams';
import { CLI_PACKAGE, DEMO, VIEWER_TEMPLATE } from './paths';
import { deliverReceipt, readTemplate, repairRound } from './receipt';
import { schemaReference } from './schema-ref';
import { installCommands, readCliVersion } from './version';

describe('version', () => {
  it('is the CLI package version', () => {
    const { version } = JSON.parse(readFileSync(CLI_PACKAGE, 'utf8')) as { version: string };
    expect(readCliVersion()).toBe(version);
  });

  it('pins the install commands to it', () => {
    // Built, not written out: a literal pin would be rewritten by every release (see tests/no-pins.test.ts).
    const version = '1.2.3';
    expect(installCommands(version)).toEqual({
      skill: 'npx skills add hyamero/stackmap',
      cli: `npx @hyamero/stackmap@${version} deliver diagram.json`,
    });
  });
});

describe('layoutSite', () => {
  it('lays out the demo, every gallery diagram and every example', async () => {
    const d = await layoutSite();
    expect(Object.keys(d.gallery).sort()).toEqual(Object.keys(GALLERY).sort());
    expect(Object.keys(d.examples).sort()).toEqual(['bookshop', 'food-delivery', 'ml-feature-platform', 'production-vpc', 'repo-architecture']);
    expect(Object.keys(d.skill).sort()).toEqual(['checkout.sequence', 'clickstream.dataflow', 'job.lifecycle', 'release.workflow', 'web-app.architecture']);
    expect(d.quickStart.draft.nodes.map((n) => n.id)).toEqual(['api', 'db']);
    expect(Object.keys(d.checkout).sort()).toEqual(['architecture', 'dataflow', 'lifecycle', 'sequence', 'workflow']);
    for (const [kind, c] of Object.entries(d.checkout)) expect(c.draft.kind).toBe(kind);
    expect(Object.keys(d.demo.nodes)).toHaveLength(11);
    for (const diagram of [d.demo, d.quickStart, ...Object.values(d.gallery), ...Object.values(d.examples), ...Object.values(d.skill), ...Object.values(d.checkout)]) {
      expect(diagram.bounds.width).toBeGreaterThan(0);
    }
  }, 60_000);

  it('refuses a content diagram with errors, naming the file and the code', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'site-'));
    writeFileSync(
      join(dir, 'broken.json'),
      JSON.stringify({ kind: 'architecture', title: 'x', nodes: [{ id: 'a', type: 'service', card: { title: 'a' } }], edges: [{ id: 'e', from: 'a', to: 'b' }] }),
    );
    await expect(layoutSite({ examplesDir: pathToFileURL(`${dir}/`) })).rejects.toThrow(/broken\.json.*refs\//s);
  });
});

describe('sources', () => {
  it('prints each skill example and the quick start as the agent writes them, without the $schema pin', () => {
    const src = readSources();
    expect(Object.keys(src.skill).sort()).toEqual(['checkout.sequence', 'clickstream.dataflow', 'job.lifecycle', 'release.workflow', 'web-app.architecture']);
    for (const text of [...Object.values(src.skill), src.quickStart]) {
      expect(text).not.toContain('$schema');
      expect(() => JSON.parse(text)).not.toThrow();
    }
    expect(JSON.parse(src.skill['web-app.architecture']!)).toMatchObject({ kind: 'architecture', title: 'Bookshop' });
  });
});

describe('repairRound', () => {
  it('is what `stackmap validate` prints for the demo with a mistyped node, then for the demo', async () => {
    const round = await repairRound();
    expect(round.broken).toEqual([
      'error  refs/unknown-node  /edges/6/to',
      '  Unknown node "orders-db"',
      '  fix: use "orders"',
      '  fix: add node "orders-db" or remove the edge',
      '✗ 1 error',
    ]);
    expect(round.clean).toEqual(['✓ valid: no diagnostics']);
  });
});

describe('deliverReceipt', () => {
  it('matches what `stackmap deliver` prints for the demo', async () => {
    const template = readTemplate();
    const out = join(mkdtempSync(join(tmpdir(), 'site-')), 'diagram.html');
    const cli = await deliverCommand(DEMO.pathname, { template, out });
    expect(cli.code).toBe(0);
    const receipt = await deliverReceipt(template);
    expect(cli.stdout).toContain(`sha256 ${receipt.sha256} · ${receipt.bytes} bytes`);
    expect(receipt.file).toBe('.stackmap/commerce-api/diagram.html');
  }, 60_000);

  it('names the command to run when the viewer build is missing', () => {
    expect(() => readTemplate(new URL('file:///nonexistent/index.html'))).toThrow(/bun run --filter @stackmap\/viewer build/);
  });

  it('reads the real viewer template by default', () => {
    expect(VIEWER_TEMPLATE.pathname).toMatch(/packages\/viewer\/dist\/index\.html$/);
  });
});

describe('schemaReference', () => {
  it('starts with the diagram and covers every top-level field', () => {
    const [root, ...rest] = schemaReference();
    expect(root!.name).toBe('Diagram');
    expect(root!.fields.map((f) => f.key)).toEqual(expect.arrayContaining(['kind', 'title', 'nodes', 'edges', 'views']));
    expect(rest.map((s) => s.name)).toContain('nodes[]');
  });
});
