import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildHtml, validateCommand } from '../../../packages/cli/src/commands';
import { DEMO, VIEWER_TEMPLATE } from './paths';

export interface Receipt {
  file: string;
  sha256: string;
  bytes: number;
}

export function readTemplate(template: URL = VIEWER_TEMPLATE): string {
  if (!existsSync(template)) {
    throw new Error(`viewer build missing at ${fileURLToPath(template)}; run \`bun run --filter @stackmap/viewer build\` from the repo root`);
  }
  return readFileSync(template, 'utf8');
}

/** The Agent scene's "delivered" line, from the CLI's own validate → layout → embed path. */
export async function deliverReceipt(template: string, demo: URL = DEMO): Promise<Receipt> {
  const { html, diagnostics } = await buildHtml(fileURLToPath(demo), template);
  if (html === undefined) throw new Error(`demo diagram failed to deliver: ${JSON.stringify(diagnostics)}`);
  return {
    file: '.stackmap/commerce-api/diagram.html',
    sha256: createHash('sha256').update(html).digest('hex'),
    bytes: Buffer.byteLength(html),
  };
}

export interface RepairRound {
  broken: string[];
  clean: string[];
}

const lines = (stdout: string) => stdout.trimEnd().split('\n');

/** The docs' repair round: `stackmap validate` on the demo with one edge pointing at a mistyped node, then on the demo. */
export async function repairRound(demo: URL = DEMO): Promise<RepairRound> {
  const draft = JSON.parse(readFileSync(demo, 'utf8')) as { edges: { id: string; to: string }[] };
  const edge = draft.edges.find((e) => e.id === 'e-api-orders');
  if (!edge) throw new Error('demo diagram lost its e-api-orders edge, which the docs repair round breaks');
  edge.to = 'orders-db';
  const file = join(mkdtempSync(join(tmpdir(), 'stackmap-site-')), 'diagram.json');
  writeFileSync(file, JSON.stringify(draft));
  const [broken, clean] = await Promise.all([validateCommand(file, { json: false }), validateCommand(fileURLToPath(demo), { json: false })]);
  return { broken: lines(broken.stdout), clean: lines(clean.stdout) };
}
