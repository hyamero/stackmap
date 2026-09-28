import type { LaidOutDiagram } from '@stackmap/core';

/** `stackmap deliver` fills this element of the built template with the laid-out diagram. */
export const DATA_ELEMENT_ID = 'stackmap-data';

export function readEmbeddedDiagram(doc: Document): LaidOutDiagram | null {
  const text = doc.getElementById(DATA_ELEMENT_ID)?.textContent?.trim();
  if (!text) return null;
  try {
    return JSON.parse(text) as LaidOutDiagram;
  } catch (cause) {
    throw new Error('The embedded diagram data is not valid JSON; re-run `stackmap deliver`.', { cause });
  }
}
