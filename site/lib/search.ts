export type EntryKind = 'page' | 'section' | 'example' | 'command' | 'key' | 'field' | 'code';

export interface SearchEntry {
  title: string;
  /** "<page> · <where>"; the part before the dot groups the results */
  context: string;
  href: string;
  kind: EntryKind;
  /** more words it answers to */
  words: string;
  /** shown before anything is typed */
  suggested?: true;
}

const RANK: Record<EntryKind, number> = { page: 0, section: 1, example: 2, command: 3, key: 4, field: 5, code: 6 };

export const groupOf = (e: SearchEntry) => e.context.split(' · ')[0]!;

/**
 * Every word must appear; then a title that is the query, one that starts with it, one that has it, and the rest,
 * pages before sections before fields. At most twelve, grouped by page in the order each page's best result ranks.
 */
export function search(index: SearchEntry[], q: string): SearchEntry[] {
  const query = q.trim().toLowerCase();
  if (!query) return index.filter((e) => e.suggested).slice(0, 8);
  const words = query.split(/\s+/);
  const hits: [number, number, number][] = [];
  index.forEach((e, i) => {
    const title = e.title.toLowerCase();
    // A field matches on its name and notes; its page is context, not content.
    const hay = `${e.title} ${e.kind === 'field' ? '' : e.context} ${e.words}`.toLowerCase();
    if (!words.every((w) => hay.includes(w))) return;
    const score = title === query ? 0 : title.startsWith(query) ? 1 : title.includes(query) ? 2 : 3;
    hits.push([score, RANK[e.kind], i]);
  });
  hits.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
  const groups = new Map<string, SearchEntry[]>();
  for (const [, , i] of hits.slice(0, 12)) {
    const e = index[i]!;
    const g = groupOf(e);
    groups.set(g, [...(groups.get(g) ?? []), e]);
  }
  return [...groups.values()].flat();
}
