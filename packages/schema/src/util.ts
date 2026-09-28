/** RFC 6901 JSON pointer. */
export const pointer = (path: readonly PropertyKey[]): string =>
  path.map((p) => `/${String(p).replaceAll('~', '~0').replaceAll('/', '~1')}`).join('');

export function levenshtein(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length]!;
}

/** Up to `n` candidates closest to `target`, nearest first, ties in candidate order; only plausible matches. */
export function closest(target: string, candidates: Iterable<string>, n = 3): string[] {
  // Short keys are one or two edits from almost anything (`id` → `kind`), so they only match on one.
  const max = target.length <= 4 ? 1 : Math.max(2, Math.floor(target.length / 3));
  return [...new Set(candidates)]
    .map((c, i) => ({ c, i, d: levenshtein(target.toLowerCase(), c.toLowerCase()) }))
    .filter((x) => x.d <= max)
    .sort((a, b) => a.d - b.d || a.i - b.i)
    .slice(0, n)
    .map((x) => x.c);
}

/** A lowercase id derived from arbitrary text, for "use this id instead" fixes. */
export const toId = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^[-_]+|-+$/g, '') || 'id';
