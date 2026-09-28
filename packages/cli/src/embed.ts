import type { LaidOutDiagram } from '@stackmap/core';

/** The block the viewer template ships empty; the viewer reads it back by id. */
export const EMPTY_DATA_BLOCK = '<script type="application/json" id="stackmap-data"></script>';

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// `<` is the only character that can end a script element or start `<!--`; U+2028/9 are escaped so the
// block is also valid JS source should anything ever eval it.
const [LS, PS] = [String.fromCharCode(0x2028), String.fromCharCode(0x2029)];
const toScriptJson = (value: unknown) =>
  JSON.stringify(value).replace(/</g, '\\u003c').replaceAll(LS, '\\u2028').replaceAll(PS, '\\u2029');

export function embedDiagram(template: string, diagram: LaidOutDiagram): string {
  const parts = template.split(EMPTY_DATA_BLOCK);
  if (parts.length !== 2) throw new Error('viewer template must contain exactly one empty stackmap-data block');
  const block = EMPTY_DATA_BLOCK.replace('></script>', `>${toScriptJson(diagram)}</script>`);
  const title = `<title>${escapeHtml(diagram.draft.title)} · stackmap</title>`;
  // Function replacers: a `$` in diagram text must not be read as a replacement pattern.
  return parts[0]!.replace(/<title>[^<]*<\/title>/, () => title) + block + parts[1]!;
}
