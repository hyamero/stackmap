import type { Metadata } from 'next';
import Link from 'next/link';
import { NodeCard } from '@stackmap/viewer/src/card/NodeCard';

// Next marks the 404 response noindex itself.
export const metadata: Metadata = { title: 'Page not found' };

const WAYS = [
  { href: '/', eyebrow: 'Start over', label: 'Home' },
  { href: '/examples', eyebrow: 'Browse', label: 'Examples' },
  { href: '/docs', eyebrow: 'Read', label: 'Quick start' },
];

// A request card whose route runs out at an empty, dashed slot: the page this address would have been.
function Dangling() {
  return (
    <div aria-hidden="true" className="relative h-[140px] overflow-hidden rounded-2xl bg-stage sm:h-[190px] lg:h-[232px] shadow-[inset_0_0_0_1px_var(--sm-panel-border)]">
      <div className="absolute top-1/2 left-1/2 h-[120px] w-[520px] -translate-1/2 scale-[0.62] sm:scale-[0.8] lg:scale-100">
        <div className="absolute top-7 left-0">
          <NodeCard node={{ id: 'you', type: 'client', card: { title: 'Your request', subtitle: 'GET this address' } }} />
        </div>
        <svg width="520" height="120" viewBox="0 0 520 120" className="absolute inset-0 overflow-visible">
          <path className="motion-safe:animate-[dash-flow_1.2s_linear_infinite]" d="M 280 60 H 392" fill="none" stroke="var(--sm-edge)" strokeWidth="1.25" strokeDasharray="5 4" />
          <path d="M383 56 L390 60 L383 64" fill="none" stroke="var(--sm-edge)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="absolute top-7 left-[400px] grid h-16 w-[120px] place-items-center rounded-2xl border border-dashed border-[var(--sm-group-border)] font-mono text-[15px] text-fg-muted">
          404
        </div>
      </div>
    </div>
  );
}

export default function NotFound() {
  return (
    <main data-theme="light" className="bg-page text-fg">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 pt-28 pb-28 md:px-10 lg:grid-cols-[minmax(0,1fr)_560px] lg:items-end lg:pt-[120px] xl:px-24">
        <div>
          <p className="font-mono text-sm text-fg-muted">404</p>
          <h1 className="mt-3 text-mega">Off the map.</h1>
          <p className="mt-6 max-w-[620px] text-lede text-fg-muted">Nothing lives at this address. The link may be old, or mistyped.</p>
        </div>
        <Dangling />
        <nav aria-label="Ways back" className="grid gap-3 sm:grid-cols-3 lg:col-span-2">
          {WAYS.map((w) => (
            <Link
              key={w.href}
              href={w.href}
              className="flex items-center justify-between rounded-2xl bg-panel px-6 py-[22px] text-fg no-underline shadow-[inset_0_0_0_1px_var(--sm-panel-border)] transition-[box-shadow,scale] duration-150 ease-out hover:shadow-[inset_0_0_0_1.5px_var(--sm-text)] active:scale-[0.98]"
            >
              <span>
                <small className="block text-[13px] text-fg-muted">{w.eyebrow}</small>
                <b className="mt-0.5 block text-[19px] font-semibold tracking-[-0.015em]">{w.label}</b>
              </span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
