import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateCommand } from '../../../packages/cli/src/commands';
import { DEMO, QUICK_START } from './paths';

export interface CliSamples {
  /** one terminal per diagnostic family, each `stackmap validate` on the demo with one thing broken */
  families: Record<'schema' | 'refs' | 'semantics' | 'card-fit', string[]>;
  /** `validate --json` on the quick start with its edge pointing at a mistyped node */
  json: string;
}

type Draft = { nodes: { id: string; type: string; card: { title: string; subtitle?: string } }[]; edges: { id: string; to: string }[] };

const read = (url: URL) => JSON.parse(readFileSync(url, 'utf8')) as Draft;

async function validate(draft: Draft, json: boolean): Promise<string> {
  const file = join(mkdtempSync(join(tmpdir(), 'stackmap-site-')), 'diagram.json');
  writeFileSync(file, JSON.stringify(draft));
  return (await validateCommand(file, { json })).stdout;
}

const lines = (stdout: string) => stdout.trimEnd().split('\n');

function broken(edit: (d: Draft) => void, base: URL = DEMO): Draft {
  const d = read(base);
  edit(d);
  return d;
}

/** Real CLI output for the docs' terminals, so a changed message or fix shows up in the docs at the next build. */
export async function cliSamples(): Promise<CliSamples> {
  const edge = (d: Draft, id: string) => {
    const e = d.edges.find((x) => x.id === id);
    if (!e) throw new Error(`diagram lost its ${id} edge, which a docs sample breaks`);
    return e;
  };
  const [schema, refs, semantics, cardFit, json] = await Promise.all([
    validate(
      broken((d) => void (d.nodes[1]!.type = 'servce')),
      false,
    ),
    validate(
      broken((d) => void (edge(d, 'e-api-orders').to = 'orders-db')),
      false,
    ),
    validate(
      broken((d) => void d.nodes.push({ id: 'audit', type: 'storage', card: { title: 'Audit log', subtitle: 'S3 bucket' } })),
      false,
    ),
    validate(
      broken((d) => void (d.nodes[0]!.card.subtitle = 'REST API for the storefront, admin and partner apps')),
      false,
    ),
    validate(
      broken((d) => void (edge(d, 'api-db').to = 'orders-db'), QUICK_START),
      true,
    ),
  ]);
  return { families: { schema: lines(schema), refs: lines(refs), semantics: lines(semantics), 'card-fit': lines(cardFit) }, json: json.trimEnd() };
}
