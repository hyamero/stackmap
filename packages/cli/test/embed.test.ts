import { describe, expect, it } from 'vitest';
import type { LaidOutDiagram } from '@stackmap/core';
import { commerceApi } from '@stackmap/core/samples';
import { embedDiagram, EMPTY_DATA_BLOCK } from '../src/embed';

const template = `<!doctype html><html><head><title>stackmap</title></head><body><div id="root"></div>${EMPTY_DATA_BLOCK}</body></html>`;
const laidOut = (title: string): LaidOutDiagram => ({ draft: { ...commerceApi, title }, nodes: {}, groups: {}, edges: {}, bounds: { width: 0, height: 0 } });

const dataOf = (html: string) => {
  const m = html.match(/<script type="application\/json" id="stackmap-data">([\s\S]*?)<\/script>/);
  return m && JSON.parse(m[1]!);
};

describe('embedDiagram', () => {
  it('puts the diagram JSON in the data block and the title in <title>', () => {
    const html = embedDiagram(template, laidOut('Commerce API'));
    expect(dataOf(html)).toEqual(laidOut('Commerce API'));
    expect(html).toContain('<title>Commerce API · stackmap</title>');
  });

  it('no diagram text can close the script element or open a comment', () => {
    const evil = 'x</script><script>alert(1)</script><!-- \u2028\u2029';
    const html = embedDiagram(template, laidOut(evil));
    expect(html.match(/<\/script>/g)).toHaveLength(1);
    expect(html).not.toContain('<!--');
    expect(dataOf(html).draft.title).toBe(evil);
    expect(html).toContain('<title>x&lt;/script&gt;&lt;script&gt;alert(1)&lt;/script&gt;&lt;!-- \u2028\u2029 · stackmap</title>');
  });

  it.each(['Edge $& more', 'Tier $$ plan', "a $` b", "c $' d", '$1 $<n>'])('keeps replacement patterns literal: %s', (title) => {
    const html = embedDiagram(template, laidOut(title));
    expect(dataOf(html).draft.title).toBe(title);
    expect(html.match(/<script/g)).toHaveLength(1);
  });

  it('refuses a template without exactly one empty data block', () => {
    expect(() => embedDiagram('<html></html>', laidOut('T'))).toThrow(/template/);
    expect(() => embedDiagram(template + EMPTY_DATA_BLOCK, laidOut('T'))).toThrow(/template/);
    expect(() => embedDiagram(`<head></head><script>"<title>x</title>"</script>${EMPTY_DATA_BLOCK}`, laidOut('T'))).toThrow(/<title>/);
  });
});
