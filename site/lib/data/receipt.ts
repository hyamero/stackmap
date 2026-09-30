import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildHtml } from '../../../packages/cli/src/commands';
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
