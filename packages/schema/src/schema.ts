import { z } from 'zod';
import { NODE_TYPES } from '@stackmap/core';

// Mirrors the hand-written types in @stackmap/core (a type test keeps them identical). Objects are strict
// so a misspelt key is reported instead of silently dropped.

export const ID_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;
// Size caps keep validation and layout fast and the diagram readable; beyond them, split into views.
export const LIMITS = { rows: 6, stats: 3, evidence: 8, edgeLabel: 24, nodes: 500, edges: 2000, groups: 200, views: 50 } as const;
export const VISIBLE_TEXT = /\S/;

const id = z.string().regex(ID_PATTERN);
const text = z.string().regex(VISIBLE_TEXT);
// A regex rather than z.url(): it carries into the JSON Schema, and only http(s) may become a link.
export const HTTP_URL = /^https?:\/\/\S+$/;
/** Repo-relative: no leading "/", no ".." segment, no backslash, no scheme; evidence links join it onto source.url. */
export const REPO_PATH = /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))(?!.*\\)(?!.*:\/\/).*\S.*$/;
const httpUrl = z.string().regex(HTTP_URL);

const FooterItem = z.strictObject({
  text,
  icon: z.enum(['region', 'secure', 'members']).optional(),
});

const Card = z.strictObject({
  title: text.meta({ description: 'Card title. Must fit the card; `stackmap validate` reports the character budget.' }),
  subtitle: text.optional(),
  brand: z.string().optional().meta({ description: 'simple-icons slug shown in the icon tile, e.g. "postgresql".' }),
  rows: z
    .array(z.strictObject({ label: text, value: text, mono: z.boolean().optional() }))
    .max(LIMITS.rows)
    .optional()
    .meta({ description: 'Key/value rows. `mono` renders the value in Geist Mono (ports, IPs).' }),
  stats: z
    .array(z.strictObject({ value: text, label: text }))
    .max(LIMITS.stats)
    .optional()
    .meta({ description: 'Stat tiles, e.g. replica counts.' }),
  statsNote: text.optional().meta({ description: 'Line under the stat tiles; only shown with stats.' }),
  footer: z.strictObject({ left: FooterItem.optional(), right: FooterItem.optional() }).optional(),
  cta: z
    .strictObject({
      label: text,
      href: httpUrl.optional(),
    })
    .optional(),
});

const Evidence = z.strictObject({
  file: z.string().regex(REPO_PATH).meta({ description: 'Repo-relative path, e.g. "src/orders/api.ts".' }),
  line: z.number().int().positive().optional(),
  note: text.optional(),
});

const Node = z.strictObject({
  id,
  type: z.enum(NODE_TYPES).meta({ description: 'Sets the card color. Never color by brand.' }),
  group: id.optional().meta({ description: 'Id of the group the node sits in.' }),
  card: Card,
  evidence: z
    .array(Evidence)
    .max(LIMITS.evidence)
    .optional()
    .meta({ description: 'Source locations backing this node; listed in the inspector.' }),
});

const Edge = z.strictObject({
  id,
  from: id.meta({ description: 'Source node id.' }),
  to: id.meta({ description: 'Target node id.' }),
  label: text.max(LIMITS.edgeLabel).optional().meta({ description: 'Short label; use sparingly.' }),
  kind: z.enum(['sync', 'async']).optional().meta({ description: 'async edges render dashed.' }),
});

const Group = z.strictObject({
  id,
  label: text.meta({ description: 'Shown small-caps above the frame.' }),
  parent: id.optional().meta({ description: 'Id of the enclosing group, for nesting.' }),
});

const View = z.strictObject({
  id,
  label: text,
  caption: text.optional(),
  nodes: z.array(id).meta({ description: 'Node ids this guided view focuses; the rest are dimmed.' }),
});

export const DiagramDraftSchema = z
  .strictObject({
    $schema: z.string().optional().meta({ description: `Optional; set it to ${'`'}https://unpkg.com/@hyamero/stackmap@0.1.0/dist/stackmap.schema.json${'`'} for editor completion.` }),
    kind: z.enum(['architecture', 'dataflow']),
    title: text,
    subtitle: text.optional(),
    source: z
      .strictObject({ url: httpUrl })
      .optional()
      .meta({ description: 'Base URL for evidence links: `<url>/<file>#L<line>`.' }),
    direction: z.enum(['RIGHT', 'DOWN']).optional().meta({ description: 'Layout flow. Default RIGHT; prefer DOWN for tiered/grouped diagrams.' }),
    groups: z.array(Group).max(LIMITS.groups).optional(),
    nodes: z.array(Node).min(1).max(LIMITS.nodes),
    edges: z.array(Edge).max(LIMITS.edges),
    views: z.array(View).max(LIMITS.views).optional(),
  })
  .meta({ title: 'stackmap diagram', description: 'Agent-authored diagram. Layout is computed by stackmap; never give coordinates.' });

/** Served from the published CLI package, so it is pinned to the same version as the validator. */
export const SCHEMA_ID = 'https://unpkg.com/@hyamero/stackmap@0.1.0/dist/stackmap.schema.json';

export function buildJsonSchema(): Record<string, unknown> {
  return { ...z.toJSONSchema(DiagramDraftSchema, { target: 'draft-2020-12' }), $id: SCHEMA_ID };
}
