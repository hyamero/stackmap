import type { LaidOutDiagram } from '@stackmap/core';
import { toScene } from '@stackmap/viewer/src/canvas/scene';
import { Still } from '@/components/diagram/Still';
import { stillOf } from '@/lib/diagrams';
import { viewerTweens } from '../drops';
import { LazyViewer } from '../LazyViewer';
import { s } from '../style';
import { TWEENS } from './timelines';

// The plane the cards drop onto, inside the viewer's stage (the board's .plane-wrap).
const PLANE = { width: 734, height: 656 };

/** #viewer, "Lights on": the demo lands on a tilted map, flattens, and becomes the real viewer. */
export function Viewer({ demo }: { demo: LaidOutDiagram }) {
  const { content } = toScene(demo);
  const k = Math.min(1, PLANE.width / content.width, PLANE.height / content.height);
  const timelines = JSON.stringify(viewerTweens(demo, TWEENS)).replace(/</g, '\\u003c');
  return (
    <section className="scn" id="viewer" data-scene="viewer" data-runway="2.4" data-fw="1440" data-fh="900" data-theme-sec="light" style={s({ height: '900px' })} aria-label="The viewer" data-theme="dark">
      <script type="application/json" data-timelines="" dangerouslySetInnerHTML={{ __html: timelines }} />
      <div className="stage" data-stage="">
        <div className="frame" data-frame="" style={s({ width: '1440px', height: '900px' })}>
          <svg className="v-route-dark" width="1440" height="900" viewBox="0 0 1440 900" aria-hidden="true">
            <path d="M 56 -1200 V 0" />
            <path data-route="viewer" data-r0="0" data-r1="0.97" data-head="h-viewer-d" d="M 56 0 V 900" pathLength="1" />
            <g className="rhead" data-route-head="h-viewer-d">
              <circle r="9" className="rh-halo" />
              <circle r="3.25" className="rh-core" />
            </g>
          </svg>
          <p className="drop-title t-section dt-dark" aria-hidden="true">
            No coordinates. stackmap lays it out.
          </p>
          <div className="lights a-lights" data-theme="light">
            <div className="lights-in">
              <svg className="v-route" width="1440" height="900" viewBox="0 0 1440 900" aria-hidden="true">
                <path d="M 56 -1200 V 0" />
                <path data-route="viewer" data-r0="0" data-r1="0.97" data-head="h-viewer" d="M 56 0 V 900" pathLength="1" />
                <path data-route="viewer" data-r0="0.97" data-r1="1" d="M 56 900 V 2100" pathLength="1" />
                <g className="rhead" data-route-head="h-viewer">
                  <circle r="9" className="rh-halo" />
                  <circle r="3.25" className="rh-core" />
                </g>
              </svg>
              <p className="drop-title t-section a-dtitle" aria-hidden="true">
                No coordinates. stackmap lays it out.
              </p>
              <div className="vw" id="viewer-demo">
                <div className="vintro" aria-hidden="true">
                  <div className="vstage a-vstage">
                    <div className="grid-bg" />
                  </div>
                  <div className="vclip a-vclip">
                    <div className="vcam">
                      <div className="plane-wrap">
                        <div className="plane a-plane">
                          <div className="plane-grid grid-bg a-pgrid" />
                          <div className="plane-dg" style={s({ transform: `translate(-50%, 0) scale(${k})` })}>
                            <Still still={stillOf('demo')} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="vreal">
                  <LazyViewer diagram={demo} still={stillOf('demo')} width={1248} height={800} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
