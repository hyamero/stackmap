import { KIND_LABELS } from '@stackmap/core';
import { Thumbnail } from '@/components/diagram/Thumbnail';
import { id, type Entry } from '@/lib/catalog';
import { diagramOf, stillOf } from '@/lib/diagrams';
import type { GalleryItem } from './Gallery';

/** Server side: each entry's laid-out diagram and its thumbnail, drawn here so the island ships no layout code. */
export function galleryProps(entries: Entry[]) {
  const items: GalleryItem[] = entries.map((e) => {
    const diagram = diagramOf(e);
    return { id: id(e), title: diagram.draft.title, kind: KIND_LABELS[e.kind], nodes: diagram.draft.nodes.length, edges: diagram.draft.edges.length, prompt: e.prompt, diagram };
  });
  const thumbs = Object.fromEntries(items.map((i) => [i.id, <Thumbnail key={i.id} diagram={i.diagram} />]));
  return { items, thumbs, rest: stillOf(`${entries[0]!.source}/${entries[0]!.key}`) };
}
