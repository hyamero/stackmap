import { DIAGRAM_KINDS, type DiagramKind, type LaidOutDiagram } from '@stackmap/core';
import { NodeCard } from '@stackmap/viewer/src/card/NodeCard';
import { StepCard } from '@stackmap/viewer/src/card/StepCard';
import { Still } from '@/components/diagram/Still';
import { stillOf } from '@/lib/diagrams';
import { KindFlow } from './KindFlow';
import { kindsGeometry, kindsTweens, restingFlow, type Area } from './kinds-geometry';
import { s } from './style';

const px = (n: number) => `${Math.round(n * 10) / 10}px`;

/**
 * One checkout, five ways: each kind's layer (its lanes, phases and connections) plus the card slots that
 * glide between kinds. At rest the scene's data-kind picks what shows; scrolling plays the tweens it carries,
 * and each kind's flow in its hold.
 */
export function KindsStage({ checkout, area, root }: { checkout: Record<string, LaidOutDiagram>; area: Area; root: string }) {
  const g = kindsGeometry(checkout, area);
  const at = (kind: DiagramKind) => `${root} [data-kind="${kind}"]`;
  const restRules = DIAGRAM_KINDS.flatMap((kind, k) => [
    `${at(kind)} .kl${k}, ${at(kind)} .kdef${k} {opacity:1}`,
    `${at(kind)} .kcam {transform:scale(${g.layers[k]!.cam})}`,
    `${at(kind)} .kn-col {transform:translateY(${-260 * k}px)}`,
    ...g.slots.map((faces, i) => {
      const f = faces[k];
      const r = (f ?? faces.find(Boolean)!).rect;
      return `${at(kind)} .ks${i} {left:${px(r.x)};top:${px(r.y)};width:${px(r.width)};height:${px(r.height)};opacity:${f ? 1 : 0}}${f ? `${at(kind)} .kf${i}_${k} {opacity:1}` : ''}`;
    }),
  ]);
  // Escaping `<` keeps the JSON from closing its script early.
  const timelines = JSON.stringify(kindsTweens(g)).replace(/</g, '\\u003c');
  return (
    <div className="kstage" aria-hidden="true">
      <style>{restRules.join('\n')}</style>
      <script type="application/json" data-timelines="" dangerouslySetInnerHTML={{ __html: timelines }} />
      <div className="kcam" style={s({ transformOrigin: `${area.cx}px ${area.cy}px` })}>
        {g.layers.map((l, k) => (
          <div key={l.kind} className={`klayer kl${k}`} style={s({ left: px(l.left), top: px(l.top), transform: `scale(${g.scale})` })}>
            <Still still={stillOf(`checkout/${l.kind}`)} />
            <KindFlow data={restingFlow(l.diagram)} k={k} />
          </div>
        ))}
        {g.slots.map((faces, i) => (
          <div key={i} className={`kslot ks${i}`}>
            {faces.map((f, k) =>
              f ? (
                <span key={k} className={`kface kf${i}_${k}`}>
                  <span className="kface-in" style={s({ position: 'absolute', left: '0', top: '0', width: px(f.card.rect.width), height: px(f.card.rect.height), transform: `scale(${g.scale})` })}>
                    {f.compact ? <StepCard node={f.card.node} final={f.card.final} /> : <NodeCard node={f.card.node} />}
                  </span>
                </span>
              ) : null,
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
