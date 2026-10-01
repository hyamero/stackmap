import Link from 'next/link';
import { SITE } from '@/lib/site-data';
import { LINKS, type SiteLink } from './links';
import { Lockup } from './Lockup';

const COLUMNS: { title: string; links: SiteLink[] }[] = [
  { title: 'Product', links: [LINKS.how, LINKS.kinds, LINKS.examples, LINKS.docs] },
  { title: 'Docs', links: [LINKS.quickStart, LINKS.viewer, LINKS.cli, LINKS.schema, LINKS.authoring] },
  { title: 'Project', links: [LINKS.github, LINKS.npm, LINKS.film, LINKS.contributing, LINKS.security] },
];

function Item({ link }: { link: SiteLink }) {
  if (link.href.startsWith('/')) return <Link href={link.href}>{link.label}</Link>;
  return (
    <a href={link.href} target="_blank" rel="noreferrer">
      {link.label}
    </a>
  );
}

/** The docs' footer: one row, under pages that already carry their own navigation. */
export function DocsFooter() {
  const ext = [LINKS.github, LINKS.npm, LINKS.film, LINKS.contributing];
  return (
    <footer className="foot dfoot">
      <div className="foot-in df-in">
        <Link className="df-id" href="/" aria-label="stackmap home">
          <Lockup height={24} />
        </Link>
        <nav className="df-l" aria-label="More">
          <Link href={LINKS.examples.href}>{LINKS.examples.label}</Link>
          {ext.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
              {l.label}
            </a>
          ))}
        </nav>
        <p className="df-c">
          A successor to{' '}
          <a href={LINKS.archify.href} target="_blank" rel="noreferrer">
            archify
          </a>{' '}
          by tt-a1i.
        </p>
        <p className="df-v mono tnum">MIT · {SITE.version}</p>
      </div>
    </footer>
  );
}

export function Footer() {
  return (
    <footer className="foot">
      <div className="foot-in">
        <div className="f-top">
          <div className="f-id">
            <Lockup height={40} />
            <p>Every layer of your stack, on one map.</p>
          </div>
          <div className="f-cols">
            {COLUMNS.map((c) => (
              <div key={c.title} className="f-col">
                <h2>{c.title}</h2>
                <ul>
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
        <div className="f-base">
          <p>
            A successor to{' '}
            <a href={LINKS.archify.href} target="_blank" rel="noreferrer">
              archify
            </a>{' '}
            by tt-a1i. Layout by Eclipse ELK, type in Geist, logos from Simple Icons.
          </p>
          <p className="mono tnum">MIT · {SITE.version}</p>
        </div>
      </div>
    </footer>
  );
}
