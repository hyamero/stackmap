/** Pair adjustments in 1/1000 em, keyed by first * 0x10000 + second code point (both printable ASCII). */
export type KerningPairs = Record<number, number>;

/**
 * A face's kerning as shipped: each pair is its two characters, the adjustment, then a comma (about a third
 * of the size of an object literal). A face whose pairs are another's minus a few (tabular digits drop the
 * digit pairs) is stored as that face plus the dropped pairs, two characters each.
 */
export type EncodedKerning<F extends string = string> = string | { base: F; drop: string };

const key = (a: number, b: number) => a * 0x10000 + b;
const chars = (k: number) => String.fromCharCode(Math.floor(k / 0x10000), k % 0x10000);

export function encodePairs(pairs: KerningPairs): string {
  return Object.entries(pairs)
    .map(([k, v]) => `${chars(Number(k))}${v},`)
    .join('');
}

export function decodePairs(s: string): KerningPairs {
  const pairs: KerningPairs = {};
  for (let i = 0; i < s.length; ) {
    const end = s.indexOf(',', i + 2);
    pairs[key(s.charCodeAt(i), s.charCodeAt(i + 1))] = Number(s.slice(i + 2, end));
    i = end + 1;
  }
  return pairs;
}

export function encodeKerning<F extends string>(faces: Record<F, KerningPairs>): Record<F, EncodedKerning<F>> {
  const names = Object.keys(faces) as F[];
  const out = {} as Record<F, EncodedKerning<F>>;
  names.forEach((name, i) => {
    const pairs = faces[name];
    const keys = Object.keys(pairs);
    const base = names
      .slice(0, i)
      .find((b) => typeof out[b] === 'string' && keys.length > 0 && keys.every((k) => faces[b][Number(k)] === pairs[Number(k)]));
    out[name] = base
      ? {
          base,
          drop: Object.keys(faces[base])
            .filter((k) => !(k in pairs))
            .map((k) => chars(Number(k)))
            .join(''),
        }
      : encodePairs(pairs);
  });
  return out;
}

export function decodeKerning<F extends string>(faces: Record<F, EncodedKerning<F>>, face: F): KerningPairs {
  const enc = faces[face];
  if (typeof enc === 'string') return decodePairs(enc);
  const pairs = decodePairs(faces[enc.base] as string);
  for (let i = 0; i < enc.drop.length; i += 2) delete pairs[key(enc.drop.charCodeAt(i), enc.drop.charCodeAt(i + 1))];
  return pairs;
}
