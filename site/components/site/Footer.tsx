import Link from 'next/link';
import { SITE } from '@/lib/site-data';
import { LINKS, type SiteLink } from './links';
import { Lockup } from './Lockup';

const COLUMNS: { title: string; links: SiteLink[] }[] = [
  { title: 'Product', links: [LINKS.viewer, LINKS.kinds, LINKS.examples, LINKS.docs] },
  { title: 'Reference', links: [LINKS.quickStart, LINKS.schema, LINKS.cli, LINKS.authoring] },
  { title: 'Project', links: [LINKS.github, LINKS.npm, LINKS.contributing, LINKS.security] },
];

const linkClass = 'text-sm text-fg-muted transition-colors duration-150 hover:text-fg';

function Item({ link }: { link: SiteLink }) {
  if (link.href.startsWith('/')) return <Link href={link.href} className={linkClass}>{link.label}</Link>;
  return <a href={link.href} target="_blank" rel="noreferrer" className={linkClass}>{link.label}</a>;
}

/** Always dark, on every page (the canvas's "lights off" ending). */
export function Footer() {
  return (
    <footer data-theme="dark" className="bg-page text-fg">
      <div className="mx-auto max-w-[1440px] px-6 pt-[72px] pb-8 md:px-24">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between md:gap-16">
          <div className="flex flex-col gap-4">
            <Lockup height={40} />
            <p className="m-0 text-[15px] text-fg-muted">Every layer of your stack, on one map.</p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-3 md:gap-16">
            {COLUMNS.map((c) => (
              <div key={c.title}>
                <h2 className="m-0 mb-3.5 text-[13px] font-semibold text-fg">{c.title}</h2>
                <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                  {c.links.map((l) => (
                    <li key={l.href}>
                      <Item link={l} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <img className="mt-16 mb-7 block h-auto w-full md:mb-8" src="/brand/stackmap-wordmark-dark.svg" alt="" width={163} height={35} />
        <div className="flex flex-col gap-2 pt-5 text-[13px] text-fg-muted shadow-[inset_0_1px_0_var(--sm-divider)] md:flex-row md:justify-between md:gap-6">
          <p className="m-0">
            A successor to{' '}
            <a href={LINKS.archify.href} target="_blank" rel="noreferrer" className="text-fg no-underline">
              archify
            </a>{' '}
            by tt-a1i. Layout by Eclipse ELK, type in Geist, logos from Simple Icons.
          </p>
          <p className="m-0 font-mono tabular-nums">MIT · {SITE.version}</p>
        </div>
      </div>
    </footer>
  );
}
