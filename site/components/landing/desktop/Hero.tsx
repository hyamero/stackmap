import { SITE } from '@/lib/site-data';
import { BoardCopy } from '../BoardCopy';
import { s } from '../style';
import { LINKS } from '@/components/site/links';

export function Hero() {
  return (
    <>
      <section
        className="scn"
        id="top"
        data-scene="top"
        data-runway="0.7"
        data-fw="1440"
        data-fh="900"
        data-theme-sec="dark"
        style={s({ height: '900px' })}
        aria-label="stackmap"
        data-theme="dark"
      >
        <div className="stage" data-stage="">
          <div className="frame" data-frame="" style={s({ width: '1440px', height: '900px' })}>
            <div className="hero-grid grid-bg" aria-hidden="true"></div>
            <div className="hero-chips a-hero-chips" aria-hidden="true" data-par="">
              <div className="par par0">
                <span className="chip dp0 dr-a" style={s({ left: '1012px', top: '124px', animationDelay: '0.0s, 120ms' })}>
                  .github/workflows/deploy.yml
                </span>
                <span className="chip dp0 dr-c" style={s({ left: '560px', top: '132px', animationDelay: '-1.7s, 165ms' })}>
                  <span className="ghost">
                    <span className="g-tile"></span>
                    <span className="g-lines">
                      <span></span>
                      <span></span>
                    </span>
                  </span>
                </span>
                <span className="chip dp0 dr-b" style={s({ left: '150px', top: '812px', animationDelay: '-3.4s, 210ms' })}>
                  infra/queue/order-events.tf
                </span>
                <span className="chip dp0 dr-c" style={s({ left: '1182px', top: '842px', animationDelay: '-5.1s, 255ms' })}>
                  packages/ui/Button.tsx
                </span>
                <span className="chip dp0 dr-b" style={s({ left: '846px', top: '626px', animationDelay: '-22.1s, 705ms' })}>
                  infra/cache/redis.tf
                </span>
              </div>
              <div className="par par1">
                <span className="chip dp1 dr-b" style={s({ left: '1226px', top: '186px', animationDelay: '-6.8s, 300ms' })}>
                  docker-compose.yml
                </span>
                <span className="chip dp1 dr-c" style={s({ left: '820px', top: '512px', animationDelay: '-8.5s, 345ms' })}>
                  services/api/src/server.ts
                </span>
                <span className="chip dp1 dr-a" style={s({ left: '540px', top: '780px', animationDelay: '-10.2s, 390ms' })}>
                  infra/edge/gateway.yaml
                </span>
                <span className="chip dp1 dr-b" style={s({ left: '1048px', top: '692px', animationDelay: '-11.9s, 435ms' })}>
                  <span className="ghost">
                    <span className="g-tile"></span>
                    <span className="g-lines">
                      <span></span>
                      <span></span>
                    </span>
                  </span>
                </span>
                <span className="chip dp1 dr-a" style={s({ left: '760px', top: '836px', animationDelay: '-20.4s, 660ms' })}>
                  services/api/src/payments/stripe.ts
                </span>
              </div>
              <div className="par par2">
                <span className="chip dp2 dr-b" style={s({ left: '250px', top: '150px', animationDelay: '-13.6s, 480ms' })}>
                  apps/storefront/app/checkout/page.tsx
                </span>
                <span className="chip dp2 dr-a" style={s({ left: '1090px', top: '584px', animationDelay: '-15.3s, 525ms' })}>
                  infra/orders/postgres.tf
                </span>
                <span className="chip dp2 dr-c" style={s({ left: '846px', top: '742px', animationDelay: '-17.0s, 570ms' })}>
                  workers/orders/consume.ts
                </span>
                <span className="chip dp2 dr-b" style={s({ left: '1140px', top: '432px', animationDelay: '-18.7s, 615ms' })}>
                  packages/auth/session.ts
                </span>
              </div>
            </div>
            <svg className="h-route" width="1440" height="900" viewBox="0 0 1440 900" aria-hidden="true">
              <defs>
                <linearGradient id="hr-fade" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="150">
                  <stop offset="0" style={s({ stopColor: 'var(--sm-text)', stopOpacity: '0' })} />
                  <stop offset="1" style={s({ stopColor: 'var(--sm-text)', stopOpacity: '1' })} />
                </linearGradient>
              </defs>
              <path className="rt rt-in" d="M 56 0 V 402 Q 56 418 72 418 H 79" pathLength="1" />
              <path className="rt h-bridge a-hbridge" d="M 79 418 H 713" pathLength="1" />
              <g className="a-hmarks">
                <path className="ah" d="M79 415 L86 418 L79 421 Z" />
              </g>
              <path
                className="rt"
                data-route="top"
                data-r0="0.05"
                data-r1="0.96"
                data-head="h-top"
                d="M 713 418 H 1368 Q 1384 418 1384 434 V 900"
                pathLength="1"
              />
              <path className="rt" data-route="top" data-r0="0.96" data-r1="1" d="M 1384 900 V 2100" pathLength="1" />
              <g className="a-hmarks">
                <circle className="hd2" cx="709" cy="418" r="3.5" />
              </g>
              <g className="rhead" data-route-head="h-top">
                <circle r="9" className="rh-halo" />
                <circle r="3.25" className="rh-core" />
              </g>
            </svg>
            <i className="comet" aria-hidden="true"></i>
            <div className="h-content a-hero-out">
              <h1 className="hero-h">
                <span className="hl">
                  <span className="hw" style={s({ '--x': '-170px', '--y': '-130px', '--z': '620px', '--bl': '7px', animationDelay: '180ms' })}>
                    Every
                  </span>{' '}
                  <span className="hw" style={s({ '--x': '230px', '--y': '150px', '--z': '360px', '--bl': '4px', animationDelay: '270ms' })}>
                    layer
                  </span>{' '}
                  <span className="hw" style={s({ '--x': '-60px', '--y': '230px', '--z': '700px', '--bl': '8px', animationDelay: '360ms' })}>
                    of
                  </span>{' '}
                  <span className="hw" style={s({ '--x': '310px', '--y': '-170px', '--z': '480px', '--bl': '5px', animationDelay: '450ms' })}>
                    your
                  </span>{' '}
                  <span className="hw" style={s({ '--x': '-250px', '--y': '70px', '--z': '300px', '--bl': '3px', animationDelay: '540ms' })}>
                    stack,
                  </span>
                </span>
                <span className="hl">
                  <span className="hacc">
                    <i className="hglow" aria-hidden="true"></i>
                    <span className="hw" style={s({ '--x': '190px', '--y': '-90px', '--z': '560px', '--bl': '6px', animationDelay: '630ms' })}>
                      on
                    </span>{' '}
                    <span className="hw" style={s({ '--x': '-150px', '--y': '180px', '--z': '420px', '--bl': '4px', animationDelay: '720ms' })}>
                      one
                    </span>{' '}
                    <span className="hw" style={s({ '--x': '270px', '--y': '50px', '--z': '660px', '--bl': '7px', animationDelay: '810ms' })}>
                      map.
                    </span>
                  </span>
                </span>
              </h1>
              <p className="h-lede t-lede">Interactive system diagrams your coding agent writes, as one offline HTML file.</p>
              <div className="h-cta">
                <div className="cmd pnl">
                  <span className="mono cmd-p" aria-hidden="true">
                    $
                  </span>
                  <code className="mono cmd-t">{SITE.install.skill}</code>
                  <BoardCopy text={SITE.install.skill} label="Copy the install command" />
                </div>
                <a className="lnk" href={LINKS.film.href} target="_blank" rel="noreferrer">
                  <svg className="ic" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
                  </svg>
                  <span>{LINKS.film.label}</span>
                </a>
                <a className="lnk" href="https://github.com/hyamero/stackmap" target="_blank" rel="noreferrer">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                  <span>GitHub</span>
                </a>
              </div>
              <p className="h-works">Works with Claude Code, Cursor, Codex and other coding agents.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
