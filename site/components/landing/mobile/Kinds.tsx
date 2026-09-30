import { DIAGRAM_KINDS, KIND_LABELS, type LaidOutDiagram } from '@stackmap/core';
import { toScene } from '@stackmap/viewer/src/canvas/scene';
import { Still } from '@/components/diagram/Still';
import { stillOf } from '@/lib/diagrams';
import { KindCount } from '../KindCount';
import { KindFlow } from '../KindFlow';
import { crossfadeTweens, restingFlow } from '../kinds-geometry';
import { s } from '../style';

const REST = DIAGRAM_KINDS.indexOf('workflow');
const LINES = ['Components and what they call.', 'Data moving through stages.', 'Steps across owner lanes.', 'The states of one thing.', 'Messages over time.'];
// Where the diagrams sit on the 390 × 844 frame: each kind fits this box on its own, centred.
const AREA = { cx: 195, cy: 510, width: 384, height: 300 };

const px = (n: number) => `${Math.round(n * 10) / 10}px`;

/** #kinds on a phone: the checkout's five diagrams crossfade whole, no cards gliding between them. */
export function Kinds({ checkout }: { checkout: Record<string, LaidOutDiagram> }) {
  const layers = DIAGRAM_KINDS.map((kind) => {
    const diagram = checkout[kind]!;
    const { content } = toScene(diagram);
    const k = Math.min(AREA.width / content.width, AREA.height / content.height);
    return { kind, diagram, k, left: AREA.cx - (content.width * k) / 2, top: AREA.cy - (content.height * k) / 2 };
  });
  const at = (kind: string) => `.lp-m [data-kind="${kind}"]`;
  const rest = DIAGRAM_KINDS.map((kind, k) => `${at(kind)} .kl${k}, ${at(kind)} .kdef${k} {opacity:1}\n${at(kind)} .kn-col {transform:translateY(${-78 * k}px)}`).join('\n');
  const timelines = JSON.stringify(crossfadeTweens(DIAGRAM_KINDS.length)).replace(/</g, '\\u003c');
  return (
    <section
      className="scn"
      data-anchor="kinds"
      data-scene="kinds"
      data-kind={DIAGRAM_KINDS[REST]}
      data-runway="3.4"
      data-fw="390"
      data-fh="844"
      data-theme-sec="light"
      style={s({ height: '844px' })}
      aria-label="Five kinds of diagram"
      data-theme="light"
    >
      <style>{rest}</style>
      <script type="application/json" data-timelines="" dangerouslySetInnerHTML={{ __html: timelines }} />
      <div className="stage" data-stage="">
        <div className="frame" data-frame="" style={s({ width: '390px', height: '844px' })}>
          <h2 className="sr">Five kinds of diagram: architecture, dataflow, workflow, lifecycle and sequence.</h2>
          <svg className="m-route" width="390" height="844" viewBox="0 0 390 844" aria-hidden="true">
            <path d="M 10 -1200 V 0" />
            <path data-route="kinds" data-r0="0" data-r1="0.97" data-head="h-kinds" d="M 10 0 V 844" pathLength="1" />
            <path data-route="kinds" data-r0="0.97" data-r1="1" d="M 10 844 V 2044" pathLength="1" />
            <g className="rhead" data-route-head="h-kinds">
              <circle r="9" className="rh-halo" />
              <circle r="3.25" className="rh-core" />
            </g>
          </svg>
          <div className="kinds-h" aria-hidden="true">
            <div className="kn-col a-kname">
              {DIAGRAM_KINDS.map((k) => (
                <span key={k} className="kn">
                  {KIND_LABELS[k]}.
                </span>
              ))}
            </div>
          </div>
          <p className="kdefs" aria-hidden="true">
            {LINES.map((l, i) => (
              <span key={l} className={`kdef kdef${i} a-kline${i}`}>
                {l}
              </span>
            ))}
          </p>
          <KindCount rest={REST} total={DIAGRAM_KINDS.length} />
          <div aria-hidden="true">
            {layers.map((l, k) => (
              <div key={l.kind} className={`klayer kl${k}`} style={s({ left: px(l.left), top: px(l.top), transform: `scale(${l.k})` })}>
                <Still still={stillOf(`checkout/${l.kind}`)} />
                <KindFlow data={restingFlow(l.diagram, { glows: false })} k={k} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
