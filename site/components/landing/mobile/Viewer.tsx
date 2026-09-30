import type { LaidOutDiagram } from '@stackmap/core';
import { toScene } from '@stackmap/viewer/src/canvas/scene';
import { StaticScene } from '@/components/diagram/StaticScene';
import { viewerTweens } from '../drops';
import { LazyViewer } from '../LazyViewer';
import { s } from '../style';
import { TWEENS } from './timelines';

// The phone's plane (the board's .plane-wrap) and the box the real viewer takes over.
const PLANE = { width: 359, height: 321 };
const VIEWER = { left: 20, top: 76, width: 350, height: 570 };

/** #viewer on a phone: the same drop, flatten and hand-over, in one column. */
export function Viewer({ demo }: { demo: LaidOutDiagram }) {
  const { content } = toScene(demo);
  const k = Math.min(1, PLANE.width / content.width, PLANE.height / content.height);
  const timelines = JSON.stringify(viewerTweens(demo, TWEENS)).replace(/</g, '\\u003c');
  const route = (head: string) => (
    <svg className="m-route" width="390" height="844" viewBox="0 0 390 844" aria-hidden="true">
      <path d="M 10 -1200 V 0" />
      <path data-route="viewer" data-r0="0" data-r1="0.97" data-head={head} d="M 10 0 V 844" pathLength="1" />
      <path data-route="viewer" data-r0="0.97" data-r1="1" d="M 10 844 V 2044" pathLength="1" />
      <g className="rhead" data-route-head={head}>
        <circle r="9" className="rh-halo" />
        <circle r="3.25" className="rh-core" />
      </g>
    </svg>
  );
  return (
    <section className="scn" data-anchor="viewer" data-scene="viewer" data-runway="2" data-fw="390" data-fh="844" data-theme-sec="light" style={s({ height: '844px' })} aria-label="The viewer" data-theme="dark">
      <script type="application/json" data-timelines="" dangerouslySetInnerHTML={{ __html: timelines }} />
      <div className="stage" data-stage="">
        <div className="frame" data-frame="" style={s({ width: '390px', height: '844px' })}>
          {route('h-viewer-d')}
          <p className="drop-title dt-dark" aria-hidden="true">
            No coordinates. stackmap lays it out.
          </p>
          <div className="lights a-lights" data-theme="light">
            <div className="lights-in">
              {route('h-viewer')}
              <p className="drop-title a-dtitle" aria-hidden="true">
                No coordinates. stackmap lays it out.
              </p>
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
                          <StaticScene diagram={demo} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="vreal" style={s({ left: `${VIEWER.left}px`, top: `${VIEWER.top}px`, width: `${VIEWER.width}px`, height: `${VIEWER.height}px`, right: 'auto', bottom: 'auto' })}>
                <LazyViewer diagram={demo} width={VIEWER.width} height={VIEWER.height} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
