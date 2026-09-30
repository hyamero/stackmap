import { SITE } from '@/lib/site-data';
import { BoardCopy } from '../BoardCopy';

export function Install() {
  return (
    <>
      <section className="inst" data-anchor="install" data-theme-sec="dark" data-sec="install" aria-labelledby="inst-h-m" data-theme="dark">
        <i className="ir-a" aria-hidden="true"></i>
        <i className="ir-b" aria-hidden="true"></i>
        <i className="ir-d" aria-hidden="true"></i>
        <div className="inst-in">
          <div className="target" data-rv="">
            <img src="/brand/stackmap-lockup-dark.svg" alt="stackmap" width="183" height="40" />
            <h2 id="inst-h-m">
              Every layer of your stack, <span className="acc">on one map.</span>
            </h2>
            <p className="lede">Interactive system diagrams your coding agent writes, as one offline HTML file.</p>
            <div className="ist">
              <div>
                <h3>
                  <span className="ist-n mono">1</span>Install the skill
                </h3>
                <div className="cmd pnl">
                  <span className="mono cmd-p" aria-hidden="true">
                    $
                  </span>
                  <code className="mono cmd-t">{SITE.install.skill}</code>
                  <BoardCopy text={SITE.install.skill} label="Copy the install command" />
                </div>
              </div>
              <div>
                <h3>
                  <span className="ist-n mono">2</span>Then ask
                </h3>
                <p className="ask">Make an architecture diagram of this repository, backed by evidence from the code.</p>
              </div>
            </div>
            <div className="ist-alt">
              <p>Or run the CLI on its own, with Node 22.12 or later:</p>
              <div className="cmd pnl">
                <span className="mono cmd-p" aria-hidden="true">
                  $
                </span>
                <code className="mono cmd-t">{SITE.install.cli}</code>
                <BoardCopy text={SITE.install.cli} label="Copy the CLI command" />
              </div>
            </div>
            <div className="ilinks">
              <a className="lnk" href="https://github.com/hyamero/stackmap" target="_blank" rel="noreferrer">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                <span>GitHub</span>
              </a>
              <a className="lnk" href="https://www.npmjs.com/package/@hyamero/stackmap" target="_blank" rel="noreferrer">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z" />
                </svg>
                <span>npm</span>
              </a>
              <a className="lnk" href="/docs">
                <svg
                  className="ic"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 5v16" />
                  <path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z" />
                </svg>
                <span>Docs</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
