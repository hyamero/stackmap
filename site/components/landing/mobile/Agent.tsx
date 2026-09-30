import { SITE } from '@/lib/site-data';
import { s } from '../style';

export function Agent() {
  return (
    <>
      <section
        className="scn"
        data-anchor="agent"
        data-scene="agent"
        data-runway="2.2"
        data-fw="390"
        data-fh="844"
        data-theme-sec="dark"
        style={s({ height: '844px' })}
        aria-label="Ask your coding agent"
        data-theme="dark"
      >
        <div className="stage" data-stage="">
          <div className="frame" data-frame="" style={s({ width: '390px', height: '844px' })}>
            <h2 className="sr">Ask your coding agent. It writes the JSON, stackmap checks it and delivers one file.</h2>
            <svg className="m-route" width="390" height="844" viewBox="0 0 390 844" aria-hidden="true">
              <path d="M 380 -1200 V 0" />
              <path className="s3-base" d="M 380 0 V 482 Q 380 494 368 494 H 22 Q 10 494 10 506 V 844" />
              <path
                data-route="agent"
                data-r0="0"
                data-r1="0.97"
                data-head="h-agent"
                d="M 380 0 V 482 Q 380 494 368 494 H 22 Q 10 494 10 506 V 844"
                pathLength="1"
              />
              <g className="rhead" data-route-head="h-agent">
                <circle r="9" className="rh-halo" />
                <circle r="3.25" className="rh-core" />
              </g>
              <path data-route="agent" data-r0="0.97" data-r1="1" d="M 10 844 V 2044" pathLength="1" />
            </svg>
            <div className="term pnl a-term">
              <div className="term-h mono">~/commerce-api</div>
              <div className="term-b mono">
                <span className="tp a-tp">
                  <span className="c">› </span>Make an architecture diagram of this repository, backed by evidence from the code.
                </span>
                <span className="tl-row a-tr0">
                  <span className="t-ink">writing</span> diagram.json
                </span>
                <span className="tl-row a-tr1">
                  <b>stackmap</b> · validate
                </span>
                <span className="tl-row row-err a-tr2">
                  <span className="t-err">error</span> refs/unknown-node
                </span>
                <span className="tl-row row-err a-tr3"> Unknown node "orders-db"</span>
                <span className="tl-row a-tr4"> fix: use "orders"</span>
                <span className="tl-row a-tr5">
                  <b>stackmap</b> · validate
                </span>
                <span className="tl-row row-ok a-tr6">
                  <span className="t-ok">✓ valid: no diagnostics</span>
                </span>
                <span className="tl-row a-tr7">
                  <b>stackmap</b> · deliver
                </span>
                <span className="tl-row row-del a-tr8">
                  delivered <span className="acc">diagram.html</span>
                </span>
              </div>
            </div>
            <p className="bigp mono a-bigp" aria-hidden="true">
              <span className="bigp-c">›</span>
              <span className="ty a-ty0" style={s({ width: '20ch' })}>
                Make an architecture
              </span>
              <span className="ty a-ty1" style={s({ width: '15ch' })}>
                diagram of this
              </span>
              <span className="ty a-ty2" style={s({ width: '21ch' })}>
                repository, backed by
              </span>
              <span className="ty a-ty3" style={s({ width: '23ch' })}>
                evidence from the code.
              </span>
            </p>
            <ol className="steps">
              <li className="step a-st0">
                <span className="mono s-n">01</span>
                <h3>Ask.</h3>
                <p>Your coding agent, for a codebase, system, process or request.</p>
              </li>
              <li className="step a-st1">
                <span className="mono s-n">02</span>
                <h3>It writes JSON.</h3>
                <p>Nodes, connections, groups and views. No coordinates.</p>
              </li>
              <li className="step a-st2">
                <span className="mono s-n">03</span>
                <h3>stackmap checks it.</h3>
                <p>Each problem comes with a code and the allowed fixes.</p>
              </li>
              <li className="step a-st3">
                <span className="mono s-n">04</span>
                <h3>One file comes back.</h3>
                <p>deliver lays it out as one offline HTML viewer.</p>
              </li>
            </ol>
          </div>
        </div>
      </section>
    </>
  );
}
