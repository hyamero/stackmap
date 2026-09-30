import { SITE } from '@/lib/site-data';
import { s } from '../style';

export function Agent() {
  return (
    <>
      <section
        className="scn"
        id="agent"
        data-scene="agent"
        data-runway="2.6"
        data-fw="1440"
        data-fh="900"
        data-theme-sec="dark"
        style={s({ height: '900px' })}
        aria-label="Ask your coding agent"
        data-theme="dark"
      >
        <div className="stage" data-stage="">
          <div className="frame" data-frame="" style={s({ width: '1440px', height: '900px' })}>
            <h2 className="sr">Ask your coding agent. It writes the JSON, stackmap checks it and delivers one file.</h2>
            <svg className="s3-route" width="1440" height="900" viewBox="0 0 1440 900" aria-hidden="true">
              <path d="M 1384 -1200 V 0" />
              <path className="base" d="M 1384 0 V 704 Q 1384 720 1368 720 H 72 Q 56 720 56 736 V 900" />
              <path
                data-route="agent"
                data-r0="0"
                data-r1="0.97"
                data-head="h-agent"
                d="M 1384 0 V 704 Q 1384 720 1368 720 H 72 Q 56 720 56 736 V 900"
                pathLength="1"
              />
              <path data-route="agent" data-r0="0.97" data-r1="1" d="M 56 900 V 2100" pathLength="1" />
              <g className="rhead" data-route-head="h-agent">
                <circle r="9" className="rh-halo" />
                <circle r="3.25" className="rh-core" />
              </g>
            </svg>
            <div className="term pnl a-term">
              <div className="term-h mono">~/commerce-api</div>
              <div className="term-b mono">
                <span className="tp a-tp">
                  <span className="c">› </span>Make an architecture diagram of this repository, backed by evidence from the code.
                </span>
                <span className="tl-row a-tr0">
                  <span className="t-ink">writing</span> <span className="t-ink">.stackmap/commerce-api/diagram.json</span>
                </span>
                <span className="tl-row a-tr1">
                  <b>stackmap</b> · <span className="t-ink">validate diagram.json</span>
                </span>
                <span className="tl-row row-err a-tr2">
                  <span className="t-err">error</span> refs/unknown-node /edges/6/to
                </span>
                <span className="tl-row row-err a-tr3"> Unknown node "orders-db"</span>
                <span className="tl-row a-tr4"> fix: use "orders"</span>
                <span className="tl-row a-tr5">
                  <span className="t-err">✗ 1 error</span>
                </span>
                <span className="tl-row a-tr6">
                  <b>stackmap</b> · <span className="t-ink">validate diagram.json</span>
                </span>
                <span className="tl-row row-ok a-tr7">
                  <span className="t-ok">✓ valid: no diagnostics</span>
                </span>
                <span className="tl-row a-tr8">
                  <b>stackmap</b> · <span className="t-ink">deliver diagram.json</span>
                </span>
                <span className="tl-row row-del a-tr9">
                  delivered <span className="acc">.stackmap/commerce-api/diagram.html</span>
                </span>
                <span className="tl-row row-del a-tr10">
                  {' '}
                  · sha256 {SITE.receipt.sha256.slice(0, 12)}… · {SITE.receipt.bytes} bytes
                </span>
              </div>
            </div>
            <div className="json a-json">
              <div className="json-h mono">diagram.json</div>
              <div className="json-b mono">
                <span className="j-row a-jr0">{'{'}</span>
                <span className="j-row a-jr1">
                  {' '}
                  "kind": <span className="j-s">"architecture"</span>,
                </span>
                <span className="j-row a-jr2">
                  {' '}
                  "title": <span className="j-s">"Commerce API"</span>,
                </span>
                <span className="j-row a-jr3"> "nodes": [</span>
                <span className="j-row a-jr4">
                  {' '}
                  {'{'} "id": <span className="j-s">"storefront"</span>, "type": <span className="j-t t-client">"client"</span> {'}'},
                </span>
                <span className="j-row a-jr5">
                  {' '}
                  {'{'} "id": <span className="j-s">"edge"</span>, "type": <span className="j-t t-gateway">"gateway"</span> {'}'},
                </span>
                <span className="j-row a-jr6">
                  {' '}
                  {'{'} "id": <span className="j-s">"api"</span>, "type": <span className="j-t t-service">"service"</span>,
                </span>
                <span className="j-row a-jr7"> "evidence": [</span>
                <span className="j-row a-jr8">
                  {' '}
                  {'{'} "file": <span className="j-s">"services/api/src/server.ts"</span>, "line": 12 {'}'}] {'}'},
                </span>
                <span className="j-row a-jr9">
                  {' '}
                  {'{'} "id": <span className="j-s">"orders"</span>, "type": <span className="j-t t-database">"database"</span>, "group":{' '}
                  <span className="j-s">"data"</span> {'}'},
                </span>
                <span className="j-row a-jr10">
                  {' '}
                  {'{'} "id": <span className="j-s">"events"</span>, "type": <span className="j-t t-queue">"queue"</span> {'}'},
                </span>
                <span className="j-row a-jr11"> …</span>
                <span className="j-row a-jr12"> ],</span>
                <span className="j-row a-jr13"> "edges": [</span>
                <span className="j-row a-jr14">
                  {' '}
                  {'{'} "id": <span className="j-s">"e-api-orders"</span>, "from": <span className="j-s">"api"</span>, "to":{' '}
                  <span className="j-s fixv">
                    <span className="fx-bad a-fxbad">"orders-db"</span>
                    <span className="fx-ok a-fxok">"orders"</span>
                  </span>{' '}
                  {'}'},
                </span>
                <span className="j-row a-jr15"> …</span>
                <span className="j-row a-jr16"> ]</span>
                <span className="j-row a-jr17">{'}'}</span>
              </div>
            </div>
            <div className="cw t-client a-fly0 fly" style={s({ left: '96px', top: '572px', width: '280px', height: '64px' })}>
              <span className="nc">
                <span className="nc-h">
                  <span className="tile">
                    <svg
                      className="ic"
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect width="20" height="14" x="2" y="3" rx="2" />
                      <line x1="8" x2="16" y1="21" y2="21" />
                      <line x1="12" x2="12" y1="17" y2="21" />
                    </svg>
                  </span>
                  <span className="nc-tx">
                    <span className="ct">Storefront</span>
                    <span className="cs">Next.js</span>
                  </span>
                </span>
              </span>
            </div>
            <div className="cw t-gateway a-fly1 fly" style={s({ left: '419px', top: '572px', width: '280px', height: '64px' })}>
              <span className="nc">
                <span className="nc-h">
                  <span className="tile">
                    <svg
                      className="ic"
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="16" y="16" width="6" height="6" rx="1" />
                      <rect x="2" y="16" width="6" height="6" rx="1" />
                      <rect x="9" y="2" width="6" height="6" rx="1" />
                      <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" />
                      <path d="M12 12V8" />
                    </svg>
                  </span>
                  <span className="nc-tx">
                    <span className="ct">Edge gateway</span>
                    <span className="cs">Public routing</span>
                  </span>
                </span>
              </span>
            </div>
            <div className="cw t-service a-fly2 fly" style={s({ left: '741px', top: '572px', width: '280px', height: '64px' })}>
              <span className="nc">
                <span className="nc-h">
                  <span className="tile">
                    <svg
                      className="ic"
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M10 4v4" />
                      <path d="M2 8h20" />
                      <path d="M6 4v4" />
                    </svg>
                  </span>
                  <span className="nc-tx">
                    <span className="ct">shop-api</span>
                    <span className="cs">REST API</span>
                  </span>
                </span>
              </span>
            </div>
            <div className="cw t-database a-fly3 fly" style={s({ left: '1064px', top: '572px', width: '280px', height: '64px' })}>
              <span className="nc">
                <span className="nc-h">
                  <span className="tile">
                    <svg
                      className="ic"
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <ellipse cx="12" cy="5" rx="9" ry="3" />
                      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
                      <path d="M3 12A9 3 0 0 0 21 12" />
                    </svg>
                  </span>
                  <span className="nc-tx">
                    <span className="ct">Orders DB</span>
                    <span className="cs">PostgreSQL</span>
                  </span>
                </span>
              </span>
            </div>
            <p className="bigp mono a-bigp" aria-hidden="true">
              <span className="bigp-c">›</span>
              <span className="ty a-ty0" style={s({ width: '28ch' })}>
                Make an architecture diagram
              </span>
              <span className="ty a-ty1" style={s({ width: '29ch' })}>
                of this repository, backed by
              </span>
              <span className="ty a-ty2" style={s({ width: '23ch' })}>
                evidence from the code.
              </span>
            </p>
            <ol className="steps">
              <li className="step a-st0">
                <i className="sdot a-sd0" aria-hidden="true"></i>
                <span className="mono s-n">01</span>
                <h3>Ask.</h3>
                <p>Ask your coding agent for a diagram of a codebase, a system, a process or a request.</p>
              </li>
              <li className="step a-st1">
                <i className="sdot a-sd1" aria-hidden="true"></i>
                <span className="mono s-n">02</span>
                <h3>It writes JSON.</h3>
                <p>A small typed diagram.json: nodes, connections, groups and views. No coordinates.</p>
              </li>
              <li className="step a-st2">
                <i className="sdot a-sd2" aria-hidden="true"></i>
                <span className="mono s-n">03</span>
                <h3>stackmap checks it.</h3>
                <p>validate names each problem with a code and the allowed fixes. The agent repairs what is named.</p>
              </li>
              <li className="step a-st3">
                <i className="sdot a-sd3" aria-hidden="true"></i>
                <span className="mono s-n">04</span>
                <h3>One file comes back.</h3>
                <p>deliver lays the diagram out and writes one self-contained HTML viewer.</p>
              </li>
            </ol>
          </div>
        </div>
      </section>
    </>
  );
}
