import type { StaticDiagram } from '@/lib/data/static-html';

/** A diagram pre-rendered at build time, at its natural size. */
export function Still({ still }: { still: StaticDiagram }) {
  return <div dangerouslySetInnerHTML={{ __html: still.html }} />;
}
