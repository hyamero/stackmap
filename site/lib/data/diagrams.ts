import { readdirSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LaidOutDiagram } from '@stackmap/core';
import { GALLERY } from '@stackmap/core/gallery';
import { layoutDiagram } from '@stackmap/layout';
import { validateDiagram } from '@stackmap/schema';
import { DEMO, EXAMPLES_DIR } from './paths';

export interface SiteDiagrams {
  demo: LaidOutDiagram;
  gallery: Record<string, LaidOutDiagram>;
  examples: Record<string, LaidOutDiagram>;
}

// Content is held to the bar the skill holds agents to: any diagnostic, warnings included, stops the build.
async function layoutFile(file: URL): Promise<LaidOutDiagram> {
  const result = validateDiagram(JSON.parse(readFileSync(file, 'utf8')));
  if (!result.diagram || result.diagnostics.length > 0) {
    const lines = result.diagnostics.map((d) => `  ${d.code} ${d.subject} ${d.message}`);
    throw new Error(`${basename(fileURLToPath(file))} has diagnostics:\n${lines.join('\n')}`);
  }
  return layoutDiagram(result.diagram);
}

export async function layoutSite({ examplesDir = EXAMPLES_DIR, demo = DEMO }: { examplesDir?: URL; demo?: URL } = {}): Promise<SiteDiagrams> {
  const gallery: Record<string, LaidOutDiagram> = {};
  for (const [name, draft] of Object.entries(GALLERY)) gallery[name] = await layoutDiagram(draft);
  const examples: Record<string, LaidOutDiagram> = {};
  for (const file of readdirSync(examplesDir).filter((f) => f.endsWith('.json')).sort()) {
    examples[file.replace(/\.json$/, '')] = await layoutFile(new URL(file, examplesDir));
  }
  return { demo: await layoutFile(demo), gallery, examples };
}
