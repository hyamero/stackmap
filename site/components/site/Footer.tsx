import Link from 'next/link';
import { SITE } from '@/lib/site-data';
import { LINKS, type SiteLink } from './links';
import { Lockup } from './Lockup';

const COLUMNS: { title: string; links: SiteLink[] }[] = [
  { title: 'Product', links: [LINKS.how, LINKS.kinds, LINKS.examples, LINKS.docs] },
  { title: 'Reference', links: [LINKS.quickStart, LINKS.schema, LINKS.cli, LINKS.authoring] },
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
