import { DIAGRAM_KINDS, KIND_LABELS, type LaidOutDiagram } from '@stackmap/core';
import { KindPills } from '../KindPills';
import { KindsStage } from '../KindsStage';
import { s } from '../style';

const REST = DIAGRAM_KINDS.indexOf('workflow');

const LINES = ['Components and what they call.', 'Data moving through stages.', 'Steps across owner lanes.', 'The states of one thing.', 'Messages over time.'];

/** #kinds: one checkout, five ways. At rest it shows the workflow, as the canvas does. */
export function Kinds({ checkout }: { checkout: Record<string, LaidOutDiagram> }) {
  return (
    <section
      className="scn"
      id="kinds"
      data-scene="kinds"
      data-kind={DIAGRAM_KINDS[REST]}
      data-runway="4.2"
      data-fw="1440"
      data-fh="900"
      data-theme-sec="light"
      style={s({ height: '900px' })}
      aria-label="Five kinds of diagram"
      data-theme="light"
    >
      <div className="stage" data-stage="">
        <div className="frame" data-frame="" style={s({ width: '1440px', height: '900px' })}>
          <h2 className="sr">Five kinds of diagram: architecture, dataflow, workflow, lifecycle and sequence.</h2>
          <svg className="k-route" width="1440" height="900" viewBox="0 0 1440 900" aria-hidden="true">
            <path d="M 56 -1200 V 0" />
            <path data-route="kinds" data-r0="0" data-r1="0.97" data-head="h-kinds" d="M 56 0 V 900" pathLength="1" />
            <path data-route="kinds" data-r0="0.97" data-r1="1" d="M 56 900 V 2100" pathLength="1" />
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
          <KindPills rest={REST} />
          <KindsStage checkout={checkout} area={{ cx: 720, cy: 640, width: 1248, height: 522 }} root=".lp-d" />
        </div>
      </div>
    </section>
  );
}
