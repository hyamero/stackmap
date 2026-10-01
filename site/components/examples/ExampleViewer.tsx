'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Link2 } from 'lucide-react';
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

export interface Pager {
  /** "2 / 16" */
  at: string;
  prev: { href: string; title: string };
  next: { href: string; title: string };
}

/**
 * One example in the real viewer at the page's full width, with the address the delivered file would show. The
 * pager sits at the end of the view tabs' row.
 */
export function ExampleViewer({ diagram, still, pager }: { diagram: LaidOutDiagram; still: StaticDiagram; pager: Pager }) {
  return (
    <div className="exp-v">
      <nav className="pager pnl" aria-label="Previous and next example">
        <Link className="ib" href={pager.prev.href} aria-label={`Previous example: ${pager.prev.title}`}>
          <ArrowLeft size={17} strokeWidth={1.75} aria-hidden="true" />
        </Link>
        <span className="pos mono tnum">{pager.at}</span>
        <Link className="ib" href={pager.next.href} aria-label={`Next example: ${pager.next.title}`}>
          <ArrowRight size={17} strokeWidth={1.75} aria-hidden="true" />
        </Link>
      </nav>
      <EmbeddedViewer diagram={diagram} still={still}>
        <Address />
      </EmbeddedViewer>
    </div>
  );
}
