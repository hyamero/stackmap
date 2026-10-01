import type { CSSProperties, ReactNode } from 'react';
import { Check, Link2 } from 'lucide-react';
import type { NodeType } from '@stackmap/core';
import { BrandIcon } from '@stackmap/viewer/src/icons/BrandIcon';
import { TypeIcon } from '@stackmap/viewer/src/icons/TypeIcon';
import type { Receipt } from '@/lib/data/receipt';

const tint = (type: NodeType) =>
  ({ '--f': `var(--sm-${type}-fill)`, '--b': `var(--sm-${type}-border)`, '--t': `var(--sm-${type}-tile)`, '--a': `var(--sm-${type}-accent)` }) as CSSProperties;

// A card drawn as the viewer draws one, at the proof card's size.
function MiniCard({ type, brand, title, subtitle }: { type: NodeType; brand?: string; title: string; subtitle: string }) {
  return (
    <span className="tc-card" style={tint(type)}>
      <span className="tile">{brand ? <BrandIcon slug={brand} size={17} /> : <TypeIcon type={type} size={17} />}</span>
      <span className="tc-tx">
        <span className="ct">{title}</span>
        <span className="cs">{subtitle}</span>
      </span>
    </span>
  );
}

function Card({ d, visual, title, children }: { d: number; visual: ReactNode; title: string; children: ReactNode }) {
  return (
    <article className="tc" data-reveal="" style={{ ['--d' as string]: `${d}ms` }}>
      <div className="tc-v" aria-hidden="true">
        {visual}
      </div>
      <h3 className="t-h3">{title}</h3>
      <p>{children}</p>
    </article>
  );
}

const K = ({ children }: { children: string }) => <span className="j-k">&quot;{children}&quot;</span>;
const S = ({ children }: { children: string }) => <span className="j-s">&quot;{children}&quot;</span>;

/** #trust: evidence, no coordinates, deterministic output, one shareable file. */
export function Proof({ receipt }: { receipt: Receipt }) {
  const line = (
    <span className="rc">
      <span className="mono t-dim">$ stackmap deliver diagram.json</span>
      <span className="mono">
        delivered · sha256 <b>{receipt.sha256.slice(0, 12)}…</b> · {receipt.bytes} bytes
      </span>
    </span>
  );
  return (
    <section className="sec trust" id="trust" aria-labelledby="trust-h">
      <div className="wrap">
        <header className="sec-h" data-reveal="">
          <p className="eyebrow">Built to be checked</p>
          <h2 className="t-h2" id="trust-h">
            <span className="ln">Made to be checked,</span> <span className="ln">and easy to share.</span>
          </h2>
          <p className="t-lede">Every card can cite its source, the same JSON always builds the same file, and that file opens anywhere.</p>
        </header>
        <div className="t-grid">
          <Card
            d={0}
            title="Evidence on the card."
            visual={
              <>
                <div className="tv-row">
                  <MiniCard type="service" title="shop-api" subtitle="REST API" />
                  <span className="tv-arrow" />
                  <div className="tv-insp">
                    <p className="tv-h">Evidence</p>
                    <code className="ev-at">services/api/src/server.ts:12</code>
                  </div>
                </div>
                <div className="tv-row">
                  <MiniCard type="database" brand="postgresql" title="Orders DB" subtitle="PostgreSQL" />
                  <span className="tv-arrow" />
                  <div className="tv-insp">
                    <p className="tv-h">Evidence</p>
                    <code className="ev-at">infra/orders/postgres.tf:12</code>
                  </div>
                </div>
              </>
            }
          >
            A node can cite the file and line it came from. Select it and the inspector shows where.
          </Card>
          <Card
            d={60}
            title="No coordinates."
            visual={
              <>
                <pre className="mono">
                  {'{\n  '}
                  <K>id</K>: <S>orders</S>
                  {',\n  '}
                  <K>type</K>: <S>database</S>
                  {',\n  '}
                  <K>group</K>: <S>data</S>
                  {',\n  '}
                  <K>card</K>
                  {': { '}
                  <K>title</K>: <S>Orders DB</S>
                  {' }\n}'}
                </pre>
                <p className="tv-note mono">no x · no y · no width</p>
              </>
            }
          >
            The agent names nodes, connections, groups and views. ELK lays out architecture and dataflow; stackmap lays out lanes and lifelines.
          </Card>
          <Card
            d={120}
            title="The same bytes, every time."
            visual={
              <>
                {line}
                {line}
                <span className="tv-same">
                  <Check size={14} strokeWidth={2} />
                  <span>Byte for byte</span>
                </span>
              </>
            }
          >
            <code>deliver</code> is deterministic: the same <code>diagram.json</code> always gives the same <code>diagram.html</code>.
          </Card>
          <Card
            d={180}
            title="One file, and the link keeps the view."
            visual={
              <>
                <span className="tv-url mono">
                  <Link2 size={14} strokeWidth={1.75} className="ic" />
                  <span>
                    diagram.html<b>#view=checkout&amp;node=api&amp;play=1</b>
                  </span>
                </span>
                <span className="tv-fmts">
                  {['PNG', 'JPEG', 'WebP', 'SVG', 'Video'].map((f) => (
                    <span key={f} className="pill-f">
                      {f}
                    </span>
                  ))}
                </span>
              </>
            }
          >
            No server, no account, nothing to install to open it. The URL keeps the view, selection, route and playback.
          </Card>
        </div>
      </div>
    </section>
  );
}
