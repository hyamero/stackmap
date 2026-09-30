import { SITE } from '@/lib/site-data';
import { s } from '../style';

export function Unmapped() {
  return (
    <>
      <section
        className="scn"
        id="unmapped"
        data-scene="unmapped"
        data-runway="3.2"
        data-fw="1440"
        data-fh="900"
        data-theme-sec="dark"
        style={s({ height: '900px' })}
        aria-label="Every codebase has a shape"
        data-theme="dark"
      >
        <div className="stage" data-stage="">
          <div className="frame" data-frame="" style={s({ width: '1440px', height: '900px' })}>
            <div className="s2-grid grid-bg a-s2grid" aria-hidden="true"></div>
            <div className="vx a-vx" aria-hidden="true">
              <div className="vring" style={s({ animation: 'spin 34s linear infinite', filter: 'blur(2.6px)', opacity: '0.36' })}>
                <span className="vchip" data-label=".github/workflows/deploy.yml" style={s({ transform: 'rotate(0deg) translateX(700px) rotate(90deg) translate(-50%, -50%)', fontSize: '16px' })} />
                <span className="vchip vghost" style={s({ transform: 'rotate(45deg) translateX(700px) rotate(90deg) translate(-50%, -50%)' })}>
                  <span className="ghost">
                    <span className="g-tile"></span>
                    <span className="g-lines">
                      <span></span>
                      <span></span>
                    </span>
                  </span>
                </span>
                <span className="vchip" data-label="packages/ui/Button.tsx" style={s({ transform: 'rotate(90deg) translateX(700px) rotate(90deg) translate(-50%, -50%)', fontSize: '16px' })} />
                <span className="vchip vghost" style={s({ transform: 'rotate(135deg) translateX(700px) rotate(90deg) translate(-50%, -50%)' })}>
                  <span className="ghost">
                    <span className="g-tile"></span>
                    <span className="g-lines">
                      <span></span>
                      <span></span>
                    </span>
                  </span>
                </span>
                <span className="vchip" data-label="infra/queue/order-events.tf" style={s({ transform: 'rotate(180deg) translateX(700px) rotate(90deg) translate(-50%, -50%)', fontSize: '16px' })} />
                <span className="vchip vghost" style={s({ transform: 'rotate(225deg) translateX(700px) rotate(90deg) translate(-50%, -50%)' })}>
                  <span className="ghost">
                    <span className="g-tile"></span>
                    <span className="g-lines">
                      <span></span>
                      <span></span>
                    </span>
                  </span>
                </span>
                <span className="vchip" data-label="apps/storefront/next.config.js" style={s({ transform: 'rotate(270deg) translateX(700px) rotate(90deg) translate(-50%, -50%)', fontSize: '16px' })} />
                <span className="vchip vghost" style={s({ transform: 'rotate(315deg) translateX(700px) rotate(90deg) translate(-50%, -50%)' })}>
                  <span className="ghost">
                    <span className="g-tile"></span>
                    <span className="g-lines">
                      <span></span>
                      <span></span>
                    </span>
                  </span>
                </span>
              </div>
              <div className="vring" style={s({ animation: 'spin 24s linear infinite reverse', filter: 'blur(1.2px)', opacity: '0.62' })}>
                <span className="vchip" data-label="apps/storefront/app/checkout/page.tsx" style={s({ transform: 'rotate(30deg) translateX(480px) rotate(90deg) translate(-50%, -50%)', fontSize: '18px' })} />
                <span className="vchip" data-label="services/api/src/routes/orders.ts" style={s({ transform: 'rotate(90deg) translateX(480px) rotate(90deg) translate(-50%, -50%)', fontSize: '18px' })} />
                <span className="vchip" data-label="infra/cache/redis.tf" style={s({ transform: 'rotate(150deg) translateX(480px) rotate(90deg) translate(-50%, -50%)', fontSize: '18px' })} />
                <span className="vchip" data-label="services/api/src/payments/stripe.ts" style={s({ transform: 'rotate(210deg) translateX(480px) rotate(90deg) translate(-50%, -50%)', fontSize: '18px' })} />
                <span className="vchip" data-label="infra/storage/receipts.tf" style={s({ transform: 'rotate(270deg) translateX(480px) rotate(90deg) translate(-50%, -50%)', fontSize: '18px' })} />
                <span className="vchip" data-label="docker-compose.yml" style={s({ transform: 'rotate(330deg) translateX(480px) rotate(90deg) translate(-50%, -50%)', fontSize: '18px' })} />
              </div>
              <div className="vring" style={s({ animation: 'spin 16s linear infinite', filter: 'blur(0px)', opacity: '1' })}>
                <span className="vchip" data-label="server.ts" style={s({ transform: 'rotate(60deg) translateX(290px) rotate(90deg) translate(-50%, -50%)', fontSize: '22px' })} />
                <span className="vchip" data-label="postgres.tf" style={s({ transform: 'rotate(132deg) translateX(290px) rotate(90deg) translate(-50%, -50%)', fontSize: '22px' })} />
                <span className="vchip" data-label="App.tsx" style={s({ transform: 'rotate(204deg) translateX(290px) rotate(90deg) translate(-50%, -50%)', fontSize: '22px' })} />
                <span className="vchip" data-label="session.ts" style={s({ transform: 'rotate(276deg) translateX(290px) rotate(90deg) translate(-50%, -50%)', fontSize: '22px' })} />
                <span className="vchip" data-label="consume.ts" style={s({ transform: 'rotate(348deg) translateX(290px) rotate(90deg) translate(-50%, -50%)', fontSize: '22px' })} />
              </div>
            </div>
            <div className="kline-wrap a-kw">
              <h2 className="sr">Every codebase has a shape. Nobody has drawn it.</h2>
              <div aria-hidden="true">
                <p className="kl kl-k1 a-k1c" style={s({ top: '330px' })}>
                  <span className="ml kw">
                    <span className="a-k1w0">Every</span>
                  </span>{' '}
                  <span className="ml kw">
                    <span className="a-k1w1">codebase</span>
                  </span>{' '}
                  <span className="ml kw">
                    <span className="a-k1w2">has</span>
                  </span>{' '}
                  <span className="ml kw">
                    <span className="a-k1w3">a</span>
                  </span>{' '}
                  <span className="ml kw">
                    <span className="a-k1w4">shape.</span>
                  </span>
                </p>
                <p className="kl kl-k2" style={s({ top: '446px' })}>
                  <span className="ml kw">
                    <span className="a-k2w0">Nobody</span>
                  </span>{' '}
                  <span className="ml kw">
                    <span className="a-k2w1">has</span>
                  </span>{' '}
                  <span className="ml kw">
                    <span className="a-k2w2">drawn</span>
                  </span>{' '}
                  <span className="ml kw">
                    <span className="a-k2w3">it.</span>
                  </span>
                </p>
              </div>
            </div>
            <i className="cdot a-cdot" aria-hidden="true"></i>
            <i className="shock a-shock" aria-hidden="true"></i>
            <svg
              className="mk a-mk"
              width="384"
              height="384"
              viewBox="0 0 48 48"
              role="img"
              aria-label="The stackmap mark: a route from a grey source card to an indigo target card"
            >
              <circle className="bx a-mkdot" cx="12" cy="12" r="1.75" fill="#ededec" fillOpacity=".3" />
              <circle className="bx a-mkdot" cx="24" cy="12" r="1.75" fill="#ededec" fillOpacity=".3" />
              <circle className="bx a-mkdot" cx="24" cy="36" r="1.75" fill="#ededec" fillOpacity=".3" />
              <circle className="bx a-mkdot" cx="36" cy="36" r="1.75" fill="#ededec" fillOpacity=".3" />
              <path
                className="mk-route"
                data-mark-route=""
                d="M12 28.5v-1.5q0-3 3-3h18q3 0 3-3v-1.5"
                pathLength="100"
                fill="none"
                stroke="#ededec"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              <rect className="bx a-mksrc" x="3" y="30" width="18" height="12" rx="3.5" fill="#6e6e6b" />
              <rect className="bx a-mktgt" x="27" y="6" width="18" height="12" rx="3.5" fill="#8fa6f2" />
            </svg>
            <p className="s2cap t-lede a-s2cap1" style={s({ top: '690px' })}>
              stackmap turns what your coding agent knows about a system into a diagram you can explore.
            </p>
            <svg className="s2-edge" width="1440" height="900" viewBox="0 0 1440 900" aria-hidden="true">
              <g className="a-s2e">
                <path className="ln a-s2eln" d="M 676 450 H 764" pathLength="1" strokeDasharray="1 1" />
                <path className="ah a-s2eah" d="M749 447 L756 450 L749 453 Z" />
                <path className="lead a-s2lead" d="M 904 490 V 548" pathLength="1" strokeDasharray="1 1" />
              </g>
            </svg>
            <div className="cw mcard t-service a-mapi-box" style={s({ left: '396px', top: '418px', width: '280px', height: '64px' })}>
              <span className="nc">
                <span className="mc-in a-mapi-in">
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
                <span className="mc-ov a-mapi-ov" style={s({ background: '#6e6e6b' })}></span>
              </span>
            </div>
            <div className="cw mcard t-database a-mdb-box" style={s({ left: '764px', top: '418px', width: '280px', height: '64px' })}>
              <span className="nc">
                <span className="mc-in a-mdb-in">
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
                <span className="mc-ov a-mdb-ov" style={s({ background: '#8fa6f2' })}></span>
              </span>
            </div>
            <i className="selring a-s2sel" aria-hidden="true"></i>
            <div className="s2ev pnl a-s2ev">
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
                <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
                <path d="M14 2v5a1 1 0 0 0 1 1h5" />
                <path d="M10 12.5 8 15l2 2.5" />
                <path d="m14 12.5 2 2.5-2 2.5" />
              </svg>
              <code className="mono">infra/orders/postgres.tf:12</code>
            </div>
            <p className="s2cap t-lede a-s2cap2" style={s({ top: '690px' })}>
              Every node can point back to the file and line it came from.
            </p>
            <svg className="s2-route" width="1440" height="900" viewBox="0 0 1440 900" aria-hidden="true">
              <path d="M 1384 -1200 V 0" />
              <path data-route="unmapped" data-r0="0" data-r1="0.97" data-head="h-unmapped" d="M 1384 0 V 900" pathLength="1" />
              <path data-route="unmapped" data-r0="0.97" data-r1="1" d="M 1384 900 V 2100" pathLength="1" />
              <g className="rhead" data-route-head="h-unmapped">
                <circle r="9" className="rh-halo" />
                <circle r="3.25" className="rh-core" />
              </g>
            </svg>
          </div>
        </div>
      </section>
    </>
  );
}
