import { DIAGRAM_KINDS, KIND_LABELS, type DiagramKind } from '@stackmap/core';

export interface DocSection {
  id: string;
  label: string;
}

export interface DocPage {
  href: string;
  title: string;
  group: DocGroup;
  sections: DocSection[];
}

export type DocGroup = 'Get started' | 'Diagram kinds' | 'Reference';

const s = (id: string, label: string): DocSection => ({ id, label });

const KIND_SECTIONS = [s('example', 'An example'), s('parts', 'Its parts'), s('rules', 'Rules'), s('ask', 'Ask for one'), s('examples', 'Examples')];

export const kindHref = (kind: DiagramKind) => `/docs/${kind}`;

/** Every docs page in reading order: the sidebar's groups and the previous/next links both follow it. */
export const DOC_PAGES: DocPage[] = [
  {
    href: '/docs',
    title: 'Quick start',
    group: 'Get started',
    sections: [
      s('install', 'Install the skill'),
      s('ask', 'Ask for a diagram'),
      s('open', 'Open the file'),
      s('write', 'What the agent writes'),
      s('repair', 'When something is wrong'),
      s('next', 'Next steps'),
    ],
  },
  {
    href: '/docs/viewer',
    title: 'The viewer',
    group: 'Get started',
    sections: [
      s('try', 'Try it'),
      s('share', 'Share a view'),
      s('present', 'Present and focus'),
      s('export', 'Export'),
      s('keys', 'Keyboard'),
      s('themes', 'Themes and motion'),
    ],
  },
  ...DIAGRAM_KINDS.map((k): DocPage => ({ href: kindHref(k), title: KIND_LABELS[k], group: 'Diagram kinds', sections: KIND_SECTIONS })),
  {
    href: '/docs/cli',
    title: 'The CLI',
    group: 'Reference',
    sections: [
      s('run', 'Run it'),
      s('validate', 'validate'),
      s('deliver', 'deliver'),
      s('serve', 'serve'),
      s('options', 'Options'),
      s('diagnostics', 'Diagnostics'),
      s('codes', 'Diagnostic codes'),
      s('exit', 'Exit codes'),
    ],
  },
  {
    href: '/docs/schema',
    title: 'Schema',
    group: 'Reference',
    sections: [
      s('diagram', 'Diagram'),
      s('nodes', 'Nodes'),
      s('cards', 'Cards'),
      s('card-parts', 'Card parts'),
      s('evidence', 'Evidence'),
      s('source', 'Source links'),
      s('edges', 'Connections'),
      s('groups', 'Groups'),
      s('lanes', 'Lanes'),
      s('phases', 'Phases'),
      s('views', 'Views'),
      s('notes', 'Notes'),
    ],
  },
  { href: '/docs/brands', title: 'Brand slugs', group: 'Reference', sections: [] },
];

export const DOC_GROUPS: DocGroup[] = ['Get started', 'Diagram kinds', 'Reference'];

export function docPage(href: string): DocPage {
  const page = DOC_PAGES.find((p) => p.href === href);
  if (!page) throw new Error(`no docs page ${href}`);
  return page;
}

/** The pages either side; the last page leads on to the examples. */
export function neighbours(href: string): { prev?: { href: string; title: string }; next?: { href: string; title: string } } {
  const i = DOC_PAGES.findIndex((p) => p.href === href);
  const prev = DOC_PAGES[i - 1];
  const next = DOC_PAGES[i + 1] ?? { href: '/examples', title: 'Examples' };
  return { prev: prev && { href: prev.href, title: prev.title }, next: { href: next.href, title: next.title } };
}
