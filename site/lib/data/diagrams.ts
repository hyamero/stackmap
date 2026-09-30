import { readdirSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LaidOutDiagram } from '@stackmap/core';
import { GALLERY } from '@stackmap/core/gallery';
import { layoutDiagram } from '@stackmap/layout';
import { validateDiagram } from '@stackmap/schema';
import { formatJson } from './json-format';
import { DEMO, EXAMPLES_DIR, QUICK_START, SKILL_EXAMPLES_DIR } from './paths';

export interface SiteDiagrams {
  demo: LaidOutDiagram;
  gallery: Record<string, LaidOutDiagram>;
  examples: Record<string, LaidOutDiagram>;
  /** the skill's own example per kind, keyed by file name without `.json` */
  skill: Record<string, LaidOutDiagram>;
  quickStart: LaidOutDiagram;
}

const jsonFiles = (dir: URL) => readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
const stem = (file: string) => file.replace(/\.json$/, '');

// Content is held to the bar the skill holds agents to: any diagnostic, warnings included, stops the build.
async function layoutFile(file: URL): Promise<LaidOutDiagram> {
  const result = validateDiagram(JSON.parse(readFileSync(file, 'utf8')));
  if (!result.diagram || result.diagnostics.length > 0) {
    const lines = result.diagnostics.map((d) => `  ${d.code} ${d.subject} ${d.message}`);
    throw new Error(`${basename(fileURLToPath(file))} has diagnostics:\n${lines.join('\n')}`);
  }
  return layoutDiagram(result.diagram);
}

async function layoutDir(dir: URL): Promise<Record<string, LaidOutDiagram>> {
  const out: Record<string, LaidOutDiagram> = {};
  for (const file of jsonFiles(dir)) out[stem(file)] = await layoutFile(new URL(file, dir));
  return out;
}

export async function layoutSite({ examplesDir = EXAMPLES_DIR, demo = DEMO }: { examplesDir?: URL; demo?: URL } = {}): Promise<SiteDiagrams> {
  const gallery: Record<string, LaidOutDiagram> = {};
  for (const [name, draft] of Object.entries(GALLERY)) gallery[name] = await layoutDiagram(draft);
  return {
    demo: await layoutFile(demo),
    gallery,
    examples: await layoutDir(examplesDir),
    skill: await layoutDir(SKILL_EXAMPLES_DIR),
    quickStart: await layoutFile(QUICK_START),
  };
}

export interface SiteSources {
  skill: Record<string, string>;
  quickStart: string;
}

// The pages print these as the agent writes them. The skill's files pin a schema version, which the page
// adds back from the CLI version where it shows one, so the text here never goes stale.
function source(file: URL): string {
  const { $schema: _, ...rest } = JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>;
  return formatJson(rest);
}

export function readSources(): SiteSources {
  const skill = Object.fromEntries(jsonFiles(SKILL_EXAMPLES_DIR).map((f) => [stem(f), source(new URL(f, SKILL_EXAMPLES_DIR))]));
  return { skill, quickStart: source(QUICK_START) };
}
