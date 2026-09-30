import type { LaidOutDiagram } from '@stackmap/core';

/** The block the viewer template ships empty; the viewer reads it back by id. */
export const EMPTY_DATA_BLOCK = '<script type="application/json" id="stackmap-data"></script>';
/** The template carries every brand mark as data (~170 KB); a delivered file keeps the ones it draws. */
export const BRANDS_BLOCK_ID = 'stackmap-brands';
const BRANDS_OPEN = `<script type="application/json" id="${BRANDS_BLOCK_ID}">`;

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// `<` is the only character that can end a script element or start `<!--`; U+2028/9 are escaped so the
// block is also valid JS source should anything ever eval it.
const [LS, PS] = [String.fromCharCode(0x2028), String.fromCharCode(0x2029)];
const toScriptJson = (value: unknown) =>
  JSON.stringify(value).replace(/</g, '\\u003c').replaceAll(LS, '\\u2028').replaceAll(PS, '\\u2029');

export function embedDiagram(template: string, diagram: LaidOutDiagram): string {
  const parts = template.split(EMPTY_DATA_BLOCK);
  if (parts.length !== 2) throw new Error('viewer template must contain exactly one empty stackmap-data block');
  // Concatenation only: String#replace would expand `$&`, `$'` etc. inside diagram text.
  const block = `${EMPTY_DATA_BLOCK.slice(0, -'</script>'.length)}${toScriptJson(diagram)}</script>`;
  // The title lives in <head>; the inlined bundle further down also contains "<title>" literals.
  const headEnd = parts[0]!.indexOf('</head>');
  const head = headEnd < 0 ? '' : parts[0]!.slice(0, headEnd);
  const titleAt = head.search(/<title>[^<]*<\/title>/);
  if (titleAt < 0) throw new Error('viewer template must have a <title> in its <head>');
  const titleEnd = head.indexOf('</title>', titleAt) + '</title>'.length;
  const title = `<title>${escapeHtml(diagram.draft.title)} · stackmap</title>`;
  return keepBrands(parts[0]!.slice(0, titleAt) + title + parts[0]!.slice(titleEnd) + block + parts[1]!, diagram);
}

function keepBrands(html: string, diagram: LaidOutDiagram): string {
  const start = html.indexOf(BRANDS_OPEN);
  if (start < 0) return html;
  const from = start + BRANDS_OPEN.length;
  const end = html.indexOf('</script>', from);
  const all = JSON.parse(html.slice(from, end)) as Record<string, unknown>;
  const used = new Set(diagram.draft.nodes.flatMap((n) => (n.card.brand ? [n.card.brand] : [])));
  const kept = Object.fromEntries(Object.entries(all).filter(([slug]) => used.has(slug)));
  return html.slice(0, from) + toScriptJson(kept) + html.slice(end);
}
