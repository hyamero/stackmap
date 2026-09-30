import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { LaidOutDiagram, Rect } from '@stackmap/core';
import { toScene } from '../../../packages/viewer/src/canvas/scene';
import { StaticScene } from '../../../packages/viewer/src/canvas/StaticScene';

export interface StaticDiagram {
  html: string;
  /** the drawn content's box, which the page scales the HTML to fit */
  box: Rect;
  title: string;
  nodes: number;
  edges: number;
}

// A diagram that never changes is rendered here once, so pages ship its HTML and none of the viewer's code.
export function staticDiagram(d: LaidOutDiagram): StaticDiagram {
  return {
    html: renderToStaticMarkup(createElement(StaticScene, { diagram: d })),
    box: toScene(d).content,
    title: d.draft.title,
    nodes: d.draft.nodes.length,
    edges: d.draft.edges.length,
  };
}
