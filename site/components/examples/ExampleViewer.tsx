'use client';

import { Link2 } from 'lucide-react';
import type { LaidOutDiagram } from '@stackmap/core';
import { useExplore } from '@stackmap/viewer/src/explore/ExploreContext';
import { formatHash } from '@stackmap/viewer/src/explore/state';
import type { StaticDiagram } from '@/lib/data/static-html';
import { EmbeddedViewer } from '@/components/viewer/EmbeddedViewer';

function Address() {
  const { state } = useExplore();
  return (
    <p className="exp-url">
      <span className="u mono">
        <Link2 size={14} strokeWidth={1.75} aria-hidden="true" />
        <span>
          diagram.html<b>{formatHash(state) || '#'}</b>
        </span>
      </span>
      <span className="u-n">The link keeps the view, selection, route and playback.</span>
    </p>
  );
}

/** One example in the real viewer at the page's full width, with the address the delivered file would show. */
export function ExampleViewer({ diagram, still }: { diagram: LaidOutDiagram; still: StaticDiagram }) {
  return (
    <div className="exp-v">
      <EmbeddedViewer diagram={diagram} still={still}>
        <Address />
      </EmbeddedViewer>
    </div>
  );
}
