import { SITE } from '@/lib/site-data';
import { s } from '../style';

export function Files() {
  return (
    <>
      <section
        className="scn"
        id="files"
        data-scene="files"
        data-runway="2"
        data-fw="1440"
        data-fh="900"
        data-theme-sec="dark"
        style={s({ height: '900px' })}
        data-lit="0.0704"
        aria-label="One file. Opens anywhere."
        data-theme="dark"
      >
        <div className="stage" data-stage="">
          <div className="frame" data-frame="" style={s({ width: '1440px', height: '900px' })}>
            <p className="of-cap t-lede a-ofcap" aria-hidden="true">
              Everything you just explored is one file.
            </p>
            <svg className="f-route" width="1440" height="900" viewBox="0 0 1440 900" aria-hidden="true">
              <path d="M 56 -1200 V 0" />
              <path data-route="files" data-r0="0" data-r1="0.97" data-head="h-files" d="M 56 0 V 900" pathLength="1" />
              <path data-route="files" data-r0="0.97" data-r1="1" d="M 56 900 V 2100" pathLength="1" />
              <g className="rhead" data-route-head="h-files">
                <circle r="9" className="rh-halo" />
                <circle r="3.25" className="rh-core" />
              </g>
            </svg>
            <div className="fl-lights a-flights" aria-hidden="true" data-theme="light">
              <div className="fl-in">
                <p className="of-cap t-lede a-ofcap">Everything you just explored is one file.</p>
                <svg className="f-route" width="1440" height="900" viewBox="0 0 1440 900" aria-hidden="true">
                  <path d="M 56 -1200 V 0" />
                  <path data-route="files" data-r0="0" data-r1="0.97" data-head="h-files-l" d="M 56 0 V 900" pathLength="1" />
                  <path data-route="files" data-r0="0.97" data-r1="1" d="M 56 900 V 2100" pathLength="1" />
                  <g className="rhead" data-route-head="h-files-l">
                    <circle r="9" className="rh-halo" />
                    <circle r="3.25" className="rh-core" />
                  </g>
                </svg>
              </div>
            </div>
            <div className="file a-file" aria-hidden="true">
              <div className="file-in a-filein">
                <div className="face front" data-theme="light">
                  <span className="ff-t">Commerce API</span>
                  <span className="ff-s">Architecture · 11 nodes · 11 connections</span>
                  <div className="ff-map">
                    <svg width="288" height="340" viewBox="0 0 288 340" aria-hidden="true" className="mm">
                      <rect x="10" y="249.3" width="268" height="39.3" rx="3.9" className="mm-fr" />
                      <polyline points="138.2,69.9 138.2,90.7" className="mm-e" />
                      <polyline points="230.6,69.9 230.6,76.9 138.2,76.9 138.2,90.7" className="mm-e" />
                      <polyline points="138.2,109.2 138.2,130" className="mm-e" />
                      <polyline points="138.2,109.2 138.2,116.1 230.6,116.1 230.6,130" className="mm-e" />
                      <polyline points="230.6,148.5 230.6,155.4 184.4,155.4 184.4,169.3" className="mm-e" />
                      <polyline points="230.6,148.5 230.6,263.1" className="mm-e" />
                      <polyline points="230.6,148.5 230.6,234 144,234 144,263.1" className="mm-e" />
                      <polyline points="230.6,148.5 230.6,155.4 92,155.4 92,169.3" className="mm-e" />
                      <polyline points="92,187.8 92,208.6" className="mm-e" />
                      <polyline points="92,227 92,234 144,234 144,263.1" className="mm-e" />
                      <polyline points="92,227 92,234 57.4,234 57.4,263.1" className="mm-e" />
                      <rect x="97.8" y="51.5" width="80.9" height="18.5" rx="3.5" style={s({ fill: 'var(--sm-client-accent)' })} className="mm-c" />
                      <rect x="190.2" y="51.5" width="80.9" height="18.5" rx="3.5" style={s({ fill: 'var(--sm-client-accent)' })} className="mm-c" />
                      <rect x="97.8" y="90.7" width="80.9" height="18.5" rx="3.5" style={s({ fill: 'var(--sm-gateway-accent)' })} className="mm-c" />
                      <rect x="97.8" y="130" width="80.9" height="18.5" rx="3.5" style={s({ fill: 'var(--sm-security-accent)' })} className="mm-c" />
                      <rect x="190.2" y="130" width="80.9" height="18.5" rx="3.5" style={s({ fill: 'var(--sm-service-accent)' })} className="mm-c" />
                      <rect x="144" y="169.3" width="80.9" height="18.5" rx="3.5" style={s({ fill: 'var(--sm-external-accent)' })} className="mm-c" />
                      <rect x="190.2" y="263.1" width="80.9" height="18.5" rx="3.5" style={s({ fill: 'var(--sm-cache-accent)' })} className="mm-c" />
                      <rect x="103.6" y="263.1" width="80.9" height="18.5" rx="3.5" style={s({ fill: 'var(--sm-database-accent)' })} className="mm-c" />
                      <rect x="51.6" y="169.3" width="80.9" height="18.5" rx="3.5" style={s({ fill: 'var(--sm-queue-accent)' })} className="mm-c" />
                      <rect x="51.6" y="208.6" width="80.9" height="18.5" rx="3.5" style={s({ fill: 'var(--sm-service-accent)' })} className="mm-c" />
                      <rect x="16.9" y="263.1" width="80.9" height="18.5" rx="3.5" style={s({ fill: 'var(--sm-storage-accent)' })} className="mm-c" />
                    </svg>
                  </div>
                </div>
                <div className="face back">
                  <div className="fb-shot grid-bg">
                    <svg width="280" height="250" viewBox="0 0 280 250" aria-hidden="true" className="mm">
                      <rect x="14.5" y="199.2" width="250.9" height="36.8" rx="3.7" className="mm-fr" />
                      <polyline points="134.6,31.3 134.6,50.8" className="mm-e" />
                      <polyline points="221.1,31.3 221.1,37.8 134.6,37.8 134.6,50.8" className="mm-e" />
                      <polyline points="134.6,68.1 134.6,87.5" className="mm-e" />
                      <polyline points="134.6,68.1 134.6,74.6 221.1,74.6 221.1,87.5" className="mm-e" />
                      <polyline points="221.1,104.9 221.1,111.3 177.9,111.3 177.9,124.3" className="mm-e" />
                      <polyline points="221.1,104.9 221.1,212.2" className="mm-e" />
                      <polyline points="221.1,104.9 221.1,184.9 140,184.9 140,212.2" className="mm-e" />
                      <polyline points="221.1,104.9 221.1,111.3 91.3,111.3 91.3,124.3" className="mm-e" />
                      <polyline points="91.3,141.6 91.3,161.1" className="mm-e" />
                      <polyline points="91.3,178.4 91.3,184.9 140,184.9 140,212.2" className="mm-e" />
                      <polyline points="91.3,178.4 91.3,184.9 58.9,184.9 58.9,212.2" className="mm-e" />
                      <rect x="96.7" y="14" width="75.7" height="17.3" rx="3.2" style={s({ fill: 'var(--sm-client-accent)' })} className="mm-c" />
                      <rect x="183.3" y="14" width="75.7" height="17.3" rx="3.2" style={s({ fill: 'var(--sm-client-accent)' })} className="mm-c" />
                      <rect x="96.7" y="50.8" width="75.7" height="17.3" rx="3.2" style={s({ fill: 'var(--sm-gateway-accent)' })} className="mm-c" />
                      <rect x="96.7" y="87.5" width="75.7" height="17.3" rx="3.2" style={s({ fill: 'var(--sm-security-accent)' })} className="mm-c" />
                      <rect x="183.3" y="87.5" width="75.7" height="17.3" rx="3.2" style={s({ fill: 'var(--sm-service-accent)' })} className="mm-c" />
                      <rect x="140" y="124.3" width="75.7" height="17.3" rx="3.2" style={s({ fill: 'var(--sm-external-accent)' })} className="mm-c" />
                      <rect x="183.3" y="212.2" width="75.7" height="17.3" rx="3.2" style={s({ fill: 'var(--sm-cache-accent)' })} className="mm-c" />
                      <rect x="102.1" y="212.2" width="75.7" height="17.3" rx="3.2" style={s({ fill: 'var(--sm-database-accent)' })} className="mm-c" />
                      <rect x="53.5" y="124.3" width="75.7" height="17.3" rx="3.2" style={s({ fill: 'var(--sm-queue-accent)' })} className="mm-c" />
                      <rect x="53.5" y="161.1" width="75.7" height="17.3" rx="3.2" style={s({ fill: 'var(--sm-service-accent)' })} className="mm-c" />
                      <rect x="21" y="212.2" width="75.7" height="17.3" rx="3.2" style={s({ fill: 'var(--sm-storage-accent)' })} className="mm-c" />
                    </svg>
                  </div>
                  <span className="mono fb-n">diagram.html</span>
                  <span className="fb-s">One file. Opens offline, in any browser.</span>
                </div>
              </div>
            </div>
            <h2 className="of-h a-ofh">
              One file.
              <br />
              <span className="acc">Opens anywhere.</span>
            </h2>
            <ul className="of-list">
              <li className="a-ofl0">
                <svg
                  className="ic"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span>No server, no account, nothing to install to open it.</span>
              </li>
              <li className="a-ofl1">
                <svg
                  className="ic"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span>The same JSON always gives the same file, byte for byte.</span>
              </li>
              <li className="a-ofl2">
                <svg
                  className="ic"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span>The URL keeps the view, the selection, the route and playback.</span>
              </li>
              <li className="a-ofl3">
                <svg
                  className="ic"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span>Export PNG, JPEG, WebP or SVG, or a short video of the flow.</span>
              </li>
            </ul>
            <div className="of-more a-ofmore">
              <a className="pill-l" href="/examples">
                <span>See the examples</span>
                <svg
                  className="ic"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>
              <p>Sixteen diagrams, from release pipelines to maps a coding agent wrote from one request.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
