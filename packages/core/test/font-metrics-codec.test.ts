import { describe, expect, it } from 'vitest';
import { decodeKerning, decodePairs, encodeKerning, encodePairs } from '../src/font-metrics-codec';

const pair = (a: string, b: string) => a.charCodeAt(0) * 0x10000 + b.charCodeAt(0);

describe('font-metrics codec', () => {
  it('round-trips pairs whose characters are the separator, digits, a minus sign or need escaping', () => {
    const pairs = { [pair('A', 'V')]: -40.5, [pair(',', ',')]: 3, [pair('7', '1')]: -12, [pair('-', '-')]: 0.5, [pair('"', '\\')]: 237 };
    expect(decodePairs(JSON.parse(JSON.stringify(encodePairs(pairs))))).toEqual(pairs);
    expect(decodePairs('')).toEqual({});
  });

  it('stores a face that is another minus some pairs as that face plus the dropped pairs', () => {
    const full = { [pair('A', 'V')]: -40, [pair('1', '1')]: -8, [pair('T', 'o')]: -30 };
    const tnum = { [pair('A', 'V')]: -40, [pair('T', 'o')]: -30 };
    const enc = encodeKerning({ full, tnum, empty: {} });
    expect(enc.tnum).toEqual({ base: 'full', drop: '11' });
    expect(enc.empty).toBe('');
    expect(decodeKerning(enc, 'tnum')).toEqual(tnum);
    expect(decodeKerning(enc, 'full')).toEqual(full);
  });

  it('keeps a face standalone when a shared pair differs', () => {
    const enc = encodeKerning({ a: { [pair('A', 'V')]: -40, [pair('T', 'o')]: -30 }, b: { [pair('A', 'V')]: -41 } });
    expect(typeof enc.b).toBe('string');
  });
});
